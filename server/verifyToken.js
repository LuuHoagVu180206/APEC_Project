const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Lấy vé từ trong header gửi lên
    const authHeader = req.headers.token;
    
    if (authHeader) {
        // Token thường có dạng: "Bearer ahsdkjhaskj..." nên ta lấy phần sau dấu cách
        // Nhưng ở bài này mình làm đơn giản, cứ gửi token thẳng lên là được
        const token = authHeader; 

        jwt.verify(token, process.env.JWT_SECRET || "mat_khau_bi_mat_cua_server", (err, user) => {
            if (err) return res.status(403).json("Token không hợp lệ!");
            req.user = user; // Gắn thông tin người dùng vào request
            next(); // Cho phép đi tiếp vào trong
        });
    } else {
        return res.status(401).json("Bạn chưa đăng nhập!");
    }
};

const verifyAdmin = (req, res, next) => {
    // Đầu tiên cứ bắt nó qua trạm kiểm tra vé bình thường đã
    verifyToken(req, res, () => {
        // Sau khi soát vé xong, kiểm tra xem chức vụ có phải admin không
        if (req.user.role === 'admin') {
            next(); // Là admin -> Cho phép đi tiếp vào làm việc
        } else {
            res.status(403).json("Bạn không có quyền Admin!"); // Dân thường -> Đuổi về
        }
    });
};

module.exports = { verifyToken, verifyAdmin };