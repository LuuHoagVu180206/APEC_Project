const router = require('express').Router();
const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');
const User = require('../models/User');
const TeacherClass = require('../models/TeacherClass');
const SchoolMember = require('../models/SchoolMember');
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
    const assistantClass = currentUser?.role === 'user'
        ? await TeacherClass.findOne({ questionSets: questionSetId, teachers: tokenUser.id }).select('school')
        : null;
    const isClassAssistant = Boolean(assistantClass)
        && (!assistantClass.school || await SchoolMember.exists({ school: assistantClass.school, user: tokenUser.id }));
    if (!currentUser || (currentUser.role === 'user' && !isClassAssistant)) {
        res.status(403).json('Student chỉ được xem số lượng question set trong lớp!');
        return false;
    }
    return true;
};

// 1. TẠO BỘ CÂU HỎI MỚI (Chỉ User mới được tạo)
router.post('/', verifyToken, async (req, res) => {
    try {
        const creator = await User.findById(req.user.id).select('username displayName role');
        const authorName = (creator?.displayName && creator.displayName.trim()) 
            ? creator.displayName.trim() 
            : (creator?.username || '');
        const isPublic = Boolean(req.body.isPublic);
        // Cơ chế ẩn danh chỉ khả dụng khi bộ câu hỏi được chọn public
        const isAnonymous = isPublic ? Boolean(req.body.isAnonymous) : false;

        const newSet = new QuestionSet({
            ...req.body,
            authorName: req.body.authorName || authorName,
            isAnonymous,
            isPublic,
            owner: req.user.id // Gắn thẻ chủ sở hữu lấy từ Token
        });
        const savedSet = await newSet.save();
        await QuestionSet.findByIdAndUpdate(req.params.id, { $inc: { copyCount: 1 } });
        await savedSet.populate('owner', 'username displayName avatar role');
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
            .populate('owner', 'username displayName avatar role')
            .sort({ isDefault: -1, isWeekly: -1, likesCount: -1, createdAt: -1 });
        res.status(200).json(publicSets);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LẤY CÁC BỘ CÂU HỎI THỬ THÁCH TUẦN (WEEKLY CHALLENGES)
router.get('/weekly', async (req, res) => {
    try {
        const weeklySets = await QuestionSet.find({ isWeekly: true, isPublic: true })
            .populate('owner', 'username displayName avatar role')
            .sort({ weekNumber: 1 });
        res.status(200).json(weeklySets);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LẤY CÁC BỘ CÂU HỎI MẶC ĐỊNH CHÍNH THỨC CỦA APEC GROUP
router.get('/defaults', async (req, res) => {
    try {
        const defaultSets = await QuestionSet.find({ isDefault: true, isWeekly: { $ne: true }, isPublic: true })
            .populate('owner', 'username displayName avatar role')
            .sort({ createdAt: 1 });
        res.status(200).json(defaultSets);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. LẤY BỘ CÂU HỎI CỦA RIÊNG TÔI (Dùng cho trang Studio)
router.get('/my-sets', verifyToken, async (req, res) => {
    try {
        const mySets = await QuestionSet.find({ owner: req.user.id })
            .populate('owner', 'username displayName avatar role')
            .sort({ createdAt: -1 });
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

// 5. CẬP NHẬT BỘ CÂU HỎI (Chủ sở hữu hoặc Admin - hỗ trợ toggle public, anonymous, tên...)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.id);
        if (!qSet) return res.status(404).json("Không tìm thấy bộ câu hỏi!");

        const isOwner = qSet.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json("Bạn không có quyền sửa bộ câu hỏi này!");
        }

        if (req.body.title !== undefined) qSet.title = req.body.title;
        if (req.body.description !== undefined) qSet.description = req.body.description;
        if (req.body.topic !== undefined) qSet.topic = req.body.topic;
        if (req.body.isPublic !== undefined) qSet.isPublic = Boolean(req.body.isPublic);
        if (req.body.isAnonymous !== undefined) {
            // Cơ chế ẩn danh chỉ khả dụng khi bộ câu hỏi công khai
            qSet.isAnonymous = qSet.isPublic ? Boolean(req.body.isAnonymous) : false;
        }

        const user = await User.findById(qSet.owner).select('username displayName');
        if (user && !qSet.isDefault && user.username !== 'APEC Group') {
            qSet.authorName = (user.displayName && user.displayName.trim()) ? user.displayName.trim() : user.username;
        }

        const updatedSet = await qSet.save();
        await updatedSet.populate('owner', 'username displayName avatar role');
        res.status(200).json(updatedSet);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 6. THÍCH / BỎ THÍCH BỘ CÂU HỎI (Dành cho User)
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

// 7. XUẤT FILE
router.get('/:id/export', async (req, res) => {
    try {
        const type = req.query.type; // Nhận 'excel' hoặc 'pdf' từ URL
        
        // 1. Tìm bộ câu hỏi trong DB
        const set = await QuestionSet.findById(req.params.id);
        if (!set) return res.status(404).json("Không tìm thấy bộ câu hỏi!");
        if (!await canViewClassQuestionSet(req, res, set._id)) return;

        // 2. Lấy danh sách toàn bộ câu hỏi nằm trong bộ này
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
        
        // (Phần PDF)
        if (type === 'pdf') {
            const PDFDocument = require('pdfkit');
            
            const doc = new PDFDocument({ margin: 50 });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Bo_Cau_Hoi_${set.title}.pdf`);

            doc.pipe(res);
            doc.font('./fonts/Lora-VariableFont_wght.ttf'); 

            // Tiêu đề
            doc.fontSize(20).text(`BỘ CÂU HỎI: ${set.title}`, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Mô tả: ${set.description || 'Không có'}`, { align: 'center', color: 'grey' });
            doc.moveDown(2);

            doc.fillColor('black');

            questions.forEach((q, index) => {
                doc.fontSize(14).text(`Câu ${index + 1}: ${q.questionText}`);
                doc.fontSize(12).moveDown(0.5);
                
                doc.text(`A. ${q.options[0]}`);
                doc.text(`B. ${q.options[1]}`);
                doc.text(`C. ${q.options[2]}`);
                doc.text(`D. ${q.options[3]}`);
                
                doc.moveDown(0.5);
                doc.text(`=> Đáp án đúng: ${q.correctAnswer}  |  Độ khó: ${q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'medium' ? 'Trung bình' : 'Khó'}`);
                
                doc.moveDown(1);
                doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(1);
            });

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
        if (qSet.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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

// Thêm hàng loạt câu hỏi có sẵn vào bộ đề
router.put('/:setId/add-questions', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.setId);
        if (!qSet) return res.status(404).json({ message: "Không tìm thấy bộ câu hỏi!" });

        if (qSet.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Bạn không có quyền sửa bộ câu hỏi này!" });
        }

        const { questionIds } = req.body;
        if (!Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({ message: "Vui lòng chọn ít nhất một câu hỏi!" });
        }

        const currentIds = qSet.questions.map(q => q.toString());
        const newIds = questionIds.filter(qId => !currentIds.includes(String(qId)));

        if (newIds.length > 0) {
            qSet.questions.push(...newIds);
            await qSet.save();
        }

        const updatedQuestions = await Question.find({ _id: { $in: qSet.questions } });
        res.status(200).json({ 
            message: `Đã thêm thành công ${newIds.length} câu hỏi vào bộ đề!`,
            set: qSet,
            questions: updatedQuestions 
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// 8. API: XEM CHI TIẾT 1 BỘ CÂU HỎI KÈM DANH SÁCH CÂU HỎI
router.get('/:id', async (req, res) => {
    try {
        const set = await QuestionSet.findById(req.params.id).populate('owner', 'username displayName avatar role');
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


// 9. XÓA CÂU HỎI KHỎI BỘ CÂU HỎI (Chủ sở hữu hoặc Admin)
router.put('/:setId/remove-question', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.setId);
        if (!qSet) return res.status(404).json("Không tìm thấy bộ câu hỏi!");

        const isOwner = qSet.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json("Bạn không có quyền sửa bộ câu hỏi này!");
        }

        const questionId = req.body.questionId;
        if (!questionId) return res.status(400).json("Thiếu questionId!");

        qSet.questions = qSet.questions.filter(q => q.toString() !== questionId.toString());
        await qSet.save();

        res.status(200).json({ message: "Đã xóa câu hỏi khỏi bộ thành công!", questions: qSet.questions });
    } catch (err) {
        console.error("Lỗi xóa câu hỏi khỏi bộ:", err);
        res.status(500).json(err);
    }
});

// 10. TẠO CÂU HỎI MỚI TRỰC TIẾP TRONG BỘ (Chủ sở hữu hoặc Admin)
router.post('/:setId/questions', verifyToken, async (req, res) => {
    try {
        const qSet = await QuestionSet.findById(req.params.setId);
        if (!qSet) return res.status(404).json("Không tìm thấy bộ câu hỏi!");

        const isOwner = qSet.owner.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json("Bạn không có quyền thêm câu hỏi vào bộ này!");
        }

        const { questionText, options, correctAnswer, difficulty, topic } = req.body;
        if (!questionText || !options || !correctAnswer) {
            return res.status(400).json("Vui lòng nhập đầy đủ nội dung câu hỏi, 4 phương án và đáp án đúng!");
        }

        const newQuestion = new Question({
            questionText: String(questionText).trim(),
            options: Array.isArray(options) ? options : [options.A, options.B, options.C, options.D],
            correctAnswer: String(correctAnswer).trim(),
            difficulty: difficulty || 'easy',
            topic: topic || qSet.topic || 'Khác',
            owner: req.user.id
        });

        const savedQuestion = await newQuestion.save();
        qSet.questions.push(savedQuestion._id);
        await qSet.save();

        res.status(201).json({ question: savedQuestion, set: qSet });
    } catch (err) {
        console.error("Lỗi tạo câu hỏi cho bộ:", err);
        res.status(500).json(err);
    }
});

// 11. SAO CHÉP BỘ CÂU HỎI CỦA NGƯỜI KHÁC VỀ ACC CỦA MÌNH
router.post('/:id/copy', verifyToken, async (req, res) => {
    try {
        const originalSet = await QuestionSet.findById(req.params.id);
        if (!originalSet) return res.status(404).json("Không tìm thấy bộ câu hỏi nguồn!");

        // Không cho phép sao chép bộ câu hỏi của chính mình
        if (originalSet.owner.toString() === req.user.id) {
            return res.status(400).json("Bạn không thể sao chép bộ câu hỏi của chính mình!");
        }

        const user = await User.findById(req.user.id).select('username displayName');
        const authorName = (user?.displayName && user.displayName.trim()) ? user.displayName.trim() : (user?.username || '');

        // Lấy tất cả câu hỏi của bộ gốc để nhân bản
        const originalQuestions = await Question.find({ _id: { $in: originalSet.questions } });

        const clonedQuestionIds = [];
        for (const q of originalQuestions) {
            const clonedQ = new Question({
                questionText: q.questionText,
                options: [...q.options],
                correctAnswer: q.correctAnswer,
                difficulty: q.difficulty,
                topic: q.topic,
                owner: req.user.id
            });
            const savedQ = await clonedQ.save();
            clonedQuestionIds.push(savedQ._id);
        }

        // Tạo bộ câu hỏi mới có affix "-copy", private, thuộc về user hiện tại
        const newTitle = `${originalSet.title} - copy`;
        const newSet = new QuestionSet({
            title: newTitle,
            description: originalSet.description || '',
            topic: originalSet.topic || 'Khác',
            owner: req.user.id,
            questions: clonedQuestionIds,
            isPublic: false,      // Nằm trong studio dưới dạng private
            likesCount: 0,
            isDefault: false,
            isWeekly: false,
            badge: '',
            authorName: authorName,
            isAnonymous: false
        });

        const savedSet = await newSet.save();
        await savedSet.populate('owner', 'username displayName avatar role');

        res.status(201).json({
            message: "Đã sao chép bộ câu hỏi về Góc Sáng Tạo thành công!",
            set: savedSet
        });
    } catch (err) {
        console.error("Lỗi copy bộ câu hỏi:", err);
        res.status(500).json("Lỗi máy chủ khi sao chép bộ câu hỏi!");
    }
});


// 12. GHI NHẬN LƯỢT CHƠI BỘ CÂU HỎI (Solo hoặc Multiplayer phòng chung)
router.post('/:id/play', async (req, res) => {
    try {
        const { mode } = req.body; // 'solo' hoặc 'multiplayer'
        const isMulti = mode === 'multiplayer';
        const incFields = {
            playCount: 1,
            ...(isMulti ? { playCountMultiplayer: 1 } : { playCountSolo: 1 })
        };
        await QuestionSet.findByIdAndUpdate(req.params.id, { $inc: incFields });
        res.status(200).json({ success: true, message: 'Đã cập nhật lượt chơi thành công!' });
    } catch (err) {
        console.error('Lỗi cập nhật lượt chơi:', err);
        res.status(500).json(err);
    }
});

module.exports = router;

