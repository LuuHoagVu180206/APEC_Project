import React from 'react';
import { Link } from 'react-router-dom';
import { LeaderboardPageLogic } from '../pages_logic/LeaderboardPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/LeaderboardPageStyling.css';
import { 
    Trophy, 
    Flame, 
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
        currentScore
    } = LeaderboardPageLogic();

    const getScore = (player) => {
        if (!player) return 0;
        return activeTab === 'weekly' ? (player.weeklyScore || 0) : (player.highScore || 0);
    };

    const isGuest = !user || user.role === 'guest';

    return (
        <div className="leaderboard-wrapper">
            {/* 1. NAVBAR DÙNG CHUNG ĐỒNG BỘ TOÀN HỆ THỐNG */}
            <Navbar activePage="leaderboard" />

            {/* 2. HERO HEADER LEADERBOARD THEO PHONG CÁCH POSITIVUS */}
            <section className="leaderboard-hero">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Bảng Vàng Danh Dự</span>
                        <p className="positivus-section-desc">
                            Vinh danh những tuyển thủ và người học xuất sắc nhất hệ thống. Tham gia các thử thách sự kiện tuần của <strong>APEC Group</strong> để ghi danh vào bảng vàng và nhận huy hiệu danh giá!
                        </p>
                    </div>

                    {/* Tabs chuyển đổi giữa Thử thách Tuần và Toàn thời gian */}
                    <div className="leaderboard-tabs-wrap">
                        <button 
                            type="button"
                            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => handleTabChange('weekly')}
                        >
                            <Flame size={18} />
                            <span>Thử Thách Tuần (Weekly Challenge)</span>
                        </button>
                        <button 
                            type="button"
                            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => handleTabChange('all')}
                        >
                            <Crown size={18} />
                            <span>Bảng Vinh Danh Toàn Thời Gian</span>
                        </button>
                    </div>

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
                                        <h4>{user.displayName || user.username} <span className="rank-self-pill">(Hồ sơ của bạn)</span></h4>
                                        <div className="user-rank-stats">
                                            <span>Thứ hạng: <strong className="rank-badge-pill">{userRank ? `#${userRank}` : 'Chưa có hạng'}</strong></span>
                                            <span className="stat-dot">•</span>
                                            <span>Điểm {activeTab === 'weekly' ? 'Tuần' : 'Kỷ Lục'}: <strong className="score-badge-pill">⚡ {currentScore} Điểm</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <Link to="/game" className="btn-play-climb-rank">
                                    <Gamepad2 size={18} />
                                    <span>Chơi Game Leo Hạng Ngay</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. TOP 3 PODIUM (BỤC VINH QUANG NEO-BRUTALIST) */}
            {!isLoading && leaders.length > 0 && (
                <section className="podium-section">
                    <div className="section-container">
                        <div className="podium-container">
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
                                        <Medal size={14} />
                                        <span>{getScore(secondPlace)} Điểm</span>
                                    </div>
                                    <div className="podium-pedestal">
                                        <span className="pedestal-num">2</span>
                                    </div>
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
                                        <Trophy size={14} />
                                        <span>{getScore(firstPlace)} Điểm</span>
                                    </div>
                                    <div className="podium-pedestal">
                                        <span className="pedestal-num">1</span>
                                    </div>
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
                                        <Award size={14} />
                                        <span>{getScore(thirdPlace)} Điểm</span>
                                    </div>
                                    <div className="podium-pedestal">
                                        <span className="pedestal-num">3</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. DANH SÁCH THỨ HẠNG 4 TRỞ ĐI */}
            <main className="leaderboard-table-section">
                <div className="section-container">
                    <div className="leaderboard-card-container">
                        <div className="table-header">
                            <div className="col-rank">Thứ hạng</div>
                            <div className="col-user">Tuyển thủ</div>
                            <div className="col-score">Điểm số {activeTab === 'weekly' ? 'Tuần' : 'Cao Nhất'}</div>
                        </div>

                        {isLoading ? (
                            <div className="empty-leaderboard">
                                <Layers size={28} />
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
                                                    {player.displayName || player.username} {isMe && <span className="self-tag">(Bạn)</span>}
                                                </span>
                                                <span className="table-user-role">
                                                    @{player.username} • {player.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="table-score-cell">
                                            <span className="table-score-pill">
                                                ⚡ {getScore(player)} Điểm
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LeaderboardPage;
