import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export const TeacherDashboardLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'teacher') {
            navigate(currentUser ? '/' : '/login', { replace: true });
            return;
        }

        let isActive = true;
        axios.get('http://localhost:5000/api/classes/mine', {
            headers: { token: currentUser.accessToken }
        }).then((response) => {
            if (isActive) setClasses(response.data);
        }).catch(() => {
            if (isActive) setError('Không thể tải danh sách lớp. Vui lòng thử lại.');
        }).finally(() => {
            if (isActive) setIsLoading(false);
        });

        return () => { isActive = false; };
    }, [currentUser, navigate]);

    return { currentUser, classes, isLoading, error, navigate };
};