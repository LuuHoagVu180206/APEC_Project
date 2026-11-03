# APEC EduGame - Mô Tả Dự Án & Tiến Độ Phát Triển

Dự án **APEC EduGame** là nền tảng học tập kết hợp trò chơi hóa (Gamified EdTech) dành cho học sinh, giáo viên và các tổ chức trường học. Dự án cho phép người dùng ôn luyện kiến thức qua các trò chơi tương tác, sáng tạo và quản lý ngân hàng câu hỏi, tổ chức lớp học và gắn kết cộng đồng trường học.

---

## 1. CÁC CHỨC NĂNG & GIAO DIỆN ĐÃ HOÀN THÀNH

### 1.1. Landing Page (Trang chủ)
- **Giao diện chuẩn phong cách Positivus**:
  - Tông màu chủ đạo: Xanh nhạt hiện đại (Light Cyan / Sky Blue: `#7dd3fc`, `#38bdf8`, `#0ea5e9`), đồng bộ với hệ thống Lớp học và Trường học.
  - Bố cục Hero 2 cột: Cột trái chứa tiêu đề lớn, mô tả và cụm nút CTA kép (`[ Bắt đầu chơi ngay ]` & `[ Dành cho Giáo viên ]`); cột phải là khung minh họa nghệ thuật với viền đen `2px` và đổ bóng nổi `0 5px 0 #191a23`.
  - Dải Ticker môn học (Subject Ticker Bar): Các nhãn môn học bo góc mềm mại, sáng màu xanh khi di chuột.
  - Section Header phong cách Positivus: Nhãn badge màu xanh nhạt chữ đậm (`[ Thử Thách Tuần ]`, `[ Bộ Câu Hỏi ]`, `[ Quy Trình ]`, `[ Trò Chơi Hóa ]`).
  - Hệ thống thẻ Bento Grid: Bo góc `28px`, viền `2px solid #191a23`, đổ bóng nổi `0 5px 0 #191a23`, tiêu đề phân dòng dạng badge pill không dùng blur. Gồm 3 biến thể màu xen kẽ: thẻ xám sáng, thẻ xanh nhạt chủ đạo và thẻ đen than chì.
  - Banner Studio cho giáo viên ("Sáng tạo bộ đề thi của riêng bạn"): Thiết kế thẻ lớn bo góc `32px` với đồ họa trang trí phong cách Positivus.
  - Khối Quy trình hoạt động tương tác (Working Process Accordion): Bộ accordion 4 bước đánh số `01`, `02`, `03`, `04`, bước được chọn tự động mở rộng kèm nút toggle `−` / `+`.
  - Footer chuẩn Positivus: Bo góc trên cong `36px`, nền than chì sâu `#191a23`, chia cột danh mục rõ ràng.
- **Tính năng trên Landing Page**:
  - Hỗ trợ Dark/Light Theme toggle mượt mà.
  - Tìm kiếm nhanh bộ câu hỏi (tự động chuyển hướng sang Thư viện với từ khóa).
  - Tích hợp dữ liệu động từ backend: Bộ đề sự kiện tuần (`GET /api/sets/weekly`) và bộ đề mẫu chuẩn APEC (`GET /api/sets/defaults`).

### 1.2. Xác Thực & Khôi Phục Mật Khẩu (Auth & Forgot Password)
- **Đăng ký & Đăng nhập (`/login`)**:
  - Đăng nhập tài khoản với JWT (`jsonwebtoken`) lưu trong `localStorage`.
  - Đăng ký tài khoản (hỗ trợ phân quyền `user` và `teacher`, chọn role trực tiếp trên giao diện hoặc qua query parameter).
  - Hỗ trợ chế độ chơi Khách (Guest) không cần đăng nhập.
  - Tự động mã hóa mật khẩu bảo mật bằng `bcryptjs`.
- **Khôi phục mật khẩu qua Email OTP 3 bước (`/forgot-password`)**:
  - Bước 1: Nhập địa chỉ email -> Hệ thống sinh mã OTP 6 chữ số ngẫu nhiên, lưu băm mã vào bảng `PasswordResetOTP` với hạn 5 phút, gửi email thực tế qua `nodemailer`.
  - Bước 2: Nhập mã OTP 6 chữ số -> Xác thực mã (tối đa 5 lần thử), trả về `resetToken` dùng 1 lần trong 10 phút.
  - Bước 3: Đặt mật khẩu mới kèm xác nhận mật khẩu -> Băm mật khẩu mới và lưu vào cơ sở dữ liệu.

### 1.3. Trò Chơi Trắc Nghiệm Tương Tác (Iframe Game - `/game`)
- Nhúng game tương tác (Godot / HTML5 WebGL canvas) qua thẻ `iframe`.
- Giao tiếp 2 chiều giữa Web React và Game qua `window.postMessage`:
  - Nạp danh sách câu hỏi, các lựa chọn và đáp án vào game.
  - Lắng nghe sự kiện kết thúc ván chơi và gửi kết quả về web.
- Tự động nạp bộ câu hỏi theo tham số URL `?setId=...` hoặc mở modal chọn bộ đề (Bộ đề mặc định APEC, Bộ đề tuần, Bộ đề của tôi).
- Lưu điểm số tự động vào hệ thống (`POST /api/scores/score`):
  - Cập nhật kỷ lục cá nhân `highScore`.
  - Cập nhật điểm tuần `weeklyScore` khi chơi các bộ đề Thử thách tuần.
  - Lưu lại lịch sử chơi `playHistory` và `weeklyHistory`.
- Tính năng bật/tắt toàn màn hình (Fullscreen) và khởi động lại màn chơi.

### 1.4. Studio - Không Gian Sáng Tạo & Quản Lý Đề Thi (`/studio`)
- **Quản lý Bộ câu hỏi (Question Sets)**:
  - Xem danh sách bộ câu hỏi do người dùng tạo (số lượng câu, trạng thái công khai, lượt thích, huy hiệu).
  - Thu gọn chức năng tạo mới thành menu bấm trực quan: "Tạo câu hỏi mới" và "Tạo bộ đề mới".
  - Modal tạo bộ câu hỏi: Nhập tiêu đề, mô tả, chủ đề/môn học, tùy chọn Công khai (`isPublic`) và Ẩn danh (`isAnonymous`).
  - Xóa bộ câu hỏi.
  - Nhấp vào thẻ bộ câu hỏi sẽ chuyển trực tiếp đến trang Chi tiết bộ câu hỏi (`/set/:id`).
- **Ngân hàng câu hỏi lẻ (Question Bank)**:
  - Xem danh sách câu hỏi do bản thân biên soạn.
  - Nhấp trực tiếp vào từng câu hỏi để mở modal chỉnh sửa nội dung, đáp án và độ khó.
  - Nút thêm câu hỏi vào bộ: Mở modal danh sách các bộ đề của người dùng để chọn thêm vào.
  - Xóa câu hỏi lẻ.
- **Xuất tệp dữ liệu chuyên nghiệp**:
  - Xuất bộ câu hỏi ra file Excel (`.xlsx`) sử dụng thư viện `exceljs`.
  - Xuất bộ câu hỏi ra file tài liệu PDF sử dụng thư viện `pdfkit` kèm font tiếng Việt `Lora`.

### 1.5. Trang Chi Tiết Bộ Câu Hỏi (`/set/:id`)
- **Dành cho Chủ sở hữu (Owner)**:
  - Chỉnh sửa trực tiếp thông tin bộ đề ngay trên trang: Tên bộ đề, mô tả, môn học, chuyển đổi trạng thái Public/Private, bật/tắt chế độ đăng Ẩn danh.
  - Thêm câu hỏi vào bộ đề với 2 chế độ linh hoạt:
    1. Soạn câu hỏi mới trực tiếp.
    2. Chọn từ kho câu hỏi đã có trong ngân hàng cá nhân (có tìm kiếm, chọn nhiều câu cùng lúc).
  - Xóa câu hỏi khỏi bộ đề ngay tại trang chi tiết.
  - Nút chuyển nhanh về Studio.
  - Tự động ẩn nút "Lưu bộ câu hỏi" (ngăn chủ sở hữu tự lưu đề của mình).
- **Dành cho Người xem khác (Visitor / Student)**:
  - Xem toàn bộ danh sách câu hỏi và đáp án để ôn tập.
  - Hiển thị chính xác tên tác giả (ưu tiên `displayName`, fallback `username`). Nếu tác giả chọn Ẩn danh, hệ thống sẽ hiển thị "Ẩn danh" đối với mọi người dùng thường (chỉ tài khoản Admin và chính chủ sở hữu mới thấy tên thật).
  - Nút "Lưu bộ câu hỏi" (Thả tim vào tủ đồ cá nhân).
  - Nút "Sao chép bộ đề": Tự động nhân bản bộ đề về Studio của người dùng dưới dạng Private với hậu tố `-copy` trong tên.
  - Nút "Luyện tập ngay" (chuyển sang `/game?setId=...`).
  - Nút xuất file PDF và Excel.

### 1.6. Thư Viện Cộng Đồng (Community Library - `/library`)
- Khám phá các bộ câu hỏi được chia sẻ công khai từ cộng đồng và các bộ đề chuẩn mực của APEC Group.
- Tìm kiếm bộ đề theo từ khóa và lọc theo chủ đề/môn học (Toán, Vật lý, Hóa học, Sinh học, Tiếng Anh, Lịch sử, Ngữ văn,...).
- Thả tim / Bỏ tim bộ câu hỏi để lưu vào tài khoản cá nhân.
- Cơ chế tác giả chuẩn xác: Hiển thị tên hiển thị của người biên soạn hoặc hiển thị "Ẩn danh" theo đúng cài đặt bảo mật của bộ đề.

### 1.7. Hồ Sơ Cá Nhân (User Profile - `/profile`)
- Chỉnh sửa thông tin tài khoản: Họ và tên (`fullName`), Tên hiển thị (`displayName`), Số điện thoại (`phone`), Email (`email`).
- Cơ chế Tên hiển thị thông minh: Tự động dùng `username` đăng nhập làm mặc định nếu người dùng chưa đặt tên hiển thị hoặc để trống.
- Tải lên ảnh đại diện (`avatar`) từ máy tính cá nhân (hỗ trợ preview, giới hạn dung lượng 3MB, lưu trữ base64 an toàn, có nút gỡ avatar để quay về avatar chữ cái mặc định).
- Đổi mật khẩu bảo mật ngay trong trang hồ sơ (nhập mật khẩu hiện tại, mật khẩu mới tối thiểu 6 ký tự và xác nhận mật khẩu mới).
- Thống kê thành tích cá nhân: Hiển thị điểm kỷ lục cá nhân (`highScore`), điểm thi đấu tuần (`weeklyScore`) và lịch sử các ván chơi gần nhất.

### 1.8. Bảng Xếp Hạng Toàn Hệ Thống (Leaderboard - `/leaderboard`)
- **Hai chế độ xếp hạng độc lập**:
  1. **Thử Thách Tuần (Weekly Challenge)**: Xếp hạng dựa trên điểm số đạt được trong các bộ đề tuần của APEC Group (`weeklyScore`).
  2. **Bảng Vinh Danh Toàn Thời Gian**: Xếp hạng dựa trên kỷ lục điểm số cao nhất từ trước đến nay (`highScore`).
- Bục vinh quang Top 3 đặc sắc: Hiển thị trực quan Hạng 1 (Cúp Vàng), Hạng 2 (Cúp Bạc), Hạng 3 (Cúp Đồng) với avatar và huy hiệu tương ứng.
- Danh sách bảng xếp hạng Top 4 đến Top 20.
- Khung thứ hạng cá nhân: Hiển thị vị trí hiện tại và điểm số của người dùng đang đăng nhập, kèm nút "Chơi Game Leo Hạng Ngay".

### 1.9. Dashboard Giáo Viên & Quản Lý Lớp Học
- **Bảng điều khiển giáo viên (`/teacher/dashboard`)**:
  - Xem danh sách các lớp học do giáo viên phụ trách.
  - Tạo lớp học mới (`/teacher/classes/new`): Điền tên lớp, môn học, mô tả và chọn trường liên kết.
  - Tự động sinh mã tham gia lớp học 8 ký tự ngẫu nhiên (VD: `AB12CD34`).
- **Chi tiết lớp học (`/teacher/classes/:id`)**:
  - Thống kê sĩ số học sinh, sĩ số giáo viên, số bộ câu hỏi đã gán vào lớp.
  - Quản lý danh sách học sinh: Tìm kiếm, phân trang, gán học sinh làm Trợ giảng (thăng cấp / hạ cấp trợ giảng).
  - Gán bộ câu hỏi từ Studio vào giảng dạy trong lớp.
- **Dành cho học sinh (`/student/classes`)**:
  - Tham gia lớp học nhanh bằng mã code 8 ký tự.
  - Xem danh sách các lớp học bản thân đang tham gia.
  - Giáo viên cũng có thể tham gia lớp học khác với vai trò học sinh/trợ giảng bằng mã code.

### 1.10. Cộng Đồng Trường Học (School Community)
- **Khám phá & Tham gia trường (`/schools`)**:
  - Tìm kiếm các trường học đã được cấp phép trên hệ thống.
  - Xem danh sách trường của bản thân và danh sách tất cả các trường.
  - Gửi yêu cầu xin tham gia trường.
- **Bảng điều khiển trường học (`/schools/:schoolId`)**:
  - Thống kê: Tổng số thành viên, sĩ số giáo viên, sĩ số học sinh, số lớp học trực thuộc trường.
  - Bảng tin thông báo (Announcements): Quản lý trường đăng thông báo, xóa thông báo.
  - Kho đề thi chung của trường (Shared Question Sets): Chia sẻ và sử dụng bộ đề thi giữa các lớp trong trường.
  - Danh sách các lớp học trực thuộc trường (tạo lớp mới trong trường, import lớp đã có vào trường).
  - Danh sách thành viên trường (xem danh sách giáo viên, học sinh, quản lý thành viên).
- **Yêu cầu mở trường mới & Admin duyệt**:
  - Người dùng gửi yêu cầu mở trường (`/school-requests/new`).
  - Ban quản trị (Admin) xem danh sách chờ và phê duyệt hoặc từ chối yêu cầu (`/school-requests/admin`).
  - Quản trị viên quản lý danh sách toàn bộ trường học trong hệ thống (`/admin/schools`, `/admin/schools/:schoolId`).

### 1.11. Hệ Thống Thông Báo Hiện Đại (Toast Notification System)
- Thay thế hoàn toàn các hộp thoại `alert()` truyền thống bằng hệ thống Toast Notification (`client/src/components/ToastContainer.jsx`, `client/src/utils/toast.js`).
- Hỗ trợ đầy đủ các trạng thái: `success`, `error`, `info`, `warning` với hiệu ứng trượt, màu sắc đồng bộ theme và font chữ của hệ thống.

---

## 2. CÁC TÍNH NĂNG ĐANG DỞ DANG HOẶC CẦN TRIỂN KHAI TIẾP

| STT | Tính năng | Hiện trạng | Kế hoạch cần làm |
| :--- | :--- | :--- | :--- |
| 1 | **Import câu hỏi từ file CSV / Excel** | Chưa có | Cần cài đặt `multer` ở backend, viết controller đọc file `.xlsx` / `.csv`, parse danh sách câu hỏi (cột: Câu hỏi, Đáp án A, B, C, D, Đáp án đúng, Độ khó) và lưu vào cơ sở dữ liệu. Thêm modal upload file ở Studio. |
| 2 | **Bài tập trong Lớp học (Assignments)** | Đang hardcode | Backend `classes.js` đang trả về `assignmentCount: 0` và `assignments: []`. Cần tạo Model `Assignment`, cho phép giáo viên tạo bài tập từ bộ đề kèm thời hạn nộp bài (deadline), học sinh làm bài và ghi nhận điểm số. |
| 3 | **Xác thực Email OTP khi đổi thông tin quan trọng** | Chưa có | Khi người dùng thay đổi Email hoặc các thông tin bảo mật quan trọng trong Profile, cần gửi mã OTP về email để xác nhận trước khi cập nhật vào cơ sở dữ liệu. |
| 4 | **Chuẩn hóa Component Navbar 100%** | Đã có component nhưng chưa áp dụng hết | `Navbar.jsx` đã được tạo và dùng ở Studio, Leaderboard, School Discovery, Student Classes. Cần thay thế inline header ở `LibraryPage`, `ProfilePage`, `QuestionSetPage`, `GamePage` bằng `<Navbar activePage="..." />` để đồng bộ 100%. |
| 5 | **Đấu trí đối kháng trực tiếp (Multiplayer Game qua Socket.io)** | Backend đã có khung, Client chưa có UI | `server/index.js` đã hỗ trợ tạo phòng PIN 6 số (`create_lobby`, `join_lobby`), nhưng giao diện client (`GamePage.jsx`) hiện tại chỉ mới chơi đơn (Single Player) qua `iframe`. Cần bổ sung UI tạo phòng thi đấu nhiều người. |

---

## 3. CÁC LỖI KỸ THUẬT (BUG) ĐÃ XỬ LÝ & CÁC LƯU Ý KỸ THUẬT

1. **Lỗi 404 lưu điểm & BXH đã khắc phục hoàn toàn**:
   - `GamePageLogic.js`: Đã sửa endpoint gửi điểm về đúng `POST /api/scores/score`.
   - `LeaderboardPageLogic.js`: Đã sửa cú pháp import React và gọi đúng `GET /api/scores/leaderboard`.
2. **Cơ chế Tác giả & Ẩn danh (Anonymous Mode)**:
   - Tên tác giả hiển thị ưu tiên `displayName` -> `username`.
   - Cơ chế Ẩn danh: Khi bộ đề công khai được đánh dấu `isAnonymous: true`, API và giao diện Thư viện/Chi tiết sẽ ẩn tên tác giả thành "Ẩn danh" đối với người dùng thông thường; chỉ tài khoản `admin` và chính chủ sở hữu mới thấy tên thật.
3. **Quyền sở hữu bộ đề**:
   - Ngăn chặn triệt để chủ sở hữu tự lưu (thả tim) bộ đề của chính mình (`PUT /api/users/toggle-save-set`).
   - Phân quyền nghiêm ngặt ở trang `/set/:id`: Chỉ chủ sở hữu mới có quyền chỉnh sửa thông tin, thêm câu hỏi, xóa câu hỏi.
4. **Font chữ & Typography**:
   - Thống nhất font chữ toàn hệ thống là `"Iosevka Charon Mono", monospace` hỗ trợ tiếng Việt đầy đủ.
   - Không sử dụng font pixel art lỗi dấu tiếng Việt.
