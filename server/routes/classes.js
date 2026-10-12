const router = require('express').Router();
const mongoose = require('mongoose');
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

module.exports = router;