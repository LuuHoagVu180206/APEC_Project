const router = require('express').Router();
const mongoose = require('mongoose');
const SchoolRequest = require('../models/SchoolRequest');
const School = require('../models/School');
const SchoolMember = require('../models/SchoolMember');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../verifyToken');

router.post('/', verifyToken, async (req, res) => {
    const fields = [
        'schoolName', 'abbreviation', 'representativeName', 'representativeRole',
        'contactEmail', 'description', 'reason'
    ];
    if (fields.some((field) => typeof req.body[field] !== 'string' || !req.body[field].trim())) {
        return res.status(400).json('Vui lòng điền đầy đủ thông tin bắt buộc!');
    }

    const normalizedSchoolName = req.body.schoolName.trim().toLowerCase();
    const normalizedAbbreviation = req.body.abbreviation.trim().toLowerCase();

    try {
        const existingSchool = await School.findOne({
            $or: [{ normalizedSchoolName }, { normalizedAbbreviation }]
        });
        if (existingSchool) return res.status(409).json('Trường hoặc tên viết tắt này đã có community!');

        const pendingRequest = await SchoolRequest.findOne({
            status: 'pending',
            $or: [{ normalizedSchoolName }, { normalizedAbbreviation }]
        });
        if (pendingRequest) return res.status(409).json('Đã có yêu cầu tạo community cho trường này đang chờ duyệt!');

        const request = await SchoolRequest.create({
            schoolName: req.body.schoolName.trim(),
            abbreviation: req.body.abbreviation.trim(),
            representativeName: req.body.representativeName.trim(),
            representativeRole: req.body.representativeRole.trim(),
            contactEmail: req.body.contactEmail.trim(),
            website: typeof req.body.website === 'string' ? req.body.website.trim() : '',
            location: typeof req.body.location === 'string' ? req.body.location.trim() : '',
            description: req.body.description.trim(),
            reason: req.body.reason.trim(),
            requestedBy: req.user.id,
            normalizedSchoolName,
            normalizedAbbreviation
        });
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json('Không thể gửi yêu cầu tạo School Community!');
    }
});

router.get('/admin/pending', verifyAdmin, async (req, res) => {
    try {
        const requests = await SchoolRequest.find({ status: 'pending' })
            .populate('requestedBy', 'username fullName email role')
            .sort({ createdAt: 1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json('Không thể tải danh sách yêu cầu!');
    }
});

router.patch('/:requestId/review', verifyAdmin, async (req, res) => {
    const { decision, rejectionReason = '' } = req.body;
    if (!mongoose.Types.ObjectId.isValid(req.params.requestId)) {
        return res.status(400).json('Mã yêu cầu không hợp lệ!');
    }
    if (!['approve', 'reject'].includes(decision)) {
        return res.status(400).json('Quyết định phải là approve hoặc reject!');
    }

    try {
        const request = await SchoolRequest.findOne({ _id: req.params.requestId, status: 'pending' });
        if (!request) return res.status(404).json('Yêu cầu không tồn tại hoặc đã được xử lý!');

        if (decision === 'reject') {
            request.status = 'rejected';
            request.reviewedBy = req.user.id;
            request.reviewedAt = new Date();
            request.rejectionReason = typeof rejectionReason === 'string' ? rejectionReason.trim() : '';
            await request.save();
            return res.status(200).json(request);
        }

        const duplicateSchool = await School.findOne({
            $or: [
                { normalizedName: request.normalizedSchoolName },
                { normalizedAbbreviation: request.normalizedAbbreviation }
            ]
        });
        if (duplicateSchool) return res.status(409).json('Trường hoặc tên viết tắt này đã được tạo!');

        const school = await School.create({
            name: request.schoolName,
            normalizedName: request.normalizedSchoolName,
            abbreviation: request.abbreviation,
            normalizedAbbreviation: request.normalizedAbbreviation,
            representativeName: request.representativeName,
            representativeRole: request.representativeRole,
            contactEmail: request.contactEmail,
            website: request.website,
            location: request.location,
            description: request.description
        });

        const existingManager = await SchoolMember.findOne({ school: school._id, user: request.requestedBy });
        if (!existingManager) {
            const manager = await User.findById(request.requestedBy).select('fullName');
            await SchoolMember.create({
                school: school._id,
                user: request.requestedBy,
                fullName: manager?.fullName || request.representativeName,
                communityRole: 'community_manager'
            });
        }

        request.status = 'approved';
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        request.school = school._id;
        await request.save();

        const requester = await User.findById(request.requestedBy).select('username fullName role');
        res.status(200).json({ request, school, manager: requester });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json('Trường hoặc tên viết tắt này đã được tạo!');
        res.status(500).json('Không thể duyệt yêu cầu tạo trường!');
    }
});

module.exports = router;