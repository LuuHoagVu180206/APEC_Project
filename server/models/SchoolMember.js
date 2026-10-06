const mongoose = require('mongoose');

const SchoolMemberSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, default: '', trim: true },
    className: { type: String, default: '', trim: true },
    teachingInfo: { type: String, default: '', trim: true },
    communityRole: { type: String, enum: ['member', 'community_manager'], default: 'member' }
}, { timestamps: true });

SchoolMemberSchema.index({ school: 1, user: 1 }, { unique: true });
SchoolMemberSchema.index({ school: 1, createdAt: -1 });
SchoolMemberSchema.index({ school: 1, communityRole: 1, createdAt: 1 });

module.exports = mongoose.model('SchoolMember', SchoolMemberSchema);