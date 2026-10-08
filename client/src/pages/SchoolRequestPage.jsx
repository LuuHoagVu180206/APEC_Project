import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SchoolRequestPageLogic } from '../pages_logic/SchoolRequestPageLogic';
import '../pages_styling/SchoolPagesStyling.css';

const SchoolRequestPage = () => {
    const { formData, setFormData, error, isSubmitting, handleSubmit, navigate } = SchoolRequestPageLogic();
    const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

    return (
        <main className="school-page">
            <div className="school-page-inner school-form-width">
                <button className="school-back" onClick={() => navigate('/schools')}><ArrowLeft size={17} /> School Communities</button>
                <header className="school-page-header">
                    <p className="school-eyebrow">School Community</p>
                    <h1>Đề xuất tạo community</h1>
                    <p>Yêu cầu sẽ được admin xét duyệt trước khi community được tạo.</p>
                </header>
                <form className="school-form" onSubmit={handleSubmit}>
                    {error && <p className="school-error" role="alert">{error}</p>}
                    <label className="school-field"><span>Tên trường</span><input required maxLength={160} value={formData.schoolName} onChange={(event) => updateField('schoolName', event.target.value)} /></label>
                    <label className="school-field"><span>Tên viết tắt</span><input required maxLength={30} value={formData.abbreviation} onChange={(event) => updateField('abbreviation', event.target.value)} /></label>
                    <div className="school-form-grid">
                        <label className="school-field"><span>Tên người đại diện</span><input required value={formData.representativeName} onChange={(event) => updateField('representativeName', event.target.value)} /></label>
                        <label className="school-field"><span>Vai trò người đại diện</span><input required value={formData.representativeRole} onChange={(event) => updateField('representativeRole', event.target.value)} placeholder="Ví dụ: Hiệu trưởng" /></label>
                    </div>
                    <label className="school-field"><span>Email liên hệ</span><input required type="email" value={formData.contactEmail} onChange={(event) => updateField('contactEmail', event.target.value)} /></label>
                    <div className="school-form-grid">
                        <label className="school-field"><span>Website <small>(tùy chọn)</small></span><input type="url" value={formData.website} onChange={(event) => updateField('website', event.target.value)} placeholder="https://" /></label>
                        <label className="school-field"><span>Thành phố/địa điểm <small>(tùy chọn)</small></span><input value={formData.location} onChange={(event) => updateField('location', event.target.value)} /></label>
                    </div>
                    <label className="school-field"><span>Mô tả ngắn</span><textarea required rows={3} value={formData.description} onChange={(event) => updateField('description', event.target.value)} /></label>
                    <label className="school-field"><span>Lý do muốn tạo community</span><textarea required rows={4} value={formData.reason} onChange={(event) => updateField('reason', event.target.value)} /></label>
                    <div className="school-form-actions">
                        <button type="button" className="school-button" onClick={() => navigate('/schools')}>Hủy</button>
                        <button className="school-button school-button-primary" disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default SchoolRequestPage;