import React from 'react';
import { ArrowLeft, BookOpen, Megaphone, School, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminSchoolDetailPageLogic } from '../pages_logic/AdminSchoolDetailPageLogic';
import '../pages_styling/SchoolPagesStyling.css';

const AdminSchoolDetailPage = () => {
    const { dashboard, isLoading, error, navigate } = AdminSchoolDetailPageLogic();

    if (isLoading) return <main className="school-page"><p className="school-page-inner school-empty">Đang tải dashboard...</p></main>;
    if (!dashboard) return <main className="school-page"><div className="school-page-inner"><p className="school-error" role="alert">{error || 'Không tìm thấy School.'}</p><button className="school-button" onClick={() => navigate('/admin/schools')}>Danh sách trường</button></div></main>;

    const { school, stats, manager, members, announcements, sharedQuestionSets, classes } = dashboard;

    return (
        <main className="school-page">
            <div className="school-page-inner">
                <button className="school-back" onClick={() => navigate('/admin/schools')}><ArrowLeft size={17} /> School Communities</button>
                <header className="school-page-header school-community-header">
                    <div>
                        <p className="school-eyebrow">{school.abbreviation} · {school.location || 'School Community'}</p>
                        <h1>{school.name}</h1>
                        <p>{school.description}</p>
                    </div>
                    <span className="school-manager-badge">Active</span>
                </header>

                <section className="school-admin-contact">
                    <span><strong>Representative</strong>{school.representativeName} · {school.representativeRole}</span>
                    <span><strong>Community Manager</strong>{manager?.fullName || manager?.username || 'Chưa gán'}</span>
                    <span><strong>Contact</strong>{school.contactEmail}</span>
                    {school.website && <a href={school.website} target="_blank" rel="noreferrer">{school.website}</a>}
                </section>

                <section className="school-stats-grid">
                    <div className="school-stat"><Users size={19} /><span>Total members</span><strong>{stats.members}</strong></div>
                    <div className="school-stat"><Users size={19} /><span>Teachers</span><strong>{stats.teachers}</strong></div>
                    <div className="school-stat"><Users size={19} /><span>Students</span><strong>{stats.students}</strong></div>
                    <div className="school-stat"><School size={19} /><span>Classes</span><strong>{stats.classes}</strong></div>
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Community activity</p><h2><Megaphone size={20} /> Announcements</h2></div></div>
                    {announcements.length ? <div className="school-post-list">{announcements.map((post) => <article className="school-post" key={post._id}><div className="school-post-meta"><strong>{post.author?.fullName || post.author?.username}</strong><time>{new Date(post.createdAt).toLocaleString()}</time></div><p>{post.content}</p></article>)}</div> : <p className="school-empty">Chưa có announcement.</p>}
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Community resources</p><h2><BookOpen size={20} /> Shared Question Sets</h2></div></div>
                    {sharedQuestionSets.length ? <div className="school-resource-list">{sharedQuestionSets.filter((entry) => entry.questionSet).map((entry) => <article className="school-resource-row" key={entry.questionSet._id}><BookOpen size={18} /><div><strong>{entry.questionSet.title}</strong><small>{entry.questionSet.description || 'Question set của community'}</small></div><Link className="school-button" to={`/set/${entry.questionSet._id}`}>Xem</Link></article>)}</div> : <p className="school-empty">Chưa có question set được chia sẻ.</p>}
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">School classes</p><h2><School size={20} /> Classes ({classes.length})</h2></div></div>
                    {classes.length ? <div className="school-resource-list">{classes.map((classItem) => <article className="school-resource-row" key={classItem._id}><School size={18} /><div><strong>{classItem.className}</strong><small>Code {classItem.classCode} · {classItem.semester || 'Không ghi học kỳ'} · {classItem.studentCount} students · {classItem.assignmentCount} assignments · {classItem.questionSetCount} question sets</small></div></article>)}</div> : <p className="school-empty">Chưa có class trong trường.</p>}
                </section>

                <section className="school-community-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Latest members</p><h2><Users size={20} /> Members</h2></div></div>
                    {members.length ? <div className="school-member-list">{members.map((member) => <div className="school-member-row" key={member._id}><span className="school-member-avatar">{(member.fullName || member.username || '?').charAt(0).toUpperCase()}</span><div><strong>{member.fullName || member.username}</strong><small>{member.communityRole} · {member.globalRole}</small></div></div>)}</div> : <p className="school-empty">Chưa có member.</p>}
                </section>
            </div>
        </main>
    );
};

export default AdminSchoolDetailPage;