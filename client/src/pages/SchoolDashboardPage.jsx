import React from 'react';
import { ArrowLeft, BookOpen, Megaphone, School, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SchoolDashboardLogic } from '../pages_logic/SchoolDashboardLogic';
import '../pages_styling/SchoolPagesStyling.css';

const SchoolDashboardPage = () => {
    const {
        currentUser, dashboard, isManager, canCreateClasses, availableSets, availableClasses, selectedClassId, setSelectedClassId,
        addExistingClass, selectedSetId, setSelectedSetId,
        announcementText, setAnnouncementText, classForm, setClassForm,
        selectedClass, setSelectedClass, error, isLoading, createAnnouncement,
        deleteAnnouncement, removeMember, shareQuestionSet, unshareQuestionSet,
        createClass, deleteClass, openClass, joinClass, navigate
    } = SchoolDashboardLogic();

    if (isLoading) return <main className="school-page"><p className="school-page-inner school-empty">Đang tải community...</p></main>;
    if (!dashboard) {
        return <main className="school-page"><div className="school-page-inner"><p className="school-error">{error || 'Không thể mở School Community.'}</p><button className="school-button" onClick={() => navigate('/schools')}>My School</button></div></main>;
    }

    const { school, stats, announcements, sharedQuestionSets, classes, members, recentMembers } = dashboard;
    const displayRole = (role) => role === 'teacher' ? 'Teacher' : role === 'user' ? 'Student' : 'Admin';

    return (
        <main className="school-page">
            <div className="school-page-inner">
                <button className="school-back" onClick={() => navigate('/schools')}><ArrowLeft size={17} /> My School</button>
                <header className="school-page-header school-community-header">
                    <div>
                        <p className="school-eyebrow">{school.abbreviation}{school.location ? ` · ${school.location}` : ''}</p>
                        <h1>{school.name}</h1>
                        <p>{school.description}</p>
                    </div>
                    {isManager && <span className="school-manager-badge">Community Manager</span>}
                </header>

                {error && <p className="school-error" role="alert">{error}</p>}

                <section className="school-stats-grid" aria-label="School statistics">
                    <div className="school-stat"><Users size={19} /><span>Total members</span><strong>{stats.members}</strong></div>
                    <div className="school-stat"><Users size={19} /><span>Teachers</span><strong>{stats.teachers}</strong></div>
                    <div className="school-stat"><Users size={19} /><span>Students</span><strong>{stats.students}</strong></div>
                    <div className="school-stat"><School size={19} /><span>Classes</span><strong>{stats.classes}</strong></div>
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Cập nhật từ trường</p><h2><Megaphone size={20} /> Announcements</h2></div></div>
                    {isManager && (
                        <form className="school-inline-form" onSubmit={createAnnouncement}>
                            <textarea required maxLength={2000} rows={3} value={announcementText} onChange={(event) => setAnnouncementText(event.target.value)} placeholder="Viết thông báo cho community..." />
                            <button className="school-button school-button-primary">Đăng thông báo</button>
                        </form>
                    )}
                    {announcements.length === 0 ? <p className="school-empty">Chưa có announcement.</p> : (
                        <div className="school-post-list">
                            {announcements.map((post) => (
                                <article className="school-post" key={post._id}>
                                    <div className="school-post-meta"><strong>{post.author?.fullName || post.author?.username}</strong><time>{new Date(post.createdAt).toLocaleString()}</time></div>
                                    <p>{post.content}</p>
                                    {isManager && <button className="school-icon-button" aria-label="Xóa announcement" title="Xóa announcement" onClick={() => deleteAnnouncement(post._id)}><Trash2 size={16} /></button>}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Tài liệu học tập</p><h2><BookOpen size={20} /> Shared Question Sets</h2></div></div>
                    {isManager && (
                        <div className="school-share-row">
                            <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>
                                <option value="">Chọn question set của bạn</option>
                                {availableSets.map((set) => <option value={set._id} key={set._id}>{set.title}</option>)}
                            </select>
                            <button className="school-button school-button-primary" disabled={!selectedSetId} onClick={shareQuestionSet}>Share vào community</button>
                            {availableSets.length === 0 && <button className="school-button" onClick={() => navigate('/studio')}>Tạo question set</button>}
                        </div>
                    )}
                    {sharedQuestionSets.length === 0 ? <p className="school-empty">Chưa có question set được chia sẻ.</p> : (
                        <div className="school-resource-list">
                            {sharedQuestionSets.filter((item) => item.questionSet).map((item) => (
                                <article className="school-resource-row" key={item.questionSet._id}>
                                    <BookOpen size={18} />
                                    <div><strong>{item.questionSet.title}</strong><small>{item.questionSet.description || 'Question set của community'}</small></div>
                                    <Link className="school-button" to={`/set/${item.questionSet._id}`}>Xem</Link>
                                    {isManager && <button className="school-icon-button" aria-label="Bỏ chia sẻ" title="Bỏ chia sẻ" onClick={() => unshareQuestionSet(item.questionSet._id)}><Trash2 size={16} /></button>}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Lớp trong trường</p><h2><School size={20} /> Classes</h2></div></div>
                    {canCreateClasses && (
                        <form className="school-class-create" onSubmit={createClass}>
                            <input required value={classForm.className} onChange={(event) => setClassForm({ ...classForm, className: event.target.value })} placeholder="Tên lớp" />
                            <input value={classForm.semester} onChange={(event) => setClassForm({ ...classForm, semester: event.target.value })} placeholder="Kỳ 1 2025-2026 (optional)" />
                            <input value={classForm.description} onChange={(event) => setClassForm({ ...classForm, description: event.target.value })} placeholder="Mô tả ngắn" />
                            <button className="school-button school-button-primary">Tạo class</button>
                        </form>
                    )}
                    {currentUser?.role === 'teacher' && (
                        <div className="school-share-row">
                            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
                                <option value="">Chọn lớp cá nhân để đưa vào community</option>
                                {availableClasses.map((classItem) => (
                                    <option value={classItem._id} key={classItem._id}>
                                        {classItem.className}{classItem.semester ? ` · ${classItem.semester}` : ''}
                                    </option>
                                ))}
                            </select>
                            <button className="school-button school-button-primary" type="button" disabled={!selectedClassId} onClick={addExistingClass}>
                                Thêm lớp hiện có
                            </button>
                            {availableClasses.length === 0 && <button className="school-button" type="button" onClick={() => navigate('/teacher/classes/new')}>Tạo lớp cá nhân</button>}
                        </div>
                    )}
                    {classes.length === 0 ? <p className="school-empty">Chưa có class nào trong community.</p> : (
                        <div className="school-resource-list">
                            {classes.map((classItem) => (
                                <article className="school-resource-row" key={classItem._id}>
                                    <School size={18} />
                                    <div><strong>{classItem.className}</strong><small>Mã {classItem.classCode} · {classItem.semester || 'Không ghi học kỳ'} · {classItem.studentCount} students · {classItem.assignmentCount} assignments · {classItem.questionSetCount} question sets</small></div>
                                    <button className="school-button" onClick={() => openClass(classItem._id)}>Xem lớp</button>
                                    {isManager && <button className="school-icon-button" aria-label="Xóa class" title="Xóa class" onClick={() => deleteClass(classItem._id)}><Trash2 size={16} /></button>}
                                </article>
                            ))}
                        </div>
                    )}

                    {selectedClass && (
                        <article className="school-class-detail">
                            <div className="school-section-heading">
                                <div><p className="school-eyebrow">{selectedClass.semester || 'Class'}</p><h3>{selectedClass.className}</h3></div>
                                <button className="school-icon-button" aria-label="Đóng chi tiết lớp" onClick={() => setSelectedClass(null)}>×</button>
                            </div>
                            <p>{selectedClass.description || 'Chưa có mô tả.'}</p>
                            <p>Giáo viên: {selectedClass.teacher?.fullName || selectedClass.teacher?.username || selectedClass.teacherName}</p>
                            <p>Mã lớp: <strong>{selectedClass.classCode}</strong></p>
                            <p>{selectedClass.studentCount} students · {selectedClass.assignmentCount} assignments</p>
                            {currentUser?.role === 'user' && !selectedClass.joined && <button className="school-button school-button-primary" onClick={joinClass}>Join class</button>}
                            <h4>Assignments ({selectedClass.assignmentCount ?? 0})</h4>
                            {selectedClass.assignments?.length ? selectedClass.assignments.map((assignment) => <p key={assignment._id}>{assignment.title}</p>) : <p className="school-empty">Chưa có assignment trong lớp.</p>}
                            <h4>Question sets ({selectedClass.questionSetCount ?? selectedClass.questionSets?.length ?? 0})</h4>
                            {currentUser?.role === 'user' ? (
                                <p className="school-empty">Student chỉ xem được tổng số question set trong lớp.</p>
                            ) : selectedClass.questionSets?.length ? selectedClass.questionSets.map((set) => (
                                <Link className="school-class-set" key={set._id} to={`/set/${set._id}`}>{set.title}</Link>
                            )) : <p className="school-empty">Lớp chưa có question set.</p>}
                        </article>
                    )}
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Community</p><h2><Users size={20} /> Members ({stats.members})</h2></div></div>
                    <div className="school-member-list">
                        {(members || recentMembers).map((member) => (
                            <div className="school-member-row" key={member._id}>
                                <span className="school-member-avatar">{(member.fullName || member.username || '?').charAt(0).toUpperCase()}</span>
                                <div><strong>{member.fullName || member.username}</strong><small>{member.communityRole === 'community_manager' ? `Community Manager · ${displayRole(member.globalRole)}` : displayRole(member.globalRole)} · {new Date(member.joinedAt || member.createdAt).toLocaleDateString()}</small></div>
                                {isManager && member.communityRole !== 'community_manager' && <button className="school-icon-button" aria-label={`Gỡ ${member.username}`} title="Gỡ member" onClick={() => removeMember(member._id)}><Trash2 size={16} /></button>}
                            </div>
                        ))}
                    </div>
                    <div className="school-recent-members"><strong>Recent members</strong>{recentMembers.slice(0, 5).map((member) => <span key={`recent-${member._id}`}>{member.fullName || member.username}</span>)}</div>
                </section>
            </div>
        </main>
    );
};

export default SchoolDashboardPage;