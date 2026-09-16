import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const GamePageLogic = () => {
    const navigate = useNavigate();
    const iframeRef = useRef(null);
    const [user, setUser] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [gameVersion, setGameVersion] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) {
            navigate('/');
            return;
        }
        setUser(JSON.parse(loggedInUser));

        const fetchQuestions = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/questions');
                setQuestions(res.data);
            } catch (err) {
                console.error("Lỗi lấy câu hỏi:", err);
            }
        };

        const fetchGameConfig = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/settings/version');
                setGameVersion(res.data.version);
            } catch (err) {
                console.error("Lỗi lấy version, dùng mặc định v1.0");
                setGameVersion("v1.0");
            }
        };

        fetchQuestions();
        fetchGameConfig();
    }, [navigate]);

    useEffect(() => {
        const handleGameMessage = async (event) => {
            const data = event.data;

            if (data.type === 'REQUEST_QUESTIONS') {
                if (iframeRef.current) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'LOAD_QUESTIONS',
                        data: questions
                    }, '*');
                }
            }

            if (data.type === 'GAME_OVER') {
                const score = data.score;
                const currentUser = JSON.parse(localStorage.getItem("user"));
                
                try {
                    const res = await axios.post('http://localhost:5000/api/auth/score', {
                        username: currentUser.username,
                        score: score
                    }, {
                        headers: { token: currentUser.accessToken } 
                    });
                    
                    const newHighScore = res.data.newHighScore; 
                    const updatedUser = { ...currentUser, highScore: newHighScore };
                    
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    alert(`Chúc mừng! Điểm số ${score} đã được lưu.`);
                } catch (err) {
                    console.error("Lỗi lưu điểm:", err);
                    alert("Lỗi: Không lưu được điểm số.");
                }
            }
        };

        window.addEventListener('message', handleGameMessage);
        return () => window.removeEventListener('message', handleGameMessage);
    }, [questions]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return {
        user,
        gameVersion,
        iframeRef,
        navigate,
        handleLogout
    };
};