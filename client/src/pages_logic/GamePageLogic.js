import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const GamePageLogic = () => {
    const navigate = useNavigate();
    const iframeRef = useRef(null);
    const gameContainerRef = useRef(null);

    const [user, setUser] = useState(() => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            return savedUser?.username ? savedUser : null;
        } catch {
            return null;
        }
    });

    const [questions, setQuestions] = useState([]);
    const [gameVersion, setGameVersion] = useState("v1.0");
    const [isLoadingGame, setIsLoadingGame] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [schoolMemberships, setSchoolMemberships] = useState([]);

    // 1. Kiểm tra session hoặc tạo khách
    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const guestUser = {
                _id: `guest_${randomNum}`,
                username: `Khách_${randomNum}`,
                role: 'guest',
                accessToken: null,
                highScore: 0
            };
            localStorage.setItem('user', JSON.stringify(guestUser));
            setUser(guestUser);
        } else {
            try {
                setUser(JSON.parse(loggedInUser));
            } catch {
                setUser(null);
            }
        }

        const fetchQuestions = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/questions');
                setQuestions(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách câu hỏi:", err);
            }
        };

        const fetchGameConfig = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/settings/version');
                if (res.data?.version) {
                    setGameVersion(res.data.version);
                }
            } catch (err) {
                console.warn("Dùng phiên bản game mặc định v1.0");
                setGameVersion("v1.0");
            } finally {
                setIsLoadingGame(false);
            }
        };

        fetchQuestions();
        fetchGameConfig();
    }, [navigate]);

    // 2. Tải danh sách trường học nếu có token
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

    // 3. Xử lý postMessage giữa Web và Iframe Game
    useEffect(() => {
        const handleGameMessage = async (event) => {
            const data = event.data;
            if (!data) return;

            if (data.type === 'REQUEST_QUESTIONS') {
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'LOAD_QUESTIONS',
                        data: questions
                    }, '*');
                }
            }

            if (data.type === 'GAME_OVER') {
                const score = Number(data.score) || 0;
                let currentUser = null;
                try {
                    currentUser = JSON.parse(localStorage.getItem("user"));
                } catch {
                    currentUser = null;
                }

                if (!currentUser || currentUser.role === 'guest' || !currentUser.accessToken) {
                    alert(`🎉 Hoàn thành màn chơi! Bạn đạt được: ${score} điểm.\n💡 Hãy đăng nhập hoặc tạo tài khoản để lưu kỷ lục lên Bảng xếp hạng nhé!`);
                    return;
                }

                try {
                    const res = await axios.post('http://localhost:5000/api/scores/score', {
                        username: currentUser.username,
                        score: score
                    }, {
                        headers: { token: currentUser.accessToken } 
                    });

                    const newHighScore = res.data?.newHighScore !== undefined 
                        ? res.data.newHighScore 
                        : Math.max(currentUser.highScore || 0, score);

                    const updatedUser = { ...currentUser, highScore: newHighScore };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    alert(`🏆 Chúc mừng! Bạn đạt ${score} điểm. Kỷ lục cao nhất của bạn: ${newHighScore}!`);
                } catch (err) {
                    console.error("Lỗi lưu điểm số:", err);
                    alert(`Hoàn thành màn chơi với ${score} điểm!`);
                }
            }
        };

        window.addEventListener('message', handleGameMessage);
        return () => window.removeEventListener('message', handleGameMessage);
    }, [questions]);

    // 4. Các tiện ích điều khiển Game
    const handleReloadGame = useCallback(() => {
        if (iframeRef.current) {
            try {
                if (iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.location.reload();
                    return;
                }
            } catch (err) {
                console.warn("Reload qua contentWindow không thành công, dùng gán lại source", err);
            }
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = currentSrc; // eslint-disable-line no-self-assign
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        const elem = gameContainerRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, []);

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    return {
        user,
        questions,
        gameVersion,
        isLoadingGame,
        isFullscreen,
        iframeRef,
        gameContainerRef,
        schoolActionLabel,
        navigate,
        handleReloadGame,
        toggleFullscreen,
        handleLogout
    };
};
