# APEC EduGame - Cấu Trúc Hệ Thống, Kiến Trúc & Bộ Nhớ Thường Trực

Tài liệu này lưu trữ toàn bộ cấu trúc mã nguồn thực tế, kiến trúc hệ thống, đối chiếu tính năng và các lưu ý kỹ thuật quan trọng của dự án **APEC EduGame**. Agent và lập trình viên phải luôn tuân thủ và đối chiếu các thông tin này khi phát triển, tối ưu hoặc sửa lỗi.

---

## 1. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ

### 1.1. Frontend
- **Công nghệ nền tảng**: React 19, React Router v7 (`react-router-dom`), Icons vector (`lucide-react`), HTTP client (`axios`).
- **Giao diện & Theme**: Hệ thống Dark/Light Theme đồng bộ qua Custom Hook `useDarkMode.js`.
- **Hệ thống Font chữ**: Toàn bộ hệ thống thống nhất sử dụng font `"Iosevka Charon Mono", monospace` (hỗ trợ hiển thị tiếng Việt có dấu hoàn hảo, rõ ràng, hiện đại).
- **Quy ước kiến trúc phân tách 3 lớp độc lập**:
  - `client/src/pages/`: Các file `.jsx` chỉ chứa cấu trúc giao diện và layout.
  - `client/src/pages_logic/`: Các Custom Hook `.js` quản lý state, API (axios), điều hướng (`useNavigate`), xử lý sự kiện.
  - `client/src/pages_styling/`: Các file `.css` tương ứng cho từng màn hình.
  - `client/src/components/`: Chứa các component dùng chung (hiện có `Navbar.jsx`, `ToastContainer.jsx`, `BentoIllustration.jsx`, `GamePlayer.js`).
  - `client/src/utils/`: Chứa các hàm tiện ích dùng chung (`toast.js`, `authorUtils.js`).

### 1.2. Backend
- **Công nghệ nền tảng**: Node.js + Express 5, tích hợp HTTP Server với **Socket.io** (hỗ trợ phòng thi đấu trực tuyến, mã PIN 6 số, kết nối thời gian thực).
- **Xác thực & Bảo mật**: JSON Web Token (`jsonwebtoken`) + băm mật khẩu (`bcryptjs`). Middleware `verifyToken.js` (`verifyToken`, `verifyAdmin`).
- **Dịch vụ Email**: `nodemailer` (SMTP cấu hình qua `.env`, gửi OTP khôi phục mật khẩu 6 số an toàn).
- **Xử lý & Xuất tệp dữ liệu**:
  - `exceljs`: Xuất dữ liệu bộ câu hỏi ra tệp định dạng `.xlsx`.
  - `pdfkit`: Tạo tài liệu ôn tập và đề thi định dạng `.pdf` (tích hợp font tiếng Việt `Lora-VariableFont_wght.ttf` tại thư mục `server/fonts/`).

### 1.3. Cơ sở dữ liệu (Database)
- MongoDB với Mongoose (11 models):
  1. `User`: Quản lý tài khoản, mật khẩu băm, tên hiển thị (`displayName`), họ tên (`fullName`), email, số điện thoại, ảnh đại diện (`avatar`), điểm kỷ lục (`highScore`), điểm thi đấu tuần (`weeklyScore`), vai trò (`role`: `user`, `teacher`, `admin`), lịch sử chơi (`playHistory`, `weeklyHistory`), danh sách bộ đề đã lưu (`savedSets`).
  2. `Question`: Quản lý câu hỏi trắc nghiệm, các phương án chọn, đáp án đúng, môn học/chủ đề (`topic`), độ khó (`difficulty`: `easy`, `medium`, `hard`), chủ sở hữu (`owner`).
  3. `QuestionSet`: Quản lý bộ câu hỏi, tiêu đề, mô tả, môn học, danh sách câu hỏi tham chiếu (`questions`), trạng thái công khai (`isPublic`), chế độ đăng ẩn danh (`isAnonymous`), bộ đề chuẩn APEC (`isDefault`), bộ đề tuần (`isWeekly`, `weekNumber`), huy hiệu (`badge`), lượt thích (`likesCount`).
  4. `TeacherClass`: Quản lý lớp học của giáo viên, mã tham gia lớp học 8 ký tự (`classCode`), giáo viên chính (`teacher`), danh sách trợ giảng (`teachers`), danh sách học sinh (`students`), bộ đề gán vào lớp (`questionSets`), trường liên kết (`school`).
  5. `School`: Quản lý tổ chức trường học, tên trường, địa chỉ, người quản trị (`creator`), trạng thái duyệt.
  6. `SchoolMember`: Quản lý thành viên trong trường (`school`, `user`, vai trò trong trường `role`: `teacher`, `student`, `manager`).
  7. `SchoolRequest`: Quản lý yêu cầu thành lập trường mới từ người dùng gửi lên cho admin duyệt.
  8. `SchoolJoinRequest`: Quản lý yêu cầu xin gia nhập trường học của thành viên.
  9. `CommunityPost`: Quản lý bài thông báo (Announcements) trong trang cộng đồng trường.
  10. `PasswordResetOTP`: Quản lý mã OTP 6 số khôi phục mật khẩu, băm mã OTP, hạn sử dụng (5 phút), số lần thử (tối đa 5 lần), mã token đặt lại mật khẩu 1 lần (`resetTokenHash`).
  11. `GameSetting`: Quản lý phiên bản trò chơi game (`version`).

---

## 2. BẢN ĐỒ ROUTE & COMPONENT HỆ THỐNG

### 2.1. Frontend Routes (`client/src/App.js`):
| Đường dẫn URL | Component Giao Diện | File Logic Tương Ứng | Mô tả chức năng |
| :--- | :--- | :--- | :--- |
| `/` & `/landing` | `LandingPage.jsx` | `LandingPageLogic.js` | Trang chủ phong cách Positivus, Bento cards, quy trình, ticker môn học. |
| `/login` | `LoginPage.jsx` | `LoginPageLogic.js` | Đăng nhập, tab đăng ký (`?mode=register`), chọn role teacher/student, chế độ Khách. |
| `/forgot-password` | `ForgotPasswordPage.jsx` | `ForgotPasswordPageLogic.js` | Khôi phục mật khẩu qua Email OTP 3 bước bảo mật. |
| `/game` | `GamePage.jsx` | `GamePageLogic.js` | Nhúng game Godot/HTML5 qua `iframe`, postMessage 2 chiều, chọn bộ đề, tính điểm. |
| `/studio` | `StudioPage.jsx` | `StudioPageLogic.js` | Không gian tạo/sửa/xóa câu hỏi và bộ câu hỏi, xuất file Excel/PDF. |
| `/set/:id` | `QuestionSetPage.jsx` | `QuestionSetPageLogic.js` | Chi tiết bộ đề: Chủ sở hữu chỉnh sửa/thêm/xóa câu; Khách xem/lưu/sao chép bộ đề. |
| `/library` | `LibraryPage.jsx` | `LibraryPageLogic.js` | Thư viện cộng đồng, tìm kiếm bộ câu hỏi công khai, lọc môn học, thả tim lưu trữ. |
| `/profile` | `ProfilePage.jsx` | `ProfilePageLogic.js` | Hồ sơ cá nhân: Đổi tên hiển thị, tải lên/gỡ avatar, đổi mật khẩu, xem thống kê điểm. |
| `/leaderboard` | `LeaderboardPage.jsx` | `LeaderboardPageLogic.js` | Bảng xếp hạng Thử thách tuần & Toàn thời gian, bục vinh quang Top 3, vị trí cá nhân. |
| `/teacher/dashboard` | `TeacherDashboardPage.jsx` | `TeacherDashboardLogic.js` | Bảng điều khiển giáo viên quản lý danh sách lớp học, xem mã lớp. |
| `/teacher/classes/new`| `CreateClassPage.jsx` | `CreateClassPageLogic.js` | Giao diện tạo lớp học mới cho giáo viên. |
| `/teacher/classes/:id`| `TeacherClassPage.jsx` | `TeacherClassPageLogic.js` | Chi tiết lớp học: Quản lý học sinh, trợ giảng, gán bộ đề kiểm tra vào lớp. |
| `/student/classes` | `StudentClassesPage.jsx` | `StudentClassesPageLogic.js` | Giao diện học sinh/giáo viên tham gia lớp học bằng mã code 8 ký tự. |
| `/schools` | `SchoolDiscoveryPage.jsx` | `SchoolDiscoveryPageLogic.js`| Khám phá cộng đồng trường học, tìm kiếm và gửi yêu cầu gia nhập trường. |
| `/schools/:schoolId` | `SchoolDashboardPage.jsx` | `SchoolDashboardLogic.js` | Bảng điều khiển trường: Thống kê, thông báo, bộ đề chung, lớp trực thuộc, thành viên. |
| `/school-requests/new`| `SchoolRequestPage.jsx` | `SchoolRequestPageLogic.js` | Gửi đơn yêu cầu thành lập cộng đồng trường mới. |
| `/school-requests/admin`| `SchoolAdminRequestsPage.jsx` | `SchoolAdminRequestsLogic.js` | Ban quản trị (Admin) phê duyệt hoặc từ chối yêu cầu mở trường. |
| `/admin` | `AdminPage.jsx` | `AdminPageLogic.js` | Trang quản trị hệ thống tổng quan. |
| `/admin/schools` | `AdminSchoolsPage.jsx` | `AdminSchoolsPageLogic.js` | Danh sách quản lý các trường học dành cho Admin. |
| `/admin/schools/:schoolId`| `AdminSchoolDetailPage.jsx` | `AdminSchoolDetailPageLogic.js` | Chi tiết và cấu hình trường học dành cho Admin. |

### 2.2. Backend Endpoints (`server/index.js`):
- `/api/auth`: `auth.js` (`/register`, `/login`, `/forgot-password`, `/verify-reset-otp`, `/reset-password`).
- `/api/users`: `users.js` (`/me`, `/update-profile`, `/change-password`, `/toggle-save-set`).
- `/api/questions`: `questions.js` (CRUD câu hỏi, `/mine` - danh sách câu hỏi của tôi).
- `/api/sets`: `questionSets.js` (CRUD bộ câu hỏi, `/library`, `/weekly`, `/defaults`, `/my-sets`, `/:id/like`, `/:id/export`, `/:setId/add-questions`, `/:setId/remove-question`, `/:id/copy`).
- `/api/classes`: `classes.js` (quản lý lớp, tham gia bằng mã 8 ký tự, quản lý trợ giảng, gán bộ đề).
- `/api/schools`: `schools.js` (tìm trường, tham gia, dashboard trường, announcements, shared sets, lớp trực thuộc trường).
- `/api/school-requests`: `schoolRequests.js` (gửi yêu cầu mở trường, admin duyệt/từ chối).
- `/api/scores`: `scores.js` (`POST /score` lưu điểm thường & tuần, `GET /leaderboard` lấy BXH).
- `/api/settings`: `settings.js` (lấy và cập nhật phiên bản game).
- `/api/admin`: `admin.js` (quản lý trường học phía Admin).

---

## 3. HIỆN TRẠNG ĐỐI CHIẾU VỚI AGENTS.md & TIẾN ĐỘ THỰC TẾ

### A. Chức năng đã hoàn thành và hoạt động tốt:
1. **Landing Page**: Giao diện chuẩn Positivus EdTech hiện đại, tone màu xanh nhạt chủ đạo (`#7dd3fc` / `#38bdf8`), 2-column hero, subject ticker, bento grid 3 biến thể màu, accordion 4 bước, banner Studio và footer Positivus.
2. **Cơ chế tìm kiếm cơ bản**: Hoạt động mượt mà tại Landing Page và Library Page.
3. **Xác thực & Đặt lại mật khẩu**: Đăng ký, đăng nhập, hỗ trợ Guest, cơ chế khôi phục mật khẩu gửi mã OTP về email 3 bước an toàn (`auth.js` + `sendPasswordResetEmail.js`).
4. **Iframe Game**: Nhúng game HTML5/Godot, giao tiếp `postMessage` 2 chiều, nạp bộ câu hỏi, lưu điểm số kỷ lục và điểm tuần tự động.
5. **Studio Quản lý đề thi**: Tạo/xóa câu hỏi, tạo/xóa bộ đề, gắn câu hỏi vào bộ đề, xuất file Excel (`exceljs`) và PDF (`pdfkit`).
6. **Chi tiết bộ câu hỏi (`/set/:id`)**:
   - Phân quyền chủ sở hữu: Sửa tên/mô tả/môn học/trạng thái Public-Private/Ẩn danh; thêm câu hỏi mới hoặc chọn từ kho câu hỏi cá nhân; xóa câu hỏi khỏi bộ đề.
   - Dành cho khách: Xem chi tiết câu hỏi, thả tim (ngăn chủ đề tự lưu), sao chép bộ đề về tài khoản (`-copy`), chuyển sang chơi game ôn luyện.
   - Cơ chế hiển thị tên tác giả: Hiển thị đúng tên hiển thị (`displayName` fallback `username`), hỗ trợ ẩn danh bảo mật.
7. **Thư viện (Library)**: Hiển thị bộ đề công khai, bộ đề chuẩn APEC, thả tim lưu trữ, hiển thị tác giả chuẩn xác.
8. **Hồ sơ cá nhân (Profile)**: Cập nhật thông tin họ tên, tên hiển thị (default username nếu để trống), tải lên ảnh đại diện (`avatar`), đổi mật khẩu trực tiếp, thống kê thành tích.
9. **Dashboard giáo viên & Lớp học**: Tạo lớp, tự sinh mã 8 ký tự, thống kê sĩ số GV và HS, quản lý học sinh và thăng/hạ cấp trợ giảng, gán bộ đề vào lớp.
10. **Cộng đồng trường học**: Khám phá trường, tham gia trường, dashboard trường học (thành viên, thông báo, kho đề chung, danh sách lớp), gửi yêu cầu mở trường và admin duyệt.
11. **Bảng xếp hạng (Leaderboard)**: Đầy đủ 2 chế độ (Thử thách tuần & Toàn thời gian), bục vinh quang Top 3, danh sách Top 20, hiển thị thứ hạng cá nhân.
12. **Bộ đề mặc định & theo tuần**: Tự động sinh dữ liệu mẫu trong `seedData.js` với 7 môn học chuẩn mực và các bộ đề Weekly Challenge.
13. **Hệ thống Toast Notification**: Thay thế hoàn toàn các hộp thoại `alert()`, hỗ trợ success, error, info, warning với giao diện bắt mắt.

### B. Các tính năng đang dở dang hoặc cần làm tiếp:
1. **Import file CSV / Excel thành các câu hỏi (Tính năng bổ sung 1 trong AGENTS.md)**:
   - Hiện trạng: Chưa có.
   - Cần làm: Viết API backend nhận upload file `.xlsx` / `.csv` (dùng `multer`), phân tích cột dữ liệu thành danh sách câu hỏi và lưu vào ngân hàng câu hỏi. Thêm nút và modal upload tại `/studio`.
2. **Hệ thống Bài tập trong Lớp học (Assignments)**:
   - Hiện trạng: Backend `classes.js` đang trả về dữ liệu mẫu hardcode (`assignmentCount: 0`, `assignments: []`).
   - Cần làm: Tạo Mongoose Model `Assignment`, API giao bài tập từ bộ câu hỏi kèm hạn nộp (deadline), giao diện nộp bài cho học sinh và chấm điểm thống kê cho giáo viên.
3. **Xác thực Email OTP cho việc thay đổi thông tin quan trọng trong Profile**:
   - Hiện trạng: Người dùng đổi email trong `/profile` hiện được lưu thẳng vào DB.
   - Cần làm: Tích hợp bước xác thực OTP gửi về email mới/cũ để bảo vệ tài khoản khi thay đổi địa chỉ email hoặc thông tin nhạy cảm.
4. **Đồng bộ hóa 100% Component Navbar**:
   - Hiện trạng: Component `client/src/components/Navbar.jsx` đã hoạt động tốt ở Studio, Leaderboard, School Discovery, Student Classes.
   - Cần làm: Thay thế các thẻ header cục bộ tại `LibraryPage.jsx`, `ProfilePage.jsx`, `QuestionSetPage.jsx`, `GamePage.jsx` bằng component `<Navbar />` dùng chung để đồng nhất mã nguồn.
5. **Chế độ thi đấu đối kháng trực tiếp (Multiplayer Game qua Socket.io)**:
   - Hiện trạng: Server đã có sẵn logic Socket.io tạo và tham gia lobby bằng mã PIN 6 chữ số (`server/index.js`), nhưng client `GamePage.jsx` mới chỉ chạy chế độ chơi đơn (Single Player) qua `iframe`.
   - Cần làm: Xây dựng giao diện sảnh chờ (Lobby), nhập PIN phòng và thi đấu câu hỏi đối kháng theo thời gian thực.

---

## 4. CÁC LỖI KỸ THUẬT ĐÃ KHẮC PHỤC (LƯU Ý ĐỂ KHÔNG SỬA NGƯỢC)

1. **Lỗi 404 Lưu điểm Game**:
   - *Đã khắc phục*: `GamePageLogic.js` gọi đúng `POST http://localhost:5000/api/scores/score` (không gọi vào `/api/auth/score`).
2. **Lỗi cú pháp & 404 Leaderboard**:
   - *Đã khắc phục*: `LeaderboardPageLogic.js` import đúng `import { useEffect, useState } from 'react'` và gọi đúng `GET http://localhost:5000/api/scores/leaderboard?type=...` (không gọi vào `/api/auth/leaderboard`).
3. **API cập nhật bộ đề & nhân bản**:
   - *Đã khắc phục*: Đã có đầy đủ `PUT /api/sets/:id`, `POST /api/sets/:id/copy`, `PUT /api/sets/:setId/add-questions`, `PUT /api/sets/:setId/remove-question`.
4. **Lỗi lưu bộ đề của chính mình**:
   - *Đã khắc phục*: Backend `users.js` kiểm tra và chặn người dùng lưu bộ đề do chính mình tạo ra (`status 400`). Frontend ở trang chi tiết tự động ẩn nút lưu đối với chủ sở hữu.
5. **Lỗi vòng lặp useEffect trong LandingPage**:
   - *Đã khắc phục*: Cleanup function trong `useEffect` của `LandingPage.jsx` đã được tách biệt chuẩn xác với hàm `return (` của React component.

---

## 5. QUY TẮC THIẾT KẾ GIAO DIỆN (UI/UX DESIGN SYSTEM)

### 5.1. Typography:
- **Font chữ quy ước bắt buộc**: `"Iosevka Charon Mono", monospace`.
- **Tuyệt đối không dùng các font Pixel Art lỗi dấu** (như `Press Start 2P` hay các bitmap monospace font không có bộ ký tự Unicode tiếng Việt hoàn chỉnh).
- Tất cả các thẻ văn bản, nút bấm, input, tiêu đề phải hiển thị chuẩn dấu tiếng Việt (À, Á, Ả, Ã, Ạ, Ơ, Ư, Ê,...).

### 5.2. Iconography & Hình ảnh:
- **Icon chuẩn**: Sử dụng độc quyền bộ vector icon từ thư viện `lucide-react` để đảm bảo độ sắc nét trên mọi độ phân giải màn hình.
- **Không dùng ảnh pixel art sinh bằng AI** gây vỡ nét, nhòe hình. Ưu tiên đồ họa vector hoặc minh họa phẳng sắc sảo.

### 5.3. Bảng màu chủ đạo (Color Palette):
- **Màu nhấn thương hiệu**: Xanh nhạt hiện đại (Light Cyan / Sky Blue: `#7dd3fc`, `#38bdf8`, `#0ea5e9`).
- **Màu phối hợp**:
  - Đen than chì (`#191a23`) cho viền, văn bản chính và các nút CTA nổi bật.
  - Xám sáng (`#f3f3f3`) cho nền card nâng cao.
  - Vàng ấm (`#f59e0b` / `#fbbf24`) cho các yếu tố khen thưởng, thành tích, cúp vinh quang.
- **Card Styling**: Bo góc lớn mềm mại (`16px` đến `28px`), viền sắc nét (`1.5px` đến `2px solid`), đổ bóng nổi đặc trưng (`box-shadow: 0 4px 0` hoặc `0 5px 0`).
