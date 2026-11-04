const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const QuestionSet = require('./models/QuestionSet');

async function roomUser(token) {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_server');
        if (mongoose.Types.ObjectId.isValid(decoded.id)) return await User.findById(decoded.id);
    } catch (_) {}
    throw new Error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!');
}

async function roomQuestionSet(setId, user, classDoc = null) {
    if (!setId || !mongoose.Types.ObjectId.isValid(setId)) throw new Error('Vui lòng chọn bộ câu hỏi trước khi tạo phòng!');
    const set = await QuestionSet.findById(setId);
    if (!set) throw new Error('Bộ câu hỏi không tồn tại. Vui lòng chọn bộ khác!');
    const ownsSet = user && String(set.owner) === String(user._id);
    const classSet = classDoc && (classDoc.questionSets || []).some(id => String(id) === String(set._id));
    if (!set.isPublic && !ownsSet && !classSet) throw new Error('Bạn không có quyền sử dụng bộ câu hỏi này!');
    if (!set.questions?.length) throw new Error('Bộ câu hỏi chưa có câu hỏi. Vui lòng chọn bộ khác!');
    return set;
}

const newResumeToken = () => crypto.randomBytes(32).toString('hex');
function matchesResumeToken(expected, actual) {
    if (typeof expected !== 'string' || !expected || typeof actual !== 'string') return false;
    const expectedBytes = Buffer.from(expected);
    const actualBytes = Buffer.from(actual);
    return expectedBytes.length === actualBytes.length && crypto.timingSafeEqual(expectedBytes, actualBytes);
}

function roomSnapshot(pin, lobby) {
    return {
        pin, roomType: lobby.roomType, tag: lobby.tag, classId: lobby.classId,
        className: lobby.className, classCode: lobby.classCode, setId: lobby.setId,
        setTitle: lobby.setTitle, roomName: lobby.roomName, gameState: lobby.gameState,
        teacherParticipates: lobby.teacherParticipates, hostConnected: lobby.hostConnected,
        players: lobby.players.map(({ disconnectTimeout, ...player }) => player)
    };
}

module.exports = { roomUser, roomQuestionSet, newResumeToken, matchesResumeToken, roomSnapshot };
