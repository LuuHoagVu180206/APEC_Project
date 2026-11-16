# Triển khai APEC EduGame

Nếu dùng backend miễn phí ở Singapore, xem [Hướng dẫn Render Free](RENDER.md).

Frontend React và game Godot chạy trên Vercel. API Express và Socket.IO chạy trên Railway Pro, vùng Singapore. MongoDB Atlas lưu dữ liệu ứng dụng. Bắt đầu với một replica vì phòng đang chơi nằm trong RAM.

## 1. Đưa bản phát hành lên GitHub

Kiểm tra thay đổi rồi commit và push một nhánh đã chọn, ví dụ `NewUiBranch`. Commit cả game trong `client/public/game/v3.0` và hai file cấu hình `client/vercel.json`, `server/railway.json`. Giữ biến môi trường riêng tư trong dashboard của dịch vụ hoặc `server/.env` khi chạy local.

Nếu dùng dữ liệu thật từ bản cũ, sao lưu dữ liệu, kiểm tra tài khoản mẫu có mật khẩu đã biết và thu hồi hoặc đặt lại mật khẩu trước khi đưa bản sao sang Atlas. Tài khoản tác giả `APEC Group` được giữ để sở hữu bộ đề và bị khóa đăng nhập. Với các tài khoản demo cũ, kiểm tra quyền sở hữu dữ liệu trước khi xóa. Dùng secret JWT mới để vô hiệu hóa token cũ. Đổi credential nếu từng đưa vào Git. Repo Godot gốc cũng có file `openai_key.txt` được Git theo dõi. Nếu file từng chứa khóa thật, thu hồi khóa đó ở nhà cung cấp và xử lý lịch sử Git trước khi chia sẻ repo Godot.

## 2. Chuẩn bị Railway và Atlas

1. Tạo hoặc mở Railway workspace, chọn **Pro** để dùng SMTP và IP outbound tĩnh. Gói Pro có mức tối thiểu 20 USD mỗi tháng và tính phần sử dụng vượt mức này. Tạo service từ GitHub, chọn nhánh phát hành, đặt **Root Directory** thành `/server` và **Config File Path** thành `/server/railway.json`. Chọn **Southeast Asia Metal** trong phần Regions.
2. Trong **Settings → Networking**, bật **Enable Static IPs**, ghi lại tất cả IPv4 outbound và bấm **Generate Domain** để lấy URL HTTPS công khai. Triển khai lại sau khi thiết lập Static IPs. Cấu hình trong Git đặt một replica, tắt App Sleep, dùng `npm start` và kiểm tra `/healthz`. Railway tự cấp `PORT`.
3. Trong Atlas, tạo cluster ở **AWS Singapore** nếu gói đã chọn có vùng này. Free phù hợp để thử với dữ liệu nhỏ. Vào **Database Access** và tạo database user với quyền `readWrite` chỉ trên database ứng dụng, ví dụ `easylearn_prod`. Trong **Network Access**, thêm từng IP outbound Railway dưới dạng `/32`. Vào **Connect → Drivers**, chép URI và thêm tên database vào sau hostname. Mã hóa phần mật khẩu theo chuẩn URL nếu chứa ký tự đặc biệt.
4. Nếu muốn giữ dữ liệu cũ, dừng các thao tác ghi, sao lưu bằng `mongodump` và khôi phục vào database mới bằng `mongorestore` trước khi backend khởi tạo bộ đề. Có thể thêm tạm IP máy nhập liệu vào Atlas rồi gỡ sau khi xong. Tuyệt đối tránh chạy `server/seed.js` trên database có dữ liệu. Lệnh đó xóa dữ liệu người dùng và câu hỏi.
5. Trong **Railway → Variables**, điền các biến dưới đây. Với Gmail, bật xác minh hai bước, tạo **App Password** cho mailbox gửi và dùng mailbox đó làm `SMTP_USER` và `SMTP_FROM`. Lấy origin frontend thực tế sau khi tạo project Vercel. Có thể đặt trước bằng domain bạn dự định sử dụng rồi sửa và redeploy nếu Vercel cấp domain khác.

```dotenv
NODE_ENV=production
RAILPACK_NODE_VERSION=24
MONGO_URI=mongodb+srv://<db-user>:<db-password>@<atlas-host>/easylearn_prod?retryWrites=true&w=majority
JWT_SECRET=<chuỗi ngẫu nhiên riêng cho production>
FRONTEND_ORIGINS=https://<project>.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<gmail gửi OTP>
SMTP_PASS=<Gmail App Password>
SMTP_FROM=<gmail gửi OTP>
```

Tạo JWT secret trên máy của bạn bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Khi dùng nhiều domain frontend, điền các origin chính xác cách nhau bằng dấu phẩy. Ví dụ `https://easylearn.example,https://example.vercel.app`. Một origin chỉ gồm scheme, hostname và port nếu có.

Sau khi deploy, mở `https://<railway-domain>/healthz`. Kết quả cần là HTTP 200 với `{"status":"ok"}`. Mở tiếp `/api/sets/defaults` và `/api/sets/weekly`. Nếu bị lỗi, xem Deploy Logs và đối chiếu lại URI, database user và tất cả IP outbound đã thêm vào Atlas.

[Railway Pro](https://docs.railway.com/pricing/plans) · [Railway config trong monorepo](https://docs.railway.com/deployments/monorepo) · [IP outbound Railway](https://docs.railway.com/networking/static-outbound-ips) · [Atlas Network Access](https://www.mongodb.com/docs/atlas/security/ip-access-list/) · [Phục hồi dữ liệu Atlas](https://www.mongodb.com/docs/atlas/import/mongorestore/) · [Google App Passwords](https://support.google.com/accounts/answer/2461835/)

## 3. Deploy Vercel

1. Vào **Add New → Project** và import repo từ GitHub. Chọn **Root Directory** `client`, **Framework Preset** `Create React App`, **Install Command** `npm ci`, **Build Command** `npm run build`, **Output Directory** `build` và **Node.js** `24.x`. Chọn cùng nhánh phát hành trong **Settings → Environments → Production → Branch Tracking**.
2. Thêm biến **Production** `REACT_APP_API_ORIGIN=https://<railway-domain>`. Dùng origin backend, bỏ `/api` và dấu `/` ở cuối. Biến này chỉ chứa URL công khai. Deploy lại frontend khi sửa biến.
3. Lấy domain production chính xác và đối chiếu với `FRONTEND_ORIGINS` trong Railway. Sau khi đổi biến hoặc gắn domain tùy chỉnh, redeploy service dùng biến đó. Khi muốn thử Preview từ một nhánh khác, tạo môi trường thử riêng với database riêng và khai báo đúng origin Preview.
4. Mở thẳng `/game`, `/library` và `/profile`. Trong DevTools, bản game phải lấy `/game/v3.0/index.pck` và `index.wasm` từ Vercel, API tới Railway qua HTTPS và Socket.IO tới Railway qua WSS. Nếu API bị chặn trong trình duyệt, kiểm tra domain Vercel có nằm trong `FRONTEND_ORIGINS` hay chưa.

[Vercel Build Settings](https://vercel.com/docs/builds/configure-a-build) · [Production Branch](https://vercel.com/docs/git) · [Vercel rewrites](https://vercel.com/docs/project-configuration/vercel-json#rewrites) · [Điều khoản Vercel Hobby](https://vercel.com/legal/terms)

## 4. Tạo admin và kiểm tra trước khi chia sẻ

1. Đăng ký tài khoản của bạn bằng mật khẩu riêng. Nếu cần admin, mở **Atlas → Browse Collections → easylearn_prod → users**, tìm chính xác username đã chọn, đổi `role` thành `admin`, lưu, rồi đăng nhập lại. Với tài khoản có quyền cao, dùng email khôi phục do bạn kiểm soát.
2. Tạo hai tài khoản thử trong hai trình duyệt hoặc profile. Kiểm tra đăng nhập độc lập. Thêm email thử vào hồ sơ, nhận OTP, đặt lại mật khẩu, đăng nhập bằng mật khẩu mới.
3. Tạo bộ đề, thử private/public, xuất PDF và Excel. Chơi một bộ mặc định và một bộ weekly, xác nhận điểm xuất hiện sau khi refresh. Điểm hiện vẫn do game gửi lên nên chỉ dùng leaderboard cho luyện tập hoặc thử nghiệm. Thi đấu có giải hoặc chấm điểm chính thức cần xác thực câu trả lời và tính điểm phía server.
4. Dùng một tài khoản giáo viên tạo lớp và gán bộ đề, rồi cho một học sinh vào lớp. Tạo phòng bằng mã lớp. Học sinh dùng PIN để vào phòng, refresh để kiểm tra kết nối lại, chơi đến hết và kiểm tra kết quả ở trang lớp. Dùng thêm một tài khoản ngoài lớp để xác nhận backend từ chối tham gia và đọc điểm.
5. Ghi lại commit và sao lưu Atlas. Redeploy hoặc rollback backend ngoài giờ chơi vì phòng đang mở có thể kết thúc khi tiến trình đổi. Khi rollback Railway, kiểm tra lại biến môi trường vì bản cũ có thể mang theo cấu hình cũ.

[Atlas Backup](https://www.mongodb.com/docs/atlas/backup-restore-cluster/) · [Railway Rollback](https://docs.railway.com/deployments/deployment-actions) · [Vercel Rollback](https://vercel.com/docs/instant-rollback)

Nếu bản phát hành dùng câu tự luận của game, hãy kiểm tra riêng luồng này trên Vercel. Mã Godot gốc đang gọi dịch vụ chấm tự luận bên ngoài tại `ai-grading-service.onrender.com`. Kiểm tra email OTP và dịch vụ tự luận bằng dữ liệu thử trước khi sử dụng dữ liệu học sinh.

## Export lại Godot khi cần

Bản Web v3.0 đã được build và nằm trong repo web. Khi sửa game cho bản kế tiếp, áp dụng [godot-web.patch](godot-web.patch) vào repo Godot tại commit `2356068` hoặc tích hợp tương đương trước khi export. Dùng Godot **4.7.2** với Web export templates cùng phiên bản. Chạy từ PowerShell với đường dẫn Godot thích hợp.

```powershell
git -C D:\demo_maze apply --check --ignore-whitespace D:\APEC_Project\deploy\godot-web.patch
git -C D:\demo_maze apply --ignore-whitespace D:\APEC_Project\deploy\godot-web.patch
& "<Godot console exe>" --headless --path D:\demo_maze --editor --import
& "<Godot console exe>" --headless --path D:\demo_maze --export-release Web D:\APEC_Project\client\public\game\v3.0\index.html
```

Commit các artifact export cùng nhau. Giữ game trong iframe cùng origin để bản game đọc endpoint công khai do React cấu hình và dùng phiên của chính người chơi. Game v2.0 cũ chỉ có thể chọn khi chạy local. Chế độ production chỉ phục vụ cấu hình v3.0 đã cập nhật.

Chạy test backend có kèm kiểm tra mã nguồn Godot bằng `$env:GODOT_PROJECT_PATH = 'D:\demo_maze'` rồi `npm test` trong thư mục `server`. Với frontend, chạy `npm run build` trong `client`.
