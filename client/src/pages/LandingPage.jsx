import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../pages_logic/useDarkMode'; // Import hook vừa tạo
import '../pages_styling/LandingPageStyling.css';
import { Search, Signal, BarChart2, Zap, Sun, Moon } from 'lucide-react';
const LandingPage = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useDarkMode(); // Sử dụng hook

    return (
        <div className="landing-wrapper">
            {/* 1. THANH ĐIỀU HƯỚNG (NAVBAR) */}
            <nav className="navbar">
                <div className="nav-left">
                    <h2 className="logo" onClick={() => navigate('/Landing')}>EasyLearn</h2>
                    <button 
                        onClick={toggleTheme} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px'
                        }}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
                
               
                <div className="nav-right">
                    <button className="btn-login" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </button>
                </div>
            </nav>

            {/* 2. KHU VỰC HERO */}
            <header className="hero-section">
                <h1 className="hero-title">
                    EasyLearn!                  
                </h1>
                <p className="hero-subtitle">
                    Tạo dựng, khám phá và chia sẻ mọi kiến thức.<br />
                    Cùng EasyLearn, 
                </p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={() => navigate('/register')}>
                        Đăng ký miễn phí ngay!
                    </button>
                    <a href="#teacher" className="link-teacher">Tôi là giáo viên</a>
                </div>
            </header>
            {/* 4. KHU VỰC DANH SÁCH GAME DO DEV TẠO RA (PHONG CÁCH CODEDEX) */}
            <section className="game-library-section">
                <div className="gl-container">
                    {/* Tiêu đề mang phong cách Pixel/Retro */}
                    <div className="gl-header">
                        <h2 className="gl-title">Khám phá hàng trăm bộ câu hỏi <br/> phù hợp với nhu cầu của bạn! </h2>
                        <p className="gl-subtitle">
                            Các bộ câu hỏi về nhiều chủ đề khác nhau do chúng tôi tạo ra.
                        </p>
                    </div>
                    {/* Thanh công cụ: Tìm kiếm & Bộ lọc */}
                    <div className="gl-toolbar">
                        <div className="gl-search">
                            <Search size={18} className="gl-search-icon" />
                            <input type="text" placeholder="Tìm kiếm game..." />
                        </div>
                        <div className="gl-filters">
                            <button className="gl-pill active">Phổ biến</button>
                            <button className="gl-pill">Toán</button>
                            <button className="gl-pill">Tiếng Anh</button>
                            <button className="gl-pill">Lịch sử</button>
                            <button className="gl-pill">Hoá học</button>
                        </div>
                    </div>

                    {/* Lưới thẻ Game */}
                    <div className="gl-grid">
                        {/* Thẻ 1 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-math">
                                {/* Chỗ này bạn sẽ thay bằng thẻ <img> chứa ảnh thật của game */}
                                <span>[Ảnh 1]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">TOÁN</span>
                                <h3 className="gl-card-title">Đại số tuyến tính</h3>
                                <p className="gl-card-desc">
                                    Ôn luyện đại số tuyến tính.
                                </p>
                                <div className="gl-badge">
                                    <Signal size={14} /> DỄ
                                </div>
                            </div>
                        </div>

                        {/* Thẻ 2 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-english">
                                <span>[Ảnh 2]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">TIẾNG ANH</span>
                                <h3 className="gl-card-title">Tổng ôn trung học phổ thông</h3>
                                <p className="gl-card-desc">
                                    Bộ câu hỏi dành cho ôn luyện THPTQG.
                                </p>
                                <div className="gl-badge">
                                    <BarChart2 size={14} /> TRUNG BÌNH
                                </div>
                            </div>
                        </div>

                        {/* Thẻ 3 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-science">
                                <span>[Ảnh 3]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">HOÁ HỌC</span>
                                <h3 className="gl-card-title">Hữu cơ cấp 3</h3>
                                <p className="gl-card-desc">
                                    Tổng ôn kiến thức về hữu cơ cấp 3.
                                </p>
                                <div className="gl-badge">
                                    <Zap size={14} /> KHÓ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* 4. KHU VỰC DANH SÁCH BỘ CÂU HỎI DO DEV CỘNG ĐỒNG TẠO RA (PHONG CÁCH CODEDEX) */}
            <section className="game-library-section">
                <div className="gl-container">
                    {/* Tiêu đề mang phong cách Pixel/Retro */}
                    <div className="gl-header">
                        <h2 className="gl-title">Không thích bộ câu hỏi của chúng tôi? <br/> Không phải lo! </h2>
                        <p className="gl-subtitle">
                            Thử sức với các câu hỏi đến từ cộng đồng hoặc <br/> tự tạo ra bộ câu hỏi của riêng bạn!
                        </p>
                    </div>
                    {/* Thanh công cụ: Tìm kiếm & Bộ lọc */}
                    <div className="gl-toolbar">
                        <div className="gl-search">
                            <Search size={18} className="gl-search-icon" />
                            <input type="text" placeholder="Tìm kiếm game..." />
                        </div>
                        <div className="gl-filters">
                            <button className="gl-pill active">Phổ biến</button>
                            <button className="gl-pill">Toán học</button>
                            <button className="gl-pill">Tiếng Anh</button>
                            <button className="gl-pill">Lịch sử</button>
                            <button className="gl-pill">Khoa học</button>
                        </div>
                    </div>

                    {/* Lưới thẻ Game */}
                    <div className="gl-grid">
                        {/* Thẻ 1 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-math">
                                {/* Chỗ này bạn sẽ thay bằng thẻ <img> chứa ảnh thật của game */}
                                <span>[Ảnh Game 1]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">MÔN TOÁN</span>
                                <h3 className="gl-card-title">Hành Trình Số Học</h3>
                                <p className="gl-card-desc">
                                    Tìm hiểu các nguyên lý cơ bản của phép tính như cộng, trừ, nhân, chia thông qua hành trình giải cứu vương quốc.
                                </p>
                                <div className="gl-badge">
                                    <Signal size={14} /> DỄ
                                </div>
                            </div>
                        </div>

                        {/* Thẻ 2 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-english">
                                <span>[Ảnh Game 2]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">TIẾNG ANH</span>
                                <h3 className="gl-card-title">Hiệp Sĩ Ngữ Pháp</h3>
                                <p className="gl-card-desc">
                                    Vượt qua các ải từ vựng và sắp xếp câu chuẩn xác để đánh bại rồng ma thuật.
                                </p>
                                <div className="gl-badge">
                                    <BarChart2 size={14} /> TRUNG BÌNH
                                </div>
                            </div>
                        </div>

                        {/* Thẻ 3 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-science">
                                <span>[Ảnh 3]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">GAME</span>
                                <h3 className="gl-card-title">Phòng Thí Nghiệm Điên Rồ</h3>
                                <p className="gl-card-desc">
                                    Thực hành kết hợp các nguyên tố hóa học để tạo ra các phản ứng thú vị và giải mã câu đố.
                                </p>
                                <div className="gl-badge">
                                    <Zap size={14} /> KHÓ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;