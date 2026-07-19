const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

app.use('/api/sets', setRoute);
app.use('/api/auth', authRoute);
app.use('/api/questions', questionRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/scores', scoreRoute);
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

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});