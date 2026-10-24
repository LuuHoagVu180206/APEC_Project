import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterPageLogic } from '../pages_logic/RegisterPageLogic'; 
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/AuthPageStyling.css';
import { 
    Sun, 
    Moon, 
    Sparkles, 
    ArrowLeft, 
    User, 
    Lock, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    Gamepad2, 
    GraduationCap 
} from 'lucide-react';

const RegisterPage = () => {
    const [selectedRole, setSelectedRole] = useState('user');
    const {
        username, setUsername, 
        password, setPassword,
        confirmPassword, setConfirmPassword, 
        error, handleRegister
    } = RegisterPageLogic(selectedRole);

    const { isDark, toggleTheme } = useDarkMode();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="auth-root">
            {/* 1. NAVBAR TỐI GIẢN */}
            <header className="auth-navbar">
                <div className="auth-nav-container">
                    <div className="nav-left">
                        <div className="brand-logo" onClick={() => navigate('/')}>
                            <div className="brand-coin">
                                <Sparkles size={18} />
                            </div>
                            <span className="brand-name">EasyLearn</span>
                        </div>
                    </div>

                    <div className="nav-right">
                        <button 
                            className="theme-toggle-btn"
                            onClick={toggleTheme} 
                            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={19} /> : <Moon size={19} />}
                        </button>

                        <Link to="/" className="auth-nav-back">
                            <ArrowLeft size={16} />
                            <span>Trang chủ</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. AUTH CARD */}
            <div className="auth-wrapper">
                <div className="auth-backdrop-glow"></div>

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-pill-badge">
                            <Sparkles size={13} />
                            <span>Tài khoản mới</span>
                        </div>
                        <h1 className="auth-title">Tạo tài khoản EasyLearn</h1>
                        <p className="auth-subtitle">
                            Tham gia cộng đồng để bắt đầu học tập và thi đấu ngay.
                        </p>
                    </div>

                    {/* Chọn vai trò */}
                    <div className="role-picker-container">
                        <span className="role-picker-label">Bạn là:</span>
                        <div className="role-cards-grid">
                            <button
                                type="button"
                                className={`role-card-btn ${selectedRole === 'user' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('user')}
                            >
                                <div className="role-icon-wrap">
                                    <Gamepad2 size={20} />
                                </div>
                                <span>Học sinh</span>
                            </button>

                            <button
                                type="button"
                                className={`role-card-btn ${selectedRole === 'teacher' ? 'active' : ''}`}
                                onClick={() => setSelectedRole('teacher')}
                            >
                                <div className="role-icon-wrap">
                                    <GraduationCap size={20} />
                                </div>
                                <span>Giáo viên</span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-alert-error" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="reg-username">Tên đăng nhập</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-lead-icon" />
                                <input 
                                    id="reg-username"
                                    className="input-field"
                                    type="text" 
                                    placeholder="Tối thiểu 6 ký tự"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-password">Mật khẩu</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-lead-icon" />
                                <input 
                                    id="reg-password"
                                    className="input-field"
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Tối thiểu 6 ký tự"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                                <button
                                    type="button"
                                    className="input-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-lead-icon" />
                                <input 
                                    id="reg-confirm"
                                    className="input-field"
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                />
                                <button
                                    type="button"
                                    className="input-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        
                        <button type="submit" className="btn-auth-primary">
                            <Sparkles size={18} />
                            <span>Đăng ký ngay</span>
                        </button>
                    </form>

                    <p className="auth-switch-prompt">
                        Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
