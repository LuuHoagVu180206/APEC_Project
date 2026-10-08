import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginPageLogic } from '../pages_logic/LoginPageLogic'; // Đường dẫn tới file logic của bạn
import { RegisterPageLogic } from '../pages_logic/RegisterPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode'; // Import hook vừa tạo
import { Sun, Moon } from 'lucide-react';
import { useState } from 'react';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const isRegister = searchParams.get('mode') === 'register';
    const [isTeacher, setIsTeacher] = useState(false);
    const {
        username: registerUsername,
        setUsername: setRegisterUsername,
        password: registerPassword,
        setPassword: setRegisterPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        handleRegister
    } = RegisterPageLogic(isTeacher ? 'teacher' : 'user');

    const { isDark, toggleTheme } = useDarkMode(); // Sử dụng hook
    const navigate = useNavigate();

    return (
    <>
        <nav className="navbar">
                <div className="nav-left">
                    <h2 className="logo" onClick={() => navigate('/Landing')}>EasyLearn</h2>
                    <button onClick={toggleTheme} 
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px'
                            }}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
        </nav>
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
                {isRegister ? (
                    <>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="input-group">
                                <label htmlFor="register-username">Tên đăng nhập</label>
                                <input
                                    id="register-username"
                                    type="text"
                                    placeholder="Nhập tên tài khoản (ít nhất 6 ký tự)"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="register-password">Mật khẩu</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <label className="auth-role-option">
                                <input
                                    type="checkbox"
                                    checked={isTeacher}
                                    onChange={(e) => setIsTeacher(e.target.checked)}
                                />
                                <span>Tôi là giáo viên</span>
                            </label>
                            <button type="submit" className="btn-primary auth-submit">
                                Đăng ký
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="input-group">
                                <label htmlFor="login-username">Tên đăng nhập</label>
                                <input
                                    id="login-username"
                                    type="text"
                                    placeholder="Nhập tên tài khoản của bạn"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="login-password">Mật khẩu</label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary auth-submit">
                                Đăng nhập
                            </button>
                        </form>

                        <p className="auth-footer auth-forgot-link">
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </p>

                        <div className="auth-divider">
                            <span>hoặc</span>
                        </div>

                        <button onClick={handleGuestLogin} className="btn-secondary guest-btn">
                            Chơi ngay
                        </button>
                    </>
                )}

                <p className="auth-footer">
                    {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
                    <button
                        type="button"
                        className="auth-text-button auth-mode-toggle"
                        onClick={() => setSearchParams(isRegister ? {} : { mode: 'register' })}
                    >
                        {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                    </button>
                </p>
            </div>
        </div>
    </>
    );
};

export default LoginPage;