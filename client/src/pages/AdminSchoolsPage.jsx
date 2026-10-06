import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminSchoolsPageLogic } from '../pages_logic/AdminSchoolsPageLogic';
import '../pages_styling/SchoolPagesStyling.css';

const AdminSchoolsPage = () => {
    const {
        schools, search, page, pagination, isLoading, error, setPage, handleSearchChange, navigate
    } = AdminSchoolsPageLogic();

    return (
        <main className="school-page">
            <div className="school-page-inner admin-schools-page">
                <button className="school-back" onClick={() => navigate('/admin')}><ArrowLeft size={17} /> Admin</button>
                <header className="school-page-header">
                    <p className="school-eyebrow">Administration</p>
                    <h1>School Communities</h1>
                    <p>Quản lý danh sách và xem dashboard từng trường.</p>
                </header>

                <form className="admin-school-search" onSubmit={(event) => event.preventDefault()} role="search">
                    <Search size={18} />
                    <input
                        aria-label="Tìm trường"
                        value={search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        placeholder="Tìm theo tên trường hoặc tên viết tắt"
                    />
                    {search && <button type="button" className="school-icon-button" aria-label="Xóa tìm kiếm" onClick={() => handleSearchChange('')}><X size={16} /></button>}
                </form>

                <div className="admin-school-result-summary">
                    <span>{pagination.totalItems.toLocaleString()} trường</span>
                    <span>{isLoading ? 'Đang tìm kiếm...' : `Trang ${pagination.totalPages ? page : 0} / ${pagination.totalPages}`}</span>
                </div>

                {error && <p className="school-error" role="alert">{error}</p>}
                <div className="admin-school-table-wrap" aria-busy={isLoading}>
                    <table className="admin-school-table">
                        <thead>
                            <tr>
                                <th>School</th>
                                <th>Manager / Representative</th>
                                <th>Students</th>
                                <th>Teachers</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map((school) => (
                                <tr key={school._id}>
                                    <td>
                                        <Link className="admin-school-name" to={`/admin/schools/${school._id}`}>{school.name}</Link>
                                        <span className="admin-school-code">{school.abbreviation} · {school._id.slice(-6)}</span>
                                    </td>
                                    <td>
                                        <strong>{school.manager?.name || school.representativeName}</strong>
                                        <span className="admin-school-code">{school.manager?.username ? `@${school.manager.username}` : school.contactEmail}</span>
                                    </td>
                                    <td>{school.studentCount.toLocaleString()}</td>
                                    <td>{school.teacherCount.toLocaleString()}</td>
                                    <td><span className="admin-school-status">{school.status}</span></td>
                                    <td>{new Date(school.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {!isLoading && !error && schools.length === 0 && (
                                <tr><td className="admin-school-empty" colSpan="6">{search ? 'Không tìm thấy trường phù hợp.' : 'Chưa có School Community nào.'}</td></tr>
                            )}
                            {isLoading && schools.length === 0 && (
                                <tr><td className="admin-school-empty" colSpan="6">Đang tải danh sách School Community...</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <nav className="admin-school-pagination" aria-label="School pagination">
                    <button className="school-button" disabled={isLoading || page <= 1} onClick={() => setPage((current) => current - 1)}>
                        <ChevronLeft size={17} /> Trước
                    </button>
                    <span>{pagination.totalItems === 0 ? '0 kết quả' : `${(page - 1) * pagination.limit + 1}–${Math.min(page * pagination.limit, pagination.totalItems)} / ${pagination.totalItems}`}</span>
                    <button className="school-button" disabled={isLoading || page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
                        Sau <ChevronRight size={17} />
                    </button>
                </nav>
            </div>
        </main>
    );
};

export default AdminSchoolsPage;