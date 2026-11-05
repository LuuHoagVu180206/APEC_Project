const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const QuestionSet = require('../models/QuestionSet');
const { verifyToken } = require('../verifyToken');

// API LƯU ĐIỂM (Cả chế độ thường & Thử thách tuần)
router.post('/score', verifyToken, async (req, res) => {
    try {
        const { score, setId, setTitle, isWeekly, timePlayed, questionsAnswered, roomType } = req.body;
        const cleanSetId = (setId && setId !== 'null' && setId !== 'undefined') ? String(setId).trim() : '';
        const user = await User.findById(req.user.id);
        
        if (user) {
            const numericScore = Number(score) || 0;
            const numericTime = Number(timePlayed) || 0;
            const numericQuestions = Number(questionsAnswered) || 0;
            const mode = roomType || 'solo';
            if (!['solo', 'casual', 'classroom'].includes(mode)) return res.status(400).json('Chế độ chơi không hợp lệ!');

            // 1. MÀN CHƠI SOLO: Lưu vào lịch sử cá nhân và cập nhật kỷ lục cá nhân
            if (mode === 'solo' || mode === 'casual') {
                if (!user.playHistory) user.playHistory = [];
                const now = new Date();

                // Chống trùng lặp (Deduplication): nếu phiên chơi này vừa được ghi nhận trong 15s qua
                const recentDuplicateIndex = user.playHistory.findIndex(entry => {
                    const timeDiff = Math.abs(now - new Date(entry.playedAt));
                    return timeDiff < 15000 && 
                           entry.score === numericScore && 
                           (entry.setId === (setId || '') || !setId || !entry.setId) &&
                           entry.mode === mode;
                });

                if (recentDuplicateIndex !== -1) {
                    const existing = user.playHistory[recentDuplicateIndex];
                    if (numericTime > 0 && existing.timePlayed === 0) {
                        existing.timePlayed = numericTime;
                        existing.questionsAnswered = numericQuestions;
                    }
                    console.log(`[Scores] Bỏ qua ghi nhận trùng lặp session solo cho ${user.username} (score: ${numericScore})`);
                } else {
                    user.playHistory.push({
                        score: numericScore,
                        timePlayed: numericTime,
                        questionsAnswered: numericQuestions,
                        setId: cleanSetId,
                        setTitle: setTitle || (mode === 'casual' ? 'Phòng Chơi tự do' : 'Màn chơi Solo'),
                        isWeekly: mode === 'solo' && Boolean(isWeekly),
                        mode,
                        playedAt: now
                    });
                }

                // Cập nhật kỷ lục cá nhân toàn thời gian cho solo
                if (numericScore > (user.highScore || 0)) {
                    user.highScore = numericScore;
                }
            }
            // 2. MÀN CHƠI LỚP HỌC (CLASSROOM): Chỉ lưu vào lịch sử cá nhân, KHÔNG LƯU VÀO BXH WEEKLY HAY TOÀN THỜI GIAN
            else if (mode === 'classroom') {
                if (!user.playHistory) user.playHistory = [];
                const now = new Date();

                const recentClassIndex = user.playHistory.findIndex(entry => {
                    const timeDiff = Math.abs(now - new Date(entry.playedAt));
                    return timeDiff < 15000 && 
                           entry.score === numericScore && 
                           entry.mode === 'classroom';
                });

                if (recentClassIndex !== -1) {
                    const existing = user.playHistory[recentClassIndex];
                    if (numericTime > 0 && existing.timePlayed === 0) {
                        existing.timePlayed = numericTime;
                        existing.questionsAnswered = numericQuestions;
                    }
                } else {
                    user.playHistory.push({
                        score: numericScore,
                        timePlayed: numericTime,
                        questionsAnswered: numericQuestions,
                        setId: cleanSetId,
                        setTitle: setTitle || 'Phòng Lớp Học',
                        isWeekly: false,
                        mode: 'classroom',
                        playedAt: now
                    });
                }
            }

            // CHỈ KHI NÀO user chọn bộ câu hỏi weekly thì mới lưu vào điểm tuần và tính rank tuần
            if (mode === 'solo' && isWeekly) {
                if (!user.weeklyHistory) user.weeklyHistory = [];
                if (numericScore > (user.weeklyScore || 0)) {
                    user.weeklyScore = numericScore;
                }

                const now = new Date();
                const recentWeeklyIndex = user.weeklyHistory.findIndex(entry => {
                    const timeDiff = Math.abs(now - new Date(entry.playedAt));
                    return timeDiff < 15000 && 
                           entry.score === numericScore && 
                           (entry.setId === (setId || '') || !setId || !entry.setId);
                });

                if (recentWeeklyIndex !== -1) {
                    const existing = user.weeklyHistory[recentWeeklyIndex];
                    if (numericTime > 0 && existing.timePlayed === 0) {
                        existing.timePlayed = numericTime;
                        existing.questionsAnswered = numericQuestions;
                    }
                    console.log(`[Scores] Bỏ qua ghi nhận trùng lặp weeklyHistory cho ${user.username} (score: ${numericScore})`);
                } else {
                    user.weeklyHistory.push({
                        score: numericScore,
                        timePlayed: numericTime,
                        questionsAnswered: numericQuestions,
                        setId: cleanSetId,
                        setTitle: setTitle || 'Thử thách Tuần',
                        playedAt: now
                    });
                }
            }
            
            await user.save();

            // Tính thứ hạng hiện tại của người chơi
            const weeklyRank = await User.countDocuments({ weeklyScore: { $gt: user.weeklyScore || 0 } }) + 1;
            const allTimeRank = await User.countDocuments({ highScore: { $gt: user.highScore || 0 } }) + 1;

            if (cleanSetId && mongoose.Types.ObjectId.isValid(cleanSetId)) {
                const isMulti = mode !== 'solo';
                await QuestionSet.findByIdAndUpdate(cleanSetId, {
                    $inc: {
                        playCount: 1,
                        ...(isMulti ? { playCountMultiplayer: 1 } : { playCountSolo: 1 })
                    }
                }).catch(e => console.warn('Lỗi tăng playCount:', e));
            }
            res.status(200).json({ 
                message: "Lưu điểm thành công!", 
                newHighScore: user.highScore,
                weeklyScore: user.weeklyScore,
                weeklyRank,
                allTimeRank
            });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }
    } catch (err) {
        console.error("Lỗi lưu điểm:", err);
        res.status(500).json({ message: "Lỗi lưu điểm", error: err.message || String(err) });
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
        res.status(500).json({ message: "Lỗi lấy lịch sử chơi", error: err.message || String(err) });
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
        res.status(500).json({ message: "Lỗi lấy BXH", error: err.message || String(err) });
    }
});

module.exports = router;
