const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true }, 
    options: [{ type: String, required: true }],  
    correctAnswer: { type: String, required: true },
    difficulty: { type: String, default: 'easy' }   
});

module.exports = mongoose.model('Question', QuestionSchema);