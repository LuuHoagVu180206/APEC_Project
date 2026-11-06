const mongoose = require('mongoose');

const QuestionSetSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    description: { type: String },
    topic: { type: String, default: 'Khác' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    isPublic: { type: Boolean, default: false }, 
    likesCount: { type: Number, default: 0 },
    copyCount: { type: Number, default: 0 },              // Số lần bộ đề được người khác sao chép
    playCount: { type: Number, default: 0 },              // Tổng số lượt chơi (solo + phòng chung)
    playCountSolo: { type: Number, default: 0 },          // Số lượt chơi đơn lẻ 1 mình
    playCountMultiplayer: { type: Number, default: 0 },   // Số lượt chơi trong phòng chung
    isDefault: { type: Boolean, default: false },         // Bộ câu hỏi mặc định do APEC Group tạo
    isWeekly: { type: Boolean, default: false },          // Bộ câu hỏi sự kiện tuần
    weekNumber: { type: Number, default: 0 },             // Tuần số mấy (1, 2, 3...)
    badge: { type: String, default: '' },                 // Huy hiệu hiển thị (VD: "APEC Official", "Tuần 1")
    authorName: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },       // Đăng ẩn danh (chỉ có hiệu lực khi isPublic: true)
    reportsCount: { type: Number, default: 0 },           // Số lượt bị báo cáo vi phạm
    isReported: { type: Boolean, default: false }         // Đánh dấu có báo cáo vi phạm cần duyệt
}, { timestamps: true });

module.exports = mongoose.model('QuestionSet', QuestionSetSchema);
