const router = require('express').Router();
const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');
const User = require('../models/User');
const TeacherClass = require('../models/TeacherClass');
const jwt = require('jsonwebtoken');
const excelJS = require('exceljs');
const { verifyToken } = require('../verifyToken');

const canViewClassQuestionSet = async (req, res, questionSetId) => {
    const isUsedInClass = await TeacherClass.exists({ questionSets: questionSetId });
    if (!isUsedInClass) return true;

    const token = req.headers.token;
    if (!token) {
        res.status(401).json('Cần đăng nhập để xem question set của lớp!');
        return false;
    }

    let tokenUser;
    try {
        tokenUser = jwt.verify(token, process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_server');
    } catch (err) {
        res.status(401).json('Token không hợp lệ!');
        return false;
    }

    const currentUser = await User.findById(tokenUser.id).select('role');
    if (!currentUser || currentUser.role === 'user') {
        res.status(403).json('Student chỉ được xem số lượng question set trong lớp!');
        return false;
    }
    return true;
};

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
    try {
        const type = req.query.type; // Nhận 'excel' hoặc 'pdf' từ URL
        
        // 1. Tìm bộ câu hỏi trong DB
        const set = await QuestionSet.findById(req.params.id);
        if (!set) return res.status(404).json("Không tìm thấy bộ câu hỏi!");
        if (!await canViewClassQuestionSet(req, res, set._id)) return;

        // 2. Lấy danh sách toàn bộ câu hỏi nằm trong bộ này
        // (Giả sử trong schema Set của bạn có lưu mảng questions chứa các ID câu hỏi)
        const questions = await Question.find({ _id: { $in: set.questions } });

        // ================= XỬ LÝ XUẤT EXCEL =================
        if (type === 'excel') {
            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet('Danh sách câu hỏi');

            // Tạo hàng tiêu đề (Header)
            worksheet.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'Câu hỏi', key: 'questionText', width: 40 },
                { header: 'Đáp án A', key: 'A', width: 20 },
                { header: 'Đáp án B', key: 'B', width: 20 },
                { header: 'Đáp án C', key: 'C', width: 20 },
                { header: 'Đáp án D', key: 'D', width: 20 },
                { header: 'Đáp án đúng', key: 'correct', width: 15 },
                { header: 'Độ khó', key: 'difficulty', width: 10 }
            ];

            // Đổ dữ liệu vòng lặp vào Excel
            questions.forEach((q, index) => {
                worksheet.addRow({
                    stt: index + 1,
                    questionText: q.questionText,
                    A: q.options[0],
                    B: q.options[1],
                    C: q.options[2],
                    D: q.options[3],
                    correct: q.correctAnswer,
                    difficulty: q.difficulty
                });
            });

            // Định dạng màu sắc cho hàng tiêu đề đẹp mắt (Tùy chọn)
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2980B9' } };

            // Gắn Header báo cho trình duyệt biết đây là một file tải về (Attachment)
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Bo_Cau_Hoi.xlsx`);

            // Đóng gói và gửi thẳng về Frontend
            return workbook.xlsx.write(res).then(() => {
                res.status(200).end();
            });
        }
        
        // (Phần PDF chúng ta sẽ ráp sau khi Excel chạy thành công)
        if (type === 'pdf') {
            const PDFDocument = require('pdfkit');
            const fs = require('fs');
            
            // Khởi tạo trang PDF
            const doc = new PDFDocument({ margin: 50 });

            // Báo cho trình duyệt biết đây là file PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Bo_Cau_Hoi_${set.title}.pdf`);

            // Truyền dữ liệu thẳng về Client
            doc.pipe(res);

            // Gắn Font tiếng Việt (Đường dẫn trỏ đến file .ttf bạn đã chuẩn bị ở Bước 2)
            // Nếu báo lỗi không tìm thấy font, hãy kiểm tra lại đường dẫn file này nhé!
            doc.font('./fonts/Lora-VariableFont_wght.ttf'); 

            // ================= BẮT ĐẦU VẼ PDF =================
            // Tiêu đề
            doc.fontSize(20).text(`BỘ CÂU HỎI: ${set.title}`, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Mô tả: ${set.description || 'Không có'}`, { align: 'center', color: 'grey' });
            doc.moveDown(2);

            // Đổi lại màu đen cho nội dung chính
            doc.fillColor('black');

            // In từng câu hỏi
            questions.forEach((q, index) => {
                doc.fontSize(14).text(`Câu ${index + 1}: ${q.questionText}`);
                doc.fontSize(12).moveDown(0.5);
                
                doc.text(`A. ${q.options[0]}`);
                doc.text(`B. ${q.options[1]}`);
                doc.text(`C. ${q.options[2]}`);
                doc.text(`D. ${q.options[3]}`);
                
                doc.moveDown(0.5);
                doc.text(`=> Đáp án đúng: ${q.correctAnswer}  |  Độ khó: ${q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó'}`);
                
                // Vẽ một đường kẻ ngang ngăn cách giữa các câu
                doc.moveDown(1);
                doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
            });

            // Kết thúc và đóng gói file
            doc.end();
            return;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Lỗi server khi xuất file");
    }
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

// API: XEM CHI TIẾT 1 BỘ CÂU HỎI KÈM DANH SÁCH CÂU HỎI
router.get('/:id', async (req, res) => {
    try {
        const set = await QuestionSet.findById(req.params.id);
        if (!set) return res.status(404).json("Không tìm thấy bộ câu hỏi!");
        if (!await canViewClassQuestionSet(req, res, set._id)) return;

        // Tìm tất cả các câu hỏi có ID nằm trong mảng questions của bộ này
        const questions = await Question.find({ _id: { $in: set.questions } });
        
        // Trả về cả vỏ (set) và ruột (questions)
        res.status(200).json({ set, questions });
    } catch (err) {
        console.error("LỖI TẢI CHI TIẾT BỘ:", err);
        res.status(500).json(err);
    }
});
module.exports = router;