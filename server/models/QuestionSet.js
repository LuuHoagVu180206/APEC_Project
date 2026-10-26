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

// Tối ưu hóa truy vấn: Compound index & Full-Text index phục vụ AI Discovery & Library filters
QuestionSetSchema.index(
    { isPublic: 1, title: 'text', description: 'text', topic: 'text' },
    { weights: { title: 5, topic: 3, description: 1 }, name: 'QuestionSetSearchIndex' }
);
QuestionSetSchema.index({ isPublic: 1, topic: 1 }, { name: 'isPublic_1_topic_1' });
QuestionSetSchema.index({ isPublic: 1, likesCount: -1 }, { name: 'isPublic_1_likesCount_-1' });
QuestionSetSchema.index({ owner: 1 }, { name: 'owner_1' });

module.exports = mongoose.model('QuestionSet', QuestionSetSchema);
