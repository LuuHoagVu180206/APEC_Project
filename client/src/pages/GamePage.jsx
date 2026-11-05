import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GamePageLogic } from '../pages_logic/GamePageLogic';
import '../pages_styling/GamePageStyling.css';
import { 
    Sparkles, 
    Gamepad2, 
    Trophy, 
    Maximize, 
    Minimize, 
    RotateCcw, 
    Award, 
    FolderPlus, 
    ArrowRight,
    Flame
} from 'lucide-react';

const GamePage = () => {
    const {
        user,
        gameVersion,
        isLoadingGame,
        isFullscreen,
        iframeRef,
        gameContainerRef,
        handleReloadGame,
        toggleFullscreen,
        currentSetId,
        isWeekly,
        autoStart,
        mode
    } = GamePageLogic();

    const isGuest = !user || user.role === 'guest';

    return (
        <div className="game-page-wrapper">
            {/* 1. NAVBAR - UNIFIED NAVBAR */}
            <Navbar activePage="game">
                {/* Phiên bản Game */}
                <div className="game-version-pill" title="Phiên bản trò chơi hiện tại">
                    <Gamepad2 size={14} />
                    <span>{gameVersion}</span>
                </div>

                {/* Điểm kỷ lục */}
                {user?.highScore !== undefined && (
                    <div className="game-score-pill" title="Điểm kỷ lục cao nhất của bạn">
                        <Trophy size={14} />
                        <span>{user.highScore} điểm</span>
                    </div>
                )}

                {/* Điểm Tuần */}
                {user?.weeklyScore !== undefined && user.weeklyScore > 0 && (
                    <div className="game-score-pill weekly-score-pill" title="Điểm Thử Thách Tuần của bạn">
                        <Flame size={14} />
                        <span>{user.weeklyScore} điểm tuần</span>
                    </div>
                )}
            </Navbar>

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
                    {/* Header điều khiển duy nhất */}
                    <div className="game-console-header">
                        <div className="game-console-header-left">
                            <div className="game-window-dots">
                                <span className="window-dot dot-red"></span>
                                <span className="window-dot dot-yellow"></span>
                                <span className="window-dot dot-green"></span>
                            </div>
                        </div>

                        {/* Các nút điều khiển */}
                        <div className="game-console-header-right">
                            <button 
                                type="button"
                                className="game-btn-action" 
                                onClick={handleReloadGame} 
                                title="Khởi động lại màn chơi hiện tại"
                            >
                                <RotateCcw size={15} />
                                <span>Chơi lại</span>
                            </button>

                            <button 
                                type="button"
                                className="game-btn-action" 
                                onClick={toggleFullscreen} 
                                title={isFullscreen ? "Thoát toàn màn hình" : "Chơi toàn màn hình"}
                            >
                                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                                <span>{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
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

                        {!isLoadingGame && gameVersion && (
                            <iframe 
                                ref={iframeRef} 
                                src={`/game/${gameVersion}/index.html?setId=${encodeURIComponent(currentSetId || '')}&isWeekly=${isWeekly ? 'true' : 'false'}&mode=${mode || 'solo'}&autoStart=${autoStart ? 'true' : 'false'}&role=${encodeURIComponent(user?.role || 'guest')}&username=${encodeURIComponent(user?.username || '')}`}
                                title="EasyLearn Canvas Game"
                                className="game-iframe"
                                frameBorder="0"
                                allow="fullscreen"
                            ></iframe>
                        )}
                    </div>
                </section>

                {/* 2 CARDS TIỆN ÍCH DƯỚI KHUNG GAME (CHUẨN BENTO POSITIVUS) */}
                <section className="game-info-grid">
                    {/* Card 1: Bảng xếp hạng */}
                    <div className="game-guide-card guide-card-leaderboard">
                        <div className="game-guide-header">
                            <div className="guide-icon-pill guide-icon-gold">
                                <Award size={22} />
                            </div>
                            <h3>Bảng Vàng Danh Dự</h3>
                        </div>
                        <p>
                            Mỗi câu trả lời chuẩn xác sẽ đem lại điểm số cho bạn. Cạnh tranh vị trí dẫn đầu cùng bạn bè trên bảng tổng sắp toàn hệ thống!
                        </p>
                        <Link to="/leaderboard" className="btn-positivus-guide">
                            <span>Xem Bảng Xếp Hạng</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Card 2: Thư viện & Studio */}
                    <div className="game-guide-card guide-card-library">
                        <div className="game-guide-header">
                            <div className="guide-icon-pill guide-icon-emerald">
                                <FolderPlus size={22} />
                            </div>
                            <h3>Thư Viện & Studio Đề Thi</h3>
                        </div>
                        <p>
                            Khám phá hàng ngàn bộ câu hỏi về Toán học, Tiếng Anh, Vật lý do cộng đồng chia sẻ, hoặc tự tạo bộ đề của riêng bạn trong Studio.
                        </p>
                        <Link to="/library" className="btn-positivus-guide">
                            <span>Khám Phá Thư Viện</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default GamePage;
