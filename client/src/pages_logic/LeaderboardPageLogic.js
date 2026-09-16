import useEffect, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const LeaderboardPageLogic = () => {
    const [leaders, setLeaders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/auth/leaderboard');
                setLeaders(res.data);
            } catch (err) {
                console.error("Lỗi lấy BXH:", err);
            }
        };
        fetchLeaderboard();
    }, []);

    // Xuất ra 2 thứ duy nhất mà UI cần
    return { leaders, navigate };
};