import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GamePage = () => {
    const navigate = useNavigate();
    const iframeRef = useRef(null);
    
    const [user, setUser] = useState(null);
    const [gameVersion, setGameVersion] = useState(null);
    
    // State cho Bộ Câu Hỏi
    const [availableSets, setAvailableSets] = useState([]); // Danh sách các đề thi
    const [selectedSet, setSelectedSet] = useState(null);   // Đề thi người chơi chọn

    // 1. Kiểm tra đăng nhập & Tải dữ liệu ban đầu
    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) {
            navigate('/login');
            return;
        }
        setUser(loggedInUser);

        // Lấy danh sách TẤT CẢ bộ câu hỏi từ Server
        const fetchQuestionSets = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/questionset/my-sets', {
                headers: { token: loggedInUser.accessToken }
                }); 
                setAvailableSets(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách bộ câu hỏi:", err);
            }
        };

        // Lấy version game
        const fetchGameConfig = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/settings/version');
                setGameVersion(res.data.version);
            } catch (err) {
                setGameVersion("v1.0");
            }
        };

        fetchQuestionSets();
        fetchGameConfig();
    }, [navigate]);

    // 2. Lắng nghe tin nhắn từ Game (Chỉ chạy khi đã chọn đề)
    useEffect(() => {
        const handleGameMessage = async (event) => {
            const data = event.data;

            // TRƯỜNG HỢP A: Game xin câu hỏi
            if (data.type === 'REQUEST_QUESTIONS') {
                console.log("📩 Game đang xin câu hỏi...");
                if (iframeRef.current && selectedSet) {
                    // GỬI CHÍNH XÁC CÁC CÂU HỎI CỦA BỘ ĐÃ CHỌN VÀO GAME
                    iframeRef.current.contentWindow.postMessage({
                        type: 'LOAD_QUESTIONS',
                        data: selectedSet.questions
                    }, '*');
                    console.log(`📤 Đã gửi ${selectedSet.questions.length} câu hỏi của đề: ${selectedSet.title}`);
                }
            }

            // TRƯỜNG HỢP B: Game Over (Gửi điểm)
            if (data.type === 'GAME_OVER') {
                const score = data.score;
                const currentUser = JSON.parse(localStorage.getItem("user"));
                
                try {
                    const res = await axios.post('http://localhost:5000/api/auth/score', 
                        { username: currentUser.username, score: score },
                        { headers: { token: currentUser.accessToken } }
                    );
                    
                    const newHighScore = res.data.newHighScore; 
                    const updatedUser = { ...currentUser, highScore: newHighScore };
                    
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    alert(`🏆 Chúc mừng! Điểm của bạn: ${score}`);
                    
                    // Chơi xong thì đá về sảnh để chọn đề khác
                    setSelectedSet(null); 
                    
                } catch (err) {
                    console.error("Lỗi lưu điểm:", err);
                }
            }
        };

        window.addEventListener('message', handleGameMessage);
        return () => window.removeEventListener('message', handleGameMessage);
    }, [selectedSet]); // Lắng nghe sự thay đổi của selectedSet

    if (!user || !gameVersion) return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải hệ thống...</div>;

    return (
        <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            
            {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1000px', margin: '0 auto 20px', backgroundColor: '#343a40', padding: '15px', borderRadius: '8px', color: 'white' }}>
                <h3 style={{ margin: 0 }}>👤 {user.username} (High Score: {user.highScore})</h3>
                <div>
                    {user.role === 'admin' && (
                        <button onClick={() => navigate('/admin')} style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            ⚙️ Quản Lý
                        </button>
                    )}
                    <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Đăng Xuất
                    </button>
                </div>
            </div>
        <button onClick={() => navigate('/library')} style={{ marginRight: '10px', padding: '8px 15px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        🌐 Thư Viện Cộng Đồng
        </button>        
            
            {/* HIỂN THỊ MÀN HÌNH CHỌN ĐỀ NẾU CHƯA CHỌN */}
            {!selectedSet ? (
                <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎮 CHỌN BỘ CÂU HỎI ĐỂ BẮT ĐẦU CHƠI 🎮</h2>
                    
                    {availableSets.length === 0 ? (
                        <p style={{ color: 'red' }}>Chưa có bộ câu hỏi nào. Admin hãy vào Quản Lý để tạo nhé!</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {availableSets.map(set => (
                                <button 
                                    key={set._id}
                                    onClick={() => setSelectedSet(set)}
                                    style={{ padding: '20px', fontSize: '18px', backgroundColor: '#e3f2fd', border: '2px solid #3498db', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#bbdefb'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                                >
                                    <strong>{set.title}</strong>
                                    <br/>
                                    <span style={{ fontSize: '14px', color: '#555' }}>({set.questions.length} câu hỏi)</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* NẾU ĐÃ CHỌN ĐỀ THÌ MỚI HIỆN GAME RA */
                <div>
                    <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                            📝 Đang chơi bộ: {selectedSet.title}
                        </span>
                        <button 
                            onClick={() => setSelectedSet(null)} 
                            style={{ marginLeft: '15px', padding: '5px 10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            🔄 Đổi Đề Khác
                        </button>
                    </div>

                    <div style={{ width: '1000px', height: '600px', margin: '0 auto', border: '5px solid #2c3e50', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'black' }}>
                        <iframe 
                            ref={iframeRef}
                            src={`/game/${gameVersion}/index.html`}
                            width="100%" 
                            height="100%" 
                            title="EduGame"
                            style={{ border: 'none' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamePage;