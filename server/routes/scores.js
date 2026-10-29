const router = require('express').Router();
const User = require('../models/User');
const { verifyToken } = require('../verifyToken');

// API LƯU ĐIỂM (Cả chế độ thường & Thử thách tuần)
router.post('/score', verifyToken, async (req, res) => {
    try {
        const { username, score, setId, setTitle, isWeekly } = req.body;
        const targetUsername = username || req.user.username;
        const user = await User.findOne({ username: targetUsername });
        
        if (user) {
            const numericScore = Number(score) || 0;

            // Thêm vào lịch sử chơi chung
            user.playHistory.push({ score: numericScore, playedAt: new Date() });
            
            // Cập nhật kỷ lục cá nhân
            if (numericScore > (user.highScore || 0)) {
                user.highScore = numericScore;
            }

            // Nếu là thử thách tuần (Weekly Challenge)
            if (isWeekly) {
                if (numericScore > (user.weeklyScore || 0)) {
                    user.weeklyScore = numericScore;
                }
                user.weeklyHistory.push({
                    score: numericScore,
                    setId: setId || '',
                    setTitle: setTitle || 'Thử thách Tuần',
                    playedAt: new Date()
                });
            }
            
            await user.save();
            res.status(200).json({ 
                message: "Lưu điểm thành công!", 
                newHighScore: user.highScore,
                weeklyScore: user.weeklyScore 
            });
        } else {
            res.status(404).json("Không tìm thấy người dùng!");
        }
    } catch (err) {
        console.error("Lỗi lưu điểm:", err);
        res.status(500).json(err);
    }
});

// API LẤY BẢNG XẾP HẠNG (Weekly hoặc All-Time)
router.get('/leaderboard', async (req, res) => {
    try {
        const type = req.query.type || 'weekly'; // 'weekly' hoặc 'all'
        
        let sortQuery = { weeklyScore: -1 };
        if (type === 'all') {
            sortQuery = { highScore: -1 };
        }

        const leaderboard = await User.find()
            .select('username displayName fullName avatar role highScore weeklyScore')
            .sort(sortQuery)
            .limit(20);
            
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error("Lỗi lấy BXH:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
