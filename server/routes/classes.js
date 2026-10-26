const router = require('express').Router();
const mongoose = require('mongoose');
const TeacherClass = require('../models/TeacherClass');
const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const SchoolMember = require('../models/SchoolMember');
const { verifyToken } = require('../verifyToken');

const isAnswerCorrect = (selected, correct, options = []) => {
    if (selected === undefined || selected === null || correct === undefined || correct === null) return false;
    const s = String(selected).trim().toLowerCase();
    const c = String(correct).trim().toLowerCase();
    if (!s || !c) return false;

    // Direct match
    if (s === c) return true;

    // Stripped of prefix like "A. ", "B) ", "c: "
    const stripPrefix = (str) => str.replace(/^[a-d][\.\:\)\-]\s*/i, '').trim().toLowerCase();
    const sStripped = stripPrefix(s);
    const cStripped = stripPrefix(c);
    if (sStripped === cStripped) return true;

    // Check letter vs options
    const letters = ['a', 'b', 'c', 'd'];
    const cLetterIdx = letters.indexOf(c);
    if (cLetterIdx !== -1 && options[cLetterIdx]) {
        const optText = String(options[cLetterIdx]).trim().toLowerCase();
        if (s === optText || sStripped === stripPrefix(optText)) return true;
    }

    const sLetterIdx = letters.indexOf(s);
    if (sLetterIdx !== -1 && options[sLetterIdx]) {
        const optText = String(options[sLetterIdx]).trim().toLowerCase();
        if (c === optText || cStripped === stripPrefix(optText)) return true;
    }

    return false;
};

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

const serializeStudentClass = (classDoc, submissionMap = null) => {
    const studentCount = Array.isArray(classDoc.students) ? classDoc.students.length : 0;
    const classData = classDoc.toObject ? classDoc.toObject() : { ...classDoc };
    delete classData.students;
    delete classData.teachers;
    delete classData.questionSets;
    const rawAssignments = classDoc.assignments || [];

    const now = new Date();
    let completedCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    const enrichedAssignments = rawAssignments.map((assignment) => {
        const assignObj = assignment.toObject ? assignment.toObject() : { ...assignment };
        const assignIdStr = (assignObj._id || '').toString();

        let sub = null;
        if (submissionMap) {
            sub = submissionMap.get(assignIdStr) || submissionMap.get(`${classDoc._id}_${assignIdStr}`);
        }

        const isSubmitted = Boolean(sub);
        const isOverdue = !isSubmitted && Boolean(assignObj.dueDate && new Date(assignObj.dueDate) < now);

        let status = 'pending';
        if (isSubmitted) {
            status = 'completed';
            completedCount += 1;
        } else if (isOverdue) {
            status = 'overdue';
            overdueCount += 1;
        } else {
            pendingCount += 1;
        }

        const maxAttempts = assignObj.maxAttempts || 1;
        const attemptNumber = sub ? sub.attemptNumber : 0;
        const canTake = !isOverdue && (!sub || attemptNumber < maxAttempts);

        // Security check: Only include correctAnswer and explanation if student has already submitted!
        const sanitizedQuestions = (assignObj.questions || []).map((q) => {
            const qObj = q ? (q.toObject ? q.toObject() : { ...q }) : {};
            if (!isSubmitted) {
                delete qObj.correctAnswer;
                delete qObj.explanation;
            }
            return qObj;
        });

        return {
            ...assignObj,
            questions: sanitizedQuestions,
            status, // 'pending' | 'completed' | 'overdue'
            isSubmitted,
            isOverdue,
            canTake,
            submission: sub ? {
                _id: sub._id,
                score: sub.score,
                totalQuestions: sub.totalQuestions,
                startedAt: sub.startedAt,
                submittedAt: sub.submittedAt,
                attemptNumber: sub.attemptNumber,
                answers: sub.answers
            } : null
        };
    });

    return {
        ...classData,
        studentCount: studentCount,
        teacherCount: getTeacherCount(classDoc),
        questionSetCount: classDoc.questionSets ? classDoc.questionSets.length : 0,
        assignmentCount: rawAssignments.length,
        completedAssignmentCount: completedCount,
        pendingAssignmentCount: pendingCount,
        overdueAssignmentCount: overdueCount,
        assignments: enrichedAssignments
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
            })
                .populate('teacher', 'username fullName')
                .populate({
                    path: 'assignments',
                    options: { sort: { createdAt: -1 } },
                    populate: {
                        path: 'questions',
                        select: 'questionText options difficulty topic'
                    }
                }),
            SchoolMember.find({ user: req.user.id }).select('school')
        ]);
        const memberSchoolIds = new Set(memberships.map((membership) => membership.school.toString()));
        const visibleClasses = classes.filter((classDoc) =>
            !classDoc.school || memberSchoolIds.has(classDoc.school.toString())
        );
        await Promise.all(visibleClasses.map(async (classDoc) => {
            if (!classDoc.classCode) await classDoc.save();
        }));

        // OPTIMIZED QUERY: Find student submissions for all visible classes in a single query
        const visibleClassIds = visibleClasses.map(c => c._id);
        const userSubmissions = await AssignmentSubmission.find({
            classId: { $in: visibleClassIds },
            studentId: req.user.id
        }).select('classId assignmentId score totalQuestions attemptNumber submittedAt').lean();

        const submissionMap = new Map();
        for (const sub of userSubmissions) {
            submissionMap.set(`${sub.classId}_${sub.assignmentId}`, sub);
            if (!submissionMap.has(sub.assignmentId.toString())) {
                submissionMap.set(sub.assignmentId.toString(), sub);
            }
        }

        res.status(200).json(visibleClasses.map((classDoc) => ({
            ...serializeStudentClass(classDoc, submissionMap),
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
            .populate('teacher', 'username fullName')
            .populate({
                path: 'assignments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'questions',
                    select: 'questionText options correctAnswer difficulty topic explanation'
                }
            });
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp bạn đã tham gia!');
        if (classDoc.school) {
            const membership = await SchoolMember.exists({ school: classDoc.school, user: req.user.id });
            if (!membership) return res.status(403).json('Bạn không còn là thành viên của School Community này!');
        }
        if (!classDoc.classCode) await classDoc.save();

        // Query student submissions for this class in a SINGLE indexed query (classId + studentId)
        const submissions = await AssignmentSubmission.find({
            classId: classDoc._id,
            studentId: req.user.id
        }).sort({ attemptNumber: -1 }).lean();

        const submissionMap = new Map();
        for (const sub of submissions) {
            const key = sub.assignmentId.toString();
            if (!submissionMap.has(key)) {
                submissionMap.set(key, sub);
            }
        }

        res.status(200).json({
            ...serializeStudentClass(classDoc, submissionMap),
            isAssistant: classDoc.teachers.some((teacherId) => teacherId.toString() === req.user.id)
        });
    } catch (err) {
        res.status(500).json('Không thể tải lớp học!');
    }
});

// STUDENT NỘP BÀI ASSIGNMENT (1.2, 1.4, 1.5)
router.post('/student/:id/assignments/:assignmentId/submit', verifyToken, requireStudent, async (req, res) => {
    const { id: classId, assignmentId } = req.params;
    const { startedAt, answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json('Mã lớp hoặc mã bài tập không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({
            _id: classId,
            $or: [{ students: req.user.id }, { teachers: req.user.id }]
        });
        if (!classDoc) {
            return res.status(404).json('Không tìm thấy lớp học hoặc bạn chưa tham gia lớp này!');
        }

        const assignment = await Assignment.findOne({ _id: assignmentId, classId }).populate('questions');
        if (!assignment) {
            return res.status(404).json('Không tìm thấy bài tập trong lớp học này!');
        }

        // Kiểm tra quá hạn
        if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
            return res.status(400).json('Bài tập đã quá thời hạn nộp bài!');
        }

        // Chính sách làm bài: Mặc định mỗi học sinh 1 lần, mở rộng theo maxAttempts (1.5)
        const maxAttempts = assignment.maxAttempts || 1;
        const currentAttempts = await AssignmentSubmission.countDocuments({
            assignmentId: assignment._id,
            studentId: req.user.id
        });

        if (currentAttempts >= maxAttempts) {
            const existingSub = await AssignmentSubmission.findOne({
                assignmentId: assignment._id,
                studentId: req.user.id
            }).sort({ attemptNumber: -1 });

            return res.status(409).json({
                message: 'Bạn đã hoàn thành số lần nộp bài cho phép của bài tập này!',
                submission: existingSub
            });
        }

        const nextAttemptNumber = currentAttempts + 1;
        const questionsList = assignment.questions || [];
        let correctCount = 0;

        const studentAnswersMap = new Map();
        if (Array.isArray(answers)) {
            for (const item of answers) {
                if (item?.questionId) {
                    studentAnswersMap.set(item.questionId.toString(), item.selectedAnswer || '');
                }
            }
        }

        const evaluatedAnswers = questionsList.map((q) => {
            const qIdStr = q._id.toString();
            const selected = studentAnswersMap.get(qIdStr) || '';
            const correct = q.correctAnswer || '';
            const isCorrect = isAnswerCorrect(selected, correct, q.options || []);

            if (isCorrect) correctCount += 1;

            return {
                questionId: q._id,
                selectedAnswer: selected,
                correctAnswer: correct,
                isCorrect: isCorrect
            };
        });

        const parsedStartedAt = startedAt ? new Date(startedAt) : new Date();
        const submittedAt = new Date();

        // Lưu kết quả (1.4 - Compound unique index chống duplicate submission)
        let submission;
        try {
            submission = await AssignmentSubmission.create({
                assignmentId: assignment._id,
                classId: classDoc._id,
                studentId: req.user.id,
                attemptNumber: nextAttemptNumber,
                answers: evaluatedAnswers,
                score: correctCount,
                totalQuestions: questionsList.length,
                startedAt: isNaN(parsedStartedAt.getTime()) ? new Date() : parsedStartedAt,
                submittedAt: submittedAt,
                status: 'submitted'
            });
        } catch (dbErr) {
            // E11000 duplicate key check (anti-double-click / network retry)
            if (dbErr.code === 11000) {
                submission = await AssignmentSubmission.findOne({
                    assignmentId: assignment._id,
                    studentId: req.user.id,
                    attemptNumber: nextAttemptNumber
                });
            } else {
                throw dbErr;
            }
        }

        // Trả kết quả chi tiết để hiển thị giao diện đáp án đúng/sai (1.3)
        const questionsMap = new Map(questionsList.map((q) => [q._id.toString(), q]));
        const detailedAnswers = submission.answers.map((ans) => {
            const q = questionsMap.get(ans.questionId.toString());
            return {
                questionId: ans.questionId,
                questionText: q?.questionText || '',
                options: q?.options || [],
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: ans.correctAnswer,
                isCorrect: ans.isCorrect,
                explanation: q?.explanation || '',
                difficulty: q?.difficulty || 'medium'
            };
        });

        res.status(201).json({
            message: 'Nộp bài tập thành công!',
            submission: {
                _id: submission._id,
                assignmentId: submission.assignmentId,
                score: submission.score,
                totalQuestions: submission.totalQuestions,
                startedAt: submission.startedAt,
                submittedAt: submission.submittedAt,
                attemptNumber: submission.attemptNumber,
                answers: detailedAnswers
            }
        });
    } catch (err) {
        console.error('Lỗi khi nộp bài tập:', err);
        res.status(500).json('Không thể nộp bài tập: ' + (err.message || ''));
    }
});

// STUDENT XEM LẠI KẾT QUẢ BÀI TẬP ĐÃ LÀM (1.3)
router.get('/student/:id/assignments/:assignmentId/my-result', verifyToken, requireStudent, async (req, res) => {
    const { id: classId, assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json('Mã không hợp lệ!');
    }

    try {
        const assignment = await Assignment.findOne({ _id: assignmentId, classId }).populate('questions');
        if (!assignment) {
            return res.status(404).json('Không tìm thấy bài tập!');
        }

        const submission = await AssignmentSubmission.findOne({
            assignmentId: assignment._id,
            studentId: req.user.id
        }).sort({ attemptNumber: -1 });

        if (!submission) {
            return res.status(404).json('Bạn chưa làm bài tập này!');
        }

        const questionsMap = new Map((assignment.questions || []).map((q) => [q._id.toString(), q]));
        const detailedAnswers = submission.answers.map((ans) => {
            const q = questionsMap.get(ans.questionId.toString());
            return {
                questionId: ans.questionId,
                questionText: q?.questionText || '',
                options: q?.options || [],
                selectedAnswer: ans.selectedAnswer,
                correctAnswer: ans.correctAnswer,
                isCorrect: ans.isCorrect,
                explanation: q?.explanation || '',
                difficulty: q?.difficulty || 'medium'
            };
        });

        res.status(200).json({
            _id: submission._id,
            assignmentId: submission.assignmentId,
            assignmentTitle: assignment.title,
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            startedAt: submission.startedAt,
            submittedAt: submission.submittedAt,
            attemptNumber: submission.attemptNumber,
            answers: detailedAnswers
        });
    } catch (err) {
        console.error('Lỗi khi lấy kết quả bài tập:', err);
        res.status(500).json('Không thể lấy kết quả bài tập!');
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

// CHI TIẾT LỚP HỌC DÀNH CHO GIÁO VIÊN (2.1 - TỔNG QUAN ASSIGNMENT)
router.get('/:id', requireClassTeacher, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        })
            .populate({
                path: 'questionSets',
                select: 'title description topic questions',
                populate: {
                    path: 'questions',
                    select: 'questionText options correctAnswer difficulty topic explanation'
                }
            })
            .populate({
                path: 'assignments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'questions',
                    select: 'questionText options correctAnswer difficulty topic explanation'
                }
            });
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');
        if (!classDoc.classCode) await classDoc.save();

        const classData = classDoc.toObject();
        const { students, ...details } = classData;
        delete details.teachers;

        const studentCount = Array.isArray(students) ? students.length : 0;
        const assignmentIds = (classDoc.assignments || []).map(a => a._id);

        // OPTIMIZED QUERY: Truy vấn duy nhất qua aggregation để lấy số lượng học sinh duy nhất đã nộp cho từng assignment
        // Tuyệt đối không dùng brute force / N+1
        const assignmentStatsMap = new Map();
        if (assignmentIds.length > 0) {
            const aggStats = await AssignmentSubmission.aggregate([
                { $match: { assignmentId: { $in: assignmentIds } } },
                {
                    $group: {
                        _id: '$assignmentId',
                        uniqueStudents: { $addToSet: '$studentId' },
                        totalSubmissions: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        submittedCount: { $size: '$uniqueStudents' },
                        totalSubmissions: 1
                    }
                }
            ]);
            for (const s of aggStats) {
                assignmentStatsMap.set(s._id.toString(), s);
            }
        }

        const enrichedAssignments = (classDoc.assignments || []).map((assignment) => {
            const aObj = assignment.toObject ? assignment.toObject() : assignment;
            const stat = assignmentStatsMap.get(aObj._id.toString());
            const submittedCount = stat ? stat.submittedCount : 0;
            const notSubmittedCount = Math.max(0, studentCount - submittedCount);
            const completionRate = studentCount > 0 ? Math.round((submittedCount / studentCount) * 1000) / 10 : 0;

            return {
                ...aObj,
                stats: {
                    totalStudents: studentCount,
                    submittedCount,
                    notSubmittedCount,
                    completionRate,
                    totalSubmissions: stat ? stat.totalSubmissions : 0
                }
            };
        });

        res.status(200).json({
            ...details,
            isPrimaryTeacher: classDoc.teacher.toString() === req.user.id,
            studentCount: studentCount,
            teacherCount: getTeacherCount(classDoc),
            questionSetCount: classDoc.questionSets ? classDoc.questionSets.length : 0,
            assignmentCount: enrichedAssignments.length,
            assignments: enrichedAssignments
        });
    } catch (err) {
        res.status(500).json('Không thể tải thông tin lớp học!');
    }
});

// THỐNG KÊ TỔNG QUAN & DANH SÁCH HỌC SINH ĐÃ NỘP BÀI TẬP (2.1 & 2.2)
router.get('/:id/assignments/:assignmentId/submissions', requireClassTeacher, async (req, res) => {
    const { id: classId, assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json('Mã không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({
            _id: classId,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        }).select('students');

        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');

        const assignment = await Assignment.findOne({ _id: assignmentId, classId }).select('title dueDate questions');
        if (!assignment) return res.status(404).json('Không tìm thấy bài tập!');

        const totalStudents = Array.isArray(classDoc.students) ? classDoc.students.length : 0;

        // TRUY VẤN TỐI ƯU BẰNG AGGREGATION PIPELINE:
        // TUYỆT ĐỐI KHÔNG SỬ DỤNG BRUTE FORCE
        // Sử dụng index { assignmentId: 1, submittedAt: -1 }
        // Nhóm theo studentId để lấy bài nộp gần nhất theo từng học sinh duy nhất (Requirement 2.1 Note: unique students)
        const submissions = await AssignmentSubmission.aggregate([
            { $match: { assignmentId: new mongoose.Types.ObjectId(assignmentId) } },
            { $sort: { submittedAt: -1 } },
            {
                $group: {
                    _id: '$studentId',
                    latestSubmission: { $first: '$$ROOT' },
                    attemptCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $project: {
                    _id: '$latestSubmission._id',
                    studentId: '$_id',
                    studentName: {
                        $cond: [
                            { $and: ['$student.fullName', { $ne: ['$student.fullName', ''] }] },
                            '$student.fullName',
                            '$student.username'
                        ]
                    },
                    studentUsername: '$student.username',
                    score: '$latestSubmission.score',
                    totalQuestions: '$latestSubmission.totalQuestions',
                    startedAt: '$latestSubmission.startedAt',
                    submittedAt: '$latestSubmission.submittedAt',
                    attemptNumber: '$latestSubmission.attemptNumber',
                    attemptCount: '$attemptCount',
                    answers: '$latestSubmission.answers'
                }
            },
            { $sort: { submittedAt: -1 } }
        ]);

        const submittedCount = submissions.length;
        const notSubmittedCount = Math.max(0, totalStudents - submittedCount);
        const completionRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 1000) / 10 : 0;

        res.status(200).json({
            assignment: {
                _id: assignment._id,
                title: assignment.title,
                dueDate: assignment.dueDate,
                totalQuestions: assignment.questions?.length || 0
            },
            stats: {
                totalStudents,
                submittedCount,
                notSubmittedCount,
                completionRate
            },
            submissions
        });
    } catch (err) {
        console.error('Lỗi khi tải danh sách nộp bài:', err);
        res.status(500).json('Không thể tải danh sách nộp bài!');
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

// TẠO ASSIGNMENT MỚI CHO LỚP
router.post('/:id/assignments', requireClassTeacher, async (req, res) => {
    const { title, dueDate, questionIds, description } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json('Vui lòng nhập tên cho Assignment!');
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json('Vui lòng chọn ít nhất 1 câu hỏi từ các bộ câu hỏi của lớp!');
    }

    const validIds = questionIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
        return res.status(400).json('Danh sách câu hỏi không hợp lệ!');
    }
    const uniqueQuestionIds = [...new Set(validIds.map((id) => id.toString()))];

    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        }).populate('questionSets');

        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');

        const classQuestionIdStrings = new Set();
        for (const qSet of classDoc.questionSets || []) {
            for (const qId of qSet.questions || []) {
                const idStr = (qId && (qId._id || qId)).toString();
                classQuestionIdStrings.add(idStr);
            }
        }

        const validClassQuestions = uniqueQuestionIds.filter((id) => classQuestionIdStrings.has(id));
        if (validClassQuestions.length === 0) {
            return res.status(400).json('Các câu hỏi đã chọn không thuộc các bộ câu hỏi trong lớp học này!');
        }

        let parsedDueDate = null;
        if (dueDate) {
            const d = new Date(dueDate);
            if (isNaN(d.getTime())) {
                return res.status(400).json('Thời hạn nộp bài (Due date) không hợp lệ!');
            }
            parsedDueDate = d;
        }

        const createdAssignment = await Assignment.create({
            title: title.trim(),
            description: typeof description === 'string' ? description.trim() : '',
            dueDate: parsedDueDate,
            classId: classDoc._id,
            createdBy: req.user.id,
            questions: validClassQuestions
        });

        classDoc.assignments.push(createdAssignment._id);
        await classDoc.save();

        const populated = await Assignment.findById(createdAssignment._id)
            .populate('questions', 'questionText options correctAnswer difficulty topic explanation');

        res.status(201).json({
            message: 'Đã tạo Assignment thành công!',
            assignment: populated
        });
    } catch (err) {
        console.error('Lỗi khi tạo Assignment:', err);
        res.status(500).json('Không thể tạo Assignment cho lớp: ' + (err.message || ''));
    }
});

// XÓA ASSIGNMENT TRONG LỚP (ĐỒNG THỜI XÓA HẾT BÀI NỘP CỦA NÓ)
router.delete('/:id/assignments/:assignmentId', requireClassTeacher, async (req, res) => {
    const { assignmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json('Mã Assignment không hợp lệ!');
    }

    try {
        const classDoc = await TeacherClass.findOne({
            _id: req.params.id,
            $or: [{ teacher: req.user.id }, { teachers: req.user.id }]
        });
        if (!classDoc) return res.status(404).json('Không tìm thấy lớp học!');

        await Assignment.deleteOne({ _id: assignmentId, classId: classDoc._id });
        await AssignmentSubmission.deleteMany({ assignmentId });

        classDoc.assignments = (classDoc.assignments || []).filter((id) => id.toString() !== assignmentId);
        await classDoc.save();

        res.status(200).json({ message: 'Đã xóa Assignment thành công!' });
    } catch (err) {
        console.error('Lỗi khi xóa Assignment:', err);
        res.status(500).json('Không thể xóa Assignment!');
    }
});

module.exports = router;
