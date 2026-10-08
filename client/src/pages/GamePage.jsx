import React, { useState } from 'react';
import { Menu, Sun, Moon } from 'lucide-react'; // Thêm icon 3 gạch
import { GamePageLogic } from '../pages_logic/GamePageLogic';
import '../pages_styling/GamePageStyling.css';
import { useDarkMode } from '../pages_logic/useDarkMode';
const GamePage = () => {
    const {
        user,
        gameVersion,
        iframeRef,
        navigate,
        handleLogout
    } = GamePageLogic(); //[cite: 5]

    const { isDark, toggleTheme } = useDarkMode();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

return (
        <div className="game-page-wrapper">
            <nav className="game-navbar">
                <div className="nav-left">

                    <h2 className="logo" onClick={() => navigate('/Landing')}>EasyLearn</h2>
                        
                    <button 
                        onClick={toggleTheme} 
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px'
                        }}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {gameVersion && <span className="game-version">Phiên bản: {gameVersion}</span>}
                </div>
                
                <div className="nav-right">
                    {user && (
                        <div className="user-info">

                            <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>

                            <span className="username clickable-name" onClick={() => navigate('/profile')} title="Đến trang cá nhân">
                                {user.username}
                            </span>

                            {user.highScore !== undefined && (
                                <span className="highscore">🏆 Điểm cao: {user.highScore}</span>
                            )}

                        </div>
                    )}

                    {/* Dropdown Menu */}
                    <div className="dropdown-container">

                        <button 
                            className="btn-icon" 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title="Menu chức năng"
                        >
                            <Menu size={24} />
                        </button>

                        {isMenuOpen && (
                            <div className="dropdown-menu">
                                <button 
                                    className="dropdown-item"
                                    onClick={() => navigate('/studio')}
                                >
                                    Quản lý câu hỏi
                                </button>

                                {user?.role === 'admin' && (
                                    <button 
                                        className="dropdown-item"
                                        onClick={() => navigate('/admin')}
                                    >
                                        Quản trị hệ thống
                                    </button>
                                )}

                                <button className="dropdown-item" onClick={() => navigate('/library')}>
                                    Thư viện
                                </button>

                                <button className="dropdown-item" onClick={() => navigate('/leaderboard')}>
                                    Bảng xếp hạng
                                </button>
                                
                                <div className="dropdown-divider"></div>
                                
                                <button 
                                    className="dropdown-item text-danger" 
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Khu vực chứa Game */}
            <div className="game-container">
                <iframe 
                    ref={iframeRef} 
                    src={`/game/${gameVersion}/index.html`}
                    title="EduGame Canvas"
                    className="game-iframe"
                    frameBorder="0"
                ></iframe>
            </div>
        </div>
    );
};

export default GamePage;