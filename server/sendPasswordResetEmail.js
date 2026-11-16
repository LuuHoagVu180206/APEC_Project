const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, otp) => {
    const subject = 'EasyLearn password reset OTP';
    const text = `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 5 minutes.`;
    const { BREVO_API_KEY, BREVO_SENDER_EMAIL } = process.env;
    if (BREVO_API_KEY || BREVO_SENDER_EMAIL) {
        if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
            throw new Error('Set both BREVO_API_KEY and BREVO_SENDER_EMAIL.');
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: 'EasyLearn', email: BREVO_SENDER_EMAIL },
                to: [{ email }],
                subject,
                textContent: text
            }),
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            throw new Error(`Brevo rejected the password reset email (HTTP ${response.status}).`);
        }
        return;
    }

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
        subject,
        text
    });
};

module.exports = { sendPasswordResetEmail };
