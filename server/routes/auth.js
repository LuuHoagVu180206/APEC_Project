const router = require('express').Router();
const User = require('../models/User');

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password, // Lưu ý: Thực tế nên mã hóa password
        });
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json("User not found");
        
        if (user.password !== req.body.password) {
            return res.status(400).json("Wrong password");
        }
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LƯU ĐIỂM SỐ (Dùng cho Game gọi)
router.post('/score', async (req, res) => {
    try {
        const { username, score } = req.body;
        const user = await User.findOne({ username });
        
        if (user) {
            // Thêm vào lịch sử chơi
            user.playHistory.push({ score });
            
            // Cập nhật điểm cao nhất nếu phá kỷ lục
            if (score > user.highScore) {
                user.highScore = score;
            }
            
            await user.save();
            res.status(200).json({ message: "Score saved", newHighScore: user.highScore });
        } else {
            res.status(404).json("User not found");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// API LẤY BẢNG XẾP HẠNG (TOP 10)
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await User.find()
            .select('username highScore') // Chỉ lấy tên và điểm
            .sort({ highScore: -1 })      // Sắp xếp giảm dần (-1)
            .limit(10);                   // Lấy 10 người
            
        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
