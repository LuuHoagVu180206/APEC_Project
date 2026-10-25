import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Sun, Moon, LogOut } from 'lucide-react';
import { useDarkMode } from '../pages_logic/useDarkMode';
import './Navbar.css';

const Navbar = ({ activePage }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useDarkMode();

    const [user, setUser] = useState(() => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            return savedUser?.username ? savedUser : null;
        } catch {
            return null;
        }
    });

    const [schoolMemberships, setSchoolMemberships] = useState([]);

    useEffect(() => {
        if (!user?.accessToken) return undefined;
        let isActive = true;
        axios.get('http://localhost:5000/api/schools/mine', {
            headers: { token: user.accessToken }
        }).then((response) => {
            if (isActive) setSchoolMemberships(response.data);
        }).catch(() => {});
        return () => { isActive = false; };
    }, [user]);

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setSchoolMemberships([]);
        navigate('/');
    };

    const isPathActive = (key, path) => {
        if (activePage) return activePage === key;
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <header className="navbar">
            <div className="nav-container">
                <div className="nav-left">
                    <div className="brand-logo" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/')}>
                        <div className="brand-coin">
                            <Sparkles size={18} />
                        </div>
                        <span className="brand-name">EasyLearn</span>
                    </div>

                    <nav className="nav-links" aria-label="Main navigation">
                        <Link to="/" className={`nav-link ${isPathActive('home', '/') ? 'active' : ''}`}>
                            Trang chủ
                        </Link>
                        <Link to="/library" className={`nav-link ${isPathActive('library', '/library') ? 'active' : ''}`}>
                            Thư viện
                        </Link>
                        <Link to="/leaderboard" className={`nav-link ${isPathActive('leaderboard', '/leaderboard') ? 'active' : ''}`}>
                            Bảng xếp hạng
                        </Link>
                        <Link to="/schools" className={`nav-link ${isPathActive('schools', '/schools') ? 'active' : ''}`}>
                            Trường học
                        </Link>
                        <Link to="/studio" className={`nav-link ${isPathActive('studio', '/studio') ? 'active' : ''}`}>
                            Studio
                        </Link>
                    </nav>
                </div>

                <div className="nav-right">
                    <button 
                        type="button"
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
                    ) : user?.role === 'user' || user?.role === 'admin' ? (
                        <div className="teacher-account-menu">
                            <Link className="nav-username" to="/profile">
                                <span className="user-avatar-badge">{user.username.charAt(0).toUpperCase()}</span>
                                <span>{user.username}</span>
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
                            <button type="button" className="btn-secondary-nav" onClick={() => navigate('/login')}>
                                Đăng nhập
                            </button>
                            <button type="button" className="btn-primary-nav" onClick={() => navigate('/login?mode=register')}>
                                Bắt đầu ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;

