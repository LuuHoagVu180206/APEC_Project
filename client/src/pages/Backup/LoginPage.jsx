import React from 'react';
import { Link } from 'react-router-dom';
import { LoginPageLogic } from '../pages_logic/LoginPageLogic';

const LoginPage = () => {
    const {
        username, setUsername, password, setPassword, 
        handleLogin, handleGuestLogin, navigate
    } = LoginPageLogic();

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
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
                    />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <input 
                        type="password" 
                        placeholder="Mật khẩu" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
                    />
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px', cursor: 'pointer', marginBottom: '15px' }}>
                    Vào Chơi Ngay
                </button>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                        type="button" 
                        onClick={handleGuestLogin} 
                        style={{ padding: '10px', background: '#6c757d', color: 'white', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px', cursor: 'pointer' }}
                    >
                        🎮 Chơi ngay (Khách)
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => navigate('/library')} 
                        style={{ padding: '10px', background: '#17a2b8', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px', cursor: 'pointer', color: 'white' }}
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