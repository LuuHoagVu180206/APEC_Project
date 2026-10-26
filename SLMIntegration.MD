SLMs tự phân loại các chủ đề dựa vào nội dung các câu hỏi của giáo viên để lưu trữ bộ câu hỏi và truy xuất truy vấn của học sinh đúng đắn nhất có thể. 


SLMs sinh ra lời giải tự động cho các câu hỏi của giáo viên, hỗ trợ giáo viên không cần nhập lời giải thích quá tốn thời gian cho học sinh.


SLMs sinh ra những câu hỏi tương tự từ dữ liệu đầu vào.


VLMs sinh ra những câu hỏi từ hình ảnh đầu vào và kèm giải thích đáp án:
- Model sử dụng: Qwen2-VL-7B-Instruct (`qwen2.5vl:7b` / `qwen2-vl:7b` trong Ollama).
- API Endpoint: `POST /api/questions/generate-from-image` (yêu cầu verifyToken).
- Đầu vào: Chuỗi ảnh Base64 (PNG, JPG, WEBP), số lượng câu hỏi (1 - 10), môn học, độ khó, và ghi chú định hướng tùy chọn từ giáo viên.
- Đầu ra: Danh sách câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D), đáp án đúng và lời giải thích chi tiết chuẩn format JSON.
- Quy chuẩn sư phạm (tuân thủ Nhiệm vụ 3 trong ModelFile): Lời giải thích đi thẳng vào bản chất kiến thức khoa học/định luật/công thức/bước giải độc lập, tuyệt đối không tham chiếu ảnh hoặc tài liệu nguồn (vì học sinh làm quiz không nhìn thấy ảnh nguồn).
- Giao diện: Tab "Từ hình ảnh (Qwen2-VL)" trong mục "AI Trợ lý tạo đề" tại trang Studio, hỗ trợ kéo thả ảnh, chọn từ máy, hoặc nhấn Ctrl+V dán ảnh chụp màn hình trực tiếp.
