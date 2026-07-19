const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
require('dotenv').config();

// Dữ liệu mẫu: Câu hỏi
const sampleQuestions = [
    {
        questionText: "Thủ đô của Việt Nam là gì?",
        options: ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ"],
        correctAnswer: "Hà Nội",
        difficulty: "easy"
    },
    {
        questionText: "1 + 1 bằng mấy?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "2",
        difficulty: "easy"
    },
    {
        questionText: "Ai là người tạo ra thuyết tương đối?",
        options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo"],
        correctAnswer: "Albert Einstein",
        difficulty: "medium"
    }
];

// Dữ liệu mẫu: Người dùng admin
const sampleUser = {
    username: "admin123",
    password: "123456", // Mật khẩu đơn giản để test
    role: "admin",
    highScore: 100
};

const seedDB = async () => {
    try {
        // 1. Kết nối DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🔌 Đã kết nối MongoDB để nạp dữ liệu...");

        // 2. Xóa sạch dữ liệu cũ (để tránh trùng lặp khi chạy nhiều lần)
        await User.deleteMany({});
        await Question.deleteMany({});
        console.log("🧹 Đã dọn sạch dữ liệu cũ.");

        // 3. Tạo User mới
        await User.create(sampleUser);
        console.log("👤 Đã tạo User mẫu: admin / 123");

        // 4. Tạo Câu hỏi mới
        await Question.insertMany(sampleQuestions);
        console.log("❓ Đã tạo 3 câu hỏi mẫu.");

        console.log("✅ HOÀN TẤT! Backend đã sẵn sàng.");
        process.exit();
    } catch (err) {
        console.error("❌ Lỗi:", err);
        process.exit(1);
    }
};

seedDB();