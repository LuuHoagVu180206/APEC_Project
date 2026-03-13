// 1. Khai báo các thư viện cần dùng
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Đọc file .env

// 2. Khởi tạo App
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Middleware (Bộ lọc)
app.use(cors()); // Cho phép React (port 3000) gọi sang Server (port 5000)
app.use(express.json()); // Cho phép Server đọc dữ liệu JSON gửi lên

const authRoute = require('./routes/auth');
const questionRoute = require('./routes/questions');
const settingsRoute = require('./routes/settings');

app.use('/api/auth', authRoute);
app.use('/api/questions', questionRoute);
app.use('/api/settings', settingsRoute);

// 4. Kết nối Database MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// 5. Tạo một Route kiểm tra (Test Route)
app.get('/', (req, res) => {
    res.send('Server EduGame đang chạy ngon lành!');
});

// 6. Bắt đầu lắng nghe
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});