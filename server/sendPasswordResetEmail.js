const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, otp) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.');
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM || SMTP_USER,
        to: email,
        subject: 'EasyLearn password reset OTP',
        text: `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.`
    });
};

module.exports = { sendPasswordResetEmail };