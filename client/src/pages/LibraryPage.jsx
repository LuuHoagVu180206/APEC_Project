import React from 'react';
import { Link } from 'react-router-dom';
import { LibraryPageLogic } from '../pages_logic/LibraryPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/LibraryPageStyling.css';
import { getBentoIllustration } from '../components/BentoIllustration';
import { 
    Sparkles, 
    Search, 
    X, 
    Heart, 
    Bookmark, 
    FileSpreadsheet, 
    FileText, 
    Trash2, 
    FolderPlus, 
    Sun, 
    Moon, 
    LogOut, 
    Play, 
    BookOpen,
    Layers,
    Flame,
    Trophy,
    ArrowUpRight,
    Star
} from 'lucide-react';

const LibraryPage = () => {
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

    const {
        navigate,
        currentUser,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        savedSets,
        filteredSets,
        weeklySets,
        isLoading,
        schoolActionLabel,
        canDelete,
        handleLike,
        handleToggleLikeSet,
        handleDelete,
        handleExport,
        handleLogout
    } = LibraryPageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    const categories = [
        'Tất cả',
        'Toán',
        'Tiếng Anh',
        'Vật lý',
        'Hoá học',
        'Sinh học',
        'Tiếng Việt',
        'Lịch sử',
        'Khác'
    ];

    const getTopicBadgeClass = (topic) => {
        if (!topic) return 'badge-other';
        const t = topic.toLowerCase();
        if (t.includes('toán')) return 'badge-math';
        if (t.includes('tiếng anh') || t.includes('anh')) return 'badge-english';
        if (t.includes('lịch sử') || t.includes('sử')) return 'badge-history';
        if (t.includes('hoá') || t.includes('vật lý') || t.includes('sinh')) return 'badge-science';
        return 'badge-other';
    };

    return (
        <div className="library-wrapper">
            {/* 1. NAVBAR - ĐỒNG BỘ HOÀN TOÀN */}
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
                            <Link to="/" className="nav-link">Trang chủ</Link>
                            <Link to="/library" className="nav-link active">Thư viện</Link>
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

                        {currentUser?.role === 'teacher' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">
                                        {currentUser.avatar ? (
                                            <img src={currentUser.avatar} alt="Avatar" className="user-avatar-img-nav" />
                                        ) : (
                                            currentUser.username.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                    <span>{currentUser.displayName || currentUser.username}</span>
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
                        ) : currentUser?.role === 'user' || currentUser?.role === 'admin' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">
                                        {currentUser.avatar ? (
                                            <img src={currentUser.avatar} alt="Avatar" className="user-avatar-img-nav" />
                                        ) : (
                                            currentUser.username.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                    <span>{currentUser.displayName || currentUser.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    {currentUser.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
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

            {/* 2. HERO SECTION & TÌM KIẾM */}
            <section className="library-hero">
                <div className="library-backdrop-glow"></div>
                <div className="library-header-content">
                    <div className="library-pill-badge">
                        <BookOpen size={14} />
                        <span>Kho Tàng Đề Thi & Tri Thức Chuẩn Hóa</span>
                    </div>

                    <h1 className="library-title">Thư Viện Câu Hỏi & Đề Thi Mẫu</h1>
                    <p className="library-subtitle">
                        Khám phá các bộ câu hỏi chính thức do <strong>APEC Group</strong> biên soạn cùng các đề thi chia sẻ từ cộng đồng giáo viên và học sinh toàn quốc.
                    </p>

                    {/* Thanh tìm kiếm & Nút Tạo đề */}
                    <div className="library-search-container">
                        <div className="library-search-wrapper">
                            <Search size={18} className="library-search-icon" />
                            <input 
                                type="text"
                                className="library-search-input"
                                placeholder="Tìm kiếm bộ câu hỏi theo tên môn học, chủ đề..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    className="btn-clear-search"
                                    onClick={() => setSearchTerm('')}
                                    title="Xóa tìm kiếm"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <button 
                            className="btn-studio-cta"
                            onClick={() => navigate(currentUser ? '/studio' : '/login')}
                        >
                            <FolderPlus size={17} />
                            <span>Tạo bộ đề mới</span>
                        </button>
                    </div>

                    {/* Bộ lọc danh mục */}
                    <div className="library-categories">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. HERO SECTION ĐẶC BIỆT: THỬ THÁCH TUẦN (WEEKLY CHALLENGES) */}
            <section className="weekly-hero-section">
                <div className="weekly-hero-container">
                    <div className="weekly-hero-header">
                        <div className="weekly-title-badge">
                            <Flame size={16} className="weekly-flame-icon" />
                            <span>SỰ KIỆN ĐẤU TRÍ TUẦN • TRANH TÀI BẢNG VÀNG</span>
                        </div>
                        <h2 className="weekly-hero-heading">
                            Thử Thách Đấu Trí Hàng Tuần (Weekly Challenges)
                        </h2>
                        <p className="weekly-hero-desc">
                            Chinh phục các bộ đề sự kiện tuần đặc biệt do APEC Group thiết kế để ghi danh lên Bảng Xếp Hạng Tuần và tranh tài cùng cộng đồng!
                        </p>
                    </div>

                    <div className="hero-weekly-bento-grid">
                        {(weeklySets.length > 0 ? weeklySets : [
                            { _id: 'w1', weekNumber: 1, title: 'Vũ Trụ Bí Ẩn & Khoa Học Không Gian', topic: 'Thiên văn học' },
                            { _id: 'w2', weekNumber: 2, title: 'Bí Ẩn Đại Dương & Đa Dạng Sinh Thái', topic: 'Sinh thái học' },
                            { _id: 'w3', weekNumber: 3, title: 'Đấu Trí Trí Tuệ Nhân Tạo & Cách Mạng 4.0', topic: 'Công nghệ' },
                            { _id: 'w4', weekNumber: 4, title: 'Đấu Trường Logic & Toán Ứng Dụng', topic: 'Toán học & Logic' }
                        ]).map((wSet, index) => {
                            const variants = ['light', 'blue', 'dark', 'light', 'blue', 'dark'];
                            const variant = variants[index % variants.length];

                            return (
                                <div 
                                    key={wSet._id || index} 
                                    className={`hero-bento-card variant-${variant}`}
                                    onClick={() => navigate(wSet._id && !wSet._id.startsWith('w') ? `/set/${wSet._id}` : `/game?setId=${wSet._id}`)}
                                >
                                    <div className="bento-card-top">
                                        <span className="bento-card-tag">{wSet.topic || 'Sự kiện'}</span>
                                        <span className="bento-card-topic">{wSet.questions?.length ? `${wSet.questions.length} câu hỏi` : '8 câu hỏi'}</span>
                                    </div>

                                    <div className="bento-title-wrapper">
                                        <h3 className="bento-title-group">
                                            {splitTitleLines(wSet.title).map((line, lIdx) => (
                                                <span key={lIdx} className="bento-title-highlight">
                                                    {line}
                                                </span>
                                            ))}
                                        </h3>
                                    </div>

                                    <div className="bento-art-container">
                                        {getBentoIllustration(wSet.topic, index, variant)}
                                    </div>

                                    <div className="bento-cta-wrapper">
                                        <button 
                                            type="button" 
                                            className="btn-bento-play-now"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(wSet._id ? `/game?setId=${wSet._id}` : '/game');
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

            {/* 4. LƯỚI TẤT CẢ BỘ CÂU HỎI (BỘ ĐỀ CHÍNH THỨC APEC GROUP Ở ĐẦU) */}
            <main className="library-main-content">
                <div className="library-meta-bar">
                    <div className="meta-bar-left">
                        <span className="library-count-text">
                            Hiển thị <strong>{filteredSets.length}</strong> bộ câu hỏi trong thư viện
                        </span>
                    </div>
                    <div className="meta-bar-right">
                        <Link to="/leaderboard" className="link-meta-leaderboard">
                            <Trophy size={15} />
                            <span>Xem Bảng Xếp Hạng</span>
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="library-empty-state">
                        <div className="empty-icon-wrap">
                            <Layers size={28} />
                        </div>
                        <h3>Đang tải dữ liệu thư viện...</h3>
                    </div>
                ) : filteredSets.length === 0 ? (
                    <div className="library-empty-state">
                        <div className="empty-icon-wrap">
                            <BookOpen size={28} />
                        </div>
                        <h3>Không tìm thấy bộ câu hỏi nào</h3>
                        <p>
                            Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất cả" để khám phá thêm nhiều nội dung nhé.
                        </p>
                        <button 
                            className="btn-studio-cta" 
                            onClick={() => { setSearchTerm(''); setActiveCategory('Tất cả'); }}
                        >
                            Xem tất cả bộ đề
                        </button>
                    </div>
                ) : (
                    <div className="library-grid">
                        {filteredSets.map((qSet) => {
                            const isSaved = savedSets.includes(qSet._id);
                            const topicClass = getTopicBadgeClass(qSet.topic);
                            const isApecOfficial = qSet.isDefault || qSet.authorName === 'APEC Group' || qSet.owner?.username === 'APEC Group';

                            return (
                                <div 
                                    key={qSet._id} 
                                    className={`set-card ${isApecOfficial ? 'card-official-apec' : ''} ${qSet.isWeekly ? 'card-weekly-event' : ''}`}
                                >
                                    <div>
                                        <div className="set-card-header">
                                            <div className="badge-group-header">
                                                {isApecOfficial && (
                                                    <span className="official-apec-badge">
                                                        <Star size={11} fill="currentColor" /> CHÍNH THỨC • APEC GROUP
                                                    </span>
                                                )}
                                                {qSet.isWeekly && (
                                                    <span className="weekly-apec-badge">
                                                        <Flame size={11} /> SỰ KIỆN TUẦN {qSet.weekNumber || ''}
                                                    </span>
                                                )}
                                                <span className={`set-topic-badge ${topicClass}`}>
                                                    {qSet.topic || 'Khác'}
                                                </span>
                                            </div>

                                            {canDelete(qSet.owner?._id || qSet.owner) && (
                                                <button 
                                                    className="btn-delete-card"
                                                    onClick={() => handleDelete(qSet._id)}
                                                    title="Xóa bộ câu hỏi khỏi hệ thống"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <h3 
                                            className="set-card-title"
                                            onClick={() => navigate(`/set/${qSet._id}`)}
                                            title="Bấm để xem chi tiết các câu hỏi trong bộ này"
                                        >
                                            {qSet.title}
                                        </h3>

                                        <p className="set-card-desc">
                                            {qSet.description || "Bộ câu hỏi trắc nghiệm chất lượng cao phục vụ rèn luyện và kiểm tra kiến thức."}
                                        </p>

                                        <div className="set-card-author">
                                            <div className={`author-avatar ${isApecOfficial ? 'author-avatar-apec' : ''}`}>
                                                {isApecOfficial ? '⭐' : (qSet.owner?.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="author-name">
                                                Tác giả: <strong>{isApecOfficial ? 'APEC Group' : (qSet.owner?.displayName || qSet.owner?.username || 'Ẩn danh')}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="set-card-actions">
                                        <div className="action-group-left">
                                            <button 
                                                className="btn-card-icon liked"
                                                onClick={() => handleLike(qSet._id)}
                                                title="Thả tim cho bộ đề này"
                                            >
                                                <Heart size={14} fill="#ef4444" />
                                                <span>{qSet.likesCount || 0}</span>
                                            </button>

                                            <button 
                                                className={`btn-card-icon ${isSaved ? 'saved' : ''}`}
                                                onClick={() => handleToggleLikeSet(qSet._id)}
                                                title={isSaved ? "Đã lưu vào bộ sưu tập cá nhân" : "Lưu vào bộ sưu tập cá nhân"}
                                            >
                                                <Bookmark size={14} fill={isSaved ? "var(--accent-blue)" : "none"} />
                                                <span>{isSaved ? "Đã lưu" : "Lưu bộ"}</span>
                                            </button>

                                            <button 
                                                className="btn-card-icon btn-card-play-now"
                                                onClick={() => navigate(`/game?setId=${qSet._id}`)}
                                                title="Chơi ngay bộ đề này trong game"
                                            >
                                                <Play size={13} fill="currentColor" />
                                                <span>Chơi ngay</span>
                                            </button>
                                        </div>

                                        <div className="action-group-right">
                                            <button 
                                                className="btn-export-mini"
                                                onClick={() => handleExport(qSet._id, 'excel')}
                                                title="Tải về file Excel"
                                            >
                                                <FileSpreadsheet size={13} style={{ marginRight: '4px' }} />
                                                Excel
                                            </button>

                                            <button 
                                                className="btn-export-mini"
                                                onClick={() => handleExport(qSet._id, 'pdf')}
                                                title="Tải về file PDF"
                                            >
                                                <FileText size={13} style={{ marginRight: '4px' }} />
                                                PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LibraryPage;
