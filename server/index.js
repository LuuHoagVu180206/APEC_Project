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

app.use('/api/sets', setRoute);
app.use('/api/auth', authRoute);
app.use('/api/questions', questionRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/scores', scoreRoute);
app.use('/api/users', userRoute);

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


    socket.on('join_lobby', (data) => {
        const pin = data.pin;
        if (lobbies[pin]) {
            socket.join(pin);
            lobbies[pin].players.push({ id: socket.id, name: data.playerName });
            
            socket.emit('join_success', "OK");
            io.to(pin).emit('players_update', lobbies[pin].players); 
        } else {
            socket.emit('error', "Phòng không tồn tại!"); 
        }
    });

    socket.on('start_game', (pin) => {
        io.to(pin).emit('game_started', "GO!");
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