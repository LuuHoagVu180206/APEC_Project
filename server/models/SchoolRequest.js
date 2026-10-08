const mongoose = require('mongoose');

const SchoolRequestSchema = new mongoose.Schema({
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schoolName: { type: String, required: true, trim: true },
    normalizedSchoolName: { type: String, required: true, lowercase: true, trim: true },
    abbreviation: { type: String, required: true, trim: true },
    normalizedAbbreviation: { type: String, required: true, lowercase: true, trim: true },
    representativeName: { type: String, required: true, trim: true },
    representativeRole: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    website: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null }
}, { timestamps: true });

module.exports = mongoose.model('SchoolRequest', SchoolRequestSchema);