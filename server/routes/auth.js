const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../verifyToken');

// ĐĂNG KÝ
router.post('/register', async (req, res) => {
    
    if (req.body.username.length < 6 || req.body.password.length < 6) {
        return res.status(400).json("Tài khoản và mật khẩu phải có ít nhất 6 ký tự!");
    }

    try {
        // Tạo muối (salt) và băm mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Lưu user với mật khẩu đã băm
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword, // Lưu cái chuỗi loằng ngoằng này
        });

        const user = await newUser.save();
        res.status(200).json(user);
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
