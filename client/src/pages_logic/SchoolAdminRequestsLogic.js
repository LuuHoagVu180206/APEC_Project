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

export const SchoolAdminRequestsLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');

    const loadRequests = useCallback(async () => {
        const response = await axios.get('http://localhost:5000/api/school-requests/admin/pending', {
            headers: { token: currentUser.accessToken }
        });
        setRequests(response.data);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/', { replace: true });
            return;
        }
        loadRequests().catch(() => setError('Không thể tải yêu cầu tạo trường.'));
    }, [currentUser, loadRequests, navigate]);

    const reviewRequest = async (requestId, decision) => {
        setError('');
        try {
            await axios.patch(`http://localhost:5000/api/school-requests/${requestId}/review`, {
                decision
            }, { headers: { token: currentUser.accessToken } });
            await loadRequests();
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể xử lý yêu cầu.');
        }
    };

    return { requests, error, reviewRequest, navigate };
};