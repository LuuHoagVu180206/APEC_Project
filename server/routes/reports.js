const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Report = require('../models/Report');
const QuestionSet = require('../models/QuestionSet');
const Question = require('../models/Question');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../verifyToken');

// Trích xuất user tùy chọn (cho phép cả khách vãng lai và user đã đăng nhập gửi báo cáo)
const getOptionalUser = (req) => {
    const authHeader = req.headers.token || req.headers.authorization || req.headers['x-access-token'] || req.body?.token;
    if (authHeader) {
        const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7).trim()
            : authHeader;
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'mat_khau_bi_mat_cua_server');
        } catch (_) {
            return null;
        }
    }
    return null;
};

// ==============================================================================
// 1. TẠO BÁO CÁO VI PHẠM MỚI (User hoặc Khách gửi từ Library hoặc Set Detail)
// ==============================================================================
router.post('/', async (req, res) => {
    try {
        const { targetType, targetId, reason, description, reporterName, reporterEmail } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json('Thiếu thông tin bắt buộc: targetType, targetId hoặc reason!');
        }

        const validTypes = ['QuestionSet', 'Question'];
        if (!validTypes.includes(targetType)) {
            return res.status(400).json('targetType không hợp lệ!');
        }

        let targetTitle = '';
        let targetAuthor = '';

        if (targetType === 'QuestionSet') {
            const qSet = await QuestionSet.findById(targetId).populate('owner', 'username fullName displayName');
            if (!qSet) {
                return res.status(404).json('Không tìm thấy bộ câu hỏi cần báo cáo!');
            }
            targetTitle = qSet.title;
            targetAuthor = qSet.authorName || qSet.owner?.displayName || qSet.owner?.username || 'APEC Group';
            
            // Cập nhật cờ và đếm số lượt report trên Bộ câu hỏi
            await QuestionSet.findByIdAndUpdate(targetId, {
                $inc: { reportsCount: 1 },
                $set: { isReported: true }
            });
        } else if (targetType === 'Question') {
            const question = await Question.findById(targetId).populate('owner', 'username fullName displayName');
            if (!question) {
                return res.status(404).json('Không tìm thấy câu hỏi cần báo cáo!');
            }
            targetTitle = question.questionText;
            targetAuthor = question.owner?.displayName || question.owner?.username || 'Hệ thống';

            // Cập nhật cờ và đếm số lượt report trên Câu hỏi
            await Question.findByIdAndUpdate(targetId, {
                $inc: { reportsCount: 1 },
                $set: { isReported: true }
            });
        }

        const optUser = getOptionalUser(req);
        let finalReporterId = null;
        let finalReporterName = (reporterName && reporterName.trim()) ? reporterName.trim() : 'Người dùng ẩn danh';
        let finalReporterEmail = (reporterEmail && reporterEmail.trim()) ? reporterEmail.trim() : '';

        if (optUser && optUser.id) {
            finalReporterId = optUser.id;
            const dbUser = await User.findById(optUser.id).select('username fullName displayName email');
            if (dbUser) {
                finalReporterName = dbUser.displayName || dbUser.fullName || dbUser.username;
                finalReporterEmail = dbUser.email || '';
            }
        }

        const newReport = new Report({
            targetType,
            targetId,
            targetTitle,
            targetAuthor,
            reporter: finalReporterId,
            reporterName: finalReporterName,
            reporterEmail: finalReporterEmail,
            reason: String(reason).trim(),
            description: String(description || '').trim(),
            status: 'pending'
        });

        const savedReport = await newReport.save();
        res.status(201).json({
            message: 'Đã gửi báo cáo vi phạm thành công đến Ban Quản Trị!',
            report: savedReport
        });
    } catch (err) {
        console.error('Lỗi gửi báo cáo:', err);
        res.status(500).json('Lỗi máy chủ khi gửi báo cáo!');
    }
});

// ==============================================================================
// 2. LẤY DANH SÁCH BÁO CÁO (Dành cho Admin)
// ==============================================================================
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const reports = await Report.find(filter)
            .populate('reporter', 'username fullName email role')
            .populate('resolvedBy', 'username fullName')
            .sort({ createdAt: -1 });

        const pendingCount = await Report.countDocuments({ status: 'pending' });
        const resolvedCount = await Report.countDocuments({ status: 'resolved' });
        const dismissedCount = await Report.countDocuments({ status: 'dismissed' });

        res.status(200).json({
            reports,
            counts: {
                total: reports.length,
                pending: pendingCount,
                resolved: resolvedCount,
                dismissed: dismissedCount
            }
        });
    } catch (err) {
        console.error('Lỗi lấy danh sách báo cáo:', err);
        res.status(500).json('Lỗi lấy danh sách báo cáo!');
    }
});

// ==============================================================================
// 3. LẤY CÁC NỘI DUNG BỊ BÁO CÁO (Dành riêng cho màn hình kiểm duyệt Admin)
// ==============================================================================
router.get('/reported-items', verifyAdmin, async (req, res) => {
    try {
        // Lấy tất cả báo cáo đang ở trạng thái pending
        const pendingReports = await Report.find({ status: 'pending' })
            .populate('reporter', 'username fullName email role')
            .sort({ createdAt: -1 });

        // Tách các targetId theo type
        const setIds = pendingReports
            .filter(r => r.targetType === 'QuestionSet')
            .map(r => r.targetId);

        const questionIds = pendingReports
            .filter(r => r.targetType === 'Question')
            .map(r => r.targetId);

        // Lấy danh sách Bộ đề bị báo cáo kèm tác giả
        const reportedSets = await QuestionSet.find({
            $or: [
                { _id: { $in: setIds } },
                { isReported: true },
                { reportsCount: { $gt: 0 } }
            ]
        }).populate('owner', 'username fullName displayName avatar role');

        // Lấy danh sách Câu hỏi bị báo cáo kèm tác giả
        const reportedQuestions = await Question.find({
            $or: [
                { _id: { $in: questionIds } },
                { isReported: true },
                { reportsCount: { $gt: 0 } }
            ]
        }).populate('owner', 'username fullName displayName avatar role');

        // Map báo cáo vào từng item để FE hiển thị trực quan
        const setsWithReports = reportedSets.map(set => {
            const reports = pendingReports.filter(r => String(r.targetId) === String(set._id));
            return {
                ...set.toObject(),
                reports
            };
        });

        const questionsWithReports = reportedQuestions.map(q => {
            const reports = pendingReports.filter(r => String(r.targetId) === String(q._id));
            return {
                ...q.toObject(),
                reports
            };
        });

        res.status(200).json({
            pendingCount: pendingReports.length,
            reports: pendingReports,
            reportedSets: setsWithReports,
            reportedQuestions: questionsWithReports
        });
    } catch (err) {
        console.error('Lỗi tải mục bị báo cáo:', err);
        res.status(500).json('Lỗi tải danh sách nội dung bị báo cáo!');
    }
});

// ==============================================================================
// 4. XỬ LÝ BÁO CÁO (Admin giải quyết: Xóa vi phạm hoặc Bác bỏ báo cáo)
// ==============================================================================
router.put('/:id/resolve', verifyAdmin, async (req, res) => {
    try {
        const { action, reason } = req.body; // action: 'delete' | 'dismiss'
        if (!action || !['delete', 'dismiss'].includes(action)) {
            return res.status(400).json('Hành động không hợp lệ! Vui lòng chọn "delete" hoặc "dismiss".');
        }

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json('Không tìm thấy báo cáo!');
        }

        const adminId = req.user.id;
        const targetId = report.targetId;
        const targetType = report.targetType;

        if (action === 'delete') {
            // 1. Thực thi xóa nội dung vi phạm
            if (targetType === 'QuestionSet') {
                await QuestionSet.findByIdAndDelete(targetId);
            } else if (targetType === 'Question') {
                await Question.findByIdAndDelete(targetId);
                // Xóa cả question khỏi các QuestionSet chứa nó
                await QuestionSet.updateMany(
                    { questions: targetId },
                    { $pull: { questions: targetId } }
                );
            }

            // 2. Cập nhật tất cả các báo cáo liên quan đến targetId này thành resolved
            await Report.updateMany(
                { targetId: targetId, status: 'pending' },
                {
                    $set: {
                        status: 'resolved',
                        resolvedAction: 'deleted_content',
                        resolvedReason: reason || 'Nội dung vi phạm tiêu chuẩn cộng đồng, đã xóa khỏi hệ thống.',
                        resolvedBy: adminId,
                        resolvedAt: new Date()
                    }
                }
            );

            return res.status(200).json({
                message: `Đã xóa vĩnh viễn ${targetType === 'QuestionSet' ? 'bộ câu hỏi' : 'câu hỏi'} vi phạm và hoàn tất xử lý báo cáo!`,
                action: 'deleted'
            });
        }

        if (action === 'dismiss') {
            // 1. Đánh dấu báo cáo này là dismissed (Bác bỏ / Nội dung hợp lệ)
            report.status = 'dismissed';
            report.resolvedAction = 'dismissed';
            report.resolvedReason = reason || 'Nội dung hợp lệ, báo cáo không chính xác.';
            report.resolvedBy = adminId;
            report.resolvedAt = new Date();
            await report.save();

            // 2. Kiểm tra xem còn báo cáo pending nào khác cho targetId này không
            const remainingPending = await Report.countDocuments({
                targetId: targetId,
                status: 'pending'
            });

            if (remainingPending === 0) {
                if (targetType === 'QuestionSet') {
                    await QuestionSet.findByIdAndUpdate(targetId, {
                        $set: { isReported: false, reportsCount: 0 }
                    });
                } else if (targetType === 'Question') {
                    await Question.findByIdAndUpdate(targetId, {
                        $set: { isReported: false, reportsCount: 0 }
                    });
                }
            } else {
                if (targetType === 'QuestionSet') {
                    await QuestionSet.findByIdAndUpdate(targetId, {
                        $set: { reportsCount: remainingPending }
                    });
                } else if (targetType === 'Question') {
                    await Question.findByIdAndUpdate(targetId, {
                        $set: { reportsCount: remainingPending }
                    });
                }
            }

            return res.status(200).json({
                message: 'Đã bác bỏ báo cáo, ghi nhận nội dung hợp lệ!',
                action: 'dismissed'
            });
        }
    } catch (err) {
        console.error('Lỗi xử lý báo cáo:', err);
        res.status(500).json('Lỗi máy chủ khi xử lý báo cáo!');
    }
});

module.exports = router;

