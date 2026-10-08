const mongoose = require('mongoose');

const SchoolJoinRequestSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true, trim: true },
    globalRole: { type: String, enum: ['user', 'teacher'], required: true },
    className: { type: String, default: '', trim: true },
    teachingInfo: { type: String, default: '', trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('SchoolJoinRequest', SchoolJoinRequestSchema);