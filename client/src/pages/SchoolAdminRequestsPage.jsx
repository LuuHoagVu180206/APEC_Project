import React, { useState } from 'react';
import { 
    ArrowLeft, 
    Check, 
    X, 
    ShieldCheck, 
    ShieldAlert, 
    Building2, 
    Search, 
    Clock, 
    MapPin, 
    Mail, 
    Globe, 
    User, 
    FileText, 
    HelpCircle, 
    CheckCircle2, 
    SearchX, 
    AlertCircle, 
    Loader2, 
    ExternalLink,
    Sun,
    Moon
} from 'lucide-react';
import { SchoolAdminRequestsLogic } from '../pages_logic/SchoolAdminRequestsLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/SchoolAdminRequestsStyling.css';

const SchoolAdminRequestsPage = () => {
    const { requests, error, reviewRequest, navigate } = SchoolAdminRequestsLogic();
    const { isDark, toggleTheme } = useDarkMode();
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const handleReview = async (requestId, decision) => {
        const actionLabel = decision === 'approve' ? 'phê duyệt và kích hoạt' : 'từ chối';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionLabel} yêu cầu thành lập trường này?`)) {
            return;
        }
        setProcessingId(requestId);
        try {
            await reviewRequest(requestId, decision);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const filteredRequests = requests.filter((req) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (req.schoolName && req.schoolName.toLowerCase().includes(term)) ||
            (req.abbreviation && req.abbreviation.toLowerCase().includes(term)) ||
            (req.representativeName && req.representativeName.toLowerCase().includes(term)) ||
            (req.contactEmail && req.contactEmail.toLowerCase().includes(term)) ||
            (req.location && req.location.toLowerCase().includes(term)) ||
            (req.requestedBy?.fullName && req.requestedBy.fullName.toLowerCase().includes(term)) ||
            (req.requestedBy?.username && req.requestedBy.username.toLowerCase().includes(term))
        );
    });

    return (
        <main className="school-admin-req-root">
            <div className="school-admin-req-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="school-admin-req-top-nav">
                    <div className="school-admin-req-nav-left">
                        <button 
                            type="button"
                            className="school-admin-req-back-btn" 
                            onClick={() => navigate('/admin')}
                        >
                            <ArrowLeft size={16} /> Quản trị hệ thống
                        </button>
                        <div className="school-admin-req-admin-badge">
                            <ShieldCheck size={15} />
                            <span>Kiểm duyệt Quản trị viên</span>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className="school-admin-req-theme-btn" 
                        onClick={toggleTheme} 
                        title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"} 
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* HERO HEADER */}
                <header className="school-admin-req-hero">
                    <div className="school-admin-req-hero-info">
                        <div className="school-admin-req-hero-tag">
                            <ShieldAlert size={14} /> Kiểm duyệt School Community
                        </div>
                        <h1>Hồ Sơ Yêu Cầu Tạo Trường</h1>
                        <p className="school-admin-req-hero-desc">
                            Xem xét thông tin pháp nhân, người đại diện và mục tiêu kết nối trước khi phê duyệt hoặc từ chối tạo cộng đồng trường học.
                        </p>
                    </div>

                    <div className="school-admin-req-hud-pill">
                        <div className="school-admin-req-hud-num">{requests.length}</div>
                        <div className="school-admin-req-hud-lbl">Hồ sơ chờ duyệt</div>
                    </div>
                </header>

                {/* ERROR ALERT BANNER */}
                {error && (
                    <div className="school-admin-req-alert-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* CONTROLS & SEARCH BAR */}
                {requests.length > 0 && (
                    <div className="school-admin-req-controls">
                        <div className="school-admin-req-search-box">
                            <Search size={16} color="var(--sar-text-subtle)" />
                            <input 
                                type="text"
                                placeholder="Tìm theo tên trường, mã viết tắt, email hoặc người đại diện..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    className="school-admin-req-clear-btn"
                                    onClick={() => setSearchTerm('')}
                                    title="Xóa tìm kiếm"
                                    aria-label="Xóa tìm kiếm"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div className="school-admin-req-count-badge">
                            Hiển thị <strong>{filteredRequests.length}</strong> / {requests.length} hồ sơ
                        </div>
                    </div>
                )}

                {/* REQUESTS LIST OR EMPTY STATES */}
                {requests.length === 0 ? (
                    <div className="school-admin-req-empty">
                        <div className="school-admin-req-empty-icon">
                            <CheckCircle2 size={36} />
                        </div>
                        <h3>Tất cả hồ sơ đã được xử lý!</h3>
                        <p>
                            Hiện tại không có yêu cầu thành lập School Community nào đang chờ duyệt trong hệ thống.
                        </p>
                        <button 
                            type="button"
                            className="school-admin-req-btn school-admin-req-btn-ghost"
                            onClick={() => navigate('/admin/schools')}
                        >
                            <Building2 size={16} /> Xem các trường đang hoạt động
                        </button>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="school-admin-req-empty">
                        <div className="school-admin-req-empty-icon search-empty">
                            <SearchX size={36} />
                        </div>
                        <h3>Không tìm thấy hồ sơ phù hợp</h3>
                        <p>
                            Không có yêu cầu thành lập trường nào khớp với từ khóa "{searchTerm}".
                        </p>
                        <button 
                            type="button"
                            className="school-admin-req-btn school-admin-req-btn-ghost"
                            onClick={() => setSearchTerm('')}
                        >
                            <X size={16} /> Xóa bộ lọc tìm kiếm
                        </button>
                    </div>
                ) : (
                    <div className="school-admin-req-list">
                        {filteredRequests.map((request) => {
                            const isCurrentProcessing = processingId === request._id;
                            const submitterName = request.requestedBy?.fullName || request.requestedBy?.username || 'Không xác định';

                            return (
                                <article className="school-admin-req-card" key={request._id}>
                                    {/* CARD HEADER */}
                                    <div className="school-admin-req-card-header">
                                        <div className="school-admin-req-card-title-group">
                                            <div className="school-admin-req-abbr-badge">
                                                {request.abbreviation}
                                            </div>
                                            <div className="school-admin-req-card-titles">
                                                <h2>{request.schoolName}</h2>
                                                {request.location ? (
                                                    <div className="school-admin-req-card-location">
                                                        <MapPin size={13} /> {request.location}
                                                    </div>
                                                ) : (
                                                    <div className="school-admin-req-card-location" style={{ opacity: 0.6 }}>
                                                        <MapPin size={13} /> Chưa cung cấp địa điểm
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="school-admin-req-card-date">
                                            <Clock size={13} /> Gửi lúc: {formatDate(request.createdAt)}
                                        </div>
                                    </div>

                                    {/* CARD BODY */}
                                    <div className="school-admin-req-card-body">
                                        {/* PANEL 1: ĐẠI DIỆN & LIÊN HỆ */}
                                        <div className="school-admin-req-info-panel">
                                            <div className="school-admin-req-info-heading">
                                                <User size={15} /> Người Đại Diện & Liên Hệ
                                            </div>

                                            <div className="school-admin-req-info-row">
                                                <span className="school-admin-req-info-label">Đại diện pháp lý / Nhà trường</span>
                                                <span className="school-admin-req-info-value">
                                                    {request.representativeName} · <strong style={{ color: 'var(--sar-gold-hover)' }}>{request.representativeRole}</strong>
                                                </span>
                                            </div>

                                            <div className="school-admin-req-info-row">
                                                <span className="school-admin-req-info-label">Tài khoản gửi đơn</span>
                                                <span className="school-admin-req-info-value">
                                                    {submitterName}
                                                </span>
                                            </div>

                                            <div className="school-admin-req-info-row">
                                                <span className="school-admin-req-info-label">Email liên hệ chính thức</span>
                                                <a 
                                                    className="school-admin-req-info-link" 
                                                    href={`mailto:${request.contactEmail}`}
                                                >
                                                    <Mail size={13} /> {request.contactEmail}
                                                </a>
                                            </div>

                                            {request.website && (
                                                <div className="school-admin-req-info-row">
                                                    <span className="school-admin-req-info-label">Website / Cổng thông tin</span>
                                                    <a 
                                                        className="school-admin-req-info-link" 
                                                        href={request.website.startsWith('http') ? request.website : `https://${request.website}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                    >
                                                        <Globe size={13} /> {request.website} <ExternalLink size={12} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* PANEL 2: MÔ TẢ & MỤC TIÊU */}
                                        <div className="school-admin-req-info-panel">
                                            <div className="school-admin-req-info-heading purpose-heading">
                                                <FileText size={15} /> Giới Thiệu & Mục Đích Thành Lập
                                            </div>

                                            <div className="school-admin-req-info-row">
                                                <span className="school-admin-req-info-label">Mô tả trường học</span>
                                                <div className="school-admin-req-text-box">
                                                    {request.description || 'Không có thông tin mô tả chi tiết.'}
                                                </div>
                                            </div>

                                            <div className="school-admin-req-info-row" style={{ marginTop: '4px' }}>
                                                <span className="school-admin-req-info-label">
                                                    <HelpCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                    Lý do & mục tiêu xây dựng cộng đồng
                                                </span>
                                                <div className="school-admin-req-text-box purpose-box">
                                                    {request.reason || 'Không cung cấp lý do chi tiết.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CARD FOOTER ACTIONS */}
                                    <div className="school-admin-req-card-footer">
                                        <div className="school-admin-req-review-note">
                                            💡 Phê duyệt sẽ tự động kích hoạt School Community và phân quyền <strong>Quản trị viên cộng đồng</strong> cho người nộp đơn.
                                        </div>

                                        <div className="school-admin-req-btn-group">
                                            <button 
                                                type="button"
                                                className="school-admin-req-btn school-admin-req-btn-reject"
                                                disabled={isCurrentProcessing || Boolean(processingId)}
                                                onClick={() => handleReview(request._id, 'reject')}
                                            >
                                                {isCurrentProcessing ? (
                                                    <>
                                                        <Loader2 size={16} className="school-admin-req-spinner" />
                                                        <span>Đang xử lý...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X size={16} />
                                                        <span>Từ chối</span>
                                                    </>
                                                )}
                                            </button>

                                            <button 
                                                type="button"
                                                className="school-admin-req-btn school-admin-req-btn-approve"
                                                disabled={isCurrentProcessing || Boolean(processingId)}
                                                onClick={() => handleReview(request._id, 'approve')}
                                            >
                                                {isCurrentProcessing ? (
                                                    <>
                                                        <Loader2 size={16} className="school-admin-req-spinner" />
                                                        <span>Đang xử lý...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check size={16} />
                                                        <span>Phê duyệt & Kích hoạt</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};

export default SchoolAdminRequestsPage;

