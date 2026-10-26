import React from 'react';
import { Link } from 'react-router-dom';
import { LibraryPageLogic } from '../pages_logic/LibraryPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/LibraryPageStyling.css';
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
    Layers
} from 'lucide-react';

const LibraryPage = () => {
    const {
        navigate,
        currentUser,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        savedSets,
        filteredSets,
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
        'Toán học',
        'Tiếng Anh',
        'Hoá học',
        'Vật lý',
        'Lịch sử',
        'Tin học',
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
                        <span>Kho Tàng Đề Thi & Tri Thức</span>
                    </div>

                    <h1 className="library-title">Thư Viện Câu Hỏi Cộng Đồng</h1>
                    <p className="library-subtitle">
                        Nơi giáo viên và người học trên cả nước chia sẻ các bộ câu hỏi chọn lọc. Ôn luyện, lưu bộ đề yêu thích hoặc xuất tài liệu ôn thi.
                    </p>

                    {/* Thanh tìm kiếm & Nút Tạo đề */}
                    <div className="library-search-container">
                        <div className="library-search-wrapper">
                            <Search size={18} className="library-search-icon" />
                            <input 
                                type="text"
                                className="library-search-input"
                                placeholder="Tìm kiếm bộ câu hỏi theo tên, chủ đề hoặc mô tả..."
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

            {/* 3. LƯỚI BỘ CÂU HỎI */}
            <main className="library-main-content">
                <div className="library-meta-bar">
                    <span className="library-count-text">
                        Hiển thị <strong>{filteredSets.length}</strong> bộ câu hỏi công khai
                    </span>
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

                            return (
                                <div key={qSet._id} className="set-card">
                                    <div>
                                        <div className="set-card-header">
                                            <span className={`set-topic-badge ${topicClass}`}>
                                                {qSet.topic || 'Khác'}
                                            </span>

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
                                            <div className="author-avatar">
                                                {(qSet.owner?.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="author-name">
                                                Tác giả: <strong>{qSet.owner?.username || "Ẩn danh"}</strong>
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
                                                className="btn-card-icon"
                                                onClick={() => navigate(`/set/${qSet._id}`)}
                                                title="Xem danh sách câu hỏi"
                                            >
                                                <Play size={13} fill="currentColor" />
                                                <span>Xem bộ</span>
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
