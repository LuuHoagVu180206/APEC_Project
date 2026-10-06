const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

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
    .then(() => {
        console.log('✅ Đã kết nối MongoDB thành công!');
        console.log("🏠 Địa chỉ máy chủ DB:", mongoose.connection.host);
        console.log("📂 Tên Database đang dùng:", mongoose.connection.name);
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


    socket.on('create_lobby', () => {
        let pin = Math.floor(100000 + Math.random() * 900000).toString();

        while (lobbies[pin]) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
        }

        lobbies[pin] = { 
            hostId: socket.id, 
            players: [],
            gameState: 'WAITING' 
        };

        socket.join(pin);
        console.log(`👑 Host [${socket.id}] vừa tạo phòng. Mã PIN: ${pin}`);

        socket.emit('lobby_created', { pin: pin });
    });


    socket.on('join_lobby', (data) => {
        const pin = data.pin;
        if (lobbies[pin]) {
            socket.join(pin);
            lobbies[pin].players.push({ 
                socketId: socket.id,
                playerId: data.playerId,
                name: data.playerName,
                score: 0 
            });
            
            socket.emit('join_success', "OK");
            io.to(pin).emit('players_update', lobbies[pin].players); 
        } else {
            socket.emit('error', "Phòng không tồn tại!"); 
        }
    });


    socket.on('reconnect_lobby', (data) => {
        const { pin, playerId } = data;
        
        if (lobbies[pin]) {
            // Tìm xem ông này có nằm trong danh sách đang chơi dở không
            const player = lobbies[pin].players.find(p => p.playerId === playerId);
            
            if (player) {
                // Cập nhật lại đường ống mới cho ông ấy
                player.socketId = socket.id;
                socket.join(pin);
                
                // THẦN CHÚ LẤY LẠI PROGRESS:
                // Bắn lại toàn bộ trạng thái hiện tại của game (đang câu mấy, điểm bao nhiêu)
                socket.emit('restore_progress', {
                    gameState: lobbies[pin].gameState,
                    currentQuestionIndex: lobbies[pin].currentQuestionIndex,
                    yourScore: player.score,
                    // ... các dữ liệu khác
                });
                console.log(`🔌 Người chơi ${player.name} vừa F5 và kết nối lại thành công!`);
            }
        }
    });


    socket.on('start_game', (pin) => {
        io.to(pin).emit('game_started', "GO!");
    });


    socket.on('submit_score', (data) => {
        const { pin, addedScore } = data; // Godot gửi lên mã PIN và số điểm vừa ghi được

        if (lobbies[pin]) {
            // 1. Tìm người chơi vừa gửi điểm trong danh sách của phòng
            const playerIndex = lobbies[pin].players.findIndex(p => p.socketId === socket.id);
            
            if (playerIndex !== -1) {
                // 2. Cộng điểm cho người đó (nếu chưa có điểm thì khởi tạo là 0)
                if (!lobbies[pin].players[playerIndex].score) {
                    lobbies[pin].players[playerIndex].score = 0;
                }
                lobbies[pin].players[playerIndex].score += addedScore;

                // 3. Sắp xếp lại danh sách người chơi theo thứ tự điểm từ Cao xuống Thấp
                const sortedLeaderboard = [...lobbies[pin].players].sort((a, b) => {
                    const scoreA = a.score || 0;
                    const scoreB = b.score || 0;
                    return scoreB - scoreA;
                });

                // 4. Bắn mảng dữ liệu đã sắp xếp này xuống TẤT CẢ mọi người (Đặc biệt là Host đang xem)
                io.to(pin).emit('live_leaderboard_update', sortedLeaderboard);
            }
        }
    });


    socket.on('request_end_game', (pin) => {
        io.to(pin).emit('end_game_requested', "Host đã dừng game!");
    });


    socket.on('trigger_end_game', (pin) => {
        io.to(pin).emit('game_ended', "Hết giờ!");
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