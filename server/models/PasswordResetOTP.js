const mongoose = require('mongoose');

const PasswordResetOTPSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

PasswordResetOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetOTPSchema.index({ userId: 1, email: 1 });

module.exports = mongoose.model('PasswordResetOTP', PasswordResetOTPSchema);