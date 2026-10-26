import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProfilePageLogic } from '../pages_logic/ProfilePageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/ProfilePageStyling.css';
import { 
    Sparkles, 
    Sun, 
    Moon, 
    LogOut, 
    Camera, 
    Trash2, 
    User, 
    Mail, 
    Phone, 
    Lock, 
    KeyRound, 
    Eye, 
    EyeOff, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    ShieldCheck, 
    UserCheck,
    GraduationCap,
    Gamepad2,
    Info
} from 'lucide-react';

const ProfilePage = () => {
    const {
        currentUser,
        formData,
        setFormData,
        passwordData,
        setPasswordData,
        profileMessage,
        passwordMessage,
        isUpdatingProfile,
        isChangingPassword,
        schoolActionLabel,
        handleAvatarUpload,
        handleRemoveAvatar,
        handleUpdateProfile,
        handleChangePassword,
        handleLogout,
        navigate
    } = ProfilePageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    // Ẩn/Hiện mật khẩu
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const userInitial = (formData.displayName || currentUser?.username || 'U').charAt(0).toUpperCase();

    const getRoleName = (role) => {
        if (role === 'teacher') return 'Giáo viên';
        if (role === 'admin') return 'Quản trị viên';
        return 'Học sinh';
    };

    return (
        <div className="profile-wrapper">
            {/* 1. NAVBAR - ĐỒNG BỘ HOÀN TOÀN */}
            <header className="navbar">
                <div className="nav-container">
                    <div className="nav-left">
                        <div className="brand-logo" onClick={() => navigate('/')}>
                            <div className="brand-coin">
                                <Sparkles size={18} />
                            </div>
                            <span className="brand-name">EasyLearn</span>
                        </div>

                        <nav className="nav-links">
                            <Link to="/" className="nav-link">Trang chủ</Link>
                            <Link to="/library" className="nav-link">Thư viện</Link>
                            <Link to="/leaderboard" className="nav-link">Bảng xếp hạng</Link>
                            <Link to="/schools" className="nav-link">Trường học</Link>
                            <Link to="/studio" className="nav-link">Studio</Link>
                        </nav>
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

                        {currentUser && (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Avatar" className="user-avatar-img-nav" />
                                        ) : (
                                            currentUser.username.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                    <span>{formData.displayName || currentUser.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    {currentUser.role === 'teacher' ? (
                                        <>
                                            <Link to="/teacher/dashboard">Bảng điều khiển giáo viên</Link>
                                            <Link to="/schools">{schoolActionLabel}</Link>
                                            <Link to="/studio">Studio tạo bộ đề</Link>
                                        </>
                                    ) : (
                                        <>
                                            {currentUser.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
                                            <Link to="/schools">{schoolActionLabel}</Link>
                                            <Link to="/student/classes">Lớp học của tôi</Link>
                                            <Link to="/game">Chơi Game Quiz</Link>
                                        </>
                                    )}
                                    <Link to="/profile">Hồ sơ cá nhân</Link>
                                    <button type="button" onClick={handleLogout} className="logout-btn">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION */}
            <section className="profile-hero">
                <div className="profile-backdrop-glow"></div>
                <div className="profile-hero-content">
                    <div>
                        <div className="profile-pill-badge">
                            <ShieldCheck size={13} />
                            <span>Quản lý tài khoản</span>
                        </div>
                        <h1 className="profile-title">Hồ Sơ Cá Nhân</h1>
                        <p className="profile-subtitle">
                            Tùy chỉnh thông tin người dùng, ảnh đại diện và tăng cường bảo mật cho tài khoản của bạn.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. KHU VỰC CHÍNH (2 CỘT) */}
            <main className="profile-main-content">
                {/* CỘT TRÁI: AVATAR & THÀNH TÍCH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="profile-avatar-card">
                        <div className="avatar-preview-wrap">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Ảnh đại diện" className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar-default">
                                    {userInitial}
                                </div>
                            )}

                            <div className="avatar-badge-role" title={`Vai trò: ${getRoleName(currentUser?.role)}`}>
                                {currentUser?.role === 'teacher' ? (
                                    <GraduationCap size={15} />
                                ) : (
                                    <Gamepad2 size={15} />
                                )}
                            </div>
                        </div>

                        <div className="avatar-info-group">
                            <h3>{formData.displayName || currentUser?.username}</h3>
                            <span className="avatar-username-handle">@{currentUser?.username}</span>
                        </div>

                        <div className="avatar-actions-group">
                            <label className="btn-avatar-upload">
                                <Camera size={16} />
                                <span>Tải ảnh đại diện</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleAvatarUpload} 
                                    style={{ display: 'none' }} 
                                />
                            </label>

                            {formData.avatar && (
                                <button 
                                    type="button" 
                                    className="btn-avatar-remove"
                                    onClick={handleRemoveAvatar}
                                    title="Quay về dùng avatar chữ cái mặc định"
                                >
                                    <Trash2 size={14} />
                                    <span>Dùng avatar mặc định</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Thẻ Thống Kê Nhanh */}
                    <div className="profile-stats-card">
                        <div className="stat-row-item">
                            <span>🏆 Kỷ lục điểm số:</span>
                            <strong>{currentUser?.highScore || 0} XP</strong>
                        </div>
                        <div className="stat-row-item">
                            <span>🔖 Bộ đề đã lưu:</span>
                            <strong>{currentUser?.savedSets?.length || 0} bộ</strong>
                        </div>
                        <div className="stat-row-item">
                            <span>🛡️ Vai trò hệ thống:</span>
                            <strong>{getRoleName(currentUser?.role)}</strong>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: FORM CẬP NHẬT THÔNG TIN & ĐỔI MẬT KHẨU */}
                <div className="profile-details-column">
                    {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
                    <div className="profile-card-section">
                        <div className="section-head">
                            <div className="section-head-icon">
                                <UserCheck size={18} />
                            </div>
                            <h3>Thông Tin Cá Nhân</h3>
                        </div>

                        {profileMessage.text && (
                            <div className={`profile-alert-msg ${
                                profileMessage.type === 'success' ? 'msg-success' : 
                                profileMessage.type === 'error' ? 'msg-error' : 'msg-info'
                            }`}>
                                {profileMessage.type === 'success' ? <CheckCircle2 size={18} /> : 
                                 profileMessage.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
                                <span>{profileMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="profile-form-grid">
                                <div className="profile-field-group">
                                    <label htmlFor="p-username">Tên đăng nhập (Username)</label>
                                    <div className="field-input-wrap">
                                        <Lock size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-username"
                                            className="profile-input"
                                            type="text" 
                                            value={currentUser?.username || ''} 
                                            disabled 
                                        />
                                    </div>
                                </div>

                                <div className="profile-field-group">
                                    <label htmlFor="p-displayname">Tên hiển thị (Display Name)</label>
                                    <div className="field-input-wrap">
                                        <User size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-displayname"
                                            className="profile-input"
                                            type="text" 
                                            placeholder="Tên hiển thị trong game & BXH"
                                            value={formData.displayName} 
                                            onChange={(e) => setFormData({...formData, displayName: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="profile-field-group">
                                    <label htmlFor="p-fullname">Họ và tên</label>
                                    <div className="field-input-wrap">
                                        <User size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-fullname"
                                            className="profile-input"
                                            type="text" 
                                            placeholder="Ví dụ: Nguyễn Văn A"
                                            value={formData.fullName} 
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="profile-field-group">
                                    <label htmlFor="p-phone">Số điện thoại</label>
                                    <div className="field-input-wrap">
                                        <Phone size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-phone"
                                            className="profile-input"
                                            type="tel" 
                                            placeholder="Ví dụ: 0912345678"
                                            value={formData.phone} 
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                <div className="profile-field-group form-field-full">
                                    <label htmlFor="p-email">Địa chỉ Email</label>
                                    <div className="field-input-wrap">
                                        <Mail size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-email"
                                            className="profile-input"
                                            type="email" 
                                            placeholder="email@example.com"
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-profile-submit"
                                disabled={isUpdatingProfile}
                            >
                                <Save size={16} />
                                <span>{isUpdatingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
                            </button>
                        </form>
                    </div>

                    {/* KHỐI 2: ĐỔI MẬT KHẨU */}
                    <div className="profile-card-section">
                        <div className="section-head">
                            <div className="section-head-icon icon-gold-badge">
                                <KeyRound size={18} />
                            </div>
                            <h3>Đổi Mật Khẩu</h3>
                        </div>

                        {passwordMessage.text && (
                            <div className={`profile-alert-msg ${
                                passwordMessage.type === 'success' ? 'msg-success' : 'msg-error'
                            }`}>
                                {passwordMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span>{passwordMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div className="profile-field-group">
                                <label htmlFor="p-current-password">Mật khẩu hiện tại</label>
                                <div className="field-input-wrap">
                                    <Lock size={16} className="field-lead-icon" />
                                    <input 
                                        id="p-current-password"
                                        className="profile-input"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu bạn đang dùng"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className="btn-toggle-eye"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        tabIndex="-1"
                                    >
                                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="profile-form-grid">
                                <div className="profile-field-group">
                                    <label htmlFor="p-new-password">Mật khẩu mới</label>
                                    <div className="field-input-wrap">
                                        <Lock size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-new-password"
                                            className="profile-input"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            required 
                                        />
                                        <button 
                                            type="button" 
                                            className="btn-toggle-eye"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            tabIndex="-1"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-field-group">
                                    <label htmlFor="p-confirm-password">Xác nhận mật khẩu mới</label>
                                    <div className="field-input-wrap">
                                        <Lock size={16} className="field-lead-icon" />
                                        <input 
                                            id="p-confirm-password"
                                            className="profile-input"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            required 
                                        />
                                        <button 
                                            type="button" 
                                            className="btn-toggle-eye"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex="-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-profile-submit"
                                disabled={isChangingPassword}
                            >
                                <KeyRound size={16} />
                                <span>{isChangingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
