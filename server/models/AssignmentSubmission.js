const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedAnswer: { type: String, default: '' },
    correctAnswer: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false }
}, { _id: false });

const AssignmentSubmissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherClass', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attemptNumber: { type: Number, default: 1, required: true },
    answers: [AnswerSchema],
    score: { type: Number, required: true, default: 0 },
    totalQuestions: { type: Number, required: true, default: 0 },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['submitted', 'in_progress'], default: 'submitted' }
}, {
    timestamps: true
});

// 1. Compound unique index: guarantees no duplicate submission for the same attempt (idempotency, anti-double-click)
// Also efficiently supports (assignmentId, studentId) lookups
AssignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

// 2. Index for teacher aggregation queries (efficient lookup and sorting by submission time)
AssignmentSubmissionSchema.index({ assignmentId: 1, submittedAt: -1 });

// 3. Index for student querying all submissions in a class (avoids N+1 queries)
AssignmentSubmissionSchema.index({ classId: 1, studentId: 1 });

module.exports = mongoose.model('AssignmentSubmission', AssignmentSubmissionSchema);
