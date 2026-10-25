import React from 'react';
import { 
    ArrowLeft, 
    BookOpen, 
    School, 
    Users, 
    KeyRound, 
    GraduationCap, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    ChevronRight, 
    Sparkles, 
    Calendar,
    FileText
} from 'lucide-react';
import { StudentClassesPageLogic } from '../pages_logic/StudentClassesPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/StudentClassesStyling.css';

const StudentClassesPage = () => {
    const {
        classCode, setClassCode, joinAsTeacher, setJoinAsTeacher, isTeacher,
        classes, selectedClass, error, notice,
        isLoading, isJoining, handleJoinByCode, openClass, closeClass, navigate
    } = StudentClassesPageLogic();

    return (
        <div className="student-classes-page-wrapper">
            <Navbar activePage="classes" />
            <main className="student-classes-root">
            <div className="student-classes-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="student-classes-top-nav">
                    <button 
                        type="button"
                        className="student-classes-back-btn" 
                        onClick={() => navigate(isTeacher ? '/teacher/dashboard' : '/')}
                    >
                        <ArrowLeft size={16} /> {isTeacher ? 'Dashboard giáo viên' : 'Trang chủ'}
                    </button>
                    <div className="student-classes-role-badge">
                        <Sparkles size={14} />
                        <span>{isTeacher ? 'Tài khoản Giáo viên' : 'Tài khoản Học sinh'}</span>
                    </div>
                </div>

                {/* HERO HEADER */}
                <header className="student-classes-hero">
                    <div className="student-classes-hero-tag">
                        <School size={14} /> Không gian Lớp học
                    </div>
                    <h1>{isTeacher ? 'Lớp Đã Tham Gia' : 'Lớp Học Của Tôi'}</h1>
                    <p className="student-classes-hero-sub">
                        Nhập mã mời 8 chữ cái do giáo viên chia sẻ để gia nhập không gian học tập và khám phá các bài tập, bộ đề câu hỏi.
                    </p>
                </header>

                {/* JOIN CLASS BY CODE FORM */}
                <section className="student-classes-join-card">
                    <div className="student-classes-join-title-row">
                        <KeyRound size={20} color="var(--sc-cyan)" />
                        <h2>Tham gia lớp học bằng mã mời</h2>
                    </div>

                    <form className="student-classes-join-form" onSubmit={handleJoinByCode}>
                        <div className="student-classes-input-wrap">
                            <KeyRound size={18} color="var(--sc-text-subtle)" />
                            <input
                                aria-label="Mã lớp 8 chữ cái"
                                required
                                pattern="[a-zA-Z]{8}"
                                maxLength={8}
                                value={classCode}
                                onChange={(event) => setClassCode(event.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 8).toLowerCase())}
                                placeholder="Nhập mã lớp (8 chữ cái, ví dụ: abcdefgh)"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="student-classes-btn-join" 
                            disabled={isJoining || classCode.length !== 8}
                        >
                            <School size={16} />
                            <span>{isJoining ? 'Đang tham gia...' : 'Tham gia lớp'}</span>
                        </button>
                    </form>

                    {isTeacher && (
                        <label className="student-classes-teacher-toggle">
                            <input
                                type="checkbox"
                                checked={joinAsTeacher}
                                onChange={(event) => setJoinAsTeacher(event.target.checked)}
                            />
                            <span>Tham gia dưới vai trò <strong>Giáo viên đồng quản lý</strong> (bỏ chọn để tham gia như học sinh)</span>
                        </label>
                    )}

                    {notice && (
                        <div className="student-classes-alert-success" role="status">
                            <CheckCircle2 size={18} />
                            <span>{notice}</span>
                        </div>
                    )}
                    {error && (
                        <div className="student-classes-alert-error" role="alert">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                </section>

                {/* JOINED CLASSES LIST */}
                <section className="student-classes-section">
                    <div className="student-classes-section-header">
                        <h2>
                            Lớp học đã tham gia
                            <span className="student-classes-count-badge">{classes.length}</span>
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="student-classes-loading">
                            <div className="student-classes-spinner" />
                            <span>Đang tải danh sách lớp học...</span>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="student-classes-empty">
                            <School size={36} color="var(--sc-text-subtle)" />
                            <p style={{ margin: 0, fontWeight: 600 }}>Bạn chưa tham gia lớp học nào.</p>
                            <small style={{ color: 'var(--sc-text-subtle)' }}>Hãy nhập mã lớp ở phía trên để tham gia ngay.</small>
                        </div>
                    ) : (
                        <div className="student-classes-grid">
                            {classes.map((classItem) => (
                                <div
                                    className="student-classes-card"
                                    key={classItem._id}
                                    onClick={() => classItem.isAssistant
                                        ? navigate(`/teacher/classes/${classItem._id}`)
                                        : openClass(classItem._id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (classItem.isAssistant) {
                                                navigate(`/teacher/classes/${classItem._id}`);
                                            } else {
                                                openClass(classItem._id);
                                            }
                                        }
                                    }}
                                >
                                    <div className="student-classes-card-top">
                                        <div className="student-classes-card-avatar">
                                            {(classItem.className || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        {classItem.isAssistant ? (
                                            <span className="student-classes-badge-role">Trợ giảng</span>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: 'var(--sc-text-muted)', fontWeight: 600 }}>
                                                {classItem.semester || 'Lớp học'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="student-classes-card-body">
                                        <h3>{classItem.className}</h3>
                                        <div className="student-classes-card-meta">
                                            <span>Mã lớp: <strong style={{ color: 'var(--sc-gold-hover)' }}>{classItem.classCode}</strong></span>
                                            <span>Giáo viên: <strong>{classItem.teacher?.fullName || classItem.teacher?.username || classItem.teacherName}</strong></span>
                                        </div>
                                    </div>

                                    <div className="student-classes-card-footer">
                                        <div className="student-classes-card-counts">
                                            <span className="student-classes-count-item" title="Số học sinh">
                                                <Users size={14} color="var(--sc-cyan)" /> {classItem.studentCount}
                                            </span>
                                            <span className="student-classes-count-item" title="Số bộ đề">
                                                <BookOpen size={14} color="var(--sc-gold)" /> {classItem.questionSetCount} sets
                                            </span>
                                        </div>
                                        <div className="student-classes-enter-arrow">
                                            <span>Chi tiết</span>
                                            <ChevronRight size={15} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SELECTED CLASS DETAIL MODAL / DRAWER */}
                {selectedClass && (
                    <section className="student-classes-detail-box">
                        <div className="student-classes-detail-header">
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--sc-cyan)', textTransform: 'uppercase' }}>
                                    <Calendar size={13} /> {selectedClass.semester || 'Lớp học'}
                                </div>
                                <h2>{selectedClass.className}</h2>
                            </div>
                            <button 
                                type="button"
                                className="student-classes-btn-close" 
                                aria-label="Đóng chi tiết lớp" 
                                onClick={closeClass}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ margin: '0 0 10px', color: '#ffffff', fontSize: '14.5px' }}>
                            {selectedClass.description || 'Chưa có mô tả lớp học.'}
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--sc-text-muted)', fontSize: '13.5px' }}>
                            Giáo viên giảng dạy: <strong style={{ color: '#ffffff' }}>{selectedClass.teacher?.fullName || selectedClass.teacher?.username || selectedClass.teacherName}</strong>
                        </p>

                        <div className="student-classes-stats-grid">
                            <div className="student-classes-stat-tile">
                                <div className="student-classes-stat-tile-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--sc-gold-hover)' }}>
                                    <GraduationCap size={20} />
                                </div>
                                <div className="student-classes-stat-tile-info">
                                    <strong>{selectedClass.teacherCount}</strong>
                                    <span>Giáo viên</span>
                                </div>
                            </div>
                            <div className="student-classes-stat-tile">
                                <div className="student-classes-stat-tile-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--sc-cyan-hover)' }}>
                                    <Users size={20} />
                                </div>
                                <div className="student-classes-stat-tile-info">
                                    <strong>{selectedClass.studentCount}</strong>
                                    <span>Học sinh</span>
                                </div>
                            </div>
                            <div className="student-classes-stat-tile">
                                <div className="student-classes-stat-tile-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--sc-purple-hover)' }}>
                                    <FileText size={20} />
                                </div>
                                <div className="student-classes-stat-tile-info">
                                    <strong>{selectedClass.assignmentCount}</strong>
                                    <span>Assignments</span>
                                </div>
                            </div>
                            <div className="student-classes-stat-tile">
                                <div className="student-classes-stat-tile-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                                    <BookOpen size={20} />
                                </div>
                                <div className="student-classes-stat-tile-info">
                                    <strong>{selectedClass.questionSetCount}</strong>
                                    <span>Question sets</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--sc-border)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff' }}>
                                Assignments ({selectedClass.assignmentCount})
                            </h3>
                            <div className="student-classes-empty" style={{ padding: '24px 16px' }}>
                                <FileText size={24} color="var(--sc-text-subtle)" />
                                <span>Chưa có assignment nào được giao trong lớp.</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--sc-border)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px', color: '#ffffff' }}>
                                Question sets ({selectedClass.questionSetCount})
                            </h3>
                            <div className="student-classes-empty" style={{ padding: '24px 16px' }}>
                                <BookOpen size={24} color="var(--sc-text-subtle)" />
                                <span>Học sinh chỉ xem được tổng số question sets trong lớp.</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </main>
        </div>
    );
};

export default StudentClassesPage;