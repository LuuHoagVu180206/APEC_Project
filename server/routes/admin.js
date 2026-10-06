const router = require('express').Router();
const mongoose = require('mongoose');
const School = require('../models/School');
const SchoolMember = require('../models/SchoolMember');
const CommunityPost = require('../models/CommunityPost');
const TeacherClass = require('../models/TeacherClass');
const { verifyAdmin } = require('../verifyToken');

router.use(verifyAdmin);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/schools', async (req, res) => {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 20;
    const search = typeof req.query.search === 'string'
        ? req.query.search.trim().toLowerCase().slice(0, 80)
        : '';
    const filter = search
        ? { $or: [
            { normalizedName: { $regex: `^${escapeRegex(search)}` } },
            { normalizedAbbreviation: { $regex: `^${escapeRegex(search)}` } }
        ] }
        : {};

    try {
        const [schools, totalItems] = await Promise.all([
            School.find(filter)
                .select('name abbreviation representativeName contactEmail location createdAt')
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            School.countDocuments(filter)
        ]);

        if (schools.length === 0) {
            return res.status(200).json({
                data: [],
                pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) }
            });
        }

        const schoolIds = schools.map((school) => school._id);
        const [memberCounts, managers] = await Promise.all([
            SchoolMember.aggregate([
                { $match: { school: { $in: schoolIds } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $group: {
                        _id: '$school',
                        totalMembers: { $sum: 1 },
                        students: { $sum: { $cond: [{ $eq: ['$user.role', 'user'] }, 1, 0] } },
                        teachers: { $sum: { $cond: [{ $eq: ['$user.role', 'teacher'] }, 1, 0] } }
                    }
                }
            ]),
            SchoolMember.find({ school: { $in: schoolIds }, communityRole: 'community_manager' })
                .select('school fullName user')
                .populate('user', 'username fullName')
                .sort({ createdAt: 1 })
                .lean()
        ]);

        const countsBySchool = new Map(memberCounts.map((entry) => [entry._id.toString(), entry]));
        const managersBySchool = new Map();
        managers.forEach((membership) => {
            const key = membership.school.toString();
            if (!managersBySchool.has(key) && membership.user) {
                managersBySchool.set(key, {
                    name: membership.fullName || membership.user.fullName || membership.user.username,
                    username: membership.user.username
                });
            }
        });

        const data = schools.map((school) => {
            const counts = countsBySchool.get(school._id.toString());
            return {
                _id: school._id,
                name: school.name,
                abbreviation: school.abbreviation,
                status: 'active',
                representativeName: school.representativeName,
                contactEmail: school.contactEmail,
                location: school.location,
                manager: managersBySchool.get(school._id.toString()) || null,
                studentCount: counts?.students || 0,
                teacherCount: counts?.teachers || 0,
                memberCount: counts?.totalMembers || 0,
                createdAt: school.createdAt
            };
        });

        res.status(200).json({
            data,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (err) {
        console.error('Lỗi tải danh sách School cho Admin:', err);
        res.status(500).json('Không thể tải danh sách School Community!');
    }
});

router.get('/schools/:schoolId', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.schoolId)) {
        return res.status(400).json('Mã School không hợp lệ!');
    }

    try {
        const schoolId = new mongoose.Types.ObjectId(req.params.schoolId);
        const [school, memberStats, members, announcements, classes] = await Promise.all([
            School.findById(schoolId).populate({
                path: 'sharedQuestionSets.questionSet',
                select: 'title description questions owner',
                populate: { path: 'owner', select: 'username' }
            }),
            SchoolMember.aggregate([
                { $match: { school: schoolId } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $group: {
                        _id: null,
                        members: { $sum: 1 },
                        students: { $sum: { $cond: [{ $eq: ['$user.role', 'user'] }, 1, 0] } },
                        teachers: { $sum: { $cond: [{ $eq: ['$user.role', 'teacher'] }, 1, 0] } }
                    }
                }
            ]),
            SchoolMember.find({ school: schoolId })
                .populate('user', 'username fullName role')
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),
            CommunityPost.find({ school: schoolId })
                .populate('author', 'username fullName')
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),
            TeacherClass.find({ school: schoolId })
                .select('className classCode semester description teacherName teacher students questionSets createdAt')
                .populate('teacher', 'username fullName')
                .populate('questionSets', 'title description')
                .sort({ createdAt: -1 })
                .lean()
        ]);
        if (!school) return res.status(404).json('Không tìm thấy School Community!');

        const stats = memberStats[0] || { members: 0, students: 0, teachers: 0 };
        const managerMembership = await SchoolMember.findOne({
            school: schoolId,
            communityRole: 'community_manager'
        }).populate('user', 'username fullName');

        res.status(200).json({
            school,
            stats: { ...stats, classes: classes.length },
            manager: managerMembership ? {
                fullName: managerMembership.fullName || managerMembership.user?.fullName,
                username: managerMembership.user?.username
            } : null,
            members: members.filter((membership) => membership.user).map((membership) => ({
                _id: membership._id,
                username: membership.user.username,
                fullName: membership.fullName || membership.user.fullName,
                globalRole: membership.user.role,
                communityRole: membership.communityRole,
                joinedAt: membership.createdAt
            })),
            announcements,
            sharedQuestionSets: school.sharedQuestionSets,
            classes: classes.map((classItem) => ({
                ...classItem,
                studentCount: classItem.students.length,
                questionSetCount: classItem.questionSets.length,
                assignmentCount: 0,
                assignments: []
            }))
        });
    } catch (err) {
        console.error('Lỗi tải School detail cho Admin:', err);
        res.status(500).json('Không thể tải dashboard của School!');
    }
});

module.exports = router;