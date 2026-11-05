import React, { useState } from 'react';
import { ProfilePageLogic } from '../pages_logic/ProfilePageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/ProfilePageStyling.css';
import { 
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
    Info,
    X,
    History,
    Zap,
    Clock,
    HelpCircle,
    Calendar
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
        playHistory,
        handleAvatarUpload,
        handleRemoveAvatar,
        handleUpdateProfile,
        handleChangePassword
    } = ProfilePageLogic();

    // Ẩn/Hiện mật khẩu
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const userInitial = (formData.displayName || currentUser?.username || 'U').charAt(0).toUpperCase();

    const getRoleName = (role) => {
        if (role === 'teacher') return 'Giáo viên';
        if (role === 'admin') return 'Quản trị viên';
        return 'Học sinh';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '--';
        try {
            const d = new Date(dateStr);
            return d.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return String(dateStr);
        }
    };

    return (
        <div className="profile-wrapper">
            {/* 1. NAVBAR - UNIFIED NAVBAR */}
            <Navbar activePage="profile" />

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
                            <div className="avatar-name-badge-wrap">
                                <h3>{formData.displayName || currentUser?.username}</h3>
                                <div className="profile-status-pill">
                                    <span className="profile-status-dot"></span>
                                    <span>Trực tuyến</span>
                                </div>
                            </div>
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
                            <span>🏆 Kỷ lục cá nhân:</span>
                            <strong>{(currentUser?.highScore || 0).toLocaleString()} XP</strong>
                        </div>
                        <div className="stat-row-item">
                            <span>⚡ Điểm tuần này:</span>
                            <strong style={{ color: 'var(--accent-gold)' }}>{(currentUser?.weeklyScore || 0).toLocaleString()} XP</strong>
                        </div>
                        <div className="stat-row-item">
                            <span>🎮 Số màn đã chơi:</span>
                            <strong>{playHistory?.length || 0} trận</strong>
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

                {/* CỘT PHẢI: FORM CẬP NHẬT THÔNG TIN */}
                <div className="profile-details-column">
                    <div className="profile-card-section">
                        <div className="section-head" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="section-head-icon">
                                    <UserCheck size={18} />
                                </div>
                                <h3>Thông Tin Cá Nhân</h3>
                            </div>
                            <button 
                                type="button" 
                                className="btn-open-password-sub"
                                onClick={() => setIsPasswordModalOpen(true)}
                                title="Mở bảng đổi mật khẩu"
                            >
                                <KeyRound size={15} />
                                <span>Đổi mật khẩu</span>
                            </button>
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
                                            placeholder={currentUser?.username || "Tên hiển thị trong game & BXH"}
                                            value={formData.displayName} 
                                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleUpdateProfile(e);
                                                }
                                            }}
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

                            <div className="profile-form-actions-row">
                                <button 
                                    type="submit" 
                                    className="btn-profile-submit"
                                    disabled={isUpdatingProfile}
                                >
                                    <Save size={16} />
                                    <span>{isUpdatingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
                                </button>

                                <button 
                                    type="button" 
                                    className="btn-profile-secondary-action"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    <KeyRound size={16} />
                                    <span>Đổi Mật Khẩu</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* KHU VỰC: LỊCH SỬ MÀN CHƠI CÁ NHÂN (CHẾ ĐỘ SOLO) */}
                    <div className="profile-card-section profile-history-section">
                        <div className="section-head" style={{ justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="section-head-icon icon-history-badge">
                                    <History size={18} />
                                </div>
                                <div>
                                    <h3>Lịch Sử Màn Chơi Cá Nhân</h3>
                                    <span className="section-sub-desc">Ghi nhận các màn chơi đơn, thử thách tuần, chơi tự do và lớp học đã lưu</span>
                                </div>
                            </div>
                            <div className="history-count-badge">
                                <span>{playHistory?.length || 0} trận</span>
                            </div>
                        </div>

                        {playHistory && playHistory.length > 0 ? (
                            <div className="profile-history-table-wrap">
                                <table className="profile-history-table">
                                    <thead>
                                        <tr>
                                            <th>Bộ Câu Hỏi</th>
                                            <th>Chế Độ</th>
                                            <th>Tổng Điểm</th>
                                            <th>Thời Gian</th>
                                            <th>Câu Hỏi</th>
                                            <th>Thời Gian Chơi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {playHistory.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="history-title-cell">
                                                    <strong>{item.setTitle || 'Màn Chơi Solo'}</strong>
                                                </td>
                                                <td>
                                                    {item.mode === 'classroom' ? (
                                                        <span className="badge-tag-classroom">
                                                            <GraduationCap size={12} /> Phòng Lớp Học
                                                        </span>
                                                    ) : item.isWeekly ? (
                                                        <span className="badge-tag-weekly">
                                                            <Zap size={12} /> Thử Thách Tuần
                                                        </span>
                                                    ) : (
                                                        <span className="badge-tag-solo">
                                                            <Gamepad2 size={12} /> {item.mode === 'casual' ? 'Chơi Tự Do' : 'Chơi Đơn'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="history-score-cell">
                                                    <strong>+{(item.score || 0).toLocaleString()}</strong> XP
                                                </td>
                                                <td className="history-time-cell">
                                                    <Clock size={13} />
                                                    <span>{item.timePlayed != null ? `${Number(item.timePlayed).toFixed(1)}s` : '--'}</span>
                                                </td>
                                                <td className="history-questions-cell">
                                                    <HelpCircle size={13} />
                                                    <span>{item.questionsAnswered != null ? `${item.questionsAnswered} câu` : '--'}</span>
                                                </td>
                                                <td className="history-date-cell">
                                                    <Calendar size={13} />
                                                    <span>{formatDate(item.playedAt)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="profile-history-empty">
                                <Gamepad2 size={38} className="empty-history-icon" />
                                <h4>Chưa có lịch sử màn chơi nào</h4>
                                <p>Hãy chọn một bộ câu hỏi hoặc tham gia Thử Thách Tuần để ghi nhận thành tích cá nhân của bạn!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* 4. UI PHỤ: MODAL ĐỔI MẬT KHẨU */}
            {isPasswordModalOpen && (
                <div className="profile-modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
                    <div className="profile-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="section-head-icon icon-gold-badge">
                                    <KeyRound size={18} />
                                </div>
                                <h3>Đổi Mật Khẩu</h3>
                            </div>
                            <button 
                                type="button" 
                                className="profile-modal-close-btn"
                                onClick={() => setIsPasswordModalOpen(false)}
                                aria-label="Đóng"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {passwordMessage.text && (
                            <div className={`profile-alert-msg ${
                                passwordMessage.type === 'success' ? 'msg-success' : 'msg-error'
                            }`} style={{ margin: '18px 24px 0' }}>
                                {passwordMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <span>{passwordMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="profile-modal-form">
                            <div className="profile-field-group">
                                <label htmlFor="p-modal-current-password">Mật khẩu hiện tại</label>
                                <div className="field-input-wrap">
                                    <Lock size={16} className="field-lead-icon" />
                                    <input 
                                        id="p-modal-current-password"
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

                            <div className="profile-field-group">
                                <label htmlFor="p-modal-new-password">Mật khẩu mới</label>
                                <div className="field-input-wrap">
                                    <Lock size={16} className="field-lead-icon" />
                                    <input 
                                        id="p-modal-new-password"
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
                                <label htmlFor="p-modal-confirm-password">Xác nhận mật khẩu mới</label>
                                <div className="field-input-wrap">
                                    <Lock size={16} className="field-lead-icon" />
                                    <input 
                                        id="p-modal-confirm-password"
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

                            <div className="profile-modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-profile-cancel"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-profile-submit-password"
                                    disabled={isChangingPassword}
                                >
                                    <KeyRound size={16} />
                                    <span>{isChangingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
