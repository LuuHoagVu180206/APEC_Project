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
    Users, 
    ArrowRight, 
    ArrowUpRight, 
    Sun, 
    Moon, 
    LogOut, 
    CheckCircle2, 
    GraduationCap, 
    FolderPlus, 
    X 
} from 'lucide-react';
import { getBentoIllustration } from '../components/BentoIllustration';
import toanImg from '../assets/Toan.png';
import vatLiImg from '../assets/VatLi.png';
import hoaHocImg from '../assets/HoaHoc.png';
import sinhHocImg from '../assets/SinhHoc.png';
import tiengAnhImg from '../assets/TiengAnh.png';
import tiengVietImg from '../assets/TiengViet.png';
import lichSuImg from '../assets/LichSu.png';
import gameLearningMapImg from '../assets/collage_updated_water_scene.png';



// Hàm lấy hình ảnh minh họa tương ứng từ assets
const getSubjectAsset = (topic) => {
    const t = (topic || '').toLowerCase();
    if (t.includes('toán') || t.includes('math')) return toanImg;
    if (t.includes('vật lý') || t.includes('vật lí') || t.includes('lý') || t.includes('physics')) return vatLiImg;
    if (t.includes('hóa') || t.includes('hoá') || t.includes('chemistry')) return hoaHocImg;
    if (t.includes('sinh') || t.includes('biology')) return sinhHocImg;
    if (t.includes('anh') || t.includes('english')) return tiengAnhImg;
    if (t.includes('việt') || t.includes('văn') || t.includes('literature')) return tiengVietImg;
    if (t.includes('sử') || t.includes('history')) return lichSuImg;
    return toanImg;
};

const LandingPage = () => {
    const {
        navigate,
        isDark,
        toggleTheme,
        searchDev,
        setSearchDev,
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
    const [weeklySets, setWeeklySets] = useState([]);

    const splitTitleLines = (title) => {
        if (!title) return ['Sự Kiện Tuần'];
        if (title.includes('&')) {
            const parts = title.split('&');
            return [parts[0].trim(), parts[1].trim()];
        }
        if (title.includes(' - ')) {
            const parts = title.split(' - ');
            return [parts[0].trim(), parts[1].trim()];
        }
        const words = title.split(' ');
        if (words.length > 3) {
            const mid = Math.ceil(words.length / 2);
            return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
        }
        return [title];
    };

    useEffect(() => {
        axios.get('http://localhost:5000/api/sets/weekly')
            .then(res => setWeeklySets(res.data || []))
            .catch(() => {});
    }, []);

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

    // 7 Bộ câu hỏi chính thức (Default) của APEC Group làm fallback
    const defaultApecQuestionSets = [
        {
            _id: 'def-toan',
            title: 'Đại Số & Hình Học Đột Phá - APEC Group',
            topic: 'Toán',
            description: 'Bộ đề Toán học chuẩn mực do APEC Group biên soạn: rèn luyện tư duy logic, hàm số, giải tích và hình học không gian.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        },
        {
            _id: 'def-ly',
            title: 'Vật Lý Đại Cương & Vũ Trụ Ứng Dụng - APEC Group',
            topic: 'Vật lý',
            description: 'Tổng hợp các quy luật cơ học Newton, nhiệt học, quang học và sóng âm kỳ thú do APEC Group xây dựng.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        },
        {
            _id: 'def-hoa',
            title: 'Hóa Học Kỳ Thú & Thế Giới Nguyên Tử - APEC Group',
            topic: 'Hoá học',
            description: 'Chinh phục bảng tuần hoàn Men-đê-lê-ép, phản ứng este hoá và hoá học hữu cơ cùng APEC Group.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        },
        {
            _id: 'def-sinh',
            title: 'Sinh Học & Bí Ẩn Thế Giới Sống - APEC Group',
            topic: 'Sinh học',
            description: 'Khám phá thế giới tế bào, ADN di truyền, cơ thể người và hệ sinh thái đa dạng do APEC Group tuyển chọn.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        },
        {
            _id: 'def-tienganh',
            title: 'Tiếng Anh Chuẩn Quốc Tế & Giao Tiếp - APEC Group',
            topic: 'Tiếng Anh',
            description: 'Luyện phản xạ từ vựng, ngữ pháp cốt lõi và thành ngữ tiếng Anh thông dụng cùng APEC Group.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        },
        {
            _id: 'def-tiengviet',
            title: 'Tiếng Việt & Tinh Hoa Văn Học Dân Tộc - APEC Group',
            topic: 'Tiếng Việt',
            description: 'Tổng hợp vẻ đẹp ca dao, thành ngữ, biện pháp tu từ và tác phẩm văn học Việt Nam do APEC Group xây dựng.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        },
        {
            _id: 'def-su',
            title: 'Lịch Sử Dân Tộc & Những Trang Sử Hào Hùng - APEC Group',
            topic: 'Lịch sử',
            description: 'Hành trình qua các thời khắc lịch sử dựng nước và giữ nước oai hùng của dân tộc Việt Nam do APEC Group đúc kết.',
            questionsCount: 10,
            badge: 'APEC Official',
            likesCount: 99,
            isDefault: true,
            authorName: 'APEC Group'
        }
    ];

    // Danh sách toàn bộ các bộ câu hỏi đồng bộ với Database / Thư viện
    const [publicQuestionSets, setPublicQuestionSets] = useState(defaultApecQuestionSets);

    // Lấy bộ đề chuẩn từ Database (defaults hoặc library)
    useEffect(() => {
        axios.get('http://localhost:5000/api/sets/defaults')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setPublicQuestionSets(res.data);
                } else {
                    axios.get('http://localhost:5000/api/sets/library')
                        .then(resLib => {
                            if (resLib.data && resLib.data.length > 0) {
                                setPublicQuestionSets(resLib.data.slice(0, 7));
                            }
                        })
                        .catch(() => {});
                }
            })
            .catch(() => {
                axios.get('http://localhost:5000/api/sets/library')
                    .then(resLib => {
                        if (resLib.data && resLib.data.length > 0) {
                            setPublicQuestionSets(resLib.data.slice(0, 7));
                        }
                    })
                    .catch(() => {});
            });
    }, []);

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
                            <Link to="/student/classes" className="nav-link">Lớp học</Link>
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
                                    <span className="user-avatar-badge">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="user-avatar-img-nav" />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                    <span>{user.displayName || user.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    <Link to="/teacher/dashboard">Bảng điều khiển giáo viên</Link>
                                    <Link to="/schools">{schoolActionLabel}</Link>
                                    <Link to="/studio">Studio tạo bộ đề</Link>
                                    <Link to="/profile">Hồ sơ cá nhân</Link>
                                    <button type="button" onClick={handleLogout} className="logout-btn">
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : user?.role === 'user' || user?.role === 'admin' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="user-avatar-img-nav" />
                                        ) : (
                                            user.username.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                    <span>{user.displayName || user.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    {user.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
                                    <Link to="/schools">{schoolActionLabel}</Link>
                                    <Link to="/student/classes">Lớp học của tôi</Link>
                                    <Link to="/game">Chơi Game Quiz</Link>
                                    <Link to="/profile">Hồ sơ cá nhân</Link>
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

                {/* HERO BANNER - BỐ CỤC KHÔNG KHUNG VỚI BACKGROUND ARTWORK MỚI */}
                <div className="hero-banner-wrap">
                    <div className="hero-banner-inner">
                    <div className="hero-text-content">
                        <h1 className="hero-title">
                            <span className="hero-title-main">KHỞI ĐẦU CHUYẾN PHIÊU LƯU</span>
                            <span className="hero-highlight">CHINH PHỤC TRI THỨC</span>
                        </h1>

                        <p className="hero-subtitle">
                            Phương pháp ôn luyện và làm trắc nghiệm cuốn hút nhất. Vừa chơi game, vừa rèn luyện tư duy, mở khóa huy hiệu và đồng hành cùng bạn bè trong lớp học!
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
                    </div>
                </div>

                </div>

                {/* KHU VỰC THỬ THÁCH TUẦN TRONG HERO (BENTO-GRID HIỆN ĐẠI THEO ẢNH MẪU) */}
                <div className="hero-weekly-section">
                    <div className="hero-weekly-header">
                        <div className="hero-weekly-left">
                            <h3 className="hero-weekly-heading">Thử Thách Đấu Trí Hàng Tuần (Weekly Challenge)</h3>
                        </div>
                        <Link to="/leaderboard" className="hero-weekly-link">
                            <Trophy size={15} />
                            <span>Xem Bảng Xếp Hạng Tuần</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="hero-weekly-bento-grid">
                        {(weeklySets.length > 0 ? weeklySets : [
                            { _id: 'w1', weekNumber: 1, title: 'Thử Thách Tuần 01: Vũ Trụ Bí Ẩn & Khoa Học Không Gian', topic: 'Thiên văn học', questionsCount: 8, authorName: 'APEC Group' },
                            { _id: 'w2', weekNumber: 2, title: 'Thử Thách Tuần 02: Bí Ẩn Đại Dương & Đa Dạng Sinh Thái', topic: 'Khoa học Tự nhiên', questionsCount: 8, authorName: 'APEC Group' },
                            { _id: 'w3', weekNumber: 3, title: 'Thử Thách Tuần 03: Đấu Trí Trí Tuệ Nhân Tạo & Cách Mạng 4.0', topic: 'Công nghệ AI', questionsCount: 8, authorName: 'APEC Group' },
                            { _id: 'w4', weekNumber: 4, title: 'Thử Thách Tuần 04: Đấu Trường Logic & Toán Ứng Dụng', topic: 'Toán học & Logic', questionsCount: 8, authorName: 'APEC Group' }
                        ]).map((w, index) => {
                            const variants = ['light', 'blue', 'dark', 'light', 'blue', 'dark'];
                            const variant = variants[index % variants.length];

                            return (
                                <div 
                                    key={w._id || index} 
                                    className={`hero-bento-card variant-${variant}`} 
                                    onClick={() => navigate(w._id && !w._id.startsWith('w') ? `/set/${w._id}` : '/library')}
                                >
                                    <div className="bento-card-top">
                                        <span className="bento-card-tag">{w.topic || 'Sự kiện'}</span>
                                        <span className="bento-card-topic">{w.questions?.length ? `${w.questions.length} câu hỏi` : (w.authorName || 'APEC Group')}</span>
                                    </div>

                                    <div className="bento-title-wrapper">
                                        <h4 className="bento-title-group">
                                            {splitTitleLines(w.title).map((line, lIdx) => (
                                                <span key={lIdx} className="bento-title-highlight">
                                                    {line}
                                                </span>
                                            ))}
                                        </h4>
                                    </div>

                                    <div className="bento-art-container">
                                        {getBentoIllustration(w.topic, index, variant)}
                                    </div>

                                    <div className="bento-cta-wrapper">
                                        <button 
                                            type="button" 
                                            className="btn-bento-play-now" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(w._id ? `/game?setId=${w._id}` : '/game');
                                            }}
                                            title="Luyện tập ngay"
                                        >
                                            <div className="bento-cta-circle">
                                                <ArrowUpRight size={17} strokeWidth={2.5} />
                                            </div>
                                            <span className="bento-cta-label">Luyện tập</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 3. KHÁM PHÁ BỘ CÂU HỎI (ĐỒNG BỘ CSDL & TÌM KIẾM TRUYỀN SANG THƯ VIỆN) */}
            <section className="catalog-section" id="catalog">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Khám phá hàng trăm bộ câu hỏi tương tác miễn phí
                        </h2>
                        <p className="section-subtitle">
                            Rèn luyện và tranh tài cùng cộng đồng qua các bộ đề chất lượng cao từ APEC Group và giáo viên trên cả nước.
                        </p>
                    </div>

                    {/* Toolbar tìm kiếm chuyển tiếp sang thư viện (không cần popover lọc) */}
                    <div className="catalog-toolbar">
                        <form 
                            className="catalog-search-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (searchDev && searchDev.trim()) {
                                    navigate(`/library?search=${encodeURIComponent(searchDev.trim())}`);
                                } else {
                                    navigate('/library');
                                }
                            }}
                        >
                            <div className="search-box">
                                <Search size={18} className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm bộ câu hỏi trong Thư viện..." 
                                    value={searchDev}
                                    onChange={(e) => setSearchDev(e.target.value)}
                                />
                                {searchDev && (
                                    <button 
                                        type="button" 
                                        className="btn-clear-search-kw"
                                        onClick={() => setSearchDev('')}
                                        title="Xóa từ khóa"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>
                            <button type="submit" className="btn-catalog-search-submit">
                                <Search size={16} />
                                <span>Tìm kiếm trong Thư viện</span>
                            </button>
                        </form>
                    </div>

                    {/* Lưới Bento-Grid Thẻ Bộ Câu Hỏi (đồng bộ UI thẻ giống Weekly Challenge) */}
                    <div className="hero-weekly-bento-grid">
                        {publicQuestionSets.map((item, index) => {
                            const variants = ['light', 'blue', 'dark'];
                            const variant = variants[index % variants.length];
                            const author = item.authorName || item.owner?.displayName || item.owner?.username || 'APEC Group';
                            const questionsCount = item.questions?.length ?? item.questionsCount ?? 10;

                            return (
                                <div 
                                    key={item._id || item.id || index} 
                                    className={`hero-bento-card variant-${variant}`}
                                    onClick={() => {
                                        if (item._id && !item._id.startsWith('def-')) {
                                            navigate(`/set/${item._id}`);
                                        } else {
                                            navigate(`/library?search=${encodeURIComponent(item.title)}`);
                                        }
                                    }}
                                >
                                    {/* Metadata trên cùng: Topic badge & Số câu hỏi / Tác giả */}
                                    <div className="bento-card-top">
                                        <span className="bento-card-tag">{item.topic || 'Chủ đề'}</span>
                                        <span className="bento-card-topic">{questionsCount} câu hỏi • {author}</span>
                                    </div>

                                    {/* Tiêu đề có hiệu ứng highlight */}
                                    <div className="bento-title-wrapper">
                                        <h4 className="bento-title-group">
                                            {splitTitleLines(item.title).map((line, lIdx) => (
                                                <span key={lIdx} className="bento-title-highlight">
                                                    {line}
                                                </span>
                                            ))}
                                        </h4>
                                    </div>

                                    {/* Hình ảnh minh họa môn học nhỏ gọn tại góc thẻ */}
                                    <div className="bento-art-container">
                                        <img 
                                            src={getSubjectAsset(item.topic)} 
                                            alt={item.topic || 'Minh họa'} 
                                            className="bento-subject-asset-img"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Nút Luyện tập riêng biệt (bấm vào là chơi ngay, không mở trang bộ câu hỏi) */}
                                    <div className="bento-cta-wrapper">
                                        <button 
                                            type="button" 
                                            className="btn-bento-play-now"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(item._id && !item._id.startsWith('def-') ? `/game?setId=${item._id}` : '/game');
                                            }}
                                            title="Luyện tập ngay"
                                        >
                                            <div className="bento-cta-circle">
                                                <ArrowUpRight size={17} strokeWidth={2.5} />
                                            </div>
                                            <span className="bento-cta-label">Luyện tập</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="catalog-bottom-action">
                        <button className="btn-view-all-library" onClick={() => navigate('/library')}>
                            <span>Xem toàn bộ thư viện câu hỏi</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            

            {/* 5. TÍNH NĂNG NỔI BẬT (TRÒ CHƠI HÓA HỌC TẬP TƯƠNG TÁC) */}
            <section className="features-spotlight-section">
                <div className="section-container">
                    <div className="feature-row">
                        <div className="feature-visual">
                            <div className="feature-game-showcase">
                                <img 
                                    src={gameLearningMapImg} 
                                    alt="Bản đồ trò chơi học tập tương tác" 
                                    className="feature-game-img" 
                                />
                            </div>
                        </div>

                        <div className="feature-text">
                            <span className="feature-eyebrow">TRÒ CHƠI HÓA HỌC TẬP</span>
                            <h2 className="feature-heading">
                                Rèn luyện phản xạ với thế giới trò chơi học tập sinh động
                            </h2>
                            <p className="feature-description">
                                Biến những bài học trắc nghiệm truyền thống thành chuyến phiêu lưu khám phá đầy màu sắc. Học sinh tương tác trực tiếp với thế giới trò chơi, vượt qua các thử thách câu hỏi theo thời gian thực để rèn luyện phản xạ tư duy nhanh nhạy và ghi nhớ kiến thức tự nhiên, sâu sắc.
                            </p>
                            <ul className="feature-perks">
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Khám phá các vùng đất tri thức với bản đồ tương tác và đồ họa pixel cuốn hút.</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Rèn luyện tốc độ xử lý và phản xạ tư duy qua từng câu hỏi tương tác trực quan.</span>
                                </li>
                                <li>
                                    <CheckCircle2 size={18} className="perk-check" />
                                    <span>Nhận phản hồi đáp án và phân tích bài học rõ ràng ngay khi hoàn thành thử thách.</span>
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
