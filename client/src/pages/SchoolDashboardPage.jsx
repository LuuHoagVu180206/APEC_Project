import React from 'react';
import { 
    ArrowLeft, 
    BookOpen, 
    Megaphone, 
    School, 
    Trash2, 
    Users, 
    Building2, 
    Plus, 
    Send, 
    Share2, 
    AlertCircle, 
    X, 
    ShieldCheck, 
    GraduationCap, 
    Clock, 
    Calendar, 
    ExternalLink,
    Sun,
    Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SchoolDashboardLogic } from '../pages_logic/SchoolDashboardLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/SchoolDashboardStyling.css';

const SchoolDashboardPage = () => {
    const {
        currentUser, dashboard, isManager, canCreateClasses, canViewClassCode, availableSets, availableClasses, selectedClassId, setSelectedClassId,
        addExistingClass, selectedSetId, setSelectedSetId,
        announcementText, setAnnouncementText, classForm, setClassForm,
        selectedClass, setSelectedClass, error, isLoading, createAnnouncement,
        deleteAnnouncement, removeMember, shareQuestionSet, unshareQuestionSet,
        createClass, deleteClass, openClass, joinClass, navigate
    } = SchoolDashboardLogic();
    const { isDark, toggleTheme } = useDarkMode();

    if (isLoading) {
        return (
            <main className="school-dash-root">
                <div className="school-dash-inner">
                    <div className="school-dash-loading">
                        <div className="school-dash-spinner" />
                        <span>Đang tải thông tin School Community...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (!dashboard) {
        return (
            <main className="school-dash-root">
                <div className="school-dash-inner">
                    <div className="school-dash-alert-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error || 'Không thể mở School Community.'}</span>
                    </div>
                    <button 
                        type="button"
                        className="school-dash-btn school-dash-btn-ghost" 
                        onClick={() => navigate('/schools')}
                    >
                        <ArrowLeft size={16} /> Quay lại danh sách trường
                    </button>
                </div>
            </main>
        );
    }

    const { school, stats, announcements, sharedQuestionSets, classes, members, recentMembers } = dashboard;
    const displayRole = (role) => role === 'teacher' ? 'Giáo viên' : role === 'user' ? 'Học sinh' : 'Quản trị viên';

    return (
        <main className="school-dash-root">
            <div className="school-dash-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="school-dash-top-nav">
                    <button 
                        type="button"
                        className="school-dash-back-btn" 
                        onClick={() => navigate('/schools')}
                    >
                        <ArrowLeft size={16} /> Danh sách trường
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                            type="button" 
                            className="school-dash-theme-btn" 
                            onClick={toggleTheme} 
                            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"} 
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        {isManager && (
                            <div className="school-dash-manager-badge">
                                <ShieldCheck size={15} />
                                <span>Quản trị viên Cộng đồng</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* HERO HEADER */}
                <header className="school-dash-hero">
                    <div className="school-dash-hero-info">
                        <div className="school-dash-hero-tag">
                            <Building2 size={14} /> 
                            <span>{school.abbreviation}{school.location ? ` · ${school.location}` : ''}</span>
                        </div>
                        <h1>{school.name}</h1>
                        {school.description ? (
                            <p className="school-dash-hero-desc">{school.description}</p>
                        ) : (
                            <p className="school-dash-hero-desc" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                Không gian kết nối, giảng dạy và học tập chính thức của trường.
                            </p>
                        )}
                    </div>
                </header>

                {error && (
                    <div className="school-dash-alert-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* STATS HUD GRID */}
                <section className="school-dash-stats-grid" aria-label="Thống kê trường">
                    <div className="school-dash-stat-card">
                        <div className="school-dash-stat-icon stat-icon-blue">
                            <Users size={24} />
                        </div>
                        <div className="school-dash-stat-info">
                            <strong>{stats.members}</strong>
                            <span>Tổng thành viên</span>
                        </div>
                    </div>

                    <div className="school-dash-stat-card">
                        <div className="school-dash-stat-icon stat-icon-gold">
                            <GraduationCap size={24} />
                        </div>
                        <div className="school-dash-stat-info">
                            <strong>{stats.teachers}</strong>
                            <span>Giáo viên</span>
                        </div>
                    </div>

                    <div className="school-dash-stat-card">
                        <div className="school-dash-stat-icon stat-icon-emerald">
                            <Users size={24} />
                        </div>
                        <div className="school-dash-stat-info">
                            <strong>{stats.students}</strong>
                            <span>Học sinh</span>
                        </div>
                    </div>

                    <div className="school-dash-stat-card">
                        <div className="school-dash-stat-icon stat-icon-purple">
                            <School size={24} />
                        </div>
                        <div className="school-dash-stat-info">
                            <strong>{stats.classes}</strong>
                            <span>Lớp học</span>
                        </div>
                    </div>
                </section>

                {/* SECTION 1: ANNOUNCEMENTS (BẢNG TIN & THÔNG BÁO) */}
                <section className="school-dash-section">
                    <div className="school-dash-section-header">
                        <div>
                            <div className="school-dash-section-tag">
                                <Megaphone size={14} /> Tin tức & Sự kiện
                            </div>
                            <h2>Bảng tin Thông báo</h2>
                        </div>
                    </div>

                    {isManager && (
                        <form className="school-dash-announcement-form" onSubmit={createAnnouncement}>
                            <textarea 
                                required 
                                maxLength={2000} 
                                rows={3} 
                                value={announcementText} 
                                onChange={(event) => setAnnouncementText(event.target.value)} 
                                placeholder="Viết thông báo mới gửi tới toàn bộ thầy cô và học sinh trong trường..." 
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="school-dash-btn school-dash-btn-primary">
                                    <Send size={15} /> Đăng thông báo
                                </button>
                            </div>
                        </form>
                    )}

                    {announcements.length === 0 ? (
                        <div className="school-dash-empty">
                            <Megaphone size={28} color="var(--sh-text-subtle)" style={{ marginBottom: '6px' }} />
                            <span>Chưa có thông báo nào được đăng trong trường.</span>
                        </div>
                    ) : (
                        <div className="school-dash-announcement-list">
                            {announcements.map((post) => (
                                <article className="school-dash-post-card" key={post._id}>
                                    <div className="school-dash-post-meta">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <strong>{post.author?.fullName || post.author?.username}</strong>
                                            {isManager && (
                                                <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--sh-gold-hover)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                                                    Ban Giám Hiệu
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                                <Clock size={13} /> {new Date(post.createdAt).toLocaleString()}
                                            </span>
                                            {isManager && (
                                                <button 
                                                    type="button"
                                                    className="school-dash-btn-danger-icon" 
                                                    aria-label="Xóa thông báo" 
                                                    title="Xóa thông báo" 
                                                    onClick={() => deleteAnnouncement(post._id)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="school-dash-post-content">{post.content}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION 2: SHARED QUESTION SETS (KHO HỌC LIỆU CHIA SẺ) */}
                <section className="school-dash-section">
                    <div className="school-dash-section-header">
                        <div>
                            <div className="school-dash-section-tag" style={{ color: 'var(--sh-gold)' }}>
                                <BookOpen size={14} /> Kho Học Liệu Chung
                            </div>
                            <h2>Bộ đề câu hỏi được chia sẻ</h2>
                        </div>
                    </div>

                    {isManager && (
                        <div className="school-dash-controls-row">
                            <select 
                                className="school-dash-select"
                                value={selectedSetId} 
                                onChange={(event) => setSelectedSetId(event.target.value)}
                            >
                                <option value="">-- Chọn bộ câu hỏi của bạn để chia sẻ vào trường --</option>
                                {availableSets.map((set) => (
                                    <option value={set._id} key={set._id}>{set.title}</option>
                                ))}
                            </select>
                            <button 
                                type="button"
                                className="school-dash-btn school-dash-btn-primary" 
                                disabled={!selectedSetId} 
                                onClick={shareQuestionSet}
                            >
                                <Share2 size={15} /> Chia sẻ vào trường
                            </button>
                            {availableSets.length === 0 && (
                                <button 
                                    type="button"
                                    className="school-dash-btn school-dash-btn-ghost" 
                                    onClick={() => navigate('/studio')}
                                >
                                    <Plus size={15} /> Tạo bộ câu hỏi mới
                                </button>
                            )}
                        </div>
                    )}

                    {sharedQuestionSets.length === 0 ? (
                        <div className="school-dash-empty">
                            <BookOpen size={28} color="var(--sh-text-subtle)" style={{ marginBottom: '6px' }} />
                            <span>Chưa có bộ đề câu hỏi nào được chia sẻ trong trường.</span>
                        </div>
                    ) : (
                        <div className="school-dash-items-list">
                            {sharedQuestionSets.filter((item) => item.questionSet).map((item) => (
                                <article className="school-dash-item-row" key={item.questionSet._id}>
                                    <div className="school-dash-item-main">
                                        <div className="school-dash-item-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.35)', color: 'var(--sh-gold-hover)' }}>
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="school-dash-item-text">
                                            <strong>{item.questionSet.title}</strong>
                                            <small>{item.questionSet.description || 'Bộ đề câu hỏi chia sẻ nội bộ trường'}</small>
                                        </div>
                                    </div>
                                    <div className="school-dash-item-actions">
                                        <Link className="school-dash-btn school-dash-btn-ghost" to={`/set/${item.questionSet._id}`}>
                                            <span>Xem đề thi</span>
                                            <ExternalLink size={13} />
                                        </Link>
                                        {isManager && (
                                            <button 
                                                type="button"
                                                className="school-dash-btn-danger-icon" 
                                                aria-label="Bỏ chia sẻ" 
                                                title="Bỏ chia sẻ" 
                                                onClick={() => unshareQuestionSet(item.questionSet._id)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION 3: CLASSES (LỚP HỌC TRONG TRƯỜNG) */}
                <section className="school-dash-section">
                    <div className="school-dash-section-header">
                        <div>
                            <div className="school-dash-section-tag" style={{ color: 'var(--sh-purple)' }}>
                                <School size={14} /> Không Gian Lớp Học
                            </div>
                            <h2>Danh sách lớp học trong trường</h2>
                        </div>
                    </div>

                    {/* FORM TẠO LỚP MỚI CHO TRƯỜNG */}
                    {canCreateClasses && (
                        <form className="school-dash-create-class-form" onSubmit={createClass}>
                            <input 
                                required 
                                value={classForm.className} 
                                onChange={(event) => setClassForm({ ...classForm, className: event.target.value })} 
                                placeholder="Tên lớp (ví dụ: Toán 10A1)" 
                            />
                            <input 
                                value={classForm.semester} 
                                onChange={(event) => setClassForm({ ...classForm, semester: event.target.value })} 
                                placeholder="Kỳ 1 2025-2026 (tùy chọn)" 
                            />
                            <input 
                                value={classForm.description} 
                                onChange={(event) => setClassForm({ ...classForm, description: event.target.value })} 
                                placeholder="Mô tả lớp học (tùy chọn)" 
                            />
                            <button type="submit" className="school-dash-btn school-dash-btn-primary">
                                <Plus size={15} /> Tạo lớp mới
                            </button>
                        </form>
                    )}

                    {/* IMPORT LỚP CÁ NHÂN VÀO TRƯỜNG */}
                    {currentUser?.role === 'teacher' && (
                        <div className="school-dash-controls-row">
                            <select 
                                className="school-dash-select"
                                value={selectedClassId} 
                                onChange={(event) => setSelectedClassId(event.target.value)}
                            >
                                <option value="">-- Chọn lớp cá nhân của bạn để đưa vào trường --</option>
                                {availableClasses.map((classItem) => (
                                    <option value={classItem._id} key={classItem._id}>
                                        {classItem.className}{classItem.semester ? ` · ${classItem.semester}` : ''}
                                    </option>
                                ))}
                            </select>
                            <button 
                                className="school-dash-btn school-dash-btn-primary" 
                                type="button" 
                                disabled={!selectedClassId} 
                                onClick={addExistingClass}
                            >
                                <Share2 size={15} /> Thêm lớp vào trường
                            </button>
                            {availableClasses.length === 0 && (
                                <button 
                                    className="school-dash-btn school-dash-btn-ghost" 
                                    type="button" 
                                    onClick={() => navigate('/teacher/classes/new')}
                                >
                                    <Plus size={15} /> Tạo lớp cá nhân
                                </button>
                            )}
                        </div>
                    )}

                    {/* DANH SÁCH LỚP */}
                    {classes.length === 0 ? (
                        <div className="school-dash-empty">
                            <School size={28} color="var(--sh-text-subtle)" style={{ marginBottom: '6px' }} />
                            <span>Chưa có lớp học nào trực thuộc trường.</span>
                        </div>
                    ) : (
                        <div className="school-dash-items-list">
                            {classes.map((classItem) => (
                                <article className="school-dash-item-row" key={classItem._id}>
                                    <div className="school-dash-item-main">
                                        <div className="school-dash-item-icon">
                                            <School size={20} />
                                        </div>
                                        <div className="school-dash-item-text">
                                            <strong>{classItem.className}</strong>
                                            <small>
                                                {canViewClassCode && classItem.classCode ? `Mã: ${classItem.classCode} · ` : ''}{classItem.semester || 'Chưa ghi học kỳ'} · {classItem.studentCount} học sinh · {classItem.assignmentCount} bài tập · {classItem.questionSetCount} bộ đề
                                            </small>
                                        </div>
                                    </div>
                                    <div className="school-dash-item-actions">
                                        <button 
                                            type="button"
                                            className="school-dash-btn school-dash-btn-ghost" 
                                            onClick={() => openClass(classItem._id)}
                                        >
                                            Chi tiết lớp
                                        </button>
                                        {isManager && (
                                            <button 
                                                type="button"
                                                className="school-dash-btn-danger-icon" 
                                                aria-label="Xóa lớp" 
                                                title="Xóa lớp" 
                                                onClick={() => deleteClass(classItem._id)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* CHI TIẾT LỚP HỌC ĐƯỢC CHỌN (SELECTED CLASS) */}
                    {selectedClass && (
                        <article className="school-dash-class-detail-card">
                            <div className="school-dash-section-header" style={{ marginBottom: '16px' }}>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--sh-cyan)' }}>
                                        <Calendar size={13} /> {selectedClass.semester || 'Lớp học'}
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 0', color: 'var(--sh-text)' }}>
                                        {selectedClass.className}
                                    </h3>
                                </div>
                                <button 
                                    type="button"
                                    className="school-dash-btn-danger-icon" 
                                    aria-label="Đóng chi tiết lớp" 
                                    onClick={() => setSelectedClass(null)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p style={{ margin: '0 0 10px', color: 'var(--sh-text)', fontSize: '14px' }}>
                                {selectedClass.description || 'Chưa có mô tả lớp học.'}
                            </p>
                            <p style={{ margin: '0 0 6px', color: 'var(--sh-text-muted)', fontSize: '13px' }}>
                                Giáo viên giảng dạy: <strong style={{ color: 'var(--sh-text)' }}>{selectedClass.teacher?.fullName || selectedClass.teacher?.username || selectedClass.teacherName}</strong>
                            </p>
                            <p style={{ margin: '0 0 16px', color: 'var(--sh-text-muted)', fontSize: '13px' }}>
                                {canViewClassCode && selectedClass.classCode ? (
                                    <>Mã lớp mời: <strong style={{ color: 'var(--sh-gold-hover)' }}>{selectedClass.classCode}</strong> · </>
                                ) : null}
                                {selectedClass.studentCount} học sinh · {selectedClass.assignmentCount} bài tập
                            </p>

                            {['user', 'admin'].includes(currentUser?.role) && !selectedClass.joined && (
                                <button 
                                    type="button"
                                    className="school-dash-btn school-dash-btn-primary" 
                                    style={{ marginBottom: '20px' }}
                                    onClick={joinClass}
                                >
                                    <Users size={15} /> Tham gia lớp này
                                </button>
                            )}

                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--sh-border)' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px', color: 'var(--sh-text)' }}>
                                    Assignments ({selectedClass.assignmentCount ?? 0})
                                </h4>
                                {selectedClass.assignments?.length ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedClass.assignments.map((assignment) => (
                                            <div key={assignment._id} style={{ padding: '8px 12px', background: 'var(--sh-surface)', border: '1px solid var(--sh-border-light)', borderRadius: '8px', fontSize: '13.5px', color: 'var(--sh-text)' }}>
                                                {assignment.title}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="school-dash-empty" style={{ padding: '20px 14px' }}>
                                        <span>Chưa có assignment nào trong lớp.</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--sh-border)' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px', color: 'var(--sh-text)' }}>
                                    Question sets ({selectedClass.questionSetCount ?? selectedClass.questionSets?.length ?? 0})
                                </h4>
                                {['user', 'admin'].includes(currentUser?.role) ? (
                                    <div className="school-dash-empty" style={{ padding: '20px 14px' }}>
                                        <span>Học sinh chỉ xem được tổng số question sets trong lớp.</span>
                                    </div>
                                ) : selectedClass.questionSets?.length ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedClass.questionSets.map((set) => (
                                            <Link key={set._id} className="school-dash-btn school-dash-btn-ghost" style={{ justifyContent: 'space-between' }} to={`/set/${set._id}`}>
                                                <span>{set.title}</span>
                                                <ExternalLink size={13} />
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="school-dash-empty" style={{ padding: '20px 14px' }}>
                                        <span>Lớp chưa có question set nào được gán.</span>
                                    </div>
                                )}
                            </div>
                        </article>
                    )}
                </section>

                {/* SECTION 4: MEMBERS (THÀNH VIÊN TRƯỜNG) */}
                <section className="school-dash-section">
                    <div className="school-dash-section-header">
                        <div>
                            <div className="school-dash-section-tag" style={{ color: 'var(--sh-emerald)' }}>
                                <Users size={14} /> Danh Bạ Thành Viên
                            </div>
                            <h2>
                                Thành viên cộng đồng
                                <span style={{ marginLeft: '10px', fontSize: '12.5px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '2px 10px', borderRadius: '9999px', fontWeight: 800 }}>
                                    {stats.members}
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="school-dash-member-list">
                        {(members || recentMembers).map((member) => (
                            <div className="school-dash-member-card" key={member._id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                                    <span className="school-dash-member-avatar">
                                        {(member.fullName || member.username || '?').charAt(0).toUpperCase()}
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                                        <strong style={{ fontSize: '14px', color: 'var(--sh-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {member.fullName || member.username}
                                        </strong>
                                        <small style={{ fontSize: '12px', color: 'var(--sh-text-muted)' }}>
                                            {member.communityRole === 'community_manager' ? `Quản trị viên · ${displayRole(member.globalRole)}` : displayRole(member.globalRole)} · {new Date(member.joinedAt || member.createdAt).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                                {isManager && member.communityRole !== 'community_manager' && (
                                    <button 
                                        type="button"
                                        className="school-dash-btn-danger-icon" 
                                        aria-label={`Gỡ ${member.username}`} 
                                        title="Gỡ thành viên" 
                                        onClick={() => removeMember(member._id)}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {recentMembers && recentMembers.length > 0 && (
                        <div className="school-dash-recent-members-wrap">
                            <span style={{ fontWeight: 700, color: 'var(--sh-text)' }}>Thành viên mới gia nhập:</span>
                            {recentMembers.slice(0, 5).map((member) => (
                                <span className="school-dash-recent-pill" key={`recent-${member._id}`}>
                                    {member.fullName || member.username}
                                </span>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default SchoolDashboardPage;
