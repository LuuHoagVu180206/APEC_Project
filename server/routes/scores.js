const router = require('express').Router();
const User = require('../models/User');
const { verifyToken } = require('../verifyToken');

router.post('/score', verifyToken, async (req, res) => {
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