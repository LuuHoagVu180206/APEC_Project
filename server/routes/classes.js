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
    if (req.user.role !== 'user') {
        return res.status(403).json('Chỉ Student mới có thể tham gia lớp bằng mã!');
    }
    next();
};

const serializeStudentClass = (classDoc) => {
    const classData = classDoc.toObject();
    delete classData.students;
    delete classData.questionSets;
    return {
        ...classData,
        questionSetCount: classDoc.questionSets.length,
        assignmentCount: 0,
        assignments: []
    };
};

router.get('/student/mine', verifyToken, requireStudent, async (req, res) => {
    try {
        const [classes, memberships] = await Promise.all([
            TeacherClass.find({ students: req.user.id }).populate('teacher', 'username fullName'),
            SchoolMember.find({ user: req.user.id }).select('school')
        ]);
        const memberSchoolIds = new Set(memberships.map((membership) => membership.school.toString()));
        const visibleClasses = classes.filter((classDoc) =>
            !classDoc.school || memberSchoolIds.has(classDoc.school.toString())
        );
        await Promise.all(visibleClasses.map(async (classDoc) => {
            if (!classDoc.classCode) await classDoc.save();
        }));
        res.status(200).json(visibleClasses.map(serializeStudentClass));
    } catch (err) {
        res.status(500).json('Không thể tải danh sách lớp của bạn!');
    }
});

router.post('/join-by-code', verifyToken, requireStudent, async (req, res) => {
    const classCode = typeof req.body?.classCode === 'string' ? req.body.classCode.trim().toLowerCase() : '';
    if (!/^[a-z]{8}$/.test(classCode)) {
        return res.status(400).json('Mã lớp phải gồm đúng 8 chữ cái a-z!');
    }

    try {
        const classDoc = await TeacherClass.findOne({ classCode });
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp với mã này!');

        if (classDoc.school) {
            const membership = await SchoolMember.exists({ school: classDoc.school, user: req.user.id });
            if (!membership) return res.status(403).json('Bạn cần tham gia School Community của lớp trước!');
        }

        const alreadyJoined = classDoc.students.some((studentId) => studentId.toString() === req.user.id);
        if (!alreadyJoined) {
            await TeacherClass.updateOne(
                { _id: classDoc._id, students: { $ne: req.user.id } },
                { $addToSet: { students: req.user.id } }
            );
        }

        res.status(200).json({
            message: alreadyJoined ? 'Bạn đã tham gia lớp này rồi!' : 'Tham gia lớp thành công!',
            classId: classDoc._id
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
        const classDoc = await TeacherClass.findOne({ _id: req.params.id, students: req.user.id })
            .populate('teacher', 'username fullName');
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp bạn đã tham gia!');
        if (classDoc.school) {
            const membership = await SchoolMember.exists({ school: classDoc.school, user: req.user.id });
            if (!membership) return res.status(403).json('Bạn không còn là thành viên của School Community này!');
        }
        if (!classDoc.classCode) await classDoc.save();
        res.status(200).json(serializeStudentClass(classDoc));
    } catch (err) {
        res.status(500).json('Không thể tải lớp học!');
    }
});

router.use(verifyToken, requireTeacher);

router.get('/mine', async (req, res) => {
    try {
        const classes = await TeacherClass.find({ teacher: req.user.id })
            .select('className semester description teacherName classCode school questionSets createdAt')
            .sort({ createdAt: -1 });
        await Promise.all(classes.map(async (classDoc) => {
            if (!classDoc.classCode) await classDoc.save();
        }));
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json('Không thể tải danh sách lớp học!');
    }
});

router.post('/', async (req, res) => {
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

router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({ _id: req.params.id, teacher: req.user.id })
            .populate('questionSets', 'title description questions');
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');
        if (!classDoc.classCode) await classDoc.save();

        const classData = classDoc.toObject();
        const { students, ...details } = classData;
        res.status(200).json({
            ...details,
            studentCount: students.length,
            questionSetCount: classDoc.questionSets.length,
            assignmentCount: 0,
            assignments: []
        });
    } catch (err) {
        res.status(500).json('Không thể tải thông tin lớp học!');
    }
});

router.post('/:id/question-sets', async (req, res) => {
    const { questionSetId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(questionSetId)) {
        return res.status(400).json('Mã lớp hoặc bộ câu hỏi không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({ _id: req.params.id, teacher: req.user.id });
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