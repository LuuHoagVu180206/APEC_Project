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

export const SchoolDiscoveryPageLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [schools, setSchools] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [joinData, setJoinData] = useState({ fullName: '', className: '', teachingInfo: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    const loadSchools = async (search = searchTerm) => {
        const response = await axios.get('http://localhost:5000/api/schools/search', {
            params: { q: search }
        });
        setSchools(response.data);
    };

    const loadMemberships = async () => {
        if (!currentUser) return;
        const response = await axios.get('http://localhost:5000/api/schools/mine', {
            headers: { token: currentUser.accessToken }
        });
        setMemberships(response.data);
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { replace: true });
            return;
        }
        let isActive = true;
        Promise.all([
            axios.get('http://localhost:5000/api/schools/search'),
            axios.get('http://localhost:5000/api/schools/mine', {
                headers: { token: currentUser.accessToken }
            })
        ]).then(([schoolResponse, membershipResponse]) => {
            if (!isActive) return;
            setSchools(schoolResponse.data);
            setMemberships(membershipResponse.data);
        }).catch(() => {
            if (isActive) setError('Không thể tải dữ liệu trường học.');
        }).finally(() => {
            if (isActive) setIsLoading(false);
        });
        return () => { isActive = false; };
    }, [currentUser, navigate]);

    const handleSearch = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await loadSchools(searchTerm);
        } catch {
            setError('Không thể tìm trường lúc này.');
        }
    };

    const startJoin = (school) => {
        setSelectedSchool(school);
        setJoinData({
            fullName: currentUser.fullName || '',
            className: '',
            teachingInfo: ''
        });
        setError('');
    };

    const handleJoin = async (event) => {
        event.preventDefault();
        setError('');
        setIsJoining(true);
        try {
            const response = await axios.post(
                `http://localhost:5000/api/schools/${selectedSchool._id}/join`,
                joinData,
                { headers: { token: currentUser.accessToken } }
            );
            await loadMemberships();
            setSelectedSchool(null);
            alert(response.data.message);
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể tham gia School Community.');
        } finally {
            setIsJoining(false);
        }
    };

    const membershipIds = new Set(memberships.map((membership) => membership.school?._id));

    return {
        currentUser,
        schools,
        memberships,
        searchTerm,
        setSearchTerm,
        selectedSchool,
        setSelectedSchool,
        joinData,
        setJoinData,
        error,
        isLoading,
        isJoining,
        membershipIds,
        handleSearch,
        startJoin,
        handleJoin,
        navigate
    };
};