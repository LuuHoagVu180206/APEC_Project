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
    FileText,
    Clock,
    Eye,
    HelpCircle
} from 'lucide-react';
import { StudentClassesPageLogic } from '../pages_logic/StudentClassesPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/StudentClassesStyling.css';

const StudentClassesPage = () => {
    const {
        classCode, setClassCode, joinAsTeacher, setJoinAsTeacher, isTeacher,
        classes, selectedClass, error, notice,
        isLoading, isJoining, handleJoinByCode, openClass, closeClass,
        viewingAssignment, setViewingAssignment, navigate
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
                                            <span className="student-classes-count-item" title="Số bài tập">
                                                <FileText size={14} color="var(--sc-purple, #a855f7)" /> {classItem.assignmentCount ?? (classItem.assignments?.length || 0)} bài tập
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

                        <p style={{ margin: '0 0 10px', color: 'var(--sc-text)', fontSize: '14.5px' }}>
                            {selectedClass.description || 'Chưa có mô tả lớp học.'}
                        </p>
                        <p style={{ margin: '0 0 20px', color: 'var(--sc-text-muted)', fontSize: '13.5px' }}>
                            Giáo viên giảng dạy: <strong style={{ color: 'var(--sc-text)' }}>{selectedClass.teacher?.fullName || selectedClass.teacher?.username || selectedClass.teacherName}</strong>
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--sc-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} color="var(--sc-purple, #a855f7)" />
                                    Assignments trong lớp
                                    <span className="student-classes-count-badge" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: 'var(--sc-purple-hover, #c084fc)', background: 'rgba(168, 85, 247, 0.15)' }}>
                                        {selectedClass.assignmentCount ?? (selectedClass.assignments?.length || 0)}
                                    </span>
                                </h3>
                            </div>

                            {selectedClass.assignments && selectedClass.assignments.length > 0 ? (
                                <div className="student-classes-assignment-list">
                                    {selectedClass.assignments.map((assignment) => (
                                        <div className="student-classes-assignment-card" key={assignment._id}>
                                            <div className="student-classes-assignment-header">
                                                <div className="student-classes-assignment-icon">
                                                    <FileText size={22} />
                                                </div>
                                                <div className="student-classes-assignment-title-col">
                                                    <h4>{assignment.title}</h4>
                                                    {assignment.description && (
                                                        <p className="student-classes-assignment-desc">{assignment.description}</p>
                                                    )}
                                                    <div className="student-classes-assignment-badges">
                                                        <span className="assignment-badge-questions">
                                                            <HelpCircle size={13} /> {assignment.questions?.length || 0} câu hỏi
                                                        </span>
                                                        {assignment.dueDate ? (
                                                            <span className={`assignment-badge-due ${new Date(assignment.dueDate) < new Date() ? 'expired' : 'active'}`}>
                                                                <Calendar size={13} />
                                                                {new Date(assignment.dueDate) < new Date() ? 'Đã hết hạn: ' : 'Hạn chót: '}
                                                                {new Date(assignment.dueDate).toLocaleString('vi-VN', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        ) : (
                                                            <span className="assignment-badge-due perpetual">
                                                                <Clock size={13} /> Vô thời hạn
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="student-classes-assignment-actions">
                                                <button
                                                    type="button"
                                                    className="btn-student-view-assignment"
                                                    onClick={() => setViewingAssignment(assignment)}
                                                >
                                                    <Eye size={14} /> Chi tiết đề bài
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="student-classes-empty" style={{ padding: '24px 16px' }}>
                                    <FileText size={24} color="var(--sc-text-subtle)" />
                                    <span>Lớp học chưa có bài tập (assignment) nào được giao.</span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--sc-border)' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px', color: 'var(--sc-text)' }}>
                                Question sets ({selectedClass.questionSetCount})
                            </h3>
                            <div className="student-classes-empty" style={{ padding: '24px 16px' }}>
                                <BookOpen size={24} color="var(--sc-text-subtle)" />
                                <span>Học sinh chỉ xem được tổng số question sets trong lớp.</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* MODAL XEM CHI TIẾT ASSIGNMENT (DÀNH CHO HỌC SINH) */}
                {viewingAssignment && (
                    <div className="sc-modal-backdrop" onClick={() => setViewingAssignment(null)}>
                        <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="sc-modal-header">
                                <div className="sc-modal-title-wrap">
                                    <FileText size={20} color="var(--sc-cyan)" />
                                    <h3>Chi Tiết Bài Tập: {viewingAssignment.title}</h3>
                                </div>
                                <button
                                    type="button"
                                    className="sc-modal-close-btn"
                                    onClick={() => setViewingAssignment(null)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="sc-modal-body">
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <span className="assignment-badge-questions">
                                        <HelpCircle size={13} /> {viewingAssignment.questions?.length || 0} câu hỏi
                                    </span>
                                    {viewingAssignment.dueDate ? (
                                        <span className={`assignment-badge-due ${new Date(viewingAssignment.dueDate) < new Date() ? 'expired' : 'active'}`}>
                                            <Calendar size={13} />
                                            {new Date(viewingAssignment.dueDate) < new Date() ? 'Đã hết hạn: ' : 'Hạn chót: '}
                                            {new Date(viewingAssignment.dueDate).toLocaleString('vi-VN')}
                                        </span>
                                    ) : (
                                        <span className="assignment-badge-due perpetual">
                                            <Clock size={13} /> Vô thời hạn
                                        </span>
                                    )}
                                </div>

                                {viewingAssignment.description && (
                                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--sc-text)' }}>
                                        <strong>Mô tả:</strong> {viewingAssignment.description}
                                    </p>
                                )}

                                <h4 style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--sc-text)' }}>
                                    Danh sách câu hỏi trong bài tập ({viewingAssignment.questions?.length || 0} câu):
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {viewingAssignment.questions?.map((q, idx) => (
                                        <div
                                            key={q._id || idx}
                                            className="sc-assignment-question-item"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                                                <strong style={{ fontSize: '14px', color: 'var(--sc-text)' }}>
                                                    Câu {idx + 1}: {q.questionText}
                                                </strong>
                                                <span className={`sc-difficulty-pill ${q.difficulty || 'medium'}`}>
                                                    {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                                                </span>
                                            </div>

                                            {q.options?.length > 0 && (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '6px' }}>
                                                    {q.options.map((opt, oIdx) => (
                                                        <div
                                                            key={oIdx}
                                                            className="sc-assignment-option-pill"
                                                        >
                                                            <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="sc-modal-footer">
                                <span style={{ fontSize: '13px', color: 'var(--sc-text-muted)' }}>
                                    Tổng số: <strong>{viewingAssignment.questions?.length || 0}</strong> câu hỏi
                                </span>
                                <button
                                    type="button"
                                    className="sc-btn-modal-close"
                                    onClick={() => setViewingAssignment(null)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
        </div>
    );
};

export default StudentClassesPage;