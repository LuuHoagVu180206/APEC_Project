import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterPageLogic } from '../pages_logic/RegisterPageLogic'; 
import '../pages_styling/AuthPageStyling.css';

const RegisterPage = () => {
    const {
        username, setUsername, 
        password, setPassword,
        confirmPassword, setConfirmPassword, 
        error, handleRegister
    } = RegisterPageLogic();

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">Tạo tài khoản</h1>
                
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleRegister} className="auth-form">
                    <div className="input-group">
                        <label>Tên đăng nhập</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tên tài khoản (ít nhất 6 ký tự)"
                            value={username} /*[cite: 4] */
                            onChange={(e) => setUsername(e.target.value)} /*[cite: 4] */
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Xác nhận mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary auth-submit">
                        Đăng ký
                    </button>
                </form>

                <p className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;