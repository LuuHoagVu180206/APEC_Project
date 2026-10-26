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
    HelpCircle,
    Play,
    Award,
    Check
} from 'lucide-react';
import { StudentClassesPageLogic } from '../pages_logic/StudentClassesPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/StudentClassesStyling.css';

const formatDuration = (start, end) => {
    if (!start || !end) return '';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs <= 0 || isNaN(diffMs)) return 'Dưới 1 phút';
    const totalSecs = Math.floor(diffMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs} giây`;
    return `${mins} phút ${secs > 0 ? `${secs} giây` : ''}`;
};

const isAnswerMatch = (opt, target, options = []) => {
    if (!opt || !target) return false;
    const o = String(opt).trim().toLowerCase();
    const t = String(target).trim().toLowerCase();
    if (o === t) return true;

    const strip = (s) => s.replace(/^[a-d][\.\:\)\-]\s*/i, '').trim().toLowerCase();
    if (strip(o) === strip(t)) return true;

    const letters = ['a', 'b', 'c', 'd'];
    const tIdx = letters.indexOf(t);
    if (tIdx !== -1 && options[tIdx] && strip(options[tIdx]) === strip(o)) return true;

    return false;
};

const getAssignmentStatus = (assignment) => {
    if (!assignment) return 'pending';
    if (assignment.status) return assignment.status;
    if (assignment.submission) return 'completed';
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return 'overdue';
    return 'pending';
};

const StudentClassesPage = () => {
    const {
        classCode, setClassCode, joinAsTeacher, setJoinAsTeacher, isTeacher,
        classes, selectedClass, error, notice,
        isLoading, isJoining, handleJoinByCode, openClass, closeClass,
        assignmentFilter, setAssignmentFilter,
        viewingAssignment, setViewingAssignment,
        takingAssignment, studentAnswers, isSubmitting, submitError,
        handleStartTakingAssignment, handleSelectOption, handleCancelTaking, handleSubmitAssignment,
        viewingResult, isLoadingResult, handleViewResult, closeResultModal,
        navigate
    } = StudentClassesPageLogic();

    const rawAssignments = selectedClass?.assignments || [];
    const pendingCount = rawAssignments.filter(a => getAssignmentStatus(a) === 'pending').length;
    const completedCount = rawAssignments.filter(a => getAssignmentStatus(a) === 'completed').length;
    const overdueCount = rawAssignments.filter(a => getAssignmentStatus(a) === 'overdue').length;

    const filteredAssignments = rawAssignments.filter(a => {
        const s = getAssignmentStatus(a);
        if (assignmentFilter === 'all') return true;
        if (assignmentFilter === 'pending') return s === 'pending';
        if (assignmentFilter === 'completed') return s === 'completed';
        if (assignmentFilter === 'overdue') return s === 'overdue';
        return true;
    });

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
                        Nhập mã mời 8 chữ cái do giáo viên chia sẻ để gia nhập không gian học tập và thực hiện các bài tập trắc nghiệm.
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
                                                <Users size={14} color="var(--sc-cyan)" /> {classItem.studentCount ?? 0} học sinh
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
                                    <strong>{selectedClass.studentCount ?? 0}</strong>
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

                        {/* SECTION: ASSIGNMENTS FOR STUDENT (1.1) */}
                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--sc-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--sc-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} color="var(--sc-purple, #a855f7)" />
                                    Assignments trong lớp
                                    <span className="student-classes-count-badge" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: 'var(--sc-purple-hover, #c084fc)', background: 'rgba(168, 85, 247, 0.15)' }}>
                                        {rawAssignments.length}
                                    </span>
                                </h3>
                            </div>

                            {/* 1.1: BỘ LỌC ASSIGNMENT (CHƯA LÀM, ĐÃ LÀM, QUÁ HẠN) */}
                            {rawAssignments.length > 0 && (
                                <div className="sc-filter-tabs-row">
                                    <button
                                        type="button"
                                        className={`sc-filter-tab ${assignmentFilter === 'all' ? 'active' : ''}`}
                                        onClick={() => setAssignmentFilter('all')}
                                    >
                                        🌟 Tất cả bài tập <span className="sc-filter-badge">{rawAssignments.length}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`sc-filter-tab ${assignmentFilter === 'pending' ? 'active' : ''}`}
                                        onClick={() => setAssignmentFilter('pending')}
                                    >
                                        ⏳ Chưa làm <span className="sc-filter-badge">{pendingCount}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`sc-filter-tab ${assignmentFilter === 'completed' ? 'active' : ''}`}
                                        onClick={() => setAssignmentFilter('completed')}
                                    >
                                        ✅ Đã làm <span className="sc-filter-badge">{completedCount}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`sc-filter-tab ${assignmentFilter === 'overdue' ? 'active' : ''}`}
                                        onClick={() => setAssignmentFilter('overdue')}
                                    >
                                        ⚠️ Đã quá hạn <span className="sc-filter-badge">{overdueCount}</span>
                                    </button>
                                </div>
                            )}

                            {filteredAssignments.length > 0 ? (
                                <div className="student-classes-assignment-list">
                                    {filteredAssignments.map((assignment) => {
                                        const status = getAssignmentStatus(assignment);
                                        return (
                                            <div className="student-classes-assignment-card" key={assignment._id}>
                                                <div className="student-classes-assignment-header">
                                                    <div className="student-classes-assignment-icon">
                                                        <FileText size={22} />
                                                    </div>
                                                    <div className="student-classes-assignment-title-col">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <h4 style={{ margin: 0 }}>{assignment.title}</h4>
                                                            {/* Status Pill (1.1) */}
                                                            {status === 'completed' && (
                                                                <span className="sc-status-pill completed">
                                                                    <CheckCircle2 size={12} /> Đã nộp: {assignment.submission?.score ?? '?'}/{assignment.submission?.totalQuestions || assignment.questions?.length || 0} câu đúng
                                                                </span>
                                                            )}
                                                            {status === 'pending' && (
                                                                <span className="sc-status-pill pending">
                                                                    <Clock size={12} /> Chưa làm
                                                                </span>
                                                            )}
                                                            {status === 'overdue' && (
                                                                <span className="sc-status-pill overdue">
                                                                    <AlertCircle size={12} /> Đã quá hạn
                                                                </span>
                                                            )}
                                                        </div>

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

                                                {/* ACTION BUTTONS (1.2 & 1.3) */}
                                                <div className="student-classes-assignment-actions">
                                                    {status === 'pending' && (
                                                        <button
                                                            type="button"
                                                            className="btn-student-take-assignment"
                                                            onClick={() => handleStartTakingAssignment(assignment)}
                                                        >
                                                            <Play size={14} /> Làm bài tập
                                                        </button>
                                                    )}

                                                    {status === 'completed' && (
                                                        <button
                                                            type="button"
                                                            className="btn-student-view-result"
                                                            onClick={() => handleViewResult(assignment)}
                                                        >
                                                            <Award size={14} /> Xem kết quả ({assignment.submission?.score ?? '?'}/{assignment.submission?.totalQuestions || assignment.questions?.length || 0})
                                                        </button>
                                                    )}

                                                    {status === 'overdue' && (
                                                        <button
                                                            type="button"
                                                            className="btn-student-view-assignment"
                                                            onClick={() => setViewingAssignment(assignment)}
                                                        >
                                                            <Eye size={14} /> Chi tiết đề bài
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="student-classes-empty" style={{ padding: '24px 16px' }}>
                                    <FileText size={24} color="var(--sc-text-subtle)" />
                                    <span>
                                        {assignmentFilter === 'all' 
                                            ? 'Lớp học chưa có bài tập nào được giao.' 
                                            : assignmentFilter === 'pending'
                                            ? 'Bạn đã hoàn thành tất cả bài tập!'
                                            : assignmentFilter === 'completed'
                                            ? 'Bạn chưa hoàn thành bài tập nào.'
                                            : 'Không có bài tập nào bị quá hạn.'}
                                    </span>
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

                {/* =========================================================================
                    MODAL 1: LÀM BÀI TẬP TRẮC NGHIỆM (1.2)
                    ========================================================================= */}
                {takingAssignment && (
                    <div className="sc-modal-backdrop" onClick={handleCancelTaking}>
                        <div className="sc-modal" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
                            <div className="sc-modal-header">
                                <div className="sc-modal-title-wrap">
                                    <FileText size={20} color="var(--sc-cyan)" />
                                    <div>
                                        <h3>Làm Bài Tập: {takingAssignment.title}</h3>
                                        <div style={{ fontSize: '12px', color: 'var(--sc-text-muted)', marginTop: '2px' }}>
                                            Đã làm: <strong style={{ color: 'var(--sc-cyan)' }}>{Object.keys(studentAnswers).length}</strong> / {takingAssignment.questions?.length || 0} câu
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="sc-modal-close-btn"
                                    onClick={handleCancelTaking}
                                    title="Hủy bài làm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div style={{ padding: '0 24px' }}>
                                <div className="sc-take-progress-bar-bg">
                                    <div 
                                        className="sc-take-progress-bar-fill" 
                                        style={{ 
                                            width: `${((Object.keys(studentAnswers).length) / Math.max(1, takingAssignment.questions?.length || 1)) * 100}%` 
                                        }} 
                                    />
                                </div>
                            </div>

                            <div className="sc-modal-body">
                                {takingAssignment.description && (
                                    <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--sc-surface)', border: '1px solid var(--sc-border)', fontSize: '13px', color: 'var(--sc-text-muted)' }}>
                                        <strong>Mô tả:</strong> {takingAssignment.description}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {takingAssignment.questions?.map((q, idx) => (
                                        <div key={q._id || idx} className="sc-quiz-question-card">
                                            <div className="sc-quiz-question-header">
                                                <div className="sc-quiz-question-title">
                                                    <strong>Câu {idx + 1}:</strong> {q.questionText}
                                                </div>
                                                <span className={`sc-difficulty-pill ${q.difficulty || 'medium'}`}>
                                                    {q.difficulty === 'easy' ? 'Dễ' : q.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                                                </span>
                                            </div>

                                            {/* 1.2: LỰA CHỌN CÂU HỎI TRẮC NGHIỆM */}
                                            <div className="sc-quiz-options-grid">
                                                {q.options?.map((opt, oIdx) => {
                                                    const letter = String.fromCharCode(65 + oIdx);
                                                    const isSelected = studentAnswers[q._id] === opt;
                                                    return (
                                                        <div
                                                            key={oIdx}
                                                            className={`sc-quiz-option-btn ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => handleSelectOption(q._id, opt)}
                                                            role="button"
                                                            tabIndex={0}
                                                        >
                                                            <div className="sc-quiz-option-radio">
                                                                {isSelected ? <Check size={13} /> : letter}
                                                            </div>
                                                            <span>{opt}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {submitError && (
                                    <div className="student-classes-alert-error" role="alert">
                                        <AlertCircle size={18} />
                                        <span>{submitError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="sc-modal-footer">
                                <span style={{ fontSize: '13px', color: 'var(--sc-text-muted)' }}>
                                    Đã trả lời: <strong style={{ color: 'var(--sc-cyan)' }}>{Object.keys(studentAnswers).length}</strong>/{takingAssignment.questions?.length || 0} câu
                                </span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        type="button"
                                        className="sc-btn-modal-close"
                                        onClick={handleCancelTaking}
                                        disabled={isSubmitting}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-student-take-assignment"
                                        onClick={handleSubmitAssignment}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài tập'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    MODAL 2: HIỂN THỊ KẾT QUẢ BÀI LÀM & ĐÁP ÁN ĐÚNG/SAI (1.3)
                    ========================================================================= */}
                {viewingResult && (
                    <div className="sc-modal-backdrop" onClick={closeResultModal}>
                        <div className="sc-modal" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
                            <div className="sc-modal-header">
                                <div className="sc-modal-title-wrap">
                                    <Award size={20} color="#34d399" />
                                    <h3>Kết Quả Bài Tập: {viewingResult.assignmentTitle || 'Bài Tập Trắc Nghiệm'}</h3>
                                </div>
                                <button
                                    type="button"
                                    className="sc-modal-close-btn"
                                    onClick={closeResultModal}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="sc-modal-body">
                                {/* SCORE HERO BANNER (1.3) */}
                                <div className="sc-result-banner">
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sc-text-muted)', textTransform: 'uppercase' }}>
                                        Tổng kết điểm số của bạn
                                    </div>
                                    <div className="sc-result-score-big">
                                        {viewingResult.score} / {viewingResult.totalQuestions}
                                    </div>
                                    <div style={{ fontSize: '15px', fontWeight: 800, color: viewingResult.score === viewingResult.totalQuestions ? '#34d399' : 'var(--sc-cyan)' }}>
                                        {viewingResult.score === viewingResult.totalQuestions 
                                            ? '🎉 Xuất sắc! Bạn đã trả lời đúng tất cả các câu!' 
                                            : viewingResult.score >= (viewingResult.totalQuestions / 2)
                                            ? '👏 Làm rất tốt! Hãy tiếp tục phát huy.'
                                            : '💪 Cần cố gắng hơn trong lần tới!'}
                                    </div>
                                    <div className="sc-result-meta-row">
                                        <span>Đúng: <strong style={{ color: '#34d399' }}>{viewingResult.score}</strong></span>
                                        <span>Sai: <strong style={{ color: '#f87171' }}>{viewingResult.totalQuestions - viewingResult.score}</strong></span>
                                        <span>Tỷ lệ: <strong>{Math.round((viewingResult.score / Math.max(1, viewingResult.totalQuestions)) * 100)}%</strong></span>
                                        {viewingResult.startedAt && viewingResult.submittedAt && (
                                            <span>Thời gian làm: <strong>{formatDuration(viewingResult.startedAt, viewingResult.submittedAt)}</strong></span>
                                        )}
                                        {viewingResult.submittedAt && (
                                            <span>Nộp lúc: <strong>{new Date(viewingResult.submittedAt).toLocaleTimeString('vi-VN')} {new Date(viewingResult.submittedAt).toLocaleDateString('vi-VN')}</strong></span>
                                        )}
                                    </div>
                                </div>

                                <h4 style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--sc-text)' }}>
                                    Chi tiết từng câu hỏi & đáp án đối chiếu:
                                </h4>

                                {/* 1.3: CHI TIẾT TỪNG CÂU HỎI VỚI ĐÁP ÁN ĐÚNG & ĐÁP ÁN HỌC SINH ĐÃ CHỌN */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {viewingResult.answers?.map((item, idx) => (
                                        <div key={item.questionId || idx} className="sc-quiz-question-card">
                                            <div className="sc-quiz-question-header">
                                                <div className="sc-quiz-question-title">
                                                    <strong>Câu {idx + 1}:</strong> {item.questionText}
                                                </div>
                                                {item.isCorrect ? (
                                                    <span className="sc-result-pill-tag correct">
                                                        <Check size={12} /> Đúng (+1đ)
                                                    </span>
                                                ) : item.selectedAnswer ? (
                                                    <span className="sc-result-pill-tag wrong">
                                                        <X size={12} /> Sai
                                                    </span>
                                                ) : (
                                                    <span className="sc-result-pill-tag" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--sc-text-muted)' }}>
                                                        Chưa chọn
                                                    </span>
                                                )}
                                            </div>

                                            {/* Danh sách các lựa chọn đối chiếu */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {item.options?.map((opt, oIdx) => {
                                                    const letter = String.fromCharCode(65 + oIdx);
                                                    const isSelected = isAnswerMatch(opt, item.selectedAnswer, item.options);
                                                    const isCorrectAns = isAnswerMatch(opt, item.correctAnswer, item.options);

                                                    let cardClass = 'sc-result-option-card';
                                                    if (isCorrectAns) cardClass += ' correct-answer';
                                                    else if (isSelected && !isCorrectAns) cardClass += ' student-wrong';

                                                    return (
                                                        <div key={oIdx} className={cardClass}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <strong>{letter}.</strong>
                                                                <span>{opt}</span>
                                                            </div>

                                                            {/* Nhãn hiển thị kết quả lựa chọn */}
                                                            <div>
                                                                {isSelected && isCorrectAns && (
                                                                    <span className="sc-result-pill-tag correct">
                                                                        <Check size={12} /> Đáp án của bạn (Đúng)
                                                                    </span>
                                                                )}
                                                                {isSelected && !isCorrectAns && (
                                                                    <span className="sc-result-pill-tag wrong">
                                                                        <X size={12} /> Đáp án bạn chọn (Sai)
                                                                    </span>
                                                                )}
                                                                {!isSelected && isCorrectAns && (
                                                                    <span className="sc-result-pill-tag correct">
                                                                        <Check size={12} /> Đáp án đúng
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Giải thích nếu có */}
                                            {item.explanation && (
                                                <div className="sc-explanation-box">
                                                    <strong>💡 Giải thích:</strong> {item.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="sc-modal-footer">
                                <span style={{ fontSize: '13px', color: 'var(--sc-text-muted)' }}>
                                    Điểm số: <strong style={{ color: '#34d399' }}>{viewingResult.score}/{viewingResult.totalQuestions}</strong> câu đúng
                                </span>
                                <button
                                    type="button"
                                    className="sc-btn-modal-close"
                                    onClick={closeResultModal}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =========================================================================
                    MODAL 3: XEM CHI TIẾT ĐỀ BÀI (CHO BÀI TẬP QUÁ HẠN / THAM KHẢO)
                    ========================================================================= */}
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
