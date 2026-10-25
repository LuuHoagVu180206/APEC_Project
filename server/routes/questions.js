const router = require('express').Router();
const Question = require('../models/Question');
const QuestionSet = require('../models/QuestionSet');
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

// XÓA CÂU HỎI (Hỗ trợ hệ thống Report & Quản lý của tác giả)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json("Không tìm thấy câu hỏi!");

        // question.owner là ObjectId trong MongoDB, trong khi req.user.id là String
        // Cần ép kiểu sang String (.toString()) để so sánh chính xác
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

        // Đồng thời loại bỏ câu hỏi khỏi các bộ đề đang chứa nó
        await QuestionSet.updateMany(
            { questions: req.params.id },
            { $pull: { questions: req.params.id } }
        );

        res.status(200).json("Đã xóa câu hỏi thành công!");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
