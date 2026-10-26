import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export const TeacherClassPageLogic = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [currentUser] = useState(readCurrentUser);
    const [classInfo, setClassInfo] = useState(null);
    const [studentList, setStudentList] = useState({ data: [], pagination: { page: 1, totalPages: 0, totalItems: 0 } });
    const [assistantList, setAssistantList] = useState({ data: [], pagination: { page: 1, totalPages: 0, totalItems: 0 } });
    const [studentSearch, setStudentSearch] = useState('');
    const [assistantSearch, setAssistantSearch] = useState('');
    const [mySets, setMySets] = useState([]);
    const [selectedSetId, setSelectedSetId] = useState('');
    const [showQuestionSets, setShowQuestionSets] = useState(false);
    const [showAssignments, setShowAssignments] = useState(false);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentHasDueDate, setAssignmentHasDueDate] = useState(false);
    const [assignmentDueDate, setAssignmentDueDate] = useState('');
    const [assignmentDescription, setAssignmentDescription] = useState('');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [expandedSetIds, setExpandedSetIds] = useState([]);
    const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
    const [viewingAssignment, setViewingAssignment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Xem danh sách học sinh nộp bài tập (2.1 & 2.2)
    const [viewingSubmissionsAssignment, setViewingSubmissionsAssignment] = useState(null);
    const [submissionsData, setSubmissionsData] = useState(null);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [submissionsSearch, setSubmissionsSearch] = useState('');

    const loadClass = useCallback(async () => {
        const response = await axios.get(`http://localhost:5000/api/classes/${id}`, {
            headers: { token: currentUser.accessToken }
        });
        setClassInfo(response.data);
    }, [currentUser, id]);

    const loadMembers = useCallback(async (role, page = 1, search = '') => {
        const response = await axios.get(`http://localhost:5000/api/classes/${id}/members`, {
            headers: { token: currentUser.accessToken },
            params: { role, page, limit: 20, search }
        });
        if (role === 'students') setStudentList(response.data);
        else setAssistantList(response.data);
    }, [currentUser, id]);

    useEffect(() => {
        if (!currentUser || !['teacher', 'user'].includes(currentUser.role)) {
            navigate(currentUser ? '/' : '/login', { replace: true });
            return;
        }

        let isActive = true;
        const loadPage = async () => {
            const classResponse = await axios.get(`http://localhost:5000/api/classes/${id}`, {
                headers: { token: currentUser.accessToken }
            });
            const setsResponse = await axios.get('http://localhost:5000/api/sets/my-sets', {
                headers: { token: currentUser.accessToken }
            });
            if (!isActive) return;
            setClassInfo(classResponse.data);
            setMySets(setsResponse.data);
            if (classResponse.data.isPrimaryTeacher) {
                await Promise.all([
                    loadMembers('students'),
                    loadMembers('teachers')
                ]);
            }
        };
        loadPage().catch((requestError) => {
            if (isActive) {
                setError(typeof requestError.response?.data === 'string'
                    ? requestError.response.data
                    : 'Không thể tải thông tin lớp.');
            }
        }).finally(() => {
            if (isActive) setIsLoading(false);
        });

        return () => { isActive = false; };
    }, [currentUser, id, loadMembers, navigate]);

    const availableSets = mySets.filter((set) =>
        !classInfo?.questionSets?.some((classSet) => classSet._id === set._id)
    );

    const handleAddQuestionSet = async () => {
        if (!selectedSetId) return;
        setError('');
        try {
            await axios.post(`http://localhost:5000/api/classes/${id}/question-sets`, {
                questionSetId: selectedSetId
            }, { headers: { token: currentUser.accessToken } });
            await loadClass();
            setSelectedSetId('');
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể thêm bộ câu hỏi vào lớp.');
        }
    };

    const handlePromoteAssistant = async (userId) => {
        setError('');
        try {
            await axios.post(`http://localhost:5000/api/classes/${id}/assistants/${userId}`, {}, {
                headers: { token: currentUser.accessToken }
            });
            await Promise.all([
                loadClass(),
                loadMembers('students', studentList.pagination.page, studentSearch),
                loadMembers('teachers', assistantList.pagination.page, assistantSearch)
            ]);
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể thêm trợ giảng.');
        }
    };

    const handleDemoteAssistant = async (userId) => {
        setError('');
        try {
            await axios.delete(`http://localhost:5000/api/classes/${id}/assistants/${userId}`, {
                headers: { token: currentUser.accessToken }
            });
            await Promise.all([
                loadClass(),
                loadMembers('students', studentList.pagination.page, studentSearch),
                loadMembers('teachers', assistantList.pagination.page, assistantSearch)
            ]);
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể chuyển trợ giảng về vai trò học sinh.');
        }
    };

    const handleToggleSetExpand = (setId) => {
        setExpandedSetIds(prev => 
            prev.includes(setId) ? prev.filter(id => id !== setId) : [...prev, setId]
        );
    };

    const handleToggleQuestionSelect = (qOrId) => {
        const qId = typeof qOrId === 'string' ? qOrId : String(qOrId?._id || qOrId?.id || '');
        if (!qId) return;
        setSelectedQuestionIds(prev => 
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const handleToggleSelectAllInSet = (set) => {
        if (!set || !Array.isArray(set.questions) || set.questions.length === 0) return;
        const setQIds = set.questions
            .map(q => (typeof q === 'string' ? q : String(q?._id || q?.id || '')))
            .filter(Boolean);
        if (setQIds.length === 0) return;

        const allSelected = setQIds.every(id => selectedQuestionIds.includes(id));
        if (allSelected) {
            setSelectedQuestionIds(prev => prev.filter(id => !setQIds.includes(id)));
        } else {
            setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...setQIds])));
        }
    };

    const handleOpenCreateAssignmentModal = () => {
        setAssignmentTitle('');
        setAssignmentHasDueDate(false);
        setAssignmentDueDate('');
        setAssignmentDescription('');
        setSelectedQuestionIds([]);
        if (classInfo?.questionSets?.length) {
            setExpandedSetIds(classInfo.questionSets.map(s => s._id));
        }
        setShowCreateAssignmentModal(true);
        loadClass().catch(() => {});
    };

    const handleCloseCreateAssignmentModal = () => {
        setShowCreateAssignmentModal(false);
    };

    const handleCreateAssignment = async (e) => {
        if (e) e.preventDefault();
        if (!assignmentTitle.trim()) {
            alert("Vui lòng nhập tên cho Assignment!");
            return;
        }
        const cleanQuestionIds = selectedQuestionIds
            .map(q => (typeof q === 'string' ? q : String(q?._id || q?.id || '')))
            .filter(Boolean);

        if (cleanQuestionIds.length === 0) {
            alert("Vui lòng chọn ít nhất 1 câu hỏi từ các bộ đề trong lớp học!");
            return;
        }
        if (assignmentHasDueDate && !assignmentDueDate) {
            alert("Vui lòng chọn ngày và giờ hạn nộp bài (Due date) hoặc chọn Vô thời hạn!");
            return;
        }

        setIsSubmittingAssignment(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/classes/${id}/assignments`, {
                title: assignmentTitle.trim(),
                description: assignmentDescription.trim(),
                dueDate: assignmentHasDueDate ? assignmentDueDate : null,
                questionIds: cleanQuestionIds
            }, {
                headers: { token: currentUser.accessToken }
            });

            alert(res.data?.message || "Đã tạo Assignment thành công!");
            setShowCreateAssignmentModal(false);
            await loadClass();
            setShowAssignments(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Không thể tạo Assignment!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsSubmittingAssignment(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập (assignment) này khỏi lớp học?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/classes/${id}/assignments/${assignmentId}`, {
                headers: { token: currentUser.accessToken }
            });
            alert("Đã xóa Assignment thành công!");
            await loadClass();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Không thể xóa Assignment!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        }
    };

    // 2.1 & 2.2: XEM TỔNG QUAN & DANH SÁCH BÀI NỘP CỦA HỌC SINH
    const handleOpenSubmissions = async (assignment) => {
        setViewingSubmissionsAssignment(assignment);
        setIsLoadingSubmissions(true);
        setSubmissionsSearch('');
        try {
            const res = await axios.get(`http://localhost:5000/api/classes/${id}/assignments/${assignment._id}/submissions`, {
                headers: { token: currentUser.accessToken }
            });
            setSubmissionsData(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Không thể tải danh sách nộp bài!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsLoadingSubmissions(false);
        }
    };

    const handleCloseSubmissions = () => {
        setViewingSubmissionsAssignment(null);
        setSubmissionsData(null);
        setSubmissionsSearch('');
    };

    return {
        classInfo,
        isTeacherAccount: currentUser?.role === 'teacher',
        studentList,
        assistantList,
        studentSearch,
        setStudentSearch,
        assistantSearch,
        setAssistantSearch,
        loadMembers,
        handlePromoteAssistant,
        handleDemoteAssistant,
        availableSets,
        selectedSetId,
        setSelectedSetId,
        showQuestionSets,
        setShowQuestionSets,
        showAssignments,
        setShowAssignments,
        showCreateAssignmentModal,
        setShowCreateAssignmentModal,
        assignmentTitle,
        setAssignmentTitle,
        assignmentHasDueDate,
        setAssignmentHasDueDate,
        assignmentDueDate,
        setAssignmentDueDate,
        assignmentDescription,
        setAssignmentDescription,
        selectedQuestionIds,
        setSelectedQuestionIds,
        expandedSetIds,
        handleToggleSetExpand,
        handleToggleQuestionSelect,
        handleToggleSelectAllInSet,
        handleOpenCreateAssignmentModal,
        handleCloseCreateAssignmentModal,
        handleCreateAssignment,
        handleDeleteAssignment,
        isSubmittingAssignment,
        viewingAssignment,
        setViewingAssignment,
        viewingSubmissionsAssignment,
        submissionsData,
        isLoadingSubmissions,
        submissionsSearch,
        setSubmissionsSearch,
        handleOpenSubmissions,
        handleCloseSubmissions,
        loadClass,
        isLoading,
        error,
        handleAddQuestionSet,
        navigate
    };
};
