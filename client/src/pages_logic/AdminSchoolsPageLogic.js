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

export const AdminSchoolsPageLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [schools, setSchools] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, totalItems: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/', { replace: true });
            return undefined;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setError('');
        const debounceTimer = setTimeout(async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/schools', {
                    params: { search: search.trim(), page, limit: 20 },
                    headers: { token: currentUser.accessToken },
                    signal: controller.signal
                });
                if (!controller.signal.aborted) {
                    setSchools(response.data.data);
                    setPagination(response.data.pagination);
                }
            } catch (requestError) {
                if (!controller.signal.aborted) {
                    setError(typeof requestError.response?.data === 'string'
                        ? requestError.response.data
                        : 'Không thể tải danh sách School Community.');
                    setSchools([]);
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }, 400);

        return () => {
            clearTimeout(debounceTimer);
            controller.abort();
        };
    }, [currentUser, navigate, page, search]);

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    return {
        schools,
        search,
        page,
        pagination,
        isLoading,
        error,
        setPage,
        handleSearchChange,
        navigate
    };
};