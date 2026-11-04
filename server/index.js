const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Server } = require('socket.io');
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

// Nạp các phòng đang có từ bộ nhớ đệm
loadLobbiesFromDisk(); 

io.on('connection', (socket) => {
    logSocket(`🟢 Một thiết bị vừa kết nối: ${socket.id} (Transport: ${socket.conn ? socket.conn.transport.name : 'unknown'})`);

    socket.on('create_lobby', async (data) => {
        try {
            logSocket(`📥 [create_lobby] từ socket ${socket.id}:`, data);
            const roomType = (data && data.roomType) ? data.roomType : 'casual';
            const tag = (data && data.tag) ? data.tag : (roomType === 'classroom' ? 'Lớp học' : 'Chơi tự do');
            const rawClassInput = (data && data.classId) ? String(data.classId).trim().toLowerCase() : null;
            const setId = (data && data.setId) ? data.setId : null;
            const hostName = (data && data.hostName) ? data.hostName : 'Host';
            const teacherParticipates = Boolean(data && data.teacherParticipates);

            let finalClassId = null;
            let finalClassCode = null;
            let finalClassName = null;
            let roomName = (data && data.roomName) ? data.roomName : (roomType === 'classroom' ? 'Phòng Lớp Học' : 'Phòng Đấu');

            // NẾU LÀ PHÒNG LỚP HỌC (CLASSROOM): XÁC MINH VÀ KẾT NỐI VỚI LỚP HỌC TRONG DATABASE
            if (roomType === 'classroom') {
                if (!rawClassInput) {
                    socket.emit('error', 'Vui lòng nhập mã lớp học để tạo phòng!');
                    return;
                }

                try {
                    const TeacherClass = require('./models/TeacherClass');
                    let query = mongoose.Types.ObjectId.isValid(rawClassInput) 
                        ? { _id: rawClassInput } 
                        : { classCode: rawClassInput };

                    const classDoc = await TeacherClass.findOne(query);
                    if (!classDoc) {
                        logSocket(`❌ [create_lobby] Mã lớp "${rawClassInput}" không tồn tại!`);
                        socket.emit('error', `Mã lớp học "${rawClassInput}" không tồn tại trên hệ thống! Vui lòng kiểm tra lại.`);
                        return;
                    }

                    finalClassId = classDoc._id.toString();
                    finalClassCode = classDoc.classCode;
                    finalClassName = classDoc.className;
                    roomName = `Lớp ${classDoc.className} (${classDoc.classCode})`;
                } catch (err) {
                    logSocket("❌ Lỗi xác minh lớp học khi tạo phòng:", err);
                    socket.emit('error', 'Không thể kết nối với dữ liệu lớp học!');
                    return;
                }
            }

            // Dọn dẹp sạch mọi phòng cũ do chính Host (socket.id / hostName) này từng tạo hoặc phòng cũ của cùng lớp học
            for (const [oldPin, lobby] of Object.entries(lobbies)) {
                const isSameHost = (lobby.hostId === socket.id) || 
                    (hostName && lobby.hostName && lobby.hostName.toLowerCase() === hostName.toLowerCase());
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
                name: hostName + (teacherParticipates ? ' (GV Cùng Chơi)' : ' (GV - Trọng Tài)'),
                username: hostName,
                isHost: true,
                role: 'teacher',
                isParticipating: teacherParticipates,
                score: 0,
                timePlayed: 0,
                questionsAnswered: 0
            });

            saveLobbiesToDisk();
            socket.join(pin);
            logSocket(`👑 Host [${socket.id}] vừa tạo phòng [${tag} - ${roomName}]. PIN: ${pin} | Chơi cùng: ${teacherParticipates}`);

            socket.emit('lobby_created', { 
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

            io.to(pin).emit('players_update', lobbies[pin].players);
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
                socket.emit('error', `Phòng [${pin}] không tồn tại hoặc đã kết thúc! Vui lòng kiểm tra lại mã PIN với Giáo viên.`);
                return;
            }

            const lobby = lobbies[pin];
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
                        const blockMsg = `Tài khoản "${data.playerName}" không thuộc lớp "${classDoc.className}". Chỉ học sinh và giáo viên của lớp mới được tham gia!`;
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

            socket.join(pin);

            // Kiểm tra xem người chơi này đã từng ở trong phòng chưa (tránh trùng lặp khi reconnect)
            const isGuestUsername = (u) => !u || ['khách', 'guest', 'player'].includes(String(u).trim().toLowerCase());

            const existingIndex = lobby.players.findIndex(p => 
                (data.playerId && p.playerId === data.playerId) || 
                (p.socketId === socket.id) ||
                (!isGuestUsername(data.username) && !isGuestUsername(p.username) && String(p.username).toLowerCase() === String(data.username).toLowerCase() && !p.isHost) ||
                (data.playerName && p.name && p.name.toLowerCase() === String(data.playerName).toLowerCase() && !p.isHost)
            );

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
                    playerId: data.playerId || ('p_' + socket.id.substring(0, 6)),
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
            
            socket.emit('join_success', { 
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
            io.to(pin).emit('players_update', lobby.players);
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

    socket.on('reconnect_host', (data) => {
        const pin = data && data.pin ? String(data.pin).replace(/\s+/g, '').trim() : null;
        if (!pin) return;

        console.log(`\n👑 [RECONNECT_HOST] Host [${data.hostName || socket.id}] yêu cầu gắn lại phòng [${pin}]`);
        logSocket(`👑 Host [${data.hostName || socket.id}] yêu cầu gắn lại phòng [${pin}]`);

        if (!lobbies[pin]) {
            // Tự động khôi phục phòng nếu server vừa bị reload
            console.log(`🛠️ Phòng [${pin}] không còn trong RAM (do server reload), tiến hành tự động TÁI TẠO phòng cho Host!`);
            const roomType = data.roomType || 'casual';
            const tag = data.tag || (roomType === 'classroom' ? 'Lớp học' : 'Chơi tự do');
            const classId = data.classId || null;
            const className = data.className || null;
            const classCode = data.classCode || null;
            const hostName = data.hostName || 'Host';
            const teacherParticipates = Boolean(data.teacherParticipates);

            lobbies[pin] = {
                hostId: socket.id,
                hostConnected: true,
                disconnectTimeout: null,
                players: [],
                gameState: 'WAITING',
                roomType: roomType,
                tag: tag,
                classId: classId,
                classCode: classCode,
                className: className,
                setId: data.setId || null,
                roomName: data.roomName || (className ? `Lớp ${className} (${classCode || ''})` : `Phòng ${tag}`),
                hostName: hostName,
                teacherParticipates: teacherParticipates,
                gameSessionRecorded: false
            };

            lobbies[pin].players.push({
                socketId: socket.id,
                playerId: 'host_' + socket.id.substring(0, 6),
                name: hostName + (teacherParticipates ? ' (GV Cùng Chơi)' : ' (GV - Trọng Tài)'),
                username: hostName,
                isHost: true,
                role: 'teacher',
                isParticipating: teacherParticipates,
                score: 0,
                timePlayed: 0,
                questionsAnswered: 0
            });
            console.log(`✅ Đã tái tạo thành công phòng [${pin}] cho Host [${hostName}]. Danh sách phòng hiện có: [${Object.keys(lobbies).join(', ')}]`);
        } else {
            if (lobbies[pin].disconnectTimeout) {
                clearTimeout(lobbies[pin].disconnectTimeout);
                lobbies[pin].disconnectTimeout = null;
            }
            lobbies[pin].hostConnected = true;
            lobbies[pin].hostId = socket.id;
            const hostPlayer = lobbies[pin].players.find(p => p.isHost);
            if (hostPlayer) {
                hostPlayer.socketId = socket.id;
            }
            console.log(`✅ Đã gắn lại socket mới [${socket.id}] cho Host phòng [${pin}].`);
        }

        socket.join(pin);
        saveLobbiesToDisk();
        socket.emit('host_reconnected', { pin: pin });
        io.to(pin).emit('players_update', lobbies[pin].players);
    });

    socket.on('reconnect_lobby', (data) => {
        const pin = data && data.pin ? String(data.pin).replace(/\s+/g, '').trim() : null;
        if (!pin) return;

        console.log(`\n🎒 ================== [RECONNECT_LOBBY] ==================`);
        console.log(`📡 Socket [${socket.id}] yêu cầu gắn lại phòng [${pin}]`);
        console.log(`📦 Payload:`, data);
        
        if (lobbies[pin]) {
            const player = lobbies[pin].players.find(p => 
                (data.playerId && p.playerId === data.playerId) ||
                (data.username && p.username && p.username.toLowerCase() === String(data.username).toLowerCase()) ||
                (data.playerName && p.name && p.name.toLowerCase() === String(data.playerName).toLowerCase())
            );

            if (player) {
                if (player.disconnectTimeout) {
                    clearTimeout(player.disconnectTimeout);
                    player.disconnectTimeout = null;
                }
                player.socketId = socket.id;
                player.connected = true;
                socket.join(pin);
                console.log(`✅ Đã gắn lại socket mới [${socket.id}] cho học sinh [${player.name || player.username}] trong phòng [${pin}]`);
                socket.emit('reconnect_success', {
                    status: "OK",
                    pin: pin,
                    gameState: lobbies[pin].gameState,
                    currentScore: player.score
                });
                io.to(pin).emit('players_update', lobbies[pin].players);
            } else {
                // Tự động cho vào phòng để đảm bảo nhận được các event của phòng
                socket.join(pin);
                console.log(`⚠️ Không tìm thấy bản ghi cũ của học sinh, tự động đưa socket [${socket.id}] vào room [${pin}]`);
            }
            saveLobbiesToDisk();
            console.log(`============================================================\n`);
        } else {
            console.log(`❌ THẤT BẠI: Phòng [${pin}] không tồn tại trong danh sách phòng!`);
            console.log(`============================================================\n`);
            socket.emit('error', "Phòng này không còn tồn tại!");
        }
    });

    socket.on('select_room_set', (data) => {
        const { pin, setId, setTitle } = data;
        if (lobbies[pin]) {
            lobbies[pin].setId = setId;
            lobbies[pin].roomName = setTitle || lobbies[pin].roomName;
            console.log(`📚 Phòng [${pin}] vừa đổi bộ câu hỏi: [${setTitle}] (ID: ${setId})`);
            saveLobbiesToDisk();
            io.to(pin).emit('room_set_updated', {
                setId: setId,
                setTitle: setTitle
            });
        }
    });

    socket.on('start_game', (rawPin) => {
        const pin = String(rawPin || '').replace(/\s+/g, '').trim();
        if (lobbies[pin]) {
            lobbies[pin].gameState = 'PLAYING';
            saveLobbiesToDisk();
            console.log(`🚀 [START_GAME] Phòng [${pin}] đã bắt đầu trận đấu!`);
            io.to(pin).emit('game_started', {
                message: "GO!",
                setId: lobbies[pin].setId,
                setTitle: lobbies[pin].roomName || lobbies[pin].setTitle
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

                const sortedLeaderboard = [...lobbies[pin].players].sort((a, b) => {
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

            const sortedLeaderboard = [...lobbies[pin].players].sort((a, b) => {
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

            const sortedLeaderboard = [...lobbies[pin].players].sort((a, b) => {
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

    socket.on('destroy_room', (rawPin) => {
        const pin = String(rawPin || '').replace(/\s+/g, '').trim();
        if (!pin) return;
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
                if (lobby.disconnectTimeout) clearTimeout(lobby.disconnectTimeout);
                lobby.disconnectTimeout = setTimeout(() => {
                    if (!lobby.hostConnected && lobbies[pin]) {
                        console.log(`👑 Hết 90s chờ: Host phòng [${pin}] không kết nối lại. Chính thức giải tán phòng.`);
                        io.to(pin).emit('room_destroyed', "Chủ phòng đã thoát, phòng đã bị giải tán!");
                        io.in(pin).socketsLeave(pin);
                        delete lobbies[pin];
                        saveLobbiesToDisk();
                    }
                }, 90000); // 90 giây
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
                                    io.to(pin).emit('players_update', lobbies[pin].players);
                                    if (lobbies[pin].gameState !== 'WAITING') {
                                        io.to(pin).emit('live_leaderboard_update', lobbies[pin].players);
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
