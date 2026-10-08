import React from 'react';
import { ArrowLeft, BookOpen, School, Users } from 'lucide-react';
import { StudentClassesPageLogic } from '../pages_logic/StudentClassesPageLogic';
import '../pages_styling/SchoolPagesStyling.css';

const StudentClassesPage = () => {
    const {
        classCode, setClassCode, classes, selectedClass, error, notice,
        isLoading, isJoining, handleJoinByCode, openClass, closeClass, navigate
    } = StudentClassesPageLogic();

    return (
        <main className="school-page">
            <div className="school-page-inner">
                <button className="school-back" onClick={() => navigate('/')}><ArrowLeft size={17} /> Landing</button>
                <header className="school-page-header">
                    <p className="school-eyebrow">Student</p>
                    <h1>My Classes</h1>
                    <p>Nhập mã lớp do giáo viên chia sẻ để tham gia lớp.</p>
                </header>

                <section className="school-section">
                    <form className="school-search-form" onSubmit={handleJoinByCode}>
                        <input
                            aria-label="Mã lớp 8 chữ cái"
                            required
                            pattern="[a-zA-Z]{8}"
                            maxLength={8}
                            value={classCode}
                            onChange={(event) => setClassCode(event.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 8).toLowerCase())}
                            placeholder="Nhập mã lớp (8 chữ cái)"
                        />
                        <button className="school-button school-button-primary" disabled={isJoining}>
                            {isJoining ? 'Đang tham gia...' : 'Join class'}
                        </button>
                    </form>
                    {notice && <p className="school-success" role="status">{notice}</p>}
                    {error && <p className="school-error" role="alert">{error}</p>}
                </section>

                <section className="school-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Lớp học</p><h2>Classes đã tham gia ({classes.length})</h2></div></div>
                    {isLoading ? <p className="school-empty">Đang tải lớp...</p> : classes.length === 0 ? <p className="school-empty">Bạn chưa tham gia lớp nào.</p> : (
                        <div className="school-resource-list">
                            {classes.map((classItem) => (
                                <button className="school-resource-row school-resource-button" key={classItem._id} onClick={() => openClass(classItem._id)}>
                                    <School size={18} />
                                    <div>
                                        <strong>{classItem.className}</strong>
                                        <small>Mã {classItem.classCode} · {classItem.semester || 'Không ghi học kỳ'} · {classItem.teacher?.fullName || classItem.teacher?.username || classItem.teacherName}</small>
                                    </div>
                                    <span className="school-class-counts"><Users size={15} /> {classItem.studentCount} <BookOpen size={15} /> {classItem.questionSetCount} sets</span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {selectedClass && (
                    <section className="school-class-detail">
                        <div className="school-section-heading">
                            <div><p className="school-eyebrow">{selectedClass.semester || 'Class'}</p><h2>{selectedClass.className}</h2></div>
                            <button className="school-icon-button" aria-label="Đóng chi tiết lớp" onClick={closeClass}>×</button>
                        </div>
                        <p>{selectedClass.description || 'Chưa có mô tả.'}</p>
                        <p>Giáo viên: {selectedClass.teacher?.fullName || selectedClass.teacher?.username || selectedClass.teacherName}</p>
                        <div className="school-stats-grid school-class-stats">
                            <div className="school-stat"><Users size={19} /><span>Students</span><strong>{selectedClass.studentCount}</strong></div>
                            <div className="school-stat"><BookOpen size={19} /><span>Assignments</span><strong>{selectedClass.assignmentCount}</strong></div>
                            <div className="school-stat"><BookOpen size={19} /><span>Question sets</span><strong>{selectedClass.questionSetCount}</strong></div>
                        </div>
                        <h3>Assignments ({selectedClass.assignmentCount})</h3>
                        <p className="school-empty">Chưa có assignment trong lớp.</p>
                        <h3>Question sets ({selectedClass.questionSetCount})</h3>
                        <p className="school-empty">Student chỉ xem được tổng số question set trong lớp.</p>
                    </section>
                )}
            </div>
        </main>
    );
};

export default StudentClassesPage;