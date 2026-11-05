const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Server } = require('socket.io');
const { authorizeClassroom } = require('./classroomAccess');
const { roomUser, roomQuestionSet, newResumeToken, matchesResumeToken, roomSnapshot } = require('./roomSession');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

// Lưu file debug log vào thư mục tạm hệ điều hành để tránh nodemon tự động restart
const debugLogPath = path.join(os.tmpdir(), 'apec_socket_debug.log');
function logSocket(...args) {
    const time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const line = `[${time}] ${args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}\n`;
    console.log(...args);
    try {
        fs.appendFileSync(debugLogPath, line);
    } catch (_) {}
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


const setRoute = require('./routes/questionSets');
const authRoute = require('./routes/auth');
const questionRoute = require('./routes/questions');
const settingsRoute = require('./routes/settings');
const scoreRoute = require('./routes/scores');
const userRoute = require('./routes/users');
const classRoute = require('./routes/classes');
const schoolRequestRoute = require('./routes/schoolRequests');
const schoolRoute = require('./routes/schools');
const adminRoute = require('./routes/admin');

app.use('/api/sets', setRoute);
app.use('/api/auth', authRoute);
app.use('/api/questions', questionRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/scores', scoreRoute);
app.use('/api/users', userRoute);
app.use('/api/classes', classRoute);
app.use('/api/school-requests', schoolRequestRoute);
app.use('/api/schools', schoolRoute);
app.use('/api/admin', adminRoute);

// 4. Kết nối Database MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Đã kết nối MongoDB thành công!');
        console.log("🏠 Địa chỉ máy chủ DB:", mongoose.connection.host);
        console.log("📂 Tên Database đang dùng:", mongoose.connection.name);
        try {
            const { seedDefaultAndWeeklySets } = require('./seedData');
            await seedDefaultAndWeeklySets();
        } catch (seedErr) {
            console.error('Lỗi khởi tạo seedData:', seedErr);
        }
    })
    .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

app.get('/', (req, res) => {
    res.send('Server EduGame đang chạy ngon lành!');
});

const server = http.createServer(app);

// 3. KHỞI TẠO SOCKET.IO GẮN VÀO SERVER HTTP
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const lobbies = {};

// Room members can load the selected questions, including a private classroom set.
// The reconnect key proves membership without exposing another teacher's set.
app.get('/api/rooms/:pin/questions', async (req, res) => {
    const lobby = lobbies[req.params.pin];
    const key = req.headers['x-room-token'];
    const allowed = lobby && (matchesResumeToken(lobby.hostResumeToken, key) ||
        Object.values(lobby.playerResumeTokens || {}).some(token => matchesResumeToken(token, key)));
    if (!allowed) return res.status(403).json({ message: 'Bạn không có phiên chơi trong phòng này!' });
    try {
        const set = await require('./models/QuestionSet').findById(lobby.setId);
        if (!set) return res.status(404).json({ message: 'Bộ câu hỏi không còn tồn tại!' });
        const questions = await require('./models/Question').find({ _id: { $in: set.questions } });
        res.json({ questions });
    } catch (_) {
        res.status(500).json({ message: 'Không thể tải câu hỏi của phòng!' });
    }
});

// Cơ chế lưu trữ và phục hồi phòng chơi (Persistence)
// Đảm bảo dù server có bị nodemon khởi động lại do thay đổi code thì các phòng của Host và Học sinh KHÔNG bị mất
const lobbiesPersistPath = path.join(os.tmpdir(), 'apec_edugame_lobbies.json');

function saveLobbiesToDisk() {
    try {
        const dataToSave = {};
        for (const [pin, lobby] of Object.entries(lobbies)) {
            const { disconnectTimeout, ...cleanLobby } = lobby;
            dataToSave[pin] = {
                ...cleanLobby,
                players: (cleanLobby.players || []).map(p => {
                    const { disconnectTimeout: dt, ...cleanPlayer } = p;
                    return cleanPlayer;
                })
            };
        }
        fs.writeFileSync(lobbiesPersistPath, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (_) {}
}

function loadLobbiesFromDisk() {
    try {
        if (fs.existsSync(lobbiesPersistPath)) {
            const raw = fs.readFileSync(lobbiesPersistPath, 'utf8');
            const data = JSON.parse(raw);
            const now = Date.now();
            let count = 0;
            for (const [pin, lobby] of Object.entries(data)) {
                const createdAt = lobby.createdAt || now;
                // Giữ lại các phòng tạo trong 3 tiếng và chưa bị hủy
                if (now - createdAt < 3 * 60 * 60 * 1000) {
                    lobbies[pin] = {
                        ...lobby,
                        disconnectTimeout: null,
                        hostConnected: false,
                        players: (lobby.players || []).map(p => ({
                            ...p,
                            disconnectTimeout: null
                        }))
                    };
                    count++;
                }
            }
            if (count > 0) {
                console.log(`💾 [Khôi Phục Phòng] Đã khôi phục thành công ${count} phòng còn hiệu lực: [${Object.keys(lobbies).join(', ')}]`);
            }
        }
    } catch (e) {
        console.error('Lỗi khi nạp lobbies từ đĩa:', e.message);
    }
}

function scheduleHostExpiry(pin, lobby) {
    if (lobby.disconnectTimeout) clearTimeout(lobby.disconnectTimeout);
    const remaining = Math.max(0, 90000 - (Date.now() - (lobby.hostDisconnectedAt || Date.now())));
    lobby.disconnectTimeout = setTimeout(() => {
        if (lobbies[pin] === lobby && !lobby.hostConnected) {
            io.to(pin).emit('room_destroyed', 'Chủ phòng đã mất kết nối quá lâu, phòng đã được giải tán!');
            io.in(pin).socketsLeave(pin);
            delete lobbies[pin];
            saveLobbiesToDisk();
        }
    }, remaining);
}

// Nạp các phòng đang có từ bộ nhớ đệm
loadLobbiesFromDisk();
for (const [pin, lobby] of Object.entries(lobbies)) {
    lobby.hostDisconnectedAt ||= Date.now();
    scheduleHostExpiry(pin, lobby);
}

io.on('connection', (socket) => {
    logSocket(`🟢 Một thiết bị vừa kết nối: ${socket.id} (Transport: ${socket.conn ? socket.conn.transport.name : 'unknown'})`);

    socket.on('create_lobby', async (data) => {
        try {
            logSocket(`📥 [create_lobby] từ socket ${socket.id}`, { roomType: data?.roomType, classId: data?.classId });
            const roomType = (data && data.roomType) ? data.roomType : 'casual';
            const tag = (data && data.tag) ? data.tag : (roomType === 'classroom' ? 'Lớp học' : 'Chơi tự do');
            const rawClassInput = (data && data.classId) ? String(data.classId).trim().toLowerCase() : null;
            const setId = (data && data.setId) ? data.setId : null;
            const hostName = (data && data.hostName) ? data.hostName : 'Host';
            const teacherParticipates = roomType !== 'classroom' || Boolean(data && data.teacherParticipates);

            let finalClassId = null;
            let finalClassCode = null;
            let finalClassName = null;
            let roomName = (data && data.roomName) ? data.roomName : (roomType === 'classroom' ? 'Phòng Lớp Học' : 'Phòng Đấu');

            let hostUserId = null;
            let creator = null;
            let managedClass = null;
            if (roomType === 'classroom') {
                try {
                    const { user, classDoc } = await authorizeClassroom(data?.token, rawClassInput);
                    creator = user;
                    managedClass = classDoc;
                    hostUserId = String(user._id);
                    finalClassId = String(classDoc._id);
                    finalClassCode = classDoc.classCode;
                    finalClassName = classDoc.className;
                    roomName = 'Lớp ' + classDoc.className + ' (' + classDoc.classCode + ')';
                } catch (err) {
                    socket.emit('error', err.status ? err.message : 'Không thể xác thực dữ liệu lớp học!');
                    return;
                }
            }

            if (roomType !== 'classroom') {
                creator = await roomUser(data?.token);
                hostUserId = creator ? String(creator._id) : null;
            }
            const selectedSet = await roomQuestionSet(setId, creator, managedClass);
            const hostRole = creator?.role || 'guest';
            const hostResumeToken = newResumeToken();

            // Dọn dẹp sạch mọi phòng cũ do chính Host (socket.id / hostName) này từng tạo hoặc phòng cũ của cùng lớp học
            for (const [oldPin, lobby] of Object.entries(lobbies)) {
                const isSameHost = (lobby.hostId === socket.id) ||
                    (hostUserId && lobby.hostUserId === hostUserId);
                const isSameClass = (finalClassId && lobby.classId && String(lobby.classId) === String(finalClassId));

                if (isSameHost || isSameClass) {
                    logSocket(`🧹 Dọn dẹp phòng cũ [${oldPin}] (Host: ${lobby.hostName}, Class: ${lobby.className}) trước khi tạo phòng mới`);
                    // 1. Cho chính socket của Host rời room oldPin trước
                    socket.leave(oldPin);
                    // 2. Chỉ gửi thông báo room_destroyed cho CÁC NGƯỜI CHƠI KHÁC trong phòng cũ (socket.to thay vì io.to để không gửi cho chính Host)
                    socket.to(oldPin).emit('room_destroyed', "Phòng cũ đã giải tán do host tạo phòng mới!");
                    // 3. Giải tán toàn bộ các socket học sinh còn lại khỏi room oldPin
                    io.in(oldPin).socketsLeave(oldPin);
                    delete lobbies[oldPin];
                }
            }

            let pin = Math.floor(100000 + Math.random() * 900000).toString();

            while (lobbies[pin]) {
                pin = Math.floor(100000 + Math.random() * 900000).toString();
            }

            lobbies[pin] = {
                hostId: socket.id,
                hostUserId: hostUserId,
                hostResumeToken,
                playerResumeTokens: {},
                hostConnected: true,
                disconnectTimeout: null,
                players: [],
                gameState: 'WAITING',
                roomType: roomType,
                tag: tag,
                classId: finalClassId,
                classCode: finalClassCode,
                className: finalClassName,
                setId: setId,
                setTitle: selectedSet.title,
                roomName: roomName,
                hostName: hostName,
                teacherParticipates: teacherParticipates,
                gameSessionRecorded: false,
                createdAt: Date.now()
            };

            // Luôn đưa Host (Giáo viên) vào phòng ngay từ đầu: Mặc định phòng luôn có sẵn 1 người
            lobbies[pin].players.push({
                socketId: socket.id,
                playerId: 'host_' + socket.id.substring(0, 6),
                name: hostName,
                username: hostName,
                isHost: true,
                role: hostRole,
                connected: true,
                isParticipating: teacherParticipates,
                score: 0,
                timePlayed: 0,
                questionsAnswered: 0
            });

            saveLobbiesToDisk();
            socket.join(pin);
            logSocket(`👑 Host [${socket.id}] vừa tạo phòng [${tag} - ${roomName}]. PIN: ${pin} | Chơi cùng: ${teacherParticipates}`);

            socket.emit('lobby_created', {
                ...roomSnapshot(pin, lobbies[pin]),
                resumeToken: hostResumeToken,
                playerId: lobbies[pin].players[0].playerId,
                pin: pin,
                roomType: roomType,
                tag: tag,
                classId: finalClassId,
                classCode: finalClassCode,
                className: finalClassName,
                setId: setId,
                roomName: roomName,
                teacherParticipates: teacherParticipates
            });

            io.to(pin).emit('players_update', roomSnapshot(pin, lobbies[pin]).players);
        } catch (error) {
            logSocket("❌ Lỗi khi tạo phòng create_lobby:", error);
            socket.emit('error', "Lỗi máy chủ khi tạo phòng: " + (error.message || 'Lỗi không xác định'));
        }
    });

    socket.on('join_lobby', async (data) => {
        try {
            console.log('\n================== 📥 [YÊU CẦU VÀO PHÒNG] ==================');
            console.log(`📡 Socket: ${socket.id}`);
            console.log(`📦 Payload: PIN="${data?.pin}", PlayerName="${data?.playerName}", Username="${data?.username}", PlayerID="${data?.playerId}"`);
            console.log(`📋 Danh sách PIN đang hoạt động trên Server: [${Object.keys(lobbies).join(', ')}]`);

            if (!data || !data.pin) {
                console.log('❌ LỖI: Không có mã PIN phòng trong yêu cầu!');
                console.log('============================================================\n');
                socket.emit('error', "Vui lòng nhập mã PIN phòng hợp lệ!");
                return;
            }

            const pin = String(data.pin).replace(/\s+/g, '').trim();
            if (!lobbies[pin]) {
                console.log(`❌ THẤT BẠI: Học sinh [${data.playerName || data.username}] nhập PIN [${pin}] nhưng phòng KHÔNG TỒN TẠI.`);
                console.log(`💡 Nguyên nhân: Phòng đã bị hủy bởi Host, hoặc Server vừa khởi động lại làm reset danh sách phòng.`);
                console.log('============================================================\n');
                logSocket(`⚠️ Học sinh [${data.playerName || data.username}] nhập PIN [${pin}] nhưng phòng không tồn tại. Danh sách PIN: [${Object.keys(lobbies).join(', ')}]`);
                socket.emit('error', 'Phòng không tồn tại hoặc đã kết thúc.');
                return;
            }

            const lobby = lobbies[pin];
            if (lobby.gameState !== 'WAITING') {
                socket.emit('error', 'Phòng đã bắt đầu hoặc đã kết thúc trận. Bạn không thể tham gia thêm!');
                return;
            }
            console.log(`✅ Tìm thấy phòng [${pin}]. Loại: ${lobby.roomType} | Tên: "${lobby.roomName}" | Host: "${lobby.hostName}"`);

            // NẾU LÀ PHÒNG LỚP HỌC (CLASSROOM): RESTRICTION CHẶN ACCOUNT NGOÀI LỚP
            if (lobby.roomType === 'classroom' && lobby.classId) {
                try {
                    console.log(`🏫 Đang xác minh quyền vào phòng lớp học [Class ID: ${lobby.classId}]...`);
                    const TeacherClass = require('./models/TeacherClass');
                    const classDoc = await TeacherClass.findById(lobby.classId)
                        .populate('teacher', 'username displayName email')
                        .populate('teachers', 'username displayName email')
                        .populate('students', 'username displayName email');

                    if (!classDoc) {
                        console.log(`❌ Không tìm thấy dữ liệu lớp học trong Database tương ứng với classId: ${lobby.classId}`);
                        console.log('============================================================\n');
                        logSocket(`❌ [join_lobby] Không tìm thấy lớp học [${lobby.classId}]`);
                        socket.emit('error', "Không tìm thấy dữ liệu lớp học tương ứng với phòng này!");
                        return;
                    }

                    // Tập hợp các username / displayName / email được phép tham gia (viết thường)
                    const allowedIdentifiers = new Set();
                    const addMember = (m) => {
                        if (!m) return;
                        if (m.username) allowedIdentifiers.add(String(m.username).trim().toLowerCase());
                        if (m.displayName) allowedIdentifiers.add(String(m.displayName).trim().toLowerCase());
                        if (m.email) allowedIdentifiers.add(String(m.email).trim().toLowerCase());
                    };

                    addMember(classDoc.teacher);
                    (classDoc.teachers || []).forEach(addMember);
                    (classDoc.students || []).forEach(addMember);

                    // Thu thập các candidate gửi lên từ client (bỏ qua 'khách', 'guest', 'player')
                    const candidateNames = [data.username, data.playerName]
                        .filter(u => u && typeof u === 'string')
                        .map(u => u.trim().toLowerCase())
                        .filter(u => u !== '' && u !== 'khách' && u !== 'guest' && u !== 'player');

                    let isAllowed = false;
                    if (candidateNames.length > 0) {
                        isAllowed = candidateNames.some(u => allowedIdentifiers.has(u));
                    } else {
                        const rawUser = (data.username || data.playerName || '').trim().toLowerCase();
                        isAllowed = allowedIdentifiers.has(rawUser);
                    }

                    console.log(`   👥 Thành viên lớp "${classDoc.className}" (${allowedIdentifiers.size} định danh): [${Array.from(allowedIdentifiers).slice(0, 8).join(', ')}...]`);
                    console.log(`   🔍 Ứng viên kiểm tra: ${JSON.stringify(candidateNames)} => Kết quả: ${isAllowed ? '✅ ĐƯỢC PHÉP VÀO PHÒNG' : '⛔ BỊ CHẶN (Không thuộc lớp)'}`);

                    if (!isAllowed) {
                        const blockMsg = 'Bạn không có quyền tham gia phòng lớp học này.';
                        console.log(`⛔ ${blockMsg}`);
                        console.log('============================================================\n');
                        logSocket(`⛔ Chặn [${data.playerName}] tham gia phòng lớp [${classDoc.className}]: Không thuộc danh sách học sinh.`);
                        socket.emit('error', blockMsg);
                        return;
                    }
                } catch (err) {
                    console.log("❌ Lỗi ngoại lệ khi kiểm tra quyền tham gia phòng lớp học:", err);
                    console.log('============================================================\n');
                    logSocket("❌ Lỗi kiểm tra quyền tham gia phòng lớp học:", err);
                    socket.emit('error', "Lỗi hệ thống khi kiểm tra quyền vào lớp!");
                    return;
                }
            }

            // Class verification above awaits the database. Recheck in case the
            // host started or destroyed the room while that request was pending.
            if (lobbies[pin] !== lobby || lobby.gameState !== 'WAITING') {
                socket.emit('error', 'Phòng không còn chờ người chơi. Bạn không thể tham gia thêm!');
                return;
            }
            socket.join(pin);

            // Kiểm tra xem người chơi này đã từng ở trong phòng chưa (tránh trùng lặp khi reconnect)
            const existingIndex = lobby.players.findIndex(p => !p.isHost && p.socketId === socket.id);

            if (existingIndex !== -1) {
                if (lobby.players[existingIndex].disconnectTimeout) {
                    clearTimeout(lobby.players[existingIndex].disconnectTimeout);
                    lobby.players[existingIndex].disconnectTimeout = null;
                }
                lobby.players[existingIndex].socketId = socket.id;
                lobby.players[existingIndex].connected = true;
                lobby.players[existingIndex].name = data.playerName || lobby.players[existingIndex].name;
                console.log(`🔄 Cập nhật socket cho người chơi cũ [${data.playerName}] trong phòng [${pin}] (Socket mới: ${socket.id})`);
                logSocket(`🔄 Người chơi [${data.playerName}] kết nối lại phòng [${pin}] (socket mới: ${socket.id})`);
            } else {
                lobby.players.push({
                    socketId: socket.id,
                    playerId: require('crypto').randomUUID(),
                    name: data.playerName,
                    username: data.username || data.playerName,
                    isHost: false,
                    connected: true,
                    role: 'student',
                    score: 0,
                    timePlayed: 0,
                    questionsAnswered: 0
                });
                console.log(`➕ Thêm thành công người chơi [${data.playerName}] vào phòng [${pin}]. Sĩ số hiện tại: ${lobby.players.length} người.`);
                logSocket(`➕ Thêm người chơi [${data.playerName}] vào phòng [${pin}]. Tổng số người: ${lobby.players.length}`);
            }

            saveLobbiesToDisk();

            const joinedPlayer = lobby.players.find(p => p.socketId === socket.id && !p.isHost);
            if (!joinedPlayer) return;
            lobby.playerResumeTokens ||= {};
            const resumeToken = newResumeToken();
            lobby.playerResumeTokens[joinedPlayer.playerId] = resumeToken;
            saveLobbiesToDisk();
            socket.emit('join_success', {
                ...roomSnapshot(pin, lobby),
                resumeToken,
                playerId: joinedPlayer.playerId,
                status: "OK",
                pin: pin,
                roomType: lobby.roomType || 'casual',
                tag: lobby.tag || 'Chơi tự do',
                classId: lobby.classId,
                classCode: lobby.classCode,
                className: lobby.className,
                setId: lobby.setId,
                roomName: lobby.roomName
            });
            io.to(pin).emit('players_update', roomSnapshot(pin, lobby).players);
            console.log(`🎉 [THÀNH CÔNG] Đã phát "join_success" và "players_update" cho phòng [${pin}].`);
            console.log('============================================================\n');
            logSocket(`✅ [join_lobby] Hoàn tất vào phòng [${pin}] cho [${data.playerName}], đã phát players_update.`);
        } catch (error) {
            console.log("❌ Lỗi khi tham gia phòng join_lobby:", error);
            console.log('============================================================\n');
            logSocket("❌ Lỗi khi tham gia phòng join_lobby:", error);
            socket.emit('error', "Lỗi máy chủ khi vào phòng: " + (error.message || 'Lỗi không xác định'));
        }
    });

    socket.on('reconnect_host', async (data = {}) => {
        const pin = String(data.pin || '').trim();
        const lobby = lobbies[pin];
        const expired = message => socket.emit('room_session_expired', message);
        if (!lobby) return expired('Phòng này không còn tồn tại!');
        if (!matchesResumeToken(lobby.hostResumeToken, data.resumeToken)) return expired('Phiên chủ phòng không hợp lệ. Vui lòng tạo phòng mới!');
        if (lobby.roomType === 'classroom') {
            try {
                const { user } = await authorizeClassroom(data.token, lobby.classId);
                if (lobby.hostUserId !== String(user._id)) return expired('Bạn không phải giáo viên đã tạo phòng này!');
            } catch (err) {
                return expired(err.status ? err.message : 'Không thể xác thực lớp học!');
            }
        }
        if (lobby.disconnectTimeout) clearTimeout(lobby.disconnectTimeout);
        lobby.disconnectTimeout = null;
        lobby.hostDisconnectedAt = null;
        lobby.hostConnected = true;
        lobby.hostId = socket.id;
        const host = lobby.players.find(p => p.isHost);
        if (!host) return expired('Không tìm thấy chủ phòng. Vui lòng tạo phòng mới!');
        host.socketId = socket.id;
        host.connected = true;
        socket.join(pin);
        saveLobbiesToDisk();
        socket.emit('host_reconnected', { ...roomSnapshot(pin, lobby), playerId: host.playerId, resumeToken: lobby.hostResumeToken });
        io.to(pin).emit('players_update', roomSnapshot(pin, lobby).players);
        io.to(pin).emit('host_connection_changed', { connected: true });
    });

    socket.on('reconnect_lobby', (data = {}) => {
        const pin = String(data.pin || '').trim();
        const lobby = lobbies[pin];
        const player = lobby?.players.find(p => !p.isHost && p.playerId === data.playerId);
        if (!player || !matchesResumeToken(lobby.playerResumeTokens?.[player.playerId], data.resumeToken)) {
            socket.emit('room_session_expired', 'Phiên chơi không còn tồn tại. Vui lòng nhập lại mã phòng!');
            return;
        }
        if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);
        player.disconnectTimeout = null;
        player.socketId = socket.id;
        player.connected = true;
        socket.join(pin);
        saveLobbiesToDisk();
        socket.emit('reconnect_success', { ...roomSnapshot(pin, lobby), playerId: player.playerId, resumeToken: data.resumeToken });
        io.to(pin).emit('players_update', roomSnapshot(pin, lobby).players);
    });

    socket.on('select_room_set', async (data = {}) => {
        const lobby = lobbies[data.pin];
        if (!lobby || lobby.hostId !== socket.id || lobby.gameState !== 'WAITING') return;
        try {
            const user = lobby.hostUserId ? await require('./models/User').findById(lobby.hostUserId) : null;
            const classDoc = lobby.classId ? await require('./models/TeacherClass').findById(lobby.classId) : null;
            const set = await roomQuestionSet(data.setId, user, classDoc);
            lobby.setId = String(set._id);
            lobby.setTitle = set.title;
            saveLobbiesToDisk();
            io.to(data.pin).emit('room_set_updated', { setId: lobby.setId, setTitle: lobby.setTitle });
        } catch (err) { socket.emit('error', err.message); }
    });

    socket.on('start_game', (rawPin) => {
        const pin = String(rawPin || '').replace(/\s+/g, '').trim();
        if (lobbies[pin]) {
            if (lobbies[pin].hostId !== socket.id || !lobbies[pin].setId || lobbies[pin].gameState !== 'WAITING') return;
            lobbies[pin].gameState = 'PLAYING';
            saveLobbiesToDisk();
            console.log(`🚀 [START_GAME] Phòng [${pin}] đã bắt đầu trận đấu!`);
            io.to(pin).emit('game_started', {
                message: "GO!",
                setId: lobbies[pin].setId,
                setTitle: lobbies[pin].setTitle
            });
        } else {
            console.log(`🚀 [START_GAME] Bắt đầu trận đấu cho pin: ${pin}`);
            io.to(pin).emit('game_started', "GO!");
        }
    });

    socket.on('submit_score', async (data) => {
        const { pin, addedScore, score, timePlayed, questionsAnswered, completed, animalsCollected } = data;

        if (lobbies[pin]) {
            const playerIndex = lobbies[pin].players.findIndex(p => p.socketId === socket.id);

            if (playerIndex !== -1) {
                const finalScore = (score !== undefined) ? Number(score) : ((lobbies[pin].players[playerIndex].score || 0) + (Number(addedScore) || 0));
                lobbies[pin].players[playerIndex].score = finalScore;

                const isCompleted = (completed !== undefined) ? Boolean(completed) : (finalScore > 0);
                lobbies[pin].players[playerIndex].completed = isCompleted;

                if (animalsCollected !== undefined) {
                    lobbies[pin].players[playerIndex].animalsCollected = Number(animalsCollected);
                }
                if (timePlayed !== undefined) {
                    lobbies[pin].players[playerIndex].timePlayed = Number(timePlayed);
                }
                if (questionsAnswered !== undefined) {
                    lobbies[pin].players[playerIndex].questionsAnswered = Number(questionsAnswered);
                }

                saveLobbiesToDisk();

                const sortedLeaderboard = roomSnapshot(pin, lobbies[pin]).players.sort((a, b) => {
                    const scoreA = a.score || 0;
                    const scoreB = b.score || 0;
                    return scoreB - scoreA;
                });

                io.to(pin).emit('live_leaderboard_update', sortedLeaderboard);

                // Lưu vào TeacherClass (cả gameScores và gameSessions)
                if (lobbies[pin].roomType === 'classroom' && lobbies[pin].classId) {
                    try {
                        const TeacherClass = require('./models/TeacherClass');
                        const classDoc = await TeacherClass.findById(lobbies[pin].classId);
                        if (classDoc) {
                            if (!classDoc.gameSessions) classDoc.gameSessions = [];
                            let currentSession = classDoc.gameSessions.find(s => s.roomPin === pin);
                            if (!currentSession) {
                                classDoc.gameSessions.push({
                                    sessionId: require('crypto').randomUUID(),
                                    roomPin: pin,
                                    setTitle: lobbies[pin].roomName || 'Phiên chơi Lớp học',
                                    setId: lobbies[pin].setId || null,
                                    playedAt: new Date(),
                                    teacherParticipated: Boolean(lobbies[pin].teacherParticipates),
                                    players: []
                                });
                                currentSession = classDoc.gameSessions[classDoc.gameSessions.length - 1];
                            }

                            const currentPlayerObj = lobbies[pin].players[playerIndex];
                            const isTeacherPlayer = currentPlayerObj.role === 'teacher';

                            // Nếu giáo viên chỉ làm trọng tài (không chọn chơi cùng), không ghi nhận vào bảng điểm thi đấu
                            if (isTeacherPlayer && !lobbies[pin].teacherParticipates) {
                                // Bỏ qua ghi điểm thi đấu cho trọng tài
                            } else {
                                const cleanPlayerName = currentPlayerObj.username ||
                                    (currentPlayerObj.name ? currentPlayerObj.name.replace(/\s*\(GV.*?\)/g, '').trim() : 'Học sinh');

                                let sessionPlayer = currentSession.players.find(p => p.studentName === cleanPlayerName);
                                if (!sessionPlayer) {
                                    currentSession.players.push({
                                        studentName: cleanPlayerName,
                                        displayName: cleanPlayerName,
                                        score: currentPlayerObj.score,
                                        timePlayed: Number(timePlayed) || 0,
                                        questionsAnswered: Number(questionsAnswered) || 0,
                                        role: currentPlayerObj.role || 'student',
                                        rank: 1
                                    });
                                } else {
                                    sessionPlayer.score = currentPlayerObj.score;
                                    sessionPlayer.timePlayed = Number(timePlayed) || 0;
                                    sessionPlayer.questionsAnswered = Number(questionsAnswered) || 0;
                                }

                                currentSession.players.sort((a, b) => (b.score || 0) - (a.score || 0));
                                currentSession.players.forEach((p, idx) => { p.rank = idx + 1; });

                                classDoc.markModified('gameSessions');
                                await classDoc.save();
                                console.log(`📝 Đã cập nhật điểm lớp học cho [${cleanPlayerName}] vào phiên chơi lớp ${classDoc.className}`);
                            }
                        }
                    } catch (e) {
                        console.error("Lỗi cập nhật phiên chơi lớp học:", e);
                    }
                }
            }
        }
    });

    socket.on('request_end_game', async (rawPin) => {
        const pin = (typeof rawPin === 'object' && rawPin?.pin) ? String(rawPin.pin).replace(/\s+/g, '').trim() : String(rawPin || '').replace(/\s+/g, '').trim();
        console.log(`\n🛑 ================== [REQUEST_END_GAME] ==================`);
        console.log(`📡 Socket: [${socket.id}] yêu cầu KẾT THÚC TRẬN ĐẤU phòng PIN: "${pin}"`);

        if (lobbies[pin]) {
            lobbies[pin].gameState = 'FINISHED';
            // Những người chơi chưa hoàn thành (chưa tìm đủ 4 thú) thì điểm là 0
            lobbies[pin].players.forEach(p => {
                if (!p.completed) {
                    p.score = 0;
                    p.completed = false;
                }
            });

            const sortedLeaderboard = roomSnapshot(pin, lobbies[pin]).players.sort((a, b) => {
                const scoreA = a.score || 0;
                const scoreB = b.score || 0;
                return scoreB - scoreA;
            });

            saveLobbiesToDisk();

            io.to(pin).emit('live_leaderboard_update', sortedLeaderboard);
            io.to(pin).emit('end_game_requested', "Host đã dừng game!");
            io.to(pin).emit('game_ended', "Hết giờ!");

            const socketsInRoom = await io.in(pin).allSockets();
            console.log(`📢 Đã phát tín hiệu (game_ended) tới ${socketsInRoom.size} thiết bị trong phòng [${pin}]:`, Array.from(socketsInRoom));
            console.log(`🏆 Bảng điểm chốt hạ:`, sortedLeaderboard.map(p => `${p.name}: ${p.score}XP (hoàn thành: ${p.completed})`));
            console.log(`============================================================\n`);

            // Cập nhật chốt điểm phiên chơi vào TeacherClass (nếu là phòng classroom)
            if (lobbies[pin].roomType === 'classroom' && lobbies[pin].classId) {
                try {
                    const TeacherClass = require('./models/TeacherClass');
                    const classDoc = await TeacherClass.findById(lobbies[pin].classId);
                    if (classDoc && classDoc.gameSessions) {
                        let currentSession = classDoc.gameSessions.find(s => s.roomPin === pin);
                        if (!currentSession) {
                            classDoc.gameSessions.push({
                                sessionId: require('crypto').randomUUID(),
                                roomPin: pin,
                                setTitle: lobbies[pin].roomName || 'Phiên chơi Lớp học',
                                setId: lobbies[pin].setId || null,
                                playedAt: new Date(),
                                teacherParticipated: Boolean(lobbies[pin].teacherParticipates),
                                players: []
                            });
                            currentSession = classDoc.gameSessions[classDoc.gameSessions.length - 1];
                        }

                        lobbies[pin].players.forEach(p => {
                            if (p.role === 'teacher' && !lobbies[pin].teacherParticipates) return;
                            const cleanPlayerName = p.username || (p.name ? p.name.replace(/\s*\(GV.*?\)/g, '').trim() : 'Học sinh');
                            let sp = currentSession.players.find(x => x.studentName === cleanPlayerName);
                            if (!sp) {
                                currentSession.players.push({
                                    studentName: cleanPlayerName,
                                    displayName: cleanPlayerName,
                                    score: p.score || 0,
                                    timePlayed: Number(p.timePlayed) || 0,
                                    questionsAnswered: Number(p.questionsAnswered) || 0,
                                    role: p.role || 'student',
                                    rank: 1
                                });
                            } else {
                                sp.score = p.score || 0;
                                sp.timePlayed = Number(p.timePlayed) || 0;
                                sp.questionsAnswered = Number(p.questionsAnswered) || 0;
                            }
                        });

                        currentSession.players.sort((a, b) => (b.score || 0) - (a.score || 0));
                        currentSession.players.forEach((p, idx) => { p.rank = idx + 1; });

                        classDoc.markModified('gameSessions');
                        await classDoc.save();
                        console.log(`🏁 Host dừng game: Đã lưu bảng điểm chung cuộc cho phiên chơi phòng [${pin}]`);
                    }
                } catch (e) {
                    console.error("Lỗi cập nhật phiên chơi khi dừng game:", e);
                }
            }
        } else {
            console.log(`⚠️ Phòng [${pin}] không có trong bộ nhớ, phát broadcast game_ended vào room [${pin}]`);
            io.to(pin).emit('end_game_requested', "Host đã dừng game!");
            io.to(pin).emit('game_ended', "Hết giờ!");
            console.log(`============================================================\n`);
        }
    });

    socket.on('trigger_end_game', async (rawPin) => {
        const pin = (typeof rawPin === 'object' && rawPin?.pin) ? String(rawPin.pin).replace(/\s+/g, '').trim() : String(rawPin || '').replace(/\s+/g, '').trim();
        console.log(`\n🛑 ================== [TRIGGER_END_GAME] ==================`);
        console.log(`📡 Socket: [${socket.id}] yêu cầu TRIGGER END GAME phòng PIN: "${pin}"`);

        if (lobbies[pin]) {
            lobbies[pin].gameState = 'FINISHED';
            lobbies[pin].players.forEach(p => {
                if (!p.completed) {
                    p.score = 0;
                    p.completed = false;
                }
            });

            const sortedLeaderboard = roomSnapshot(pin, lobbies[pin]).players.sort((a, b) => {
                const scoreA = a.score || 0;
                const scoreB = b.score || 0;
                return scoreB - scoreA;
            });

            saveLobbiesToDisk();

            io.to(pin).emit('live_leaderboard_update', sortedLeaderboard);
            io.to(pin).emit('game_ended', "Hết giờ!");
            const socketsInRoom = await io.in(pin).allSockets();
            console.log(`📢 Đã phát game_ended tới ${socketsInRoom.size} thiết bị trong phòng [${pin}]:`, Array.from(socketsInRoom));
            console.log(`============================================================\n`);
        } else {
            io.to(pin).emit('game_ended', "Hết giờ!");
        }
    });

    function removeMember(pin, player) {
        const lobby = lobbies[pin];
        if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);
        lobby.players = lobby.players.filter(p => p !== player);
        delete (lobby.playerResumeTokens || {})[player.playerId];
        io.to(player.socketId).emit('room_session_expired', 'Bạn đã rời phòng.');
        io.in(player.socketId).socketsLeave(pin);
        saveLobbiesToDisk();
        io.to(pin).emit('players_update', roomSnapshot(pin, lobby).players);
    }
    socket.on('leave_lobby', (data = {}) => {
        const lobby = lobbies[data.pin];
        const player = lobby?.players.find(p => p.socketId === socket.id && !p.isHost);
        if (player) removeMember(data.pin, player);
    });
    socket.on('kick_member', (data = {}) => {
        const lobby = lobbies[data.pin];
        if (!lobby || lobby.hostId !== socket.id) return;
        const player = lobby.players.find(p => p.playerId === data.playerId && !p.isHost);
        if (player) removeMember(data.pin, player);
    });

    socket.on('destroy_room', (rawPin) => {
        const pin = String(rawPin || '').replace(/\s+/g, '').trim();
        if (!pin || lobbies[pin]?.hostId !== socket.id) return;
        console.log(`\n🗑️ ================== [DESTROY_ROOM] ==================`);
        console.log(`🗑️ Yêu cầu giải tán phòng [${pin}] từ socket [${socket.id}]`);
        // 1. Cho socket của Host rời room trước
        socket.leave(pin);
        // 2. Báo room_destroyed cho các học sinh khác trong phòng
        socket.to(pin).emit('room_destroyed', "Phòng đã giải tán");
        // 3. Giải tán tất cả socket còn lại khỏi room
        io.in(pin).socketsLeave(pin);

        delete lobbies[pin];
        saveLobbiesToDisk();
        console.log(`✅ Đã giải tán phòng [${pin}]. Danh sách phòng còn lại: [${Object.keys(lobbies).join(', ')}]`);
        console.log(`============================================================\n`);
    });

    socket.on('disconnect', (reason) => {
        logSocket(`🔴 Mất kết nối: ${socket.id} (Lý do: ${reason})`);

        for (const [pin, lobby] of Object.entries(lobbies)) {
            // 1. Nếu là Host: KHÔNG xóa phòng ngay! Cho 90 giây chờ Host reconnect (tránh bị xóa khi chuyển tab)
            if (lobby.hostId === socket.id) {
                console.log(`\n⚠️ Host [${socket.id}] tạm thời ngắt kết nối khỏi phòng [${pin}]. Giữ phòng trong 90 giây chờ Host reconnect...`);
                lobby.hostConnected = false;
                lobby.hostDisconnectedAt = Date.now();
                const host = lobby.players.find(p => p.isHost);
                if (host) host.connected = false;
                io.to(pin).emit('host_connection_changed', { connected: false });
                io.to(pin).emit('players_update', roomSnapshot(pin, lobby).players);
                scheduleHostExpiry(pin, lobby);
                saveLobbiesToDisk();
            } else {
                // 2. Nếu là Player / Học sinh:
                const player = lobby.players.find(p => p.socketId === socket.id);
                if (player) {
                    player.connected = false;
                    console.log(`🏃 Học sinh [${player.name || player.username}] tạm ngắt kết nối khỏi phòng [${pin}]. Chờ 60 giây để reconnect...`);
                    if (!player.disconnectTimeout) {
                        player.disconnectTimeout = setTimeout(() => {
                            if (!player.connected && lobbies[pin]) {
                                const pIdx = lobbies[pin].players.findIndex(p => p.socketId === socket.id || p.playerId === player.playerId);
                                if (pIdx !== -1) {
                                    const removed = lobbies[pin].players.splice(pIdx, 1)[0];
                                    console.log(`⌛ Hết 60s chờ: Học sinh [${removed.name || removed.username}] không kết nối lại -> Xóa khỏi phòng [${pin}]`);
                                    saveLobbiesToDisk();
                                    io.to(pin).emit('players_update', roomSnapshot(pin, lobbies[pin]).players);
                                    if (lobbies[pin].gameState !== 'WAITING') {
                                        io.to(pin).emit('live_leaderboard_update', roomSnapshot(pin, lobbies[pin]).players);
                                    }
                                }
                            }
                        }, 60000);
                    }
                }
            }
        }
    });
});


server.listen(PORT, () => {
    console.log(`🚀 Server & Socket.io đang chạy tại http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.error('💥 [Server] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 [Server] Unhandled Rejection at:', promise, 'reason:', reason);
});
