const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
const QuestionSet = require('./models/QuestionSet');
const bcrypt = require('bcryptjs');

const defaultSubjectData = [
    {
        subjectKey: 'toan',
        title: 'Đại Số & Hình Học Đột Phá - APEC Group',
        topic: 'Toán',
        description: 'Bộ đề Toán học chuẩn mực do APEC Group biên soạn: rèn luyện tư duy logic, hàm số, giải tích và hình học không gian.',
        questions: [
            {
                questionText: 'Phương trình bậc hai ax² + bx + c = 0 (a ≠ 0) có nghiệm kép khi nào?',
                options: ['Δ = 0', 'Δ > 0', 'Δ < 0', 'Δ ≥ 0'],
                correctAnswer: 'Δ = 0',
                difficulty: 'easy'
            },
            {
                questionText: 'Trong tam giác vuông, định lý Pythagore phát biểu điều gì?',
                options: ['Bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông', 'Chu vi bằng diện tích', 'Hai cạnh góc vuông bằng nhau', 'Cạnh huyền luôn bằng 2 lần cạnh góc vuông'],
                correctAnswer: 'Bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông',
                difficulty: 'easy'
            },
            {
                questionText: 'Giá trị lượng giác của sin(90°) bằng bao nhiêu?',
                options: ['1', '0', '0.5', '-1'],
                correctAnswer: '1',
                difficulty: 'easy'
            },
            {
                questionText: 'Số nguyên tố chẵn duy nhất là số nào?',
                options: ['2', '0', '4', '6'],
                correctAnswer: '2',
                difficulty: 'easy'
            },
            {
                questionText: 'Đạo hàm của hàm số y = x² là gì?',
                options: ['2x', 'x', '2', 'x³/3'],
                correctAnswer: '2x',
                difficulty: 'medium'
            },
            {
                questionText: 'Công thức tính chu vi hình tròn có bán kính r là?',
                options: ['C = 2πr', 'C = πr²', 'C = 4πr', 'C = πd²/4'],
                correctAnswer: 'C = 2πr',
                difficulty: 'easy'
            },
            {
                questionText: 'Căn bậc hai số học của 144 là bao nhiêu?',
                options: ['12', '14', '16', '72'],
                correctAnswer: '12',
                difficulty: 'easy'
            },
            {
                questionText: 'Hình lập phương có tổng cộng bao nhiêu đỉnh và bao nhiêu mặt?',
                options: ['8 đỉnh, 6 mặt', '6 đỉnh, 8 mặt', '12 đỉnh, 6 mặt', '8 đỉnh, 12 mặt'],
                correctAnswer: '8 đỉnh, 6 mặt',
                difficulty: 'medium'
            }
        ]
    },
    {
        subjectKey: 'ly',
        title: 'Vật Lý Đại Cương & Vũ Trụ Ứng Dụng - APEC Group',
        topic: 'Vật lý',
        description: 'Tổng hợp các quy luật cơ học Newton, nhiệt học, quang học và sóng âm kỳ thú do APEC Group xây dựng.',
        questions: [
            {
                questionText: 'Đơn vị đo lực trong hệ đo lường quốc tế SI là gì?',
                options: ['Newton (N)', 'Joule (J)', 'Pascal (Pa)', 'Watt (W)'],
                correctAnswer: 'Newton (N)',
                difficulty: 'easy'
            },
            {
                questionText: 'Vận tốc của ánh sáng truyền trong chân không xấp xỉ bằng bao nhiêu?',
                options: ['300,000 km/s', '300,000 m/s', '3,000 km/s', '150,000 km/s'],
                correctAnswer: '300,000 km/s',
                difficulty: 'easy'
            },
            {
                questionText: 'Định luật I Newton còn được gọi với tên là gì?',
                options: ['Định luật Quán tính', 'Định luật Tương đối', 'Định luật Vạn vật hấp dẫn', 'Định luật Bảo toàn năng lượng'],
                correctAnswer: 'Định luật Quán tính',
                difficulty: 'easy'
            },
            {
                questionText: 'Hiện tượng cầu vồng hình thành chủ yếu do hiện tượng quang học nào sau đây?',
                options: ['Tán sắc và phản xạ toàn phần của ánh sáng qua giọt nước', 'Hiện tượng giao thoa ánh sáng', 'Hiện tượng quang điện', 'Nhiễu xạ ánh sáng qua mây'],
                correctAnswer: 'Tán sắc và phản xạ toàn phần của ánh sáng qua giọt nước',
                difficulty: 'medium'
            },
            {
                questionText: 'Dụng cụ nào được mắc nối tiếp trong mạch để đo cường độ dòng điện?',
                options: ['Ampe kế', 'Vôn kế', 'Nhiệt kế', 'Áp kế'],
                correctAnswer: 'Ampe kế',
                difficulty: 'easy'
            },
            {
                questionText: 'Sóng âm KHÔNG THỂ truyền qua môi trường nào sau đây?',
                options: ['Chân không', 'Nước biển', 'Thanh thép', 'Không khí'],
                correctAnswer: 'Chân không',
                difficulty: 'easy'
            },
            {
                questionText: 'Công thức tính động năng của một vật khối lượng m chuyển động với vận tốc v là?',
                options: ['Wđ = ½ m v²', 'Wđ = m g h', 'Wđ = m v', 'Wđ = 2 m v²'],
                correctAnswer: 'Wđ = ½ m v²',
                difficulty: 'medium'
            },
            {
                questionText: 'Ở áp suất khí quyển tiêu chuẩn, nước tinh khiết đóng băng ở bao nhiêu độ C?',
                options: ['0°C', '-4°C', '100°C', '32°C'],
                correctAnswer: '0°C',
                difficulty: 'easy'
            }
        ]
    },
    {
        subjectKey: 'hoa',
        title: 'Hoá Học Kỳ Thú & Thế Giới Nguyên Tố - APEC Group',
        topic: 'Hoá học',
        description: 'Chinh phục bảng tuần hoàn Men-đê-lê-ép, phản ứng este hoá và hoá học hữu cơ cùng APEC Group.',
        questions: [
            {
                questionText: 'Ký hiệu hoá học của nguyên tố Vàng là gì?',
                options: ['Au', 'Ag', 'Fe', 'Cu'],
                correctAnswer: 'Au',
                difficulty: 'easy'
            },
            {
                questionText: 'Khí nào chiếm tỷ lệ thể tích lớn nhất trong bầu khí quyển của Trái Đất?',
                options: ['Nitơ (N₂)', 'Oxy (O₂)', 'Cacbonic (CO₂)', 'Argon (Ar)'],
                correctAnswer: 'Nitơ (N₂)',
                difficulty: 'easy'
            },
            {
                questionText: 'Dung dịch có chỉ số pH = 7 ở 25°C là môi trường gì?',
                options: ['Trung tính', 'Axit mạnh', 'Bazơ kiềm', 'Lưỡng tính'],
                correctAnswer: 'Trung tính',
                difficulty: 'easy'
            },
            {
                questionText: 'Công thức hoá học của muối ăn tinh khiết thông thường là?',
                options: ['NaCl', 'KCl', 'CaCO₃', 'NaHCO₃'],
                correctAnswer: 'NaCl',
                difficulty: 'easy'
            },
            {
                questionText: 'Kim loại duy nhất tồn tại ở thể lỏng trong điều kiện nhiệt độ phòng là gì?',
                options: ['Thuỷ ngân (Hg)', 'Chì (Pb)', 'Nhôm (Al)', 'Brom (Br)'],
                correctAnswer: 'Thuỷ ngân (Hg)',
                difficulty: 'easy'
            },
            {
                questionText: 'Phản ứng giữa một Axit và một Bazơ tạo thành muối và nước được gọi là phản ứng gì?',
                options: ['Phản ứng trung hoà', 'Phản ứng thế', 'Phản ứng quang hoá', 'Phản ứng trùng ngưng'],
                correctAnswer: 'Phản ứng trung hoà',
                difficulty: 'medium'
            },
            {
                questionText: 'Khí nào có khả năng làm đục dung dịch nước vôi trong Ca(OH)₂?',
                options: ['Khí CO₂', 'Khí O₂', 'Khí H₂', 'Khí N₂'],
                correctAnswer: 'Khí CO₂',
                difficulty: 'easy'
            },
            {
                questionText: 'Kim loại nào có tính dẫn điện tốt nhất trong các kim loại sau?',
                options: ['Bạc (Ag)', 'Đồng (Cu)', 'Vàng (Au)', 'Sắt (Fe)'],
                correctAnswer: 'Bạc (Ag)',
                difficulty: 'medium'
            }
        ]
    },
    {
        subjectKey: 'sinh',
        title: 'Sinh Học & Bí Ẩn Thế Giới Sống - APEC Group',
        topic: 'Sinh học',
        description: 'Khám phá thế giới tế bào, ADN di truyền, cơ thể người và hệ sinh thái đa dạng do APEC Group tuyển chọn.',
        questions: [
            {
                questionText: 'Đơn vị cấu trúc và chức năng cơ bản của mọi cơ thể sinh vật sống là gì?',
                options: ['Tế bào', 'Mô', 'Cơ quan', 'Hệ gen'],
                correctAnswer: 'Tế bào',
                difficulty: 'easy'
            },
            {
                questionText: 'Quá trình thực vật sử dụng ánh sáng mặt trời để tạo ra chất hữu cơ và oxy gọi là gì?',
                options: ['Quang hợp', 'Hô hấp tế bào', 'Thoát hơi nước', 'Lên men lactic'],
                correctAnswer: 'Quang hợp',
                difficulty: 'easy'
            },
            {
                questionText: 'Sắc tố giữ vai trò chính trong quá trình hấp thu năng lượng quang hợp ở lá cây là?',
                options: ['Diệp lục (Chlorophyll)', 'Caroten', 'Anthocyanin', 'Xanthophyll'],
                correctAnswer: 'Diệp lục (Chlorophyll)',
                difficulty: 'easy'
            },
            {
                questionText: 'Trong hệ nhóm máu ABO, nhóm máu nào được xem là nhóm máu chuyên cho hồng cầu?',
                options: ['Nhóm máu O', 'Nhóm máu AB', 'Nhóm máu A', 'Nhóm máu B'],
                correctAnswer: 'Nhóm máu O',
                difficulty: 'easy'
            },
            {
                questionText: 'Bào quan nào được ví như "nhà máy cung cấp năng lượng ATP" của tế bào nhân thực?',
                options: ['Ty thể', 'Không bào', 'Ribôxôm', 'Bộ máy Golgi'],
                correctAnswer: 'Ty thể',
                difficulty: 'medium'
            },
            {
                questionText: 'Axit nuclêic nào lưu trữ và truyền đạt thông tin di truyền ở hầu hết sinh vật?',
                options: ['ADN (DNA)', 'ARN (RNA)', 'Axit amin', 'Lipit'],
                correctAnswer: 'ADN (DNA)',
                difficulty: 'easy'
            },
            {
                questionText: 'Cơ quan nào trong cơ thể người chịu trách nhiệm lọc chất thải từ máu để tạo nước tiểu?',
                options: ['Thận', 'Gan', 'Dạ dày', 'Phổi'],
                correctAnswer: 'Thận',
                difficulty: 'easy'
            },
            {
                questionText: 'Hiện tượng tiếp hợp và trao đổi chéo giữa các crômatit diễn ra ở kì nào của giảm phân?',
                options: ['Kì đầu I', 'Kì giữa I', 'Kì sau II', 'Kì cuối II'],
                correctAnswer: 'Kì đầu I',
                difficulty: 'hard'
            }
        ]
    },
    {
        subjectKey: 'tienganh',
        title: 'Tiếng Anh Chuẩn Quốc Tế & Giao Tiếp - APEC Group',
        topic: 'Tiếng Anh',
        description: 'Luyện phản xạ từ vựng, ngữ pháp cốt lõi và thành ngữ tiếng Anh thông dụng cùng APEC Group.',
        questions: [
            {
                questionText: 'What is the irregular plural form of the noun "child"?',
                options: ['Children', 'Childs', 'Childrens', 'Childes'],
                correctAnswer: 'Children',
                difficulty: 'easy'
            },
            {
                questionText: 'Choose the grammatically correct sentence:',
                options: ['She walks to school every morning.', 'She walk to school every morning.', 'She is walk to school every morning.', 'She are walking to school.'],
                correctAnswer: 'She walks to school every morning.',
                difficulty: 'easy'
            },
            {
                questionText: 'Which word is the ANTONYM (opposite meaning) of "Generous"?',
                options: ['Selfish / Stingy', 'Kind', 'Polite', 'Friendly'],
                correctAnswer: 'Selfish / Stingy',
                difficulty: 'easy'
            },
            {
                questionText: 'Complete the sentence: "If I _____ a bird, I would fly across the ocean."',
                options: ['were', 'am', 'will be', 'have been'],
                correctAnswer: 'were',
                difficulty: 'medium'
            },
            {
                questionText: 'What is the past participle (V3) form of the verb "Write"?',
                options: ['Written', 'Wrote', 'Writing', 'Writed'],
                correctAnswer: 'Written',
                difficulty: 'easy'
            },
            {
                questionText: 'Fill in the blank: "I am really looking forward to _____ you again."',
                options: ['meeting', 'meet', 'met', 'have met'],
                correctAnswer: 'meeting',
                difficulty: 'medium'
            },
            {
                questionText: 'Which preposition is used in: "She is very good _____ solving math puzzles."?',
                options: ['at', 'in', 'on', 'about'],
                correctAnswer: 'at',
                difficulty: 'easy'
            },
            {
                questionText: 'What does the idiom "Piece of cake" mean in English?',
                options: ['Something very easy to do', 'A delicious birthday cake', 'A difficult problem', 'A piece of advice'],
                correctAnswer: 'Something very easy to do',
                difficulty: 'easy'
            }
        ]
    },
    {
        subjectKey: 'tiengviet',
        title: 'Tiếng Việt & Tinh Hoa Văn Học Dân Tộc - APEC Group',
        topic: 'Tiếng Việt',
        description: 'Tổng hợp vẻ đẹp ca dao, thành ngữ, biện pháp tu từ và tác phẩm văn học Việt Nam do APEC Group xây dựng.',
        questions: [
            {
                questionText: 'Trong câu thơ "Tre giữ làng, giữ nước, giữ mái nhà tranh", tác giả đã sử dụng biện pháp tu từ gì?',
                options: ['Điệp từ', 'So sánh ngang bằng', 'Ẩn dụ chuyển đổi cảm giác', 'Nói giảm nói tránh'],
                correctAnswer: 'Điệp từ',
                difficulty: 'easy'
            },
            {
                questionText: 'Chọn từ viết đúng chính tả tiếng Việt trong các từ sau:',
                options: ['Giành giật', 'Dành giật', 'Rành giật', 'Giành rật'],
                correctAnswer: 'Giành giật',
                difficulty: 'easy'
            },
            {
                questionText: 'Điền từ còn thiếu vào câu thành ngữ: "Có công mài sắt, có ngày nên _____"?',
                options: ['kim', 'vàng', 'dao', 'ngọc'],
                correctAnswer: 'kim',
                difficulty: 'easy'
            },
            {
                questionText: 'Từ nào sau đây là từ láy toàn bộ?',
                options: ['Xanh xanh', 'Long lanh', 'Xinh xắn', 'Gọn gàng'],
                correctAnswer: 'Xanh xanh',
                difficulty: 'easy'
            },
            {
                questionText: 'Kiệt tác "Truyện Kiều" của đại thi hào Nguyễn Du được viết theo thể thơ nào?',
                options: ['Lục bát', 'Song thất lục bát', 'Thất ngôn bát cú Đường luật', 'Thơ tự do tám chữ'],
                correctAnswer: 'Lục bát',
                difficulty: 'easy'
            },
            {
                questionText: 'Thành phần phụ nào trong câu bổ sung ý nghĩa về thời gian, địa điểm, mục đích, phương tiện?',
                options: ['Trạng ngữ', 'Chủ ngữ', 'Vị ngữ', 'Khởi ngữ'],
                correctAnswer: 'Trạng ngữ',
                difficulty: 'easy'
            },
            {
                questionText: 'Từ nào sau đây đồng nghĩa với từ "Tổ quốc"?',
                options: ['Giang sơn', 'Thiên nhiên', 'Vũ trụ', 'Cố hương'],
                correctAnswer: 'Giang sơn',
                difficulty: 'medium'
            },
            {
                questionText: 'Nhân vật chú bé Hồng trong đoạn trích "Trong lòng mẹ" là của nhà văn nào?',
                options: ['Nguyên Hồng', 'Nam Cao', 'Thạch Lam', 'Vũ Trọng Phụng'],
                correctAnswer: 'Nguyên Hồng',
                difficulty: 'medium'
            }
        ]
    },
    {
        subjectKey: 'su',
        title: 'Lịch Sử Dân Tộc & Những Trang Sử Hào Hùng - APEC Group',
        topic: 'Lịch sử',
        description: 'Hành trình qua các thời khắc lịch sử dựng nước và giữ nước oai hùng của dân tộc Việt Nam do APEC Group đúc kết.',
        questions: [
            {
                questionText: 'Ngô Quyền đã lãnh đạo nhân dân đánh tan quân Nam Hán trên sông Bạch Đằng vào năm nào?',
                options: ['Năm 938', 'Năm 981', 'Năm 1077', 'Năm 1288'],
                correctAnswer: 'Năm 938',
                difficulty: 'easy'
            },
            {
                questionText: 'Chiến thắng lịch sử Điện Biên Phủ "lừng lẫy năm châu, chấn động địa cầu" diễn ra vào năm nào?',
                options: ['Năm 1954', 'Năm 1945', 'Năm 1975', 'Năm 1968'],
                correctAnswer: 'Năm 1954',
                difficulty: 'easy'
            },
            {
                questionText: 'Ai là tác giả của câu nói khẳng khái: "Đầu tôi chưa rơi xuống đất, xin bệ hạ đừng lo"?',
                options: ['Thái sư Trần Thủ Độ', 'Hưng Đạo Vương Trần Quốc Tuấn', 'Trần Quốc Toản', 'Lý Thường Kiệt'],
                correctAnswer: 'Thái sư Trần Thủ Độ',
                difficulty: 'medium'
            },
            {
                questionText: 'Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình vào ngày tháng năm nào?',
                options: ['Ngày 2/9/1945', 'Ngày 19/8/1945', 'Ngày 30/4/1975', 'Ngày 22/12/1944'],
                correctAnswer: 'Ngày 2/9/1945',
                difficulty: 'easy'
            },
            {
                questionText: 'Vị vua nào đã ban "Chiếu dời đô" từ Hoa Lư về thành Thăng Long vào năm 1010?',
                options: ['Lý Công Uẩn (Lý Thái Tổ)', 'Đinh Tiên Hoàng', 'Lê Hoàn (Lê Đại Hành)', 'Trần Thái Tông'],
                correctAnswer: 'Lý Công Uẩn (Lý Thái Tổ)',
                difficulty: 'easy'
            },
            {
                questionText: 'Cuộc khởi nghĩa Hai Bà Trưng bùng nổ chống lại ách đô hộ của nhà Đông Hán diễn ra vào năm nào?',
                options: ['Năm 40', 'Năm 248', 'Năm 542', 'Năm 905'],
                correctAnswer: 'Năm 40',
                difficulty: 'easy'
            },
            {
                questionText: 'Danh tướng nào được lịch sử tôn xưng là "Vạn Thắng Vương" sau khi dẹp loạn 12 sứ quân?',
                options: ['Đinh Bộ Lĩnh (Đinh Tiên Hoàng)', 'Lê Lợi', 'Nguyễn Huệ', 'Phùng Hưng'],
                correctAnswer: 'Đinh Bộ Lĩnh (Đinh Tiên Hoàng)',
                difficulty: 'medium'
            },
            {
                questionText: 'Chiến dịch Hồ Chí Minh lịch sử giải phóng hoàn toàn miền Nam thống nhất đất nước toàn thắng vào ngày nào?',
                options: ['30/4/1975', '26/3/1975', '1/5/1975', '19/5/1975'],
                correctAnswer: '30/4/1975',
                difficulty: 'easy'
            }
        ]
    }
];

const weeklyChallengeData = [
    {
        weekNumber: 1,
        title: 'Thử Thách Tuần 01: Vũ Trụ Bí Ẩn & Khoa Học Không Gian',
        topic: 'Thiên văn học',
        badge: 'Tuần 1 • Đang diễn ra',
        description: 'Sự kiện thi đấu tuần 1: Đọ sức hiểu biết về các hành tinh, hố đen kỳ bí và hành trình thám hiểm vũ trụ.',
        questions: [
            {
                questionText: 'Hành tinh nào trong hệ Mặt Trời được mệnh danh là "Hành tinh Đỏ"?',
                options: ['Sao Hỏa (Mars)', 'Sao Kim (Venus)', 'Sao Thủy (Mercury)', 'Sao Mộc (Jupiter)'],
                correctAnswer: 'Sao Hỏa (Mars)',
                difficulty: 'easy'
            },
            {
                questionText: 'Thiên thể nào là trung tâm lực hấp dẫn của hệ Mặt Trời?',
                options: ['Mặt Trời', 'Trái Đất', 'Sao Mộc', 'Hố đen trung tâm'],
                correctAnswer: 'Mặt Trời',
                difficulty: 'easy'
            },
            {
                questionText: 'Hành tinh nào có kích thước và khối lượng lớn nhất trong hệ Mặt Trời?',
                options: ['Sao Mộc (Jupiter)', 'Sao Thổ (Saturn)', 'Sao Hải Vương (Neptune)', 'Sao Thiên Vương (Uranus)'],
                correctAnswer: 'Sao Mộc (Jupiter)',
                difficulty: 'easy'
            },
            {
                questionText: 'Ai là người đầu tiên trong lịch sử nhân loại bay vào không gian vũ trụ (1961)?',
                options: ['Yuri Gagarin', 'Neil Armstrong', 'Buzz Aldrin', 'Phạm Tuân'],
                correctAnswer: 'Yuri Gagarin',
                difficulty: 'medium'
            },
            {
                questionText: 'Kính viễn vọng không gian nào được phóng vào năm 2021 thay thế cho kính viễn vọng Hubble?',
                options: ['James Webb', 'Kepler', 'Spitzer', 'Chandra'],
                correctAnswer: 'James Webb',
                difficulty: 'medium'
            },
            {
                questionText: 'Thiên hà xoắn ốc chứa hệ Mặt Trời của chúng ta có tên gọi là gì?',
                options: ['Ngân Hà (Milky Way)', 'Andromeda (Tiên Nữ)', 'Sombrero', 'Triangulum'],
                correctAnswer: 'Ngân Hà (Milky Way)',
                difficulty: 'easy'
            },
            {
                questionText: 'Khu vực trong không gian có lực hấp dẫn mạnh đến mức ngay cả ánh sáng cũng không thể thoát ra gọi là gì?',
                options: ['Hố đen (Black hole)', 'Sao neutron', 'Hố trắng', 'Tinh vân'],
                correctAnswer: 'Hố đen (Black hole)',
                difficulty: 'easy'
            },
            {
                questionText: 'Người Việt Nam và người châu Á đầu tiên bay vào vũ trụ là ai?',
                options: ['Trung tướng Phạm Tuân', 'Nguyễn Tuân', 'Đặng Thái Sơn', 'Lê Lợi'],
                correctAnswer: 'Trung tướng Phạm Tuân',
                difficulty: 'easy'
            }
        ]
    },
    {
        weekNumber: 2,
        title: 'Thử Thách Tuần 02: Bí Ẩn Đại Dương & Đa Dạng Sinh Thái',
        topic: 'Khoa học Tự nhiên',
        badge: 'Tuần 2 • Sắp mở màn',
        description: 'Sự kiện thi đấu tuần 2: Du hành đáy đại dương, khám phá rạn san hô, rãnh Mariana và các sinh vật huyền bí.',
        questions: [
            {
                questionText: 'Đại dương nào có diện tích và độ sâu lớn nhất trên hành tinh Trái Đất?',
                options: ['Thái Bình Dương', 'Đại Tây Dương', 'Ấn Độ Dương', 'Bắc Băng Dương'],
                correctAnswer: 'Thái Bình Dương',
                difficulty: 'easy'
            },
            {
                questionText: 'Điểm sâu nhất được biết đến dưới đáy đại dương thuộc rãnh nào?',
                options: ['Rãnh Mariana (Vực thẳm Challenger)', 'Rãnh Puerto Rico', 'Rãnh Java', 'Rãnh Tonga'],
                correctAnswer: 'Rãnh Mariana (Vực thẳm Challenger)',
                difficulty: 'easy'
            },
            {
                questionText: 'Loài động vật có kích thước lớn nhất từng sinh sống trên Trái Đất là gì?',
                options: ['Cá voi xanh', 'Khủng long bạo chúa', 'Cá mập voi', 'Mực khổng lồ'],
                correctAnswer: 'Cá voi xanh',
                difficulty: 'easy'
            },
            {
                questionText: 'Rạn san hô ngầm lớn nhất thế giới nằm ở bờ biển quốc gia nào?',
                options: ['Australia (Úc)', 'Việt Nam', 'Brazil', 'Indonesia'],
                correctAnswer: 'Australia (Úc)',
                difficulty: 'easy'
            },
            {
                questionText: 'Nước biển có vị mặn chủ yếu là do nồng độ của loại muối khoáng nào?',
                options: ['Natri Clorua (NaCl)', 'Magie Sunfat (MgSO₄)', 'Canxi Cacbonat (CaCO₃)', 'Kali Clorua (KCl)'],
                correctAnswer: 'Natri Clorua (NaCl)',
                difficulty: 'easy'
            },
            {
                questionText: 'Hiện tượng thủy triều lên và xuống trên các vùng biển Trái Đất chủ yếu do lực hút của thiên thể nào?',
                options: ['Mặt Trăng', 'Sao Kim', 'Mặt Trời duy nhất', 'Gió bão'],
                correctAnswer: 'Mặt Trăng',
                difficulty: 'medium'
            },
            {
                questionText: 'Sinh vật nào dưới đáy biển sâu có khả năng tự phát sáng thông qua phản ứng hóa học (bioluminescence)?',
                options: ['Cá lồng đèn (Anglerfish)', 'Cá hồi', 'Cá trích', 'Sao biển cát'],
                correctAnswer: 'Cá lồng đèn (Anglerfish)',
                difficulty: 'medium'
            },
            {
                questionText: 'Đại dương bao phủ khoảng bao nhiêu phần trăm bề mặt Trái Đất?',
                options: ['Khoảng 71%', 'Khoảng 50%', 'Khoảng 85%', 'Khoảng 60%'],
                correctAnswer: 'Khoảng 71%',
                difficulty: 'easy'
            }
        ]
    },
    {
        weekNumber: 3,
        title: 'Thử Thách Tuần 03: Đấu Trí Trí Tuệ Nhân Tạo & Cách Mạng 4.0',
        topic: 'Công nghệ AI',
        badge: 'Tuần 3 • Siêu điểm thưởng',
        description: 'Sự kiện thi đấu tuần 3: Đấu trí với kho câu hỏi công nghệ số, Internet, AI và các phát minh định hình tương lai.',
        questions: [
            {
                questionText: 'Từ viết tắt "AI" trong lĩnh vực công nghệ có nghĩa là gì?',
                options: ['Artificial Intelligence (Trí tuệ nhân tạo)', 'Automated Internet', 'Advanced Interface', 'Active Integration'],
                correctAnswer: 'Artificial Intelligence (Trí tuệ nhân tạo)',
                difficulty: 'easy'
            },
            {
                questionText: 'Ai được xem là "Cha đẻ của khoa học máy tính và trí tuệ nhân tạo"?',
                options: ['Alan Turing', 'Steve Jobs', 'Bill Gates', 'Elon Musk'],
                correctAnswer: 'Alan Turing',
                difficulty: 'medium'
            },
            {
                questionText: 'Ngôn ngữ lập trình nào hiện nay phổ biến nhất trong nghiên cứu trí tuệ nhân tạo và học máy?',
                options: ['Python', 'HTML', 'Pascal', 'CSS'],
                correctAnswer: 'Python',
                difficulty: 'easy'
            },
            {
                questionText: 'Hệ nhị phân (Binary) sử dụng hai chữ số nào để biểu diễn mọi dữ liệu máy tính?',
                options: ['0 và 1', '1 và 2', '0 và 9', 'A và B'],
                correctAnswer: '0 và 1',
                difficulty: 'easy'
            },
            {
                questionText: 'Mạng toàn cầu kết nối các máy tính trên thế giới có tên viết tắt là WWW. Nó là viết tắt của cụm từ nào?',
                options: ['World Wide Web', 'World Web Wide', 'Wide World Wireless', 'Web World Wide'],
                correctAnswer: 'World Wide Web',
                difficulty: 'easy'
            },
            {
                questionText: 'Thử nghiệm Turing (Turing Test) được thiết kế nhằm mục đích gì?',
                options: ['Kiểm tra khả năng biểu hiện trí thông minh tương đương con người của máy móc', 'Kiểm tra tốc độ của vi xử lý CPU', 'Kiểm tra độ bảo mật mật khẩu', 'Đo dung lượng bộ nhớ RAM'],
                correctAnswer: 'Kiểm tra khả năng biểu hiện trí thông minh tương đương con người của máy móc',
                difficulty: 'medium'
            },
            {
                questionText: 'Hệ điều hành Android phổ biến trên điện thoại thông minh hiện nay do tập đoàn nào phát triển?',
                options: ['Google', 'Apple', 'Microsoft', 'Samsung'],
                correctAnswer: 'Google',
                difficulty: 'easy'
            },
            {
                questionText: 'Thuật ngữ "Cloud Computing" trong tiếng Việt có nghĩa là gì?',
                options: ['Điện toán đám mây', 'Tính toán trên trời', 'Mạng máy tính vệ tinh', 'Lưu trữ đĩa mềm'],
                correctAnswer: 'Điện toán đám mây',
                difficulty: 'easy'
            }
        ]
    }
];

async function seedDefaultAndWeeklySets() {
    try {
        console.log('🔄 Đang kiểm tra và khởi tạo dữ liệu bộ câu hỏi APEC Group & Weekly...');

        // 1. Tìm hoặc tạo tài khoản "APEC Group"
        let apecUser = await User.findOne({ username: 'APEC Group' });
        if (!apecUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('ApecGroup@2026', salt);
            apecUser = await User.create({
                username: 'APEC Group',
                displayName: 'APEC Group (Ban Tổ Chức)',
                password: hashedPassword,
                role: 'admin',
                highScore: 9999,
                weeklyScore: 9999,
                email: 'contact@apecgroup.edu.vn',
                phone: '19008888',
                avatar: ''
            });
            console.log('✅ Đã tạo tài khoản chính thức: APEC Group');
        }

        // 2. Khởi tạo 7 bộ câu hỏi Default
        for (const item of defaultSubjectData) {
            let existingSet = await QuestionSet.findOne({ 
                title: item.title,
                isDefault: true 
            });

            if (!existingSet) {
                // Tạo câu hỏi lẻ
                const createdQuestionIds = [];
                for (const q of item.questions) {
                    const createdQ = await Question.create({
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        difficulty: q.difficulty,
                        topic: item.topic,
                        owner: apecUser._id
                    });
                    createdQuestionIds.push(createdQ._id);
                }

                // Tạo bộ đề gắn kết các câu hỏi
                await QuestionSet.create({
                    title: item.title,
                    description: item.description,
                    topic: item.topic,
                    owner: apecUser._id,
                    authorName: 'APEC Group',
                    questions: createdQuestionIds,
                    isPublic: true,
                    isDefault: true,
                    isWeekly: false,
                    badge: 'APEC Official',
                    likesCount: 99
                });
                console.log(`✅ Đã tạo bộ đề mặc định: [${item.topic}] ${item.title}`);
            }
        }

        // 3. Khởi tạo 3 bộ câu hỏi Weekly
        for (const item of weeklyChallengeData) {
            let existingSet = await QuestionSet.findOne({ 
                title: item.title,
                isWeekly: true 
            });

            if (!existingSet) {
                const createdQuestionIds = [];
                for (const q of item.questions) {
                    const createdQ = await Question.create({
                        questionText: q.questionText,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        difficulty: q.difficulty,
                        topic: item.topic,
                        owner: apecUser._id
                    });
                    createdQuestionIds.push(createdQ._id);
                }

                await QuestionSet.create({
                    title: item.title,
                    description: item.description,
                    topic: item.topic,
                    owner: apecUser._id,
                    authorName: 'APEC Group',
                    questions: createdQuestionIds,
                    isPublic: true,
                    isDefault: false,
                    isWeekly: true,
                    weekNumber: item.weekNumber,
                    badge: item.badge,
                    likesCount: 150
                });
                console.log(`🌟 Đã tạo bộ đề Weekly Tuần ${item.weekNumber}: ${item.title}`);
            }
        }

        // 4. Khởi tạo một số người chơi mẫu cho Leaderboard thêm sinh động nếu chưa có
        const sampleCompetitors = [
            { username: 'DragonMaster', displayName: 'Vũ Long ⚡', weeklyScore: 1950, highScore: 2600, role: 'user' },
            { username: 'MinhAnh_GenZ', displayName: 'Minh Anh 🌸', weeklyScore: 1820, highScore: 2350, role: 'user' },
            { username: 'QuizMaster_HUST', displayName: 'Đức Thịnh 🎓', weeklyScore: 1710, highScore: 2180, role: 'user' },
            { username: 'CyberStar', displayName: 'Hoàng Yến ✨', weeklyScore: 1540, highScore: 1980, role: 'user' },
            { username: 'HaoNam_K12', displayName: 'Hào Nam 🚀', weeklyScore: 1420, highScore: 1750, role: 'user' }
        ];

        const salt = await bcrypt.genSalt(10);
        const defaultPwd = await bcrypt.hash('Player@123', salt);
        for (const p of sampleCompetitors) {
            const exists = await User.findOne({ username: p.username });
            if (!exists) {
                await User.create({
                    ...p,
                    password: defaultPwd,
                    email: `${p.username.toLowerCase()}@gmail.com`
                });
            }
        }

        console.log('🎉 Hoàn tất kiểm tra dữ liệu bộ câu hỏi APEC Group & Weekly!');
    } catch (err) {
        console.error('❌ Lỗi khi khởi tạo seedData:', err);
    }
}

module.exports = { seedDefaultAndWeeklySets };
