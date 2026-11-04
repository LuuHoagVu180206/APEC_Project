import React from 'react';
import { QuestionSetPageLogic } from '../pages_logic/QuestionSetPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/QuestionSetStyling.css';
import { getAuthorInfo } from '../utils/authorUtils';
import { 
    Sparkles, 
    ArrowLeft, 
    BookOpen, 
    Gamepad2, 
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
        handleExport
    } = QuestionSetPageLogic();

    const getTopicBadgeClass = (topic) => {
        if (!topic) return 'badge-other';
        const t = topic.toLowerCase();
        if (t.includes('toán')) return 'badge-math';
        if (t.includes('tiếng anh') || t.includes('anh')) return 'badge-english';
        if (t.includes('lịch sử') || t.includes('sử')) return 'badge-history';
        if (t.includes('hoá') || t.includes('vật lý') || t.includes('sinh')) return 'badge-science';
        if (t.includes('việt') || t.includes('văn')) return 'badge-literature';
        return 'badge-other';
    };

    if (isLoading || !setData) {
        return (
            <div className="qset-page-wrapper">
                <Navbar activePage="library" />
                <div className="qset-loading-box">
                    <div className="loading-icon-wrap">
                        <Layers size={32} />
                    </div>
                    <h3>Đang tải dữ liệu bộ câu hỏi...</h3>
                </div>
            </div>
        );
    }

    const authorInfo = getAuthorInfo(setData, currentUser);
    const topicClass = getTopicBadgeClass(setData.topic);

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
            {/* 1. NAVBAR DÙNG CHUNG ĐỒNG BỘ TOÀN HỆ THỐNG */}
            <Navbar activePage="library" />

            {/* 2. NỘI DUNG CHI TIẾT BỘ ĐỀ */}
            <main className="qset-main-container">
                <div className="section-container">
                    {/* Hàng điều hướng trên cùng (Quay lại Thư Viện, Studio & Xuất Excel/PDF) */}
                    <div className="qset-top-nav-row">
                        <div className="qset-back-buttons-wrap">
                            <button 
                                onClick={() => navigate('/library')} 
                                className="btn-qset-nav-back"
                                title="Quay lại Thư viện câu hỏi"
                            >
                                <ArrowLeft size={16} />
                                <span>Thư Viện</span>
                            </button>
                            <button 
                                onClick={() => navigate('/studio')} 
                                className="btn-qset-nav-back btn-qset-studio"
                                title="Quay lại Studio Sáng Tạo của bạn"
                            >
                                <Layers size={16} />
                                <span>Góc Sáng Tạo</span>
                            </button>
                        </div>

                        <div className="qset-export-group">
                            <button 
                                className="btn-qset-export" 
                                onClick={() => handleExport('excel')}
                                title="Tải về file bảng tính Excel"
                            >
                                <FileSpreadsheet size={15} />
                                <span>Xuất Excel</span>
                            </button>
                            <button 
                                className="btn-qset-export" 
                                onClick={() => handleExport('pdf')}
                                title="Tải về file tài liệu PDF"
                            >
                                <FileText size={15} />
                                <span>Xuất PDF</span>
                            </button>
                        </div>
                    </div>

                    {/* Banner Thông Tin Bộ Đề Phong Cách Positivus */}
                    <div className="qset-hero-card">
                        <div className="qset-badge-row">
                            <span className={`qset-topic-tag ${topicClass}`}>
                                {setData.topic || 'Khác'}
                            </span>
                            <span className="qset-count-pill">
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

                        {/* Tác giả biên soạn */}
                        <div className="qset-author-info-row">
                            <div className={`qset-avatar ${authorInfo.isOfficial ? 'official' : ''} ${authorInfo.isAnonymous ? 'anon' : ''}`}>
                                {authorInfo.avatarImg ? (
                                    <img src={authorInfo.avatarImg} alt={authorInfo.name} className="qset-avatar-img" />
                                ) : (
                                    authorInfo.avatarChar
                                )}
                            </div>
                            <div className="qset-author-text">
                                <span className="qset-author-label">Biên soạn bởi:</span>
                                <strong className={`qset-author-name ${authorInfo.isAnonymous ? 'anon-name' : ''}`}>
                                    {authorInfo.name}
                                </strong>
                            </div>
                        </div>

                        {/* Thanh công cụ thao tác dành cho Chủ sở hữu hoặc Khách */}
                        <div className="qset-actions-toolbar">
                            {isOwner ? (
                                <div className="owner-toolbar-group">
                                    <div className="owner-badge-indicator">
                                        <Sparkles size={15} />
                                        <span>Bạn là chủ sở hữu bộ câu hỏi này</span>
                                    </div>
                                    <div className="owner-buttons-wrap">
                                        <button 
                                            type="button" 
                                            className="btn-owner-action btn-edit-set-info"
                                            onClick={handleOpenEditModal}
                                            title="Chỉnh sửa tên, mô tả, chủ đề và trạng thái công khai"
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
                                        title="Sao chép toàn bộ câu hỏi trong bộ này về Studio của bạn"
                                    >
                                        <Copy size={15} />
                                        <span>{isCopying ? "Đang sao chép..." : "Sao chép bộ đề (-copy)"}</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        className={`btn-visitor-action btn-bookmark-set ${isSaved ? 'saved' : ''}`}
                                        onClick={handleToggleSave}
                                        title={isSaved ? "Đã lưu vào bộ sưu tập cá nhân" : "Lưu bộ câu hỏi vào bộ sưu tập"}
                                    >
                                        <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                                        <span>{isSaved ? "Đã lưu bộ đề" : "Lưu bộ đề"}</span>
                                    </button>
                                </div>
                            )}

                            {/* Nút Chơi game luyện tập ngay */}
                            <button 
                                className="btn-qset-play-now"
                                onClick={() => navigate(`/game?setId=${setData._id}`)}
                                title="Luyện tập ngay bộ đề này trong game"
                            >
                                <Gamepad2 size={19} />
                                <span>Luyện tập ngay</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. DANH SÁCH TỪNG CÂU HỎI TRONG BỘ */}
                    <div className="qset-questions-section">
                        <div className="qset-questions-header">
                            <div className="qset-section-title-wrap">
                                <BookOpen size={20} />
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
                                <Layers size={40} />
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
                                        ? 'diff-hard' 
                                        : q.difficulty === 'medium' 
                                            ? 'diff-medium' 
                                            : 'diff-easy';
                                    
                                    const diffText = q.difficulty === 'hard' 
                                        ? 'Khó' 
                                        : q.difficulty === 'medium' 
                                            ? 'Trung bình' 
                                            : 'Dễ';

                                    const qTopicClass = getTopicBadgeClass(q.topic);

                                    return (
                                        <div key={q._id || index} className="qset-question-item-card">
                                            <div className="qset-q-card-top">
                                                <div className="qset-q-left-meta">
                                                    <span className="qset-q-number">Câu {index + 1}</span>
                                                    <span className={`qset-q-diff-badge ${diffClass}`}>
                                                        • {diffText}
                                                    </span>
                                                    {q.topic && (
                                                        <span className={`qset-topic-tag ${qTopicClass}`}>
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
                </div>
            </main>

            {/* MODAL 1: CHỈNH SỬA THÔNG TIN BỘ CÂU HỎI */}
            {isEditModalOpen && (
                <div className="qset-modal-backdrop" onClick={handleCloseEditModal}>
                    <div className="qset-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="qset-modal-header">
                            <div className="modal-title-wrap">
                                <Pencil size={19} />
                                <h3>Chỉnh Sửa Thông Tin Bộ Câu Hỏi</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseEditModal}>
                                <X size={20} />
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
                                            className={`btn-author-mode ${editFormData.isAnonymous ? 'active' : ''}`}
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

            {/* MODAL 2: THÊM CÂU HỎI VÀO BỘ ĐỀ */}
            {isAddQuestionModalOpen && (
                <div className="qset-modal-backdrop" onClick={handleCloseAddQuestionModal}>
                    <div className="qset-modal-dialog qset-modal-dialog-large" onClick={(e) => e.stopPropagation()}>
                        <div className="qset-modal-header">
                            <div className="modal-title-wrap">
                                <Plus size={19} />
                                <h3>Thêm Câu Hỏi Vào Bộ Đề</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseAddQuestionModal}>
                                <X size={20} />
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
                                <span>Chọn từ ngân hàng ({existingQuestionsNotInSet.length})</span>
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
                                        placeholder="Nhập đề bài câu hỏi trắc nghiệm..."
                                        value={newQuestionData.questionText}
                                        onChange={(e) => setNewQuestionData({ ...newQuestionData, questionText: e.target.value })}
                                        style={{ minHeight: '80px' }}
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
                                        {isAddingQuestion ? "Đang thêm..." : "Tạo & Thêm vào bộ"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* CHẾ ĐỘ 2: CHỌN TỪ CÂU HỎI CÓ SẴN TRONG NGÂN HÀNG */
                            <div className="qset-existing-questions-panel">
                                <div className="existing-q-toolbar">
                                    <div className="existing-search-box">
                                        <Search size={16} />
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
                                                <X size={14} />
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
                                            <Layers size={24} />
                                            <span>Đang tải danh sách câu hỏi của bạn...</span>
                                        </div>
                                    ) : filteredExistingQuestions.length === 0 ? (
                                        <div className="existing-q-empty">
                                            <BookOpen size={30} />
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
                                                            <CheckSquare size={19} color="#0284c7" />
                                                        ) : (
                                                            <Square size={19} color="#191a23" />
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
                                            : `Thêm ${selectedExistingIds.length} câu hỏi vào bộ`}
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
