const router = require('express').Router();
const Question = require('../models/Question');
const { verifyToken } = require('../verifyToken');

// LẤY CÂU HỎI (Có chức năng lọc)
router.get('/', async (req, res) => {
    try {
        const level = req.query.level; 
        let query = {}; 
        
        if (level) {
            query = { difficulty: level };
        }

        const questions = await Question.find(query);
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LẤY DANH SÁCH CÂU HỎI DO CHÍNH NGƯỜI DÙNG TẠO
router.get('/mine', verifyToken, async (req, res) => {
    try {
        const questions = await Question.find({ owner: req.user.id }).sort({ _id: -1 });
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json(err);
    }
});

// THÊM CÂU HỎI MỚI
router.post('/', verifyToken, async (req, res) => {
    try {
        const questionData = {
            ...req.body,
            owner: req.user.id
        };
        const newQuestion = new Question(questionData);
        const savedQuestion = await newQuestion.save();
        res.status(200).json(savedQuestion);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CẬP NHẬT CÂU HỎI (Chủ sở hữu hoặc Admin)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json("Không tìm thấy câu hỏi!");

        const isOwner = question.owner && question.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json("Bạn không có quyền chỉnh sửa câu hỏi này!");
        }

        const { questionText, topic, options, correctAnswer, difficulty } = req.body;
        if (questionText !== undefined) question.questionText = String(questionText).trim();
        if (topic !== undefined) question.topic = String(topic).trim();
        if (options !== undefined) question.options = options;
        if (correctAnswer !== undefined) question.correctAnswer = String(correctAnswer).trim();
        if (difficulty !== undefined) question.difficulty = difficulty;

        const updated = await question.save();
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json(err);
    }
});

// XÓA CÂU HỎI (Hỗ trợ hệ thống Report)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json("Không tìm thấy câu hỏi!");

        const isOwner = question.owner && question.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json("Bạn không có quyền xóa câu hỏi này!");
        }

        // BƯỚC ĐỆM CHO HỆ THỐNG REPORT TƯƠNG LAI:
        // Nếu là Admin đi xóa bài của người khác, ta sẽ thu thập lý do
        if (isAdmin && !isOwner) {
            const reason = req.body.reason || "Vi phạm tiêu chuẩn cộng đồng";
            console.log(`[HỆ THỐNG KIỂM DUYỆT] Admin đã xóa câu hỏi: "${question.questionText}". Lý do: ${reason}`);
        }

        await Question.findByIdAndDelete(req.params.id);
        res.status(200).json("Đã xóa câu hỏi thành công!");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
