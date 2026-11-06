import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AdminPageLogic = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // Tab chính: 'reported' (mặc định) | 'all_content' (tab riêng ẩn nội dung bình thường) | 'game_settings'
    const [activeTab, setActiveTab] = useState('reported');

    // Dữ liệu nội dung bị báo cáo (Màn hình chính)
    const [reportedSets, setReportedSets] = useState([]);
    const [reportedQuestions, setReportedQuestions] = useState([]);
    const [pendingReportsCount, setPendingReportsCount] = useState(0);

    // Dữ liệu toàn bộ kho nội dung hệ thống (Nằm ở Tab riêng)
    const [allQuestionSets, setAllQuestionSets] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [contentSubTab, setContentSubTab] = useState('sets'); // 'sets' | 'questions'
    const [searchTerm, setSearchTerm] = useState('');

    // Dữ liệu cấu hình Game
    const [currentVersion, setCurrentVersion] = useState('v1.0');
    const [newVersion, setNewVersion] = useState('');

    // Trạng thái modal xử lý kỷ luật / xóa
    const [deleteTarget, setDeleteTarget] = useState(null); // { item, type: 'QuestionSet' | 'Question', reportId }
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Trạng thái modal bác bỏ báo cáo
    const [dismissTarget, setDismissTarget] = useState(null); // report item
    const [dismissReason, setDismissReason] = useState('');
    const [isDismissing, setIsDismissing] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const getAuthHeader = () => {
        const token = currentUser?.accessToken || localStorage.getItem('token');
        return token ? { headers: { token } } : {};
    };

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
            return;
        }

        const initLoad = async () => {
            setIsLoading(true);
            await Promise.all([
                fetchReportedItems(),
                fetchAllQuestionSets(),
                fetchAllQuestions(),
                fetchVersion()
            ]);
            setIsLoading(false);
        };

        initLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, navigate]);

    // 1. Tải danh sách nội dung bị báo cáo
    const fetchReportedItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reports/reported-items', getAuthHeader());
            setReportedSets(res.data.reportedSets || []);
            setReportedQuestions(res.data.reportedQuestions || []);
            setPendingReportsCount(res.data.pendingCount || 0);
        } catch (err) {
            console.error('Lỗi lấy danh sách báo cáo vi phạm:', err);
        }
    };

    // 2. Tải toàn bộ bộ câu hỏi (cho tab riêng)
    const fetchAllQuestionSets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sets/admin/all', getAuthHeader());
            setAllQuestionSets(res.data || []);
        } catch (err) {
            console.error('Lỗi lấy toàn bộ QuestionSets:', err);
        }
    };

    // 3. Tải toàn bộ câu hỏi (cho tab riêng)
    const fetchAllQuestions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/questions', getAuthHeader());
            setAllQuestions(res.data || []);
        } catch (err) {
            console.error('Lỗi lấy toàn bộ Questions:', err);
        }
    };

    // 4. Tải phiên bản game
    const fetchVersion = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/settings/version');
            setCurrentVersion(res.data.version || 'v1.0');
        } catch (err) {
            console.error('Lỗi lấy version game:', err);
        }
    };

    // 5. Cập nhật phiên bản game
    const handleUpdateVersion = async () => {
        if (!newVersion.trim()) {
            alert('Vui lòng nhập tên phiên bản mới (vd: v1.1)!');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/settings/version', {
                version: newVersion.trim()
            }, getAuthHeader());
            alert(`Đã cập nhật game sang phiên bản: ${newVersion.trim()}`);
            setCurrentVersion(newVersion.trim());
            setNewVersion('');
        } catch (err) {
            console.error('Lỗi cập nhật version:', err);
            alert('Lỗi cập nhật version!');
        }
    };

    // 6. Mở / Đóng modal kỷ luật xóa
    const openDeleteModal = (item, type, reportId = null) => {
        setDeleteTarget({ item, type, reportId });
        setDeleteReason('Vi phạm tiêu chuẩn cộng đồng');
    };

    const closeDeleteModal = () => {
        setDeleteTarget(null);
        setDeleteReason('');
    };

    // 7. Thực thi xóa nội dung (Hỗ trợ cả xóa từ Báo cáo và xóa từ Tab Tất cả)
    const executeDelete = async () => {
        if (!deleteTarget || !deleteReason.trim()) {
            alert('Admin phải nhập lý do xóa để lưu vết hệ thống!');
            return;
        }

        setIsDeleting(true);
        try {
            if (deleteTarget.reportId) {
                // Xử lý thông qua Report API
                await axios.put(
                    `http://localhost:5000/api/reports/${deleteTarget.reportId}/resolve`,
                    { action: 'delete', reason: deleteReason.trim() },
                    getAuthHeader()
                );
            } else if (deleteTarget.type === 'QuestionSet') {
                // Xóa QuestionSet trực tiếp
                await axios.delete(`http://localhost:5000/api/sets/${deleteTarget.item._id}`, {
                    headers: getAuthHeader().headers,
                    data: { reason: deleteReason.trim() }
                });
            } else if (deleteTarget.type === 'Question') {
                // Xóa Question trực tiếp
                await axios.delete(`http://localhost:5000/api/questions/${deleteTarget.item._id}`, {
                    headers: getAuthHeader().headers,
                    data: { reason: deleteReason.trim() }
                });
            }

            alert('Đã xóa nội dung và lưu vết kỷ luật thành công!');
            closeDeleteModal();
            await Promise.all([
                fetchReportedItems(),
                fetchAllQuestionSets(),
                fetchAllQuestions()
            ]);
        } catch (err) {
            console.error('Lỗi khi thực thi xóa:', err);
            alert('Lỗi khi thực thi lệnh xóa!');
        } finally {
            setIsDeleting(false);
        }
    };

    // 8. Bác bỏ báo cáo (Đánh dấu nội dung hợp lệ)
    const openDismissModal = (report) => {
        setDismissTarget(report);
        setDismissReason('Nội dung hợp lệ, báo cáo không chính xác');
    };

    const closeDismissModal = () => {
        setDismissTarget(null);
        setDismissReason('');
    };

    const executeDismiss = async () => {
        if (!dismissTarget) return;

        setIsDismissing(true);
        try {
            await axios.put(
                `http://localhost:5000/api/reports/${dismissTarget._id}/resolve`,
                { action: 'dismiss', reason: dismissReason.trim() },
                getAuthHeader()
            );

            alert('Đã bác bỏ báo cáo và ghi nhận nội dung hợp lệ!');
            closeDismissModal();
            await fetchReportedItems();
        } catch (err) {
            console.error('Lỗi khi bác bỏ báo cáo:', err);
            alert('Lỗi khi bác bỏ báo cáo!');
        } finally {
            setIsDismissing(false);
        }
    };

    // 9. Lọc dữ liệu trong Tab Tất Cả
    const filteredQuestionSets = useMemo(() => {
        if (!searchTerm.trim()) return allQuestionSets;
        const q = searchTerm.toLowerCase();
        return allQuestionSets.filter(s =>
            (s.title && s.title.toLowerCase().includes(q)) ||
            (s.topic && s.topic.toLowerCase().includes(q)) ||
            (s.authorName && s.authorName.toLowerCase().includes(q)) ||
            (s._id && s._id.toLowerCase().includes(q))
        );
    }, [allQuestionSets, searchTerm]);

    const filteredQuestions = useMemo(() => {
        if (!searchTerm.trim()) return allQuestions;
        const q = searchTerm.toLowerCase();
        return allQuestions.filter(question =>
            (question.questionText && question.questionText.toLowerCase().includes(q)) ||
            (question.topic && question.topic.toLowerCase().includes(q)) ||
            (question._id && question._id.toLowerCase().includes(q))
        );
    }, [allQuestions, searchTerm]);

    return {
        navigate,
        currentUser,
        activeTab,
        setActiveTab,
        reportedSets,
        reportedQuestions,
        pendingReportsCount,
        allQuestionSets,
        allQuestions,
        contentSubTab,
        setContentSubTab,
        searchTerm,
        setSearchTerm,
        currentVersion,
        newVersion,
        setNewVersion,
        handleUpdateVersion,
        deleteTarget,
        deleteReason,
        setDeleteReason,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        executeDelete,
        dismissTarget,
        dismissReason,
        setDismissReason,
        isDismissing,
        openDismissModal,
        closeDismissModal,
        executeDismiss,
        filteredQuestionSets,
        filteredQuestions,
        isLoading
    };
};
