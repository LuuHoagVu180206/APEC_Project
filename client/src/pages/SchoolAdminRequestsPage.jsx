import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { SchoolAdminRequestsLogic } from '../pages_logic/SchoolAdminRequestsLogic';
import '../pages_styling/SchoolPagesStyling.css';

const SchoolAdminRequestsPage = () => {
    const { requests, error, reviewRequest, navigate } = SchoolAdminRequestsLogic();

    return (
        <main className="school-page">
            <div className="school-page-inner">
                <button className="school-back" onClick={() => navigate('/admin')}><ArrowLeft size={17} /> Quản trị hệ thống</button>
                <header className="school-page-header">
                    <p className="school-eyebrow">Kiểm duyệt</p>
                    <h1>School Community requests</h1>
                    <p>{requests.length} yêu cầu đang chờ</p>
                </header>
                {error && <p className="school-error" role="alert">{error}</p>}
                {requests.length === 0 ? <p className="school-empty">Không có yêu cầu đang chờ duyệt.</p> : (
                    <div className="school-request-list">
                        {requests.map((request) => (
                            <article className="school-request-card" key={request._id}>
                                <div className="school-request-title">
                                    <div><p className="school-eyebrow">{request.abbreviation}</p><h2>{request.schoolName}</h2></div>
                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                                <dl className="school-request-details">
                                    <div><dt>Người gửi</dt><dd>{request.requestedBy?.fullName || request.requestedBy?.username}</dd></div>
                                    <div><dt>Đại diện</dt><dd>{request.representativeName} · {request.representativeRole}</dd></div>
                                    <div><dt>Email</dt><dd>{request.contactEmail}</dd></div>
                                    <div><dt>Địa điểm</dt><dd>{request.location || 'Không cung cấp'}</dd></div>
                                    <div><dt>Mô tả</dt><dd>{request.description}</dd></div>
                                    <div><dt>Lý do</dt><dd>{request.reason}</dd></div>
                                </dl>
                                {request.website && <a href={request.website} target="_blank" rel="noreferrer">{request.website}</a>}
                                <div className="school-form-actions">
                                    <button className="school-button school-button-danger" onClick={() => reviewRequest(request._id, 'reject')}><X size={16} /> Reject</button>
                                    <button className="school-button school-button-primary" onClick={() => reviewRequest(request._id, 'approve')}><Check size={16} /> Approve</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default SchoolAdminRequestsPage;