const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true }, // Nội dung câu hỏi
    options: [{ type: String, required: true }],    // Mảng 4 đáp án ["A", "B", "C", "D"]
    correctAnswer: { type: String, required: true },// Đáp án đúng (VD: "A" hoặc nội dung text)
    difficulty: { type: String, default: 'easy' }   // Độ khó: easy, medium, hard
});

module.exports = mongoose.model('Question', QuestionSchema);