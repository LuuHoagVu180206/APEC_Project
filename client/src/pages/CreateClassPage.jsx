import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CreateClassPageLogic } from '../pages_logic/CreateClassPageLogic';
import '../pages_styling/TeacherPagesStyling.css';

const CreateClassPage = () => {
    const { formData, setFormData, error, isSaving, handleSubmit, navigate } = CreateClassPageLogic();

    return (
        <main className="teacher-page">
            <div className="teacher-page-inner teacher-form-width">
                <button className="teacher-back-button" onClick={() => navigate('/teacher/dashboard')}>
                    <ArrowLeft size={18} /> Dashboard giáo viên
                </button>
                <header className="teacher-page-header teacher-form-header">
                    <div>
                        <p className="teacher-eyebrow">Không gian giảng dạy</p>
                        <h1>Tạo lớp mới</h1>
                    </div>
                </header>

                <form className="teacher-form" onSubmit={handleSubmit}>
                    {error && <p className="teacher-error" role="alert">{error}</p>}
                    <label className="teacher-field">
                        <span>Tên lớp</span>
                        <input
                            required
                            maxLength={100}
                            value={formData.className}
                            onChange={(event) => setFormData({ ...formData, className: event.target.value })}
                            placeholder="Ví dụ: Toán 10A"
                        />
                    </label>
                    <label className="teacher-field">
                        <span>Học kỳ <small>(không bắt buộc)</small></span>
                        <input
                            value={formData.semester}
                            onChange={(event) => setFormData({ ...formData, semester: event.target.value })}
                            placeholder="Kỳ 1 2025-2026"
                        />
                    </label>
                    <label className="teacher-field">
                        <span>Mô tả lớp</span>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                            placeholder="Thông tin giới thiệu về lớp"
                        />
                    </label>
                    <label className="teacher-field">
                        <span>Tên giáo viên đứng lớp</span>
                        <input
                            required
                            maxLength={100}
                            value={formData.teacherName}
                            onChange={(event) => setFormData({ ...formData, teacherName: event.target.value })}
                            placeholder="Họ và tên giáo viên"
                        />
                    </label>
                    <div className="teacher-form-actions">
                        <button type="button" className="teacher-action-button" onClick={() => navigate('/teacher/dashboard')}>
                            Hủy
                        </button>
                        <button type="submit" className="teacher-action-button teacher-action-primary" disabled={isSaving}>
                            {isSaving ? 'Đang tạo...' : 'Tạo lớp'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default CreateClassPage;