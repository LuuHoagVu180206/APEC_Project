const mongoose = require('mongoose');

const questionSetSchema = new mongoose.Schema({
    // Tên của bộ câu hỏi (VD: "Đề kiểm tra Toán 15 phút")
    title: { 
        type: String, 
        required: true 
    },
    // Lưu ID của người tạo ra bộ này (Để biết của ai mà trả về cho đúng)
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Danh sách các câu hỏi nằm bên trong bộ này
    questions: [
        {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }], // Mảng chứa 4 đáp án
            correctAnswer: { type: String, required: true }
        }
    ],
    
    isPublic: { 
        type: Boolean, 
        default: false // Mặc định tạo ra là Private (Chỉ mình tôi)
    }
}, { timestamps: true });

module.exports = mongoose.model('QuestionSet', questionSetSchema);