const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    dueDate: { type: Date, default: null },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherClass', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    maxAttempts: { type: Number, default: 1 }
}, {
    timestamps: true
});

// Index based on actual query patterns: finding class assignments sorted by newest
AssignmentSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
