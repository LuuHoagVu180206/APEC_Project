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
                { header: 'Độ khó', key: 'difficulty', width: 10 },
                { header: 'Giải thích', key: 'explanation', width: 35 }
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
                    difficulty: q.difficulty,
                    explanation: q.explanation || ''
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
                if (q.explanation) {
                    doc.moveDown(0.3);
                    doc.text(`* Giải thích: ${q.explanation}`);
                }
                
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

// =========================================================================
// AI SMART ASSIGNMENT DISCOVERY & AUTO SAVE TO STUDIO
// 1. SLM (qwen2.5:7b) phân tích yêu cầu (môn học, chủ đề, từ khóa)
// 2. Database truy xuất các bộ đề công khai liên quan (tối ưu qua Index, không brute force)
// 3. SLM đánh giá tên gọi và nội dung bộ đề để xác nhận mức độ phù hợp
// 4. Backend tự động lưu các bộ đề đạt tiêu chí vào Studio (user.savedSets)
// 5. Chat AI trả lời đã tìm thấy và lưu bao nhiêu bộ đề, kèm danh sách kết quả
// =========================================================================
router.post('/ai-discovery', verifyToken, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) {
            return res.status(400).json({ message: "Vui lòng nhập yêu cầu tìm kiếm bằng ngôn ngữ tự nhiên!" });
        }

        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

        // -------------------------------------------------------------
        // BƯỚC 1: SLM (qwen2.5:7b) PHÂN TÍCH YÊU CẦU
        // -------------------------------------------------------------
        const analysisPrompt = `Bạn là hệ thống AI phân tích truy vấn học tập và đề thi.
Người dùng nhập: "${query.trim()}"
Nhiệm vụ: Trích xuất môn học chính (subject), chủ đề cụ thể (topic), khối lớp nếu có (grade), và danh sách từ khóa tìm kiếm (keywords).
Chỉ trả về DUY NHẤT một đối tượng JSON thuần túy có cấu trúc:
{
  "subject": "Tên môn học (ví dụ: Vật lý, Toán học, Tiếng Anh, Hoá học, Lịch sử, Tin học, Khác)",
  "topic": "Chủ đề cụ thể cốt lõi (ví dụ: Dao động điều hòa)",
  "grade": "Khối lớp nếu có (ví dụ: 12) hoặc null",
  "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3"]
}`;

        let queryAnalysis = {
            subject: 'Khác',
            topic: query.trim(),
            grade: null,
            keywords: [query.trim()]
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const ollamaRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollamaModel,
                    prompt: analysisPrompt,
                    stream: false,
                    format: 'json',
                    options: { temperature: 0.1, num_ctx: 4096 }
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (ollamaRes.ok) {
                const data = await ollamaRes.json();
                try {
                    const parsed = JSON.parse(data.response);
                    if (parsed && (parsed.subject || parsed.topic)) {
                        queryAnalysis = {
                            subject: parsed.subject || 'Khác',
                            topic: parsed.topic || query.trim(),
                            grade: parsed.grade || null,
                            keywords: Array.isArray(parsed.keywords) && parsed.keywords.length > 0 
                                ? parsed.keywords 
                                : [parsed.topic || query.trim()]
                        };
                    }
                } catch (pe) {
                    console.error("Lỗi parse JSON phân tích truy vấn:", pe);
                }
            }
        } catch (fetchErr) {
            console.warn("Cảnh báo: Không thể gọi SLM ở Bước 1, fallback sang trích xuất mặc định:", fetchErr.message);
        }

        // -------------------------------------------------------------
        // BƯỚC 2: DATABASE TRUY XUẤT CÁC BỘ ĐỀ CÔNG KHAI LIÊN QUAN
        // Tối ưu truy vấn: Sử dụng index QuestionSetSearchIndex và isPublic_1_topic_1 (Không Brute Force)
        // -------------------------------------------------------------
        const searchTerms = [
            queryAnalysis.subject !== 'Khác' ? queryAnalysis.subject : '',
            queryAnalysis.topic,
            ...(queryAnalysis.keywords || [])
        ].filter(k => k && k.trim()).map(k => k.trim());

        const textSearchString = searchTerms.join(' ');
        const candidateMap = new Map();

        // 2.1: Truy vấn qua Text Index (Tận dụng QuestionSetSearchIndex)
        if (textSearchString) {
            try {
                const textResults = await QuestionSet.find(
                    {
                        isPublic: true,
                        $text: { $search: textSearchString }
                    },
                    { score: { $meta: "textScore" } }
                )
                .sort({ score: { $meta: "textScore" } })
                .limit(15)
                .populate('owner', 'username');

                textResults.forEach(item => {
                    candidateMap.set(item._id.toString(), item);
                });
            } catch (textErr) {
                console.warn("Lỗi text index query, chuyển sang index topic filter:", textErr.message);
            }
        }

        // 2.2: Truy vấn bổ trợ qua Index isPublic_1_topic_1 nếu số lượng ứng viên < 10
        if (candidateMap.size < 10 && queryAnalysis.subject && queryAnalysis.subject !== 'Khác') {
            const topicResults = await QuestionSet.find({
                isPublic: true,
                topic: new RegExp(queryAnalysis.subject, 'i')
            })
            .sort({ likesCount: -1 })
            .limit(15)
            .populate('owner', 'username');

            topicResults.forEach(item => {
                if (!candidateMap.has(item._id.toString())) {
                    candidateMap.set(item._id.toString(), item);
                }
            });
        }

        // 2.3: Nếu vẫn ít hơn 5 ứng viên và có từ khóa chủ đề cụ thể
        if (candidateMap.size < 5 && queryAnalysis.topic) {
            const regexResults = await QuestionSet.find({
                isPublic: true,
                $or: [
                    { title: new RegExp(queryAnalysis.topic, 'i') },
                    { description: new RegExp(queryAnalysis.topic, 'i') }
                ]
            })
            .limit(10)
            .populate('owner', 'username');

            regexResults.forEach(item => {
                if (!candidateMap.has(item._id.toString())) {
                    candidateMap.set(item._id.toString(), item);
                }
            });
        }

        const candidates = Array.from(candidateMap.values()).slice(0, 15);

        // Trường hợp không tìm thấy bất kỳ ứng viên nào trong DB
        if (candidates.length === 0) {
            return res.status(200).json({
                message: `AI chưa tìm thấy bộ đề công khai nào phù hợp với yêu cầu: "${query}". Bạn có thể thử tìm với từ khóa tổng quát hơn hoặc vào Studio để tự tạo bộ đề mới nhé!`,
                queryAnalysis,
                stats: { totalFound: 0, newlySaved: 0, alreadySaved: 0 },
                matchedSets: [],
                savedSets: (await User.findById(req.user.id).select('savedSets'))?.savedSets || []
            });
        }

        // -------------------------------------------------------------
        // BƯỚC 3: SLM ĐÁNH GIÁ TÊN GỌI & CHỦ ĐỀ ĐỂ XÁC NHẬN MỨC ĐỘ PHÙ HỢP
        // -------------------------------------------------------------
        const candidatesForEvaluation = candidates.map((c, idx) => ({
            index: idx,
            id: c._id.toString(),
            title: c.title,
            topic: c.topic || 'Khác',
            description: c.description || ''
        }));

        const evalPrompt = `Bạn là chuyên gia thẩm định nội dung giáo dục.
Người dùng yêu cầu tìm kiếm: "${query.trim()}".
Môn học nhận diện: "${queryAnalysis.subject}", Chủ đề: "${queryAnalysis.topic}".
Dưới đây là danh sách ${candidatesForEvaluation.length} bộ đề ứng viên từ thư viện:
${JSON.stringify(candidatesForEvaluation, null, 2)}

Hãy thẩm định từng bộ đề dựa trên tên gọi, môn học và mô tả xem có phù hợp với yêu cầu của người dùng không.
Chỉ trả về DUY NHẤT một JSON hợp lệ có định dạng:
{
  "summary": "Tóm tắt ngắn gọn nhận xét (ví dụ: Đã tìm thấy các bộ đề phù hợp với yêu cầu ôn tập)",
  "results": [
    {
      "id": "mã_id_bộ_đề",
      "isRelevant": true,
      "confidence": 90,
      "reason": "Giải thích ngắn gọn 1 câu vì sao bộ đề này phù hợp hoặc không phù hợp"
    }
  ]
}`;

        let evaluationMap = new Map();
        let aiSummary = '';

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const evalRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollamaModel,
                    prompt: evalPrompt,
                    stream: false,
                    format: 'json',
                    options: { temperature: 0.1, num_ctx: 4096 }
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (evalRes.ok) {
                const evalData = await evalRes.json();
                try {
                    const parsedEval = JSON.parse(evalData.response);
                    aiSummary = parsedEval.summary || '';
                    if (Array.isArray(parsedEval.results)) {
                        parsedEval.results.forEach(r => {
                            if (r.id) {
                                evaluationMap.set(r.id.toString(), r);
                            }
                        });
                    }
                } catch (pe) {
                    console.error("Lỗi parse JSON thẩm định SLM:", pe);
                }
            }
        } catch (evalErr) {
            console.warn("Cảnh báo: Không thể gọi SLM thẩm định ở Bước 3, fallback sang matching quy tắc:", evalErr.message);
        }

        // Lọc các bộ đề đạt tiêu chí (SLM xác nhận isRelevant === true hoặc fallback khớp từ khóa)
        const qualifiedSets = [];
        for (const c of candidates) {
            const cId = c._id.toString();
            const evalResult = evaluationMap.get(cId);

            let isQualified = false;
            let reason = '';
            let confidence = 80;

            if (evalResult) {
                isQualified = Boolean(evalResult.isRelevant);
                reason = evalResult.reason || '';
                confidence = evalResult.confidence || 80;
            } else {
                // Heuristic Fallback nếu SLM không trả về kết quả cho id này
                const tLower = (c.title + ' ' + (c.topic || '')).toLowerCase();
                const subjLower = (queryAnalysis.subject || '').toLowerCase();
                const topicLower = (queryAnalysis.topic || '').toLowerCase();
                if ((topicLower && tLower.includes(topicLower)) || (subjLower && subjLower !== 'khác' && tLower.includes(subjLower))) {
                    isQualified = true;
                    reason = `Phù hợp theo chủ đề ${c.topic || queryAnalysis.subject}`;
                    confidence = 75;
                }
            }

            if (isQualified) {
                qualifiedSets.push({
                    _id: c._id,
                    title: c.title,
                    topic: c.topic,
                    description: c.description,
                    questionsCount: c.questions ? c.questions.length : 0,
                    owner: c.owner ? { _id: c.owner._id, username: c.owner.username } : null,
                    likesCount: c.likesCount || 0,
                    confidence,
                    matchReason: reason
                });
            }
        }

        if (qualifiedSets.length === 0) {
            return res.status(200).json({
                message: `AI đã tìm thấy một số bộ đề trong thư viện nhưng sau khi thẩm định kỹ nội dung, chưa có bộ đề nào thực sự phù hợp với yêu cầu: "${query}". Bạn có thể thử mô tả chi tiết hơn nhé!`,
                queryAnalysis,
                stats: { totalFound: 0, newlySaved: 0, alreadySaved: 0 },
                matchedSets: [],
                savedSets: (await User.findById(req.user.id).select('savedSets'))?.savedSets || []
            });
        }

        // -------------------------------------------------------------
        // BƯỚC 4: BACKEND TỰ ĐỘNG LƯU CÁC BỘ ĐỀ ĐẠT TIÊU CHÍ VÀO STUDIO CỦA HỌC SINH
        // -------------------------------------------------------------
        const user = await User.findById(req.user.id);
        const currentSaved = (user.savedSets || []).map(id => id.toString());
        let newlySavedCount = 0;
        let alreadySavedCount = 0;

        const matchedSetsWithStatus = qualifiedSets.map(set => {
            const setIdStr = set._id.toString();
            const isAlready = currentSaved.includes(setIdStr);
            if (isAlready) {
                alreadySavedCount++;
            } else {
                currentSaved.push(setIdStr);
                newlySavedCount++;
            }
            return {
                ...set,
                isNewlySaved: !isAlready,
                isAlreadySaved: isAlready
            };
        });

        if (newlySavedCount > 0) {
            user.savedSets = currentSaved;
            await user.save();
        }

        // -------------------------------------------------------------
        // BƯỚC 5: CHAT AI TRẢ LỜI ĐÃ TÌM THẤY VÀ LƯU BAO NHIÊU BỘ ĐỀ, KÈM DANH SÁCH KẾT QUẢ
        // -------------------------------------------------------------
        let aiMessage = '';
        if (newlySavedCount > 0 && alreadySavedCount > 0) {
            aiMessage = `AI đã tìm thấy ${qualifiedSets.length} bộ đề công khai phù hợp với yêu cầu "${queryAnalysis.topic || queryAnalysis.subject}". Hệ thống đã tự động lưu mới ${newlySavedCount} bộ đề vào Studio của bạn (${alreadySavedCount} bộ đề đã có sẵn từ trước).`;
        } else if (newlySavedCount > 0) {
            aiMessage = `AI đã tìm thấy ${qualifiedSets.length} bộ đề công khai phù hợp với yêu cầu "${queryAnalysis.topic || queryAnalysis.subject}" và đã tự động lưu toàn bộ vào Studio của bạn!`;
        } else {
            aiMessage = `AI đã tìm thấy ${qualifiedSets.length} bộ đề công khai phù hợp với yêu cầu "${queryAnalysis.topic || queryAnalysis.subject}". Tất cả các bộ đề này đã nằm sẵn trong Studio của bạn.`;
        }

        return res.status(200).json({
            message: aiMessage,
            summary: aiSummary,
            queryAnalysis,
            stats: {
                totalFound: qualifiedSets.length,
                newlySaved: newlySavedCount,
                alreadySaved: alreadySavedCount
            },
            matchedSets: matchedSetsWithStatus,
            savedSets: currentSaved
        });

    } catch (err) {
        console.error("LỖI AI SMART ASSIGNMENT DISCOVERY:", err);
        return res.status(500).json({ message: "Lỗi máy chủ khi thực hiện AI Smart Discovery", error: err.message });
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