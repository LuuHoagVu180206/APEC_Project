const mongoose = require('mongoose');

const GameSettingSchema = new mongoose.Schema({
    // Chúng ta đặt một ID cứng để đảm bảo chỉ có 1 bản ghi duy nhất
    settingId: { type: String, default: "current_version", unique: true },
    version: { type: String, default: "v1.0" } // Giá trị mặc định
});

module.exports = mongoose.model('GameSetting', GameSettingSchema);