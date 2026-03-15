import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Mặc định là tắt (ẩn pass)
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
                    required
                    style={{ 
                        padding: '10px', 
                        width: '100%', 
                        boxSizing: 'border-box', 
                        marginBottom: '15px' 
                    }} 
                />
        </div>
        
        <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Mật khẩu" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ padding: '10px', width: '100%', boxSizing: 'border-box', paddingRight: '40px' }} // Chừa chỗ cho con mắt
                    />
                    
                    {/* Nút bấm Ẩn/Hiện */}
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                            position: 'absolute', 
                            right: '10px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            border: 'none', 
                            background: 'transparent', 
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
          Vào Chơi Ngay
        </button>
        
        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;