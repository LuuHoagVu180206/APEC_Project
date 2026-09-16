import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterPageLogic } from '../pages_logic/RegisterPageLogic';

const RegisterPage = () => {

    const {
        username, setUsername, password, setPassword,
        confirmPassword, setConfirmPassword, error, handleRegister
    } = RegisterPageLogic();

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
            <form onSubmit={handleRegister} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng Ký Tài Khoản</h2>
                
                {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Tên đăng nhập</label>
                    <input 
                        type="text" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Mật khẩu</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Nhập lại mật khẩu</label>
                    <input 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Đăng Ký
                </button>

                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;