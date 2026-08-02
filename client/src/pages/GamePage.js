import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GamePage = () => {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gameVersion, setGameVersion] = useState(null);

  // 1. Kiểm tra đăng nhập & Lấy câu hỏi từ Server
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(loggedInUser));

    // Gọi API lấy danh sách câu hỏi ngay khi vào trang
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/questions');
        setQuestions(res.data);
        console.log("Đã tải xong câu hỏi từ Database:", res.data);
      } catch (err) {
        console.error("Lỗi lấy câu hỏi:", err);
      }
    };

    const fetchGameConfig = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/settings/version');
            setGameVersion(res.data.version); // Lưu version vào state
            console.log("Đang chạy game phiên bản:", res.data.version);
        } catch (err) {
            console.error("Lỗi lấy version, dùng mặc định v1.0");
            setGameVersion("v1.0");
        }
    };

    fetchQuestions();
    fetchGameConfig();
  }, [navigate]);

  
  // 2. Lắng nghe tin nhắn từ Game (Godot)
  useEffect(() => {
    const handleGameMessage = async (event) => {
      // Quan trọng: Kiểm tra xem tin nhắn có đúng định dạng không
      const data = event.data;

      // TRƯỜNG HỢP A: Game đòi câu hỏi
      if (data.type === 'REQUEST_QUESTIONS') {
        console.log("Game đang lấy câu hỏi...");
        if (iframeRef.current) {
          // Gửi câu hỏi vào trong Iframe
          iframeRef.current.contentWindow.postMessage({
            type: 'LOAD_QUESTIONS',
            data: questions
          }, '*');
          console.log("Đã gửi câu hỏi vào Game!");
        }
      }

 // TRƯỜNG HỢP B: Game báo kết thúc (Gửi điểm)
      if (data.type === 'GAME_OVER') {
        const score = data.score;
        console.log(`🏆 Nhận được điểm số: ${score}`);
        
        const user = JSON.parse(localStorage.getItem("user"));
        
        try {
          // 1. Gọi API lưu vào Database (Backend)
          const res = await axios.post('http://localhost:5000/api/auth/score', {
            username: user.username,
            score: score
          },
          {
              // QUAN TRỌNG: Gửi kèm vé ở đây
              headers: { token: user.accessToken } 
          }
        );
          
          // 2. CẬP NHẬT GIAO DIỆN NGAY LẬP TỨC (Frontend)
          // Lấy điểm cao nhất mới từ phản hồi của Server
          const newHighScore = res.data.newHighScore; 
          
          // Cập nhật lại biến user trong React để màn hình nhảy số
          const updatedUser = { ...user, highScore: newHighScore };
          setUser(updatedUser);
          
          // Lưu lại vào bộ nhớ trình duyệt để F5 không bị mất
          localStorage.setItem('user', JSON.stringify(updatedUser));

          alert(`Chúc mừng! Điểm số ${score} đã được lưu.`);
          
        } catch (err) {
          console.error("Lỗi lưu điểm:", err);
          alert("Lỗi: Không lưu được điểm số.");
        }
      }
    }
    // Bắt đầu lắng nghe
    window.addEventListener('message', handleGameMessage);

    // Dọn dẹp khi thoát trang
    return () => window.removeEventListener('message', handleGameMessage);
  }, [questions]); // Cập nhật listener khi có questions mới

  if (!user) return <div>Đang tải...</div>;
  if (!user || !gameVersion) return <div>Đang tải Game...</div>;

  return (
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '1000px', margin: '0 auto 10px' }}>
        <h3>👤 {user.username}</h3>
        <h3>🏆 High Score: {user.highScore}</h3>
      </div>
      
      {/* KHUNG CHỨA GAME */}
      <div style={{ width: '1000px', height: '600px', margin: '0 auto', border: '5px solid #2c3e50', borderRadius: '10px', overflow: 'hidden' }}>
        <iframe 
          ref={iframeRef}
          src={`/game/${gameVersion}/index.html`}
          width="100%" 
          height="100%" 
          title="EduGame"
          style={{ border: 'none' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        {user && (user.role === 'user' || user.role === 'admin') && (
        <button 
            onClick={() => navigate('/studio')}
            style={{ 
            marginRight: '10px',
            padding: '10px 20px', 
            backgroundColor: '#f39c12', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
            }}
        >
            Quản lý câu hỏi
        </button>

        )}
        {user.role === 'admin' && (
        <button 
            onClick={() => navigate('/admin')}
            style={{ 
                marginRight: '10px',
                padding: '10px 20px', 
                backgroundColor: '#f39c12', // Màu cam cảnh báo
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
            }}
        >
            ⚙️ Quản trị hệ thống
        </button>
        )}

        <button 
            onClick={() => navigate('/library')}
            style={{ 
                marginRight: '10px',
                padding: '10px 20px', 
                backgroundColor: '#9b59b6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
            }}
        >
            📚 Thư viện câu hỏi
        </button>

        <button
            onClick={() => navigate('/leaderboard')}
            style={{ 
                marginRight: '10px',
                padding: '10px 20px', 
                backgroundColor: '#3498db',
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
            }}
            >
            Xem xếp hạng
        </button>

        <button 
              onClick={() => navigate('/profile')}
              style={{ 
                  marginRight: '10px',
                padding: '10px 20px', 
                backgroundColor: '#3498db',
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer' 
                }}
            >
            Trang cá nhân
        </button>

        <button 
          onClick={() => { localStorage.removeItem('user'); navigate('/'); }}
          style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Đăng Xuất
        </button>
      </div>
    </div>
  );
};

export default GamePage;

