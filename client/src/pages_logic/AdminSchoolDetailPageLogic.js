import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export const AdminSchoolDetailPageLogic = () => {
    const navigate = useNavigate();
    const { schoolId } = useParams();
    const [currentUser] = useState(readCurrentUser);
    const [dashboard, setDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/', { replace: true });
            return undefined;
        }

        const controller = new AbortController();
        axios.get(`http://localhost:5000/api/admin/schools/${schoolId}`, {
            headers: { token: currentUser.accessToken },
            signal: controller.signal
        }).then((response) => {
            setDashboard(response.data);
        }).catch((requestError) => {
            if (!controller.signal.aborted) {
                setError(typeof requestError.response?.data === 'string'
                    ? requestError.response.data
                    : 'Không thể tải dashboard của School.');
            }
        }).finally(() => {
            if (!controller.signal.aborted) setIsLoading(false);
        });

        return () => controller.abort();
    }, [currentUser, navigate, schoolId]);

    return { dashboard, isLoading, error, navigate };
};