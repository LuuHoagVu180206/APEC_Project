const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

require('./models/User');
const User = require('./models/User');
const Question = require('./models/Question');
const QuestionSet = require('./models/QuestionSet');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/easylearn';

const kidQuestionSetsData = [
    {
        title: 'Bé Vui Học Toán - Phép Tính & Hình Học Diệu Kỳ',
        topic: 'Toán',
        description: 'Bộ câu hỏi toán học tư duy cơ bản, đếm số và nhận biết hình dạng dành riêng cho các bạn nhỏ tiểu học.',
        authorName: 'Cô Giáo Mai',
        badge: 'Học sinh tiểu học',
        likesCount: 38,
        questions: [
            {
                questionText: 'Một tuần lễ có bao nhiêu ngày?',
                options: ['5 ngày', '6 ngày', '7 ngày', '8 ngày'],
                correctAnswer: '7 ngày',
                difficulty: 'easy',
                topic: 'Toán'
            },
            {
                questionText: 'Hình nào sau đây có 3 cạnh và 3 góc?',
                options: ['Hình vuông', 'Hình tam giác', 'Hình chữ nhật', 'Hình tròn'],
                correctAnswer: 'Hình tam giác',
                difficulty: 'easy',
                topic: 'Toán'
            },
            {
                questionText: 'Đố bé: Trên cành cây có 5 chú chim, 3 chú chim khác bay đến đậu cùng. Hỏi có tất cả mấy chú chim?',
                options: ['6 chú chim', '7 chú chim', '8 chú chim', '9 chú chim'],
                correctAnswer: '8 chú chim',
                difficulty: 'easy',
                topic: 'Toán'
            },
            {
                questionText: 'Số nào sau đây lớn hơn số 9 nhưng nhỏ hơn số 11?',
                options: ['Số 8', 'Số 10', 'Số 12', 'Số 7'],
                correctAnswer: 'Số 10',
                difficulty: 'easy',
                topic: 'Toán'
            },
            {
                questionText: 'Bé có 10 viên kẹo ngọt, bé tặng bạn Nam 4 viên. Hỏi bé còn lại bao nhiêu viên kẹo?',
                options: ['6 viên kẹo', '5 viên kẹo', '4 viên kẹo', '7 viên kẹo'],
                correctAnswer: '6 viên kẹo',
                difficulty: 'easy',
                topic: 'Toán'
            }
        ]
    },
    {
        title: 'Đố Vui Tiếng Việt - Chữ Nghĩa & Thành Ngữ Cho Bé',
        topic: 'Tiếng Việt',
        description: 'Bộ câu đố vui chữ nghĩa, mở rộng vốn từ ngữ và thành ngữ gần gũi dành cho học sinh tiểu học.',
        authorName: 'Thầy Quang',
        badge: 'Học sinh tiểu học',
        likesCount: 35,
        questions: [
            {
                questionText: 'Trong bảng chữ cái Tiếng Việt, chữ cái nào đứng đầu tiên?',
                options: ['Chữ A', 'Chữ B', 'Chữ C', 'Chữ D'],
                correctAnswer: 'Chữ A',
                difficulty: 'easy',
                topic: 'Tiếng Việt'
            },
            {
                questionText: 'Điền từ còn thiếu vào câu thành ngữ quen thuộc: "Học đi đôi với ....."?',
                options: ['chơi', 'hành', 'nghỉ', 'hát'],
                correctAnswer: 'hành',
                difficulty: 'easy',
                topic: 'Tiếng Việt'
            },
            {
                questionText: 'Từ nào sau đây viết ĐÚNG chính tả tiếng Việt?',
                options: ['Chăm chỉ', 'Trăm chỉ', 'Chăn chỉ', 'Trăn chỉ'],
                correctAnswer: 'Chăm chỉ',
                difficulty: 'easy',
                topic: 'Tiếng Việt'
            },
            {
                questionText: 'Con gì mào đỏ, gáy ò ó o gọi mọi người thức dậy mỗi sớm mai?',
                options: ['Con vịt', 'Con gà trống', 'Con ngỗng', 'Con bồ câu'],
                correctAnswer: 'Con gà trống',
                difficulty: 'easy',
                topic: 'Tiếng Việt'
            },
            {
                questionText: 'Từ nào sau đây mang ý nghĩa TRÁI NGƯỢC với từ "chăm chỉ"?',
                options: ['Lười biếng', 'Cần cù', 'Ngoan ngoãn', 'Thật thà'],
                correctAnswer: 'Lười biếng',
                difficulty: 'easy',
                topic: 'Tiếng Việt'
            }
        ]
    },
    {
        title: 'Bé Tự Tin Làm Quen Tiếng Anh Khởi Đầu',
        topic: 'Tiếng Anh',
        description: 'Làm quen tiếng Anh siêu vui qua từ vựng màu sắc, hoa quả, đồ vật và lời chào giao tiếp hàng ngày.',
        authorName: 'Cô Emily',
        badge: 'Học sinh tiểu học',
        likesCount: 42,
        questions: [
            {
                questionText: 'Trong tiếng Anh, màu đỏ được gọi là gì?',
                options: ['Blue', 'Red', 'Green', 'Yellow'],
                correctAnswer: 'Red',
                difficulty: 'easy',
                topic: 'Tiếng Anh'
            },
            {
                questionText: 'Khi gặp thầy cô giáo vào buổi sáng, câu chào tiếng Anh đúng là gì?',
                options: ['Good night', 'Goodbye', 'Good morning', 'Thank you'],
                correctAnswer: 'Good morning',
                difficulty: 'easy',
                topic: 'Tiếng Anh'
            },
            {
                questionText: 'Quả chuối chín thơm ngon màu vàng trong tiếng Anh là gì?',
                options: ['Apple', 'Orange', 'Banana', 'Grape'],
                correctAnswer: 'Banana',
                difficulty: 'easy',
                topic: 'Tiếng Anh'
            },
            {
                questionText: 'Từ tiếng Anh "Cat" có nghĩa là con vật đáng yêu nào?',
                options: ['Con chó', 'Con mèo', 'Con thỏ', 'Con cá'],
                correctAnswer: 'Con mèo',
                difficulty: 'easy',
                topic: 'Tiếng Anh'
            },
            {
                questionText: 'Số 3 trong tiếng Anh đọc và viết là gì?',
                options: ['One', 'Two', 'Three', 'Four'],
                correctAnswer: 'Three',
                difficulty: 'easy',
                topic: 'Tiếng Anh'
            }
        ]
    },
    {
        title: 'Khám Phá Thế Giới Động Vật Quanh Em',
        topic: 'Sinh học',
        description: 'Cùng tìm hiểu về các loài động vật đáng yêu, tiếng kêu và tập tính quen thuộc trong tự nhiên.',
        authorName: 'Thầy Giáo Hoàng',
        badge: 'Học sinh tiểu học',
        likesCount: 36,
        questions: [
            {
                questionText: 'Loài động vật nào sau đây được mệnh danh là "Chúa tể rừng xanh"?',
                options: ['Con Voi', 'Con Sư tử', 'Con Hươu cao cổ', 'Con Gấu trúc'],
                correctAnswer: 'Con Sư tử',
                difficulty: 'easy',
                topic: 'Sinh học'
            },
            {
                questionText: 'Loài chim nào có cánh nhưng không biết bay, lại bơi lội rất giỏi ở vùng băng tuyết giá lạnh?',
                options: ['Chim cánh cụt', 'Chim đại bàng', 'Chim sáo', 'Chim bồ câu'],
                correctAnswer: 'Chim cánh cụt',
                difficulty: 'easy',
                topic: 'Sinh học'
            },
            {
                questionText: 'Con vật nuôi nào sủa "Gâu gâu" và thường giúp gia đình trông giữ nhà cửa?',
                options: ['Con mèo', 'Con chó', 'Con gà', 'Con thỏ'],
                correctAnswer: 'Con chó',
                difficulty: 'easy',
                topic: 'Sinh học'
            },
            {
                questionText: 'Món ăn củ quả yêu thích nhất của các bạn thỏ trắng đáng yêu là gì?',
                options: ['Củ cà rốt', 'Con cá nhỏ', 'Cục xương', 'Mật ong rừng'],
                correctAnswer: 'Củ cà rốt',
                difficulty: 'easy',
                topic: 'Sinh học'
            },
            {
                questionText: 'Động vật nào to lớn có chiếc vòi rất dài và hai chiếc ngà màu trắng ngà?',
                options: ['Con Hươu cao cổ', 'Con Tê giác', 'Con Voi', 'Con Cá sấu'],
                correctAnswer: 'Con Voi',
                difficulty: 'easy',
                topic: 'Sinh học'
            }
        ]
    },
    {
        title: 'Bé Ngoan Học Kỹ Năng Sống & Tự Vệ An Toàn',
        topic: 'Kỹ năng sống',
        description: 'Những bài học kỹ năng sống bổ ích giúp các bạn nhỏ luôn an toàn, biết giữ vệ sinh và lễ phép mỗi ngày.',
        authorName: 'Cô Lan Anh',
        badge: 'Học sinh tiểu học',
        likesCount: 40,
        questions: [
            {
                questionText: 'Khi tham gia giao thông đường bộ, đèn tín hiệu chuyển sang màu gì thì bé và mọi người được phép đi qua đường?',
                options: ['Đèn đỏ', 'Đèn vàng', 'Đèn xanh', 'Đèn nhấp nháy'],
                correctAnswer: 'Đèn xanh',
                difficulty: 'easy',
                topic: 'Kỹ năng sống'
            },
            {
                questionText: 'Để đôi bàn tay luôn sạch khuẩn và bảo vệ sức khỏe, bé nên rửa tay bằng xà phòng khi nào?',
                options: ['Trước khi ăn và sau khi đi vệ sinh', 'Sau khi ngủ dậy', 'Chỉ khi bố mẹ nhắc nhở', 'Không cần rửa tay'],
                correctAnswer: 'Trước khi ăn và sau khi đi vệ sinh',
                difficulty: 'easy',
                topic: 'Kỹ năng sống'
            },
            {
                questionText: 'Khi có người lạ cho bánh kẹo hoặc rủ đi chơi mà không có bố mẹ đi cùng, bé nên xử lý thế nào?',
                options: ['Đi theo ngay để nhận kẹo', 'Lễ phép từ chối và chạy ngay về báo với bố mẹ, người lớn', 'Đứng ăn kẹo tại chỗ', 'Im lặng đi theo'],
                correctAnswer: 'Lễ phép từ chối và chạy ngay về báo với bố mẹ, người lớn',
                difficulty: 'easy',
                topic: 'Kỹ năng sống'
            },
            {
                questionText: 'Khi được người lớn tặng quà hoặc giúp đỡ, câu nói lễ phép bé cần nói là gì?',
                options: ['Cháu xin lỗi', 'Cháu cảm ơn', 'Tạm biệt', 'Không nói gì'],
                correctAnswer: 'Cháu cảm ơn',
                difficulty: 'easy',
                topic: 'Kỹ năng sống'
            },
            {
                questionText: 'Đồ vật nào trong gia đình bé tuyệt đối KHÔNG được tự ý chạm vào hoặc nghịch phá vì rất nguy hiểm?',
                options: ['Gấu bông mềm', 'Ổ cắm điện và bật lửa', 'Quyển truyện tranh', 'Hộp bút màu'],
                correctAnswer: 'Ổ cắm điện và bật lửa',
                difficulty: 'easy',
                topic: 'Kỹ năng sống'
            }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully.');

        // Tìm kiếm các tài khoản hiện có
        const users = await User.find({}).select('_id username email role displayName');
        let owner = users.find(u => u.username === 'toilagiaovien') 
                 || users.find(u => u.role === 'teacher') 
                 || users.find(u => u.role === 'admin') 
                 || users[0];

        if (!owner) {
            console.error('Không tìm thấy tài khoản người dùng nào để gán quyền sở hữu.');
            process.exit(1);
        }

        console.log(`Using owner: ${owner.username} (${owner._id})`);

        for (const setInfo of kidQuestionSetsData) {
            // Xóa bộ cũ và các câu hỏi cũ liên kết nếu có để tạo lại hoàn toàn mới
            const oldSets = await QuestionSet.find({ title: setInfo.title });
            for (const oldSet of oldSets) {
                if (oldSet.questions && oldSet.questions.length > 0) {
                    await Question.deleteMany({ _id: { $in: oldSet.questions } });
                }
                await QuestionSet.findByIdAndDelete(oldSet._id);
                console.log(`🧹 Đã dọn bộ cũ: "${setInfo.title}"`);
            }

            // Tạo danh sách câu hỏi mới
            const createdQuestionIds = [];
            for (const q of setInfo.questions) {
                const questionDoc = new Question({
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    difficulty: q.difficulty,
                    topic: q.topic,
                    owner: owner._id
                });
                const savedQ = await questionDoc.save();
                createdQuestionIds.push(savedQ._id);
            }

            // Tạo QuestionSet mới
            const newSet = new QuestionSet({
                title: setInfo.title,
                description: setInfo.description,
                topic: setInfo.topic,
                owner: owner._id,
                questions: createdQuestionIds,
                isPublic: true,
                isDefault: false,
                isWeekly: false,
                badge: setInfo.badge || '',
                authorName: setInfo.authorName,
                isAnonymous: false,
                likesCount: setInfo.likesCount || 30
            });

            await newSet.save();
            console.log(`✅ [ĐÃ TẠO MỚI] "${setInfo.title}" (${createdQuestionIds.length} câu hỏi) - isPublic: true - likes: ${newSet.likesCount}`);
        }

        console.log('🎉 Hoàn thành tái tạo 5 bộ câu hỏi tiểu học và public lên Thư viện cộng đồng!');
        process.exit(0);
    } catch (err) {
        console.error('Lỗi khi seed câu hỏi:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    seed();
}

module.exports = { kidQuestionSetsData, seedKidQuestionSets: seed };
