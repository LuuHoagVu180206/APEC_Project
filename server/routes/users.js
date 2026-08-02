const router = require('express').Router();
const User = require('../models/User');
const { verifyToken } = require('../verifyToken');

// API: THẢ TIM / BỎ TIM BỘ CÂU HỎI
router.put('/toggle-save-set', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // 1. Kéo mảng ra và ép mọi phần tử thành Chữ (String) để dọn dẹp bóng ma dữ liệu cũ
        let currentSaved = (user.savedSets || []).map(id => id.toString());
        const targetId = String(req.body.setId);
        
        let isSaved = false;

        // 2. Dùng JavaScript thuần để tính toán (Chính xác tuyệt đối)
        if (currentSaved.includes(targetId)) {
            // Nếu có rồi -> Lọc bỏ nó đi (Hành động Bỏ lưu)
            currentSaved = currentSaved.filter(id => id !== targetId);
            isSaved = false;
        } else {
            // Nếu chưa có -> Nhét thêm vào mảng (Hành động Lưu)
            currentSaved.push(targetId);
            isSaved = true;
        }
        
        // 3. GHI ĐÈ toàn bộ mảng mới vào Database (Vượt qua mọi rào cản kiểu dữ liệu)
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

router.put('/update-profile', verifyToken, async (req, res) => {
    try {
        // Dùng $set để chỉ cập nhật đúng những trường được gửi lên, không đụng tới password hay role
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    bio: req.body.bio
                }
            },
            { new: true } // Trả về thông tin user mới nhất sau khi update thành công
        );

        // Tách password ra khỏi dữ liệu trước khi gửi về Frontend để bảo mật
        const { password, ...others } = updatedUser._doc;
        
        res.status(200).json(others);
    } catch (err) {
        console.error("LỖI CẬP NHẬT PROFILE:", err);
        res.status(500).json("Lỗi server khi cập nhật thông tin!");
    }
});

module.exports = router;