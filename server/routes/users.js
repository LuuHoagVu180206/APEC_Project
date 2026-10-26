const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../verifyToken');

// API: LẤY THÔNG TIN TÀI KHOẢN HIỆN TẠI
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json("Không tìm thấy người dùng!");
        }
        res.status(200).json(user);
    } catch (err) {
        console.error("LỖI LẤY THÔNG TIN ME:", err);
        res.status(500).json("Lỗi server khi lấy thông tin!");
    }
});

// API: THẢ TIM / BỎ TIM BỘ CÂU HỎI
router.put('/toggle-save-set', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json("Không tìm thấy người dùng!");
        
        let currentSaved = (user.savedSets || []).map(id => id.toString());
        const targetId = String(req.body.setId);
        let isSaved = false;

        if (currentSaved.includes(targetId)) {
            currentSaved = currentSaved.filter(id => id !== targetId);
            isSaved = false;
        } else {
            currentSaved.push(targetId);
            isSaved = true;
        }
        
        user.savedSets = currentSaved;
        await user.save();

        res.status(200).json({ 
            message: isSaved ? "Đã lưu bộ câu hỏi!" : "Đã bỏ lưu bộ câu hỏi!", 
            isSaved: isSaved 
        });
    } catch (err) {
        console.error("LỖI API LƯU BỘ CÂU HỎI:", err); 
        res.status(500).json(err);
    }
});

// API: CẬP NHẬT THÔNG TIN HỒ SƠ (AVATAR, DISPLAY NAME, FULL NAME, PHONE, EMAIL)
router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        const { displayName, fullName, email, phone, avatar } = req.body;

        const updateFields = {};
        if (displayName !== undefined) updateFields.displayName = String(displayName).trim();
        if (fullName !== undefined) updateFields.fullName = String(fullName).trim();
        if (email !== undefined) updateFields.email = String(email).trim().toLowerCase();
        if (phone !== undefined) updateFields.phone = String(phone).trim();
        if (avatar !== undefined) updateFields.avatar = typeof avatar === 'string' ? avatar : "";

        // Kiểm tra format email nếu có nhập
        if (updateFields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateFields.email)) {
            return res.status(400).json("Địa chỉ email không hợp lệ!");
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json("Không tìm thấy người dùng!");
        }

        const { password, ...others } = updatedUser._doc;
        res.status(200).json(others);
    } catch (err) {
        console.error("LỖI CẬP NHẬT PROFILE:", err);
        res.status(500).json("Lỗi máy chủ khi cập nhật hồ sơ!");
    }
});

// API: ĐỔI MẬT KHẨU
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json("Vui lòng điền đầy đủ thông tin mật khẩu!");
        }

        if (newPassword.length < 6) {
            return res.status(400).json("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json("Mật khẩu xác nhận không khớp!");
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json("Không tìm thấy người dùng!");
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json("Mật khẩu hiện tại không chính xác!");
        }

        // Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        console.error("LỖI ĐỔI MẬT KHẨU:", err);
        res.status(500).json("Lỗi máy chủ khi đổi mật khẩu!");
    }
});

module.exports = router;
