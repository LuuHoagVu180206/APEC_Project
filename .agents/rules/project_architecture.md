# APEC EduGame - Cấu Trúc Hệ Thống & Bộ Nhớ Thường Trực

Tài liệu này lưu trữ toàn bộ cấu trúc mã nguồn thực tế, kiến trúc hệ thống, đối chiếu tính năng và các lưu ý kỹ thuật quan trọng của dự án. Agent phải luôn tuân thủ và đối chiếu các thông tin này khi phát triển hoặc sửa lỗi.

---

## 1. KIẾN TRÚC KỸ THUẬT & CÔNG NGHỆ

- **Frontend**:
  - React 19, React Router v7 (`react-router-dom`), Icons (`lucide-react`).
  - Dark/Light Theme: Hook `useDarkMode.js`.
  - Quy ước kiến trúc: Phân tách 3 lớp độc lập:
    - `client/src/pages/`: Các file `.jsx` chỉ chứa cấu trúc giao diện và layout.
    - `client/src/pages_logic/`: Các Custom Hook `.js` quản lý state, API (axios), điều hướng (`useNavigate`).
    - `client/src/pages_styling/`: Các file `.css` tương ứng cho từng màn hình.
    - `client/src/components/`: Chứa các component chung (hiện có `GamePlayer.js`).

- **Backend**:
  - Node.js + Express 5, tích hợp HTTP Server với **Socket.io** (quản lý phòng chơi thời gian thực, PIN 6 số, reconnect, cập nhật bảng điểm trực tiếp).
  - Xác thực & Phân quyền: JSON Web Token (`jsonwebtoken`) + băm mật khẩu (`bcryptjs`). Middleware `verifyToken.js` (`verifyToken`, `verifyAdmin`).
  - Gửi email: `nodemailer` (SMTP cấu hình qua `.env`, gửi OTP khôi phục mật khẩu).
  - Xuất tệp: `exceljs` (.xlsx) và `pdfkit` (PDF kèm font `server/fonts/Lora-VariableFont_wght.ttf`).

- **Cơ sở dữ liệu (Database)**:
  - MongoDB với Mongoose (11 models): `User`, `Question`, `QuestionSet`, `TeacherClass`, `School`, `SchoolMember`, `SchoolRequest`, `SchoolJoinRequest`, `CommunityPost`, `PasswordResetOTP`, `GameSetting`.

---

## 2. BẢN ĐỒ ROUTE & COMPONENT TƯƠNG ỨNG

### Frontend Routes (`client/src/App.js`):
- `/` & `/landing`: `LandingPage.jsx` + `LandingPageLogic.js`
- `/login`: `LoginPage.jsx` + `LoginPageLogic.js` (hỗ trợ tab đăng ký qua `?mode=register` và `role=teacher`)
- `/forgot-password`: `ForgotPasswordPage.jsx` + `ForgotPasswordPageLogic.js`
- `/game`: `GamePage.jsx` + `GamePageLogic.js` (nhúng Game Godot/HTML5 qua `iframe`)
- `/studio`: `StudioPage.jsx` + `StudioPageLogic.js` (quản lý câu hỏi, bộ câu hỏi, xuất file)
- `/library`: `LibraryPage.jsx` + `LibraryPageLogic.js` (thư viện cộng đồng)
- `/set/:id`: `QuestionSetPage.jsx` + `QuestionSetPageLogic.js` (chi tiết bộ câu hỏi)
- `/profile`: `ProfilePage.jsx` + `ProfilePageLogic.js` (hồ sơ cá nhân)
- `/leaderboard`: `LeaderboardPage.jsx` + `LeaderboardPageLogic.js` (bảng xếp hạng)
- `/teacher/dashboard`: `TeacherDashboardPage.jsx` + `TeacherDashboardLogic.js`
- `/teacher/classes/new`: `CreateClassPage.jsx` + `CreateClassPageLogic.js`
- `/teacher/classes/:id`: `TeacherClassPage.jsx` + `TeacherClassPageLogic.js`
- `/student/classes`: `StudentClassesPage.jsx` + `StudentClassesPageLogic.js`
- `/schools`: `SchoolDiscoveryPage.jsx` + `SchoolDiscoveryPageLogic.js`
- `/schools/:schoolId`: `SchoolDashboardPage.jsx` + `SchoolDashboardLogic.js`
- `/school-requests/new`: `SchoolRequestPage.jsx` + `SchoolRequestPageLogic.js`
- `/school-requests/admin`: `SchoolAdminRequestsPage.jsx` + `SchoolAdminRequestsLogic.js`
- `/admin`: `AdminPage.jsx` + `AdminPageLogic.js`
- `/admin/schools`: `AdminSchoolsPage.jsx` + `AdminSchoolsPageLogic.js`
- `/admin/schools/:schoolId`: `AdminSchoolDetailPage.jsx` + `AdminSchoolDetailPageLogic.js`

### Backend Endpoints (`server/index.js`):
- `/api/auth`: `auth.js` (`register`, `login`, `forgot-password`, `verify-reset-otp`, `reset-password`)
- `/api/users`: `users.js` (`toggle-save-set`, `update-profile`)
- `/api/questions`: `questions.js` (CRUD câu hỏi)
- `/api/sets`: `questionSets.js` (CRUD bộ câu hỏi, `library`, `my-sets`, `like`, `export`, `add-question`)
- `/api/classes`: `classes.js` (quản lý lớp của giáo viên và học sinh, mã lớp 8 ký tự, trợ giảng)
- `/api/schools`: `schools.js` (khám phá trường, tham gia, dashboard trường, announcements, shared sets, lớp trong trường)
- `/api/school-requests`: `schoolRequests.js` (gửi yêu cầu mở trường, admin phê duyệt/từ chối)
- `/api/scores`: `scores.js` (lưu điểm `POST /score`, lấy BXH `GET /leaderboard`)
- `/api/settings`: `settings.js` (quản lý phiên bản game)
- `/api/admin`: `admin.js` (danh sách trường, chi tiết trường cho admin)

---

## 3. HIỆN TRẠNG ĐỐI CHIẾU VỚI AGENTS.md

### A. Chức năng đã có và hoạt động tốt:
1. **Tìm kiếm cơ bản**: Ở Landing Page và Library Page.
2. **Auth & Quên mật khẩu**: Đăng ký/đăng nhập (hỗ trợ Guest), quên mật khẩu gửi OTP email 3 bước (`auth.js` + `sendPasswordResetEmail.js`).
3. **Iframe Game**: Nhúng game vào `GamePage.jsx`, giao tiếp 2 chiều qua `window.postMessage`.
4. **Studio Quản lý câu hỏi**: Tạo/xóa câu hỏi, tạo/xóa bộ câu hỏi, thêm câu hỏi vào bộ, xuất file Excel (`exceljs`) và PDF (`pdfkit`).
5. **Thư viện (Library)**: Xem bộ câu hỏi public, thả tim, lưu vào tủ đồ cá nhân.
6. **Dashboard giáo viên**: Tạo lớp, xem danh sách lớp quản lý, tham gia lớp khác bằng mã.
7. **Dashboard lớp học**: Hiển thị sĩ số GV, HS; danh sách phân trang có tìm kiếm, thăng/hạ cấp trợ giảng; gán bộ câu hỏi vào lớp.
8. **Cộng đồng trường (School Community)**: Tìm kiếm trường, tham gia trường, Dashboard trường (thống kê thành viên, announcements, shared question sets, danh sách lớp, danh sách thành viên).

### B. Những phần còn thiếu hoặc chưa hoàn thiện:
1. **Navbar chung**: `AGENTS.md` ghi đã hoàn chỉnh navbar chung ở mọi page, nhưng thực tế **chưa có component Navbar tái sử dụng**. Các trang như `ProfilePage`, `StudioPage`, `LibraryPage`, `LeaderboardPage` hoàn toàn thiếu navbar.
2. **Cập nhật Bộ câu hỏi**: Chưa có API `PUT /api/sets/:id` để đổi trạng thái `isPublic` (Public/Private), tiêu đề hay mô tả sau khi tạo.
3. **Trang Profile**:
   - Chưa có trường `avatar` trong Model `User` và giao diện.
   - Chưa có chức năng đổi mật khẩu (chỉ có quên mật khẩu ngoài Login).
   - Chưa có xác minh khi đổi email.
4. **Bài tập trong lớp (Assignment)**: Backend `classes.js` đang hardcode `assignmentCount: 0` và `assignments: []`, chưa có Model hay API Assignment.
5. **Tính năng bổ sung 1 - Import CSV/Excel**: Chưa có mã nguồn (chưa có endpoint upload/parse file).
6. **Tính năng bổ sung 2 - Bộ câu hỏi mặc định & theo mùa**: Chưa có schema phân loại và dữ liệu mẫu mùa giải trong `seed.js`.
7. **Tính năng bổ sung 3 - Leaderboard hoàn chỉnh**: Chưa có BXH theo bộ câu hỏi hoặc theo mùa.

---

## 4. CÁC LỖI KỸ THUẬT (BUG) CẦN TRÁNH VÀ SỬA CHỮA

1. **Lỗi 404 Lưu điểm Game**:
   - `GamePageLogic.js` dòng 61 gọi: `POST http://localhost:5000/api/auth/score` (Sai prefix).
   - Endpoint đúng: `POST http://localhost:5000/api/scores/score`.
2. **Lỗi 404 & Cú pháp Leaderboard**:
   - `LeaderboardPageLogic.js` dòng 1: Sai cú pháp `import useEffect, { useState } from 'react'`.
   - `LeaderboardPageLogic.js` dòng 12: Gọi `GET http://localhost:5000/api/auth/leaderboard` (Sai prefix).
   - Endpoint đúng: `GET http://localhost:5000/api/scores/leaderboard`.

---

## 5. QUY TẮC THIẾT KẾ GIAO DIỆN (UI/UX DESIGN SYSTEM)

### Tuyệt đối không sử dụng Pixel Art Font & Pixel Art Images:
- **Không dùng Font Pixel** (như `Press Start 2P`, bitmap monospace pixel fonts):
  - *Nguyên nhân*: Các font chữ pixel art không hỗ trợ đầy đủ bảng mã tiếng Việt có dấu (Unicode diacritics), gây lỗi vỡ font, lệch dấu hoặc fallback về font hệ thống xấu xí.
- **Không dùng Pixel Art Images/Icons**:
  - *Nguyên nhân*: Các AI agent hiện nay chưa thể tạo ra pixel-perfect art một cách chuẩn xác, gây nhòe hình, vỡ hạt và giảm tính chuyên nghiệp của sản phẩm.

### Phong cách UI thay thế chuẩn: **Modern EdTech & Clean Neo-Brutalist / Modern Gamified**:
- **Typography**: Ưu tiên các font sans-serif hiện đại hỗ trợ tiếng Việt hoàn hảo: `Plus Jakarta Sans`, `Inter`, `Be Vietnam Pro`. Trọng số đa dạng (400, 500, 600, 700, 800) cho hierarchy rõ ràng.
- **Iconography**: Sử dụng bộ icon vector sắc nét từ thư viện `lucide-react`.
- **Card & Layout**:
  - Bố cục lưới thoáng đãng, padding/margin hài hòa.
  - Card hiện đại với viền tinh tế (`border: 1px solid var(--border)` hoặc `2px solid`), bo góc mềm mại (`border-radius: 12px` đến `16px`).
  - Đổ bóng tinh tế (subtle elevation hoặc clean neo-brutalist solid shadow mềm).
- **Màu sắc chủ đạo**:
  - Nền Dark/Light trang nhã, tương phản cao, dễ đọc.
  - Điểm nhấn Gamified sinh động: Vàng ấm (`#F59E0B` / `#FBBF24`), Xanh biển hiện đại (`#0EA5E9` / `#2563EB`), Tím sáng tạo (`#8B5CF6`), Xanh lá năng động (`#10B981`).
- **Tương tác**: Hiệu ứng hover nhấc thẻ mượt mà (`transform: translateY(-2px)`), phản hồi bấm nút rõ ràng, tag/pill bo tròn tinh tế.


