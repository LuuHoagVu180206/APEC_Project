import React from 'react';
import { 
    ArrowLeft, 
    School, 
    Building2, 
    UserCheck, 
    Mail, 
    Globe, 
    MapPin, 
    FileText, 
    HelpCircle, 
    Send, 
    AlertCircle, 
    Sparkles, 
    ShieldCheck,
    Sun,
    Moon 
} from 'lucide-react';
import { SchoolRequestPageLogic } from '../pages_logic/SchoolRequestPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/SchoolRequestStyling.css';

const SchoolRequestPage = () => {
    const { formData, setFormData, error, isSubmitting, handleSubmit, navigate } = SchoolRequestPageLogic();
    const { isDark, toggleTheme } = useDarkMode();
    const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

    return (
        <main className="school-req-root">
            <div className="school-req-inner">
                {/* TOP NAVIGATION / HUD */}
                <div className="school-req-top-nav">
                    <button 
                        type="button"
                        className="school-req-back-btn" 
                        onClick={() => navigate('/schools')}
                    >
                        <ArrowLeft size={16} /> Danh sách Trường
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                            type="button" 
                            className="school-req-theme-btn" 
                            onClick={toggleTheme} 
                            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"} 
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <div className="school-req-badge">
                            <Sparkles size={14} />
                            <span>School Community</span>
                        </div>
                    </div>
                </div>

                {/* HERO HEADER */}
                <header className="school-req-hero">
                    <div className="school-req-hero-tag">
                        <Building2 size={14} /> Không gian Giáo dục & Kết nối
                    </div>
                    <h1>Đề Xuất Tạo School Community</h1>
                    <p className="school-req-hero-sub">
                        Khởi tạo cộng đồng chính thức cho trường học của bạn. Đơn đề xuất sẽ được Ban Quản Trị xem xét và kích hoạt để giáo viên cùng học sinh có thể tham gia, chia sẻ bài tập và bộ đề câu hỏi.
                    </p>
                </header>

                {/* FORM CARD */}
                <div className="school-req-card">
                    <form className="school-req-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="school-req-alert-error" role="alert">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* ROW 1: TÊN TRƯỜNG & TÊN VIẾT TẮT */}
                        <div className="school-req-grid">
                            <div className="school-req-field">
                                <label className="school-req-label">
                                    <School size={15} color="var(--sr-cyan)" />
                                    <span>Tên trường học</span>
                                </label>
                                <div className="school-req-input-box">
                                    <input 
                                        required 
                                        maxLength={160} 
                                        value={formData.schoolName} 
                                        onChange={(event) => updateField('schoolName', event.target.value)}
                                        placeholder="Ví dụ: THPT Chuyên Lê Hồng Phong"
                                    />
                                </div>
                            </div>

                            <div className="school-req-field">
                                <label className="school-req-label">
                                    <Building2 size={15} color="var(--sr-gold)" />
                                    <span>Tên viết tắt / Mã hiệu</span>
                                </label>
                                <div className="school-req-input-box">
                                    <input 
                                        required 
                                        maxLength={30} 
                                        value={formData.abbreviation} 
                                        onChange={(event) => updateField('abbreviation', event.target.value)}
                                        placeholder="Ví dụ: LHP-HCM"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: NGƯỜI ĐẠI DIỆN & VAI TRÒ */}
                        <div className="school-req-grid">
                            <div className="school-req-field">
                                <label className="school-req-label">
                                    <UserCheck size={15} color="var(--sr-cyan)" />
                                    <span>Họ và tên người đại diện</span>
                                </label>
                                <div className="school-req-input-box">
                                    <input 
                                        required 
                                        value={formData.representativeName} 
                                        onChange={(event) => updateField('representativeName', event.target.value)}
                                        placeholder="Họ tên thầy/cô hoặc cán bộ quản lý"
                                    />
                                </div>
                            </div>

                            <div className="school-req-field">
                                <label className="school-req-label">
                                    <ShieldCheck size={15} color="var(--sr-gold)" />
                                    <span>Vai trò / Chức vụ người đại diện</span>
                                </label>
                                <div className="school-req-input-box">
                                    <input 
                                        required 
                                        value={formData.representativeRole} 
                                        onChange={(event) => updateField('representativeRole', event.target.value)} 
                                        placeholder="Ví dụ: Hiệu trưởng, Tổ trưởng bộ môn..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ROW 3: EMAIL & WEBSITE */}
                        <div className="school-req-grid">
                            <div className="school-req-field">
                                <label className="school-req-label">
                                    <Mail size={15} color="var(--sr-cyan)" />
                                    <span>Email liên hệ chính thức</span>
                                </label>
                                <div className="school-req-input-box">
                                    <input 
                                        required 
                                        type="email" 
                                        value={formData.contactEmail} 
                                        onChange={(event) => updateField('contactEmail', event.target.value)}
                                        placeholder="email@school.edu.vn"
                                    />
                                </div>
                            </div>

                            <div className="school-req-field">
                                <label className="school-req-label">
                                    <Globe size={15} color="var(--sr-gold)" />
                                    <span>Website trường <small>(không bắt buộc)</small></span>
                                </label>
                                <div className="school-req-input-box">
                                    <input 
                                        type="url" 
                                        value={formData.website} 
                                        onChange={(event) => updateField('website', event.target.value)} 
                                        placeholder="https://truongcuaban.edu.vn"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ROW 4: THÀNH PHỐ / ĐỊA ĐIỂM */}
                        <div className="school-req-field">
                            <label className="school-req-label">
                                <MapPin size={15} color="var(--sr-cyan)" />
                                <span>Thành phố / Tỉnh thành <small>(không bắt buộc)</small></span>
                            </label>
                            <div className="school-req-input-box">
                                <input 
                                    value={formData.location} 
                                    onChange={(event) => updateField('location', event.target.value)}
                                    placeholder="Ví dụ: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng..."
                                />
                            </div>
                        </div>

                        {/* ROW 5: MÔ TẢ NGẮN */}
                        <div className="school-req-field">
                            <label className="school-req-label">
                                <FileText size={15} color="var(--sr-cyan)" />
                                <span>Mô tả giới thiệu trường</span>
                            </label>
                            <div className="school-req-input-box school-req-textarea-box">
                                <textarea 
                                    required 
                                    rows={3} 
                                    value={formData.description} 
                                    onChange={(event) => updateField('description', event.target.value)}
                                    placeholder="Giới thiệu đôi nét về truyền thống, quy mô và hoạt động của trường..."
                                />
                            </div>
                        </div>

                        {/* ROW 6: LÝ DO TẠO COMMUNITY */}
                        <div className="school-req-field">
                            <label className="school-req-label">
                                <HelpCircle size={15} color="var(--sr-gold)" />
                                <span>Lý do đề xuất thành lập School Community</span>
                            </label>
                            <div className="school-req-input-box school-req-textarea-box">
                                <textarea 
                                    required 
                                    rows={4} 
                                    value={formData.reason} 
                                    onChange={(event) => updateField('reason', event.target.value)}
                                    placeholder="Nhu cầu sử dụng của nhà trường, dự kiến số lượng lớp học và học sinh tham gia sinh hoạt..."
                                />
                            </div>
                        </div>

                        {/* ACTIONS ROW */}
                        <div className="school-req-actions">
                            <button 
                                type="button" 
                                className="school-req-btn-cancel" 
                                onClick={() => navigate('/schools')}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                className="school-req-btn-submit" 
                                disabled={isSubmitting}
                            >
                                <Send size={16} />
                                <span>{isSubmitting ? 'Đang gửi đề xuất...' : 'Gửi yêu cầu'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* INFO TIP BANNER */}
                <div className="school-req-tip">
                    <ShieldCheck size={20} color="var(--sr-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <strong>Quy trình xét duyệt:</strong> Sau khi gửi yêu cầu, Ban Quản Trị sẽ xem xét thông tin trong vòng 24 - 48 giờ làm việc. Khi được phê duyệt, trường sẽ xuất hiện trên trang Khám Phá Cộng Đồng để thầy cô và học sinh có thể tham gia.
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SchoolRequestPage;
