import React from 'react';
import { 
    ArrowLeft, 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    X, 
    Building2, 
    ShieldCheck, 
    ShieldAlert, 
    Users, 
    GraduationCap, 
    ExternalLink, 
    SearchX, 
    AlertCircle, 
    Loader2, 
    MapPin, 
    Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminSchoolsPageLogic } from '../pages_logic/AdminSchoolsPageLogic';
import '../pages_styling/AdminSchoolsStyling.css';

const AdminSchoolsPage = () => {
    const {
        schools, search, page, pagination, isLoading, error, setPage, handleSearchChange, navigate
    } = AdminSchoolsPageLogic();

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <main className="admin-schools-root">
            <div className="admin-schools-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="admin-schools-top-nav">
                    <div className="admin-schools-nav-left">
                        <button 
                            type="button"
                            className="admin-schools-back-btn" 
                            onClick={() => navigate('/admin')}
                        >
                            <ArrowLeft size={16} /> Quản trị hệ thống
                        </button>
                        <div className="admin-schools-admin-badge">
                            <ShieldCheck size={15} />
                            <span>Quản lý School Communities</span>
                        </div>
                    </div>

                    <div className="admin-schools-nav-right">
                        <button 
                            type="button"
                            className="admin-schools-req-link"
                            onClick={() => navigate('/school-requests/admin')}
                        >
                            <ShieldAlert size={15} /> Yêu cầu duyệt trường
                        </button>
                    </div>
                </div>

                {/* HERO HEADER */}
                <header className="admin-schools-hero">
                    <div className="admin-schools-hero-info">
                        <div className="admin-schools-hero-tag">
                            <Building2 size={14} /> Không gian trường học
                        </div>
                        <h1>School Communities</h1>
                        <p className="admin-schools-hero-desc">
                            Tổng hợp và quản lý toàn bộ các không gian trường học chính thức, kiểm tra sĩ số, người đại diện và truy cập dashboard chi tiết.
                        </p>
                    </div>

                    <div className="admin-schools-hud-pill">
                        <div className="admin-schools-hud-num">{pagination.totalItems.toLocaleString()}</div>
                        <div className="admin-schools-hud-lbl">Trường hoạt động</div>
                    </div>
                </header>

                {/* ERROR ALERT */}
                {error && (
                    <div className="admin-schools-alert-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* CONTROLS & SEARCH BAR */}
                <div className="admin-schools-controls">
                    <form 
                        className="admin-schools-search-box" 
                        onSubmit={(event) => event.preventDefault()} 
                        role="search"
                    >
                        <Search size={16} color="var(--as-text-subtle)" />
                        <input
                            aria-label="Tìm trường học"
                            value={search}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            placeholder="Tìm kiếm theo tên trường học hoặc tên viết tắt (vd: PTNK, AMS)..."
                        />
                        {search && (
                            <button 
                                type="button" 
                                className="admin-schools-clear-btn" 
                                aria-label="Xóa tìm kiếm" 
                                onClick={() => handleSearchChange('')}
                            >
                                <X size={15} />
                            </button>
                        )}
                    </form>

                    <div className="admin-schools-summary">
                        {isLoading && (
                            <span className="admin-schools-loading-pill">
                                <Loader2 size={13} className="admin-schools-spinner" /> Đang cập nhật...
                            </span>
                        )}
                        <span>
                            Tổng: <strong>{pagination.totalItems.toLocaleString()}</strong> trường
                        </span>
                        <span>
                            Trang <strong>{pagination.totalPages ? page : 0}</strong> / {pagination.totalPages || 0}
                        </span>
                    </div>
                </div>

                {/* TABLE CONTAINER CARD */}
                <div className="admin-schools-table-card">
                    <div className="admin-schools-table-wrap" aria-busy={isLoading}>
                        <table className="admin-schools-table">
                            <thead>
                                <tr>
                                    <th>Trường học</th>
                                    <th>Đại diện / Quản lý</th>
                                    <th>Học sinh</th>
                                    <th>Giáo viên</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.map((school) => {
                                    const managerName = school.manager?.name || school.representativeName || 'Chưa cập nhật';
                                    const managerSub = school.manager?.username ? `@${school.manager.username}` : (school.contactEmail || '');

                                    return (
                                        <tr key={school._id}>
                                            <td>
                                                <div className="admin-schools-school-cell">
                                                    <div className="admin-schools-abbr-badge">
                                                        {school.abbreviation}
                                                    </div>
                                                    <div className="admin-schools-school-info">
                                                        <span className="admin-schools-school-name">
                                                            {school.name}
                                                        </span>
                                                        <span className="admin-schools-school-sub">
                                                            {school.location ? (
                                                                <>
                                                                    <MapPin size={11} /> {school.location} · 
                                                                </>
                                                            ) : null}
                                                            Mã: #{school._id.slice(-6)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="admin-schools-manager-cell">
                                                    <span className="admin-schools-manager-name">{managerName}</span>
                                                    {managerSub && (
                                                        <span className="admin-schools-manager-sub">{managerSub}</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <span className="admin-schools-stat-badge">
                                                    <Users size={13} color="var(--as-emerald)" />
                                                    {school.studentCount.toLocaleString()}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="admin-schools-stat-badge">
                                                    <GraduationCap size={13} color="var(--as-gold)" />
                                                    {school.teacherCount.toLocaleString()}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="admin-schools-status-badge">
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                                                    Hoạt động
                                                </span>
                                            </td>

                                            <td>
                                                <span className="admin-schools-date">
                                                    <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle', opacity: 0.7 }} />
                                                    {formatDate(school.createdAt)}
                                                </span>
                                            </td>

                                            <td style={{ textAlign: 'right' }}>
                                                <Link 
                                                    className="admin-schools-action-btn" 
                                                    to={`/admin/schools/${school._id}`}
                                                >
                                                    <span>Dashboard</span>
                                                    <ExternalLink size={13} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!isLoading && !error && schools.length === 0 && (
                                    <tr>
                                        <td className="admin-schools-empty-row" colSpan="7">
                                            <div className="admin-schools-empty-content">
                                                <div className="admin-schools-empty-icon">
                                                    {search ? <SearchX size={32} /> : <Building2 size={32} />}
                                                </div>
                                                <h4>{search ? 'Không tìm thấy trường phù hợp' : 'Chưa có School Community nào'}</h4>
                                                <p>
                                                    {search 
                                                        ? `Không có trường học nào khớp với từ khóa "${search}". Vui lòng thử lại.` 
                                                        : 'Hiện tại hệ thống chưa có cộng đồng trường học nào được kích hoạt.'}
                                                </p>
                                                {search && (
                                                    <button 
                                                        type="button"
                                                        className="admin-schools-page-btn" 
                                                        style={{ marginTop: 8 }}
                                                        onClick={() => handleSearchChange('')}
                                                    >
                                                        <X size={15} /> Xóa tìm kiếm
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {isLoading && schools.length === 0 && (
                                    <tr>
                                        <td className="admin-schools-empty-row" colSpan="7">
                                            <div className="admin-schools-empty-content">
                                                <Loader2 size={36} className="admin-schools-spinner" color="var(--as-cyan)" />
                                                <p style={{ marginTop: 8 }}>Đang tải danh sách School Community...</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINATION CONTROLS */}
                <nav className="admin-schools-pagination" aria-label="School pagination">
                    <div className="admin-schools-page-info">
                        {pagination.totalItems === 0 ? (
                            '0 kết quả'
                        ) : (
                            <>
                                Hiển thị <strong>{(page - 1) * pagination.limit + 1}</strong>–<strong>{Math.min(page * pagination.limit, pagination.totalItems)}</strong> trong tổng số <strong>{pagination.totalItems.toLocaleString()}</strong> trường
                            </>
                        )}
                    </div>

                    <div className="admin-schools-page-btns">
                        <button 
                            type="button"
                            className="admin-schools-page-btn" 
                            disabled={isLoading || page <= 1} 
                            onClick={() => setPage((current) => current - 1)}
                        >
                            <ChevronLeft size={16} /> Trước
                        </button>
                        <button 
                            type="button"
                            className="admin-schools-page-btn" 
                            disabled={isLoading || page >= pagination.totalPages} 
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Sau <ChevronRight size={16} />
                        </button>
                    </div>
                </nav>
            </div>
        </main>
    );
};

export default AdminSchoolsPage;
