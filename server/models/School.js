const mongoose = require('mongoose');

const SharedQuestionSetSchema = new mongoose.Schema({
    questionSet: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionSet', required: true },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedAt: { type: Date, default: Date.now }
}, { _id: false });

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, lowercase: true, trim: true, unique: true },
    abbreviation: { type: String, required: true, trim: true },
    normalizedAbbreviation: { type: String, required: true, lowercase: true, trim: true, unique: true },
    representativeName: { type: String, required: true, trim: true },
    representativeRole: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    website: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    sharedQuestionSets: { type: [SharedQuestionSetSchema], default: [] }
}, { timestamps: true });

SchoolSchema.index({ createdAt: -1, _id: -1 });

module.exports = mongoose.model('School', SchoolSchema);