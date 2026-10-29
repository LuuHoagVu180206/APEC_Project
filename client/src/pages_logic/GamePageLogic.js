import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const GamePageLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    const [activeSet, setActiveSet] = useState(null);
    const [defaultSets, setDefaultSets] = useState([]);
    const [weeklySets, setWeeklySets] = useState([]);
    const [isSetModalOpen, setIsSetModalOpen] = useState(false);
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
                highScore: 0,
                weeklyScore: 0
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

        fetchGameConfig();
    }, [navigate]);

    // 2. Tải danh sách bộ đề chính thức & tuần
    useEffect(() => {
        const loadOfficialSets = async () => {
            try {
                const [defaultsRes, weeklyRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/sets/defaults'),
                    axios.get('http://localhost:5000/api/sets/weekly')
                ]);
                setDefaultSets(defaultsRes.data || []);
                setWeeklySets(weeklyRes.data || []);
            } catch (err) {
                console.warn("Không thể tải danh sách bộ đề có sẵn:", err);
            }
        };
        loadOfficialSets();
    }, []);

    // 3. Tải câu hỏi theo setId từ URL hoặc mặc định
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const setId = searchParams.get('setId');

        const loadQuestionsForGame = async () => {
            if (setId) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/sets/${setId}`);
                    if (res.data?.questions && res.data.questions.length > 0) {
                        setQuestions(res.data.questions);
                        setActiveSet(res.data.set);
                        return;
                    }
                } catch (err) {
                    console.error("Lỗi khi tải bộ đề cụ thể:", err);
                }
            }

            // Nếu không có setId hoặc tải lỗi, thử lấy bộ mặc định đầu tiên hoặc /api/questions
            try {
                const defaultsRes = await axios.get('http://localhost:5000/api/sets/defaults');
                if (defaultsRes.data && defaultsRes.data.length > 0) {
                    const firstSet = defaultsRes.data[0];
                    const setDetailRes = await axios.get(`http://localhost:5000/api/sets/${firstSet._id}`);
                    if (setDetailRes.data?.questions?.length > 0) {
                        setQuestions(setDetailRes.data.questions);
                        setActiveSet(setDetailRes.data.set);
                        return;
                    }
                }

                // Fallback nếu không có bộ đề nào
                const res = await axios.get('http://localhost:5000/api/questions');
                setQuestions(res.data);
                setActiveSet({
                    title: 'Bộ Đề Khởi Động Chuẩn',
                    authorName: 'APEC Group',
                    isDefault: true
                });
            } catch (err) {
                console.error("Lỗi tải câu hỏi:", err);
            }
        };

        loadQuestionsForGame();
    }, [location.search]);

    // 4. Chọn một bộ câu hỏi khác
    const handleSelectSet = async (selectedSet) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/sets/${selectedSet._id}`);
            if (res.data?.questions && res.data.questions.length > 0) {
                setQuestions(res.data.questions);
                setActiveSet(res.data.set);
                setIsSetModalOpen(false);

                // Cập nhật URL không làm tải lại trang
                navigate(`/game?setId=${selectedSet._id}`, { replace: true });

                // Gửi dữ liệu câu hỏi mới vào iframe game
                if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'LOAD_QUESTIONS',
                        data: res.data.questions
                    }, '*');
                }
            } else {
                alert("Bộ câu hỏi này hiện chưa có câu hỏi nào!");
            }
        } catch (err) {
            console.error("Lỗi đổi bộ đề:", err);
            alert("Không thể tải bộ câu hỏi đã chọn!");
        }
    };

    // 5. Tải danh sách trường học nếu có token
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

    // 6. Xử lý postMessage giữa Web và Iframe Game
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
                    alert(`🎉 Hoàn thành màn chơi! Bạn đạt được: ${score} điểm.\n💡 Hãy đăng nhập để lưu kỷ lục lên Bảng Xếp Hạng nhé!`);
                    return;
                }

                try {
                    const isWeekly = Boolean(activeSet?.isWeekly);
                    const res = await axios.post('http://localhost:5000/api/scores/score', {
                        username: currentUser.username,
                        score: score,
                        setId: activeSet?._id || '',
                        setTitle: activeSet?.title || '',
                        isWeekly: isWeekly
                    }, {
                        headers: { token: currentUser.accessToken } 
                    });

                    const newHighScore = res.data?.newHighScore !== undefined 
                        ? res.data.newHighScore 
                        : Math.max(currentUser.highScore || 0, score);
                    
                    const newWeeklyScore = res.data?.weeklyScore !== undefined
                        ? res.data.weeklyScore
                        : (isWeekly ? Math.max(currentUser.weeklyScore || 0, score) : currentUser.weeklyScore);

                    const updatedUser = { 
                        ...currentUser, 
                        highScore: newHighScore,
                        weeklyScore: newWeeklyScore 
                    };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    if (isWeekly) {
                        alert(`🏆 [THỬ THÁCH TUẦN] Chúc mừng! Bạn đạt ${score} điểm.\nĐiểm Tuần của bạn: ${newWeeklyScore} XP! Điểm cao nhất: ${newHighScore} XP.`);
                    } else {
                        alert(`🏆 Chúc mừng! Bạn đạt ${score} điểm. Kỷ lục cao nhất của bạn: ${newHighScore} XP!`);
                    }
                } catch (err) {
                    console.error("Lỗi lưu điểm số:", err);
                    alert(`Hoàn thành màn chơi với ${score} điểm!`);
                }
            }
        };

        window.addEventListener('message', handleGameMessage);
        return () => window.removeEventListener('message', handleGameMessage);
    }, [questions, activeSet]);

    // 7. Các tiện ích điều khiển Game
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
        activeSet,
        defaultSets,
        weeklySets,
        isSetModalOpen,
        setIsSetModalOpen,
        handleSelectSet,
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
