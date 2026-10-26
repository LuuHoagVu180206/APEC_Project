import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuestionSetPageLogic } from '../pages_logic/QuestionSetPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/QuestionSetStyling.css';
import { 
    Sparkles, 
    ArrowLeft, 
    BookOpen, 
    Gamepad2, 
    Sun, 
    Moon, 
    LogOut, 
    CheckCircle2, 
    Layers,
    FileSpreadsheet,
    FileText
} from 'lucide-react';
import axios from 'axios';

const QuestionSetPage = () => {
    const { navigate, setData, questions } = QuestionSetPageLogic();
    const { isDark, toggleTheme } = useDarkMode();

    const [user, setUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('user'));
            return saved?.username ? saved : null;
        } catch {
            return null;
        }
    });

    const [schoolMemberships, setSchoolMemberships] = useState([]);

    useEffect(() => {
        if (!user?.accessToken) return;
        let isActive = true;
        axios.get('http://localhost:5000/api/schools/mine', {
            headers: { token: user.accessToken }
        }).then((res) => {
            if (isActive) setSchoolMemberships(res.data);
        }).catch(() => {});
        return () => { isActive = false; };
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    const handleExport = async (type) => {
        if (!setData?._id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/sets/${setData._id}/export?type=${type}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = type === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `Bo_Cau_Hoi_${setData._id}.${ext}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Lỗi xuất file!");
        }
    };

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    if (!setData) {
        return (
            <div className="qset-page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }}>
                        <Layers size={28} />
                    </div>
                    <h3>Đang tải dữ liệu bộ câu hỏi...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="qset-page-wrapper">
            {/* 1. NAVBAR ĐỒNG BỘ */}
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

                        {user ? (
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
                                    {user.role === 'teacher' ? (
                                        <>
                                            <Link to="/teacher/dashboard">Bảng điều khiển giáo viên</Link>
                                            <Link to="/schools">{schoolActionLabel}</Link>
                                            <Link to="/studio">Studio tạo bộ đề</Link>
                                        </>
                                    ) : (
                                        <>
                                            {user.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
                                            <Link to="/schools">{schoolActionLabel}</Link>
                                            <Link to="/student/classes">Lớp học của tôi</Link>
                                            <Link to="/game">Chơi Game Quiz</Link>
                                        </>
                                    )}
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

            {/* 2. NỘI DUNG CHI TIẾT BỘ ĐỀ */}
            <main className="qset-main-container">
                {/* Hàng điều hướng trên cùng */}
                <div className="qset-top-nav-row">
                    <button 
                        onClick={() => navigate('/library')} 
                        className="btn-qset-back"
                    >
                        <ArrowLeft size={16} />
                        <span>Về Thư Viện</span>
                    </button>

                    <div className="qset-export-group">
                        <button 
                            className="btn-qset-export" 
                            onClick={() => handleExport('excel')}
                            title="Tải về file bảng tính Excel"
                        >
                            <FileSpreadsheet size={15} />
                            <span>Tải Excel</span>
                        </button>
                        <button 
                            className="btn-qset-export" 
                            onClick={() => handleExport('pdf')}
                            title="Tải về file tài liệu in ấn PDF"
                        >
                            <FileText size={15} />
                            <span>Tải PDF</span>
                        </button>
                    </div>
                </div>

                {/* Banner Thông Tin Bộ Đề */}
                <div className="qset-hero-card">
                    <div className="qset-badge-row">
                        <span className="qset-pill-topic">
                            🏷️ {setData.topic || 'Khác'}
                        </span>
                        <span className="qset-pill-count">
                            📝 {questions.length} câu hỏi
                        </span>
                    </div>

                    <h1 className="qset-title">
                        {setData.title}
                    </h1>

                    <p className="qset-description">
                        {setData.description || "Bộ câu hỏi chất lượng cao phục vụ rèn luyện, nâng cao kỹ năng và củng cố kiến thức."}
                    </p>

                    <div className="qset-card-footer">
                        <div className="qset-author-info">
                            <div className="author-circle">
                                {(setData.owner?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                            <span>
                                Tác giả: <strong>{setData.owner?.username || "Ẩn danh"}</strong>
                            </span>
                        </div>

                        <button 
                            className="btn-play-game-cta"
                            onClick={() => navigate('/game')}
                        >
                            <Gamepad2 size={18} />
                            <span>Vào Game luyện tập</span>
                        </button>
                    </div>
                </div>

                {/* Danh Sách Chi Tiết Các Câu Hỏi */}
                <div className="qset-questions-header">
                    <h3>Danh sách câu hỏi chi tiết ({questions.length})</h3>
                </div>

                {questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)', borderRadius: '16px' }}>
                        <div style={{ width: '48px', height: '48px', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}>
                            <BookOpen size={24} />
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Bộ câu hỏi này chưa có câu hỏi nào</h4>
                        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)' }}>Bạn có thể vào Studio để tạo thêm câu hỏi và gán vào bộ đề này.</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div key={q._id} className="qset-question-card">
                            <h4 className="qset-q-title">
                                <span className="qset-q-num">Câu {index + 1}:</span> 
                                {q.questionText}
                            </h4>

                            <div className="qset-options-grid">
                                {q.options && q.options.map((opt, i) => {
                                    const labels = ['A', 'B', 'C', 'D'];
                                    const isCorrect = q.correctAnswer === labels[i] || q.correctAnswer === opt;
                                    return (
                                        <div key={i} className={`qset-option-item ${isCorrect ? 'correct' : ''}`}>
                                            <span>
                                                <strong className="option-badge-letter">{labels[i]}.</strong> {opt}
                                            </span>
                                            {isCorrect && <CheckCircle2 size={16} />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="qset-card-meta">
                                <div>
                                    <span>Đáp án đúng: </span>
                                    <strong className="meta-answer-highlight">{q.correctAnswer}</strong>
                                </div>
                                <div>
                                    <span>Độ khó: </span>
                                    <strong style={{ textTransform: 'capitalize' }}>
                                        {q.difficulty === 'hard' ? 'Khó' : q.difficulty === 'medium' ? 'Trung bình' : 'Dễ'}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default QuestionSetPage;
