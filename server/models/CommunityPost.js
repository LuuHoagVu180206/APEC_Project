const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: ['announcement'], default: 'announcement' }
}, { timestamps: true });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);