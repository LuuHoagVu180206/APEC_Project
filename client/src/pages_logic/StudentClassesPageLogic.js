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
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    const loadClasses = useCallback(async () => {
        const response = await axios.get('http://localhost:5000/api/classes/student/mine', {
            headers: { token: currentUser.accessToken }
        });
        setClasses(response.data);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'user') {
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

    const closeClass = () => setSelectedClass(null);

    const handleJoinByCode = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setIsJoining(true);
        try {
            const response = await axios.post('http://localhost:5000/api/classes/join-by-code', {
                classCode: classCode.trim().toLowerCase()
            }, { headers: { token: currentUser.accessToken } });
            setNotice(response.data.message);
            setClassCode('');
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

    return {
        classCode,
        setClassCode,
        classes,
        selectedClass,
        error,
        notice,
        isLoading,
        isJoining,
        handleJoinByCode,
        openClass,
        closeClass,
        navigate
    };
};