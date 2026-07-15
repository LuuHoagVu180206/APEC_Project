const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); 

const authRoute = require('./routes/auth');
const questionRoute = require('./routes/questions');

app.use('/api/auth', authRoute);
app.use('/api/questions', questionRoute);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));


app.get('/', (req, res) => {
    res.send('Server EduGame đang chạy ngon lành!');
});


app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});