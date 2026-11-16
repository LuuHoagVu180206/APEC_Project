# Deploy APEC EduGame với Render Free Singapore

Vercel phục vụ React và game Godot v3.0. Render Free chạy Node.js và Socket.IO. MongoDB Atlas lưu dữ liệu. Brevo gửi OTP qua HTTPS vì Render Free chặn các cổng SMTP thường dùng.

## 1. Đưa code mới lên GitHub

Từ `D:\APEC_Project`, kiểm tra thay đổi, commit và push nhánh `DeployBranch`. Đây là nhánh hiện tại của repo. Nếu bạn dùng nhánh khác, chọn cùng nhánh đó ở Render và Vercel. Giữ file `server/.env` trên máy, các khóa thật chỉ điền trong dashboard dịch vụ. Game v3.0 đã được export sẵn.

## 2. Xác định domain frontend trên Vercel

Nếu đã có project Vercel, lấy domain production trong **Settings → Domains**. Nếu chưa có, vào **Add New → Project**, import repo GitHub và đặt cấu hình dưới đây. Chọn nhánh `DeployBranch` ở **Settings → Environments → Production → Branch Tracking**. Bạn có thể tạo deployment đầu tiên để lấy domain, rồi cập nhật URL backend và deploy lại ở bước 6.

| Mục | Giá trị |
|---|---|
| Root Directory | `client` |
| Framework Preset | Create React App |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Node.js Version | `24.x` |

[Cấu hình Vercel](https://vercel.com/docs/builds/configure-a-build) · [Nhánh production](https://vercel.com/docs/git)

## 3. Tạo Web Service trên Render

Vào **New → Web Service**, kết nối repo GitHub và nhập:

| Mục | Giá trị |
|---|---|
| Name | `apec-edugame-api` hoặc tên còn trống |
| Language | Node |
| Branch | `DeployBranch` |
| Region | Singapore |
| Root Directory | `server` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path | `/healthz` trong **Advanced** hoặc **Settings** |

Bấm **Deploy Web Service** để tạo service. Nếu lần deploy đầu báo thiếu biến môi trường, tiếp tục điền cấu hình ở bước 5. Render cấp một URL dạng `https://<ten-api>.onrender.com` và tự cấp `PORT`. Từ trang service, vào **Connect → Outbound**, sao chép toàn bộ dải IP. Các dải này sẽ được thêm vào Atlas ở bước tiếp theo.

[Render Web Services](https://render.com/docs/web-services) · [Health check](https://render.com/docs/health-checks) · [IP outbound](https://render.com/docs/outbound-ip-addresses)

## 4. Kết nối MongoDB Atlas

1. Dùng cluster hiện có nếu đã chứa dữ liệu cần giữ. Nếu tạo mới, chọn **Free** và **AWS Singapore** nếu có trong danh sách. Tên database ví dụ là `easylearn_prod`.
2. Vào **Database Access**, tạo database user riêng với quyền `readWrite` trên database ứng dụng. Vào **Network Access → Add IP Address**, thêm từng dải CIDR từ Render, giữ nguyên hậu tố của từng dải. Các dải này được dùng chung trong vùng Render. Giới hạn quyền database user và dùng mật khẩu mạnh.
3. Vào **Connect → Drivers**, lấy URI `mongodb+srv://...`, điền thông tin database user và đặt tên database sau hostname. Mã hóa ký tự đặc biệt trong phần mật khẩu theo chuẩn URL. Với Atlas đã có dữ liệu, giữ đúng tên database hiện tại trong URI. Nếu cần chuyển dữ liệu local sang Atlas, dùng `mongodump` và `mongorestore` trước khi đưa người dùng thật vào. Script `server/seed.js` xóa người dùng và câu hỏi, nên tránh chạy trên database cần giữ.

[Dải IP cho Atlas](https://www.mongodb.com/docs/atlas/security/ip-access-list/) · [Vùng Atlas AWS](https://www.mongodb.com/docs/atlas/reference/amazon-aws/) · [Khôi phục dữ liệu lên Atlas](https://www.mongodb.com/docs/atlas/import/mongorestore/)

## 5. Cấu hình Brevo và deploy backend

1. Tạo tài khoản **Brevo Free** và hoàn tất các bước kích hoạt gửi email giao dịch nếu dashboard yêu cầu. Vào **Settings → Senders, Domains, IPs → Senders → Add a sender**, đặt tên **EasyLearn**, dùng email bạn kiểm soát và xác minh theo mã Brevo gửi. Cho bản demo, bạn có thể xác minh địa chỉ Gmail. Brevo có thể thay địa chỉ hiển thị bằng địa chỉ của họ, nên kiểm tra cả hộp thư Spam khi thử. Nếu có domain riêng, xác thực domain đó trong Brevo để gửi từ địa chỉ của bạn.
2. Trong **Settings → SMTP & API → API Keys**, tạo một **API key** và lưu lại. Dù URL của Brevo có chữ `smtp`, ứng dụng gọi nó qua HTTPS. Gói Brevo Free hiện có hạn mức 300 email/ngày.
3. Trong **Render → service → Environment**, điền các biến dưới đây. Tạo JWT secret bằng lệnh `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Nếu đang chuyển một bản live và cần duy trì phiên cũ, có thể giữ secret production cũ nếu nó vẫn mạnh và chưa lộ. Dùng secret mới sẽ yêu cầu người dùng đăng nhập lại.

```dotenv
NODE_ENV=production
NODE_VERSION=24.22.1
MONGO_URI=<URI Atlas gồm tên database>
JWT_SECRET=<chuỗi ngẫu nhiên từ lệnh trên>
FRONTEND_ORIGINS=https://<ten-frontend>.vercel.app
BREVO_API_KEY=<API key của Brevo>
BREVO_SENDER_EMAIL=<địa chỉ sender đã xác minh, chỉ phần email>
```

Lưu các biến và deploy. Mở `https://<ten-api>.onrender.com/healthz` và đợi HTTP 200 với `{"status":"ok"}`. Kiểm tra `/api/sets/defaults` và `/api/sets/weekly`. Nếu `/healthz` lỗi, xem **Logs** và kiểm tra URI, tên database, quyền user và dải IP Atlas.

[Tạo sender Brevo](https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email) · [API email](https://developers.brevo.com/docs/send-a-transactional-email) · [Giá Brevo](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans) · [Render Node.js](https://render.com/docs/language-support)

## 6. Nối Vercel với Render

Trong **Vercel → Settings → Environment Variables**, thêm hoặc cập nhật biến **Production** `REACT_APP_API_ORIGIN=https://<ten-api>.onrender.com`, bỏ `/api` và dấu `/` ở cuối. Redeploy frontend từ commit đã push. Đối chiếu domain Vercel thực tế với `FRONTEND_ORIGINS` ở Render. Nếu dùng thêm domain tùy chỉnh, cho cả hai origin vào danh sách, cách nhau bằng dấu phẩy. Chỉ URL backend nằm trong biến công khai trên Vercel. URI Atlas, JWT secret và API key Brevo nằm trong Render.

## 7. Kiểm tra trước khi chia sẻ

- Mở thẳng `/library`, `/profile`, `/game` và refresh. Trong DevTools, API phải đi tới Render qua HTTPS, Socket.IO qua WSS, còn `index.pck` và `.wasm` tải từ Vercel.
- Đăng ký tài khoản thử, thêm email trong hồ sơ, dùng **Quên mật khẩu**, nhập OTP, rồi đăng nhập lại bằng mật khẩu mới. Nếu thiếu email, xem **Brevo → Transactional → Logs**, thư Spam và **Render Logs**. Với HTTP 401/403, kiểm tra API key, trạng thái sender và danh sách IP được phép trên Brevo nếu tài khoản bật giới hạn.
- Thử tạo bộ đề, tải PDF/Excel, chơi solo lưu điểm, rồi dùng hai tài khoản giáo viên và học sinh để tạo phòng, vào bằng PIN và kiểm tra kết quả lớp. Leaderboard hiện phù hợp để luyện tập vì điểm vẫn do game gửi lên.
- Nếu cần tài khoản quản trị, đăng ký tài khoản riêng rồi mở **Atlas → Browse Collections → users**, tìm đúng username, đổi `role` thành `admin` và đăng nhập lại.

Render Free tự ngủ sau 15 phút không có lưu lượng vào. Trước buổi demo, mở `/healthz` và đợi backend thức dậy, thường khoảng một phút. Dữ liệu đã lưu còn trong Atlas, còn phòng đang chơi có thể mất khi instance restart. Render cấp 750 giờ Free mỗi workspace mỗi tháng và còn giới hạn lưu lượng, thời gian build. Theo dõi **Billing → Monthly Included Usage**. [Điều kiện Render Free](https://render.com/docs/free)
