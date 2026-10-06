const mongoose = require('mongoose');
const crypto = require('crypto');

const TeacherClassSchema = new mongoose.Schema({
    className: { type: String, required: true, trim: true },
    semester: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    classCode: { type: String, lowercase: true, match: /^[a-z]{8}$/, unique: true, sparse: true },
    teacherName: { type: String, required: true, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    questionSets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet' }]
}, { timestamps: true });

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