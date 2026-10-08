import React from 'react';
import { ArrowLeft, BookOpen, Plus, School } from 'lucide-react';
import { TeacherDashboardLogic } from '../pages_logic/TeacherDashboardLogic';
import '../pages_styling/TeacherPagesStyling.css';

const TeacherDashboardPage = () => {
    const { currentUser, classes, isLoading, error, navigate } = TeacherDashboardLogic();

    return (
        <main className="teacher-page">
            <div className="teacher-page-inner">
                <header className="teacher-page-header">
                    <button className="teacher-back-button" onClick={() => navigate('/game')}>
                        <ArrowLeft size={18} /> Quay lại game
                    </button>
                    <div>
                        <p className="teacher-eyebrow">Khu vực giáo viên</p>
                        <h1>Dashboard giáo viên</h1>
                        <p className="teacher-subtitle">Xin chào, {currentUser?.fullName || currentUser?.username}</p>
                    </div>
                </header>

                <section className="teacher-section">
                    <div className="teacher-section-heading">
                        <div>
                            <p className="teacher-eyebrow">Lối tắt</p>
                            <h2>Quick actions</h2>
                        </div>
                    </div>
                    <div className="teacher-action-row">
                        <button className="teacher-action-button teacher-action-primary" onClick={() => navigate('/teacher/classes/new')}>
                            <Plus size={19} /> Tạo lớp
                        </button>
                        <button className="teacher-action-button" onClick={() => navigate('/studio')}>
                            <BookOpen size={19} /> Tạo bộ câu hỏi
                        </button>
                    </div>
                </section>

                <section className="teacher-section">
                    <div className="teacher-section-heading">
                        <div>
                            <p className="teacher-eyebrow">Không gian giảng dạy</p>
                            <h2>Lớp đang quản lý <span className="teacher-count">{classes.length}</span></h2>
                        </div>
                    </div>

                    {error && <p className="teacher-error" role="alert">{error}</p>}
                    {isLoading ? (
                        <p className="teacher-empty-state">Đang tải danh sách lớp...</p>
                    ) : classes.length === 0 ? (
                        <div className="teacher-empty-state">
                            <School size={28} />
                            <p>Chưa có lớp nào được tạo.</p>
                            <button className="teacher-text-button" onClick={() => navigate('/teacher/classes/new')}>
                                Tạo lớp đầu tiên
                            </button>
                        </div>
                    ) : (
                        <div className="teacher-class-grid">
                            {classes.map((classItem) => (
                                <button
                                    className="teacher-class-card"
                                    key={classItem._id}
                                    onClick={() => navigate(`/teacher/classes/${classItem._id}`)}
                                >
                                    <span className="teacher-class-icon"><School size={20} /></span>
                                    <span className="teacher-class-card-content">
                                        <strong>{classItem.className}</strong>
                                        {classItem.semester && <span>{classItem.semester}</span>}
                                        {classItem.description && <small>{classItem.description}</small>}
                                    </span>
                                    <span className="teacher-card-arrow" aria-hidden="true">&#8594;</span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default TeacherDashboardPage;