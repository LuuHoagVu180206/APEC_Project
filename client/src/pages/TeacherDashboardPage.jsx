import React, { useState } from 'react';
import { 
    ArrowLeft, 
    BookOpen, 
    Plus, 
    School, 
    Search, 
    Copy, 
    Check, 
    Sparkles, 
    GraduationCap, 
    ArrowRight,
    LayoutDashboard,
    Zap
} from 'lucide-react';
import { TeacherDashboardLogic } from '../pages_logic/TeacherDashboardLogic';
import '../pages_styling/TeacherDashboardStyling.css';

const stripeColors = ['stripe-cyan', 'stripe-gold', 'stripe-purple', 'stripe-emerald'];

const TeacherDashboardPage = () => {
    const { currentUser, classes, isLoading, error, navigate } = TeacherDashboardLogic();
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCode, setCopiedCode] = useState(null);

    const handleCopyCode = (e, code) => {
        e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        }).catch(() => {});
    };

    const filteredClasses = classes.filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (c.className && c.className.toLowerCase().includes(q)) ||
            (c.semester && c.semester.toLowerCase().includes(q)) ||
            (c.classCode && c.classCode.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
    });

    return (
        <main className="teacher-dash-root">
            <div className="teacher-dash-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="teacher-dash-top-nav">
                    <button className="teacher-dash-back-btn" onClick={() => navigate('/game')}>
                        <ArrowLeft size={16} /> Quay lại game
                    </button>
                    <div className="teacher-dash-badge-role">
                        <Sparkles size={14} /> Khu vực Giáo viên
                    </div>
                </div>

                {/* HERO BANNER - MODERN EDTECH STYLE */}
                <header className="teacher-dash-hero">
                    <div className="teacher-dash-hero-info">
                        <div className="teacher-dash-hero-tag">
                            <LayoutDashboard size={14} /> Cổng Quản Lý Lớp Học
                        </div>
                        <h1>Dashboard Giáo Viên</h1>
                        <p className="teacher-dash-hero-sub">
                            Xin chào, <strong>{currentUser?.fullName || currentUser?.username || 'Thầy/Cô'}</strong>! Chúc bạn có những giờ học sôi nổi và hứng khởi cùng học sinh.
                        </p>
                    </div>

                    <div className="teacher-dash-hud-stats">
                        <div className="teacher-dash-hud-pill">
                            <div className="teacher-dash-hud-num">{classes.length}</div>
                            <div className="teacher-dash-hud-lbl">Lớp quản lý</div>
                        </div>
                    </div>
                </header>

                {/* SECTION: QUICK ACTIONS */}
                <section className="teacher-dash-section">
                    <div className="teacher-dash-section-header">
                        <div>
                            <div className="teacher-dash-section-tag">
                                <Zap size={14} /> Thao tác nhanh
                            </div>
                            <h2>Quick Actions</h2>
                        </div>
                    </div>

                    <div className="teacher-dash-action-grid">
                        {/* ACTION 1: TẠO LỚP */}
                        <div 
                            className="teacher-dash-action-card teacher-dash-card-gold"
                            onClick={() => navigate('/teacher/classes/new')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate('/teacher/classes/new')}
                        >
                            <div className="teacher-dash-action-top">
                                <div className="teacher-dash-action-icon teacher-dash-icon-gold">
                                    <Plus size={24} />
                                </div>
                                <div className="teacher-dash-action-text">
                                    <h3>Tạo lớp mới</h3>
                                    <p>Khởi tạo không gian học tập và sinh mã lớp tự động</p>
                                </div>
                            </div>
                        </div>

                        {/* ACTION 2: TẠO BỘ CÂU HỎI */}
                        <div 
                            className="teacher-dash-action-card teacher-dash-card-cyan"
                            onClick={() => navigate('/studio')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate('/studio')}
                        >
                            <div className="teacher-dash-action-top">
                                <div className="teacher-dash-action-icon teacher-dash-icon-cyan">
                                    <BookOpen size={24} />
                                </div>
                                <div className="teacher-dash-action-text">
                                    <h3>Tạo bộ câu hỏi</h3>
                                    <p>Thiết kế các bộ quiz trắc nghiệm trong Studio</p>
                                </div>
                            </div>
                        </div>

                        {/* ACTION 3: THAM GIA LỚP BẰNG MÃ */}
                        <div 
                            className="teacher-dash-action-card teacher-dash-card-purple"
                            onClick={() => navigate('/student/classes')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate('/student/classes')}
                        >
                            <div className="teacher-dash-action-top">
                                <div className="teacher-dash-action-icon teacher-dash-icon-purple">
                                    <School size={24} />
                                </div>
                                <div className="teacher-dash-action-text">
                                    <h3>Tham gia bằng mã</h3>
                                    <p>Nhập mã mời 8 chữ cái để tham gia lớp khác</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION: CLASSROOM LIST */}
                <section className="teacher-dash-section">
                    <div className="teacher-dash-section-header">
                        <div>
                            <div className="teacher-dash-section-tag">
                                <School size={14} /> Không gian giảng dạy
                            </div>
                            <h2>
                                Lớp đang quản lý 
                                <span className="teacher-dash-badge-count">{classes.length}</span>
                            </h2>
                        </div>

                        {classes.length > 0 && (
                            <div className="teacher-dash-search-box">
                                <Search size={16} color="var(--td-text-subtle)" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm lớp học..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* ERROR STATE */}
                    {error && (
                        <div className="teacher-dash-error" role="alert">
                            {error}
                        </div>
                    )}

                    {/* LOADING STATE */}
                    {isLoading ? (
                        <div className="teacher-dash-loading">
                            <div className="teacher-dash-spinner" />
                            <span>Đang tải danh sách lớp học...</span>
                        </div>
                    ) : classes.length === 0 ? (
                        /* EMPTY STATE */
                        <div className="teacher-dash-empty">
                            <div className="teacher-dash-empty-icon">
                                <GraduationCap size={34} />
                            </div>
                            <h3>Chưa có lớp nào được tạo</h3>
                            <p>Hãy khởi tạo lớp học đầu tiên của bạn để chia sẻ mã lớp và quản lý bộ đề câu hỏi cho học sinh.</p>
                            <button 
                                className="teacher-dash-back-btn" 
                                style={{
                                    background: 'var(--td-gold)', 
                                    color: 'var(--td-gold-text)', 
                                    borderColor: 'var(--td-gold-shadow)', 
                                    boxShadow: '0 4px 0 0 var(--td-gold-shadow)',
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: 800
                                }}
                                onClick={() => navigate('/teacher/classes/new')}
                            >
                                <Plus size={18} /> Tạo lớp đầu tiên
                            </button>
                        </div>
                    ) : filteredClasses.length === 0 ? (
                        /* EMPTY FILTER STATE */
                        <div className="teacher-dash-empty" style={{ padding: '36px 20px' }}>
                            <Search size={32} color="var(--td-text-subtle)" />
                            <p>Không tìm thấy lớp học nào khớp với "{searchQuery}"</p>
                        </div>
                    ) : (
                        /* CLASS GRID */
                        <div className="teacher-dash-class-grid">
                            {filteredClasses.map((classItem, idx) => {
                                const stripeClass = stripeColors[idx % stripeColors.length];
                                const hasCode = Boolean(classItem.classCode);
                                const isCopied = copiedCode === classItem.classCode;

                                return (
                                    <div
                                        key={classItem._id}
                                        className="teacher-dash-class-card"
                                        onClick={() => navigate(`/teacher/classes/${classItem._id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/teacher/classes/${classItem._id}`)}
                                    >
                                        <div className={`teacher-dash-card-stripe ${stripeClass}`} />

                                        <div className="teacher-dash-card-body">
                                            <div className="teacher-dash-card-meta">
                                                <div className="teacher-dash-class-avatar">
                                                    {(classItem.className || 'C').charAt(0).toUpperCase()}
                                                </div>
                                                {classItem.semester && (
                                                    <span className="teacher-dash-semester-pill">
                                                        {classItem.semester}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="teacher-dash-class-title">
                                                {classItem.className}
                                            </h3>

                                            {classItem.description ? (
                                                <p className="teacher-dash-class-desc">
                                                    {classItem.description}
                                                </p>
                                            ) : (
                                                <p className="teacher-dash-class-desc" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                    Chưa có mô tả lớp học
                                                </p>
                                            )}
                                        </div>

                                        <div className="teacher-dash-card-footer">
                                            {hasCode ? (
                                                <div 
                                                    className="teacher-dash-code-badge"
                                                    title="Bấm để sao chép mã mời học sinh"
                                                    onClick={(e) => handleCopyCode(e, classItem.classCode)}
                                                >
                                                    {isCopied ? (
                                                        <>
                                                            <Check size={13} color="#10b981" />
                                                            <span style={{ color: '#10b981' }}>ĐÃ SAO CHÉP</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={12} />
                                                            <span>MÃ: {classItem.classCode}</span>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--td-text-subtle)' }}>
                                                    {classItem.questionSets?.length || 0} bộ đề
                                                </span>
                                            )}

                                            <div className="teacher-dash-enter-link">
                                                <span>Chi tiết</span>
                                                <ArrowRight size={14} />
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

export default TeacherDashboardPage;
