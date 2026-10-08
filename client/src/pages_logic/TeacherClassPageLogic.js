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

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'teacher') {
            navigate(currentUser ? '/' : '/login', { replace: true });
            return;
        }

        let isActive = true;
        Promise.all([
            axios.get(`http://localhost:5000/api/classes/${id}`, {
                headers: { token: currentUser.accessToken }
            }),
            axios.get('http://localhost:5000/api/sets/my-sets', {
                headers: { token: currentUser.accessToken }
            })
        ]).then(([classResponse, setsResponse]) => {
            if (!isActive) return;
            setClassInfo(classResponse.data);
            setMySets(setsResponse.data);
        }).catch((requestError) => {
            if (isActive) {
                setError(typeof requestError.response?.data === 'string'
                    ? requestError.response.data
                    : 'Không thể tải thông tin lớp.');
            }
        }).finally(() => {
            if (isActive) setIsLoading(false);
        });

        return () => { isActive = false; };
    }, [currentUser, id, navigate]);

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

    return {
        classInfo,
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