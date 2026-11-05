import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GamePageLogic } from '../pages_logic/GamePageLogic';
import '../pages_styling/GamePageStyling.css';
import { 
    Sparkles, 
    Gamepad2, 
    Trophy, 
    BookOpen, 
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
        handleReloadGame,
        toggleFullscreen,
        currentSetId,
        isWeekly,
        autoStart,
        mode
    } = GamePageLogic();

    const [modalTab, setModalTab] = useState('defaults'); // 'defaults' hoặc 'weekly'

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

                {/* KHUNG ARCADE CONSOLE CHỨA GAME - ĐÃ GỘP GỌN 1 HEADER THEO CHUẨN THEME WEB */}
                <section className="arcade-console-card">
                    {/* Header điều khiển duy nhất, tích hợp thông tin đề thi và các nút chức năng */}
                    <div className="game-console-header">
                        <div className="game-console-header-left">
                            <div className="game-window-dots">
                                <span className="window-dot dot-red"></span>
                                <span className="window-dot dot-yellow"></span>
                                <span className="window-dot dot-green"></span>
                            </div>

                            <div className="game-set-info">
                                {activeSet?.isWeekly ? (
                                    <span className="game-set-badge badge-weekly">
                                        <Flame size={13} /> TUẦN {activeSet.weekNumber || ''}
                                    </span>
                                ) : (
                                    <span className="game-set-badge badge-official">
                                        <Sparkles size={13} /> {activeSet?.authorName || 'APEC'}
                                    </span>
                                )}
                                <h2 className="game-active-title" title={activeSet?.title || 'Bộ đề khởi động chuẩn'}>
                                    {activeSet?.title || 'Bộ đề khởi động chuẩn'}
                                </h2>
                                {activeSet?.topic && (
                                    <span className="game-active-topic">
                                        [{activeSet.topic}]
                                    </span>
                                )}
                                {questions.length > 0 && (
                                    <span className="game-active-count">
                                        📝 {questions.length} câu đố
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Các nút điều khiển & chuyển trang */}
                        <div className="game-console-header-right">
                            <button 
                                type="button"
                                className="game-btn-action btn-change-set" 
                                onClick={() => setIsSetModalOpen(true)} 
                                title="Chọn bộ câu hỏi khác từ thư viện"
                            >
                                <BookOpen size={15} />
                                <span>Đổi bộ đề</span>
                            </button>

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

                            <Link to="/leaderboard" className="game-btn-action btn-leaderboard-link" title="Xem Bảng xếp hạng">
                                <Trophy size={15} />
                                <span>Đua Top BXH</span>
                            </Link>
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

                {/* 3 CARDS HƯỚNG DẪN & TIỆN ÍCH DƯỚI KHUNG GAME (CHUẨN BENTO POSITIVUS) */}
                <section className="game-info-grid">
                    {/* Card 1: Điều khiển */}
                    <div className="game-guide-card guide-card-controls">
                        <div className="game-guide-header">
                            <div className="guide-icon-pill guide-icon-blue">
                                <HelpCircle size={22} />
                            </div>
                            <h3>Cách Thức Điều Khiển</h3>
                        </div>
                        <p>
                            Điều khiển nhân vật vượt mê cung học tập và tương tác trực tiếp với các khối câu đố trắc nghiệm:
                        </p>
                        <div className="keycap-list">
                            <div className="keycap-row">
                                <div className="keycap-row-keys">
                                    <span className="keycap">W</span>
                                    <span className="keycap">A</span>
                                    <span className="keycap">S</span>
                                    <span className="keycap">D</span>
                                </div>
                                <span>hoặc <strong>Phím mũi tên</strong>: Di chuyển</span>
                            </div>
                            <div className="keycap-row">
                                <div className="keycap-row-keys">
                                    <span className="keycap keycap-space">Space</span>
                                </div>
                                <span>: Nhảy & chạm khối câu đố</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Bảng xếp hạng */}
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

                    {/* Card 3: Thư viện & Studio */}
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
