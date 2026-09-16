import React from 'react';
import { Link } from 'react-router-dom';
import { LoginPageLogic } from '../pages_logic/LoginPageLogic'; // Đường dẫn tới file logic của bạn
import '../pages_styling/AuthPageStyling.css';

const LoginPage = () => {
    const {
        username,
        setUsername,
        password,
        setPassword,
        handleLogin,
        handleGuestLogin
    } = LoginPageLogic(); //[cite: 3]

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">Đăng nhập</h1>
                <form onSubmit={handleLogin} className="auth-form"> {/*[cite: 3] */}
                    <div className="input-group">
                        <label>Tên đăng nhập</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tên tài khoản của bạn"
                            value={username} /*[cite: 3] */
                            onChange={(e) => setUsername(e.target.value)} /*[cite: 3] */
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password} /*[cite: 3] */
                            onChange={(e) => setPassword(e.target.value)} /*[cite: 3] */
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary auth-submit">
                        Đăng nhập
                    </button>
                </form>

                <div className="auth-divider">
                    <span>hoặc</span>
                </div>

                <button onClick={handleGuestLogin} className="btn-secondary guest-btn"> {/*[cite: 3] */}
                    Chơi ngay
                </button>

                <p className="auth-footer">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;