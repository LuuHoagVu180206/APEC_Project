import React from 'react';
import { 
    ArrowLeft, 
    School, 
    Calendar, 
    User, 
    FileText, 
    Plus, 
    Sparkles, 
    AlertCircle, 
    GraduationCap, 
    Info 
} from 'lucide-react';
import { CreateClassPageLogic } from '../pages_logic/CreateClassPageLogic';
import '../pages_styling/CreateClassStyling.css';

const CreateClassPage = () => {
    const { formData, setFormData, error, isSaving, handleSubmit, navigate } = CreateClassPageLogic();

    return (
        <main className="create-class-root">
            <div className="create-class-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="create-class-top-nav">
                    <button 
                        type="button"
                        className="create-class-back-btn" 
                        onClick={() => navigate('/teacher/dashboard')}
                    >
                        <ArrowLeft size={16} /> Dashboard giáo viên
                    </button>
                    <div className="create-class-badge">
                        <Sparkles size={14} />
                        <span>Khu vực Giáo viên</span>
                    </div>
                </div>

                {/* HERO HEADER */}
                <header className="create-class-hero">
                    <div className="create-class-hero-tag">
                        <GraduationCap size={14} /> Không gian Giảng dạy
                    </div>
                    <h1>Khởi Tạo Lớp Học Mới</h1>
                    <p className="create-class-hero-sub">
                        Thiết lập lớp học mới để quản lý học sinh, giao nhiệm vụ và chia sẻ các bộ câu hỏi ôn tập tương tác. <br />
                        Mã mời 8 ký tự sẽ được hệ thống tự động tạo sau khi lớp được kích hoạt.
                    </p>
                </header>

                {/* FORM CARD */}
                <div className="create-class-card">
                    <form className="create-class-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="create-class-alert-error" role="alert">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* ROW 1: TÊN LỚP & HỌC KỲ */}
                        <div className="create-class-grid">
                            <div className="create-class-field">
                                <label className="create-class-label">
                                    <School size={15} color="var(--cc-cyan)" />
                                    <span>Tên lớp học</span>
                                </label>
                                <div className="create-class-input-box">
                                    <input
                                        required
                                        maxLength={100}
                                        value={formData.className}
                                        onChange={(event) => setFormData({ ...formData, className: event.target.value })}
                                        placeholder="Ví dụ: Toán 10A1, Tin học 12B..."
                                    />
                                </div>
                            </div>

                            <div className="create-class-field">
                                <label className="create-class-label">
                                    <Calendar size={15} color="var(--cc-gold)" />
                                    <span>Học kỳ <small>(không bắt buộc)</small></span>
                                </label>
                                <div className="create-class-input-box">
                                    <input
                                        value={formData.semester}
                                        onChange={(event) => setFormData({ ...formData, semester: event.target.value })}
                                        placeholder="Ví dụ: Kỳ 1 2025-2026"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: TÊN GIÁO VIÊN ĐỨNG LỚP */}
                        <div className="create-class-field">
                            <label className="create-class-label">
                                <User size={15} color="var(--cc-cyan)" />
                                <span>Tên giáo viên phụ trách</span>
                            </label>
                            <div className="create-class-input-box">
                                <input
                                    required
                                    maxLength={100}
                                    value={formData.teacherName}
                                    onChange={(event) => setFormData({ ...formData, teacherName: event.target.value })}
                                    placeholder="Họ và tên giáo viên đứng lớp"
                                />
                            </div>
                        </div>

                        {/* ROW 3: MÔ TẢ LỚP */}
                        <div className="create-class-field">
                            <label className="create-class-label">
                                <FileText size={15} color="var(--cc-gold)" />
                                <span>Mô tả và giới thiệu lớp học <small>(không bắt buộc)</small></span>
                            </label>
                            <div className="create-class-input-box create-class-textarea-box">
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                                    placeholder="Thông tin giới thiệu về mục tiêu môn học, yêu cầu bài tập và lưu ý dành cho học sinh..."
                                />
                            </div>
                        </div>

                        {/* ACTIONS ROW */}
                        <div className="create-class-actions">
                            <button 
                                type="button" 
                                className="create-class-btn-cancel" 
                                onClick={() => navigate('/teacher/dashboard')}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                className="create-class-btn-submit" 
                                disabled={isSaving}
                            >
                                <Plus size={16} />
                                <span>{isSaving ? 'Đang tạo lớp...' : 'Tạo lớp ngay'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* TIP BANNER */}
                <div className="create-class-tip">
                    <Info size={20} color="var(--cc-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <strong>Mã mời tham gia lớp:</strong> Ngay sau khi lớp được tạo thành công, hệ thống sẽ tự động cấp một mã lớp 8 chữ cái (ví dụ: <code>abcdefgh</code>). Thầy cô có thể sao chép mã này tại trang chi tiết lớp để chia sẻ cho học sinh tham gia.
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CreateClassPage;
