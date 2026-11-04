const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');
const { verifyToken } = require('../verifyToken');

// Lưu session vào thư mục tạm của hệ điều hành để hoàn toàn không kích hoạt nodemon restart khi người dùng F5 web
const SESSION_FILE = path.join(os.tmpdir(), 'apec_edugame_active_session.json');

function loadPersistedSession() {
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const data = fs.readFileSync(SESSION_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Lỗi nạp session file:', e.message);
    }
    return null;
}

let lastSavedSessionString = '';
function savePersistedSession(session) {
    try {
        const currentString = (session && session.username && session.role !== 'guest')
            ? JSON.stringify(session)
            : '';
        if (currentString === lastSavedSessionString) {
            return; // Dữ liệu phiên không đổi, không ghi file để tránh kích hoạt reload
        }
        lastSavedSessionString = currentString;
        if (currentString) {
            fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
        } else if (fs.existsSync(SESSION_FILE)) {
            fs.unlinkSync(SESSION_FILE);
        }
    } catch (e) {
        console.error('Lỗi lưu session file:', e.message);
    }
}

let latestWebSession = loadPersistedSession();
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

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        const accessToken = jwt.sign(
            { id: user._id,
              username: user.username,
              role: user.role },
            process.env.JWT_SECRET || "mat_khau_bi_mat_cua_server",
            { expiresIn: "30d" }
        );

        const { password, ...others } = user._doc;
        const sessionData = { ...others, accessToken };
        latestWebSession = sessionData;
        savePersistedSession(latestWebSession);
        console.log('[Auth] Đăng nhập thành công trên web:', sessionData.username);
        res.status(200).json(sessionData);
        
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST: Web client đồng bộ trạng thái đăng nhập
router.post('/web-session', (req, res) => {
    const user = req.body.user;
    if (user && user.username && user.role !== 'guest') {
        latestWebSession = user;
        savePersistedSession(latestWebSession);
        console.log('[WebSession] Đồng bộ tài khoản web: ' + user.username);
    } else {
        latestWebSession = null;
        savePersistedSession(null);
        console.log('[WebSession] Web hiện chưa đăng nhập (khách)');
    }
    res.status(200).json({ success: true, session: latestWebSession });
});

// DELETE: Web client đăng xuất
router.delete('/web-session', (req, res) => {
    latestWebSession = null;
    savePersistedSession(null);
    console.log('[WebSession] Web đã đăng xuất');
    res.status(200).json({ success: true });
});

// GET: Game / Web gọi API kiểm tra xem trên web có đang đăng nhập không
router.get('/current-session', async (req, res) => {
    try {
        let token = req.headers['authorization'] || req.headers['token'];
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_server');
                const user = await User.findById(decoded.id).select('-password');
                if (user) {
                    return res.status(200).json({
                        isLoggedIn: true,
                        username: user.username,
                        displayName: user.displayName || user.username,
                        userId: user._id,
                        role: user.role,
                        accessToken: token,
                        highScore: user.highScore || 0,
                        weeklyScore: user.weeklyScore || 0
                    });
                }
            } catch (tokenErr) {}
        }

        if (latestWebSession && latestWebSession.username && latestWebSession.role !== 'guest') {
            const userId = latestWebSession._id || latestWebSession.id;
            try {
                if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                    const user = await User.findById(userId).select('-password');
                    if (user) {
                        return res.status(200).json({
                            isLoggedIn: true,
                            username: user.username,
                            displayName: user.displayName || user.username,
                            userId: user._id,
                            role: user.role,
                            accessToken: latestWebSession.accessToken || null,
                            highScore: user.highScore || 0,
                            weeklyScore: user.weeklyScore || 0
                        });
                    }
                }
            } catch (_) {}

            return res.status(200).json({
                isLoggedIn: true,
                username: latestWebSession.username,
                displayName: latestWebSession.displayName || latestWebSession.username,
                userId: latestWebSession._id || latestWebSession.id,
                role: latestWebSession.role || 'user',
                accessToken: latestWebSession.accessToken || null,
                highScore: latestWebSession.highScore || 0,
                weeklyScore: latestWebSession.weeklyScore || 0
            });
        }

        return res.status(200).json({
            isLoggedIn: false,
            username: '',
            message: 'Chưa đăng nhập'
        });
    } catch (err) {
        console.error('Lỗi kiểm tra current-session:', err);
        res.status(200).json({ isLoggedIn: false, username: '', message: 'Chưa đăng nhập' });
    }
});

module.exports = router;
