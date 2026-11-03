const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
require('dotenv').config();

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

io.on('connection', (socket) => {
    console.log(`🟢 Một thiết bị vừa kết nối: ${socket.id}`);


        socket.on('create_lobby', async (data) => {
        let pin = Math.floor(100000 + Math.random() * 900000).toString();

        while (lobbies[pin]) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
        }

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
                    socket.emit('error', `Mã lớp học "${rawClassInput}" không tồn tại trên hệ thống! Vui lòng kiểm tra lại.`);
                    return;
                }

                finalClassId = classDoc._id.toString();
                finalClassCode = classDoc.classCode;
                finalClassName = classDoc.className;
                roomName = `Lớp ${classDoc.className} (${classDoc.classCode})`;
            } catch (err) {
                console.error("Lỗi xác minh lớp học khi tạo phòng:", err);
                socket.emit('error', 'Không thể kết nối với dữ liệu lớp học!');
                return;
            }
        }

        lobbies[pin] = { 
            hostId: socket.id, 
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
            gameSessionRecorded: false
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

        socket.join(pin);
        console.log(`👑 Host [${socket.id}] vừa tạo phòng [${tag} - ${roomName}]. PIN: ${pin} | Chơi cùng: ${teacherParticipates}`);

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
    });

    socket.on('join_lobby', async (data) => {
        const pin = data.pin;
        if (!lobbies[pin]) {
            socket.emit('error', "Phòng không tồn tại hoặc đã kết thúc!");
            return;
        }

        const lobby = lobbies[pin];

        // NẾU LÀ PHÒNG LỚP HỌC (CLASSROOM): RESTRICTION CHẶN ACCOUNT NGOÀI LỚP
        if (lobby.roomType === 'classroom' && lobby.classId) {
            try {
                const TeacherClass = require('./models/TeacherClass');
                const classDoc = await TeacherClass.findById(lobby.classId)
                    .populate('teacher', 'username displayName')
                    .populate('teachers', 'username displayName')
                    .populate('students', 'username displayName');

                if (!classDoc) {
                    socket.emit('error', "Không tìm thấy dữ liệu lớp học tương ứng với phòng này!");
                    return;
                }

                // Tập hợp các username được phép tham gia (Học sinh và Giáo viên của lớp)
                const allowedUsers = new Set();
                if (classDoc.teacher?.username) allowedUsers.add(classDoc.teacher.username.toLowerCase());
                (classDoc.teachers || []).forEach(t => { if (t.username) allowedUsers.add(t.username.toLowerCase()); });
                (classDoc.students || []).forEach(s => { if (s.username) allowedUsers.add(s.username.toLowerCase()); });

                const rawUser = (data.username || data.playerName || '').trim().toLowerCase();

                if (!allowedUsers.has(rawUser)) {
                    socket.emit('error', `Tài khoản "${data.playerName}" không thuộc lớp "${classDoc.className}". Chỉ học sinh và giáo viên của lớp mới được tham gia!`);
                    console.log(`⛔ Chặn [${data.playerName}] tham gia phòng lớp [${classDoc.className}] do không thuộc lớp.`);
                    return;
                }
            } catch (err) {
                console.error("Lỗi kiểm tra quyền tham gia phòng lớp học:", err);
                socket.emit('error', "Lỗi hệ thống khi kiểm tra quyền vào lớp!");
                return;
            }
        }

        socket.join(pin);
        lobby.players.push({ 
            socketId: socket.id,
            playerId: data.playerId,
            name: data.playerName,
            username: data.username || data.playerName,
            isHost: false,
            role: 'student',
            score: 0,
            timePlayed: 0,
            questionsAnswered: 0
        });
        
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
    });

    socket.on('reconnect_lobby', (data) => {
        const { pin, playerId } = data;
        
        if (lobbies[pin]) {
            const player = lobbies[pin].players.find(p => p.playerId === playerId);
            if (player) {
                player.socketId = socket.id;
                socket.join(pin);
                socket.emit('reconnect_success', {
                    status: "OK",
                    pin: pin,
                    gameState: lobbies[pin].gameState,
                    currentScore: player.score
                });
                io.to(pin).emit('players_update', lobbies[pin].players);
            } else {
                socket.emit('error', "Không tìm thấy phiên chơi của bạn!");
            }
        } else {
            socket.emit('error', "Phòng này không còn tồn tại!");
        }
    });

    socket.on('select_room_set', (data) => {
        const { pin, setId, setTitle } = data;
        if (lobbies[pin]) {
            lobbies[pin].setId = setId;
            lobbies[pin].roomName = setTitle || lobbies[pin].roomName;
            console.log(`📚 Phòng [${pin}] vừa đổi bộ câu hỏi: [${setTitle}] (ID: ${setId})`);
            io.to(pin).emit('room_set_updated', {
                setId: setId,
                setTitle: setTitle
            });
        }
    });

    socket.on('start_game', (pin) => {
        if (lobbies[pin]) {
            lobbies[pin].gameState = 'PLAYING';
            io.to(pin).emit('game_started', {
                message: "GO!",
                setId: lobbies[pin].setId,
                setTitle: lobbies[pin].roomName || lobbies[pin].setTitle
            });
        } else {
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

    socket.on('request_end_game', async (pin) => {
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

            io.to(pin).emit('live_leaderboard_update', sortedLeaderboard);
            io.to(pin).emit('end_game_requested', "Host đã dừng game!");
            io.to(pin).emit('game_ended', "Hết giờ!");

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
            io.to(pin).emit('end_game_requested', "Host đã dừng game!");
            io.to(pin).emit('game_ended', "Hết giờ!");
        }
    });

    socket.on('trigger_end_game', async (pin) => {
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

            io.to(pin).emit('live_leaderboard_update', sortedLeaderboard);
            io.to(pin).emit('game_ended', "Hết giờ!");
        } else {
            io.to(pin).emit('game_ended', "Hết giờ!");
        }
    });


    socket.on('destroy_room', (pin) => {
        io.to(pin).emit('room_destroyed', "Phòng đã giải tán");       
        io.in(pin).socketsLeave(pin);
        
        delete lobbies[pin];
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Mất kết nối: ${socket.id}`);
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
