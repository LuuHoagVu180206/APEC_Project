import React from 'react';
import { Link } from 'react-router-dom';
import { StudioPageLogic } from '../pages_logic/StudioPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/StudioPageStyling.css';
import { 
    Sparkles, 
    Sun, 
    Moon, 
    LogOut, 
    FolderPlus, 
    HelpCircle, 
    Bookmark, 
    Layers, 
    FileSpreadsheet, 
    FileText, 
    Trash2, 
    ExternalLink, 
    Plus, 
    Globe, 
    Lock
} from 'lucide-react';

const StudioPage = () => {
    const {
        navigate, 
        currentUser, 
        questions, 
        formData, 
        setFormData,
        mySets, 
        questionSetFormData, 
        setQuestionSetFormData, 
        teacherClasses, 
        savedSetsData,
        schoolActionLabel,
        activeTab,
        setActiveTab,
        handleCreateSet, 
        handleCreateQuestion, 
        handleAddToSet, 
        handleDeleteSet,
        handleDeleteQuestion, 
        handleRemoveSavedSet, 
        handleExport,
        handleLogout
    } = StudioPageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    return (
        <div className="studio-wrapper">
            {/* 1. NAVBAR - ĐỒNG BỘ HOÀN TOÀN */}
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
                            <Link to="/studio" className="nav-link active">Studio</Link>
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

                        {currentUser && (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">{currentUser.username.charAt(0).toUpperCase()}</span>
                                    <span>{currentUser.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    {currentUser.role === 'teacher' ? (
                                        <>
                                            <Link to="/teacher/dashboard">Bảng điều khiển giáo viên</Link>
                                            <Link to="/schools">{schoolActionLabel}</Link>
                                            <Link to="/studio">Studio tạo bộ đề</Link>
                                        </>
                                    ) : (
                                        <>
                                            {currentUser.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
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
                        )}
                    </div>
                </div>
            </header>

            {/* 2. HERO SECTION & THỐNG KÊ NHANH */}
            <section className="studio-hero">
                <div className="studio-backdrop-glow"></div>
                <div className="studio-header-wrap">
                    <div className="studio-header-left">
                        <div className="studio-pill-badge">
                            <Sparkles size={13} />
                            <span>Trung Tâm Biên Soạn & Sáng Tạo</span>
                        </div>
                        <h1 className="studio-title">Góc Sáng Tạo của {currentUser?.username}</h1>
                        <p className="studio-subtitle">
                            Thiết kế bộ câu hỏi trắc nghiệm, quản lý ngân hàng câu đố và xuất tài liệu học tập PDF/Excel.
                        </p>
                    </div>

                    <div className="studio-stats-pills">
                        <div className="studio-stat-item">
                            <div className="studio-stat-icon icon-gold">
                                <Layers size={18} />
                            </div>
                            <div>
                                <div className="studio-stat-val">{mySets.length}</div>
                                <div className="studio-stat-label">Bộ đề của bạn</div>
                            </div>
                        </div>

                        <div className="studio-stat-item">
                            <div className="studio-stat-icon icon-blue">
                                <HelpCircle size={18} />
                            </div>
                            <div>
                                <div className="studio-stat-val">{questions.length}</div>
                                <div className="studio-stat-label">Câu hỏi tự tạo</div>
                            </div>
                        </div>

                        <div className="studio-stat-item">
                            <div className="studio-stat-icon icon-emerald">
                                <Bookmark size={18} />
                            </div>
                            <div>
                                <div className="studio-stat-val">{savedSetsData.length}</div>
                                <div className="studio-stat-label">Bộ đã lưu</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. TABS PHÂN KHU SÁNG TẠO */}
            <div className="studio-tabs-bar">
                <button
                    type="button"
                    className={`studio-tab-btn ${activeTab === 'sets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sets')}
                >
                    <Layers size={16} />
                    <span>Bộ câu hỏi của tôi</span>
                    <span className="studio-tab-badge">{mySets.length}</span>
                </button>

                <button
                    type="button"
                    className={`studio-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    <HelpCircle size={16} />
                    <span>Ngân hàng câu hỏi lẻ</span>
                    <span className="studio-tab-badge">{questions.length}</span>
                </button>

                <button
                    type="button"
                    className={`studio-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                >
                    <Bookmark size={16} />
                    <span>Bộ đề đã lưu</span>
                    <span className="studio-tab-badge">{savedSetsData.length}</span>
                </button>
            </div>

            {/* 4. KHU VỰC NỘI DUNG CHÍNH THEO TAB */}
            <main className="studio-main-content">
                {/* TAB 1: BỘ CÂU HỎI */}
                {activeTab === 'sets' && (
                    <div className="studio-view-grid">
                        {/* Cột Trái: Form tạo bộ đề mới */}
                        <div className="studio-form-card">
                            <div className="studio-card-head">
                                <FolderPlus size={19} color="var(--accent-gold)" />
                                <h3>Tạo Bộ Câu Hỏi Mới</h3>
                            </div>

                            <form onSubmit={handleCreateSet} className="studio-form-stack">
                                <div className="form-group-field">
                                    <label htmlFor="set-title">Tên bộ đề</label>
                                    <input 
                                        id="set-title"
                                        className="studio-input"
                                        required 
                                        placeholder="VD: Tổng ôn Toán 12 - Giải tích" 
                                        value={questionSetFormData.title} 
                                        onChange={(e) => setQuestionSetFormData({...questionSetFormData, title: e.target.value})} 
                                    />
                                </div>

                                <div className="form-group-field">
                                    <label htmlFor="set-desc">Mô tả ngắn</label>
                                    <textarea 
                                        id="set-desc"
                                        className="studio-textarea"
                                        placeholder="Mô tả nội dung, mục tiêu ôn tập..." 
                                        value={questionSetFormData.description} 
                                        onChange={(e) => setQuestionSetFormData({...questionSetFormData, description: e.target.value})} 
                                    />
                                </div>

                                <div className="form-group-field">
                                    <label htmlFor="set-topic">Chủ đề môn học</label>
                                    <select 
                                        id="set-topic"
                                        className="studio-select"
                                        value={questionSetFormData.topic} 
                                        onChange={(e) => setQuestionSetFormData({...questionSetFormData, topic: e.target.value})} 
                                    >
                                        <option value="Toán">Toán học</option>
                                        <option value="Tiếng Anh">Tiếng Anh</option>
                                        <option value="Hoá học">Hoá học</option>
                                        <option value="Vật lý">Vật lý</option>
                                        <option value="Lịch sử">Lịch sử</option>
                                        <option value="Tin học">Tin học</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                {currentUser?.role === 'teacher' && teacherClasses.length > 0 && (
                                    <div className="form-group-field">
                                        <label htmlFor="set-class">Gán trực tiếp vào lớp (Tùy chọn)</label>
                                        <select
                                            id="set-class"
                                            className="studio-select"
                                            value={questionSetFormData.classId || ''}
                                            onChange={(e) => setQuestionSetFormData({...questionSetFormData, classId: e.target.value})}
                                        >
                                            <option value="">Không gán lớp lúc này</option>
                                            {teacherClasses.map(cls => (
                                                <option key={cls._id} value={cls._id}>🏫 {cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <label className="checkbox-control-wrap">
                                    <input 
                                        type="checkbox" 
                                        checked={questionSetFormData.isPublic} 
                                        onChange={(e) => setQuestionSetFormData({...questionSetFormData, isPublic: e.target.checked})} 
                                    />
                                    <span>Công khai lên Thư viện cộng đồng</span>
                                </label>

                                <button type="submit" className="btn-studio-submit">
                                    <Plus size={18} />
                                    <span>Tạo Bộ Câu Hỏi</span>
                                </button>
                            </form>
                        </div>

                        {/* Cột Phải: Danh sách bộ câu hỏi đã tạo */}
                        <div className="studio-list-column">
                            {mySets.length === 0 ? (
                                <div className="studio-empty-box">
                                    <Layers size={36} color="var(--text-muted)" />
                                    <h4>Bạn chưa tạo bộ câu hỏi nào</h4>
                                    <p>Hãy điền thông tin vào biểu mẫu bên trái để tạo bộ đề trắc nghiệm đầu tiên của bạn!</p>
                                </div>
                            ) : (
                                mySets.map((set) => (
                                    <div key={set._id} className="studio-item-card">
                                        <div className="item-card-top">
                                            <div className="item-title-group">
                                                <h4>{set.title}</h4>
                                                <div className="item-meta-tags">
                                                    <span className={set.isPublic ? "pill-privacy-public" : "pill-privacy-private"}>
                                                        {set.isPublic ? (
                                                            <>
                                                                <Globe size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                                                Công khai
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                                                Riêng tư
                                                            </>
                                                        )}
                                                    </span>
                                                    <span>🏷️ {set.topic}</span>
                                                    <span>📝 {set.questions?.length || 0} câu</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="item-card-desc">
                                            {set.description || "Chưa có mô tả cho bộ đề này."}
                                        </p>

                                        <div className="item-card-actions">
                                            <div className="action-btns-group">
                                                <button 
                                                    className="btn-studio-action btn-view-set"
                                                    onClick={() => navigate(`/set/${set._id}`)}
                                                    title="Xem toàn bộ câu hỏi trong bộ này"
                                                >
                                                    <ExternalLink size={13} />
                                                    <span>Xem chi tiết</span>
                                                </button>

                                                <button 
                                                    className="btn-studio-action"
                                                    onClick={() => handleExport(set._id, 'excel')}
                                                    title="Xuất đề ra bảng tính Excel"
                                                >
                                                    <FileSpreadsheet size={13} />
                                                    <span>Excel</span>
                                                </button>

                                                <button 
                                                    className="btn-studio-action"
                                                    onClick={() => handleExport(set._id, 'pdf')}
                                                    title="Xuất tài liệu in ấn PDF"
                                                >
                                                    <FileText size={13} />
                                                    <span>PDF</span>
                                                </button>
                                            </div>

                                            <button 
                                                className="btn-studio-delete"
                                                onClick={() => handleDeleteSet(set._id)}
                                                title="Xóa bộ đề này"
                                            >
                                                <Trash2 size={15} />
                                                <span>Xóa bộ</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: NGÂN HÀNG CÂU HỎI LẺ */}
                {activeTab === 'questions' && (
                    <div className="studio-view-grid">
                        {/* Cột Trái: Form thêm câu hỏi mới */}
                        <div className="studio-form-card">
                            <div className="studio-card-head">
                                <HelpCircle size={19} color="var(--accent-blue)" />
                                <h3>Thêm Câu Hỏi Trắc Nghiệm</h3>
                            </div>

                            <form onSubmit={handleCreateQuestion} className="studio-form-stack">
                                <div className="form-group-field">
                                    <label htmlFor="q-text">Nội dung câu hỏi</label>
                                    <textarea 
                                        id="q-text"
                                        className="studio-textarea"
                                        required 
                                        placeholder="Nhập đề bài câu hỏi trắc nghiệm..." 
                                        value={formData.questionText} 
                                        onChange={(e) => setFormData({...formData, questionText: e.target.value})} 
                                        style={{ minHeight: '70px' }}
                                    />
                                </div>

                                <div className="form-group-field">
                                    <label>4 Lựa chọn trả lời</label>
                                    <div className="options-answers-grid">
                                        <div className="answer-option-row">
                                            <span className="option-letter-tag">A</span>
                                            <input 
                                                className="studio-input"
                                                required 
                                                placeholder="Đáp án A" 
                                                value={formData.optionA} 
                                                onChange={(e) => setFormData({...formData, optionA: e.target.value})} 
                                            />
                                        </div>
                                        <div className="answer-option-row">
                                            <span className="option-letter-tag">B</span>
                                            <input 
                                                className="studio-input"
                                                required 
                                                placeholder="Đáp án B" 
                                                value={formData.optionB} 
                                                onChange={(e) => setFormData({...formData, optionB: e.target.value})} 
                                            />
                                        </div>
                                        <div className="answer-option-row">
                                            <span className="option-letter-tag">C</span>
                                            <input 
                                                className="studio-input"
                                                required 
                                                placeholder="Đáp án C" 
                                                value={formData.optionC} 
                                                onChange={(e) => setFormData({...formData, optionC: e.target.value})} 
                                            />
                                        </div>
                                        <div className="answer-option-row">
                                            <span className="option-letter-tag">D</span>
                                            <input 
                                                className="studio-input"
                                                required 
                                                placeholder="Đáp án D" 
                                                value={formData.optionD} 
                                                onChange={(e) => setFormData({...formData, optionD: e.target.value})} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div className="form-group-field">
                                        <label htmlFor="q-correct">Đáp án đúng</label>
                                        <select 
                                            id="q-correct"
                                            className="studio-select" 
                                            value={formData.correctAnswer} 
                                            onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
                                        >
                                            <option value="A">Đáp án A</option>
                                            <option value="B">Đáp án B</option>
                                            <option value="C">Đáp án C</option>
                                            <option value="D">Đáp án D</option>
                                        </select>
                                    </div>

                                    <div className="form-group-field">
                                        <label htmlFor="q-difficulty">Độ khó</label>
                                        <select 
                                            id="q-difficulty"
                                            className="studio-select" 
                                            value={formData.difficulty} 
                                            onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                        >
                                            <option value="easy">Dễ</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="hard">Khó</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-field">
                                    <label htmlFor="q-topic">Chủ đề môn học</label>
                                    <select 
                                        id="q-topic"
                                        className="studio-select" 
                                        value={formData.topic} 
                                        onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                    >
                                        <option value="Toán">Toán</option>
                                        <option value="Tiếng Anh">Tiếng Anh</option>
                                        <option value="Lịch sử">Lịch sử</option>
                                        <option value="Hoá học">Hoá học</option>
                                        <option value="Vật lý">Vật lý</option>
                                        <option value="Tin học">Tin học</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                {mySets.length > 0 && (
                                    <div className="form-group-field">
                                        <label htmlFor="q-set">Gán ngay vào bộ (Tùy chọn)</label>
                                        <select 
                                            id="q-set"
                                            className="studio-select" 
                                            value={formData.setId} 
                                            onChange={(e) => setFormData({...formData, setId: e.target.value})}
                                        >
                                            <option value="">Lưu vào ngân hàng chung</option>
                                            {mySets.map(set => (
                                                <option key={set._id} value={set._id}>📦 {set.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button type="submit" className="btn-studio-submit">
                                    <Plus size={18} />
                                    <span>Lưu Câu Hỏi</span>
                                </button>
                            </form>
                        </div>

                        {/* Cột Phải: Danh sách câu hỏi lẻ đã tạo */}
                        <div className="studio-list-column">
                            {questions.length === 0 ? (
                                <div className="studio-empty-box">
                                    <HelpCircle size={36} color="var(--text-muted)" />
                                    <h4>Ngân hàng câu hỏi của bạn đang trống</h4>
                                    <p>Tạo các câu hỏi trắc nghiệm bên trái để tích lũy kho đề và nhét vào các bộ câu hỏi!</p>
                                </div>
                            ) : (
                                questions.map((q, index) => {
                                    const diffClass = q.difficulty === 'hard' 
                                        ? 'pill-difficulty-hard' 
                                        : q.difficulty === 'medium' 
                                            ? 'pill-difficulty-medium' 
                                            : 'pill-difficulty-easy';
                                    
                                    const diffText = q.difficulty === 'hard' 
                                        ? 'Khó' 
                                        : q.difficulty === 'medium' 
                                            ? 'Trung bình' 
                                            : 'Dễ';

                                    return (
                                        <div key={q._id} className="studio-item-card">
                                            <div className="item-card-top">
                                                <div className="item-title-group">
                                                    <h4>Câu {index + 1}: {q.questionText}</h4>
                                                    <div className="item-meta-tags">
                                                        <span className={diffClass}>• Độ khó: {diffText}</span>
                                                        <span>• Môn: {q.topic || 'Khác'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Preview 4 đáp án */}
                                            {q.options && q.options.length === 4 && (
                                                <div className="item-answers-preview">
                                                    {q.options.map((opt, i) => {
                                                        const label = ['A', 'B', 'C', 'D'][i];
                                                        const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
                                                        return (
                                                            <div key={i} className={`answer-pill-snippet ${isCorrect ? 'is-correct' : ''}`}>
                                                                <strong>{label}.</strong> {opt} {isCorrect && '✓'}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="item-card-actions">
                                                <div className="action-btns-group">
                                                    {mySets.length > 0 && (
                                                        <select 
                                                            className="studio-select"
                                                            defaultValue=""
                                                            onChange={(e) => {
                                                                handleAddToSet(q._id, e.target.value);
                                                                e.target.value = ""; 
                                                            }}
                                                            style={{ width: 'auto', padding: '6px 12px', fontSize: '13px' }}
                                                        >
                                                            <option value="" disabled>➕ Thêm vào bộ đề...</option>
                                                            {mySets.map(set => (
                                                                <option key={set._id} value={set._id}>📦 {set.title}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>

                                                <button 
                                                    className="btn-studio-delete"
                                                    onClick={() => handleDeleteQuestion(q._id)}
                                                    title="Xóa câu hỏi này khỏi ngân hàng"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Xóa câu</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: BỘ ĐỀ ĐÃ LƯU TỪ THƯ VIỆN */}
                {activeTab === 'saved' && (
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                        {savedSetsData.length === 0 ? (
                            <div className="studio-empty-box">
                                <Bookmark size={36} color="var(--text-muted)" />
                                <h4>Bạn chưa lưu bộ câu hỏi nào</h4>
                                <p>Ghé thăm Thư Viện để khám phá các bộ đề hay được chia sẻ và bấm "Lưu bộ" nhé!</p>
                                <button className="btn-studio-submit" onClick={() => navigate('/library')} style={{ width: 'auto', marginTop: '10px' }}>
                                    <span>Đến Thư Viện</span>
                                </button>
                            </div>
                        ) : (
                            <div className="studio-list-column">
                                {savedSetsData.map((set) => (
                                    <div key={set._id} className="studio-item-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                                        <div className="item-card-top">
                                            <div className="item-title-group">
                                                <h4>🔖 {set.title}</h4>
                                                <div className="item-meta-tags">
                                                    <span>Tác giả: <strong>{set.owner?.username || "Ẩn danh"}</strong></span>
                                                    <span>🏷️ Chủ đề: {set.topic}</span>
                                                    <span>❤️ {set.likesCount || 0} lượt thích</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="item-card-desc">
                                            {set.description || "Bộ câu hỏi chất lượng cao đã lưu vào bộ sưu tập cá nhân."}
                                        </p>

                                        <div className="item-card-actions">
                                            <div className="action-btns-group">
                                                <button 
                                                    className="btn-studio-action btn-view-set"
                                                    onClick={() => navigate(`/set/${set._id}`)}
                                                >
                                                    <ExternalLink size={13} />
                                                    <span>Xem chi tiết câu hỏi</span>
                                                </button>

                                                <button 
                                                    className="btn-studio-action"
                                                    onClick={() => handleExport(set._id, 'excel')}
                                                >
                                                    <FileSpreadsheet size={13} />
                                                    <span>Excel</span>
                                                </button>

                                                <button 
                                                    className="btn-studio-action"
                                                    onClick={() => handleExport(set._id, 'pdf')}
                                                >
                                                    <FileText size={13} />
                                                    <span>PDF</span>
                                                </button>
                                            </div>

                                            <button 
                                                className="btn-studio-delete"
                                                onClick={() => handleRemoveSavedSet(set._id)}
                                            >
                                                <span>Bỏ lưu</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudioPage;
