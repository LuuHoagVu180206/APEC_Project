# 1. Chức năng - Giao diện đã có:

1. Landing Page - đã hoàn chỉnh với navbar chung (navbar ở mọi page)
2. Cơ chế tìm kiếm cơ bản (hiện tại có ở trang landing page và trang library).
3. Trang đăng nhập, đăng ký - cơ chế đặt lại mật khẩu.
4. 1 Trang iframe chứa game, có các nút để di chuyển đến trang khác ở navbar
5. Trang quản lí các câu hỏi, bộ câu hỏi đã tạo/đã thích. Quản lí bao gồm:
   - Tạo/xoá các câu hỏi,bộ câu hỏi
   - Làm câu hỏi private/public khi tạo bộ câu hỏi cho người khác thấy được trên library.
   - Xuất ra file pdf hoặc excel
6. Trang Library (Thư viện) để mọi người chia sẻ với nhau các câu hỏi hay bộ câu hỏi.
7. Trang Profile để người dùng điền các thông tin cá nhân như họ tên hay ảnh đại diện, thay đổi mk, thay đổi mail
8. Dashboard giáo viên:
   1. Chức năng tạo lớp
   2. Chức năng tạo bộ câu hỏi
   3. Xem danh sách lớp đang quản lý
   4. Có thể tham gia lớp khác
9. Dashboard lớp học:
   1. Sĩ số giáo viên
   2. Sĩ số học sinh
   3. Số bài tập hiện có
   4. Số bộ câu hỏi hiện có
   5. UI xem danh sách học sinh + UI xem danh sách giáo viên
   6. Thông tin và mô tả lớp học
10. Dashboard tìm cộng đồng trường và tham gia cộng đồng:
    1. Xem danh sách các cộng đồng trường và xem danh sách cộng đồng của bản thân
11. Dashboard của cộng đồng trường:
    1. Sĩ số thành viên (sĩ số giáo viên và sĩ số học sinh)
    2. Sĩ số lớp học
    3. Announcement của trường
    4. Shared question sets của các lớp
    5. Xem danh sách các lớp
    6. Xem members của trường
    7. Dashboard quên mật khẩu
    8. Nhập gmail đã có trong hồ sơ để nhận OTP reset mật khẩu.

# 2. Tính năng bổ sung

1. Import file csv, excel thành các câu hỏi.
2. Các bộ câu hỏi được tạo sẵn, sẽ có các bộ mặc định cho mọi người và các bộ câu hỏi theo mùa để người chơi tranh tài hoặc để sử dụng như bình thường đều được.
3. Leaderboard chung cho các câu hỏi/ bộ câu hỏi được tạo sẵn để người chơi tranh tài (Trang LeaderBoard hoàn chỉnh)
4. Nâng cấp file Trang profile của web.


# 3. Quy chuẩn Thiết kế & UI/UX (Bắt buộc tuân thủ)

Tuân thủ nghiêm ngặt toàn bộ nguyên tắc thiết kế được định nghĩa trong [DESIGN_SYSTEM.MD](file:///d:/APEC_Project/DESIGN_SYSTEM.MD) (hoặc [.agents/rules/design_system.md](file:///d:/APEC_Project/.agents/rules/design_system.md)):
- **Phong cách chủ đạo:** Modern Creative EdTech × Premium SaaS × Artistic Digital Experience (tham chiếu cảm hứng sáng tạo từ Codédex, không sao chép nguyên mẫu thô).
- **Light Mode & Dark Mode:** Thiết kế độc lập, kiểm soát độ tương phản chặt chẽ (WCAG 2.2 AA), tuyệt đối không để xảy ra lỗi chữ trắng trên nền trắng, icon hay nút bấm chìm vào nền.
- **Typography & Tiếng Việt:** Hỗ trợ chuẩn xác tiếng Việt đầy đủ dấu, không vỡ glyph, phân cấp visual hierarchy rõ ràng từ Headings đến Body.
- **Hệ thống Spacing & Components:** Thang đo 4px, thiết kế thành phần có chủ đích, tương tác micro-interactions tinh tế và đồng bộ trên toàn bộ hệ thống.


# 3. Quy chuẩn Thiết kế & UI/UX (Bắt buộc tuân thủ)

Tuân thủ nghiêm ngặt toàn bộ nguyên tắc thiết kế được định nghĩa trong [DESIGN_SYSTEM.MD](file:///d:/APEC_Project/DESIGN_SYSTEM.MD) (hoặc [.agents/rules/design_system.md](file:///d:/APEC_Project/.agents/rules/design_system.md)):
- **Phong cách chủ đạo:** Modern Creative EdTech × Premium SaaS × Artistic Digital Experience (tham chiếu cảm hứng sáng tạo từ Codédex, không sao chép nguyên mẫu thô).
- **Light Mode & Dark Mode:** Thiết kế độc lập, kiểm soát độ tương phản chặt chẽ (WCAG 2.2 AA), tuyệt đối không để xảy ra lỗi chữ trắng trên nền trắng, icon hay nút bấm chìm vào nền.
- **Typography & Tiếng Việt:** Hỗ trợ chuẩn xác tiếng Việt đầy đủ dấu, không vỡ glyph, phân cấp visual hierarchy rõ ràng từ Headings đến Body.
- **Hệ thống Spacing & Components:** Thang đo 4px, thiết kế thành phần có chủ đích, tương tác micro-interactions tinh tế và đồng bộ trên toàn bộ hệ thống.
