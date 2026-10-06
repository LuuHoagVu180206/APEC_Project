const router = require('express').Router();
const mongoose = require('mongoose');
const School = require('../models/School');
const SchoolMember = require('../models/SchoolMember');
const SchoolJoinRequest = require('../models/SchoolJoinRequest');
const CommunityPost = require('../models/CommunityPost');
const TeacherClass = require('../models/TeacherClass');
const QuestionSet = require('../models/QuestionSet');
const User = require('../models/User');
const { verifyToken } = require('../verifyToken');

router.get('/search', async (req, res) => {
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const filter = search
        ? { $or: [
            { name: { $regex: search, $options: 'i' } },
            { abbreviation: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
        ] }
        : {};

    try {
        const schools = await School.find(filter)
            .select('name abbreviation location description')
            .sort({ name: 1 })
            .limit(50);
        res.status(200).json(schools);
    } catch (err) {
        res.status(500).json('Không thể tìm School Community!');
    }
});

router.use(verifyToken);

router.get('/mine', async (req, res) => {
    try {
        const memberships = await SchoolMember.find({ user: req.user.id })
            .populate('school', 'name abbreviation location description')
            .sort({ createdAt: -1 });
        res.status(200).json(memberships);
    } catch (err) {
        res.status(500).json('Không thể tải trường của bạn!');
    }
});

router.post('/:schoolId/join', async (req, res) => {
    const { fullName, className = '', teachingInfo = '' } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.schoolId)) {
        return res.status(400).json('Mã trường không hợp lệ!');
    }
    if (req.user.role === 'admin' || !['user', 'teacher'].includes(req.user.role)) {
        return res.status(403).json('Tài khoản này không thể tham gia School Community!');
    }
    if (typeof fullName !== 'string' || !fullName.trim()) {
        return res.status(400).json('Vui lòng nhập họ tên!');
    }
    if (req.user.role === 'user' && (typeof className !== 'string' || !className.trim())) {
        return res.status(400).json('Student cần nhập lớp hiện tại!');
    }
    if (req.user.role === 'teacher' && (typeof teachingInfo !== 'string' || !teachingInfo.trim())) {
        return res.status(400).json('Teacher cần nhập khoa/bộ môn hoặc lớp phụ trách!');
    }

    try {
        const school = await School.findById(req.params.schoolId).select('_id');
        if (!school) return res.status(404).json('Không tìm thấy School Community!');

        const existingMember = await SchoolMember.findOne({ school: school._id, user: req.user.id });
        if (existingMember) return res.status(409).json('Bạn đã là thành viên của trường này!');

        const joinRequest = await SchoolJoinRequest.create({
            school: school._id,
            user: req.user.id,
            fullName: fullName.trim(),
            globalRole: req.user.role,
            className: req.user.role === 'user' ? className.trim() : '',
            teachingInfo: req.user.role === 'teacher' ? teachingInfo.trim() : '',
            status: 'pending'
        });

        try {
            await SchoolMember.create({
                school: school._id,
                user: req.user.id,
                fullName: fullName.trim(),
                className: req.user.role === 'user' ? className.trim() : '',
                teachingInfo: req.user.role === 'teacher' ? teachingInfo.trim() : '',
                communityRole: 'member'
            });
        } catch (err) {
            if (err.code !== 11000) throw err;
            return res.status(409).json('Bạn đã là thành viên của trường này!');
        }

        joinRequest.status = 'approved';
        joinRequest.reviewedAt = new Date();
        await joinRequest.save();

        res.status(201).json({ joinRequest, message: 'Bạn đã tham gia School Community!' });
    } catch (err) {
        res.status(500).json('Không thể tham gia School Community!');
    }
});

const requireMembership = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.schoolId)) {
        return res.status(400).json('Mã trường không hợp lệ!');
    }
    try {
        const membership = await SchoolMember.findOne({ school: req.params.schoolId, user: req.user.id });
        if (!membership) return res.status(403).json('Bạn chưa tham gia School Community này!');
        req.schoolMembership = membership;
        next();
    } catch (err) {
        res.status(500).json('Không thể xác thực membership!');
    }
};

const requireManager = (req, res, next) => {
    if (req.schoolMembership.communityRole !== 'community_manager') {
        return res.status(403).json('Chỉ community manager mới có quyền này!');
    }
    next();
};

const requireClassCreator = (req, res, next) => {
    if (req.schoolMembership.communityRole !== 'community_manager' && req.user.role !== 'teacher') {
        return res.status(403).json('Chỉ giáo viên trong community hoặc community manager mới có thể tạo lớp!');
    }
    next();
};

router.get('/:schoolId/dashboard', requireMembership, async (req, res) => {
    try {
        const [school, members, posts, classes] = await Promise.all([
            School.findById(req.params.schoolId).populate({
                path: 'sharedQuestionSets.questionSet',
                select: 'title description questions owner',
                populate: { path: 'owner', select: 'username' }
            }),
            SchoolMember.find({ school: req.params.schoolId })
                .populate('user', 'username fullName role')
                .sort({ createdAt: -1 }),
            CommunityPost.find({ school: req.params.schoolId })
                .populate('author', 'username fullName')
                .sort({ createdAt: -1 })
                .limit(20),
            TeacherClass.find({ school: req.params.schoolId })
                .populate('teacher', 'username fullName')
                .populate('questionSets', 'title description')
                .sort({ createdAt: -1 })
        ]);
        if (!school) return res.status(404).json('Không tìm thấy trường!');

        await Promise.all(classes.map(async (classItem) => {
            if (!classItem.classCode) await classItem.save();
        }));

        const validMembers = members.filter((member) => member.user);
        const safeClasses = classes.map((classItem) => {
            const classData = classItem.toObject();
            delete classData.students;
            if (req.user.role === 'user') delete classData.questionSets;
            return {
                ...classData,
                questionSetCount: classItem.questionSets.length,
                studentCount: classItem.students.length,
                assignmentCount: 0,
                assignments: []
            };
        });
        const memberRows = validMembers.map((member) => ({
            _id: member._id,
            username: member.user.username,
            fullName: member.fullName || member.user.fullName,
            className: member.className,
            teachingInfo: member.teachingInfo,
            globalRole: member.user.role,
            communityRole: member.communityRole,
            joinedAt: member.createdAt
        }));

        res.status(200).json({
            school,
            membership: req.schoolMembership,
            stats: {
                members: validMembers.length,
                teachers: validMembers.filter((member) => member.user.role === 'teacher').length,
                students: validMembers.filter((member) => member.user.role === 'user').length,
                classes: classes.length
            },
            announcements: posts,
            sharedQuestionSets: school.sharedQuestionSets,
            classes: safeClasses,
            members: memberRows,
            recentMembers: memberRows.slice(0, 8)
        });
    } catch (err) {
        res.status(500).json('Không thể tải dashboard School Community!');
    }
});

router.post('/:schoolId/announcements', requireMembership, requireManager, async (req, res) => {
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    if (!content) return res.status(400).json('Nội dung announcement không được để trống!');
    try {
        const post = await CommunityPost.create({ school: req.params.schoolId, author: req.user.id, content });
        await post.populate('author', 'username fullName');
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json('Không thể tạo announcement!');
    }
});

router.delete('/:schoolId/announcements/:postId', requireMembership, requireManager, async (req, res) => {
    try {
        const post = await CommunityPost.findOneAndDelete({ _id: req.params.postId, school: req.params.schoolId });
        if (!post) return res.status(404).json('Không tìm thấy announcement!');
        res.status(200).json({ message: 'Đã xóa announcement!' });
    } catch (err) {
        res.status(500).json('Không thể xóa announcement!');
    }
});

router.delete('/:schoolId/members/:memberId', requireMembership, requireManager, async (req, res) => {
    try {
        const member = await SchoolMember.findOne({
            _id: req.params.memberId,
            school: req.params.schoolId,
            communityRole: 'member'
        });
        if (!member) return res.status(404).json('Không tìm thấy member có thể gỡ!');
        await Promise.all([
            member.deleteOne(),
            SchoolJoinRequest.updateMany({ school: member.school, user: member.user }, { $set: { status: 'rejected' } })
        ]);
        res.status(200).json({ message: 'Đã gỡ member khỏi trường!' });
    } catch (err) {
        res.status(500).json('Không thể gỡ member!');
    }
});

router.post('/:schoolId/shared-question-sets', requireMembership, requireManager, async (req, res) => {
    const { questionSetId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(questionSetId)) {
        return res.status(400).json('Mã question set không hợp lệ!');
    }
    try {
        const [school, questionSet] = await Promise.all([
            School.findById(req.params.schoolId),
            QuestionSet.findOne({ _id: questionSetId, owner: req.user.id })
        ]);
        if (!school) return res.status(404).json('Không tìm thấy trường!');
        if (!questionSet) return res.status(404).json('Chỉ có thể share question set do bạn sở hữu!');
        if (school.sharedQuestionSets.some((item) => item.questionSet.toString() === questionSetId)) {
            return res.status(409).json('Question set đã được share vào community!');
        }
        school.sharedQuestionSets.push({ questionSet: questionSet._id, sharedBy: req.user.id });
        await school.save();
        res.status(201).json({ message: 'Đã share question set!', questionSet });
    } catch (err) {
        res.status(500).json('Không thể share question set!');
    }
});

router.delete('/:schoolId/shared-question-sets/:questionSetId', requireMembership, requireManager, async (req, res) => {
    try {
        const school = await School.findById(req.params.schoolId);
        if (!school) return res.status(404).json('Không tìm thấy trường!');
        const beforeCount = school.sharedQuestionSets.length;
        school.sharedQuestionSets = school.sharedQuestionSets.filter(
            (item) => item.questionSet.toString() !== req.params.questionSetId
        );
        if (school.sharedQuestionSets.length === beforeCount) {
            return res.status(404).json('Question set chưa được share vào trường!');
        }
        await school.save();
        res.status(200).json({ message: 'Đã bỏ share question set!' });
    } catch (err) {
        res.status(500).json('Không thể bỏ share question set!');
    }
});

router.post('/:schoolId/classes', requireMembership, requireClassCreator, async (req, res) => {
    const { className, semester = '', description = '' } = req.body;
    const semesterPattern = /^Kỳ\s+\d+\s+20\d{2}-20\d{2}$/;
    if (typeof className !== 'string' || !className.trim()) {
        return res.status(400).json('Vui lòng nhập tên lớp!');
    }
    if (typeof semester !== 'string' || (semester.trim() && !semesterPattern.test(semester.trim()))) {
        return res.status(400).json('Học kỳ phải theo định dạng: Kỳ n 202x-202x.');
    }
    try {
        const manager = await User.findById(req.user.id).select('username fullName');
        const classItem = await TeacherClass.create({
            className: className.trim(),
            semester: typeof semester === 'string' ? semester.trim() : '',
            description: typeof description === 'string' ? description.trim() : '',
            teacherName: manager.fullName || manager.username,
            teacher: manager._id,
            school: req.params.schoolId
        });
        res.status(201).json(classItem);
    } catch (err) {
        res.status(500).json('Không thể tạo lớp trong trường!');
    }
});

router.post('/:schoolId/classes/:classId/import', requireMembership, async (req, res) => {
    if (req.user.role !== 'teacher') {
        return res.status(403).json('Chỉ giáo viên mới có thể đưa lớp cá nhân vào community!');
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.classId)) {
        return res.status(400).json('Mã lớp không hợp lệ!');
    }

    try {
        const classItem = await TeacherClass.findOne({
            _id: req.params.classId,
            teacher: req.user.id,
            school: null
        });
        if (!classItem) {
            return res.status(404).json('Không tìm thấy lớp cá nhân chưa thuộc School Community của bạn!');
        }
        classItem.school = req.params.schoolId;
        await classItem.save();
        res.status(200).json({ message: 'Đã thêm lớp vào School Community!', class: classItem });
    } catch (err) {
        res.status(500).json('Không thể đưa lớp vào School Community!');
    }
});

router.delete('/:schoolId/classes/:classId', requireMembership, requireManager, async (req, res) => {
    try {
        const classItem = await TeacherClass.findOneAndDelete({ _id: req.params.classId, school: req.params.schoolId });
        if (!classItem) return res.status(404).json('Không tìm thấy lớp trong trường!');
        res.status(200).json({ message: 'Đã xóa lớp!' });
    } catch (err) {
        res.status(500).json('Không thể xóa lớp!');
    }
});

router.post('/:schoolId/classes/:classId/join', requireMembership, async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(403).json('Chỉ Student mới có thể tham gia lớp!');
    }
    try {
        const classItem = await TeacherClass.findOne({ _id: req.params.classId, school: req.params.schoolId });
        if (!classItem) return res.status(404).json('Không tìm thấy lớp!');
        const isJoined = classItem.students.some((studentId) => studentId.toString() === req.user.id);
        if (isJoined) return res.status(409).json('Bạn đã tham gia lớp này!');
        classItem.students.push(req.user.id);
        await classItem.save();
        res.status(200).json({ message: 'Đã tham gia lớp!' });
    } catch (err) {
        res.status(500).json('Không thể tham gia lớp!');
    }
});

router.get('/:schoolId/classes/:classId', requireMembership, async (req, res) => {
    try {
        let classQuery = TeacherClass.findOne({ _id: req.params.classId, school: req.params.schoolId })
            .populate('teacher', 'username fullName');
        if (req.user.role !== 'user') classQuery = classQuery.populate('questionSets', 'title description');
        const classItem = await classQuery;
        if (!classItem) return res.status(404).json('Không tìm thấy lớp!');
        if (!classItem.classCode) await classItem.save();
        const classData = classItem.toObject();
        const joined = classItem.students.some((studentId) => studentId.toString() === req.user.id);
        delete classData.students;
        if (req.user.role === 'user') delete classData.questionSets;
        res.status(200).json({
            ...classData,
            questionSetCount: classItem.questionSets.length,
            studentCount: classItem.students.length,
            joined,
            assignmentCount: 0,
            assignments: []
        });
    } catch (err) {
        res.status(500).json('Không thể tải lớp!');
    }
});

module.exports = router;