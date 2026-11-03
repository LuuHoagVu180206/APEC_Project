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
import { getAuthorInfo } from '../utils/authorUtils';
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
    const [activeProcessStep, setActiveProcessStep] = useState(0);

    const processSteps = [
        {
            num: '01',
            title: 'Khám phá thế giới trò chơi tương tác',
            desc: 'Lựa chọn môn học yêu thích từ Toán học, Vật lí, Hóa học đến Lịch sử, Ngoại ngữ. Tương tác trực tiếp với bản đồ phiêu lưu RPG trực quan sinh động và cuốn hút.'
        },
        {
            num: '02',
            title: 'Vượt qua thử thách câu hỏi theo thời gian thực',
            desc: 'Rèn luyện tốc độ xử lý và phản xạ tư duy qua từng câu hỏi trắc nghiệm tương tác với hệ thống tính giờ, âm thanh và phản hồi kết quả tức thì.'
        },
        {
            num: '03',
            title: 'Mở khóa huy hiệu & tích lũy điểm kinh nghiệm',
            desc: 'Nhận phân tích đáp án chi tiết, tích lũy điểm EXP, thăng cấp thứ hạng hồ sơ cá nhân và sở hữu bộ sưu tập huy hiệu thành tích độc đáo.'
        },
        {
            num: '04',
            title: 'Xếp hạng & so tài cùng bạn bè trong trường lớp',
            desc: 'Tham gia Thử thách tuần, tranh tài điểm số trên Bảng xếp hạng toàn quốc hoặc tham gia lớp học cùng thầy cô và bạn bè qua mã lớp.'
        }
    ];

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
        return () => {
            isActive = false;
        };
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

    // Lấy bộ đề chuẩn từ Database (defaults hoặc library), loại trừ hoàn toàn các bộ đề weekly
    useEffect(() => {
        axios.get('http://localhost:5000/api/sets/defaults')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    const cleanSets = res.data.filter(s => !s.isWeekly && !s.title?.toLowerCase().includes('thử thách tuần'));
                    setPublicQuestionSets(cleanSets.length > 0 ? cleanSets : defaultApecQuestionSets);
                } else {
                    axios.get('http://localhost:5000/api/sets/library')
                        .then(resLib => {
                            if (resLib.data && resLib.data.length > 0) {
                                const cleanLib = resLib.data.filter(s => !s.isWeekly && !s.title?.toLowerCase().includes('thử thách tuần'));
                                setPublicQuestionSets(cleanLib.slice(0, 7));
                            }
                        })
                        .catch(() => {});
                }
            })
            .catch(() => {
                axios.get('http://localhost:5000/api/sets/library')
                    .then(resLib => {
                        if (resLib.data && resLib.data.length > 0) {
                            const cleanLib = resLib.data.filter(s => !s.isWeekly && !s.title?.toLowerCase().includes('thử thách tuần'));
                            setPublicQuestionSets(cleanLib.slice(0, 7));
                        }
                    })
                    .catch(() => {});
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="landing-wrapper">
            {/* 1. NAVBAR - POSITIVUS CLEAN MODERN HEADER */}
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

            {/* 2. HERO SECTION - POSITIVUS 2-COLUMN HERO WITH CYAN ACCENT */}
            <section className="hero-section">
                <div className="section-container">
                    <div className="hero-grid-two-col">
                        <div className="hero-left-col">
                            <h1 className="hero-title">
                                Khởi đầu chuyến phiêu lưu chinh phục tri thức
                            </h1>
                            <p className="hero-subtitle">
                                Nền tảng học tập kết hợp trò chơi hóa - Chinh phục tri thức qua từng màn chơi. Vừa chơi game, vừa rèn luyện tư duy, mở khóa huy hiệu và đồng hành cùng bạn bè trong lớp học!
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

                        <div className="hero-right-col">
                            <div className="hero-banner-artwork-card">
                                <div className="hero-artwork-inner"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* POSITIVUS SUBJECT TICKER BAR */}
                <div className="positivus-ticker-wrap">
                    <div className="section-container">
                        <div className="ticker-inner">
                            <span className="ticker-label">CHỦ ĐỀ HỌC TẬP:</span>
                            <div className="ticker-chips-row">
                                {[
                                    { name: 'Toán học', icon: '📐' },
                                    { name: 'Vật lí', icon: '⚡' },
                                    { name: 'Hoá học', icon: '🧪' },
                                    { name: 'Sinh học', icon: '🌱' },
                                    { name: 'Lịch sử', icon: '📜' },
                                    { name: 'Tiếng Anh', icon: '🌍' },
                                    { name: 'Ngữ văn', icon: '📖' },
                                    { name: 'Trí tuệ nhân tạo', icon: '🤖' }
                                ].map((sub, idx) => (
                                    <button 
                                        key={idx} 
                                        className="positivus-ticker-chip"
                                        onClick={() => navigate(`/library?search=${encodeURIComponent(sub.name)}`)}
                                    >
                                        <span className="chip-icon">{sub.icon}</span>
                                        <span>{sub.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. THỬ THÁCH ĐẤU TRÍ HÀNG TUẦN (POSITIVUS BENTO CARDS) */}
            <section className="weekly-challenges-section" id="weekly">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Thử Thách Tuần</span>
                        <p className="positivus-section-desc">
                            Các bộ đề thử thách được cập nhật định kỳ mỗi tuần để người chơi rèn luyện tư duy logic và tranh tài trên Bảng xếp hạng toàn quốc.
                        </p>
                        <Link to="/leaderboard" className="positivus-section-link">
                            <Trophy size={16} />
                            <span>Bảng xếp hạng</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="hero-weekly-bento-grid">
                        {(weeklySets.length >= 4 ? weeklySets.slice(0, 4) : [
                            ...weeklySets,
                            ...([
                                { _id: 'w1', weekNumber: 1, title: 'Thử Thách Tuần 01: Vũ Trụ Bí Ẩn & Khoa Học Không Gian', topic: 'Thiên văn học', questionsCount: 8, authorName: 'APEC Group' },
                                { _id: 'w2', weekNumber: 2, title: 'Thử Thách Tuần 02: Bí Ẩn Đại Dương & Đa Dạng Sinh Thái', topic: 'Khoa học Tự nhiên', questionsCount: 8, authorName: 'APEC Group' },
                                { _id: 'w3', weekNumber: 3, title: 'Thử Thách Tuần 03: Đấu Trí Trí Tuệ Nhân Tạo & Cách Mạng 4.0', topic: 'Công nghệ AI', questionsCount: 8, authorName: 'APEC Group' },
                                { _id: 'w4', weekNumber: 4, title: 'Thử Thách Tuần 04: Đấu Trường Logic & Toán Ứng Dụng', topic: 'Toán học & Logic', questionsCount: 8, authorName: 'APEC Group' }
                            ].slice(weeklySets.length))
                        ]).map((w, index) => {
                            const variants = ['blue', 'light', 'light', 'blue'];
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

            {/* 4. KHÁM PHÁ BỘ CÂU HỎI (POSITIVUS SERVICES STYLE) */}
            <section className="catalog-section" id="catalog">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Bộ Câu Hỏi</span>
                        <p className="positivus-section-desc">
                            Hàng trăm bộ đề trắc nghiệm tương tác miễn phí từ các môn học do APEC Group và các thầy cô giáo biên soạn chuẩn mực.
                        </p>
                    </div>

                    {/* Toolbar tìm kiếm */}
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
                                    placeholder="Tìm kiếm bộ câu hỏi theo môn học, chủ đề..." 
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
                                <span>Tìm kiếm</span>
                            </button>
                        </form>
                    </div>

                    {/* Lưới Bento-Grid Thẻ Bộ Câu Hỏi Positivus */}
                    <div className="hero-weekly-bento-grid">
                        {publicQuestionSets.map((item, index) => {
                            const variants = ['light', 'blue', 'blue', 'light'];
                            const variant = variants[index % variants.length];
                            const authorInfo = getAuthorInfo(item, user);
                            const author = authorInfo.name;
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
                                    <div className="bento-card-top">
                                        <span className="bento-card-tag">{item.topic || 'Chủ đề'}</span>
                                        <span className="bento-card-topic">{questionsCount} câu hỏi • {author}</span>
                                    </div>

                                    <div className="bento-title-wrapper">
                                        <h4 className="bento-title-group">
                                            {splitTitleLines(item.title).map((line, lIdx) => (
                                                <span key={lIdx} className="bento-title-highlight">
                                                    {line}
                                                </span>
                                            ))}
                                        </h4>
                                    </div>

                                    <div className="bento-art-container">
                                        <img 
                                            src={getSubjectAsset(item.topic)} 
                                            alt={item.topic || 'Minh họa'} 
                                            className="bento-subject-asset-img"
                                            loading="lazy"
                                        />
                                    </div>

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

            {/* 5. POSITIVUS CTA BANNER: "LET'S MAKE THINGS HAPPEN" (DÀNH CHO GIÁO VIÊN & STUDIO) */}
            <section className="positivus-cta-banner-section">
                <div className="section-container">
                    <div className="positivus-cta-banner">
                        <div className="positivus-cta-banner-left">
                            <h3 className="positivus-cta-banner-title">
                                Sáng tạo bộ đề thi của riêng bạn
                            </h3>
                            <p className="positivus-cta-banner-desc">
                                Dễ dàng tạo bộ câu hỏi trong Studio, xuất ra file PDF hoặc Excel chuyên nghiệp chỉ với 1 click, cấp mã lớp 8 ký tự cho học sinh tham gia và theo dõi tiến độ học tập toàn diện.
                            </p>
                            <div className="positivus-cta-banner-actions">
                                <button className="btn-positivus-dark" onClick={() => navigate('/studio')}>
                                    <FolderPlus size={18} />
                                    <span>Vào Studio tạo bộ đề</span>
                                </button>
                                <button className="btn-positivus-outline" onClick={() => navigate('/register/teacher')}>
                                    <Users size={18} />
                                    <span>Đăng ký làm giáo viên</span>
                                </button>
                            </div>
                        </div>

                        <div className="positivus-cta-banner-right">
                            <div className="positivus-floating-art">
                                <div className="floating-star-main">✦</div>
                                <div className="floating-star-small">★</div>
                                <div className="floating-badge-ring">EasyLearn Studio</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. POSITIVUS WORKING PROCESS ACCORDION (QUY TRÌNH HỌC TẬP & RÈN LUYỆN) */}
            <section className="positivus-process-section">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Quy Trình</span>
                        <p className="positivus-section-desc">
                            4 bước đơn giản để rèn luyện tư duy phản xạ và chinh phục điểm số cao cùng EasyLearn.
                        </p>
                    </div>

                    <div className="positivus-accordion-list">
                        {processSteps.map((step, idx) => {
                            const isOpen = activeProcessStep === idx;
                            return (
                                <div 
                                    key={idx} 
                                    className={`positivus-accordion-item ${isOpen ? 'active' : ''}`}
                                    onClick={() => setActiveProcessStep(isOpen ? -1 : idx)}
                                >
                                    <div className="accordion-header">
                                        <div className="accordion-title-wrap">
                                            <span className="accordion-num">{step.num}</span>
                                            <h4 className="accordion-title">{step.title}</h4>
                                        </div>
                                        <div className="accordion-icon-wrap">
                                            <span className="accordion-toggle-icon">{isOpen ? '−' : '+'}</span>
                                        </div>
                                    </div>
                                    {isOpen && (
                                        <div className="accordion-body">
                                            <div className="accordion-divider"></div>
                                            <p className="accordion-desc">{step.desc}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 7. TÍNH NĂNG NỔI BẬT (TRÒ CHƠI HÓA HỌC TẬP TƯƠNG TÁC) */}
            <section className="features-spotlight-section">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Trò Chơi Hóa</span>
                        <p className="positivus-section-desc">
                            Biến bài học trắc nghiệm truyền thống thành chuyến phiêu lưu sinh động với bản đồ tương tác và đồ họa pixel cuốn hút.
                        </p>
                    </div>

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
                            <h3 className="feature-heading">
                                Rèn luyện phản xạ với thế giới trò chơi học tập sinh động
                            </h3>
                            <p className="feature-description">
                                Học sinh tương tác trực tiếp với thế giới trò chơi, vượt qua các thử thách câu hỏi theo thời gian thực để rèn luyện phản xạ tư duy nhanh nhạy và ghi nhớ kiến thức tự nhiên, sâu sắc.
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

            {/* 8. POSITIVUS FOOTER */}
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
