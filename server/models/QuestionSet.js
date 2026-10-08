const mongoose = require('mongoose');

const QuestionSetSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    description: { type: String },
    topic: { type: String, default: 'Khác' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    isPublic: { type: Boolean, default: false }, 
    likesCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('QuestionSet', QuestionSetSchema);