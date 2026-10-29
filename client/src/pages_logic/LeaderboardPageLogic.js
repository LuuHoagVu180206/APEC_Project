import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LeaderboardPageLogic = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('user'));
            return saved?.username ? saved : null;
        } catch {
            return null;
        }
    });

    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' hoặc 'all'
    const [leaders, setLeaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [schoolMemberships, setSchoolMemberships] = useState([]);

    // 1. Tải danh sách trường cho navbar nếu có token
    useEffect(() => {
        if (!user?.accessToken) return;
        let isActive = true;
        axios.get('http://localhost:5000/api/schools/mine', {
            headers: { token: user.accessToken }
        }).then((res) => {
            if (isActive) setSchoolMemberships(res.data);
        }).catch(() => {});
        return () => { isActive = false; };
    }, [user]);

    // 2. Tải danh sách bảng xếp hạng theo tab
    useEffect(() => {
        let isActive = true;
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/scores/leaderboard?type=${activeTab}`);
                if (isActive) {
                    setLeaders(res.data || []);
                }
            } catch (err) {
                console.error("Lỗi lấy BXH:", err);
                if (isActive) setLeaders([]);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        fetchLeaderboard();
        return () => { isActive = false; };
    }, [activeTab]);

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setSchoolMemberships([]);
        navigate('/');
    };

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    // Tính toán Top 3 và các thứ hạng còn lại
    const firstPlace = leaders[0] || null;
    const secondPlace = leaders[1] || null;
    const thirdPlace = leaders[2] || null;
    const remainingLeaders = leaders.slice(3);

    // Tìm thứ hạng cá nhân
    const userIndex = user?.username 
        ? leaders.findIndex(l => l.username?.toLowerCase() === user.username?.toLowerCase())
        : -1;
    const userRank = userIndex !== -1 ? userIndex + 1 : null;

    const currentScore = activeTab === 'weekly' 
        ? (user?.weeklyScore || 0) 
        : (user?.highScore || 0);

    return {
        user,
        activeTab,
        handleTabChange,
        leaders,
        isLoading,
        firstPlace,
        secondPlace,
        thirdPlace,
        remainingLeaders,
        userRank,
        currentScore,
        schoolActionLabel,
        handleLogout,
        navigate
    };
};
