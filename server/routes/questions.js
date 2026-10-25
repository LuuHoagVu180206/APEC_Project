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

// TẠO LỜI GIẢI THÍCH BẰNG AI LOCAL (Qwen2.5:7b)
router.post('/generate-explanation', verifyToken, async (req, res) => {
    try {
        const { questionText, options, correctAnswer, topic } = req.body;

        if (!questionText || !questionText.trim()) {
            return res.status(400).json("Vui lòng nhập nội dung câu hỏi trước khi tạo giải thích!");
        }

        if (!Array.isArray(options) || options.length < 4 || options.some(opt => !opt || !opt.trim())) {
            return res.status(400).json("Vui lòng nhập đầy đủ cả 4 đáp án (A, B, C, D) trước khi tạo giải thích!");
        }

        if (!correctAnswer) {
            return res.status(400).json("Vui lòng chọn đáp án đúng!");
        }

        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

        // Xác định nhãn A, B, C, D và nội dung đáp án đúng
        let correctLabel = 'A';
        let correctText = options[0];
        if (correctAnswer === 'A' || correctAnswer === options[0]) {
            correctLabel = 'A';
            correctText = options[0];
        } else if (correctAnswer === 'B' || correctAnswer === options[1]) {
            correctLabel = 'B';
            correctText = options[1];
        } else if (correctAnswer === 'C' || correctAnswer === options[2]) {
            correctLabel = 'C';
            correctText = options[2];
        } else if (correctAnswer === 'D' || correctAnswer === options[3]) {
            correctLabel = 'D';
            correctText = options[3];
        }

        const prompt = `Bạn là giáo viên chuyên môn ${topic ? `môn ${topic}` : 'giáo dục'}.
Dưới đây là một câu hỏi trắc nghiệm và đáp án đúng. Hãy viết lời giải thích ngắn gọn, sư phạm và chuẩn xác vì sao đáp án đúng là chính xác.

Nội dung câu hỏi:
${questionText.trim()}

Các lựa chọn:
A. ${options[0].trim()}
B. ${options[1].trim()}
C. ${options[2].trim()}
D. ${options[3].trim()}

Đáp án đúng là: ${correctLabel}. ${correctText.trim()}

Yêu cầu định dạng trả về:
- Trình bày trực tiếp lời giải thích và phân tích ngắn gọn, dễ hiểu.
- Không lặp lại nguyên văn đề bài.
- Không thêm câu mở đầu hoặc chào hỏi lan man (như "Chào bạn", "Tôi là trợ lý AI...").`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        let ollamaRes;
        try {
            ollamaRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollamaModel,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.3,
                        num_ctx: 4096
                    }
                }),
                signal: controller.signal
            });
        } catch (fetchErr) {
            clearTimeout(timeoutId);
            if (fetchErr.name === 'AbortError') {
                return res.status(504).json("Ollama phản hồi quá thời gian cho phép (timeout). Vui lòng thử lại!");
            }
            return res.status(503).json(`Không thể kết nối đến Ollama tại ${ollamaBaseUrl}. Vui lòng đảm bảo ứng dụng Ollama đã được khởi động!`);
        }
        clearTimeout(timeoutId);

        if (!ollamaRes.ok) {
            const errBody = await ollamaRes.text();
            return res.status(502).json(`Lỗi từ máy chủ AI Ollama: ${errBody}`);
        }

        const data = await ollamaRes.json();
        const explanation = (data.response || '').trim();

        if (!explanation) {
            return res.status(500).json("AI không tạo được nội dung giải thích. Vui lòng thử lại!");
        }

        res.status(200).json({ explanation });
    } catch (err) {
        console.error("Lỗi tạo giải thích AI:", err);
        res.status(500).json("Lỗi máy chủ khi tạo giải thích bằng AI.");
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
