import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export const StudentClassesPageLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [classCode, setClassCode] = useState('');
    const [joinAsTeacher, setJoinAsTeacher] = useState(false);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    // Assignment States
    const [assignmentFilter, setAssignmentFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'overdue'
    const [viewingAssignment, setViewingAssignment] = useState(null); // xem chi tiết đề bài
    
    // Làm bài tập (1.2)
    const [takingAssignment, setTakingAssignment] = useState(null);
    const [studentAnswers, setStudentAnswers] = useState({}); // { [qId]: selectedOption }
    const [startedAt, setStartedAt] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Xem kết quả bài làm (1.3)
    const [viewingResult, setViewingResult] = useState(null);
    const [isLoadingResult, setIsLoadingResult] = useState(false);

    const loadClasses = useCallback(async () => {
        const response = await axios.get('http://localhost:5000/api/classes/student/mine', {
            headers: { token: currentUser.accessToken }
        });
        setClasses(response.data);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || !['user', 'teacher', 'admin'].includes(currentUser.role)) {
            navigate(currentUser ? '/' : '/login', { replace: true });
            return;
        }
        loadClasses().catch(() => setError('Không thể tải danh sách lớp của bạn.'))
            .finally(() => setIsLoading(false));
    }, [currentUser, loadClasses, navigate]);

    const openClass = async (classId) => {
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/api/classes/student/${classId}`, {
                headers: { token: currentUser.accessToken }
            });
            setSelectedClass(response.data);
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể tải thông tin lớp.');
        }
    };

    const closeClass = () => {
        setSelectedClass(null);
        setViewingAssignment(null);
        setTakingAssignment(null);
        setViewingResult(null);
        setAssignmentFilter('all');
    };

    const handleJoinByCode = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setIsJoining(true);
        try {
            const response = await axios.post('http://localhost:5000/api/classes/join-by-code', {
                classCode: classCode.trim().toLowerCase(),
                joinAsTeacher: currentUser.role === 'teacher' && joinAsTeacher
            }, { headers: { token: currentUser.accessToken } });
            setNotice(response.data.message);
            setClassCode('');
            if (response.data.joinAsTeacher) {
                navigate(`/teacher/classes/${response.data.classId}`);
                return;
            }
            await loadClasses();
            await openClass(response.data.classId);
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể tham gia lớp bằng mã này.');
        } finally {
            setIsJoining(false);
        }
    };

    // 1.2: BẮT ĐẦU LÀM BÀI TẬP
    const handleStartTakingAssignment = (assignment) => {
        if (!assignment) return;
        const isOverdue = Boolean(assignment.dueDate && new Date(assignment.dueDate) < new Date());
        const isCompleted = assignment.status === 'completed' || Boolean(assignment.submission);
        if (isOverdue) {
            alert('Bài tập này đã quá hạn nộp bài!');
            return;
        }
        if (isCompleted && assignment.canTake === false) {
            alert('Bạn đã hoàn thành số lần nộp bài cho phép của bài tập này!');
            return;
        }
        setTakingAssignment(assignment);
        setStudentAnswers({});
        setStartedAt(new Date().toISOString());
        setSubmitError('');
    };

    // CHỌN ĐÁP ÁN CHO CÂU HỎI
    const handleSelectOption = (questionId, option) => {
        setStudentAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    // HỦY BỎ LÀM BÀI
    const handleCancelTaking = () => {
        const answeredCount = Object.keys(studentAnswers).length;
        if (answeredCount > 0) {
            if (!window.confirm('Bạn đã trả lời ' + answeredCount + ' câu hỏi. Nếu hủy, bài làm sẽ không được lưu. Bạn có chắc muốn hủy?')) {
                return;
            }
        }
        setTakingAssignment(null);
        setStudentAnswers({});
        setSubmitError('');
    };

    // 1.2 & 1.4: NỘP BÀI ASSIGNMENT
    const handleSubmitAssignment = async () => {
        if (!takingAssignment || !selectedClass) return;
        const totalQuestions = takingAssignment.questions?.length || 0;
        const answeredCount = Object.keys(studentAnswers).length;

        if (answeredCount < totalQuestions) {
            const confirmed = window.confirm(
                `Bạn mới trả lời ${answeredCount}/${totalQuestions} câu hỏi. Các câu chưa chọn sẽ không được tính điểm. Bạn có chắc chắn muốn nộp bài?`
            );
            if (!confirmed) return;
        } else {
            const confirmed = window.confirm(`Bạn đã hoàn thành đủ ${totalQuestions}/${totalQuestions} câu hỏi. Bạn có chắc muốn nộp bài ngay bây giờ?`);
            if (!confirmed) return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const answersPayload = (takingAssignment.questions || []).map(q => ({
                questionId: q._id,
                selectedAnswer: studentAnswers[q._id] || ''
            }));

            const response = await axios.post(
                `http://localhost:5000/api/classes/student/${selectedClass._id}/assignments/${takingAssignment._id}/submit`,
                {
                    startedAt: startedAt || new Date().toISOString(),
                    answers: answersPayload
                },
                {
                    headers: { token: currentUser.accessToken }
                }
            );

            // Thành công: Đóng modal làm bài, mở modal kết quả (1.3)
            const resultData = response.data?.submission;
            setTakingAssignment(null);
            setStudentAnswers({});
            setViewingResult(resultData);

            // Tải lại chi tiết lớp để cập nhật trạng thái bài tập
            await openClass(selectedClass._id);
            await loadClasses();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Không thể nộp bài tập. Vui lòng thử lại!';
            setSubmitError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 1.3: XEM LẠI KẾT QUẢ BÀI TẬP ĐÃ LÀM
    const handleViewResult = async (assignment) => {
        if (!assignment || !selectedClass) return;
        setIsLoadingResult(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/classes/student/${selectedClass._id}/assignments/${assignment._id}/my-result`,
                {
                    headers: { token: currentUser.accessToken }
                }
            );
            setViewingResult(response.data);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Không thể tải kết quả bài làm!';
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsLoadingResult(false);
        }
    };

    const closeResultModal = () => {
        setViewingResult(null);
    };

    return {
        classCode,
        setClassCode,
        joinAsTeacher,
        setJoinAsTeacher,
        isTeacher: currentUser?.role === 'teacher',
        classes,
        selectedClass,
        error,
        notice,
        isLoading,
        isJoining,
        handleJoinByCode,
        openClass,
        closeClass,
        assignmentFilter,
        setAssignmentFilter,
        viewingAssignment,
        setViewingAssignment,
        takingAssignment,
        studentAnswers,
        isSubmitting,
        submitError,
        handleStartTakingAssignment,
        handleSelectOption,
        handleCancelTaking,
        handleSubmitAssignment,
        viewingResult,
        isLoadingResult,
        handleViewResult,
        closeResultModal,
        navigate
    };
};
