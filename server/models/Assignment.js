const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    dueDate: { type: Date, default: null },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherClass', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, {
    timestamps: true
});

AssignmentSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);

