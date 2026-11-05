import React, { useState } from 'react';
import { 
    ArrowLeft, 
    BookOpen, 
    Users, 
    GraduationCap, 
    Search, 
    Copy, 
    Check, 
    ChevronRight, 
    ChevronLeft, 
    ChevronDown,
    ShieldCheck, 
    FileText, 
    AlertCircle, 
    UserMinus, 
    UserPlus, 
    Plus, 
    Sparkles,
    Calendar,
    User,
    Gamepad2,
    Trophy,
    Clock,
    HelpCircle,
    Lock
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { TeacherClassPageLogic } from '../pages_logic/TeacherClassPageLogic';
import '../pages_styling/TeacherClassStyling.css';

const TeacherClassPage = () => {
    const {
        classInfo,
        isTeacherAccount,
        studentList,
        assistantList,
        studentSearch,
        setStudentSearch,
        assistantSearch,
        setAssistantSearch,
        loadMembers,
        handlePromoteAssistant,
        handleDemoteAssistant,
        availableSets,
        selectedSetId,
        setSelectedSetId,
        showQuestionSets,
        setShowQuestionSets,
        showAssignments,
        setShowAssignments,
        isLoading,
        error,
        handleAddQuestionSet,
        gameSessions = [],
        isTeacherOfClass = false,
        navigate
    } = TeacherClassPageLogic();

    const [showGameSessions, setShowGameSessions] = useState(true);
    const [expandedSessionId, setExpandedSessionId] = useState(null);

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

    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = () => {
        if (!classInfo?.classCode) return;
        navigator.clipboard.writeText(classInfo.classCode).then(() => {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }).catch(() => {});
    };

    if (isLoading) {
        return (
            <main className="teacher-class-root">
                <div className="teacher-class-inner">
                    <div className="teacher-class-loading">
                        <div className="teacher-class-spinner" />
                        <span>Đang tải thông tin lớp học...</span>
                    </div>
                </div>
            </main>
        );
    }

    if (!classInfo) {
        return (
            <main className="teacher-class-root">
                <div className="teacher-class-inner">
                    <button 
                        className="teacher-class-back-btn" 
                        onClick={() => navigate(isTeacherAccount ? '/teacher/dashboard' : '/student/classes')}
                    >
                        <ArrowLeft size={16} /> {isTeacherAccount ? 'Dashboard giáo viên' : 'Lớp đã tham gia'}
                    </button>
                    <div className="teacher-class-error" role="alert" style={{ marginTop: '24px' }}>
                        <AlertCircle size={20} />
                        <span>{error || 'Không tìm thấy lớp học.'}</span>
                    </div>
                </div>
            </main>
        );
    }

    const questionSets = classInfo.questionSets || [];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar activePage="classes" />
            <main className="teacher-class-root" style={{ flex: 1 }}>
                <div className="teacher-class-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="teacher-class-top-nav">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                            className="teacher-class-back-btn" 
                            onClick={() => navigate(isTeacherAccount ? '/teacher/dashboard' : '/student/classes')}
                        >
                            <ArrowLeft size={16} /> {isTeacherAccount ? 'Dashboard giáo viên' : 'Lớp đã tham gia'}
                        </button>
                        <div className="teacher-class-role-badge">
                            <ShieldCheck size={15} />
                            <span>{classInfo.isPrimaryTeacher ? 'Giáo viên quản lý chính' : 'Trợ giảng lớp học'}</span>
                        </div>
                    </div>

                </div>

                {/* HERO HEADER BANNER */}
                <header className="teacher-class-hero">
                    <div className="teacher-class-hero-header-row">
                        <div className="teacher-class-semester-badge">
                            <Calendar size={13} />
                            <span>{classInfo.semester || 'Lớp học'}</span>
                        </div>

                        {classInfo.classCode && (
                            <div 
                                className="teacher-class-code-copy"
                                title="Bấm để sao chép mã mời học sinh"
                                onClick={handleCopyCode}
                            >
                                {copiedCode ? (
                                    <>
                                        <Check size={14} color="#10b981" />
                                        <span style={{ color: '#10b981' }}>ĐÃ SAO CHÉP MÃ</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={13} />
                                        <span>MÃ LỚP: {classInfo.classCode}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <h1>{classInfo.className}</h1>

                    <div className="teacher-class-meta-row">
                        <div className="teacher-class-meta-item">
                            <User size={15} color="var(--tc-cyan)" />
                            <span>Giáo viên chính: <strong>{classInfo.teacherName}</strong></span>
                        </div>
                        {!classInfo.isPrimaryTeacher && (
                            <div className="teacher-class-meta-item">
                                <Sparkles size={15} color="var(--tc-gold)" />
                                <span>Bạn đang tham gia với tư cách <strong>Trợ giảng</strong></span>
                            </div>
                        )}
                    </div>

                    {classInfo.description && (
                        <div className="teacher-class-desc-box">
                            {classInfo.description}
                        </div>
                    )}
                </header>

                {/* ERROR ALERT */}
                {error && (
                    <div className="teacher-class-error" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* METRICS & QUICK TOGGLES */}
                <section className="teacher-class-metrics-grid" aria-label="Thống kê lớp">
                    {/* SĨ SỐ GIÁO VIÊN */}
                    <div className="teacher-class-metric-card">
                        <div className="teacher-class-metric-icon metric-icon-gold">
                            <GraduationCap size={24} />
                        </div>
                        <div className="teacher-class-metric-info">
                            <div className="teacher-class-metric-num">{classInfo.teacherCount ?? 1}</div>
                            <div className="teacher-class-metric-label">Giáo viên & Trợ giảng</div>
                        </div>
                    </div>

                    {/* SĨ SỐ HỌC SINH */}
                    <div className="teacher-class-metric-card">
                        <div className="teacher-class-metric-icon metric-icon-blue">
                            <Users size={24} />
                        </div>
                        <div className="teacher-class-metric-info">
                            <div className="teacher-class-metric-num">{classInfo.studentCount ?? 0}</div>
                            <div className="teacher-class-metric-label">Học sinh trong lớp</div>
                        </div>
                    </div>

                    {/* ASSIGNMENTS TOGGLE */}
                    <button
                        type="button"
                        className={`teacher-class-metric-card teacher-class-metric-btn ${showAssignments ? 'metric-active' : ''}`}
                        aria-expanded={showAssignments}
                        onClick={() => setShowAssignments((val) => !val)}
                    >
                        <div className="teacher-class-metric-icon metric-icon-purple">
                            <FileText size={24} />
                        </div>
                        <div className="teacher-class-metric-info">
                            <div className="teacher-class-metric-num">{classInfo.assignmentCount ?? 0}</div>
                            <div className="teacher-class-metric-label">Bài tập (Assignments)</div>
                            <span className="teacher-class-metric-toggle-hint">
                                {showAssignments ? (
                                    <>Đang mở danh sách <ChevronDown size={14} /></>
                                ) : (
                                    <>Bấm để xem danh sách <ChevronRight size={14} /></>
                                )}
                            </span>
                        </div>
                    </button>

                    
                    {/* GAME SESSIONS TOGGLE */}
                    <button
                        type="button"
                        className={`teacher-class-metric-card teacher-class-metric-btn ${showGameSessions ? 'metric-active' : ''}`}
                        aria-expanded={showGameSessions}
                        onClick={() => setShowGameSessions((val) => !val)}
                    >
                        <div className="teacher-class-metric-icon metric-icon-amber">
                            <Gamepad2 size={24} />
                        </div>
                        <div className="teacher-class-metric-info">
                            <div className="teacher-class-metric-num">{gameSessions.length}</div>
                            <div className="teacher-class-metric-label">Màn chơi đã diễn ra</div>
                            <span className="teacher-class-metric-toggle-hint">
                                {showGameSessions ? (
                                    <>Đang mở lịch sử <ChevronDown size={14} /></>
                                ) : (
                                    <>Bấm để xem lịch sử <ChevronRight size={14} /></>
                                )}
                            </span>
                        </div>
                    </button>

                    {/* QUESTION SETS TOGGLE */}
                    <button
                        type="button"
                        className={`teacher-class-metric-card teacher-class-metric-btn ${showQuestionSets ? 'metric-active' : ''}`}
                        aria-expanded={showQuestionSets}
                        onClick={() => setShowQuestionSets((val) => !val)}
                    >
                        <div className="teacher-class-metric-icon metric-icon-emerald">
                            <BookOpen size={24} />
                        </div>
                        <div className="teacher-class-metric-info">
                            <div className="teacher-class-metric-num">
                                {classInfo.questionSetCount ?? questionSets.length}
                            </div>
                            <div className="teacher-class-metric-label">Bộ đề câu hỏi</div>
                            <span className="teacher-class-metric-toggle-hint">
                                {showQuestionSets ? (
                                    <>Đang mở danh sách <ChevronDown size={14} /></>
                                ) : (
                                    <>Bấm để quản lý bộ đề <ChevronRight size={14} /></>
                                )}
                            </span>
                        </div>
                    </button>
                </section>

                {/* SECTION: QUẢN LÝ THÀNH VIÊN (CHỈ DÀNH CHO GIÁO VIÊN CHÍNH) */}
                {classInfo.isPrimaryTeacher && (
                    <section className="teacher-class-section">
                        <div className="teacher-class-section-header">
                            <div className="teacher-class-section-title-group">
                                <div className="teacher-class-section-tag">
                                    <ShieldCheck size={14} /> Ban Điều Hành Lớp
                                </div>
                                <h2>Quản lý thành viên lớp học</h2>
                            </div>
                        </div>

                        {/* SUB-SECTION 1: HỌC SINH */}
                        <div className="teacher-class-members-block">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--tc-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={18} color="var(--tc-cyan)" /> Danh sách học sinh
                                    <span className="teacher-class-count-badge">{studentList.pagination.totalItems}</span>
                                </h3>
                            </div>

                            <form
                                className="teacher-class-search-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    loadMembers('students', 1, studentSearch);
                                }}
                            >
                                <div className="teacher-class-search-input-wrap">
                                    <Search size={16} color="var(--tc-text-subtle)" />
                                    <input
                                        aria-label="Tìm học sinh"
                                        value={studentSearch}
                                        onChange={(event) => setStudentSearch(event.target.value)}
                                        placeholder="Tìm học sinh theo họ tên hoặc tên đăng nhập..."
                                    />
                                </div>
                                <button className="teacher-class-btn-search" type="submit">
                                    Tìm kiếm
                                </button>
                            </form>

                            {studentList.data.length ? (
                                <div className="teacher-class-member-list">
                                    {studentList.data.map((student) => (
                                        <div className="teacher-class-member-row" key={student._id}>
                                            <div className="teacher-class-member-info">
                                                <div className="teacher-class-member-avatar">
                                                    {(student.fullName || student.username || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="teacher-class-member-names">
                                                    <strong>{student.fullName || student.username}</strong>
                                                    <small>@{student.username}</small>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="teacher-class-btn-promote"
                                                onClick={() => handlePromoteAssistant(student._id)}
                                            >
                                                <UserPlus size={15} /> Thêm làm trợ giảng
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="teacher-class-empty">
                                    <Users size={28} />
                                    <span>Không tìm thấy học sinh nào phù hợp.</span>
                                </div>
                            )}

                            <div className="teacher-class-pagination">
                                <button
                                    type="button"
                                    className="teacher-class-btn-page"
                                    disabled={studentList.pagination.page <= 1}
                                    onClick={() => loadMembers('students', studentList.pagination.page - 1, studentSearch)}
                                >
                                    <ChevronLeft size={16} /> Trước
                                </button>
                                <span>Trang {studentList.pagination.page} / {studentList.pagination.totalPages || 1}</span>
                                <button
                                    type="button"
                                    className="teacher-class-btn-page"
                                    disabled={studentList.pagination.page >= studentList.pagination.totalPages}
                                    onClick={() => loadMembers('students', studentList.pagination.page + 1, studentSearch)}
                                >
                                    Tiếp <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* SUB-SECTION 2: TRỢ GIẢNG */}
                        <div className="teacher-class-members-block" style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid var(--tc-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--tc-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <GraduationCap size={18} color="var(--tc-gold)" /> Danh sách trợ giảng
                                    <span className="teacher-class-count-badge" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--tc-gold-hover)', background: 'rgba(245, 158, 11, 0.15)' }}>
                                        {assistantList.pagination.totalItems}
                                    </span>
                                </h3>
                            </div>

                            <form
                                className="teacher-class-search-form"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    loadMembers('teachers', 1, assistantSearch);
                                }}
                            >
                                <div className="teacher-class-search-input-wrap">
                                    <Search size={16} color="var(--tc-text-subtle)" />
                                    <input
                                        aria-label="Tìm trợ giảng"
                                        value={assistantSearch}
                                        onChange={(event) => setAssistantSearch(event.target.value)}
                                        placeholder="Tìm trợ giảng theo họ tên hoặc tên đăng nhập..."
                                    />
                                </div>
                                <button className="teacher-class-btn-search" type="submit">
                                    Tìm kiếm
                                </button>
                            </form>

                            {assistantList.data.length ? (
                                <div className="teacher-class-member-list">
                                    {assistantList.data.map((assistant) => (
                                        <div className="teacher-class-member-row" key={assistant._id}>
                                            <div className="teacher-class-member-info">
                                                <div className="teacher-class-member-avatar" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.35)', color: 'var(--tc-gold-hover)' }}>
                                                    {(assistant.fullName || assistant.username || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="teacher-class-member-names">
                                                    <strong>{assistant.fullName || assistant.username}</strong>
                                                    <small>@{assistant.username}</small>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="teacher-class-btn-demote"
                                                onClick={() => handleDemoteAssistant(assistant._id)}
                                            >
                                                <UserMinus size={15} /> Chuyển về học sinh
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="teacher-class-empty">
                                    <GraduationCap size={28} />
                                    <span>Lớp học hiện chưa có trợ giảng nào.</span>
                                </div>
                            )}

                            <div className="teacher-class-pagination">
                                <button
                                    type="button"
                                    className="teacher-class-btn-page"
                                    disabled={assistantList.pagination.page <= 1}
                                    onClick={() => loadMembers('teachers', assistantList.pagination.page - 1, assistantSearch)}
                                >
                                    <ChevronLeft size={16} /> Trước
                                </button>
                                <span>Trang {assistantList.pagination.page} / {assistantList.pagination.totalPages || 1}</span>
                                <button
                                    type="button"
                                    className="teacher-class-btn-page"
                                    disabled={assistantList.pagination.page >= assistantList.pagination.totalPages}
                                    onClick={() => loadMembers('teachers', assistantList.pagination.page + 1, assistantSearch)}
                                >
                                    Tiếp <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* SECTION: ASSIGNMENTS (KHI BẤM MỞ) */}
                {showAssignments && (
                    <section className="teacher-class-section">
                        <div className="teacher-class-section-header">
                            <div className="teacher-class-section-title-group">
                                <div className="teacher-class-section-tag">
                                    <FileText size={14} /> Nhiệm Vụ Học Tập
                                </div>
                                <h2>
                                    Assignments trong lớp 
                                    <span className="teacher-class-count-badge">{classInfo.assignmentCount ?? 0}</span>
                                </h2>
                            </div>
                        </div>

                        {classInfo.assignments?.length ? (
                            <div className="teacher-class-set-grid">
                                {classInfo.assignments.map((assignment) => (
                                    <div className="teacher-class-set-card" key={assignment._id}>
                                        <div className="teacher-class-set-icon">
                                            <FileText size={20} />
                                        </div>
                                        <div className="teacher-class-set-content">
                                            <strong>{assignment.title}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="teacher-class-empty">
                                <FileText size={32} />
                                <span>Chưa có bài tập (assignment) nào được giao trong lớp này.</span>
                            </div>
                        )}
                    </section>
                )}

                
                {/* SECTION: LỊCH SỬ CÁC MÀN CHƠI CỦA LỚP (GAME SESSIONS) */}
                {showGameSessions && (
                    <section className="teacher-class-section">
                        <div className="teacher-class-section-header">
                            <div className="teacher-class-section-title-group">
                                <div className="teacher-class-section-tag" style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b' }}>
                                    <Gamepad2 size={14} /> Đấu Trường Game Lớp Học
                                </div>
                                <h2>
                                    Lịch sử các màn chơi của lớp
                                    <span className="teacher-class-count-badge" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
                                        {gameSessions.length}
                                    </span>
                                </h2>
                            </div>

                            {isTeacherOfClass ? (
                                <div className="teacher-class-role-badge">
                                    <ShieldCheck size={14} /> Chế độ Giáo viên (Xem toàn bộ điểm học sinh)
                                </div>
                            ) : (
                                <div className="teacher-class-role-badge" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
                                    <Lock size={13} /> Chế độ Học sinh (Chỉ xem phiên chơi & kết quả của bạn)
                                </div>
                            )}
                        </div>

                        {gameSessions.length === 0 ? (
                            <div className="teacher-class-empty">
                                <Gamepad2 size={36} />
                                <span>Chưa có phiên chơi nào diễn ra trong lớp này. Giáo viên có thể tạo phòng game gắn mã lớp <strong>{classInfo.classCode}</strong> để cùng học sinh tham gia!</span>
                            </div>
                        ) : (
                            <div className="teacher-class-sessions-list">
                                {gameSessions.map((session, sIdx) => {
                                    const sessionIdKey = session.sessionId || String(sIdx);
                                    const isExpanded = expandedSessionId === sessionIdKey;
                                    return (
                                        <div className="class-session-card" key={sessionIdKey}>
                                            <div 
                                                className="class-session-header"
                                                onClick={() => {
                                                    if (isTeacherOfClass) {
                                                        setExpandedSessionId(isExpanded ? null : sessionIdKey);
                                                    }
                                                }}
                                                role={isTeacherOfClass ? "button" : undefined}
                                                tabIndex={isTeacherOfClass ? 0 : undefined}
                                            >
                                                <div className="class-session-header-left">
                                                    <div className="class-session-icon">
                                                        <Trophy size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="class-session-title-row">
                                                            <strong className="class-session-title">{session.setTitle || 'Màn chơi Lớp học'}</strong>
                                                            {session.roomPin && (
                                                                <span className="session-pin-badge">PIN: {session.roomPin}</span>
                                                            )}
                                                            {session.teacherParticipated && (
                                                                <span className="session-teacher-tag">🏅 Giáo viên cùng chơi</span>
                                                            )}
                                                        </div>
                                                        <div className="class-session-meta">
                                                            <span><Calendar size={13} /> {formatDate(session.playedAt)}</span>
                                                            <span>•</span>
                                                            <span><Users size={13} /> {session.totalParticipants || session.players?.length || 0} người tham gia</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="class-session-header-right">
                                                    {!isTeacherOfClass && session.myResult && (
                                                        <div className="session-my-score-pill">
                                                            <span>Hạng #{session.myResult.rank}</span>
                                                            <strong>+{(session.myResult.score || 0).toLocaleString()} điểm</strong>
                                                        </div>
                                                    )}

                                                    {isTeacherOfClass && (
                                                        <button 
                                                            type="button" 
                                                            className="btn-toggle-session-details"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedSessionId(isExpanded ? null : sessionIdKey);
                                                            }}
                                                        >
                                                            {isExpanded ? (
                                                                <>Thu gọn <ChevronDown size={14} /></>
                                                            ) : (
                                                                <>Xem danh sách điểm <ChevronRight size={14} /></>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CHI TIẾT BẢNG ĐIỂM: CHỈ GIÁO VIÊN CỦA LỚP MỚI ĐƯỢC XEM */}
                                            {isTeacherOfClass && isExpanded && (
                                                <div className="class-session-details-table-wrap">
                                                    {session.players && session.players.length > 0 ? (
                                                        <table className="class-session-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Thứ Hạng</th>
                                                                    <th>Người chơi</th>
                                                                    <th>Vai trò</th>
                                                                    <th>Tổng Điểm</th>
                                                                    <th>Thời Gian</th>
                                                                    <th>Câu Hỏi Đã Giải</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {session.players.map((player, pIdx) => (
                                                                    <tr key={pIdx} className={player.role === 'teacher' ? 'row-teacher' : ''}>
                                                                        <td className="rank-cell">
                                                                            <span className={`rank-pill rank-${player.rank || (pIdx + 1)}`}>
                                                                                {player.rank === 1 ? '🥇 #1' : player.rank === 2 ? '🥈 #2' : player.rank === 3 ? '🥉 #3' : `#${player.rank || (pIdx + 1)}`}
                                                                            </span>
                                                                        </td>
                                                                        <td className="player-name-cell">
                                                                            <strong>{player.studentName || 'Học sinh'}</strong>
                                                                        </td>
                                                                        <td>
                                                                            <span className={`role-tag role-${player.role}`}>
                                                                                {player.role === 'teacher' ? '👨‍🏫 Giáo viên' : '🎓 Học sinh'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="score-cell">
                                                                            <strong>+{(player.score || 0).toLocaleString()}</strong> điểm
                                                                        </td>
                                                                        <td className="time-cell">
                                                                            <Clock size={13} /> {player.timePlayed ? `${Number(player.timePlayed).toFixed(1)}s` : '--'}
                                                                        </td>
                                                                        <td className="questions-cell">
                                                                            <HelpCircle size={13} /> {player.questionsAnswered != null ? `${player.questionsAnswered} câu` : '--'}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <div className="session-no-players">
                                                            <span>Chưa ghi nhận danh sách người chơi chi tiết trong phiên này.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* SECTION: QUESTION SETS (KHI BẤM MỞ) */}
                {showQuestionSets && (
                    <section className="teacher-class-section">
                        <div className="teacher-class-section-header">
                            <div className="teacher-class-section-title-group">
                                <div className="teacher-class-section-tag">
                                    <BookOpen size={14} /> Kho Học Liệu & Mini-Game
                                </div>
                                <h2>
                                    Bộ đề câu hỏi gắn với lớp
                                    <span className="teacher-class-count-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)' }}>
                                        {questionSets.length}
                                    </span>
                                </h2>
                            </div>

                            <button 
                                type="button"
                                className="teacher-class-back-btn" 
                                style={{ padding: '8px 16px', fontSize: '13px' }}
                                onClick={() => navigate('/studio')}
                            >
                                <Plus size={15} /> Tạo bộ đề mới trong Studio
                            </button>
                        </div>

                        {/* FORM THÊM BỘ CÂU HỎI */}
                        {availableSets.length > 0 && (
                            <div className="teacher-class-add-set-box">
                                <select 
                                    className="teacher-class-select"
                                    value={selectedSetId} 
                                    onChange={(event) => setSelectedSetId(event.target.value)}
                                >
                                    <option value="">-- Chọn bộ câu hỏi của bạn để thêm vào lớp --</option>
                                    {availableSets.map((set) => (
                                        <option key={set._id} value={set._id}>{set.title}</option>
                                    ))}
                                </select>
                                <button 
                                    type="button"
                                    className="teacher-class-btn-add-set" 
                                    onClick={handleAddQuestionSet} 
                                    disabled={!selectedSetId}
                                >
                                    <Plus size={16} /> Thêm vào lớp
                                </button>
                            </div>
                        )}

                        {/* DANH SÁCH BỘ CÂU HỎI ĐÃ GẮN */}
                        {questionSets.length === 0 ? (
                            <div className="teacher-class-empty">
                                <BookOpen size={32} />
                                <span>Lớp học chưa có bộ đề câu hỏi nào được gán.</span>
                            </div>
                        ) : (
                            <div className="teacher-class-set-grid">
                                {questionSets.map((set) => (
                                    <div 
                                        className="teacher-class-set-card" 
                                        key={set._id} 
                                        onClick={() => navigate(`/set/${set._id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && navigate(`/set/${set._id}`)}
                                    >
                                        <div className="teacher-class-set-icon">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="teacher-class-set-content">
                                            <strong>{set.title}</strong>
                                            {set.description && <small>{set.description}</small>}
                                        </div>
                                        <div className="teacher-class-set-arrow">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
            </main>
        </div>
    );
};

export default TeacherClassPage;