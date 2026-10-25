import React from 'react';
import { 
    ArrowLeft, 
    BookOpen, 
    Megaphone, 
    School, 
    Users, 
    GraduationCap, 
    Building2, 
    ShieldCheck, 
    Mail, 
    Globe, 
    ExternalLink, 
    Clock, 
    AlertCircle, 
    Loader2,
    Sun,
    Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminSchoolDetailPageLogic } from '../pages_logic/AdminSchoolDetailPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/AdminSchoolDetailStyling.css';

const AdminSchoolDetailPage = () => {
    const { dashboard, isLoading, error, navigate } = AdminSchoolDetailPageLogic();
    const { isDark, toggleTheme } = useDarkMode();

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
            });
        } catch {
            return dateString;
        }
    };

    const formatGlobalRole = (role) => {
        if (role === 'teacher') return 'Giáo viên';
        if (role === 'admin') return 'Quản trị hệ thống';
        return 'Học sinh';
    };

    const formatCommunityRole = (role) => {
        if (role === 'community_manager') return 'Quản trị trường';
        return 'Thành viên';
    };

    if (isLoading) {
        return (
            <main className="admin-school-detail-root">
                <div className="admin-school-detail-inner">
                    <div className="admin-sd-loading-box">
                        <Loader2 size={38} className="admin-sd-spinner" color="var(--asd-cyan)" />
                        <h3 style={{ color: 'var(--asd-text)', margin: 0, fontSize: '18px', fontWeight: 800 }}>
                            Đang tải thông tin School Community...
                        </h3>
                        <p style={{ color: 'var(--asd-text-muted)', margin: 0, fontSize: '13.5px' }}>
                            Vui lòng đợi trong giây lát khi hệ thống trích xuất dữ liệu trường học.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (!dashboard) {
        return (
            <main className="admin-school-detail-root">
                <div className="admin-school-detail-inner">
                    <div className="admin-sd-alert-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error || 'Không tìm thấy thông tin School Community này.'}</span>
                    </div>
                    <button 
                        type="button"
                        className="admin-sd-back-btn" 
                        onClick={() => navigate('/admin/schools')}
                    >
                        <ArrowLeft size={16} /> Quay lại danh sách trường
                    </button>
                </div>
            </main>
        );
    }

    const { school, stats, manager, members, announcements, sharedQuestionSets, classes } = dashboard;

    return (
        <main className="admin-school-detail-root">
            <div className="admin-school-detail-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="admin-sd-top-nav">
                    <div className="admin-sd-nav-left">
                        <button 
                            type="button"
                            className="admin-sd-back-btn" 
                            onClick={() => navigate('/admin/schools')}
                        >
                            <ArrowLeft size={16} /> School Communities
                        </button>
                        <div className="admin-sd-badge-portal">
                            <ShieldCheck size={15} />
                            <span>Bảng điều khiển Quản trị viên</span>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className="admin-sd-theme-btn" 
                        onClick={toggleTheme} 
                        title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"} 
                        aria-label="Toggle Theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                {/* HERO HEADER */}
                <header className="admin-sd-hero">
                    <div className="admin-sd-hero-info">
                        <div className="admin-sd-hero-tag">
                            <Building2 size={14} /> 
                            <span>{school.abbreviation}{school.location ? ` · ${school.location}` : ''}</span>
                        </div>
                        <h1>{school.name}</h1>
                        <p className="admin-sd-hero-desc">
                            {school.description || 'Không gian kết nối, giảng dạy và học tập chính thức của trường.'}
                        </p>
                    </div>

                    <div className="admin-sd-status-badge">
                        <span className="admin-sd-status-dot" />
                        <span>Đang hoạt động</span>
                    </div>
                </header>

                {/* CONTACT & ADMINISTRATION PANEL */}
                <section className="admin-sd-meta-card" aria-label="Thông tin liên hệ & quản lý trường">
                    <div className="admin-sd-meta-item">
                        <span className="admin-sd-meta-lbl">
                            <Users size={13} /> Đại diện nhà trường
                        </span>
                        <span className="admin-sd-meta-val">
                            {school.representativeName} · <strong style={{ color: 'var(--asd-gold-hover)' }}>{school.representativeRole}</strong>
                        </span>
                    </div>

                    <div className="admin-sd-meta-item">
                        <span className="admin-sd-meta-lbl">
                            <ShieldCheck size={13} /> Quản trị viên cộng đồng
                        </span>
                        <span className="admin-sd-meta-val">
                            {manager?.fullName || manager?.username ? (
                                <>
                                    {manager.fullName || manager.username}
                                    {manager.username && <span style={{ opacity: 0.7, fontWeight: 500 }}> (@{manager.username})</span>}
                                </>
                            ) : (
                                <span style={{ opacity: 0.6 }}>Chưa phân công</span>
                            )}
                        </span>
                    </div>

                    <div className="admin-sd-meta-item">
                        <span className="admin-sd-meta-lbl">
                            <Mail size={13} /> Email liên hệ chính thức
                        </span>
                        <a 
                            className="admin-sd-meta-link" 
                            href={`mailto:${school.contactEmail}`}
                        >
                            <Mail size={13} /> {school.contactEmail}
                        </a>
                    </div>

                    {school.website && (
                        <div className="admin-sd-meta-item">
                            <span className="admin-sd-meta-lbl">
                                <Globe size={13} /> Website / Cổng thông tin
                            </span>
                            <a 
                                className="admin-sd-meta-link" 
                                href={school.website.startsWith('http') ? school.website : `https://${school.website}`} 
                                target="_blank" 
                                rel="noreferrer"
                            >
                                <Globe size={13} /> {school.website} <ExternalLink size={12} />
                            </a>
                        </div>
                    )}
                </section>

                {/* STATS HUD GRID */}
                <section className="admin-sd-stats-grid" aria-label="Thống kê số lượng">
                    <div className="admin-sd-stat-card">
                        <div className="admin-sd-stat-icon stat-icon-blue">
                            <Users size={24} />
                        </div>
                        <div className="admin-sd-stat-info">
                            <strong>{stats.members.toLocaleString()}</strong>
                            <span>Tổng thành viên</span>
                        </div>
                    </div>

                    <div className="admin-sd-stat-card">
                        <div className="admin-sd-stat-icon stat-icon-gold">
                            <GraduationCap size={24} />
                        </div>
                        <div className="admin-sd-stat-info">
                            <strong>{stats.teachers.toLocaleString()}</strong>
                            <span>Giáo viên</span>
                        </div>
                    </div>

                    <div className="admin-sd-stat-card">
                        <div className="admin-sd-stat-icon stat-icon-emerald">
                            <Users size={24} />
                        </div>
                        <div className="admin-sd-stat-info">
                            <strong>{stats.students.toLocaleString()}</strong>
                            <span>Học sinh</span>
                        </div>
                    </div>

                    <div className="admin-sd-stat-card">
                        <div className="admin-sd-stat-icon stat-icon-purple">
                            <School size={24} />
                        </div>
                        <div className="admin-sd-stat-info">
                            <strong>{stats.classes.toLocaleString()}</strong>
                            <span>Lớp học</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 1: ANNOUNCEMENTS */}
                <section className="admin-sd-section">
                    <div className="admin-sd-section-header">
                        <div>
                            <div className="admin-sd-section-tag">
                                <Megaphone size={14} /> Bảng Tin Trường
                            </div>
                            <h2>
                                Announcements & Thông Báo 
                                <span className="admin-sd-badge-count">{announcements.length}</span>
                            </h2>
                        </div>
                    </div>

                    {announcements.length === 0 ? (
                        <div className="admin-sd-empty">
                            <Megaphone size={28} color="var(--asd-text-subtle)" style={{ marginBottom: 8 }} />
                            <span>Chưa có thông báo (announcement) nào được đăng tải trong trường.</span>
                        </div>
                    ) : (
                        <div className="admin-sd-items-list">
                            {announcements.map((post) => {
                                const authorName = post.author?.fullName || post.author?.username || 'Quản trị viên';
                                const initial = authorName.charAt(0).toUpperCase();

                                return (
                                    <article className="admin-sd-post-card" key={post._id}>
                                        <div className="admin-sd-post-header">
                                            <div className="admin-sd-post-author">
                                                <div className="admin-sd-post-avatar">
                                                    {initial}
                                                </div>
                                                <strong>{authorName}</strong>
                                            </div>
                                            <div className="admin-sd-post-time">
                                                <Clock size={12} />
                                                <span>{formatDate(post.createdAt, true)}</span>
                                            </div>
                                        </div>
                                        <p className="admin-sd-post-content">{post.content}</p>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* SECTION 2: SHARED QUESTION SETS */}
                <section className="admin-sd-section">
                    <div className="admin-sd-section-header">
                        <div>
                            <div className="admin-sd-section-tag" style={{ color: 'var(--asd-gold)' }}>
                                <BookOpen size={14} /> Tài Nguyên Học Tập
                            </div>
                            <h2>
                                Bộ Đề Câu Hỏi Chia Sẻ 
                                <span className="admin-sd-badge-count">{sharedQuestionSets.length}</span>
                            </h2>
                        </div>
                    </div>

                    {sharedQuestionSets.length === 0 ? (
                        <div className="admin-sd-empty">
                            <BookOpen size={28} color="var(--asd-text-subtle)" style={{ marginBottom: 8 }} />
                            <span>Chưa có bộ câu hỏi nào được chia sẻ vào cộng đồng trường.</span>
                        </div>
                    ) : (
                        <div className="admin-sd-items-list">
                            {sharedQuestionSets.filter((entry) => entry.questionSet).map((entry) => (
                                <article className="admin-sd-item-row" key={entry.questionSet._id}>
                                    <div className="admin-sd-item-main">
                                        <div 
                                            className="admin-sd-item-icon" 
                                            style={{ 
                                                background: 'rgba(245, 158, 11, 0.15)', 
                                                borderColor: 'rgba(245, 158, 11, 0.35)', 
                                                color: 'var(--asd-gold-hover)' 
                                            }}
                                        >
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="admin-sd-item-text">
                                            <strong>{entry.questionSet.title}</strong>
                                            <small>
                                                {entry.questionSet.description || 'Bộ đề câu hỏi chia sẻ nội bộ trường'}
                                                {entry.questionSet.owner?.username ? ` · Đăng bởi @${entry.questionSet.owner.username}` : ''}
                                            </small>
                                        </div>
                                    </div>
                                    <Link 
                                        className="admin-sd-btn admin-sd-btn-ghost" 
                                        to={`/set/${entry.questionSet._id}`}
                                    >
                                        <span>Xem đề thi</span>
                                        <ExternalLink size={13} />
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION 3: CLASSES */}
                <section className="admin-sd-section">
                    <div className="admin-sd-section-header">
                        <div>
                            <div className="admin-sd-section-tag" style={{ color: 'var(--asd-purple)' }}>
                                <School size={14} /> Không Gian Học Tập
                            </div>
                            <h2>
                                Lớp Học Trực Thuộc 
                                <span className="admin-sd-badge-count">{classes.length}</span>
                            </h2>
                        </div>
                    </div>

                    {classes.length === 0 ? (
                        <div className="admin-sd-empty">
                            <School size={28} color="var(--asd-text-subtle)" style={{ marginBottom: 8 }} />
                            <span>Chưa có lớp học nào trực thuộc trường.</span>
                        </div>
                    ) : (
                        <div className="admin-sd-items-list">
                            {classes.map((classItem) => (
                                <article className="admin-sd-item-row" key={classItem._id}>
                                    <div className="admin-sd-item-main">
                                        <div 
                                            className="admin-sd-item-icon" 
                                            style={{ 
                                                background: 'rgba(139, 92, 246, 0.15)', 
                                                borderColor: 'rgba(139, 92, 246, 0.35)', 
                                                color: 'var(--asd-purple-hover)' 
                                            }}
                                        >
                                            <School size={20} />
                                        </div>
                                        <div className="admin-sd-item-text">
                                            <strong>{classItem.className}</strong>
                                            <small>
                                                Mã: <strong style={{ color: 'var(--asd-gold-hover)' }}>{classItem.classCode}</strong> · {classItem.semester || 'Chưa ghi học kỳ'} · {classItem.studentCount} học sinh · {classItem.teacherCount} giáo viên · {classItem.questionSetCount} bộ đề
                                            </small>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION 4: MEMBERS */}
                <section className="admin-sd-section">
                    <div className="admin-sd-section-header">
                        <div>
                            <div className="admin-sd-section-tag" style={{ color: 'var(--asd-emerald)' }}>
                                <Users size={14} /> Danh Sách Thành Viên
                            </div>
                            <h2>
                                Thành Viên Mới Nhất 
                                <span className="admin-sd-badge-count">{members.length}</span>
                            </h2>
                        </div>
                    </div>

                    {members.length === 0 ? (
                        <div className="admin-sd-empty">
                            <Users size={28} color="var(--asd-text-subtle)" style={{ marginBottom: 8 }} />
                            <span>Chưa có thành viên nào tham gia trường.</span>
                        </div>
                    ) : (
                        <div className="admin-sd-members-grid">
                            {members.map((member) => {
                                const displayName = member.fullName || member.username || 'Thành viên';
                                const initial = displayName.charAt(0).toUpperCase();

                                return (
                                    <div className="admin-sd-member-card" key={member._id}>
                                        <div className="admin-sd-member-avatar">
                                            {initial}
                                        </div>
                                        <div className="admin-sd-member-info">
                                            <strong>{displayName}</strong>
                                            <div className="admin-sd-member-roles">
                                                <span 
                                                    className={`admin-sd-role-pill ${
                                                        member.communityRole === 'community_manager' ? 'admin-sd-role-manager' : 'admin-sd-role-user'
                                                    }`}
                                                >
                                                    {formatCommunityRole(member.communityRole)}
                                                </span>
                                                <span 
                                                    className={`admin-sd-role-pill ${
                                                        member.globalRole === 'teacher' ? 'admin-sd-role-teacher' : member.globalRole === 'admin' ? 'admin-sd-role-admin' : 'admin-sd-role-user'
                                                    }`}
                                                >
                                                    {formatGlobalRole(member.globalRole)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default AdminSchoolDetailPage;
