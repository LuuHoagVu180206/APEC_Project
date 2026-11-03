const router = require('express').Router();
const User = require('../models/User');
const { verifyToken } = require('../verifyToken');

// API LƯU ĐIỂM (Cả chế độ thường & Thử thách tuần)
router.post('/score', verifyToken, async (req, res) => {
    try {
        const { username, score, setId, setTitle, isWeekly, timePlayed, questionsAnswered, roomType } = req.body;
        const targetUsername = username || req.user.username;
        const user = await User.findOne({ username: targetUsername });
        
        if (user) {
            const numericScore = Number(score) || 0;
            const numericTime = Number(timePlayed) || 0;
            const numericQuestions = Number(questionsAnswered) || 0;
            const mode = roomType || 'solo';

            // 1. MÀN CHƠI SOLO: Lưu vào lịch sử cá nhân và cập nhật kỷ lục cá nhân
            if (mode === 'solo') {
                if (!user.playHistory) user.playHistory = [];
                user.playHistory.push({
                    score: numericScore,
                    timePlayed: numericTime,
                    questionsAnswered: numericQuestions,
                    setId: setId || '',
                    setTitle: setTitle || 'Màn chơi Solo',
                    isWeekly: Boolean(isWeekly),
                    mode: 'solo',
                    playedAt: new Date()
                });

                // Cập nhật kỷ lục cá nhân toàn thời gian cho solo
                if (numericScore > (user.highScore || 0)) {
                    user.highScore = numericScore;
                }
            }
            // 2. MÀN CHƠI LỚP HỌC (CLASSROOM): Chỉ lưu vào lịch sử cá nhân, KHÔNG LƯU VÀO BXH WEEKLY HAY TOÀN THỜI GIAN
            else if (mode === 'classroom') {
                if (!user.playHistory) user.playHistory = [];
                user.playHistory.push({
                    score: numericScore,
                    timePlayed: numericTime,
                    questionsAnswered: numericQuestions,
                    setId: setId || '',
                    setTitle: setTitle || 'Phòng Lớp Học',
                    isWeekly: false,
                    mode: 'classroom',
                    playedAt: new Date()
                });
                // Tuyệt đối không cập nhật user.highScore và user.weeklyScore ở chế độ lớp học
            }

            // CHỈ KHI NÀO user chọn bộ câu hỏi weekly thì mới lưu vào điểm tuần và tính rank tuần
            if (isWeekly) {
                if (!user.weeklyHistory) user.weeklyHistory = [];
                if (numericScore > (user.weeklyScore || 0)) {
                    user.weeklyScore = numericScore;
                }
                user.weeklyHistory.push({
                    score: numericScore,
                    timePlayed: numericTime,
                    questionsAnswered: numericQuestions,
                    setId: setId || '',
                    setTitle: setTitle || 'Thử thách Tuần',
                    playedAt: new Date()
                });
            }
            
            await user.save();

            // Tính thứ hạng hiện tại của người chơi
            const weeklyRank = await User.countDocuments({ weeklyScore: { $gt: user.weeklyScore || 0 } }) + 1;
            const allTimeRank = await User.countDocuments({ highScore: { $gt: user.highScore || 0 } }) + 1;

            res.status(200).json({ 
                message: "Lưu điểm thành công!", 
                newHighScore: user.highScore,
                weeklyScore: user.weeklyScore,
                weeklyRank,
                allTimeRank
            });
        } else {
            res.status(404).json("Không tìm thấy người dùng!");
        }
    } catch (err) {
        console.error("Lỗi lưu điểm:", err);
        res.status(500).json(err);
    }
});

// API LẤY LỊCH SỬ MÀN CHƠI CÁ NHÂN (Solo & Lớp học)
router.get('/history', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('playHistory weeklyHistory highScore weeklyScore username displayName');
        if (!user) return res.status(404).json("Không tìm thấy người dùng!");
        
        // Sắp xếp màn chơi mới nhất lên đầu (gồm cả Solo và Lớp học)
        const personalHistory = (user.playHistory || [])
            .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

        res.status(200).json({
            history: personalHistory,
            highScore: user.highScore || 0,
            weeklyScore: user.weeklyScore || 0
        });
    } catch (err) {
        console.error("Lỗi lấy lịch sử chơi:", err);
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
