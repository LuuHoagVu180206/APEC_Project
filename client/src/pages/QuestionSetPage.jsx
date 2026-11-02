import React from 'react';
import { Link } from 'react-router-dom';
import { QuestionSetPageLogic } from '../pages_logic/QuestionSetPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/QuestionSetStyling.css';
import { getAuthorInfo } from '../utils/authorUtils';
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
    FileText,
    Pencil,
    Plus,
    Trash2,
    Copy,
    Bookmark,
    Globe,
    Lock,
    Eye,
    UserX,
    X,
    Search,
    CheckSquare,
    Square
} from 'lucide-react';

const QuestionSetPage = () => {
    const {
        navigate,
        currentUser,
        setData,
        questions,
        isLoading,
        isOwner,
        isSaved,
        schoolActionLabel,
        isEditModalOpen,
        isAddQuestionModalOpen,
        isSavingEdit,
        isAddingQuestion,
        isCopying,
        editFormData,
        setEditFormData,
        newQuestionData,
        setNewQuestionData,
        addQuestionMode,
        setAddQuestionMode,
        myExistingQuestions,
        isFetchingExistingQuestions,
        selectedExistingIds,
        existingSearchKeyword,
        setExistingSearchKeyword,
        handleOpenEditModal,
        handleCloseEditModal,
        handleSaveEditSet,
        handleOpenAddQuestionModal,
        handleCloseAddQuestionModal,
        handleCreateQuestion,
        handleToggleSelectExistingQuestion,
        handleAddExistingQuestionsToSet,
        handleDeleteQuestion,
        handleCopySet,
        handleToggleSave,
        handleExport,
        handleLogout
    } = QuestionSetPageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    if (isLoading || !setData) {
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

    const authorInfo = getAuthorInfo(setData, currentUser);

    // Lọc danh sách câu hỏi có sẵn chưa nằm trong bộ đề hiện tại
    const existingQuestionsNotInSet = (myExistingQuestions || []).filter(
        myQ => !questions.some(currentQ => currentQ._id === myQ._id)
    );

    const filteredExistingQuestions = existingQuestionsNotInSet.filter(q => {
        if (!existingSearchKeyword) return true;
        const kw = existingSearchKeyword.toLowerCase();
        return (q.questionText || '').toLowerCase().includes(kw) || (q.topic || '').toLowerCase().includes(kw);
    });

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

                        {currentUser ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">
                                        {currentUser.avatar ? (
                                            <img src={currentUser.avatar} alt="Avatar" className="user-avatar-img-nav" />
                                        ) : (
                                            currentUser.username.charAt(0).toUpperCase()
                                        )}
                                    </span>
                                    <span>{currentUser.displayName || currentUser.username}</span>
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
                {/* Hàng điều hướng trên cùng (Có cả Về Thư Viện & Về Studio) */}
                <div className="qset-top-nav-row">
                    <div className="qset-back-buttons-wrap">
                        <button 
                            onClick={() => navigate('/library')} 
                            className="btn-qset-back"
                            title="Quay lại Thư viện chia sẻ câu hỏi"
                        >
                            <ArrowLeft size={16} />
                            <span>Về Thư Viện</span>
                        </button>
                        <button 
                            onClick={() => navigate('/studio')} 
                            className="btn-qset-back btn-qset-studio"
                            title="Quay lại Studio Sáng Tạo của bạn"
                        >
                            <Layers size={16} />
                            <span>Về Studio</span>
                        </button>
                    </div>

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

                        <span className={setData.isPublic ? "qset-pill-privacy public" : "qset-pill-privacy private"}>
                            {setData.isPublic ? (
                                <>
                                    <Globe size={12} />
                                    <span>Công khai</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={12} />
                                    <span>Riêng tư</span>
                                </>
                            )}
                        </span>

                        {setData.isPublic && (
                            <span className={`qset-pill-anon ${setData.isAnonymous ? 'anon' : 'named'}`}>
                                {setData.isAnonymous ? (
                                    <>
                                        <UserX size={12} />
                                        <span>Đăng Ẩn danh</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye size={12} />
                                        <span>Hiện tên tác giả</span>
                                    </>
                                )}
                            </span>
                        )}
                    </div>

                    <h1 className="qset-title">
                        {setData.title}
                    </h1>

                    <p className="qset-description">
                        {setData.description || "Bộ câu hỏi chất lượng cao phục vụ rèn luyện, nâng cao kỹ năng và củng cố kiến thức."}
                    </p>

                    {/* KHU VỰC THAO TÁC DÀNH CHO CHỦ SỞ HỮU HOẶC KHÁCH */}
                    <div className="qset-actions-toolbar">
                        {isOwner ? (
                            <div className="owner-toolbar-group">
                                <div className="owner-badge-indicator">
                                    <Sparkles size={14} />
                                    <span>Bạn là chủ sở hữu bộ câu hỏi này</span>
                                </div>
                                <div className="owner-buttons-wrap">
                                    <button 
                                        type="button" 
                                        className="btn-owner-action btn-edit-set-info"
                                        onClick={handleOpenEditModal}
                                        title="Chỉnh sửa tên, mô tả, chủ đề và trạng thái công khai của bộ đề"
                                    >
                                        <Pencil size={15} />
                                        <span>Chỉnh sửa thông tin</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-owner-action btn-add-new-q"
                                        onClick={handleOpenAddQuestionModal}
                                        title="Thêm câu hỏi mới hoặc chọn từ ngân hàng câu hỏi có sẵn"
                                    >
                                        <Plus size={16} />
                                        <span>Thêm câu hỏi vào bộ</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="visitor-toolbar-group">
                                <button 
                                    type="button" 
                                    className="btn-visitor-action btn-copy-set"
                                    onClick={handleCopySet}
                                    disabled={isCopying}
                                    title="Sao chép toàn bộ câu hỏi trong bộ này về Studio của bạn (kèm hậu tố -copy)"
                                >
                                    <Copy size={15} />
                                    <span>{isCopying ? "Đang sao chép..." : "Sao chép bộ đề (-copy)"}</span>
                                </button>
                                <button 
                                    type="button" 
                                    className={`btn-visitor-action btn-bookmark-set ${isSaved ? 'saved' : ''}`}
                                    onClick={handleToggleSave}
                                    title={isSaved ? "Đã lưu vào bộ sưu tập cá nhân" : "Lưu bộ câu hỏi vào bộ sưu tập cá nhân"}
                                >
                                    <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                                    <span>{isSaved ? "Đã lưu bộ đề" : "Lưu bộ câu hỏi"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="qset-author-info-row">
                        <div className={`qset-avatar ${authorInfo.isOfficial ? 'official' : ''} ${authorInfo.isAnonymous ? 'anon' : ''}`}>
                            {authorInfo.avatarImg ? (
                                <img src={authorInfo.avatarImg} alt={authorInfo.name} className="qset-avatar-img" />
                            ) : (
                                authorInfo.avatarChar
                            )}
                        </div>
                        <div className="qset-author-text">
                            <span className="qset-author-label">Tác giả biên soạn:</span>
                            <span className={`qset-author-name ${authorInfo.isAnonymous ? 'anon-name' : ''}`}>
                                {authorInfo.name}
                            </span>
                        </div>
                    </div>

                    <div className="qset-hero-cta">
                        <button 
                            className="btn-qset-play-now"
                            onClick={() => navigate(`/game?setId=${setData._id}`)}
                        >
                            <Gamepad2 size={20} />
                            <span>Bắt đầu Luyện tập với Bộ đề này</span>
                        </button>
                    </div>
                </div>

                {/* 3. DANH SÁCH TỪNG CÂU HỎI TRONG BỘ */}
                <div className="qset-questions-section">
                    <div className="qset-questions-header">
                        <div className="qset-section-title-wrap">
                            <BookOpen size={20} color="var(--accent-blue)" />
                            <h2>Danh Sách Câu Hỏi Trắc Nghiệm ({questions.length})</h2>
                        </div>
                        {isOwner && (
                            <button 
                                type="button" 
                                className="btn-add-q-inline" 
                                onClick={handleOpenAddQuestionModal}
                                title="Thêm câu hỏi mới vào bộ đề này"
                            >
                                <Plus size={15} />
                                <span>Thêm câu hỏi</span>
                            </button>
                        )}
                    </div>

                    {questions.length === 0 ? (
                        <div className="qset-empty-card">
                            <Layers size={36} color="var(--text-muted)" />
                            <h3>Bộ câu hỏi này chưa có câu hỏi nào</h3>
                            <p>
                                {isOwner 
                                    ? "Hãy bấm nút 'Thêm câu hỏi vào bộ' ở trên để bắt đầu thêm câu hỏi vào bộ đề này!" 
                                    : "Bộ câu hỏi này đang trong quá trình biên soạn nội dung."}
                            </p>
                            {isOwner && (
                                <button type="button" className="btn-empty-add-q" onClick={handleOpenAddQuestionModal}>
                                    <Plus size={16} />
                                    <span>Thêm câu hỏi ngay</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="qset-cards-list">
                            {questions.map((q, index) => {
                                const diffClass = q.difficulty === 'hard' 
                                    ? 'hard' 
                                    : q.difficulty === 'medium' 
                                        ? 'medium' 
                                        : 'easy';
                                
                                const diffText = q.difficulty === 'hard' 
                                    ? 'Khó' 
                                    : q.difficulty === 'medium' 
                                        ? 'Trung bình' 
                                        : 'Dễ';

                                return (
                                    <div key={q._id || index} className="qset-question-item-card">
                                        <div className="qset-q-card-top">
                                            <div className="qset-q-left-meta">
                                                <span className="qset-q-number">Câu {index + 1}</span>
                                                <span className={`qset-q-diff-badge ${diffClass}`}>
                                                    {diffText}
                                                </span>
                                                {q.topic && (
                                                    <span className="qset-q-topic-tag">
                                                        {q.topic}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nút Xóa câu hỏi dành cho chủ sở hữu */}
                                            {isOwner && (
                                                <button 
                                                    type="button" 
                                                    className="btn-qset-delete-q" 
                                                    onClick={() => handleDeleteQuestion(q._id)}
                                                    title="Xóa câu hỏi này khỏi bộ đề"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Xóa</span>
                                                </button>
                                            )}
                                        </div>

                                        <h3 className="qset-q-text">
                                            {q.questionText}
                                        </h3>

                                        <div className="qset-options-grid">
                                            {q.options && q.options.map((opt, optIdx) => {
                                                const label = ['A', 'B', 'C', 'D'][optIdx];
                                                const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
                                                return (
                                                    <div 
                                                        key={optIdx} 
                                                        className={`qset-option-item ${isCorrect ? 'correct-option' : ''}`}
                                                    >
                                                        <span className="option-badge-key">{label}</span>
                                                        <span className="option-text-val">{opt}</span>
                                                        {isCorrect && (
                                                            <span className="correct-check-icon">
                                                                <CheckCircle2 size={16} />
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL 1: CHỈNH SỬA THÔNG TIN BỘ CÂU HỎI (DÀNH CHO CHỦ SỞ HỮU) */}
            {isEditModalOpen && (
                <div className="qset-modal-backdrop" onClick={handleCloseEditModal}>
                    <div className="qset-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="qset-modal-header">
                            <div className="modal-title-wrap">
                                <Pencil size={18} color="var(--accent-gold)" />
                                <h3>Chỉnh Sửa Thông Tin Bộ Câu Hỏi</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseEditModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditSet} className="qset-modal-form">
                            <div className="form-group-field">
                                <label htmlFor="edit-set-title">Tên bộ đề</label>
                                <input 
                                    id="edit-set-title"
                                    className="studio-input"
                                    required
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group-field">
                                <label htmlFor="edit-set-desc">Mô tả bộ đề</label>
                                <textarea 
                                    id="edit-set-desc"
                                    className="studio-textarea"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group-field">
                                <label htmlFor="edit-set-topic">Chủ đề môn học</label>
                                <select 
                                    id="edit-set-topic"
                                    className="studio-select"
                                    value={editFormData.topic}
                                    onChange={(e) => setEditFormData({ ...editFormData, topic: e.target.value })}
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

                            <label className="checkbox-control-wrap">
                                <input 
                                    type="checkbox"
                                    checked={editFormData.isPublic}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        isPublic: e.target.checked,
                                        isAnonymous: e.target.checked ? editFormData.isAnonymous : false
                                    })}
                                />
                                <span>Công khai lên Thư viện cộng đồng</span>
                            </label>

                            {editFormData.isPublic && (
                                <div className="studio-author-visibility-box">
                                    <label className="studio-sublabel">Chế độ hiển thị tác giả trên Thư viện:</label>
                                    <div className="author-toggle-btn-group">
                                        <button
                                            type="button"
                                            className={`btn-author-mode ${!editFormData.isAnonymous ? 'active' : ''}`}
                                            onClick={() => setEditFormData({ ...editFormData, isAnonymous: false })}
                                        >
                                            <Eye size={14} />
                                            <span>Hiện tên tác giả</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-author-mode mode-anon-btn ${editFormData.isAnonymous ? 'active' : ''}`}
                                            onClick={() => setEditFormData({ ...editFormData, isAnonymous: true })}
                                        >
                                            <UserX size={14} />
                                            <span>Đăng Ẩn danh</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="qset-modal-actions">
                                <button type="button" className="btn-modal-cancel" onClick={handleCloseEditModal}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn-modal-submit" disabled={isSavingEdit}>
                                    {isSavingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: THÊM CÂU HỎI VÀO BỘ ĐỀ (CÓ CẢ TẠO MỚI HOẶC CHỌN TỪ CÂU HỎI CÓ SẴN) */}
            {isAddQuestionModalOpen && (
                <div className="qset-modal-backdrop" onClick={handleCloseAddQuestionModal}>
                    <div className="qset-modal-dialog qset-modal-dialog-large" onClick={(e) => e.stopPropagation()}>
                        <div className="qset-modal-header">
                            <div className="modal-title-wrap">
                                <Plus size={18} color="var(--accent-blue)" />
                                <h3>Thêm Câu Hỏi Vào Bộ Đề</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseAddQuestionModal}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* TAB CHUYỂN ĐỔI CHẾ ĐỘ THÊM CÂU HỎI */}
                        <div className="qset-modal-mode-tabs">
                            <button 
                                type="button" 
                                className={`qset-mode-tab-btn ${addQuestionMode === 'new' ? 'active' : ''}`}
                                onClick={() => setAddQuestionMode('new')}
                            >
                                <Pencil size={15} />
                                <span>Tạo câu hỏi mới</span>
                            </button>
                            <button 
                                type="button" 
                                className={`qset-mode-tab-btn ${addQuestionMode === 'existing' ? 'active' : ''}`}
                                onClick={() => setAddQuestionMode('existing')}
                            >
                                <Layers size={15} />
                                <span>Chọn từ câu hỏi của tôi ({existingQuestionsNotInSet.length})</span>
                            </button>
                        </div>

                        {/* CHẾ ĐỘ 1: TẠO CÂU HỎI MỚI */}
                        {addQuestionMode === 'new' ? (
                            <form onSubmit={handleCreateQuestion} className="qset-modal-form">
                                <div className="form-group-field">
                                    <label htmlFor="new-q-text">Nội dung câu hỏi</label>
                                    <textarea
                                        id="new-q-text"
                                        className="studio-textarea"
                                        required
                                        placeholder="Nhập câu hỏi trắc nghiệm..."
                                        value={newQuestionData.questionText}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, questionText: e.target.value })}
                                    />
                                </div>

                                <div className="modal-options-grid">
                                    <div className="form-group-field">
                                        <label>Đáp án A</label>
                                        <input
                                            className="studio-input"
                                            required
                                            placeholder="Phương án A"
                                            value={newQuestionData.optionA}
                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, optionA: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-field">
                                        <label>Đáp án B</label>
                                        <input
                                            className="studio-input"
                                            required
                                            placeholder="Phương án B"
                                            value={newQuestionData.optionB}
                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, optionB: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-field">
                                        <label>Đáp án C</label>
                                        <input
                                            className="studio-input"
                                            required
                                            placeholder="Phương án C"
                                            value={newQuestionData.optionC}
                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, optionC: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-field">
                                        <label>Đáp án D</label>
                                        <input
                                            className="studio-input"
                                            required
                                            placeholder="Phương án D"
                                            value={newQuestionData.optionD}
                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, optionD: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="modal-row-two-col">
                                    <div className="form-group-field">
                                        <label>Đáp án đúng</label>
                                        <select
                                            className="studio-select"
                                            value={newQuestionData.correctAnswer}
                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value })}
                                        >
                                            <option value="A">Đáp án A</option>
                                            <option value="B">Đáp án B</option>
                                            <option value="C">Đáp án C</option>
                                            <option value="D">Đáp án D</option>
                                        </select>
                                    </div>

                                    <div className="form-group-field">
                                        <label>Độ khó</label>
                                        <select
                                            className="studio-select"
                                            value={newQuestionData.difficulty}
                                            onChange={(e) => setNewQuestionData({ ...newQuestionData, difficulty: e.target.value })}
                                        >
                                            <option value="easy">Dễ</option>
                                            <option value="medium">Trung bình</option>
                                            <option value="hard">Khó</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="qset-modal-actions">
                                    <button type="button" className="btn-modal-cancel" onClick={handleCloseAddQuestionModal}>
                                        Hủy bỏ
                                    </button>
                                    <button type="submit" className="btn-modal-submit" disabled={isAddingQuestion}>
                                        {isAddingQuestion ? "Đang thêm..." : "Tạo & Thêm vào bộ đề"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* CHẾ ĐỘ 2: CHỌN TỪ CÂU HỎI CÓ SẴN TRONG NGÂN HÀNG CỦA TÔI */
                            <div className="qset-existing-questions-panel">
                                <div className="existing-q-toolbar">
                                    <div className="existing-search-box">
                                        <Search size={15} />
                                        <input 
                                            type="text" 
                                            placeholder="Tìm kiếm câu hỏi theo đề bài hoặc môn học..."
                                            value={existingSearchKeyword}
                                            onChange={(e) => setExistingSearchKeyword(e.target.value)}
                                        />
                                        {existingSearchKeyword && (
                                            <button 
                                                type="button" 
                                                className="btn-clear-q-search"
                                                onClick={() => setExistingSearchKeyword('')}
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="existing-select-stats">
                                        Đã chọn: <strong>{selectedExistingIds.length}</strong> câu hỏi
                                    </div>
                                </div>

                                <div className="existing-q-scroll-list">
                                    {isFetchingExistingQuestions ? (
                                        <div className="existing-q-loading">
                                            <Layers size={24} className="spin-icon" />
                                            <span>Đang tải danh sách câu hỏi của bạn...</span>
                                        </div>
                                    ) : filteredExistingQuestions.length === 0 ? (
                                        <div className="existing-q-empty">
                                            <BookOpen size={28} />
                                            <h4>Không tìm thấy câu hỏi khả dụng</h4>
                                            <p>
                                                {existingQuestionsNotInSet.length === 0
                                                    ? "Tất cả các câu hỏi trong ngân hàng của bạn đã được thêm vào bộ này, hoặc bạn chưa tạo câu hỏi nào trong Studio."
                                                    : "Không có câu hỏi nào khớp với từ khóa tìm kiếm của bạn."}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredExistingQuestions.map((q, idx) => {
                                            const isSelected = selectedExistingIds.includes(q._id);
                                            return (
                                                <div 
                                                    key={q._id || idx}
                                                    className={`existing-q-row-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleToggleSelectExistingQuestion(q._id)}
                                                >
                                                    <div className="existing-q-checkbox">
                                                        {isSelected ? (
                                                            <CheckSquare size={19} color="var(--accent-blue)" />
                                                        ) : (
                                                            <Square size={19} color="var(--border-strong)" />
                                                        )}
                                                    </div>

                                                    <div className="existing-q-info">
                                                        <div className="existing-q-meta-badges">
                                                            <span className="existing-badge-topic">🏷️ {q.topic || 'Khác'}</span>
                                                            <span className={`existing-badge-diff ${q.difficulty}`}>
                                                                • {q.difficulty === 'hard' ? 'Khó' : q.difficulty === 'medium' ? 'Trung bình' : 'Dễ'}
                                                            </span>
                                                        </div>
                                                        <h4 className="existing-q-title">{q.questionText}</h4>
                                                        <div className="existing-q-options-inline">
                                                            {q.options && q.options.map((opt, optIdx) => {
                                                                const label = ['A', 'B', 'C', 'D'][optIdx];
                                                                const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
                                                                return (
                                                                    <span key={optIdx} className={`existing-opt-pill ${isCorrect ? 'is-correct' : ''}`}>
                                                                        <strong>{label}.</strong> {opt} {isCorrect && '✓'}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="qset-modal-actions">
                                    <button type="button" className="btn-modal-cancel" onClick={handleCloseAddQuestionModal}>
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn-modal-submit" 
                                        disabled={isAddingQuestion || selectedExistingIds.length === 0}
                                        onClick={handleAddExistingQuestionsToSet}
                                    >
                                        {isAddingQuestion 
                                            ? "Đang thêm..." 
                                            : `Thêm ${selectedExistingIds.length} câu hỏi đã chọn vào bộ`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionSetPage;
