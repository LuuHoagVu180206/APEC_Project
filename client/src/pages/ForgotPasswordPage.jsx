import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForgotPasswordPageLogic } from '../pages_logic/ForgotPasswordPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/AuthPageStyling.css';
import { 
    Sun, 
    Moon, 
    Sparkles, 
    ArrowLeft, 
    Mail, 
    KeyRound, 
    Lock, 
    Eye, 
    EyeOff, 
    AlertCircle, 
    CheckCircle2, 
    ShieldCheck 
} from 'lucide-react';

const ForgotPasswordPage = () => {
    const {
        step, email, setEmail, otp, setOtp, password, setPassword,
        confirmPassword, setConfirmPassword, error, notice, isSubmitting,
        handleSendOTP, handleVerifyOTP, handleResendOTP, handleResetPassword
    } = ForgotPasswordPageLogic();

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

                        <Link to="/login" className="auth-nav-back">
                            <ArrowLeft size={16} />
                            <span>Đăng nhập</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 2. AUTH CARD KHÔI PHỤC MẬT KHẨU */}
            <div className="auth-wrapper">
                <div className="auth-backdrop-glow"></div>

                <div className="auth-card">
                    {/* BƯỚC 1, 2, 3 TIẾN TRÌNH */}
                    <div className="auth-step-indicator">
                        <span className={`auth-step-dot ${step >= 1 ? 'active' : ''}`} title="Bước 1: Nhập email"></span>
                        <span className={`auth-step-dot ${step >= 2 ? 'active' : ''}`} title="Bước 2: Xác minh OTP"></span>
                        <span className={`auth-step-dot ${step >= 3 ? 'active' : ''}`} title="Bước 3: Mật khẩu mới"></span>
                    </div>

                    {step === 1 && (
                        <>
                            <div className="auth-header">
                                <div className="auth-pill-badge">
                                    <ShieldCheck size={13} />
                                    <span>Bảo mật tài khoản</span>
                                </div>
                                <h1 className="auth-title">Quên mật khẩu?</h1>
                                <p className="auth-subtitle">
                                    Nhập địa chỉ email liên kết với tài khoản của bạn để nhận mã xác minh OTP.
                                </p>
                            </div>

                            {error && (
                                <div className="auth-alert-error" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleSendOTP}>
                                <div className="input-group">
                                    <label htmlFor="reset-email">Email tài khoản</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} className="input-lead-icon" />
                                        <input 
                                            id="reset-email" 
                                            className="input-field"
                                            type="email" 
                                            autoComplete="email" 
                                            required 
                                            value={email} 
                                            onChange={(event) => setEmail(event.target.value)} 
                                            placeholder="ví dụ: hocky@example.com" 
                                        />
                                    </div>
                                </div>
                                <button className="btn-auth-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang gửi mã...' : 'Gửi mã xác minh OTP'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="auth-header">
                                <div className="auth-pill-badge">
                                    <KeyRound size={13} />
                                    <span>Mã xác thực</span>
                                </div>
                                <h1 className="auth-title">Xác minh OTP</h1>
                                <p className="auth-subtitle">
                                    Mã xác nhận 6 chữ số đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.
                                </p>
                            </div>

                            {notice && <div className="auth-notice-box">{notice}</div>}
                            {error && (
                                <div className="auth-alert-error" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleVerifyOTP}>
                                <div className="input-group">
                                    <label htmlFor="reset-otp">Mã OTP (6 chữ số)</label>
                                    <div className="input-with-icon">
                                        <KeyRound size={18} className="input-lead-icon" />
                                        <input 
                                            id="reset-otp" 
                                            className="input-field"
                                            type="text" 
                                            inputMode="numeric" 
                                            autoComplete="one-time-code" 
                                            pattern="[0-9]{6}" 
                                            maxLength={6} 
                                            required 
                                            value={otp} 
                                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} 
                                            placeholder="••••••" 
                                            style={{ letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
                                        />
                                    </div>
                                </div>
                                <button className="btn-auth-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang kiểm tra...' : 'Xác minh OTP'}
                                </button>
                            </form>

                            <button className="auth-text-resend" type="button" onClick={handleResendOTP} disabled={isSubmitting}>
                                Không nhận được mã? Gửi lại OTP
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="auth-header">
                                <div className="auth-pill-badge">
                                    <Lock size={13} />
                                    <span>Bảo mật</span>
                                </div>
                                <h1 className="auth-title">Tạo mật khẩu mới</h1>
                                <p className="auth-subtitle">
                                    Nhập mật khẩu an toàn mới cho tài khoản của bạn.
                                </p>
                            </div>

                            {error && (
                                <div className="auth-alert-error" role="alert">
                                    <AlertCircle size={18} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="auth-form" onSubmit={handleResetPassword}>
                                <div className="input-group">
                                    <label htmlFor="new-password">Mật khẩu mới</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-lead-icon" />
                                        <input 
                                            id="new-password" 
                                            className="input-field"
                                            type={showPassword ? 'text' : 'password'} 
                                            autoComplete="new-password" 
                                            minLength={6} 
                                            required 
                                            value={password} 
                                            onChange={(event) => setPassword(event.target.value)} 
                                            placeholder="Tối thiểu 6 ký tự" 
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
                                    <label htmlFor="confirm-new-password">Xác nhận mật khẩu</label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-lead-icon" />
                                        <input 
                                            id="confirm-new-password" 
                                            className="input-field"
                                            type={showConfirmPassword ? 'text' : 'password'} 
                                            autoComplete="new-password" 
                                            minLength={6} 
                                            required 
                                            value={confirmPassword} 
                                            onChange={(event) => setConfirmPassword(event.target.value)} 
                                            placeholder="Nhập lại mật khẩu mới" 
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

                                <button className="btn-auth-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 4 && (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--accent-emerald-subtle)', color: 'var(--accent-emerald)', marginBottom: '16px' }}>
                                <CheckCircle2 size={42} />
                            </div>
                            <h1 className="auth-title">Đổi mật khẩu thành công!</h1>
                            <p className="auth-subtitle" style={{ marginBottom: '24px' }}>
                                Mật khẩu của bạn đã được cập nhật an toàn. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                            </p>
                            <Link className="btn-auth-primary" to="/login" style={{ textDecoration: 'none' }}>
                                Đến trang đăng nhập
                            </Link>
                        </div>
                    )}

                    {step !== 4 && (
                        <p className="auth-switch-prompt" style={{ marginTop: '24px' }}>
                            <Link to="/login" className="auth-link">
                                Quay lại đăng nhập
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
