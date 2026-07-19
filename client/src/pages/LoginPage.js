import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Gọi API sang Backend
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });
      // Nếu thành công:
      alert('Đăng nhập thành công!');
      
      // Lưu thông tin user vào bộ nhớ trình duyệt để dùng sau này
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Chuyển hướng sang trang Game
      navigate('/game');
      
    } catch (err) {
      console.error(err);
      alert('Sai tài khoản hoặc mật khẩu!');
    }
  };


  const handleGuestLogin = () => {
    // 1. Tạo một con số ngẫu nhiên để phân biệt các khách với nhau
    const randomNum = Math.floor(Math.random() * 10000);
    
    // 2. Đóng gói một "Tài khoản ảo" với role là 'guest'
    const guestData = {
      _id: `guest_${randomNum}`,
      username: `Guest_${randomNum}`,
      role: 'guest',
      accessToken: null // Guest không có token của Backend
    };

    // 3. Lưu vào localStorage giống hệt như một User thật
    localStorage.setItem('user', JSON.stringify(guestData));
    
    // 4. Mở cổng cho vào Game
    navigate('/game');
  };


  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
      <form onSubmit={handleLogin} style={{ padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng Nhập Game</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%', 
              padding: '10px', 
              marginBottom: '10px',
              borderRadius: '5px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '16px' 
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '10px',
              borderRadius: '5px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '16px' 
            }}
          />
        </div>

        <button type="submit" style={{ 
          width: '100%',
          padding: '10px',
          background: '#007bff',
          color: 'white',
          borderRadius: '5px', 
          border: '1px solid #ccc',
          boxSizing: 'border-box',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '15px' }}
        >
          Vào Chơi Ngay
        </button>


        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            type="button" 
            onClick={handleGuestLogin} // Gắn hàm vừa tạo vào đây
            style={{ 
              padding: '10px', 
              background: '#6c757d', 
              color: 'white', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '16px',
              cursor: 'pointer' 
            }}
          >
            🎮 Chơi ngay (Khách)
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/library')} 
            style={{ 
              padding: '10px', 
              background: '#17a2b8', 
              borderRadius: '5px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              fontSize: '16px', 
              cursor: 'pointer', 
              color: 'white'
            }}
          >
            📚 Khám phá Thư viện
          </button>
        </div>


        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;