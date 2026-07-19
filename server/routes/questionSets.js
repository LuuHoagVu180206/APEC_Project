const router = require('express').Router();
const QuestionSet = require('../models/QuestionSet');
const User = require('../models/User');
const { verifyToken } = require('../verifyToken');

// 1. TẠO BỘ CÂU HỎI MỚI (Chỉ User mới được tạo)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newSet = new QuestionSet({
            ...req.body,
            owner: req.user.id // Gắn thẻ chủ sở hữu lấy từ Token
        });
        const savedSet = await newSet.save();
        res.status(200).json(savedSet);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. LẤY DANH SÁCH THƯ VIỆN CỘNG ĐỒNG (Ai cũng xem được)
// Chỉ lấy những bộ câu hỏi được đánh dấu là isPublic: true
router.get('/library', async (req, res) => {
    try {
        const publicSets = await QuestionSet.find({ isPublic: true })
            .populate('owner', 'username') // Kéo thêm tên người tạo để hiển thị
            .sort({ likesCount: -1 });     // Sắp xếp theo lượt thích giảm dần
        res.status(200).json(publicSets);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. LẤY BỘ CÂU HỎI CỦA RIÊNG TÔI (Dùng cho trang Studio)
router.get('/my-sets', verifyToken, async (req, res) => {
    try {
        const mySets = await QuestionSet.find({ owner: req.user.id });
        res.status(200).json(mySets);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 4. XÓA BỘ CÂU HỎI (Chủ sở hữu hoặc Admin mới được xóa)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.id);
        if (!qSet) return res.status(404).json("Không tìm thấy bộ câu hỏi!");

        const isOwner = qSet.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json("Bạn không có quyền xóa bộ câu hỏi này!");
        }

        await QuestionSet.findByIdAndDelete(req.params.id);
        res.status(200).json("Đã xóa bộ câu hỏi thành công!");
    } catch (err) {
        res.status(500).json(err);
    }
});

// 5. THÍCH / BỎ THÍCH BỘ CÂU HỎI (Dành cho User)
router.put('/:id/like', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        // Kiểm tra xem User đã lưu bộ này chưa
        if (!user.savedSets.includes(qSet._id)) {
            // Chưa thích -> Thích
            await user.updateOne({ $push: { savedSets: qSet._id } });
            await qSet.updateOne({ $inc: { likesCount: 1 } });
            res.status(200).json("Đã thích bộ câu hỏi!");
        } else {
            // Đã thích -> Bỏ thích
            await user.updateOne({ $pull: { savedSets: qSet._id } });
            await qSet.updateOne({ $inc: { likesCount: -1 } });
            res.status(200).json("Đã bỏ thích bộ câu hỏi!");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// 6. XUẤT FILE (Tính năng chờ - Trả về mốc thông báo)
router.get('/:id/export', async (req, res) => {
    const fileType = req.query.type; // Nhận 'excel', 'pdf', hoặc 'csv'
    // Ở đây sau này ta sẽ dùng các thư viện như exceljs, pdfkit để tạo file
    res.status(200).json({ 
        message: `Hệ thống đã nhận lệnh xuất file ${fileType}. Tính năng này đang được phát triển!` 
    });
});

router.put('/:setId/add-question', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.setId);
        if (!qSet) return res.status(404).json("Không tìm thấy bộ câu hỏi!");

        // 1. Kiểm tra quyền sở hữu
        if (qSet.owner.toString() !== req.user.id) {
            return res.status(403).json("Bạn không có quyền sửa bộ câu hỏi này!");
        }

        // 2. Nhét ID của câu hỏi vào mảng questions của Bộ (chỉ nhét nếu chưa có)
        if (!qSet.questions.includes(req.body.questionId)) {
            await qSet.updateOne({ $push: { questions: req.body.questionId } });
            res.status(200).json("Đã thêm câu hỏi vào bộ thành công!");
        } else {
            res.status(400).json("Câu hỏi đã nằm sẵn trong bộ này rồi!");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});
module.exports = router;