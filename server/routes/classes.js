const router = require('express').Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const TeacherClass = require('../models/TeacherClass');
const QuestionSet = require('../models/QuestionSet');
const SchoolMember = require('../models/SchoolMember');
const { verifyToken } = require('../verifyToken');

const requireTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json('Chỉ giáo viên mới có thể quản lý lớp học!');
    }
    next();
};

const requireStudent = (req, res, next) => {
    if (!['user', 'teacher', 'admin'].includes(req.user.role)) {
        return res.status(403).json('Chỉ Student, Teacher hoặc Admin mới có thể tham gia lớp bằng mã!');
    }
    next();
};

const getTeacherCount = (classDoc) => {
    const primaryTeacherId = classDoc.teacher._id || classDoc.teacher;
    return new Set([
        primaryTeacherId.toString(),
        ...classDoc.teachers.map((teacherId) => teacherId.toString())
    ]).size;
};

const serializeStudentClass = (classDoc) => {
    const classData = classDoc.toObject();
    delete classData.students;
    delete classData.teachers;
    delete classData.questionSets;
    return {
        ...classData,
        teacherCount: getTeacherCount(classDoc),
        questionSetCount: classDoc.questionSets.length,
        assignmentCount: 0,
        assignments: []
    };
};

const requireClassTeacher = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }
    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        }).select('_id school');
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');
        if (req.user.role === 'user' && classDoc.school) {
            const membership = await SchoolMember.exists({ school: classDoc.school, user: req.user.id });
            if (!membership) return res.status(403).json('Bạn không còn là thành viên của School Community này!');
        }
        next();
    } catch (err) {
        res.status(500).json('Không thể xác thực quyền truy cập lớp!');
    }
};

const requirePrimaryTeacher = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }
    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            teacher: req.user.id
        }).select('_id');
        if (!classDoc) return res.status(403).json('Chỉ giáo viên chính mới có thể quản lý trợ giảng!');
        next();
    } catch (err) {
        res.status(500).json('Không thể xác thực quyền giáo viên chính!');
    }
};

router.get('/student/mine', verifyToken, requireStudent, async (req, res) => {
    try {
        const [classes, memberships] = await Promise.all([
            TeacherClass.find({
                $or: [{ students: req.user.id }, { teachers: req.user.id }]
            }).populate('teacher', 'username fullName'),
            SchoolMember.find({ user: req.user.id }).select('school')
        ]);
        const memberSchoolIds = new Set(memberships.map((membership) => membership.school.toString()));
        const visibleClasses = classes.filter((classDoc) =>
            !classDoc.school || memberSchoolIds.has(classDoc.school.toString())
        );
        await Promise.all(visibleClasses.map(async (classDoc) => {
            if (!classDoc.classCode) await classDoc.save();
        }));
        res.status(200).json(visibleClasses.map((classDoc) => ({
            ...serializeStudentClass(classDoc),
            isAssistant: classDoc.teachers.some((teacherId) => teacherId.toString() === req.user.id)
        })));
    } catch (err) {
        res.status(500).json('Không thể tải danh sách lớp của bạn!');
    }
});

router.post('/join-by-code', verifyToken, requireStudent, async (req, res) => {
    const classCode = typeof req.body?.classCode === 'string' ? req.body.classCode.trim().toLowerCase() : '';
    if (!/^[a-z]{8}$/.test(classCode)) {
        return res.status(400).json('Mã lớp phải gồm đúng 8 chữ cái a-z!');
    }
    const joinAsTeacher = req.body?.joinAsTeacher === true;
    if (req.body?.joinAsTeacher !== undefined && typeof req.body.joinAsTeacher !== 'boolean') {
        return res.status(400).json('Vai trò tham gia lớp không hợp lệ!');
    }
    if (joinAsTeacher && req.user.role !== 'teacher') {
        return res.status(403).json('Chỉ tài khoản giáo viên mới có thể tham gia lớp với quyền giáo viên!');
    }

    try {
        const classDoc = await TeacherClass.findOne({ classCode });
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp với mã này!');

        if (classDoc.school) {
            const membership = await SchoolMember.exists({ school: classDoc.school, user: req.user.id });
            if (!membership) return res.status(403).json('Bạn cần tham gia School Community của lớp trước!');
        }

        const alreadyJoined = classDoc.teacher.toString() === req.user.id
            || classDoc.teachers.some((teacherId) => teacherId.toString() === req.user.id)
            || classDoc.students.some((studentId) => studentId.toString() === req.user.id);
        if (alreadyJoined) return res.status(409).json('Bạn đã tham gia hoặc đang quản lý lớp này rồi!');

        const update = joinAsTeacher
            ? { $addToSet: { teachers: req.user.id } }
            : { $addToSet: { students: req.user.id } };
        const result = await TeacherClass.updateOne({
            _id: classDoc._id,
            teacher: { $ne: req.user.id },
            teachers: { $ne: req.user.id },
            students: { $ne: req.user.id }
        }, update);
        if (result.modifiedCount === 0) {
            return res.status(409).json('Bạn đã tham gia hoặc đang quản lý lớp này rồi!');
        }

        res.status(200).json({
            message: joinAsTeacher ? 'Đã tham gia lớp với quyền giáo viên!' : 'Tham gia lớp thành công!',
            classId: classDoc._id,
            joinAsTeacher
        });
    } catch (err) {
        res.status(500).json('Không thể tham gia lớp bằng mã!');
    }
});

router.get('/student/:id', verifyToken, requireStudent, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }
    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ students: req.user.id }, { teachers: req.user.id }]
        })
            .populate('teacher', 'username fullName');
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp bạn đã tham gia!');
        if (classDoc.school) {
            const membership = await SchoolMember.exists({ school: classDoc.school, user: req.user.id });
            if (!membership) return res.status(403).json('Bạn không còn là thành viên của School Community này!');
        }
        if (!classDoc.classCode) await classDoc.save();
        res.status(200).json({
            ...serializeStudentClass(classDoc),
            isAssistant: classDoc.teachers.some((teacherId) => teacherId.toString() === req.user.id)
        });
    } catch (err) {
        res.status(500).json('Không thể tải lớp học!');
    }
});

// API KIỂM TRA MÃ LỚP HỌC (Validation class code cho tạo phòng)
router.get('/validate-code/:code', async (req, res) => {
    try {
        const code = String(req.params.code || '').trim().toLowerCase();
        let query = mongoose.Types.ObjectId.isValid(code) ? { _id: code } : { classCode: code };
        const classDoc = await TeacherClass.findOne(query)
            .populate('teacher', 'username displayName')
            .populate('teachers', 'username displayName')
            .populate('students', 'username displayName');

        if (!classDoc) {
            return res.status(404).json({ valid: false, message: 'Mã lớp không tồn tại trên hệ thống!' });
        }

        res.status(200).json({
            valid: true,
            classId: classDoc._id,
            className: classDoc.className,
            classCode: classDoc.classCode,
            teacherName: classDoc.teacherName,
            teacherUsername: classDoc.teacher?.username || '',
            studentCount: (classDoc.students || []).length,
            class: classDoc
        });
    } catch (err) {
        console.error('Lỗi kiểm tra mã lớp:', err);
        res.status(500).json({ valid: false, message: 'Lỗi server khi kiểm tra mã lớp!' });
    }
});

// API: Lấy danh sách bộ đề của lớp học (phục vụ chọn đề trong phòng)
router.get('/:id/sets', async (req, res) => {
    try {
        const classIdentifier = req.params.id;
        let query = mongoose.Types.ObjectId.isValid(classIdentifier) 
            ? { _id: classIdentifier } 
            : { classCode: classIdentifier.toLowerCase().trim() };

        const classDoc = await TeacherClass.findOne(query).populate('questionSets');
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');
        return res.status(200).json(classDoc.questionSets || []);
    } catch (err) {
        console.error('Lỗi tải bộ đề của lớp:', err);
        return res.status(500).json('Không thể tải bộ đề của lớp!');
    }
});

router.use(verifyToken);

router.get('/mine', async (req, res) => {
    try {
        const classes = await TeacherClass.find({
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        })
            .select('className semester description teacherName teacher teachers classCode school questionSets createdAt')
            .sort({ createdAt: -1 });
        await Promise.all(classes.map(async (classDoc) => {
            if (!classDoc.classCode) await classDoc.save();
        }));
        res.status(200).json(classes.map((classDoc) => ({
            ...classDoc.toObject(),
            isPrimaryTeacher: classDoc.teacher.toString() === req.user.id,
            teacherCount: getTeacherCount(classDoc)
        })));
    } catch (err) {
        res.status(500).json('Không thể tải danh sách lớp học!');
    }
});

router.post('/', requireTeacher, async (req, res) => {
    const { className, semester = '', description = '', teacherName } = req.body;
    const semesterPattern = /^Kỳ\s+\d+\s+20\d{2}-20\d{2}$/;

    if (typeof className !== 'string' || !className.trim() || typeof teacherName !== 'string' || !teacherName.trim()) {
        return res.status(400).json('Vui lòng nhập tên lớp và tên giáo viên!');
    }
    if (semester && !semesterPattern.test(semester.trim())) {
        return res.status(400).json('Học kỳ phải theo định dạng: Kỳ n 202x-202x.');
    }

    try {
        const createdClass = await TeacherClass.create({
            className: className.trim(),
            semester: semester.trim(),
            description: typeof description === 'string' ? description.trim() : '',
            teacherName: teacherName.trim(),
            teacher: req.user.id
        });
        res.status(201).json(createdClass);
    } catch (err) {
        res.status(500).json('Không thể tạo lớp học!');
    }
});

router.get('/:id/members', requirePrimaryTeacher, async (req, res) => {
    const memberRole = req.query.role;
    if (!['students', 'teachers'].includes(memberRole)) {
        return res.status(400).json('Loại thành viên không hợp lệ!');
    }
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 20;
    const search = typeof req.query.search === 'string'
        ? req.query.search.trim().slice(0, 80)
        : '';
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const userFilter = escapedSearch
        ? { $or: [
            { 'user.username': { $regex: `^${escapedSearch}`, $options: 'i' } },
            { 'user.fullName': { $regex: `^${escapedSearch}`, $options: 'i' } }
        ] }
        : null;

    try {
        const pipeline = [
            { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
            { $project: { memberIds: `$${memberRole}` } },
            { $unwind: '$memberIds' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'memberIds',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            ...(userFilter ? [{ $match: userFilter }] : []),
            {
                $facet: {
                    data: [
                        { $sort: { 'user.fullName': 1, 'user.username': 1, 'user._id': 1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        {
                            $project: {
                                _id: '$user._id',
                                username: '$user.username',
                                fullName: '$user.fullName'
                            }
                        }
                    ],
                    metadata: [{ $count: 'totalItems' }]
                }
            }
        ];
        const [result] = await TeacherClass.aggregate(pipeline);
        const totalItems = result?.metadata[0]?.totalItems || 0;
        res.status(200).json({
            data: result?.data || [],
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (err) {
        res.status(500).json('Không thể tải danh sách thành viên lớp!');
    }
});

router.post('/:id/assistants/:userId', requirePrimaryTeacher, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json('Mã người dùng không hợp lệ!');
    }
    try {
        const result = await TeacherClass.updateOne({
            _id: req.params.id,
            teacher: req.user.id,
            students: req.params.userId,
            teachers: { $ne: req.params.userId }
        }, {
            $pull: { students: req.params.userId },
            $addToSet: { teachers: req.params.userId }
        });
        if (result.modifiedCount === 0) {
            return res.status(409).json('Người dùng không còn là học sinh của lớp hoặc đã là trợ giảng!');
        }
        res.status(200).json({ message: 'Đã thêm trợ giảng cho lớp!' });
    } catch (err) {
        res.status(500).json('Không thể thêm trợ giảng!');
    }
});

router.delete('/:id/assistants/:userId', requirePrimaryTeacher, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(400).json('Mã người dùng không hợp lệ!');
    }
    try {
        const result = await TeacherClass.updateOne({
            _id: req.params.id,
            teacher: req.user.id,
            teachers: req.params.userId,
            students: { $ne: req.params.userId }
        }, {
            $pull: { teachers: req.params.userId },
            $addToSet: { students: req.params.userId }
        });
        if (result.modifiedCount === 0) {
            return res.status(409).json('Người dùng không còn là trợ giảng của lớp!');
        }
        res.status(200).json({ message: 'Đã chuyển trợ giảng về vai trò học sinh!' });
    } catch (err) {
        res.status(500).json('Không thể phế truất trợ giảng!');
    }
});

router.get('/:id', requireClassTeacher, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        })
            .populate('questionSets', 'title description questions');
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');
        if (!classDoc.classCode) await classDoc.save();

        const classData = classDoc.toObject();
        const { students, ...details } = classData;
        delete details.teachers;
        res.status(200).json({
            ...details,
            isPrimaryTeacher: classDoc.teacher.toString() === req.user.id,
            studentCount: students.length,
            teacherCount: getTeacherCount(classDoc),
            questionSetCount: classDoc.questionSets.length,
            assignmentCount: 0,
            assignments: []
        });
    } catch (err) {
        res.status(500).json('Không thể tải thông tin lớp học!');
    }
});

router.post('/:id/question-sets', requireClassTeacher, async (req, res) => {
    const { questionSetId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(questionSetId)) {
        return res.status(400).json('Mã lớp hoặc bộ câu hỏi không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        });
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');

        const questionSet = await QuestionSet.findOne({ _id: questionSetId, owner: req.user.id });
        if (!questionSet) return res.status(404).json('Không tìm thấy bộ câu hỏi của bạn!');
        if (classDoc.questionSets.some((id) => id.toString() === questionSetId)) {
            return res.status(409).json('Bộ câu hỏi đã được thêm vào lớp này!');
        }

        classDoc.questionSets.push(questionSet._id);
        await classDoc.save();
        res.status(200).json({ message: 'Đã thêm bộ câu hỏi vào lớp!', questionSet });
    } catch (err) {
        res.status(500).json('Không thể thêm bộ câu hỏi vào lớp!');
    }
});


// API LƯU ĐIỂM LỚP HỌC (Dành cho Học sinh / Phòng lớp học)
router.post('/:id/scores', async (req, res) => {
    try {
        const { studentName, score, timePlayed, questionsAnswered, setId, setTitle, roomPin, role } = req.body;
        const classIdentifier = req.params.id;

        let query = {};
        if (mongoose.Types.ObjectId.isValid(classIdentifier)) {
            query = { _id: classIdentifier };
        } else {
            query = { classCode: classIdentifier.toLowerCase().trim() };
        }

        const classDoc = await TeacherClass.findOne(query);
        if (!classDoc) {
            return res.status(404).json('Không tìm thấy lớp học!');
        }

        const cleanName = (studentName || 'Người chơi').trim();
        const scoreVal = Number(score) || 0;
        const timeVal = Number(timePlayed) || 0;
        const qVal = Number(questionsAnswered) || 0;

        // Tự động xác thực vai trò (role) chính xác từ dữ liệu User và TeacherClass
        const User = require('../models/User');
        let userDoc = null;
        if (req.user?.id) {
            userDoc = await User.findById(req.user.id);
        }
        if (!userDoc && cleanName) {
            userDoc = await User.findOne({ username: cleanName });
        }

        let userRole = role || 'student';
        const isTeacherOfThisClass = (classDoc.teacher && userDoc && classDoc.teacher.toString() === userDoc._id.toString()) ||
            (classDoc.teacherName && cleanName.toLowerCase() === classDoc.teacherName.toLowerCase()) ||
            (userDoc && userDoc.role === 'teacher');

        if (isTeacherOfThisClass) {
            userRole = 'teacher';
        }

        // 1. Lưu vào gameScores
        if (!classDoc.gameScores) classDoc.gameScores = [];
        const newScoreRecord = {
            studentName: cleanName,
            score: scoreVal,
            timePlayed: timeVal,
            questionsAnswered: qVal,
            setId: mongoose.Types.ObjectId.isValid(setId) ? setId : null,
            setTitle: setTitle || '',
            playedAt: new Date()
        };
        classDoc.gameScores.push(newScoreRecord);

        // 2. Cập nhật vào gameSessions (đảm bảo danh sách người chơi chi tiết không bị trống)
        if (!classDoc.gameSessions) classDoc.gameSessions = [];
        let targetSession = null;
        if (roomPin) {
            targetSession = classDoc.gameSessions.find(s => s.roomPin === String(roomPin));
            if (!targetSession) {
                classDoc.gameSessions.push({
                    sessionId: require('crypto').randomUUID(),
                    roomPin: String(roomPin),
                    setTitle: setTitle || `Phòng Lớp ${classDoc.className}`,
                    setId: mongoose.Types.ObjectId.isValid(setId) ? setId : null,
                    playedAt: new Date(),
                    teacherParticipated: userRole === 'teacher',
                    players: []
                });
                targetSession = classDoc.gameSessions[classDoc.gameSessions.length - 1];
            }
        } else if (classDoc.gameSessions.length > 0) {
            const latest = classDoc.gameSessions[classDoc.gameSessions.length - 1];
            if (Date.now() - new Date(latest.playedAt).getTime() < 30 * 60 * 1000) {
                targetSession = latest;
            }
        }

        if (targetSession) {
            if (!targetSession.players) targetSession.players = [];
            let pEntry = targetSession.players.find(p => p.studentName === cleanName);
            if (!pEntry) {
                targetSession.players.push({
                    studentName: cleanName,
                    displayName: cleanName,
                    role: userRole,
                    score: scoreVal,
                    timePlayed: timeVal,
                    questionsAnswered: qVal,
                    rank: 1
                });
            } else {
                pEntry.score = scoreVal;
                pEntry.timePlayed = timeVal;
                pEntry.questionsAnswered = qVal;
                pEntry.role = userRole;
            }
            targetSession.players.sort((a, b) => (b.score || 0) - (a.score || 0));
            targetSession.players.forEach((p, idx) => { p.rank = idx + 1; });
            classDoc.markModified('gameSessions');
        }

        await classDoc.save();

        // 3. Đồng thời lưu vào lịch sử chơi cá nhân (playHistory mode: classroom) của User
        try {
            if (userDoc) {
                if (!userDoc.playHistory) userDoc.playHistory = [];
                userDoc.playHistory.unshift({
                    score: scoreVal,
                    timePlayed: timeVal,
                    questionsAnswered: qVal,
                    setId: mongoose.Types.ObjectId.isValid(setId) ? setId : null,
                    setTitle: setTitle || `Phòng Lớp ${classDoc.className}`,
                    isWeekly: false,
                    mode: 'classroom',
                    playedAt: new Date()
                });
                await userDoc.save();
                console.log(`👤 Đã đồng bộ playHistory (classroom) cho user [${cleanName}]`);
            }
        } catch (uErr) {
            console.error('Lỗi cập nhật playHistory khi lưu điểm lớp:', uErr);
        }

        res.status(200).json({
            message: 'Lưu điểm lớp học thành công!',
            scoreRecord: newScoreRecord,
            totalScores: classDoc.gameScores.length,
            sessionUpdated: Boolean(targetSession)
        });
    } catch (err) {
        console.error('Lỗi lưu điểm lớp học:', err);
        res.status(500).json('Không thể lưu điểm lớp học!');
    }
});

// API LẤY DANH SÁCH ĐIỂM LỚP HỌC (Dành cho giáo viên xem kết quả)
router.get('/:id/scores', async (req, res) => {
    try {
        const classIdentifier = req.params.id;
        let query = {};
        if (mongoose.Types.ObjectId.isValid(classIdentifier)) {
            query = { _id: classIdentifier };
        } else {
            query = { classCode: classIdentifier.toLowerCase().trim() };
        }

        const classDoc = await TeacherClass.findOne(query).select('className classCode gameScores');
        if (!classDoc) {
            return res.status(404).json('Không tìm thấy lớp học!');
        }

        const sortedScores = [...(classDoc.gameScores || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
        res.status(200).json({
            className: classDoc.className,
            classCode: classDoc.classCode,
            scores: sortedScores
        });
    } catch (err) {
        console.error('Lỗi lấy điểm lớp học:', err);
        res.status(500).json('Không thể lấy điểm lớp học!');
    }
});

// API XEM LỊCH SỬ CÁC MÀN CHƠI CỦA LỚP HỌC
// Chỉ giáo viên của lớp mới xem được chi tiết điểm từng học sinh. Học sinh chỉ thấy danh sách phiên chơi!
router.get('/:id/game-sessions', verifyToken, async (req, res) => {
    try {
        const classIdentifier = req.params.id;
        let query = mongoose.Types.ObjectId.isValid(classIdentifier) 
            ? { _id: classIdentifier } 
            : { classCode: classIdentifier.toLowerCase().trim() };

        const classDoc = await TeacherClass.findOne(query)
            .populate('teacher', 'username displayName')
            .populate('teachers', 'username displayName')
            .populate('students', 'username displayName');

        if (!classDoc) {
            return res.status(404).json('Không tìm thấy lớp học!');
        }

        const userId = req.user.id ? req.user.id.toString() : '';
        const userUsername = (req.user.username || '').toLowerCase();

        const isPrimaryTeacher = classDoc.teacher && classDoc.teacher._id.toString() === userId;
        const isAssistantTeacher = (classDoc.teachers || []).some(t => t._id.toString() === userId);
        const isStudent = (classDoc.students || []).some(s => s._id.toString() === userId);
        const isAdmin = req.user.role === 'admin';

        const isTeacherOfClass = isPrimaryTeacher || isAssistantTeacher || isAdmin;

        if (!isTeacherOfClass && !isStudent) {
            return res.status(403).json('Bạn không phải là thành viên của lớp học này!');
        }

        const rawSessions = classDoc.gameSessions || [];
        const sortedSessions = [...rawSessions].sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

        if (isTeacherOfClass) {
            return res.status(200).json({
                isTeacher: true,
                className: classDoc.className,
                classCode: classDoc.classCode,
                sessions: sortedSessions
            });
        } else {
            const maskedSessions = sortedSessions.map(session => {
                const myScoreEntry = (session.players || []).find(p => 
                    (p.student && p.student.toString() === userId) || 
                    (p.studentName && p.studentName.toLowerCase() === userUsername)
                );

                return {
                    sessionId: session.sessionId,
                    roomPin: session.roomPin,
                    setTitle: session.setTitle,
                    playedAt: session.playedAt,
                    totalParticipants: (session.players || []).length,
                    teacherParticipated: session.teacherParticipated,
                    myResult: myScoreEntry ? {
                        score: myScoreEntry.score,
                        timePlayed: myScoreEntry.timePlayed,
                        questionsAnswered: myScoreEntry.questionsAnswered,
                        rank: myScoreEntry.rank
                    } : null
                };
            });

            return res.status(200).json({
                isTeacher: false,
                className: classDoc.className,
                classCode: classDoc.classCode,
                sessions: maskedSessions
            });
        }
    } catch (err) {
        console.error('Lỗi lấy lịch sử màn chơi lớp:', err);
        res.status(500).json('Không thể tải lịch sử màn chơi lớp học!');
    }
});

// API GHI NHẬN PHIÊN CHƠI MỚI CHO LỚP HỌC
router.post('/:id/game-sessions', async (req, res) => {
    try {
        const classIdentifier = req.params.id;
        let query = mongoose.Types.ObjectId.isValid(classIdentifier) 
            ? { _id: classIdentifier } 
            : { classCode: classIdentifier.toLowerCase().trim() };

        const classDoc = await TeacherClass.findOne(query);
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');

        const { roomPin, setTitle, setId, teacherParticipated, players } = req.body;

        const sortedPlayers = [...(players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
        const rankedPlayers = sortedPlayers.map((p, idx) => ({
            student: p.studentId || null,
            studentName: p.name || p.studentName || 'Người chơi',
            displayName: p.displayName || '',
            role: p.role || 'student',
            score: Number(p.score) || 0,
            timePlayed: Number(p.timePlayed) || 0,
            questionsAnswered: Number(p.questionsAnswered) || 0,
            rank: idx + 1
        }));

        const newSession = {
            sessionId: crypto.randomUUID(),
            roomPin: roomPin || '',
            setTitle: setTitle || 'Màn chơi Lớp học',
            setId: mongoose.Types.ObjectId.isValid(setId) ? setId : null,
            playedAt: new Date(),
            teacherParticipated: Boolean(teacherParticipated),
            players: rankedPlayers
        };

        if (!classDoc.gameSessions) classDoc.gameSessions = [];
        classDoc.gameSessions.push(newSession);

        if (!classDoc.gameScores) classDoc.gameScores = [];
        rankedPlayers.forEach(p => {
            classDoc.gameScores.push({
                student: p.student,
                studentName: p.studentName,
                score: p.score,
                timePlayed: p.timePlayed,
                questionsAnswered: p.questionsAnswered,
                setId: newSession.setId,
                setTitle: newSession.setTitle,
                playedAt: new Date()
            });
        });

        await classDoc.save();

        res.status(200).json({
            message: 'Đã lưu phiên chơi lớp học thành công!',
            session: newSession
        });
    } catch (err) {
        console.error('Lỗi tạo phiên chơi lớp học:', err);
        res.status(500).json('Lỗi server khi lưu phiên chơi!');
    }
});

module.exports = router;
