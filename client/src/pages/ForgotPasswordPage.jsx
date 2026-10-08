import React from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordPageLogic } from '../pages_logic/ForgotPasswordPageLogic';
import '../pages_styling/AuthPageStyling.css';

const ForgotPasswordPage = () => {
    const {
        step, email, setEmail, otp, setOtp, password, setPassword,
        confirmPassword, setConfirmPassword, error, notice, isSubmitting,
        handleSendOTP, handleVerifyOTP, handleResendOTP, handleResetPassword
    } = ForgotPasswordPageLogic();

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {step === 1 && (
                    <>
                        <h1 className="auth-title">Quên mật khẩu</h1>
                        <form className="auth-form" onSubmit={handleSendOTP}>
                            {error && <div className="error-message" role="alert">{error}</div>}
                            <div className="input-group">
                                <label htmlFor="reset-email">Email tài khoản</label>
                                <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
                            </div>
                            <button className="btn-primary auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : 'Gửi OTP'}</button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h1 className="auth-title">Xác minh OTP</h1>
                        {notice && <p className="auth-notice">{notice}</p>}
                        {error && <div className="error-message" role="alert">{error}</div>}
                        <form className="auth-form" onSubmit={handleVerifyOTP}>
                            <div className="input-group">
                                <label htmlFor="reset-otp">Mã OTP 6 chữ số</label>
                                <input id="reset-otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" />
                            </div>
                            <button className="btn-primary auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Đang xác minh...' : 'Xác minh OTP'}</button>
                        </form>
                        <button className="auth-text-button" type="button" onClick={handleResendOTP} disabled={isSubmitting}>Gửi lại OTP</button>
                    </>
                )}

                {step === 3 && (
                    <>
                        <h1 className="auth-title">Tạo mật khẩu mới</h1>
                        {error && <div className="error-message" role="alert">{error}</div>}
                        <form className="auth-form" onSubmit={handleResetPassword}>
                            <div className="input-group">
                                <label htmlFor="new-password">Mật khẩu mới</label>
                                <input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ít nhất 6 ký tự" />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirm-new-password">Xác nhận mật khẩu</label>
                                <input id="confirm-new-password" type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu mới" />
                            </div>
                            <button className="btn-primary auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}</button>
                        </form>
                    </>
                )}

                {step === 4 && (
                    <>
                        <h1 className="auth-title">Đổi mật khẩu thành công</h1>
                        <p className="auth-notice">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
                        <Link className="btn-primary auth-submit auth-login-link" to="/login">Đến trang đăng nhập</Link>
                    </>
                )}

                {step !== 4 && <p className="auth-footer"><Link to="/login">Quay lại đăng nhập</Link></p>}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;