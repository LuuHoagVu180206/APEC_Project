const router = require('express').Router();
const Question = require('../models/Question');
const QuestionSet = require('../models/QuestionSet');
const { verifyToken } = require('../verifyToken');

// Hàm làm sạch lời giải thích để giải thích thẳng vào bản chất kiến thức,
// loại bỏ mọi cụm từ tham chiếu tới tài liệu đầu vào (vì học sinh không có tài liệu này khi làm quiz)
function cleanExplanationText(text) {
    if (!text || typeof text !== 'string') return '';
    let cleaned = text.trim();

    // Loại bỏ các đoạn mở đầu tham chiếu tài liệu văn bản hoặc hình ảnh/sơ đồ
    const patterns = [
        /^(?:Dựa vào|Theo|Dựa trên|Dựa theo|Từ|Căn cứ vào|Xét theo|Quan sát|Nhìn vào)\s+(?:đoạn trích|dữ liệu|tài liệu|văn bản|thông tin|bài đọc|hình ảnh|ảnh|hình vẽ|bức tranh|bức ảnh|sơ đồ|đồ thị|bảng biểu)(?:\s+(?:trên|đầu vào|đã cho|được cung cấp|gốc))?[,:\-–—\s]+/gi,
        /^(?:Theo như|Như đã nêu trong|Như đã đề cập trong|Theo nội dung của|Theo như hình|Theo sơ đồ|Theo đồ thị)\s+(?:đoạn trích|dữ liệu|tài liệu|văn bản|bài đọc|hình ảnh|hình vẽ|bức tranh|bức ảnh|ảnh)(?:\s+(?:trên|đầu vào|đã cho))?[,:\-–—\s]+/gi,
        /^(?:Trong tài liệu|Trong đoạn văn|Trong dữ liệu|Trong hình|Trong hình ảnh|Trong hình vẽ|Trong bức tranh|Trong bức ảnh|Trong sơ đồ|Trong đồ thị)(?:\s+(?:trên|đầu vào|đã cho|được cung cấp))?[,:\-–—\s]+/gi,
        /^(?:Vì theo|Bởi vì theo)\s+(?:đoạn trích|dữ liệu|tài liệu|văn bản|hình ảnh|hình vẽ|bức tranh|bức ảnh)(?:\s+(?:trên|đầu vào|đã cho))?[,:\-–—\s]+/gi
    ];

    for (const pat of patterns) {
        cleaned = cleaned.replace(pat, '');
    }

    // Viết hoa lại chữ cái đầu nếu sau khi replace thành chữ thường
    if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
}

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
- Trình bày trực tiếp bản chất kiến thức cốt lõi và phân tích ngắn gọn, dễ hiểu vì sao đáp án này đúng.
- Không lặp lại nguyên văn đề bài.
- Tuyệt đối không dùng các cụm từ như "Dựa vào dữ liệu đầu vào", "Theo đoạn trích trên", "Như đã đề cập".
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
        const explanation = cleanExplanationText((data.response || '').trim());

        if (!explanation) {
            return res.status(500).json("AI không tạo được nội dung giải thích. Vui lòng thử lại!");
        }

        res.status(200).json({ explanation });
    } catch (err) {
        console.error("Lỗi tạo giải thích AI:", err);
        res.status(500).json("Lỗi máy chủ khi tạo giải thích bằng AI.");
    }
});

// TẠO CÂU HỎI TRẮC NGHIỆM TỰ ĐỘNG TỪ DỮ LIỆU ĐẦU VÀO (AI Local Qwen2.5:7b)
router.post('/generate-from-context', verifyToken, async (req, res) => {
    try {
        const { context, numQuestions = 3, topic = 'Khác', difficulty = 'mixed' } = req.body;

        if (!context || !context.trim() || context.trim().length < 10) {
            return res.status(400).json("Vui lòng nhập đoạn tài liệu hoặc khái niệm kiến thức (tối thiểu 10 ký tự) để AI có cơ sở tạo câu hỏi!");
        }

        const count = Math.min(Math.max(parseInt(numQuestions, 10) || 3, 1), 10);
        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

        let difficultyGuide = "Đa dạng các mức độ (dễ, trung bình, khó)";
        if (difficulty === 'easy') difficultyGuide = "Mức độ dễ (nhận biết, thông hiểu)";
        else if (difficulty === 'medium') difficultyGuide = "Mức độ trung bình (thông hiểu, vận dụng)";
        else if (difficulty === 'hard') difficultyGuide = "Mức độ khó (vận dụng cao, phân tích)";

        const prompt = `Bạn là chuyên gia giáo dục biên soạn đề thi môn ${topic}.
Hãy đọc kỹ tài liệu kiến thức sau và tạo ra CHÍNH XÁC ${count} câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) kiểm tra kiến thức của bài học.
Kèm theo giải thích chi tiết vì sao đáp án đúng là chính xác.

TÀI LIỆU KIẾN THỨC NGUỒN:
"""
${context.trim()}
"""

YÊU CẦU BIÊN SOẠN BẮT BUỘC:
1. Số lượng câu hỏi: Đúng ${count} câu hỏi trắc nghiệm.
2. Mỗi câu hỏi gồm 4 phương án độc lập, không trùng lặp, không có đáp án vô nghĩa.
3. Độ khó: ${difficultyGuide}.
4. NGUYÊN TẮC GIẢI THÍCH ĐÁP ÁN (CỰC KỲ QUAN TRỌNG):
   - Học sinh khi làm bài quiz chỉ nhìn thấy đề bài và các phương án lựa chọn, HOÀN TOÀN KHÔNG CÓ đoạn tài liệu đầu vào này.
   - Do đó, lời giải thích (explanation) BẮT BUỘC phải GIẢI THÍCH THẲNG VÀO BẢN CHẤT KIẾN THỨC KHOA HỌC/ĐỊNH LÝ/ĐỊNH NGHĨA/CÔNG THỨC (giải thích khái niệm là gì, vì sao quy luật diễn ra như vậy, hoặc phương án khác sai ở điểm nào).
   - TUYỆT ĐỐI KHÔNG dùng các từ ngữ tham chiếu tài liệu như: "Dựa vào dữ liệu đầu vào", "Theo đoạn trích trên", "Theo tài liệu đã cho", "Dữ liệu cung cấp rằng", "Từ thông tin trên", "Như đoạn văn đã nêu", "Theo văn bản trên".
   - Viết lời giải thích trực tiếp, khách quan, tự nhiên như lời giảng giải của giáo viên đứng lớp.
5. Định dạng đầu ra: BẮT BUỘC chỉ trả về một đối tượng JSON hợp lệ duy nhất có cấu trúc:
{
  "questions": [
    {
      "questionText": "Nội dung câu hỏi trắc nghiệm?",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": "Nội dung đáp án đúng (khớp với 1 trong 4 lựa chọn)",
      "explanation": "Lời giải thích thẳng vào bản chất kiến thức, không nhắc đến tài liệu đầu vào",
      "difficulty": "easy"
    }
  ]
}
Lưu ý: Không viết bất kỳ văn bản nào ngoài JSON.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

        let ollamaRes;
        try {
            ollamaRes = await fetch(`${ollamaBaseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: ollamaModel,
                    prompt: prompt,
                    format: "json",
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
                return res.status(504).json("Ollama phản hồi quá thời gian cho phép (timeout). Vui lòng thử lại với số lượng câu hỏi ít hơn!");
            }
            return res.status(503).json(`Không thể kết nối đến Ollama tại ${ollamaBaseUrl}. Vui lòng đảm bảo ứng dụng Ollama đã được khởi động!`);
        }
        clearTimeout(timeoutId);

        if (!ollamaRes.ok) {
            const errBody = await ollamaRes.text();
            return res.status(502).json(`Lỗi từ máy chủ AI Ollama: ${errBody}`);
        }

        const data = await ollamaRes.json();
        const rawResponse = (data.response || '').trim();

        if (!rawResponse) {
            return res.status(500).json("AI không phản hồi dữ liệu. Vui lòng thử lại!");
        }

        let parsed;
        try {
            parsed = JSON.parse(rawResponse);
        } catch (e) {
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Không thể trích xuất JSON từ kết quả của AI");
            }
        }

        let rawQuestions = [];
        if (Array.isArray(parsed)) {
            rawQuestions = parsed;
        } else if (parsed && Array.isArray(parsed.questions)) {
            rawQuestions = parsed.questions;
        } else if (parsed && typeof parsed === 'object') {
            const possibleArr = Object.values(parsed).find(v => Array.isArray(v));
            if (possibleArr) rawQuestions = possibleArr;
        }

        if (!rawQuestions || rawQuestions.length === 0) {
            return res.status(500).json("AI không tạo được danh sách câu hỏi hợp lệ. Vui lòng thử lại!");
        }

        // Chuẩn hóa câu hỏi và làm sạch giải thích kiến thức độc lập
        const validQuestions = rawQuestions.map((q, idx) => {
            let opts = Array.isArray(q.options) ? q.options : Object.values(q.options || {});
            opts = opts.map(opt => typeof opt === 'string' ? opt.replace(/^[A-Da-d][\.\:\)\-]\s*/, '').trim() : String(opt));
            
            while (opts.length < 4) {
                opts.push(`Lựa chọn ${opts.length + 1}`);
            }
            opts = opts.slice(0, 4);

            let correct = typeof q.correctAnswer === 'string' ? q.correctAnswer.replace(/^[A-Da-d][\.\:\)\-]\s*/, '').trim() : '';
            if (['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
                const mapIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
                correct = opts[mapIdx] || opts[0];
            } else if (!opts.includes(correct)) {
                const found = opts.find(o => o.toLowerCase() === correct.toLowerCase());
                correct = found || opts[0];
            }

            let diff = (q.difficulty || 'medium').toLowerCase();
            if (!['easy', 'medium', 'hard'].includes(diff)) {
                diff = 'medium';
            }

            const rawExp = q.explanation || `Đáp án đúng là: ${correct}`;
            const cleanedExp = cleanExplanationText(rawExp);

            return {
                questionText: q.questionText || `Câu hỏi ${idx + 1} về ${topic}`,
                options: opts,
                correctAnswer: correct,
                explanation: cleanedExp || `Đáp án đúng là: ${correct}`,
                difficulty: diff,
                topic: topic || 'Khác'
            };
        });

        res.status(200).json({ questions: validQuestions });
    } catch (err) {
        console.error("Lỗi tạo câu hỏi từ tài liệu:", err);
        res.status(500).json("Lỗi máy chủ khi xử lý tạo câu hỏi bằng AI: " + (err.message || ''));
    }
});

// TẠO CÂU HỎI TRẮC NGHIỆM TỰ ĐỘNG TỪ HÌNH ẢNH (Vision-Language AI Qwen2-VL)
// Tuân thủ hướng dẫn và nguyên tắc sư phạm theo Nhiệm vụ 3 trong ModelFile
router.post('/generate-from-image', verifyToken, async (req, res) => {
    try {
        const { image, prompt: userPrompt, numQuestions = 3, topic = 'Khác', difficulty = 'mixed' } = req.body;

        if (!image || typeof image !== 'string' || !image.trim()) {
            return res.status(400).json('Vui lòng tải lên hoặc dán hình ảnh để AI có thể phân tích tạo đề!');
        }

        // Tách chuỗi base64 nếu có data url prefix (data:image/png;base64,...)
        let base64Image = image.trim();
        if (base64Image.includes(',')) {
            base64Image = base64Image.split(',')[1].trim();
        }

        const count = Math.min(Math.max(parseInt(numQuestions, 10) || 3, 1), 10);
        const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const candidateModels = [
            process.env.OLLAMA_VL_MODEL,
            'qwen2.5vl:7b',
            'qwen2-vl:7b'
        ].filter(Boolean);
        const ollamaVlNumCtx = parseInt(process.env.OLLAMA_VL_NUM_CTX, 10) || 16384;

        let difficultyGuide = 'Đa dạng các mức độ (dễ, trung bình, khó)';
        if (difficulty === 'easy') difficultyGuide = 'Mức độ dễ (nhận biết, thông hiểu)';
        else if (difficulty === 'medium') difficultyGuide = 'Mức độ trung bình (thông hiểu, vận dụng)';
        else if (difficulty === 'hard') difficultyGuide = 'Mức độ khó (vận dụng cao, phân tích)';

        let extraInstruction = '';
        if (userPrompt && userPrompt.trim()) {
            extraInstruction = '\nLƯU Ý / ĐỊNH HƯỚNG BỔ SUNG TỪ GIÁO VIÊN:\n"' + userPrompt.trim() + '"\n';
        }

        const prompt = 'Bạn là chuyên gia giáo dục biên soạn đề thi môn ' + topic + '.\n' +
            'Hãy quan sát kỹ hình ảnh được cung cấp (chứa bài tập, sơ đồ, đồ thị, hình vẽ thí nghiệm, sơ đồ mạch, tài liệu hoặc kiến thức học tập) và tạo ra CHÍNH XÁC ' + count + ' câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) kiểm tra kiến thức của học sinh.\n' +
            'Kèm theo giải thích chi tiết vì sao đáp án đúng là chính xác.' + extraInstruction + '\n\n' +
            'YÊU CẦU BIÊN SOẠN BẮT BUỘC (TUÂN THỦ NHIỆM VỤ 3 TRONG MODELFILE):\n' +
            '1. Số lượng câu hỏi: Đúng ' + count + ' câu hỏi trắc nghiệm.\n' +
            '2. Nội dung câu hỏi (questionText): Đề bài rõ ràng, chính xác và tự hoàn chỉnh. Nếu câu hỏi khai thác dữ kiện từ hình ảnh (như số liệu đồ thị, sơ đồ), hãy mô tả rõ ràng các dữ kiện cần thiết trong đề bài để học sinh có thể hiểu và làm bài độc lập.\n' +
            '3. Mỗi câu hỏi gồm đúng 4 phương án độc lập [A, B, C, D], không trùng lặp, không có phương án vô nghĩa.\n' +
            '4. Độ khó: ' + difficultyGuide + '.\n' +
            '5. NGUYÊN TẮC GIẢI THÍCH ĐÁP ÁN (CỰC KỲ QUAN TRỌNG - THEO ĐÚNG NHIỆM VỤ 3 MODELFILE):\n' +
            '   - Học sinh khi làm bài quiz chỉ nhìn thấy đề bài và các phương án lựa chọn, HOÀN TOÀN KHÔNG CÓ hình ảnh gốc.\n' +
            '   - Do đó, lời giải thích (explanation) BẮT BUỘC phải GIẢI THÍCH THẲNG VÀO BẢN CHẤT KIẾN THỨC KHOA HỌC / ĐỊNH LÝ / ĐỊNH NGHĨA / CÔNG THỨC / CÁC BƯỚC TÍNH TOÁN SUY LUẬN (vì sao đáp án đó đúng, công thức áp dụng là gì, hoặc chỉ ra điểm sai của các phương án còn lại).\n' +
            '   - TUYỆT ĐỐI KHÔNG dùng các cụm từ tham chiếu hình ảnh hay tài liệu nguồn như: "Dựa vào hình ảnh", "Theo hình ảnh trên", "Nhìn vào ảnh", "Theo hình vẽ", "Theo sơ đồ trên", "Dựa vào dữ liệu đầu vào", "Theo đoạn trích", "Từ thông tin cung cấp".\n' +
            '   - Trình bày trực tiếp, súc tích, dễ hiểu cho học sinh, không mở đầu bằng các câu chào hỏi lan man.\n' +
            '6. Định dạng đầu ra: BẮT BUỘC chỉ trả về một đối tượng JSON hợp lệ duy nhất có cấu trúc:\n' +
            JSON.stringify({
              questions: [
                {
                  questionText: 'Nội dung câu hỏi trắc nghiệm?',
                  options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
                  correctAnswer: 'Nội dung đáp án đúng (phải khớp chính xác với 1 trong 4 lựa chọn)',
                  explanation: 'Lời giải thích bản chất kiến thức độc lập, trực tiếp, không nhắc đến hình ảnh đầu vào',
                  difficulty: 'easy'
                }
              ]
            }, null, 2) + '\nLưu ý: Không viết bất kỳ văn bản nào ngoài JSON.';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        let ollamaRes;
        let lastErrorText = '';
        for (const modelName of candidateModels) {
            try {
                ollamaRes = await fetch(ollamaBaseUrl + '/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: modelName,
                        prompt: prompt,
                        images: [base64Image],
                        format: 'json',
                        stream: false,
                        options: {
                            temperature: 0.3,
                            num_ctx: ollamaVlNumCtx
                        }
                    }),
                    signal: controller.signal
                });

                if (ollamaRes.ok) break;
                lastErrorText = await ollamaRes.text();
            } catch (fetchErr) {
                if (fetchErr.name === 'AbortError') {
                    clearTimeout(timeoutId);
                    return res.status(504).json('Ollama phản hồi quá thời gian cho phép (timeout). Vui lòng thử lại với số lượng câu hỏi ít hơn hoặc ảnh nhẹ hơn!');
                }
                lastErrorText = fetchErr.message;
            }
        }
        clearTimeout(timeoutId);

        if (!ollamaRes || !ollamaRes.ok) {
            let cleanErr = lastErrorText;
            try {
                const parsed = JSON.parse(lastErrorText);
                if (parsed.error) cleanErr = parsed.error;
            } catch {}
            if (cleanErr && cleanErr.includes('exceeds the available context size')) {
                return res.status(400).json("Hình ảnh đầu vào có độ phân giải quá cao hoặc nhiều chi tiết vượt giới hạn token (" + cleanErr + "). Vui lòng thử lại với ảnh nhỏ gọn hơn hoặc cắt riêng vùng câu hỏi!");
            }
            return res.status(502).json('Lỗi từ máy chủ AI Ollama: ' + (cleanErr || 'Không thể kết nối đến Ollama hoặc model Qwen2-VL chưa sẵn sàng'));
        }

        const data = await ollamaRes.json();
        const rawResponse = (data.response || '').trim();

        if (!rawResponse) {
            return res.status(500).json('AI không phản hồi dữ liệu. Vui lòng thử lại!');
        }

        let parsed;
        try {
            parsed = JSON.parse(rawResponse);
        } catch (e) {
            const jsonMatch = rawResponse.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Không thể trích xuất JSON từ kết quả của AI');
            }
        }

        let rawQuestions = [];
        if (Array.isArray(parsed)) {
            rawQuestions = parsed;
        } else if (parsed && Array.isArray(parsed.questions)) {
            rawQuestions = parsed.questions;
        } else if (parsed && typeof parsed === 'object') {
            const possibleArr = Object.values(parsed).find(v => Array.isArray(v));
            if (possibleArr) rawQuestions = possibleArr;
        }

        if (!rawQuestions || rawQuestions.length === 0) {
            return res.status(500).json('AI không tạo được danh sách câu hỏi hợp lệ từ hình ảnh. Vui lòng thử lại!');
        }

        // Chuẩn hóa câu hỏi và làm sạch giải thích kiến thức độc lập
        const validQuestions = rawQuestions.map((q, idx) => {
            let opts = Array.isArray(q.options) ? q.options : Object.values(q.options || {});
            opts = opts.map(opt => typeof opt === 'string' ? opt.replace(/^[A-Da-d][\.\:\)\-]\s*/, '').trim() : String(opt));
            
            while (opts.length < 4) {
                opts.push('Lựa chọn ' + (opts.length + 1));
            }
            opts = opts.slice(0, 4);

            let correct = typeof q.correctAnswer === 'string' ? q.correctAnswer.replace(/^[A-Da-d][\.\:\)\-]\s*/, '').trim() : '';
            if (['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
                const mapIdx = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
                correct = opts[mapIdx] || opts[0];
            } else if (!opts.includes(correct)) {
                const found = opts.find(o => o.toLowerCase() === correct.toLowerCase());
                correct = found || opts[0];
            }

            let diff = (q.difficulty || 'medium').toLowerCase();
            if (!['easy', 'medium', 'hard'].includes(diff)) {
                diff = 'medium';
            }

            const rawExp = q.explanation || ('Đáp án đúng là: ' + correct);
            const cleanedExp = cleanExplanationText(rawExp);

            return {
                questionText: q.questionText || ('Câu hỏi ' + (idx + 1) + ' về ' + topic),
                options: opts,
                correctAnswer: correct,
                explanation: cleanedExp || ('Đáp án đúng là: ' + correct),
                difficulty: diff,
                topic: topic || 'Khác'
            };
        });

        res.status(200).json({ questions: validQuestions });
    } catch (err) {
        console.error('Lỗi tạo câu hỏi từ hình ảnh:', err);
        res.status(500).json('Lỗi máy chủ khi xử lý tạo câu hỏi từ hình ảnh bằng AI: ' + (err.message || ''));
    }
});

// LƯU HÀNG LOẠT CÂU HỎI VÀO NGÂN HÀNG (Dành cho AI batch questions)
router.post('/batch', verifyToken, async (req, res) => {
    try {
        const { questions, setId } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json("Danh sách câu hỏi không hợp lệ hoặc đang trống!");
        }

        const toInsert = questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: cleanExplanationText(q.explanation) || '',
            difficulty: q.difficulty || 'medium',
            topic: q.topic || 'Khác',
            owner: req.user.id
        }));

        const saved = await Question.insertMany(toInsert);

        if (setId) {
            const qIds = saved.map(item => item._id);
            await QuestionSet.findByIdAndUpdate(setId, {
                $addToSet: { questions: { $each: qIds } }
            });
        }

        res.status(200).json({
            message: `Đã lưu thành công ${saved.length} câu hỏi vào ngân hàng!`,
            count: saved.length,
            questions: saved
        });
    } catch (err) {
        console.error("Lỗi lưu hàng loạt câu hỏi:", err);
        res.status(500).json("Lỗi khi lưu câu hỏi vào cơ sở dữ liệu.");
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
        const isTeacher = req.user.role === 'teacher';

        if (!isTeacher && !isAdmin && !isOwner ) {
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
