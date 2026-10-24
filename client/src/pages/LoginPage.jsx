import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginPageLogic } from '../pages_logic/LoginPageLogic';
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
    LogIn, 
    UserPlus, 
    Gamepad2, 
    GraduationCap, 
    AlertCircle, 
    Flame 
} from 'lucide-react';

const LoginPage = () => {
    const {
        username,
        setUsername,
        password,
        setPassword,
        handleLogin,
        handleGuestLogin
    } = LoginPageLogic();

    const [searchParams, setSearchParams] = useSearchParams();
    const isRegister = searchParams.get('mode') === 'register';
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') === 'teacher' ? 'teacher' : 'user');

    // Cập nhật selectedRole khi URL param thay đổi
    useEffect(() => {
        if (searchParams.get('role') === 'teacher') {
            setSelectedRole('teacher');
        }
    }, [searchParams]);

    const {
        username: registerUsername,
        setUsername: setRegisterUsername,
        password: registerPassword,
        setPassword: setRegisterPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        handleRegister
    } = RegisterPageLogic(selectedRole);

    const { isDark, toggleTheme } = useDarkMode();
    const navigate = useNavigate();

    // Ẩn/Hiện mật khẩu
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSwitchMode = (mode) => {
        if (mode === 'register') {
            setSearchParams(selectedRole === 'teacher' ? { mode: 'register', role: 'teacher' } : { mode: 'register' });
        } else {
            setSearchParams({});
        }
    };

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        if (role === 'teacher') {
            setSearchParams({ mode: 'register', role: 'teacher' });
        } else {
            setSearchParams({ mode: 'register' });
        }
    };

    return (
        <div className="auth-root">
            {/* 1. NAVBAR TỐI GIẢN - ĐỒNG BỘ BRANDING VỚI LANDING PAGE */}
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

            {/* 2. KHU VỰC NỘI DUNG ĐĂNG NHẬP / ĐĂNG KÝ */}
            <div className="auth-wrapper">
                <div className="auth-backdrop-glow"></div>

                <div className="auth-card">
                    {/* Tabs chuyển đổi mượt mà giữa Đăng nhập & Đăng ký */}
                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
                            onClick={() => handleSwitchMode('login')}
                        >
                            <LogIn size={16} />
                            <span>Đăng nhập</span>
                        </button>
                        <button
                            type="button"
                            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
                            onClick={() => handleSwitchMode('register')}
                        >
                            <UserPlus size={16} />
                            <span>Đăng ký</span>
                        </button>
                    </div>

                    {isRegister ? (
                        <>
                            {/* HEADER ĐĂNG KÝ */}
                            <div className="auth-header">
                                <div className="auth-pill-badge">
                                    <Sparkles size={13} />
                                    <span>Gia nhập hành trình</span>
                                </div>
                                <h1 className="auth-title">Tạo tài khoản mới</h1>
                                <p className="auth-subtitle">
                                    Trải nghiệm kho câu hỏi phong phú, thi đấu cùng bạn bè và mở khóa huy hiệu.
                                </p>
                            </div>

                            {/* LỰA CHỌN VAI TRÒ */}
                            <div className="role-picker-container">
                                <span className="role-picker-label">Bạn tham gia với vai trò:</span>
                                <div className="role-cards-grid">
                                    <button
                                        type="button"
                                        className={`role-card-btn ${selectedRole === 'user' ? 'active' : ''}`}
                                        onClick={() => handleSelectRole('user')}
                                    >
                                        <div className="role-icon-wrap">
                                            <Gamepad2 size={20} />
                                        </div>
                                        <span>Học sinh / Người học</span>
                                    </button>

                                    <button
                                        type="button"
                                        className={`role-card-btn ${selectedRole === 'teacher' ? 'active' : ''}`}
                                        onClick={() => handleSelectRole('teacher')}
                                    >
                                        <div className="role-icon-wrap">
                                            <GraduationCap size={20} />
                                        </div>
                                        <span>Giáo viên / Giảng viên</span>
                                    </button>
                                </div>
                            </div>

                            {/* THÔNG BÁO LỖI NẾU CÓ */}
                            {error && (
                                <div className="auth-alert-error" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* FORM ĐĂNG KÝ */}
                            <form onSubmit={handleRegister} className="auth-form">
                                <div className="input-group">
                                    <label htmlFor="register-username">Tên đăng nhập</label>
                                    <div className="input-with-icon">
                                        <User size={18} className="input-lead-icon" />
                                        <input
                                            id="register-username"
                                            className="input-field"
                                            type="text"
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={registerUsername}
                                            onChange={(e) => setRegisterUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="register-password">Mật khẩu</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-lead-icon" />
                                        <input
                                            id="register-password"
                                            className="input-field"
                                            type={showRegisterPassword ? 'text' : 'password'}
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={registerPassword}
                                            onChange={(e) => setRegisterPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="input-toggle-btn"
                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                            tabIndex="-1"
                                            title={showRegisterPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-lead-icon" />
                                        <input
                                            id="confirm-password"
                                            className="input-field"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu vừa tạo"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="input-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex="-1"
                                            title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="btn-auth-primary">
                                    <Sparkles size={18} />
                                    <span>Tạo tài khoản</span>
                                </button>
                            </form>

                            <p className="auth-switch-prompt">
                                Đã có tài khoản?
                                <button
                                    type="button"
                                    className="auth-switch-btn"
                                    onClick={() => handleSwitchMode('login')}
                                >
                                    Đăng nhập ngay
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            {/* HEADER ĐĂNG NHẬP */}
                            <div className="auth-header">
                                <div className="auth-pill-badge">
                                    <Flame size={13} />
                                    <span>Chào mừng trở lại</span>
                                </div>
                                <h1 className="auth-title">Đăng nhập EasyLearn</h1>
                                <p className="auth-subtitle">
                                    Tiếp tục hành trình học tập tương tác và tích lũy điểm thưởng.
                                </p>
                            </div>

                            {/* FORM ĐĂNG NHẬP */}
                            <form onSubmit={handleLogin} className="auth-form">
                                <div className="input-group">
                                    <label htmlFor="login-username">Tên đăng nhập</label>
                                    <div className="input-with-icon">
                                        <User size={18} className="input-lead-icon" />
                                        <input
                                            id="login-username"
                                            className="input-field"
                                            type="text"
                                            placeholder="Nhập tên tài khoản của bạn"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="login-password">Mật khẩu</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-lead-icon" />
                                        <input
                                            id="login-password"
                                            className="input-field"
                                            type={showLoginPassword ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="input-toggle-btn"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            tabIndex="-1"
                                            title={showLoginPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        >
                                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-footer-options">
                                    <Link to="/forgot-password" className="auth-link">
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <button type="submit" className="btn-auth-primary">
                                    <LogIn size={18} />
                                    <span>Đăng nhập</span>
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>hoặc thử nghiệm ngay</span>
                            </div>

                            <button 
                                type="button" 
                                onClick={handleGuestLogin} 
                                className="btn-guest-play"
                                title="Chơi game thử nghiệm ngay không cần lưu tài khoản"
                            >
                                <Gamepad2 size={19} />
                                <span>Chơi ngay (Chế độ Khách)</span>
                            </button>

                            <p className="auth-switch-prompt">
                                Chưa có tài khoản?
                                <button
                                    type="button"
                                    className="auth-switch-btn"
                                    onClick={() => handleSwitchMode('register')}
                                >
                                    Đăng ký miễn phí
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;