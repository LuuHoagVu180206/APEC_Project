const mongoose = require('mongoose');
const crypto = require('crypto');

const TeacherClassSchema = new mongoose.Schema({
    className: { type: String, required: true, trim: true },
    semester: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    classCode: { type: String, lowercase: true, match: /^[a-z]{8}$/, unique: true, sparse: true },
    teacherName: { type: String, required: true, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    questionSets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet' }],
    gameSessions: [{
        sessionId: { type: String, default: () => crypto.randomUUID() },
        roomPin: { type: String, default: '' },
        setTitle: { type: String, default: 'Màn chơi Lớp học' },
        setId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet', default: null },
        playedAt: { type: Date, default: Date.now },
        teacherParticipated: { type: Boolean, default: false },
        players: [{
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
            studentName: { type: String, required: true },
            displayName: { type: String, default: '' },
            role: { type: String, default: 'student' },
            score: { type: Number, required: true },
            timePlayed: { type: Number, default: 0 },
            questionsAnswered: { type: Number, default: 0 },
            rank: { type: Number, default: 1 }
        }]
    }],
    gameScores: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        studentName: { type: String, required: true },
        score: { type: Number, required: true },
        timePlayed: { type: Number, default: 0 },
        questionsAnswered: { type: Number, default: 0 },
        setId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet', default: null },
        setTitle: { type: String, default: '' },
        playedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

TeacherClassSchema.virtual('teacherCount').get(function () {
    const primaryTeacherId = this.teacher._id || this.teacher;
    return new Set([
        primaryTeacherId.toString(),
        ...this.teachers.map((teacherId) => teacherId.toString())
    ]).size;
});

TeacherClassSchema.pre('validate', async function () {
    if (this.classCode) return;

    for (let attempt = 0; attempt < 10; attempt += 1) {
        const classCode = Array.from({ length: 8 }, () => String.fromCharCode(97 + crypto.randomInt(26))).join('');
        const existingClass = await this.constructor.exists({ classCode });
        if (!existingClass) {
            this.classCode = classCode;
            return;
        }
    }

    throw new Error('Unable to generate a unique class code.');
});

TeacherClassSchema.index({ school: 1, createdAt: -1 });

module.exports = mongoose.model('TeacherClass', TeacherClassSchema);
