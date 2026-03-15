const express = require('express');
const router = express.Router();
const QuestionSet = require('../models/QuestionSet');
const { verifyToken } = require('../verifyToken'); // Lấy vệ sĩ ra để bảo vệ API

// 1. API TẠO BỘ CÂU HỎI MỚI (Chỉ người đã đăng nhập mới được tạo)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newSet = new QuestionSet({
            isPublic: req.body.isPublic || false,
            title: req.body.title,
            createdBy: req.user.id, // Vệ sĩ verifyToken đã nhét ID người dùng vào req.user
            questions: req.body.questions
        });

        const savedSet = await newSet.save();
        res.status(201).json(savedSet);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi tạo bộ câu hỏi", error: err });
    }
});

// 2. API LẤY DANH SÁCH BỘ CÂU HỎI CỦA RIÊNG TÔI
router.get('/my-sets', verifyToken, async (req, res) => {
    try {
        // Tìm trong DB tất cả các bộ có createdBy trùng với ID của người đang request
        const mySets = await QuestionSet.find({ createdBy: req.user.id })
                                        .sort({ createdAt: -1 }); // Xếp mới nhất lên đầu
        
        res.status(200).json(mySets);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu", error: err });
    }
});

// 3. API LẤY TẤT CẢ BỘ CÂU HỎI (Ai cũng xem được để chọn chơi)
router.get('/', async (req, res) => {
    try {
        // Lấy tất cả bộ câu hỏi, sắp xếp mới nhất lên đầu
        const allSets = await QuestionSet.find().sort({ createdAt: -1 });
        res.status(200).json(allSets);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy dữ liệu", error: err });
    }
});

router.get('/public', async (req, res) => {
    try {
        // Lấy các bộ isPublic = true, và dùng populate để "hỏi" luôn tên người tạo
        const publicSets = await QuestionSet.find({ isPublic: true })
                                            .populate('createdBy', 'username') 
                                            .sort({ createdAt: -1 });
        res.status(200).json(publicSets);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu public", error: err });
    }
});

// Thêm API COPY một bộ câu hỏi về kho của mình
router.post('/clone/:id', verifyToken, async (req, res) => {
    try {
        const originalSet = await QuestionSet.findById(req.params.id);
        if (!originalSet) return res.status(404).json("Không tìm thấy bộ câu hỏi!");

        const clonedSet = new QuestionSet({
            title: originalSet.title + " (Bản sao)",
            createdBy: req.user.id, // Đổi chủ sở hữu thành người đang bấm Copy
            isPublic: false,        // Bản sao mặc định là Private
            questions: originalSet.questions
        });

        await clonedSet.save();
        res.status(200).json("Đã copy thành công vào kho của bạn!");
    } catch (err) {
        res.status(500).json({ message: "Lỗi copy", error: err });
    }
});
module.exports = router;