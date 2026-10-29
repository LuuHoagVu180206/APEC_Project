const mongoose = require('mongoose');

const QuestionSetSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    description: { type: String },
    topic: { type: String, default: 'Khác' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    isPublic: { type: Boolean, default: false }, 
    likesCount: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false }, // Bộ câu hỏi mặc định do APEC Group tạo
    isWeekly: { type: Boolean, default: false },  // Bộ câu hỏi sự kiện tuần
    weekNumber: { type: Number, default: 0 },     // Tuần số mấy (1, 2, 3...)
    badge: { type: String, default: '' },         // Huy hiệu hiển thị (VD: "APEC Official", "Tuần 1")
    authorName: { type: String, default: 'APEC Group' }
}, { timestamps: true });

module.exports = mongoose.model('QuestionSet', QuestionSetSchema);
