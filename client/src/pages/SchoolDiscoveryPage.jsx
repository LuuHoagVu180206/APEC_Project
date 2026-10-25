import React from 'react';
import { 
    ArrowLeft, 
    MapPin, 
    Search, 
    School, 
    Building2, 
    Sparkles, 
    ChevronRight, 
    Plus, 
    Users, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    ShieldCheck 
} from 'lucide-react';
import { SchoolDiscoveryPageLogic } from '../pages_logic/SchoolDiscoveryPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/SchoolDiscoveryStyling.css';

const SchoolDiscoveryPage = () => {
    const {
        currentUser, schools, memberships, searchTerm, setSearchTerm, selectedSchool, setSelectedSchool,
        joinData, setJoinData, error, isLoading, isJoining, membershipIds, handleSearch, startJoin, handleJoin, navigate
    } = SchoolDiscoveryPageLogic();

    const isStudentAccount = ['user', 'admin'].includes(currentUser?.role);
    const roleLabel = currentUser?.role === 'user' ? 'Student' : currentUser?.role === 'teacher' ? 'Teacher' : 'Admin';

    return (
        <div className="school-discovery-page-wrapper">
            <Navbar activePage="schools" />
            <main className="school-disc-root">
            <div className="school-disc-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="school-disc-top-nav">
                    <button 
                        type="button"
                        className="school-disc-back-btn" 
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft size={16} /> Quay lại trang chủ
                    </button>
                    <button 
                        type="button"
                        className="school-disc-btn-propose" 
                        onClick={() => navigate('/school-requests/new')}
                    >
                        <Plus size={16} color="var(--sd-gold-hover)" />
                        <span>Đề xuất tạo trường mới</span>
                    </button>
                </div>

                {/* HERO HEADER */}
                <header className="school-disc-hero">
                    <div className="school-disc-hero-info">
                        <div className="school-disc-hero-tag">
                            <Building2 size={14} /> Không gian Cộng đồng Học đường
                        </div>
                        <h1>{memberships.length > 0 ? 'Cộng Đồng Trường Của Bạn' : 'Khám Phá School Community'}</h1>
                        <p className="school-disc-hero-sub">
                            Tìm kiếm cộng đồng trường học của bạn để kết nối với các thầy cô và bạn bè, cùng tham gia các lớp học và chia sẻ kho đề thi quiz mini-game.
                        </p>
                    </div>
                </header>

                {error && (
                    <div className="school-disc-alert-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* SECTION 1: MY SCHOOL MEMBERSHIPS (NẾU ĐÃ THAM GIA) */}
                {memberships.length > 0 && (
                    <section className="school-disc-section">
                        <div className="school-disc-section-header">
                            <div>
                                <div className="school-disc-section-tag">
                                    <Sparkles size={13} /> Membership đã tham gia
                                </div>
                                <h2>
                                    Trường của bạn
                                    <span className="school-disc-count-badge">{memberships.length}</span>
                                </h2>
                            </div>
                        </div>

                        <div className="school-disc-grid">
                            {memberships.map((membership) => (
                                <div
                                    className="school-disc-card school-disc-card-btn"
                                    key={membership._id}
                                    onClick={() => navigate(`/schools/${membership.school._id}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/schools/${membership.school._id}`)}
                                >
                                    <div className="school-disc-card-top">
                                        <div className="school-disc-card-icon">
                                            <School size={24} />
                                        </div>
                                        <span className="school-disc-badge-joined">
                                            <CheckCircle2 size={12} /> Thành viên
                                        </span>
                                    </div>

                                    <div className="school-disc-card-body">
                                        <h3>{membership.school.name}</h3>
                                        <div className="school-disc-card-meta">
                                            <span>Mã: <strong style={{ color: 'var(--sd-cyan-hover)' }}>{membership.school.abbreviation}</strong></span>
                                            <span>·</span>
                                            <span>Vai trò: <strong>{membership.communityRole === 'community_manager' ? `Quản trị viên · ${roleLabel}` : roleLabel}</strong></span>
                                        </div>
                                    </div>

                                    <div className="school-disc-card-footer">
                                        <span style={{ fontSize: '13px', color: 'var(--sd-text-muted)', fontWeight: 600 }}>
                                            Vào School Dashboard
                                        </span>
                                        <div className="school-disc-enter-arrow">
                                            <span>Truy cập</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SECTION 2: DISCOVER SCHOOLS */}
                <section className="school-disc-section">
                    <div className="school-disc-section-header">
                        <div>
                            <div className="school-disc-section-tag" style={{ color: 'var(--sd-cyan)' }}>
                                <Search size={13} /> Tra cứu & Gia nhập
                            </div>
                            <h2>
                                Tìm School Community
                                <span className="school-disc-count-badge" style={{ background: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.4)', color: 'var(--sd-cyan-hover)' }}>
                                    {schools.length}
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* SEARCH CARD */}
                    <div className="school-disc-search-card">
                        <form className="school-disc-search-form" onSubmit={handleSearch}>
                            <div className="school-disc-search-input-wrap">
                                <Search size={18} color="var(--sd-text-subtle)" />
                                <input 
                                    value={searchTerm} 
                                    onChange={(event) => setSearchTerm(event.target.value)} 
                                    placeholder="Tìm theo tên trường, mã viết tắt hoặc tỉnh thành..." 
                                />
                            </div>
                            <button type="submit" className="school-disc-btn-search">
                                <Search size={16} />
                                <span>Tìm kiếm</span>
                            </button>
                        </form>
                    </div>

                    {/* SCHOOLS GRID */}
                    {isLoading ? (
                        <div className="school-disc-loading">
                            <div className="school-disc-spinner" />
                            <span>Đang tải danh sách cộng đồng trường...</span>
                        </div>
                    ) : schools.length === 0 ? (
                        <div className="school-disc-empty">
                            <School size={36} color="var(--sd-text-subtle)" />
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Không tìm thấy School Community nào phù hợp.</p>
                            <small style={{ color: 'var(--sd-text-subtle)' }}>Bạn có thể thử tìm kiếm từ khóa khác hoặc đề xuất mở trường mới.</small>
                        </div>
                    ) : (
                        <div className="school-disc-grid">
                            {schools.map((school) => {
                                const isMember = membershipIds.has(school._id);
                                return (
                                    <article className="school-disc-card" key={school._id}>
                                        <div className="school-disc-card-top">
                                            <div className="school-disc-card-icon">
                                                <Building2 size={24} />
                                            </div>
                                            {isMember ? (
                                                <span className="school-disc-badge-joined">
                                                    <CheckCircle2 size={12} /> Đã tham gia
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--sd-text-subtle)', fontWeight: 700 }}>
                                                    {school.abbreviation}
                                                </span>
                                            )}
                                        </div>

                                        <div className="school-disc-card-body">
                                            <h3>{school.name}</h3>
                                            <div className="school-disc-card-meta">
                                                {school.location && (
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={13} color="var(--sd-cyan)" /> {school.location}
                                                    </span>
                                                )}
                                            </div>
                                            {school.description ? (
                                                <p className="school-disc-card-desc">{school.description}</p>
                                            ) : (
                                                <p className="school-disc-card-desc" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                    Cộng đồng trường học chính thức
                                                </p>
                                            )}
                                        </div>

                                        <div className="school-disc-card-footer">
                                            {isMember ? (
                                                <button 
                                                    type="button"
                                                    className="school-disc-btn-action" 
                                                    onClick={() => navigate(`/schools/${school._id}`)}
                                                >
                                                    <span>Mở community</span>
                                                    <ChevronRight size={14} />
                                                </button>
                                            ) : !['user', 'teacher', 'admin'].includes(currentUser?.role) ? null : (
                                                <button 
                                                    type="button"
                                                    className="school-disc-btn-action school-disc-btn-primary" 
                                                    onClick={() => startJoin(school)}
                                                >
                                                    <Users size={15} />
                                                    <span>Tham gia trường</span>
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* MODAL DIALOG: THAM GIA TRƯỜNG */}
            {selectedSchool && (
                <div 
                    className="school-disc-modal-backdrop" 
                    role="presentation" 
                    onMouseDown={(event) => { 
                        if (event.target === event.currentTarget) setSelectedSchool(null); 
                    }}
                >
                    <section className="school-disc-modal" role="dialog" aria-modal="true" aria-labelledby="join-school-title">
                        <div className="school-disc-modal-header">
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--sd-cyan)', textTransform: 'uppercase' }}>
                                    <School size={13} /> Gia nhập cộng đồng trường
                                </div>
                                <h2 id="join-school-title">{selectedSchool.name}</h2>
                                {selectedSchool.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--sd-text-muted)', marginTop: '4px' }}>
                                        <MapPin size={13} color="var(--sd-cyan)" /> {selectedSchool.location}
                                    </div>
                                )}
                            </div>
                            <button 
                                type="button"
                                className="school-disc-btn-close" 
                                aria-label="Đóng bảng" 
                                onClick={() => setSelectedSchool(null)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleJoin}>
                            {error && (
                                <div className="school-disc-alert-error" role="alert" style={{ marginBottom: '16px', padding: '10px 16px' }}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="school-disc-modal-field">
                                <label className="school-disc-modal-label">Họ và tên của bạn</label>
                                <div className="school-disc-modal-input-wrap">
                                    <input 
                                        required 
                                        value={joinData.fullName} 
                                        onChange={(event) => setJoinData({ ...joinData, fullName: event.target.value })} 
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                </div>
                            </div>

                            <div className="school-disc-modal-field">
                                <label className="school-disc-modal-label">Vai trò tài khoản</label>
                                <div className="school-disc-modal-input-wrap" style={{ opacity: 0.8 }}>
                                    <input value={roleLabel} readOnly />
                                </div>
                            </div>

                            {isStudentAccount ? (
                                <div className="school-disc-modal-field">
                                    <label className="school-disc-modal-label">Lớp đang theo học</label>
                                    <div className="school-disc-modal-input-wrap">
                                        <input 
                                            required 
                                            value={joinData.className} 
                                            onChange={(event) => setJoinData({ ...joinData, className: event.target.value })} 
                                            placeholder="Ví dụ: 10A1, 11 Chuyên Toán..." 
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="school-disc-modal-field">
                                    <label className="school-disc-modal-label">Khoa / Bộ môn hoặc lớp giảng dạy phụ trách</label>
                                    <div className="school-disc-modal-input-wrap">
                                        <textarea 
                                            required 
                                            rows={3} 
                                            value={joinData.teachingInfo} 
                                            onChange={(event) => setJoinData({ ...joinData, teachingInfo: event.target.value })} 
                                            placeholder="Ví dụ: Tổ Toán - Tin, phụ trách các lớp khối 10..."
                                        />
                                    </div>
                                </div>
                            )}

                            <p className="school-disc-modal-note">
                                <ShieldCheck size={14} color="var(--sd-cyan)" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                                Yêu cầu tham gia được xét duyệt nhanh chóng để bảo đảm kết nối an toàn trong nội bộ trường.
                            </p>

                            <div className="school-disc-modal-actions">
                                <button 
                                    type="button" 
                                    className="school-disc-btn-action" 
                                    onClick={() => setSelectedSchool(null)}
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit" 
                                    className="school-disc-btn-action school-disc-btn-primary" 
                                    disabled={isJoining}
                                >
                                    <Users size={15} />
                                    <span>{isJoining ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu & Tham gia'}</span>
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
        </div>
    );
};

export default SchoolDiscoveryPage;
