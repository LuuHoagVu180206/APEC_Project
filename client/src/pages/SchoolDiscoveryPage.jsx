import React from 'react';
import { ArrowLeft, MapPin, Search, School } from 'lucide-react';
import { SchoolDiscoveryPageLogic } from '../pages_logic/SchoolDiscoveryPageLogic';
import '../pages_styling/SchoolPagesStyling.css';

const SchoolDiscoveryPage = () => {
    const {
        currentUser, schools, memberships, searchTerm, setSearchTerm, selectedSchool, setSelectedSchool,
        joinData, setJoinData, error, isLoading, isJoining, membershipIds, handleSearch, startJoin, handleJoin, navigate
    } = SchoolDiscoveryPageLogic();
    const roleLabel = currentUser?.role === 'user' ? 'Student' : currentUser?.role === 'teacher' ? 'Teacher' : 'Admin';

    return (
        <main className="school-page">
            <div className="school-page-inner">
                <button className="school-back" onClick={() => navigate('/')}><ArrowLeft size={17} /> Quay lại</button>
                <header className="school-page-header school-heading-row">
                    <div>
                        <p className="school-eyebrow">Cộng đồng học đường</p>
                        <h1>{memberships.length > 0 ? 'My School' : 'Join Your School'}</h1>
                        <p>Tìm community của trường và kết nối với thành viên.</p>
                    </div>
                    <button className="school-button" onClick={() => navigate('/school-requests/new')}>Đề xuất tạo trường</button>
                </header>

                {error && <p className="school-error" role="alert">{error}</p>}

                {memberships.length > 0 && (
                    <section className="school-section">
                        <div className="school-section-heading"><div><p className="school-eyebrow">Membership của bạn</p><h2>My School</h2></div></div>
                        <div className="school-card-grid">
                            {memberships.map((membership) => (
                                <button className="school-card school-card-button" key={membership._id} onClick={() => navigate(`/schools/${membership.school._id}`)}>
                                    <span className="school-card-icon"><School size={20} /></span>
                                    <span className="school-card-main"><strong>{membership.school.name}</strong><small>{membership.school.abbreviation} · {membership.communityRole === 'community_manager' ? `Community Manager · ${roleLabel}` : roleLabel}</small></span>
                                    <span className="school-arrow" aria-hidden="true">&#8594;</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                <section className="school-section">
                    <div className="school-section-heading"><div><p className="school-eyebrow">Khám phá</p><h2>Tìm School Community</h2></div></div>
                    <form className="school-search-form" onSubmit={handleSearch}>
                        <Search size={18} />
                        <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tên trường, viết tắt hoặc địa điểm" />
                        <button className="school-button school-button-primary">Tìm</button>
                    </form>
                    {isLoading ? <p className="school-empty">Đang tải danh sách trường...</p> : schools.length === 0 ? <p className="school-empty">Không tìm thấy School Community phù hợp.</p> : (
                        <div className="school-card-grid">
                            {schools.map((school) => {
                                const isMember = membershipIds.has(school._id);
                                return (
                                    <article className="school-card" key={school._id}>
                                        <span className="school-card-icon"><School size={20} /></span>
                                        <div className="school-card-main">
                                            <strong>{school.name}</strong>
                                            <small>{school.abbreviation}{school.location ? ` · ${school.location}` : ''}</small>
                                            {school.description && <p>{school.description}</p>}
                                        </div>
                                        {isMember ? <button className="school-button" onClick={() => navigate(`/schools/${school._id}`)}>Mở community</button> : !['user', 'teacher'].includes(currentUser?.role) ? null : (
                                            <button className="school-button school-button-primary" onClick={() => startJoin(school)}>Tham gia</button>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {selectedSchool && (
                <div className="school-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSchool(null); }}>
                    <section className="school-modal" role="dialog" aria-modal="true" aria-labelledby="join-school-title">
                        <div className="school-modal-heading">
                            <div><p className="school-eyebrow">Tham gia trường của bạn</p><h2 id="join-school-title">{selectedSchool.name}</h2></div>
                            {selectedSchool.location && <span><MapPin size={15} /> {selectedSchool.location}</span>}
                        </div>
                        <form className="school-form" onSubmit={handleJoin}>
                            {error && <p className="school-error" role="alert">{error}</p>}
                            <label className="school-field"><span>Họ tên</span><input required value={joinData.fullName} onChange={(event) => setJoinData({ ...joinData, fullName: event.target.value })} /></label>
                            <label className="school-field"><span>Role trong account</span><input value={roleLabel} readOnly /></label>
                            {currentUser?.role === 'user' ? (
                                <label className="school-field"><span>Lớp hiện tại</span><input required value={joinData.className} onChange={(event) => setJoinData({ ...joinData, className: event.target.value })} placeholder="Ví dụ: 10A1" /></label>
                            ) : (
                                <label className="school-field"><span>Khoa/bộ môn hoặc lớp phụ trách</span><textarea required rows={3} value={joinData.teachingInfo} onChange={(event) => setJoinData({ ...joinData, teachingInfo: event.target.value })} /></label>
                            )}
                            <p className="school-form-note">Yêu cầu tham gia được duyệt tự động trong phiên bản demo.</p>
                            <div className="school-form-actions">
                                <button type="button" className="school-button" onClick={() => setSelectedSchool(null)}>Hủy</button>
                                <button className="school-button school-button-primary" disabled={isJoining}>{isJoining ? 'Đang tham gia...' : 'Gửi yêu cầu & tham gia'}</button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </main>
    );
};

export default SchoolDiscoveryPage;