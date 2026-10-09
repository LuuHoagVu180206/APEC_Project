import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LandingPageLogic } from '../pages_logic/LandingPageLogic';
import '../pages_styling/LandingPageStyling.css';
import { Search, Signal, BarChart2, Zap, Sun, Moon, LogOut } from 'lucide-react';
const LandingPage = () => {
    const {
        navigate,
        isDark,
        toggleTheme,
        searchDev,
        setSearchDev,
        searchCommunity,
        setSearchCommunity,
        handleSearch
    } = LandingPageLogic();
    const [user, setUser] = useState(() => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            return savedUser?.username ? savedUser : null;
        } catch {
            return null;
        }
    });
    const [schoolMemberships, setSchoolMemberships] = useState([]);

    useEffect(() => {
        if (!user?.accessToken) return undefined;
        let isActive = true;
        axios.get('http://localhost:5000/api/schools/mine', {
            headers: { token: user.accessToken }
        }).then((response) => {
            if (isActive) setSchoolMemberships(response.data);
        }).catch(() => {});
        return () => { isActive = false; };
    }, [user]);

    const schoolActionLabel = schoolMemberships.length > 0 ? 'My School' : 'Join Your School';

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setSchoolMemberships([]);
        navigate('/');
    };
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
                    {user?.role === 'teacher' ? (
                        <div className="teacher-account-menu">
                            <Link className="nav-username" to="/profile">{user.username}</Link>
                            <div className="teacher-account-dropdown">
                                <Link to="/teacher/dashboard">Go to Dashboard</Link>
                                <Link to="/schools">{schoolActionLabel}</Link>
                                <button type="button" disabled title="Tính năng xác minh trường học sẽ được bổ sung sau">
                                    Verify official school
                                </button>
                                <button type="button" onClick={handleLogout}>
                                    <LogOut size={16} /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : user ? (
                        <>
                            {user.role === 'admin' && <Link className="btn-login" to="/admin">Quản trị hệ thống</Link>}
                            {user.role === 'user' && <Link className="school-nav-link" to="/schools">{schoolActionLabel}</Link>}
                            {user.role === 'user' && <Link className="class-nav-link" to="/student/classes">Join Class</Link>}
                            <Link className="nav-username" to="/profile">{user.username}</Link>
                            <button className="landing-logout" type="button" onClick={handleLogout} title="Đăng xuất" aria-label="Đăng xuất">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </button>
                    )}
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
                    <button className="btn-primary" onClick={() => navigate('/login?mode=register')}>
                        Đăng ký miễn phí ngay!
                    </button>
                    <button className="btn-teacher" onClick={() => navigate('/register/teacher')}>
                        Tôi là giáo viên
                    </button>
                </div>
            </header>

            {/* 3. KHU VỰC DANH SÁCH GAME DO DEV TẠO RA (PHONG CÁCH CODEDEX) */}
            <section className="game-library-section">
                <div className="gl-container">
                    <div className="gl-header">
                        <h2 className="gl-title">Khám phá hàng trăm bộ câu hỏi <br/> phù hợp với nhu cầu của bạn! </h2>
                        <p className="gl-subtitle">
                            Các bộ câu hỏi về nhiều chủ đề khác nhau do chúng tôi tạo ra.
                        </p>
                    </div>
                    
                    <div className="gl-toolbar">
                        <div className="gl-search">
                            <Search 
                                size={18} 
                                className="gl-search-icon" 
                                onClick={(e) => handleSearch(e, searchDev)}
                                style={{ cursor: 'pointer' }}
                            />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm game..." 
                                value={searchDev}
                                onChange={(e) => setSearchDev(e.target.value)}
                                onKeyDown={(e) => handleSearch(e, searchDev)}
                            />
                        </div>
                        <div className="gl-filters">
                            <button className="gl-pill active" onClick={(e) => handleSearch(e, searchDev, 'Phổ biến')}>Phổ biến</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchDev, 'Toán')}>Toán</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchDev, 'Tiếng Anh')}>Tiếng Anh</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchDev, 'Lịch sử')}>Lịch sử</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchDev, 'Hoá học')}>Hoá học</button>
                        </div>
                    </div>

                    <div className="gl-grid">
                        {/* Thẻ 1 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-math">
                                <span>[Ảnh 1]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">TOÁN</span>
                                <h3 className="gl-card-title">Đại số tuyến tính</h3>
                                <p className="gl-card-desc">Ôn luyện đại số tuyến tính.</p>
                                <div className="gl-badge"><Signal size={14} /> DỄ</div>
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
                                <p className="gl-card-desc">Bộ câu hỏi dành cho ôn luyện THPTQG.</p>
                                <div className="gl-badge"><BarChart2 size={14} /> TRUNG BÌNH</div>
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
                                <p className="gl-card-desc">Tổng ôn kiến thức về hữu cơ cấp 3.</p>
                                <div className="gl-badge"><Zap size={14} /> KHÓ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. KHU VỰC DANH SÁCH BỘ CÂU HỎI DO CỘNG ĐỒNG TẠO RA */}
            <section className="game-library-section">
                <div className="gl-container">
                    <div className="gl-header">
                        <h2 className="gl-title">Không thích bộ câu hỏi của chúng tôi? <br/> Không phải lo! </h2>
                        <p className="gl-subtitle">
                            Thử sức với các câu hỏi đến từ cộng đồng hoặc <br/> tự tạo ra bộ câu hỏi của riêng bạn!
                        </p>
                    </div>
                    
                    <div className="gl-toolbar">
                        <div className="gl-search">
                            <Search 
                                size={18} 
                                className="gl-search-icon" 
                                onClick={(e) => handleSearch(e, searchCommunity)}
                                style={{ cursor: 'pointer' }}
                            />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm game..." 
                                value={searchCommunity}
                                onChange={(e) => setSearchCommunity(e.target.value)}
                                onKeyDown={(e) => handleSearch(e, searchCommunity)}
                            />
                        </div>
                        <div className="gl-filters">
                            <button className="gl-pill active" onClick={(e) => handleSearch(e, searchCommunity, 'Phổ biến')}>Phổ biến</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchCommunity, 'Toán học')}>Toán học</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchCommunity, 'Tiếng Anh')}>Tiếng Anh</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchCommunity, 'Lịch sử')}>Lịch sử</button>
                            <button className="gl-pill" onClick={(e) => handleSearch(e, searchCommunity, 'Khoa học')}>Khoa học</button>
                        </div>
                    </div>

                    <div className="gl-grid">
                        {/* Thẻ 1 */}
                        <div className="gl-card">
                            <div className="gl-card-image placeholder-math">
                                <span>[Ảnh Game 1]</span>
                            </div>
                            <div className="gl-card-content">
                                <span className="gl-category">MÔN TOÁN</span>
                                <h3 className="gl-card-title">Hành Trình Số Học</h3>
                                <p className="gl-card-desc">Tìm hiểu các nguyên lý cơ bản của phép tính như cộng, trừ, nhân, chia thông qua hành trình giải cứu vương quốc.</p>
                                <div className="gl-badge"><Signal size={14} /> DỄ</div>
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
                                <p className="gl-card-desc">Vượt qua các ải từ vựng và sắp xếp câu chuẩn xác để đánh bại rồng ma thuật.</p>
                                <div className="gl-badge"><BarChart2 size={14} /> TRUNG BÌNH</div>
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
                                <p className="gl-card-desc">Thực hành kết hợp các nguyên tố hóa học để tạo ra các phản ứng thú vị và giải mã câu đố.</p>
                                <div className="gl-badge"><Zap size={14} /> KHÓ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;