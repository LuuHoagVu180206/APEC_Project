const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const TeacherClass = require('./models/TeacherClass');

function deny(status, message) {
    const error = new Error(message);
    error.status = status;
    throw error;
}

// Never trust a client-supplied role, username or userId for classroom access.
async function authorizeClassroom(token, classIdentifier) {
    if (typeof token !== 'string' || !token.trim()) {
        deny(401, 'Vui lòng đăng nhập bằng tài khoản Giáo viên để tạo phòng lớp học!');
    }
    let decoded;
    try {
        decoded = jwt.verify(token.replace(/^Bearer /, '').trim(), process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_server');
    } catch (_) {
        deny(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!');
    }
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
        deny(401, 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!');
    }
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'teacher') {
        deny(403, 'Chỉ tài khoản Giáo viên mới có quyền tạo phòng lớp học!');
    }
    const code = String(classIdentifier || '').trim().toLowerCase();
    if (!code) deny(400, 'Vui lòng nhập mã lớp học để tạo phòng!');
    const classDoc = await TeacherClass.findOne(mongoose.Types.ObjectId.isValid(code) ? { _id: code } : { classCode: code });
    if (!classDoc) deny(404, `Mã lớp học "${code}" không tồn tại trên hệ thống!`);
    const idOf = value => value ? String(value._id || value) : '';
    const managesClass = [classDoc.teacher, ...(classDoc.teachers || [])].some(value => idOf(value) === String(user._id));
    if (!managesClass) deny(403, 'Bạn không quản lý lớp học này! Chỉ giáo viên phụ trách lớp mới có quyền tạo phòng cho lớp này.');
    return { user, classDoc };
}

module.exports = { authorizeClassroom };
