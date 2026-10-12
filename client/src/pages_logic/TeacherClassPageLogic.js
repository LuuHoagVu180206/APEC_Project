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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

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
        isLoading,
        error,
        handleAddQuestionSet,
        navigate
    };
};