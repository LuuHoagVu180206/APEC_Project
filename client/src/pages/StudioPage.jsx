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
    Lock,
    Lightbulb,
    Loader2,
    Wand2,
    Bot,
    CheckCircle2,
    PencilLine,
    BookmarkCheck,
    RotateCcw,
    UploadCloud,
    Image as ImageIcon
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
        handleLogout,
        isGeneratingAi,
        canGenerateAiExplanation,
        handleGenerateAiExplanation,
        creationMode,
        setCreationMode,
        aiInputData,
        setAiInputData,
        isGeneratingBatch,
        isSavingBatch,
        generatedQuestions,
                aiSourceType,
        setAiSourceType,
        aiImagePreview,
        aiImageName,
        aiImagePrompt,
        setAiImagePrompt,
        isGeneratingImageBatch,
        handleImageSelect,
        handleRemoveImage,
        handlePasteImage,
        handleGenerateQuestionsFromImage,
        handleGenerateQuestionsFromContext,
        handleLoadIntoForm,
        handleSaveSingleGeneratedQuestion,
        handleSaveAllGeneratedQuestions,
        handleClearGeneratedQuestions
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
                            <Link to="/student/classes" className="nav-link">Lớp học</Link>
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
                            <div className="studio-card-head" style={{ flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HelpCircle size={19} color="var(--accent-blue)" />
                                    <h3>Thêm Câu Hỏi Trắc Nghiệm</h3>
                                </div>

                                <div className="creation-mode-tabs">
                                    <button 
                                        type="button" 
                                        className={`mode-tab-btn ${creationMode === 'manual' ? 'active' : ''}`}
                                        onClick={() => setCreationMode('manual')}
                                    >
                                        <PencilLine size={13} />
                                        <span>Thủ công</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`mode-tab-btn ${creationMode === 'ai' ? 'active' : ''}`}
                                        onClick={() => setCreationMode('ai')}
                                    >
                                        <Sparkles size={13} />
                                        <span>AI Trợ lý tạo đề</span>
                                    </button>
                                </div>
                            </div>

                            {creationMode === 'manual' ? (
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

                                <div className="form-group-field">
                                    <div className="explanation-field-header">
                                        <label htmlFor="q-explanation" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Lightbulb size={14} color="var(--accent-gold)" />
                                            <span>Giải thích đáp án (Tùy chọn)</span>
                                        </label>

                                        <button
                                            type="button"
                                            className={`btn-ai-generate ${!canGenerateAiExplanation ? 'disabled' : ''} ${isGeneratingAi ? 'loading' : ''}`}
                                            onClick={handleGenerateAiExplanation}
                                            disabled={!canGenerateAiExplanation || isGeneratingAi}
                                            title={canGenerateAiExplanation ? "Sử dụng AI Qwen 2.5 để tự động tạo lời giải thích" : "Vui lòng nhập đề bài và đủ 4 đáp án để mở khóa nút AI"}
                                        >
                                            {isGeneratingAi ? (
                                                <>
                                                    <Loader2 size={13} className="spin-animation" />
                                                    <span>AI đang suy nghĩ...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={13} />
                                                    <span>Tạo giải thích bằng AI (Qwen 2.5)</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <textarea 
                                        id="q-explanation"
                                        className="studio-textarea"
                                        placeholder={canGenerateAiExplanation ? "Nhập lời giải hoặc bấm nút 'Tạo giải thích bằng AI' ở trên để tự động tạo..." : "Nhập lời giải chi tiết vì sao đáp án này đúng..."} 
                                        value={formData.explanation || ''} 
                                        onChange={(e) => setFormData({...formData, explanation: e.target.value})} 
                                        style={{ minHeight: '75px' }}
                                    />

                                    {!canGenerateAiExplanation && (
                                        <small className="ai-hint-msg">
                                            💡 Mẹo: Nhập đề bài và đủ 4 lựa chọn (A, B, C, D) để mở khóa tạo lời giải bằng AI Qwen 2.5.
                                        </small>
                                    )}
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
                            ) : (
                                <div className="studio-ai-generator-panel">
                                    <div className="ai-banner-card">
                                        <div className="ai-banner-icon">
                                            {aiSourceType === 'image' ? <ImageIcon size={22} /> : <Bot size={22} />}
                                        </div>
                                        <div className="ai-banner-text">
                                            <h4>{aiSourceType === 'image' ? 'Trợ lý AI Qwen2-VL Soạn Câu Hỏi Từ Hình Ảnh' : 'Trợ lý AI Qwen 2.5 Soạn Câu Hỏi Từ Tài Liệu'}</h4>
                                            <p>
                                                {aiSourceType === 'image' 
                                                    ? 'Tải lên hoặc dán ảnh bài tập, sơ đồ mạch, đồ thị hoặc hình vẽ thí nghiệm. Model Qwen2-VL-7B-Instruct sẽ quan sát hình ảnh và tự động tạo câu hỏi trắc nghiệm kèm giải thích chuẩn sư phạm!' 
                                                    : 'Dán đoạn tài liệu, bài giảng hoặc khái niệm (Vật lý, Toán, Lịch sử...). AI sẽ đọc dữ liệu và tự động tạo số câu hỏi trắc nghiệm mong muốn kèm lời giải thích!'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Nút chuyển đổi nguồn: Văn bản hoặc Hình ảnh */}
                                    <div className="ai-source-toggle-tabs">
                                        <button
                                            type="button"
                                            className={`ai-source-tab-btn ${aiSourceType === 'text' ? 'active' : ''}`}
                                            onClick={() => setAiSourceType('text')}
                                        >
                                            <FileText size={14} />
                                            <span>Từ văn bản / tài liệu</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`ai-source-tab-btn ${aiSourceType === 'image' ? 'active' : ''}`}
                                            onClick={() => setAiSourceType('image')}
                                        >
                                            <ImageIcon size={14} />
                                            <span>Từ hình ảnh (Qwen2-VL)</span>
                                        </button>
                                    </div>

                                    {aiSourceType === 'text' ? (
                                    <form onSubmit={handleGenerateQuestionsFromContext} className="studio-form-stack">
                                        <div className="form-group-field">
                                            <label htmlFor="ai-context" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FileText size={14} color="var(--accent-purple)" />
                                                <span>Dữ liệu / Khái niệm tài liệu đầu vào</span>
                                                <span style={{ color: 'var(--error-red)' }}>*</span>
                                            </label>
                                            <textarea 
                                                id="ai-context"
                                                className="studio-textarea"
                                                required 
                                                placeholder="Ví dụ: Định luật I Newton: Một vật không chịu tác dụng của lực nào hoặc chịu tác dụng của các lực có hợp lực bằng 0 thì vật đang đứng yên sẽ tiếp tục đứng yên, đang chuyển động thẳng đều sẽ tiếp tục chuyển động thẳng đều..."
                                                value={aiInputData.context}
                                                onChange={(e) => setAiInputData({...aiInputData, context: e.target.value})}
                                                style={{ minHeight: '110px' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div className="form-group-field">
                                                <label htmlFor="ai-num">Số câu hỏi muốn tạo</label>
                                                <input 
                                                    id="ai-num"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    className="studio-input"
                                                    value={aiInputData.numQuestions}
                                                    onChange={(e) => setAiInputData({...aiInputData, numQuestions: parseInt(e.target.value, 10) || 1})}
                                                />
                                            </div>

                                            <div className="form-group-field">
                                                <label htmlFor="ai-topic">Chủ đề môn học</label>
                                                <select 
                                                    id="ai-topic"
                                                    className="studio-select" 
                                                    value={aiInputData.topic} 
                                                    onChange={(e) => setAiInputData({...aiInputData, topic: e.target.value})}
                                                >
                                                    <option value="Vật lý">Vật lý</option>
                                                    <option value="Toán">Toán học</option>
                                                    <option value="Hoá học">Hoá học</option>
                                                    <option value="Sinh học">Sinh học</option>
                                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                                    <option value="Lịch sử">Lịch sử</option>
                                                    <option value="Địa lý">Địa lý</option>
                                                    <option value="Tin học">Tin học</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div className="form-group-field">
                                                <label htmlFor="ai-diff">Độ khó mong muốn</label>
                                                <select 
                                                    id="ai-diff"
                                                    className="studio-select" 
                                                    value={aiInputData.difficulty} 
                                                    onChange={(e) => setAiInputData({...aiInputData, difficulty: e.target.value})}
                                                >
                                                    <option value="mixed">Đa dạng (Hỗn hợp)</option>
                                                    <option value="easy">Dễ (Nhận biết)</option>
                                                    <option value="medium">Trung bình (Vận dụng)</option>
                                                    <option value="hard">Khó (Phân tích)</option>
                                                </select>
                                            </div>

                                            {mySets.length > 0 ? (
                                                <div className="form-group-field">
                                                    <label htmlFor="ai-set">Gán vào bộ đề</label>
                                                    <select 
                                                        id="ai-set"
                                                        className="studio-select" 
                                                        value={aiInputData.setId} 
                                                        onChange={(e) => setAiInputData({...aiInputData, setId: e.target.value})}
                                                    >
                                                        <option value="">Lưu ngân hàng chung</option>
                                                        {mySets.map(set => (
                                                            <option key={set._id} value={set._id}>📦 {set.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : <div />}
                                        </div>

                                        <button 
                                            type="submit" 
                                            className={`btn-ai-submit-generate ${isGeneratingBatch ? 'loading' : ''}`}
                                            disabled={isGeneratingBatch || !aiInputData.context.trim()}
                                        >
                                            {isGeneratingBatch ? (
                                                <>
                                                    <Loader2 size={18} className="spin-animation" />
                                                    <span>AI đang đọc dữ liệu & tạo {aiInputData.numQuestions} câu hỏi...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 size={18} />
                                                    <span>Tạo {aiInputData.numQuestions} Câu Hỏi Bằng AI Qwen 2.5</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    ) : (
                                    <form onSubmit={handleGenerateQuestionsFromImage} className="studio-form-stack" onPaste={handlePasteImage}>
                                        <div className="form-group-field">
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ImageIcon size={14} color="var(--accent-purple)" />
                                                <span>Hình ảnh đầu vào (Bài tập, sơ đồ, đồ thị...)</span>
                                                <span style={{ color: 'var(--error-red)' }}>*</span>
                                            </label>

                                            {!aiImagePreview ? (
                                                <div 
                                                    className="image-upload-dropzone"
                                                    onClick={() => document.getElementById('ai-image-file-input').click()}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                            handleImageSelect(e.dataTransfer.files[0]);
                                                        }
                                                    }}
                                                >
                                                    <input 
                                                        id="ai-image-file-input"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleImageSelect(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <div className="dropzone-inner-content">
                                                        <div className="dropzone-icon-circle">
                                                            <UploadCloud size={24} />
                                                        </div>
                                                        <div className="dropzone-text-group">
                                                            <p className="dropzone-main-text">
                                                                <strong>Kéo thả ảnh vào đây</strong> hoặc <span>click để chọn ảnh</span>
                                                            </p>
                                                            <p className="dropzone-sub-text">
                                                                PNG, JPG, WEBP • Hỗ trợ <strong>Ctrl + V</strong> dán ảnh chụp màn hình trực tiếp
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="image-preview-card">
                                                    <div className="image-preview-thumb-wrapper">
                                                        <img src={aiImagePreview} alt="Xem trước" className="image-preview-thumb" />
                                                    </div>
                                                    <div className="image-preview-info">
                                                        <span className="image-preview-filename">{aiImageName || 'Hình ảnh đã chọn'}</span>
                                                        <button 
                                                            type="button" 
                                                            className="btn-remove-image"
                                                            onClick={handleRemoveImage}
                                                            title="Đổi ảnh khác"
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Đổi ảnh khác</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-group-field">
                                            <label htmlFor="ai-img-prompt" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Lightbulb size={14} color="var(--accent-gold)" />
                                                <span>Ghi chú / Định hướng cho AI (Tùy chọn)</span>
                                            </label>
                                            <input 
                                                id="ai-img-prompt"
                                                className="studio-input"
                                                placeholder="Ví dụ: Tập trung vào câu hỏi tính chu kỳ dao động, hoặc công thức mạch..."
                                                value={aiImagePrompt}
                                                onChange={(e) => setAiImagePrompt(e.target.value)}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div className="form-group-field">
                                                <label htmlFor="ai-img-num">Số câu hỏi muốn tạo</label>
                                                <input 
                                                    id="ai-img-num"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    className="studio-input"
                                                    value={aiInputData.numQuestions}
                                                    onChange={(e) => setAiInputData({...aiInputData, numQuestions: parseInt(e.target.value, 10) || 1})}
                                                />
                                            </div>

                                            <div className="form-group-field">
                                                <label htmlFor="ai-img-topic">Chủ đề môn học</label>
                                                <select 
                                                    id="ai-img-topic"
                                                    className="studio-select" 
                                                    value={aiInputData.topic} 
                                                    onChange={(e) => setAiInputData({...aiInputData, topic: e.target.value})}
                                                >
                                                    <option value="Vật lý">Vật lý</option>
                                                    <option value="Toán">Toán học</option>
                                                    <option value="Hoá học">Hoá học</option>
                                                    <option value="Sinh học">Sinh học</option>
                                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                                    <option value="Lịch sử">Lịch sử</option>
                                                    <option value="Địa lý">Địa lý</option>
                                                    <option value="Tin học">Tin học</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div className="form-group-field">
                                                <label htmlFor="ai-img-diff">Độ khó mong muốn</label>
                                                <select 
                                                    id="ai-img-diff"
                                                    className="studio-select" 
                                                    value={aiInputData.difficulty} 
                                                    onChange={(e) => setAiInputData({...aiInputData, difficulty: e.target.value})}
                                                >
                                                    <option value="mixed">Đa dạng (Hỗn hợp)</option>
                                                    <option value="easy">Dễ (Nhận biết)</option>
                                                    <option value="medium">Trung bình (Vận dụng)</option>
                                                    <option value="hard">Khó (Phân tích)</option>
                                                </select>
                                            </div>

                                            {mySets.length > 0 ? (
                                                <div className="form-group-field">
                                                    <label htmlFor="ai-img-set">Gán vào bộ đề</label>
                                                    <select 
                                                        id="ai-img-set"
                                                        className="studio-select" 
                                                        value={aiInputData.setId} 
                                                        onChange={(e) => setAiInputData({...aiInputData, setId: e.target.value})}
                                                    >
                                                        <option value="">Lưu ngân hàng chung</option>
                                                        {mySets.map(set => (
                                                            <option key={set._id} value={set._id}>📦 {set.title}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : <div />}
                                        </div>

                                        <button 
                                            type="submit" 
                                            className={`btn-ai-submit-generate ${isGeneratingImageBatch ? 'loading' : ''}`}
                                            disabled={isGeneratingImageBatch || !aiImagePreview}
                                        >
                                            {isGeneratingImageBatch ? (
                                                <>
                                                    <Loader2 size={18} className="spin-animation" />
                                                    <span>Qwen2-VL đang xem ảnh & tạo {aiInputData.numQuestions} câu hỏi...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 size={18} />
                                                    <span>Tạo {aiInputData.numQuestions} Câu Hỏi Bằng Qwen2-VL</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    )}
                                    
                                    {/* DANH SÁCH CÂU HỎI VỪA TẠO RA BẰNG AI */}
                                    {generatedQuestions.length > 0 && (
                                        <div className="ai-results-container">
                                            <div className="ai-results-header">
                                                <div className="ai-results-count">
                                                    <CheckCircle2 size={17} color="var(--accent-emerald)" />
                                                    <span>AI đã tạo <strong>{generatedQuestions.length} câu hỏi</strong>:</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-save-all-batch"
                                                        onClick={handleSaveAllGeneratedQuestions}
                                                        disabled={isSavingBatch}
                                                        title="Lưu toàn bộ các câu hỏi trên vào cơ sở dữ liệu"
                                                    >
                                                        {isSavingBatch ? (
                                                            <>
                                                                <Loader2 size={13} className="spin-animation" />
                                                                <span>Đang lưu...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <BookmarkCheck size={14} />
                                                                <span>Lưu tất cả ({generatedQuestions.length}) câu</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-clear-batch"
                                                        onClick={handleClearGeneratedQuestions}
                                                        title="Xóa danh sách tạm này"
                                                    >
                                                        <RotateCcw size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="ai-questions-list">
                                                {generatedQuestions.map((q, idx) => (
                                                    <div key={idx} className="ai-generated-card">
                                                        <div className="ai-card-title-row">
                                                            <strong>Câu {idx + 1}: {q.questionText}</strong>
                                                            <span className="pill-difficulty-medium">• {q.difficulty}</span>
                                                        </div>

                                                        <div className="ai-card-options-grid">
                                                            {q.options.map((opt, i) => {
                                                                const label = ['A', 'B', 'C', 'D'][i];
                                                                const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
                                                                return (
                                                                    <div key={i} className={`ai-option-item ${isCorrect ? 'is-correct' : ''}`}>
                                                                        <span><strong>{label}.</strong> {opt}</span>
                                                                        {isCorrect && <CheckCircle2 size={14} />}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        {q.explanation && (
                                                            <div className="item-explanation-preview" style={{ marginTop: '8px' }}>
                                                                <div className="explanation-preview-title">
                                                                    <Lightbulb size={13} />
                                                                    <span>Giải thích:</span>
                                                                </div>
                                                                <p className="explanation-preview-content">{q.explanation}</p>
                                                            </div>
                                                        )}

                                                        <div className="ai-card-actions-bar">
                                                            <button
                                                                type="button"
                                                                className="btn-ai-card-action btn-fill-form"
                                                                onClick={() => handleLoadIntoForm(q)}
                                                                title="Đổ câu hỏi này vào component form để chỉnh sửa chi tiết"
                                                            >
                                                                <PencilLine size={13} />
                                                                <span>Nạp vào form chỉnh sửa</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn-ai-card-action btn-save-one"
                                                                onClick={() => handleSaveSingleGeneratedQuestion(q)}
                                                                title="Lưu câu hỏi này ngay vào cơ sở dữ liệu"
                                                            >
                                                                <Plus size={13} />
                                                                <span>Lưu câu này</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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

                                            {/* Box giải thích đáp án */}
                                            {q.explanation && (
                                                <div className="item-explanation-preview">
                                                    <div className="explanation-preview-title">
                                                        <Lightbulb size={14} />
                                                        <span>Giải thích đáp án:</span>
                                                    </div>
                                                    <p className="explanation-preview-content">{q.explanation}</p>
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
