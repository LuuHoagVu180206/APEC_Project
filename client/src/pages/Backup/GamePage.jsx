import {GamePageLogic} from '../pages_logic/GamePageLogic';

const GamePage = () => {
  const { user, gameVersion, iframeRef, navigate, handleLogout } = GamePageLogic();
  
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

