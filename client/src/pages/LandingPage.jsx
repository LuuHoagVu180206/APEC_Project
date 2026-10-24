import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LandingPageLogic } from '../pages_logic/LandingPageLogic';
import '../pages_styling/LandingPageStyling.css';
import { 
    Search, 
    Sparkles, 
    Gamepad2, 
    Trophy, 
    BookOpen, 
    Users, 
    ArrowRight, 
    Sun, 
    Moon, 
    LogOut, 
    Compass, 
    Flame, 
    Shield, 
    Zap, 
    Award, 
    CheckCircle2, 
    GraduationCap, 
    Star, 
    Play, 
    BarChart2, 
    FolderPlus,
    Layers
} from 'lucide-react';

const LandingPage = () => {
    const {
        navigate,
        isDark,
        toggleTheme,
        searchDev,
        setSearchDev,
        searchCommunity,
        setSearchCommunity,
        selectedCategory,
        setSelectedCategory,
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

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setSchoolMemberships([]);
        navigate('/');
    };

    // Danh sách bộ câu hỏi mẫu hiển thị dạng card phong cách Codédex hiện đại
    const sampleQuestionSets = [
        {
            id: 'set-1',
            category: 'Toán học',
            title: 'Đại số Tuyến tính & Ma trận',
            desc: 'Chinh phục hệ phương trình, ma trận không gian và định thức qua các câu đố tư duy logic.',
            difficulty: 'Cơ bản',
            questionsCount: 20,
            xp: '+100 XP',
            iconType: 'math',
            badgeColor: 'emerald'
        },
        {
            id: 'set-2',
            category: 'Tiếng Anh',
            title: 'Tổng ôn THPT Quốc Gia & Từ vựng',
            desc: 'Nắm vững ngữ pháp cốt lõi, phrasal verbs và ngữ cảnh giao tiếp để bứt phá điểm số.',
            difficulty: 'Trung bình',
            questionsCount: 30,
            xp: '+150 XP',
            iconType: 'english',
            badgeColor: 'blue'
        },
        {
            id: 'set-3',
            category: 'Hoá học',
            title: 'Hóa Học Hữu Cơ & Phòng Thí Nghiệm',
            desc: 'Giải mã liên kết cacbon, phản ứng este hóa và chuỗi thí nghiệm giả kim kỳ thú.',
            difficulty: 'Thử thách',
            questionsCount: 25,
            xp: '+200 XP',
            iconType: 'chemistry',
            badgeColor: 'purple'
        },
        {
            id: 'set-4',
            category: 'Vật lý',
            title: 'Cơ học Cổ điển & Động lực học',
            desc: 'Khám phá các định luật chuyển động Newton, thế năng và quy luật va chạm trong vũ trụ.',
            difficulty: 'Cơ bản',
            questionsCount: 18,
            xp: '+90 XP',
            iconType: 'physics',
            badgeColor: 'emerald'
        },
        {
            id: 'set-5',
            category: 'Lịch sử',
            title: 'Dấu ấn Kỷ nguyên Đại Việt',
            desc: 'Du hành thời gian qua các triều đại lịch sử hào hùng cùng hệ thống tư liệu và câu đố sinh động.',
            difficulty: 'Trung bình',
            questionsCount: 22,
            xp: '+120 XP',
            iconType: 'history',
            badgeColor: 'blue'
        },
        {
            id: 'set-6',
            category: 'Tin học',
            title: 'Tư duy Thuật toán & Cấu trúc Dữ liệu',
            desc: 'Rèn luyện tư duy lập trình từ các thuật toán sắp xếp, ngăn xếp đến cấu trúc cây phân nhánh.',
            difficulty: 'Thử thách',
            questionsCount: 20,
            xp: '+180 XP',
            iconType: 'tech',
            badgeColor: 'purple'
        }
    ];

    // Lọc bộ câu hỏi theo tab đang chọn và từ khóa tìm kiếm
    const filteredSets = sampleQuestionSets.filter((item) => {
        const matchesCategory = selectedCategory === 'Tất cả' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesSearch = !searchDev || item.title.toLowerCase().includes(searchDev.toLowerCase()) || item.desc.toLowerCase().includes(searchDev.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categoryList = ['Tất cả', 'Toán học', 'Tiếng Anh', 'Hoá học', 'Vật lý', 'Lịch sử', 'Tin học'];

    return (
        <div className="landing-wrapper">
            {/* 1. NAVBAR - THIẾT KẾ HIỆN ĐẠI THEO PHONG CÁCH CODEDEX */}
            <header className="navbar">
                <div className="nav-container">
                    <div className="nav-left">
                        <div className="brand-logo" onClick={() => navigate('/')}>
                            <div className="brand-coin">
                                <Sparkles size={18} />
                            </div>
                            <span className="brand-name">EasyLearn</span>
                        </div>

                        <nav className="nav-links">
                            <a href="#catalog" className="nav-link">Khám phá</a>
                            <Link to="/library" className="nav-link">Thư viện</Link>
                            <Link to="/leaderboard" className="nav-link">Bảng xếp hạng</Link>
                            <Link to="/schools" className="nav-link">Trường học</Link>
                            <Link to="/studio" className="nav-link">Studio</Link>
                        </nav>
                    </div>

                    <div className="nav-right">
                        <button 
                            className="theme-toggle-btn"
                            onClick={toggleTheme} 
                            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={19} /> : <Moon size={19} />}
                        </button>

                        {user?.role === 'teacher' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">{user.username.charAt(0).toUpperCase()}</span>
                                    <span>{user.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    <Link to="/teacher/dashboard">Bảng điều khiển giáo viên</Link>
                                    <Link to="/schools">{schoolActionLabel}</Link>
                                    <Link to="/studio">Studio tạo bộ đề</Link>
                                    <button type="button" onClick={handleLogout} className="logout-btn">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : user?.role === 'user' || user?.role === 'admin' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">{user.username.charAt(0).toUpperCase()}</span>
                                    <span>{user.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    {user.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
                                    <Link to="/schools">{schoolActionLabel}</Link>
                                    <Link to="/student/classes">Lớp học của tôi</Link>
                                    <Link to="/game">Chơi Game Quiz</Link>
                                    <button type="button" onClick={handleLogout} className="logout-btn">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <button className="btn-secondary-nav" onClick={() => navigate('/login')}>
                                    Đăng nhập
                                </button>
                                <button className="btn-primary-nav" onClick={() => navigate('/login?mode=register')}>
                                    Bắt đầu ngay
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION - HÀNH TRÌNH CHINH PHỤC TRI THỨC */}
            <section className="hero-section">
                <div className="hero-backdrop-glow"></div>
                <div className="hero-content">
                    <div className="hero-pill-badge">
                        <Sparkles size={15} className="sparkle-icon" />
                        <span>Hành trình học tập tương tác & trò chơi hoá</span>
                    </div>

                    <h1 className="hero-title">
                        Khởi Đầu Chuyến Phiêu Lưu <br />
                        <span className="hero-highlight">Chinh Phục Tri Thức</span>
                    </h1>

                    <p className="hero-subtitle">
                        Phương pháp ôn luyện và làm trắc nghiệm cuốn hút nhất. Vừa chơi game, vừa tích lũy điểm kinh nghiệm, mở khóa huy hiệu và thăng tiến cùng bạn bè trong lớp học!
                    </p>

                    <div className="hero-actions">
                        <button className="btn-codedex-primary" onClick={() => navigate(user ? '/game' : '/login?mode=register')}>
                            <Gamepad2 size={20} />
                            <span>Bắt đầu chơi ngay</span>
                        </button>
                        <button className="btn-codedex-secondary" onClick={() => navigate('/register/teacher')}>
                            <GraduationCap size={20} />
                            <span>Dành cho Giáo viên</span>
                        </button>
                    </div>

                    {/* Banner hiển thị thẻ Game Quest giả lập tương tác */}
                    <div className="hero-stage-card">
                        <div className="stage-card-header">
                            <div className="stage-dots">
                                <span className="dot dot-red"></span>
                                <span className="dot dot-yellow"></span>
                                <span className="dot dot-green"></span>
                            </div>
                            <span className="stage-title">MÀN ĐẤU TRÍ TRỰC QUAN • CẤP ĐỘ 1-1</span>
                            <div className="stage-xp-tag">+100 XP</div>
                        </div>
                        <div className="stage-card-body">
                            <div className="stage-left">
                                <div className="character-display">
                                    <div className="avatar-circle">
                                        <Compass size={28} />
                                    </div>
                                    <div className="character-info">
                                        <h4>Nhà Thám Hiểm Tri Thức</h4>
                                        <div className="xp-bar-wrapper">
                                            <div className="xp-bar-fill" style={{ width: '70%' }}></div>
                                        </div>
                                        <span className="xp-text">700 / 1000 XP (Cấp 5)</span>
                                    </div>
                                </div>
                                <p className="stage-mission">
                                    Nhiệm vụ: Hoàn thành 10 câu hỏi thử thách để phá khóa rương báu vật phẩm học tập!
                                </p>
                            </div>
                            <div className="stage-right">
                                <button className="btn-stage-play" onClick={() => navigate('/game')}>
                                    <Play size={18} fill="currentColor" />
                                    <span>Vào Chơi Game</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Social proof bar */}
                    <div className="hero-trust-bar">
                        <span className="trust-label">ĐỒNG HÀNH CÙNG</span>
                        <div className="trust-items">
                            <span className="trust-badge"><Shield size={14} /> 500+ Lớp học</span>
                            <span className="trust-badge"><Users size={14} /> Cộng đồng Giáo viên</span>
                            <span className="trust-badge"><Award size={14} /> Mini-LMS Chuẩn hóa</span>
                            <span className="trust-badge"><Flame size={14} /> Đua Top Bảng Vàng</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. KHÁM PHÁ BỘ CÂU HỎI (CATALOG SECTION THEO BỐ CỤC CODEDEX) */}
            <section className="catalog-section" id="catalog">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Khám phá hàng trăm bộ câu hỏi tương tác miễn phí
                        </h2>
                        <p className="section-subtitle">
                            Học tập và rèn luyện qua các bộ đề chất lượng cao được thiết kế bài bản theo từng chủ đề và cấp độ.
                        </p>
                    </div>

                    {/* Toolbar tìm kiếm & lọc category phong cách Codédex */}
                    <div className="catalog-toolbar">
                        <div className="search-box">
                            <Search 
                                size={18} 
                                className="search-icon" 
                                onClick={(e) => handleSearch(e, searchDev, selectedCategory)}
                            />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm bộ câu hỏi, chủ đề, môn học..." 
                                value={searchDev}
                                onChange={(e) => setSearchDev(e.target.value)}
                                onKeyDown={(e) => handleSearch(e, searchDev, selectedCategory)}
                            />
                        </div>

                        <div className="filter-pills">
                            {categoryList.map((cat) => (
                                <button 
                                    key={cat}
                                    className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lưới thẻ Quest Cards (2 hàng 3 cột) */}
                    <div className="quest-grid">
                        {filteredSets.length > 0 ? (
                            filteredSets.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="quest-card"
                                    onClick={() => navigate(`/library?search=${encodeURIComponent(item.title)}`)}
                                >
                                    <div className={`quest-card-banner banner-${item.iconType}`}>
                                        <div className="banner-icon-badge">
                                            {item.iconType === 'math' && <BarChart2 size={24} />}
                                            {item.iconType === 'english' && <BookOpen size={24} />}
                                            {item.iconType === 'chemistry' && <Zap size={24} />}
                                            {item.iconType === 'physics' && <Compass size={24} />}
                                            {item.iconType === 'history' && <Shield size={24} />}
                                            {item.iconType === 'tech' && <Layers size={24} />}
                                        </div>
                                        <span className="banner-xp-badge">{item.xp}</span>
                                    </div>

                                    <div className="quest-card-body">
                                        <span className="quest-category">{item.category}</span>
                                        <h3 className="quest-title">{item.title}</h3>
                                        <p className="quest-desc">{item.desc}</p>
                                        
                                        <div className="quest-card-footer">
                                            <div className={`difficulty-badge badge-${item.badgeColor}`}>
                                                <Star size={13} fill="currentColor" />
                                                <span>{item.difficulty}</span>
                                            </div>
                                            <span className="quest-meta-count">{item.questionsCount} câu hỏi</span>
                                            <span className="quest-action-link">
                                                Luyện tập <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-catalog-message">
                                <p>Không tìm thấy bộ câu hỏi nào phù hợp với từ khóa "{searchDev}".</p>
                                <button className="btn-reset-filter" onClick={() => { setSearchDev(""); setSelectedCategory("Tất cả"); }}>
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="catalog-bottom-action">
                        <button className="btn-view-all-library" onClick={() => navigate('/library')}>
                            <span>Xem toàn bộ thư viện câu hỏi</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. BẢN ĐỒ THẾ GIỚI TRI THỨC & THỐNG KÊ (CODEDEX MAP SHOWCASE) */}
            <section className="world-map-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Hành trình phiêu lưu qua thế giới tri thức
                        </h2>
                        <p className="section-subtitle">
                            Mỗi môn học là một vùng đất mới cần khám phá: vượt qua các thử thách, thu thập điểm kinh nghiệm và thăng hạng nhân vật của bạn!
                        </p>
                    </div>

                    {/* Khung bản đồ phiêu lưu đồ họa hiện đại (Vector Island Nodes) */}
                    <div className="world-map-showcase">
                        <div className="map-canvas">
                            <div className="island-node island-math">
                                <div className="island-beacon"></div>
                                <div className="island-badge">
                                    <BarChart2 size={18} />
                                    <span>Vương quốc Số Học</span>
                                </div>
                            </div>

                            <div className="map-path path-1"></div>

                            <div className="island-node island-languages">
                                <div className="island-beacon"></div>
                                <div className="island-badge">
                                    <BookOpen size={18} />
                                    <span>Quần đảo Ngôn Ngữ</span>
                                </div>
                            </div>

                            <div className="map-path path-2"></div>

                            <div className="island-node island-science">
                                <div className="island-beacon active-beacon"></div>
                                <div className="island-badge featured-island">
                                    <Zap size={18} />
                                    <span>Thung lũng Giả Kim</span>
                                </div>
                            </div>

                            <div className="map-path path-3"></div>

                            <div className="island-node island-history">
                                <div className="island-beacon"></div>
                                <div className="island-badge">
                                    <Shield size={18} />
                                    <span>Pháo đài Lịch Sử</span>
                                </div>
                            </div>

                            <div className="map-path path-4"></div>

                            <div className="island-node island-tech">
                                <div className="island-beacon"></div>
                                <div className="island-badge">
                                    <Layers size={18} />
                                    <span>Thành phố Thuật Toán</span>
                                </div>
                            </div>

                            <div className="map-center-cta">
                                <button className="btn-start-quest" onClick={() => navigate('/game')}>
                                    <Play size={20} fill="currentColor" />
                                    <span>Bắt đầu cuộc hành trình</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Thanh 4 thông số thống kê ấn tượng (Codédex Stats Bar) */}
                    <div className="stats-counter-bar">
                        <div className="stat-item">
                            <h3 className="stat-number stat-yellow">10,000+</h3>
                            <p className="stat-label">Học viên tham gia</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number stat-emerald">500+</h3>
                            <p className="stat-label">Lớp học & Trường học</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number stat-blue">25,000+</h3>
                            <p className="stat-label">Câu đố tương tác</p>
                        </div>
                        <div className="stat-item">
                            <h3 className="stat-number stat-purple">98%</h3>
                            <p className="stat-label">Tăng hứng thú học tập</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. TÍNH NĂNG NỔI BẬT (Z-PATTERN FEATURE SPOTLIGHT - THEO CODEDEX) */}
            <section className="features-spotlight-section">
                <div className="section-container">
                    {/* Feature 1: Level up your learning */}
                    <div className="feature-row">
                        <div className="feature-visual">
                            <div className="gamer-profile-card">
                                <div className="gamer-header">
                                    <div className="gamer-avatar">
                                        <Trophy size={26} className="trophy-icon" />
                                    </div>
                                    <div className="gamer-details">
                                        <h4 className="gamer-name">Alex Minh Triết</h4>
                                        <span className="gamer-rank">Cấp độ 7 • Nhà Thám Hiểm</span>
                                    </div>
                                    <div className="gamer-level-badge">LVL 7</div>
                                </div>

                                <div className="gamer-xp-box">
                                    <div className="xp-labels">
                                        <span>Tiến trình thăng cấp</span>
                                        <span className="xp-digits">1,450 / 2,000 XP</span>
                                    </div>
                                    <div className="xp-meter">
                                        <div className="xp-meter-fill" style={{ width: '72%' }}></div>
                                    </div>
                                </div>

                                <div className="gamer-badges-shelf">
                                    <span className="shelf-title">Huy hiệu đã đạt được:</span>
                                    <div className="shelf-badges">
                                        <div className="shelf-badge" title="Chiến binh Đại số">📐 Số Học</div>
                                        <div className="shelf-badge" title="Hiệp sĩ Ngữ pháp">📖 Ngữ Pháp</div>
                                        <div className="shelf-badge" title="Chuỗi 7 ngày thắng">🔥 7 Days</div>
                                        <div className="shelf-badge" title="Bậc thầy Tốc độ">⚡ Speed</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="feature-text">
                            <span className="feature-eyebrow">THĂNG CẤP BÀI HỌC</span>
                            <h2 className="feature-heading">
                                Học tập như chơi một tựa game nhập vai yêu thích
                            </h2>
                            <p className="feature-description">
                                Tạo dựng hồ sơ cá nhân, nhận điểm kinh nghiệm (XP) sau mỗi màn trả lời chính xác và mở khóa các huy hiệu vinh danh. Biến mỗi buổi ôn bài trở thành một chuỗi nhiệm vụ thú vị mà bạn muốn hoàn thành mỗi ngày!
                            </p>
                            <ul className="feature-perks">
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Tích lũy XP và lên cấp nhân vật sau mỗi trận đấu quiz.</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Ghi tên trên Bảng xếp hạng tuần để tranh tài cùng cả lớp.</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Theo dõi lịch sử chơi và chuỗi phong độ ôn thi chi tiết.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2: Practice your chops */}
                    <div className="feature-row reverse">
                        <div className="feature-visual">
                            <div className="interactive-quiz-preview">
                                <div className="quiz-preview-header">
                                    <span className="quiz-pill-category">TOÁN HỌC • CÂU HỎI #05</span>
                                    <div className="quiz-reward-pill">+20 XP</div>
                                </div>
                                <h3 className="quiz-preview-question">
                                    Nghiệm nguyên dương của phương trình 2x + 6 = 14 là bao nhiêu?
                                </h3>
                                <div className="quiz-options-list">
                                    <div className="quiz-option">
                                        <span className="opt-label">A</span>
                                        <span className="opt-text">x = 2</span>
                                    </div>
                                    <div className="quiz-option correct-glow">
                                        <span className="opt-label opt-label-correct">B</span>
                                        <span className="opt-text">x = 4</span>
                                        <span className="correct-tag">✓ Chính xác!</span>
                                    </div>
                                    <div className="quiz-option">
                                        <span className="opt-label">C</span>
                                        <span className="opt-text">x = 6</span>
                                    </div>
                                    <div className="quiz-option">
                                        <span className="opt-label">D</span>
                                        <span className="opt-text">x = 8</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="feature-text">
                            <span className="feature-eyebrow">LUYỆN TẬP THỰC CHIẾN</span>
                            <h2 className="feature-heading">
                                Rèn luyện phản xạ với phản hồi trực quan tức thì
                            </h2>
                            <p className="feature-description">
                                Không còn cảm giác làm đề thi khô khan hay căng thẳng. Từng câu hỏi trắc nghiệm đều được mô phỏng sinh động, đi kèm cơ chế chấm điểm và phân tích lập tức, giúp học sinh nhớ lâu và hiểu sâu bản chất vấn đề.
                            </p>
                            <ul className="feature-perks">
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Đa dạng câu hỏi trắc nghiệm với thời gian bấm giờ kịch tính.</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Phân tích đáp án rõ ràng ngay sau khi hoàn thành.</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Lưu lại những câu hỏi hay vào bộ sưu tập cá nhân.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. DÀNH CHO GIÁO VIÊN & NHÀ TRƯỜNG (STUDIO & CLASSROOM CALL TO ACTION) */}
            <section className="teacher-cta-section">
                <div className="section-container">
                    <div className="teacher-cta-card">
                        <div className="teacher-cta-content">
                            <span className="teacher-tag">HỆ SINH THÁI GIÁO VIÊN & LỚP HỌC</span>
                            <h2 className="teacher-cta-title">
                                Sáng tạo bộ đề thi của riêng bạn và quản lý lớp học dễ dàng
                            </h2>
                            <p className="teacher-cta-desc">
                                Dễ dàng tạo bộ câu hỏi trong Studio, xuất ra file PDF hoặc Excel chuyên nghiệp chỉ với 1 click, cấp mã lớp 8 ký tự cho học sinh tham gia và theo dõi tiến độ học tập toàn diện.
                            </p>
                            <div className="teacher-actions">
                                <button className="btn-teacher-primary" onClick={() => navigate('/studio')}>
                                    <FolderPlus size={18} />
                                    <span>Vào Studio tạo bộ đề</span>
                                </button>
                                <button className="btn-teacher-outline" onClick={() => navigate('/register/teacher')}>
                                    <Users size={18} />
                                    <span>Đăng ký làm giáo viên</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. FOOTER HIỆN ĐẠI THEO PHONG CÁCH CODEDEX */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-top">
                        <div className="footer-brand">
                            <div className="brand-logo" onClick={() => navigate('/')}>
                                <div className="brand-coin">
                                    <Sparkles size={16} />
                                </div>
                                <span className="brand-name">EasyLearn</span>
                            </div>
                            <p className="footer-tagline">
                                Nền tảng học tập kết hợp trò chơi hóa - Chinh phục tri thức qua từng màn chơi.
                            </p>
                        </div>

                        <div className="footer-nav-groups">
                            <div className="footer-col">
                                <h4>Khám phá</h4>
                                <a href="#catalog">Bộ câu hỏi</a>
                                <Link to="/library">Thư viện cộng đồng</Link>
                                <Link to="/game">Game Quiz</Link>
                                <Link to="/leaderboard">Bảng xếp hạng</Link>
                            </div>

                            <div className="footer-col">
                                <h4>Nhà trường & Lớp</h4>
                                <Link to="/schools">Cộng đồng trường</Link>
                                <Link to="/student/classes">Lớp học</Link>
                                <Link to="/teacher/dashboard">Bảng giáo viên</Link>
                                <Link to="/studio">Studio tạo đề</Link>
                            </div>

                            <div className="footer-col">
                                <h4>Hệ thống</h4>
                                <Link to="/login">Đăng nhập</Link>
                                <Link to="/login?mode=register">Đăng ký thành viên</Link>
                                <Link to="/forgot-password">Khôi phục mật khẩu</Link>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2026 EasyLearn (APEC Project). All rights reserved.</p>
                        <div className="footer-bottom-links">
                            <span>Giao diện hiện tại: <strong>{isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}</strong></span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
