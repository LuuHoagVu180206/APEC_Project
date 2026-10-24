import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuestionSetPageLogic } from '../pages_logic/QuestionSetPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/LibraryPageStyling.css';
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
            <div className="library-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div className="empty-icon-wrap" style={{ margin: '0 auto 16px auto' }}>
                        <Layers size={32} />
                    </div>
                    <h3>Đang tải dữ liệu bộ câu hỏi...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="library-wrapper">
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
                                    <span className="user-avatar-badge">{user.username.charAt(0).toUpperCase()}</span>
                                    <span>{user.username}</span>
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
            <main style={{ maxWidth: '960px', width: '100%', margin: '0 auto', padding: '30px 20px 60px 20px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button 
                        onClick={() => navigate('/library')} 
                        className="btn-card-icon"
                        style={{ padding: '8px 16px', fontSize: '13.5px' }}
                    >
                        <ArrowLeft size={16} />
                        <span>Về Thư Viện</span>
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn-export-mini" 
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                            onClick={() => handleExport('excel')}
                        >
                            <FileSpreadsheet size={15} style={{ marginRight: '4px' }} />
                            Tải Excel
                        </button>
                        <button 
                            className="btn-export-mini" 
                            style={{ padding: '8px 14px', fontSize: '13px' }}
                            onClick={() => handleExport('pdf')}
                        >
                            <FileText size={15} style={{ marginRight: '4px' }} />
                            Tải PDF
                        </button>
                    </div>
                </div>

                {/* Banner Thông Tin Bộ Đề */}
                <div style={{ 
                    background: 'var(--bg-surface)', 
                    border: '1.5px solid var(--border-subtle)', 
                    borderRadius: '18px', 
                    padding: '28px', 
                    marginBottom: '28px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            background: 'var(--accent-gold-subtle)', 
                            color: 'var(--accent-gold)', 
                            fontSize: '12px', 
                            fontWeight: '800', 
                            textTransform: 'uppercase' 
                        }}>
                            🏷️ {setData.topic || 'Khác'}
                        </span>
                        <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            background: 'var(--accent-blue-subtle)', 
                            color: 'var(--accent-blue)', 
                            fontSize: '12px', 
                            fontWeight: '800' 
                        }}>
                            📝 {questions.length} câu hỏi
                        </span>
                    </div>

                    <h1 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {setData.title}
                    </h1>

                    <p style={{ margin: '0 0 16px 0', fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {setData.description || "Bộ câu hỏi chất lượng cao phục vụ rèn luyện và củng cố kiến thức."}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
                            Tác giả: <strong>{setData.owner?.username || "Ẩn danh"}</strong>
                        </span>

                        <button 
                            className="btn-primary-nav"
                            onClick={() => navigate('/game')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Gamepad2 size={16} />
                            <span>Vào Game luyện tập</span>
                        </button>
                    </div>
                </div>

                {/* Danh Sách Chi Tiết Các Câu Hỏi */}
                <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '18px' }}>
                    Danh sách câu hỏi chi tiết ({questions.length})
                </h3>

                {questions.length === 0 ? (
                    <div className="library-empty-state">
                        <div className="empty-icon-wrap">
                            <BookOpen size={28} />
                        </div>
                        <h3>Bộ câu hỏi này chưa có câu hỏi nào</h3>
                        <p>Bạn có thể vào Studio để tạo thêm câu hỏi và gán vào bộ đề này nhé.</p>
                    </div>
                ) : (
                    questions.map((q, index) => (
                        <div key={q._id} style={{ 
                            background: 'var(--bg-surface)', 
                            border: '1px solid var(--border-subtle)', 
                            borderRadius: '14px', 
                            padding: '22px', 
                            marginBottom: '16px', 
                            boxShadow: 'var(--shadow-sm)' 
                        }}>
                            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '16.5px', lineHeight: '1.5', fontWeight: '700' }}>
                                <span style={{ color: 'var(--accent-blue)', marginRight: '6px' }}>Câu {index + 1}:</span> 
                                {q.questionText}
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                                {q.options && q.options.map((opt, i) => {
                                    const labels = ['A', 'B', 'C', 'D'];
                                    const isCorrect = q.correctAnswer === labels[i] || q.correctAnswer === opt;
                                    return (
                                        <div key={i} style={{ 
                                            padding: '11px 14px', 
                                            background: isCorrect ? 'var(--accent-emerald-subtle)' : 'var(--bg-surface-elevated)', 
                                            border: isCorrect ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                                            borderRadius: '8px',
                                            color: isCorrect ? 'var(--accent-emerald)' : 'var(--text-primary)',
                                            fontWeight: isCorrect ? '800' : '500',
                                            fontSize: '13.5px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span><strong>{labels[i]}.</strong> {opt}</span>
                                            {isCorrect && <CheckCircle2 size={16} />}
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ 
                                borderTop: '1px solid var(--border-subtle)', 
                                paddingTop: '10px', 
                                fontSize: '13px', 
                                color: 'var(--text-muted)',
                                display: 'flex',
                                gap: '20px'
                            }}>
                                <div>Đáp án đúng: <strong style={{ color: 'var(--accent-emerald)' }}>{q.correctAnswer}</strong></div>
                                <div>Độ khó: <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{q.difficulty || 'Chưa phân loại'}</span></div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default QuestionSetPage;