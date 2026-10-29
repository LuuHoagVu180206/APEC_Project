import React, { useState } from 'react';
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
    ArrowRight,
    Flame,
    CheckCircle2,
    X
} from 'lucide-react';

const GamePage = () => {
    const {
        user,
        questions,
        activeSet,
        defaultSets,
        weeklySets,
        isSetModalOpen,
        setIsSetModalOpen,
        handleSelectSet,
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
    const [modalTab, setModalTab] = useState('defaults'); // 'defaults' hoặc 'weekly'

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

                        {/* Điểm Tuần nếu có */}
                        {user?.weeklyScore !== undefined && user.weeklyScore > 0 && (
                            <div className="game-score-pill weekly-score-pill" title="Điểm Thử Thách Tuần của bạn">
                                <Flame size={14} />
                                <span>{user.weeklyScore} Tuần</span>
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
                            ) : (
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

                {/* THANH THÔNG TIN BỘ ĐỀ ĐANG CHƠI */}
                <div className="active-set-strip">
                    <div className="active-set-left">
                        {activeSet?.isWeekly ? (
                            <span className="active-set-tag tag-weekly">
                                <Flame size={14} /> Thử Thách Tuần {activeSet.weekNumber || ''}
                            </span>
                        ) : (
                            <span className="active-set-tag tag-official">
                                ⭐ Đề Chính Thức • APEC Group
                            </span>
                        )}
                        <h2 className="active-set-title">
                            {activeSet?.title || 'Bộ đề khởi động chuẩn'}
                        </h2>
                        <span className="active-set-meta">
                            {activeSet?.topic && `[${activeSet.topic}] • `} {questions.length} câu đố
                        </span>
                    </div>

                    <div className="active-set-actions">
                        <button 
                            className="btn-select-set-modal"
                            onClick={() => setIsSetModalOpen(true)}
                        >
                            <BookOpen size={16} />
                            <span>Đổi bộ câu hỏi</span>
                        </button>
                        <Link to="/leaderboard" className="btn-view-leaderboard">
                            <Trophy size={16} />
                            <span>Đua Top BXH</span>
                        </Link>
                    </div>
                </div>

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
                                onClick={() => setIsSetModalOpen(true)} 
                                title="Chọn bộ câu hỏi khác từ danh sách"
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

            {/* MODAL CHỌN BỘ ĐỀ THI */}
            {isSetModalOpen && (
                <div className="set-picker-overlay" onClick={() => setIsSetModalOpen(false)}>
                    <div className="set-picker-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="set-picker-header">
                            <div className="set-picker-title-group">
                                <h3>Chọn Bộ Đề Trắc Nghiệm</h3>
                                <p>Lựa chọn bộ câu hỏi bạn muốn thử thách trong màn chơi tiếp theo</p>
                            </div>
                            <button 
                                className="btn-close-modal" 
                                onClick={() => setIsSetModalOpen(false)}
                                title="Đóng cửa sổ"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs chuyển đổi giữa đề APEC và đề Weekly */}
                        <div className="set-picker-tabs">
                            <button 
                                className={`set-tab-btn ${modalTab === 'defaults' ? 'active' : ''}`}
                                onClick={() => setModalTab('defaults')}
                            >
                                <Sparkles size={16} />
                                <span>Bộ Đề Mặc Định APEC Group (7 Môn)</span>
                            </button>
                            <button 
                                className={`set-tab-btn ${modalTab === 'weekly' ? 'active' : ''}`}
                                onClick={() => setModalTab('weekly')}
                            >
                                <Flame size={16} />
                                <span>Thử Thách Tuần (Weekly Challenge)</span>
                            </button>
                        </div>

                        {/* Danh sách các bộ câu hỏi */}
                        <div className="set-picker-list">
                            {modalTab === 'defaults' ? (
                                defaultSets.length > 0 ? (
                                    defaultSets.map((s) => (
                                        <div 
                                            key={s._id} 
                                            className={`set-picker-item ${activeSet?._id === s._id ? 'selected' : ''}`}
                                            onClick={() => handleSelectSet(s)}
                                        >
                                            <div className="item-left">
                                                <div className="item-topic-badge">{s.topic || 'Toán'}</div>
                                                <div className="item-details">
                                                    <h4>{s.title}</h4>
                                                    <p>{s.description || 'Bộ đề chuẩn mực do APEC Group biên soạn.'}</p>
                                                    <span className="item-author">Tác giả: <strong>APEC Group</strong></span>
                                                </div>
                                            </div>
                                            <div className="item-right">
                                                {activeSet?._id === s._id ? (
                                                    <span className="selected-badge"><CheckCircle2 size={16} /> Đang chọn</span>
                                                ) : (
                                                    <button className="btn-item-choose">Chọn bộ này</button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="picker-empty">Đang tải danh sách bộ đề chính thức...</div>
                                )
                            ) : (
                                weeklySets.length > 0 ? (
                                    weeklySets.map((s) => (
                                        <div 
                                            key={s._id} 
                                            className={`set-picker-item weekly-item ${activeSet?._id === s._id ? 'selected' : ''}`}
                                            onClick={() => handleSelectSet(s)}
                                        >
                                            <div className="item-left">
                                                <div className="item-topic-badge badge-weekly">⚡ TUẦN {s.weekNumber || 1}</div>
                                                <div className="item-details">
                                                    <h4>{s.title}</h4>
                                                    <p>{s.description}</p>
                                                    <span className="item-author">Chủ đề: <strong>{s.topic}</strong> • APEC Challenge</span>
                                                </div>
                                            </div>
                                            <div className="item-right">
                                                {activeSet?._id === s._id ? (
                                                    <span className="selected-badge"><CheckCircle2 size={16} /> Đang chọn</span>
                                                ) : (
                                                    <button className="btn-item-choose btn-item-weekly">Tranh tài</button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="picker-empty">Đang tải danh sách thử thách tuần...</div>
                                )
                            )}
                        </div>

                        <div className="set-picker-footer">
                            <Link to="/library" className="link-to-library" onClick={() => setIsSetModalOpen(false)}>
                                <BookOpen size={15} />
                                <span>Khám phá thêm hàng trăm đề khác trong Thư viện cộng đồng</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamePage;
