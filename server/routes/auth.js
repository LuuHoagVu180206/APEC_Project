const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyToken } = require('../verifyToken');
const PasswordResetOTP = require('../models/PasswordResetOTP');
const { sendPasswordResetEmail } = require('../sendPasswordResetEmail');

const RESET_RESPONSE = 'If an account with this email exists, an OTP has been sent.';
const OTP_LIFETIME_MS = 5 * 60 * 1000;
const RESET_TOKEN_LIFETIME_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findUserByEmail = (email) => User.findOne({
    email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' }
});

router.post('/forgot-password', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(200).json({ message: RESET_RESPONSE });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(200).json({ message: RESET_RESPONSE });

        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
        const otpHash = await bcrypt.hash(otp, 10);
        await PasswordResetOTP.deleteMany({ userId: user._id });
        await PasswordResetOTP.create({
            userId: user._id,
            email,
            otpHash,
            expiresAt: new Date(Date.now() + OTP_LIFETIME_MS)
        });

        try {
            await sendPasswordResetEmail(email, otp);
        } catch (mailError) {
            await PasswordResetOTP.deleteMany({ userId: user._id });
            console.error('Không thể gửi password reset OTP:', mailError.message);
        }

        res.status(200).json({ message: RESET_RESPONSE });
    } catch (err) {
        console.error('Lỗi forgot-password:', err);
        res.status(200).json({ message: RESET_RESPONSE });
    }
});

router.post('/verify-reset-otp', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const otp = typeof req.body.otp === 'string' ? req.body.otp.trim() : '';
    if (!email || !/^\d{6}$/.test(otp)) {
        return res.status(400).json('OTP không hợp lệ hoặc đã hết hạn!');
    }

    try {
        const resetRequest = await PasswordResetOTP.findOne({
            email,
            verified: false,
            attempts: { $lt: MAX_OTP_ATTEMPTS },
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!resetRequest || !(await bcrypt.compare(otp, resetRequest.otpHash))) {
            if (resetRequest) {
                resetRequest.attempts += 1;
                if (resetRequest.attempts >= MAX_OTP_ATTEMPTS) await resetRequest.deleteOne();
                else await resetRequest.save();
            }
            return res.status(400).json('OTP không hợp lệ hoặc đã hết hạn!');
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);
        const verifiedRequest = await PasswordResetOTP.findOneAndUpdate(
            { _id: resetRequest._id, verified: false, expiresAt: { $gt: new Date() } },
            {
                $set: {
                    verified: true,
                    resetTokenHash,
                    resetTokenExpiresAt: resetExpiresAt,
                    expiresAt: resetExpiresAt
                }
            },
            { new: true }
        );

        if (!verifiedRequest) return res.status(400).json('OTP không hợp lệ hoặc đã hết hạn!');
        res.status(200).json({ resetToken });
    } catch (err) {
        console.error('Lỗi verify-reset-otp:', err);
        res.status(500).json('Không thể xác minh OTP lúc này!');
    }
});

router.post('/reset-password', async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { resetToken, password, confirmPassword } = req.body;
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json('Mật khẩu phải có ít nhất 6 ký tự!');
    }
    if (password !== confirmPassword) {
        return res.status(400).json('Mật khẩu xác nhận không khớp!');
    }
    if (typeof resetToken !== 'string' || !email) {
        return res.status(400).json('Yêu cầu đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!');
    }

    try {
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetRequest = await PasswordResetOTP.findOneAndDelete({
            email,
            verified: true,
            resetTokenHash,
            resetTokenExpiresAt: { $gt: new Date() },
            expiresAt: { $gt: new Date() }
        });
        if (!resetRequest) {
            return res.status(400).json('Yêu cầu đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(resetRequest.userId, { password: hashedPassword });
        if (!updatedUser) return res.status(400).json('Không thể đặt lại mật khẩu cho tài khoản này!');
        res.status(200).json({ message: 'Đặt lại mật khẩu thành công!' });
    } catch (err) {
        console.error('Lỗi reset-password:', err);
        res.status(500).json('Không thể đặt lại mật khẩu lúc này!');
    }
});

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
    const { username, password, role = 'user' } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string' || username.length < 6 || password.length < 6) {
        return res.status(400).json("Tài khoản và mật khẩu phải có ít nhất 6 ký tự!");
    }
    if (!['user', 'teacher'].includes(role)) {
        return res.status(400).json("Vai trò đăng ký không hợp lệ!");
    }

    try {
        // Tạo muối (salt) và băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Lưu user với mật khẩu đã băm
        const newUser = new User({
            username,
            password: hashedPassword,
            role,
        });

        const user = await newUser.save();
        const { password: savedPassword, ...userDetails } = user._doc;
        res.status(201).json(userDetails);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ĐĂNG NHẬP
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(404).json("User not found");

        // So sánh mật khẩu nhập vào với mật khẩu đã băm trong DB
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        // Nếu đúng -> Tạo vé (Token)
        // Vé này chứa ID của user và hạn sử dụng (ví dụ 30 ngày)
        const accessToken = jwt.sign(
            { id: user._id,
              username: user.username,
              role: user.role },
            process.env.JWT_SECRET || "mat_khau_bi_mat_cua_server",
            { expiresIn: "30d" }
        );

        // Trả về thông tin user kèm theo cái vé (accessToken)
        const { password, ...others } = user._doc; // Giấu mật khẩu đi không trả về
        res.status(200).json({ ...others, accessToken });
        
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
