import React from 'react';
import { Link } from 'react-router-dom';
import { LeaderboardPageLogic } from '../pages_logic/LeaderboardPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/LeaderboardPageStyling.css';
import { 
    Sparkles, 
    Trophy, 
    Flame, 
    Sun, 
    Moon, 
    LogOut, 
    Crown, 
    Medal, 
    ArrowRight, 
    Gamepad2, 
    Award,
    Layers
} from 'lucide-react';

const LeaderboardPage = () => {
    const {
        user,
        activeTab,
        handleTabChange,
        leaders,
        isLoading,
        firstPlace,
        secondPlace,
        thirdPlace,
        remainingLeaders,
        userRank,
        currentScore,
        schoolActionLabel,
        handleLogout,
        navigate
    } = LeaderboardPageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    const getScore = (player) => {
        if (!player) return 0;
        return activeTab === 'weekly' ? (player.weeklyScore || 0) : (player.highScore || 0);
    };

    const isGuest = !user || user.role === 'guest';

    return (
        <div className="leaderboard-wrapper">
            {/* 1. NAVBAR - ĐỒNG BỘ HOÀN TOÀN VỚI HỆ THỐNG */}
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
                            <Link to="/leaderboard" className="nav-link active">Bảng xếp hạng</Link>
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
                                        <Link to="/game">Chơi Game Quiz</Link>
                                        <Link to="/profile">Hồ sơ cá nhân</Link>
                                        <button type="button" onClick={handleLogout} className="logout-btn">
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )
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

            {/* 2. HERO HEADER LEADERBOARD & TABS */}
            <section className="leaderboard-hero">
                <div className="leaderboard-backdrop-glow"></div>
                <div className="leaderboard-header-content">
                    <div className="leaderboard-pill-badge">
                        <Trophy size={14} />
                        <span>Đấu Trường Tranh Tài Thượng Đỉnh</span>
                    </div>

                    <h1 className="leaderboard-title">
                        Bảng Vàng Danh Dự & <span className="leaderboard-highlight">Xếp Hạng</span>
                    </h1>

                    <p className="leaderboard-subtitle">
                        Vinh danh những tuyển thủ và người học xuất sắc nhất hệ thống. Tham gia các thử thách sự kiện tuần của <strong>APEC Group</strong> để ghi tên vào bảng vàng và nhận huy hiệu danh giá!
                    </p>

                    {/* Tabs chuyển đổi giữa Thử thách Tuần và Toàn thời gian */}
                    <div className="leaderboard-tabs">
                        <button 
                            className={`tab-btn tab-weekly ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => handleTabChange('weekly')}
                        >
                            <Flame size={16} />
                            <span>🏆 Thử Thách Tuần (Weekly Challenge)</span>
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => handleTabChange('all')}
                        >
                            <Crown size={16} />
                            <span>👑 Bảng Vinh Danh Toàn Thời Gian</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* 3. KHUNG THỨ HẠNG CỦA BẠN (NẾU ĐÃ ĐĂNG NHẬP) */}
            {user && !isGuest && (
                <div className="user-rank-banner">
                    <div className="user-rank-card">
                        <div className="user-rank-left">
                            <div className="user-rank-avatar">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} />
                                ) : (
                                    user.username.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="user-rank-info">
                                <h4>{user.displayName || user.username} (Hồ sơ của bạn)</h4>
                                <div className="user-rank-stats">
                                    <span>Vị trí hiện tại: <strong className="rank-badge-pill">{userRank ? `#${userRank}` : 'Chưa có hạng'}</strong></span>
                                    <span>•</span>
                                    <span>Điểm {activeTab === 'weekly' ? 'Tuần' : 'Kỷ Lục'}: <strong className="score-badge-pill">{currentScore} XP</strong></span>
                                </div>
                            </div>
                        </div>

                        <Link to="/game" className="btn-play-climb-rank">
                            <Gamepad2 size={16} />
                            <span>Chơi Game Leo Hạng Ngay</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}

            {/* 4. TOP 3 PODIUM (BỤC VINH QUANG) */}
            {!isLoading && leaders.length > 0 && (
                <section className="podium-container">
                    {/* HẠNG 2: Á QUÂN (BÊN TRÁI) */}
                    {secondPlace && (
                        <div className="podium-column second-place">
                            <div className="podium-avatar-wrapper">
                                <div className="podium-avatar">
                                    {secondPlace.avatar ? (
                                        <img src={secondPlace.avatar} alt={secondPlace.username} />
                                    ) : (
                                        secondPlace.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="podium-medal-badge">🥈</div>
                            </div>
                            <div className="podium-user-name" title={secondPlace.displayName || secondPlace.username}>
                                {secondPlace.displayName || secondPlace.username}
                            </div>
                            <div className="podium-user-score">
                                <Medal size={13} /> {getScore(secondPlace)} XP
                            </div>
                            <div className="podium-pedestal">2</div>
                        </div>
                    )}

                    {/* HẠNG 1: QUÁN QUÂN (Ở GIỮA - CAO NHẤT) */}
                    {firstPlace && (
                        <div className="podium-column first-place">
                            <div className="podium-crown-icon">👑</div>
                            <div className="podium-avatar-wrapper">
                                <div className="podium-avatar">
                                    {firstPlace.avatar ? (
                                        <img src={firstPlace.avatar} alt={firstPlace.username} />
                                    ) : (
                                        firstPlace.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="podium-medal-badge">🥇</div>
                            </div>
                            <div className="podium-user-name" title={firstPlace.displayName || firstPlace.username}>
                                {firstPlace.displayName || firstPlace.username}
                            </div>
                            <div className="podium-user-score">
                                <Trophy size={13} /> {getScore(firstPlace)} XP
                            </div>
                            <div className="podium-pedestal">1</div>
                        </div>
                    )}

                    {/* HẠNG 3: HUY CHƯƠNG ĐỒNG (BÊN PHẢI) */}
                    {thirdPlace && (
                        <div className="podium-column third-place">
                            <div className="podium-avatar-wrapper">
                                <div className="podium-avatar">
                                    {thirdPlace.avatar ? (
                                        <img src={thirdPlace.avatar} alt={thirdPlace.username} />
                                    ) : (
                                        thirdPlace.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="podium-medal-badge">🥉</div>
                            </div>
                            <div className="podium-user-name" title={thirdPlace.displayName || thirdPlace.username}>
                                {thirdPlace.displayName || thirdPlace.username}
                            </div>
                            <div className="podium-user-score">
                                <Award size={13} /> {getScore(thirdPlace)} XP
                            </div>
                            <div className="podium-pedestal">3</div>
                        </div>
                    )}
                </section>
            )}

            {/* 5. DANH SÁCH THỨ HẠNG 4 TRỞ ĐI */}
            <main className="leaderboard-table-section">
                <div className="leaderboard-card-container">
                    <div className="table-header">
                        <div>Thứ hạng</div>
                        <div>Người chơi</div>
                        <div className="table-header-score">Điểm số {activeTab === 'weekly' ? 'Tuần' : 'Cao Nhất'}</div>
                    </div>

                    {isLoading ? (
                        <div className="empty-leaderboard">
                            <Layers size={24} style={{ marginBottom: '8px' }} />
                            <div>Đang tải bảng xếp hạng...</div>
                        </div>
                    ) : leaders.length === 0 ? (
                        <div className="empty-leaderboard">
                            <div>Chưa có người chơi nào ghi điểm trong bảng này. Hãy là người đầu tiên!</div>
                        </div>
                    ) : (
                        remainingLeaders.map((player, idx) => {
                            const rank = idx + 4;
                            const isMe = user?.username && player.username?.toLowerCase() === user.username?.toLowerCase();

                            return (
                                <div key={player._id || idx} className={`table-row ${isMe ? 'is-current-user' : ''}`}>
                                    <div className="table-rank-number">
                                        #{rank}
                                    </div>
                                    <div className="table-user-cell">
                                        <div className="table-user-avatar">
                                            {player.avatar ? (
                                                <img src={player.avatar} alt={player.username} />
                                            ) : (
                                                player.username.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="table-user-names">
                                            <span className="table-display-name">
                                                {player.displayName || player.username} {isMe && '(Bạn)'}
                                            </span>
                                            <span className="table-user-role">
                                                @{player.username} • {player.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="table-score-cell">
                                        <span className="table-score-pill">
                                            ⚡ {getScore(player)} XP
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
};

export default LeaderboardPage;
