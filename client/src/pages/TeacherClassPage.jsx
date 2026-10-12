import React from 'react';
import { ArrowLeft, BookOpen, Users } from 'lucide-react';
import { TeacherClassPageLogic } from '../pages_logic/TeacherClassPageLogic';
import '../pages_styling/TeacherPagesStyling.css';

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
        navigate
    } = TeacherClassPageLogic();

    if (isLoading) {
        return <main className="teacher-page"><p className="teacher-page-inner">Đang tải lớp học...</p></main>;
    }

    if (!classInfo) {
        return (
            <main className="teacher-page">
                <div className="teacher-page-inner">
                    <button className="teacher-back-button" onClick={() => navigate(isTeacherAccount ? '/teacher/dashboard' : '/student/classes')}>
                        <ArrowLeft size={18} /> {isTeacherAccount ? 'Dashboard giáo viên' : 'Lớp đã tham gia'}
                    </button>
                    <p className="teacher-error" role="alert">{error || 'Không tìm thấy lớp học.'}</p>
                </div>
            </main>
        );
    }

    const questionSets = classInfo.questionSets || [];

    return (
        <main className="teacher-page">
            <div className="teacher-page-inner">
                <button className="teacher-back-button" onClick={() => navigate(isTeacherAccount ? '/teacher/dashboard' : '/student/classes')}>
                    <ArrowLeft size={18} /> {isTeacherAccount ? 'Dashboard giáo viên' : 'Lớp đã tham gia'}
                </button>
                <header className="teacher-page-header teacher-class-header">
                    <div>
                        <p className="teacher-eyebrow">{classInfo.semester || 'Lớp học'}</p>
                        <h1>{classInfo.className}</h1>
                        <p className="teacher-subtitle">Giáo viên chính: {classInfo.teacherName}</p>
                        {!classInfo.isPrimaryTeacher && <p className="teacher-subtitle">Bạn là trợ giảng của lớp.</p>}
                        <p className="teacher-subtitle">Mã lớp: <strong>{classInfo.classCode}</strong></p>
                        {classInfo.description && <p className="teacher-description">{classInfo.description}</p>}
                    </div>
                </header>

                {error && <p className="teacher-error" role="alert">{error}</p>}

                <section className="teacher-metrics" aria-label="Thống kê lớp">
                    <div className="teacher-metric">
                        <span className="teacher-metric-icon"><Users size={20} /></span>
                        <span className="teacher-metric-label">Sĩ số giáo viên</span>
                        <strong>{classInfo.teacherCount ?? 1}</strong>
                    </div>
                    <div className="teacher-metric">
                        <span className="teacher-metric-icon"><Users size={20} /></span>
                        <span className="teacher-metric-label">Sĩ số học sinh</span>
                        <strong>{classInfo.studentCount ?? 0}</strong>
                    </div>
                    <button
                        className="teacher-metric teacher-metric-button"
                        aria-expanded={showAssignments}
                        onClick={() => setShowAssignments((value) => !value)}
                    >
                        <span className="teacher-metric-icon"><BookOpen size={20} /></span>
                        <span className="teacher-metric-label">Assignments</span>
                        <strong>{classInfo.assignmentCount ?? 0}</strong>
                    </button>
                    <button
                        className="teacher-metric teacher-metric-button"
                        aria-expanded={showQuestionSets}
                        onClick={() => setShowQuestionSets((value) => !value)}
                    >
                        <span className="teacher-metric-icon"><BookOpen size={20} /></span>
                        <span className="teacher-metric-label">Question sets</span>
                        <strong>{classInfo.questionSetCount ?? questionSets.length}</strong>
                    </button>
                </section>

                {classInfo.isPrimaryTeacher && (
                    <section className="teacher-section teacher-members-section">
                        <div className="teacher-section-heading">
                            <div>
                                <p className="teacher-eyebrow">Quản lý thành viên</p>
                                <h2>Học sinh ({studentList.pagination.totalItems})</h2>
                            </div>
                        </div>
                        <form
                            className="teacher-member-search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                loadMembers('students', 1, studentSearch);
                            }}
                        >
                            <input
                                aria-label="Tìm học sinh"
                                value={studentSearch}
                                onChange={(event) => setStudentSearch(event.target.value)}
                                placeholder="Tìm theo họ tên hoặc tên đăng nhập"
                            />
                            <button className="teacher-action-button" type="submit">Tìm</button>
                        </form>
                        {studentList.data.length ? (
                            <div className="teacher-member-list">
                                {studentList.data.map((student) => (
                                    <div className="teacher-member-row" key={student._id}>
                                        <span><strong>{student.fullName || student.username}</strong><small>{student.username}</small></span>
                                        <button
                                            className="teacher-action-button"
                                            onClick={() => handlePromoteAssistant(student._id)}
                                        >
                                            Thêm làm trợ giảng
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="teacher-empty-state">Không tìm thấy học sinh.</p>}
                        <div className="teacher-member-pagination">
                            <button
                                className="teacher-action-button"
                                disabled={studentList.pagination.page <= 1}
                                onClick={() => loadMembers('students', studentList.pagination.page - 1, studentSearch)}
                            >Trước</button>
                            <span>Trang {studentList.pagination.page} / {studentList.pagination.totalPages || 1}</span>
                            <button
                                className="teacher-action-button"
                                disabled={studentList.pagination.page >= studentList.pagination.totalPages}
                                onClick={() => loadMembers('students', studentList.pagination.page + 1, studentSearch)}
                            >Tiếp</button>
                        </div>

                        <div className="teacher-section-heading teacher-assistant-heading">
                            <div>
                                <p className="teacher-eyebrow">Đồng quản lý lớp</p>
                                <h2>Trợ giảng ({assistantList.pagination.totalItems})</h2>
                            </div>
                        </div>
                        <form
                            className="teacher-member-search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                loadMembers('teachers', 1, assistantSearch);
                            }}
                        >
                            <input
                                aria-label="Tìm trợ giảng"
                                value={assistantSearch}
                                onChange={(event) => setAssistantSearch(event.target.value)}
                                placeholder="Tìm theo họ tên hoặc tên đăng nhập"
                            />
                            <button className="teacher-action-button" type="submit">Tìm</button>
                        </form>
                        {assistantList.data.length ? (
                            <div className="teacher-member-list">
                                {assistantList.data.map((assistant) => (
                                    <div className="teacher-member-row" key={assistant._id}>
                                        <span><strong>{assistant.fullName || assistant.username}</strong><small>{assistant.username}</small></span>
                                        <button
                                            className="teacher-action-button teacher-action-danger"
                                            onClick={() => handleDemoteAssistant(assistant._id)}
                                        >
                                            Chuyển về học sinh
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="teacher-empty-state">Lớp chưa có trợ giảng.</p>}
                        <div className="teacher-member-pagination">
                            <button
                                className="teacher-action-button"
                                disabled={assistantList.pagination.page <= 1}
                                onClick={() => loadMembers('teachers', assistantList.pagination.page - 1, assistantSearch)}
                            >Trước</button>
                            <span>Trang {assistantList.pagination.page} / {assistantList.pagination.totalPages || 1}</span>
                            <button
                                className="teacher-action-button"
                                disabled={assistantList.pagination.page >= assistantList.pagination.totalPages}
                                onClick={() => loadMembers('teachers', assistantList.pagination.page + 1, assistantSearch)}
                            >Tiếp</button>
                        </div>
                    </section>
                )}

                {showAssignments && (
                    <section className="teacher-section">
                        <div className="teacher-section-heading">
                            <div>
                                <p className="teacher-eyebrow">Bài tập trong lớp</p>
                                <h2>Assignments ({classInfo.assignmentCount ?? 0})</h2>
                            </div>
                        </div>
                        {classInfo.assignments?.length ? (
                            <div className="teacher-set-list">
                                {classInfo.assignments.map((assignment) => (
                                    <div className="teacher-set-row" key={assignment._id}>
                                        <span className="teacher-set-icon"><BookOpen size={18} /></span>
                                        <span><strong>{assignment.title}</strong></span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="teacher-empty-state">Chưa có assignment trong lớp.</p>}
                    </section>
                )}

                {showQuestionSets && (
                    <section className="teacher-section teacher-sets-section">
                        <div className="teacher-section-heading">
                            <div>
                                <p className="teacher-eyebrow">Tài liệu lớp</p>
                                <h2>Question sets</h2>
                            </div>
                        </div>
                        {availableSets.length > 0 ? (
                            <div className="teacher-add-set-row">
                                <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>
                                    <option value="">Chọn bộ câu hỏi của bạn</option>
                                    {availableSets.map((set) => <option key={set._id} value={set._id}>{set.title}</option>)}
                                </select>
                                <button className="teacher-action-button teacher-action-primary" onClick={handleAddQuestionSet} disabled={!selectedSetId}>
                                    Thêm vào lớp
                                </button>
                            </div>
                        ) : (
                            <button className="teacher-text-button teacher-create-set-link" onClick={() => navigate('/studio')}>
                                Tạo bộ câu hỏi trong Studio
                            </button>
                        )}
                        {questionSets.length === 0 ? (
                            <p className="teacher-empty-state">Lớp chưa có question set.</p>
                        ) : (
                            <div className="teacher-set-list">
                                {questionSets.map((set) => (
                                    <button className="teacher-set-row" key={set._id} onClick={() => navigate(`/set/${set._id}`)}>
                                        <span className="teacher-set-icon"><BookOpen size={18} /></span>
                                        <span>
                                            <strong>{set.title}</strong>
                                            {set.description && <small>{set.description}</small>}
                                        </span>
                                        <span className="teacher-card-arrow" aria-hidden="true">&#8594;</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
};

export default TeacherClassPage;