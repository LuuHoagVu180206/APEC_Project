const router = require('express').Router();
const GameSetting = require('../models/GameSetting');
const { verifyAdmin } = require('../verifyToken');

const supportedVersions = process.env.NODE_ENV === 'production' ? ['v3.0'] : ['v2.0', 'v3.0'];

// 1. LẤY VERSION HIỆN TẠI
router.get('/version', async (req, res) => {
    try {
        let setting = await GameSetting.findOne({ settingId: "current_version" });
        
        if (!supportedVersions.includes(setting?.version)) {
            return res.status(200).json({ version: "v3.0" });
        }
        
        res.status(200).json(setting);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. CẬP NHẬT VERSION (Dành cho Admin)
router.post('/version', verifyAdmin, async (req, res) => {
    try {
        const { version } = req.body;
        if (!supportedVersions.includes(version)) return res.status(400).json({ message: 'Phiên bản game chưa được triển khai!' });
        
        // Tìm và cập nhật. Nếu chưa có thì tạo mới (upsert: true)
        const updatedSetting = await GameSetting.findOneAndUpdate(
            { settingId: "current_version" },
            { version: version },
            { new: true, upsert: true } // new: true để trả về dữ liệu mới sau khi update
        );
        
        res.status(200).json(updatedSetting);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
