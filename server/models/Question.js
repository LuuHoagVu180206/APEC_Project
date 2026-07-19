const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true }, 
    options: [{ type: String, required: true }],  
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, default: 'easy' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Question', QuestionSchema);