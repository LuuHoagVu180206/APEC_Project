import React from 'react';
import { Link } from 'react-router-dom';
import { GamePageLogic } from '../pages_logic/GamePageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/GamePageStyling.css';
import { 
    Sparkles, 
    Gamepad2, 
    Trophy, 
    BookOpen, 
    Sun, 
    Moon, 
    LogOut, 
    Maximize, 
    Minimize, 
    RotateCcw, 
    HelpCircle, 
    Award, 
    FolderPlus, 
    ArrowRight
} from 'lucide-react';

const GamePage = () => {
    const {
        user,
        questions,
        gameVersion,
        isLoadingGame,
        isFullscreen,
        iframeRef,
        gameContainerRef,
        schoolActionLabel,
        navigate,
        handleReloadGame,
        toggleFullscreen,
        handleLogout
    } = GamePageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    const isGuest = !user || user.role === 'guest';

    return (
        <div className="game-page-wrapper">
            {/* 1. NAVBAR - ĐỒNG BỘ HOÀN TOÀN VỚI LANDING PAGE */}
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
                            <Link to="/library" className="nav-link">Thư viện</Link>
                            <Link to="/leaderboard" className="nav-link">Bảng xếp hạng</Link>
                            <Link to="/schools" className="nav-link">Trường học</Link>
                            <Link to="/student/classes" className="nav-link">Lớp học</Link>
                            <Link to="/studio" className="nav-link">Studio</Link>
                        </nav>
                    </div>

                    <div className="nav-right">
                        {/* Phiên bản Game */}
                        <div className="game-version-pill" title="Phiên bản trò chơi hiện tại">
                            <Gamepad2 size={14} />
                            <span>{gameVersion}</span>
                        </div>

                        {/* Điểm kỷ lục nếu có */}
                        {user?.highScore !== undefined && (
                            <div className="game-score-pill" title="Điểm kỷ lục cao nhất của bạn">
                                <Trophy size={14} />
                                <span>{user.highScore} XP</span>
                            </div>
                        )}

                        {/* Nút chuyển chế độ Sáng / Tối */}
                        <button 
                            className="theme-toggle-btn"
                            onClick={toggleTheme} 
                            title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                            aria-label="Toggle Theme"
                        >
                            {isDark ? <Sun size={19} /> : <Moon size={19} />}
                        </button>

                        {/* User Menu tương ứng với vai trò */}
                        {user && !isGuest ? (
                            user.role === 'teacher' ? (
                                <div className="teacher-account-menu">
                                    <Link className="nav-username" to="/profile">
                                        <span className="user-avatar-badge">{user.username.charAt(0).toUpperCase()}</span>
                                        <span>{user.username}</span>
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
                            ) : (
                                <div className="teacher-account-menu">
                                    <Link className="nav-username" to="/profile">
                                        <span className="user-avatar-badge">{user.username.charAt(0).toUpperCase()}</span>
                                        <span>{user.username}</span>
                                    </Link>
                                    <div className="teacher-account-dropdown">
                                        {user.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
                                        <Link to="/schools">{schoolActionLabel}</Link>
                                        <Link to="/student/classes">Lớp học của tôi</Link>
                                        <Link to="/profile">Hồ sơ cá nhân</Link>
                                        <button type="button" onClick={handleLogout} className="logout-btn">
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="teacher-account-menu">
                                <div className="nav-username" title="Đang chơi ở chế độ khách">
                                    <span className="user-avatar-badge guest-avatar-badge">K</span>
                                    <span>{user?.username || 'Khách'}</span>
                                </div>
                                <div className="teacher-account-dropdown">
                                    <Link to="/login">Đăng nhập tài khoản</Link>
                                    <Link to="/login?mode=register">Tạo tài khoản mới</Link>
                                    <button type="button" onClick={handleLogout} className="logout-btn">
                                        <LogOut size={16} /> Rời phiên khách
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. KHU VỰC NỘI DUNG GAME CHÍNH */}
            <main className="game-main-content">
                {/* Banner gợi ý đăng nhập cho người chơi khách */}
                {isGuest && (
                    <div className="guest-callout-banner">
                        <div className="guest-callout-left">
                            <div className="guest-callout-icon">
                                <Sparkles size={18} />
                            </div>
                            <div className="guest-callout-text">
                                <h4>Bạn đang trải nghiệm với tư cách Khách!</h4>
                                <p>Tạo tài khoản miễn phí để lưu lại điểm kỷ lục vào Bảng xếp hạng và mở khóa các huy hiệu thành tích.</p>
                            </div>
                        </div>
                        <Link to="/login?mode=register" className="btn-guest-register">
                            <span>Đăng ký ngay</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                )}

                {/* KHUNG ARCADE CONSOLE CHỨA GAME */}
                <section className="arcade-console-card">
                    {/* Header thanh công cụ điều khiển Arcade */}
                    <div className="arcade-console-header">
                        <div className="arcade-header-left">
                            <div className="arcade-dots">
                                <span className="arcade-dot dot-red"></span>
                                <span className="arcade-dot dot-yellow"></span>
                                <span className="arcade-dot dot-green"></span>
                            </div>

                            <div className="arcade-title-group">
                                <div className="arcade-badge-live">
                                    <span className="arcade-live-pulse"></span>
                                    <span>TRỰC TIẾP</span>
                                </div>
                                <span className="arcade-title">MÀN ĐẤU QUIZ ARCADE • PHIÊU LƯU TRI THỨC</span>
                            </div>

                            {questions.length > 0 && (
                                <span className="arcade-questions-count">
                                    📝 {questions.length} câu hỏi sẵn sàng
                                </span>
                            )}
                        </div>

                        {/* Các nút tiện ích */}
                        <div className="arcade-header-controls">
                            <button 
                                type="button"
                                className="arcade-ctrl-btn" 
                                onClick={handleReloadGame} 
                                title="Khởi động lại màn chơi hiện tại"
                            >
                                <RotateCcw size={15} />
                                <span>Chơi lại</span>
                            </button>

                            <button 
                                type="button"
                                className="arcade-ctrl-btn" 
                                onClick={toggleFullscreen} 
                                title={isFullscreen ? "Thoát toàn màn hình" : "Chơi toàn màn hình"}
                            >
                                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                                <span>{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
                            </button>

                            <button 
                                type="button"
                                className="arcade-ctrl-btn" 
                                onClick={() => navigate('/library')} 
                                title="Đến thư viện chọn bộ câu hỏi khác"
                            >
                                <BookOpen size={15} />
                                <span>Đổi đề</span>
                            </button>
                        </div>
                    </div>

                    {/* Viewport Iframe chứa Canvas Game */}
                    <div 
                        ref={gameContainerRef} 
                        className={`arcade-viewport-wrapper ${isFullscreen ? 'fullscreen-mode' : ''}`}
                    >
                        {isLoadingGame && (
                            <div className="arcade-loading-overlay">
                                <div className="arcade-spinner"></div>
                                <span className="arcade-loading-text">Đang tải vũ trụ trò chơi EasyLearn...</span>
                            </div>
                        )}

                        <iframe 
                            ref={iframeRef} 
                            src={`/game/${gameVersion}/index.html`}
                            title="EasyLearn Canvas Game"
                            className="game-iframe"
                            frameBorder="0"
                            allow="fullscreen"
                        ></iframe>
                    </div>
                </section>

                {/* 3 CARDS THÔNG TIN & HƯỚNG DẪN DƯỚI KHUNG GAME */}
                <section className="game-info-grid">
                    <div className="game-guide-card">
                        <div className="game-guide-header">
                            <div className="guide-icon-pill guide-icon-gold">
                                <HelpCircle size={22} />
                            </div>
                            <h3>Cách thức điều khiển</h3>
                        </div>
                        <p>
                            Sử dụng các phím mũi tên hoặc <strong>W, A, S, D</strong> để di chuyển nhân vật. Nhấn phím <strong>Space</strong> (Khoảng trắng) để nhảy và chạm vào các khối câu đố để trả lời câu hỏi trắc nghiệm.
                        </p>
                    </div>

                    <div className="game-guide-card">
                        <div className="game-guide-header">
                            <div className="guide-icon-pill guide-icon-blue">
                                <Award size={22} />
                            </div>
                            <h3>Bảng Vàng Danh Dự</h3>
                        </div>
                        <p>
                            Mỗi câu trả lời chuẩn xác sẽ đem lại cho bạn điểm kinh nghiệm (XP). Cạnh tranh vị trí dẫn đầu cùng bạn bè trên bảng tổng sắp toàn hệ thống!
                        </p>
                        <Link to="/leaderboard" className="game-guide-btn">
                            <span>Xem BXH</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="game-guide-card">
                        <div className="game-guide-header">
                            <div className="guide-icon-pill guide-icon-emerald">
                                <FolderPlus size={22} />
                            </div>
                            <h3>Thư Viện & Studio Đề Thi</h3>
                        </div>
                        <p>
                            Khám phá hàng ngàn bộ câu hỏi về Toán học, Tiếng Anh, Vật lý do cộng đồng giáo viên và học sinh chia sẻ, hoặc tự tạo bộ đề của riêng bạn.
                        </p>
                        <Link to="/library" className="game-guide-btn">
                            <span>Vào Thư viện</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GamePage;
