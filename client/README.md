# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



======================================================
🚀 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN GAME PLATFORM 🚀
======================================================

Dự án này sử dụng MERN Stack (MongoDB, Express, React, Node.js).
Vui lòng làm theo từng bước dưới đây để chạy dự án trên máy tính mới.

--- CÁC PHẦN MỀM CẦN CÓ (YÊU CẦU BẮT BUỘC) ---
1. Node.js (Khuyên dùng bản v18.x LTS để đảm bảo tính ổn định).
2. MongoDB Compass (Hoặc có tài khoản MongoDB Atlas online).
3. Git (Để tải code về).

======================================================

BƯỚC 1: TẢI CODE VÀ MỞ DỰ ÁN
1. Clone dự án từ GitHub về máy (hoặc giải nén file ZIP).
2. Mở thư mục gốc của dự án bằng phần mềm VS Code.

------------------------------------------------------

BƯỚC 2: CÀI ĐẶT & CHẠY BACKEND (SERVER)
1. Mở Terminal trong VS Code (Ctrl + `).
2. Di chuyển vào thư mục server:
   > cd server

3. Cài đặt các thư viện cần thiết:
   > npm install

4. TẠO FILE BIẾN MÔI TRƯỜNG (RẤT QUAN TRỌNG):
   - Trong thư mục "server", tạo một file mới tên CHÍNH XÁC là: .env
   - Copy 3 dòng dưới đây dán vào file .env và lưu lại:
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/edugame
     JWT_SECRET=chuoi_ky_tu_bi_mat_bat_ky_cua_ban

5. Chạy Server (Dùng 1 trong 2 lệnh gốc sau):
   - Chạy bình thường: 
     > node index.js
   - Hoặc chạy chế độ Dev (Tự khởi động lại khi sửa code): 
     > npx nodemon index.js
   
   (Nếu thấy dòng chữ "✅ Đã kết nối MongoDB!" là thành công).

------------------------------------------------------

BƯỚC 3: CÀI ĐẶT & CHẠY FRONTEND (CLIENT)
1. Mở thêm một Terminal thứ 2 trong VS Code (Giữ nguyên Terminal của Server cho nó chạy).
2. Di chuyển vào thư mục client:
   > cd client

3. Cài đặt các thư viện cho React (Dùng thêm đuôi legacy để tránh lỗi phiên bản cũ):
   > npm install --legacy-peer-deps

4. Chạy giao diện Web:
   > npm start
   (Trình duyệt sẽ tự động mở trang web tại địa chỉ http://localhost:3000)

------------------------------------------------------

BƯỚC 4: TẠO TÀI KHOẢN ADMIN ĐẦU TIÊN (Dành cho máy mới tinh)
Vì máy mới chưa có dữ liệu trong Database, bạn cần tạo quyền Admin bằng tay lần đầu:
1. Mở trang web, vào mục Đăng ký và tạo một tài khoản (VD: admin123).
2. Mở phần mềm MongoDB Compass, kết nối vào "mongodb://localhost:27017".
3. Tìm database "edugame", mở bảng "users".
4. Tìm tài khoản bạn vừa tạo, sửa dòng role: "user" thành role: "admin".
5. Bấm UPDATE để lưu lại. Lần sau đăng nhập lại, bạn đã có full quyền Admin!

======================================================
Chúc bạn cài đặt thành công! 🎉