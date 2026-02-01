const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Lưu điểm cao nhất từng chơi
    highScore: { type: Number, default: 0 },
    // Lưu lịch sử chi tiết các lần chơi
    playHistory: [
        {
            score: Number,
            playedAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true }); // Tự động tạo ngày tạo/ngày sửa

module.exports = mongoose.model('User', UserSchema);