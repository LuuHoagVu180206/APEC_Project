const router = require('express').Router();
const Question = require('../models/Question');

// LẤY CÂU HỎI (Có chức năng lọc)
router.get('/', async (req, res) => {
    try {
        // 1. Xem người dùng có gửi yêu cầu lọc độ khó không?
        // Ví dụ: GET /api/questions?level=hard
        const level = req.query.level; 

        let query = {}; // Mặc định là lấy hết
        
        // Nếu có yêu cầu 'level', ta thêm điều kiện lọc
        if (level) {
            query = { difficulty: level };
        }

        // 2. Tìm trong Database với điều kiện lọc
        const questions = await Question.find(query);
        
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json(err);
    }
});

// THÊM CÂU HỎI MỚI (Dùng cho trang Admin sau này)
router.post('/', async (req, res) => {
    try {
        const newQuestion = new Question(req.body);
        const savedQuestion = await newQuestion.save();
        res.status(200).json(savedQuestion);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.status(200).json("Đã xóa câu hỏi thành công!");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;