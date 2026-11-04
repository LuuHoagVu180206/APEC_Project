import React from 'react';
import { StudioPageLogic } from '../pages_logic/StudioPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/StudioPageStyling.css';
import { 
    Bookmark, 
    Layers, 
    FolderPlus,
    FileSpreadsheet, 
    FileText, 
    Trash2, 
    ExternalLink, 
    Plus, 
    Globe,
    Lock,
    Eye,
    UserX,
    Pencil,
    X,
    CheckCircle2,
    HelpCircle,
    ArrowUpRight,
    Wrench,
    Check
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
        activeTab,
        setActiveTab,
        isCreateSetModalOpen,
        isCreateQuestionModalOpen,
        isEditQuestionModalOpen,
        isAddToSetModalOpen,
        targetQuestionForSet,
        editingQuestionData,
        setEditingQuestionData,
        handleOpenCreateSetModal,
        handleCloseCreateSetModal,
        handleOpenCreateQuestionModal,
        handleCloseCreateQuestionModal,
        handleOpenEditQuestionModal,
        handleCloseEditQuestionModal,
        handleSaveEditQuestion,
        handleOpenAddToSetModal,
        handleCloseAddToSetModal,
        handleSelectSetForQuestion,
        handleCreateSet, 
        handleCreateQuestion, 
        handleDeleteSet,
        handleDeleteQuestion, 
        handleRemoveSavedSet, 
        handleExport,
        handleToggleAnonymous,
        handleTogglePrivacy
    } = StudioPageLogic();

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

    return (
        <div className="studio-wrapper">
            {/* 1. NAVBAR - ĐỒNG BỘ TOÀN HỆ THỐNG */}
            <Navbar activePage="studio" />

            {/* 2. HERO SECTION - WORKSHOP CONSOLE THEO PHONG CÁCH POSITIVUS */}
            <section className="studio-hero">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Góc Sáng Tạo</span>
                        <p className="positivus-section-desc">
                            Xưởng thiết kế đề thi cá nhân & ngân hàng câu đố trắc nghiệm của <strong>{currentUser?.displayName || currentUser?.username}</strong>.
                        </p>
                    </div>

                    {/* Quick Stats & Action Workbench */}
                    <div className="studio-workbench-panel">
                        <div className="workbench-stats-grid">
                            <div className="workbench-stat-card stat-cyan">
                                <div className="stat-card-header">
                                    <span className="stat-card-title">Bộ đề của bạn</span>
                                    <Layers size={20} />
                                </div>
                                <div className="stat-card-val">{mySets.length}</div>
                                <div className="stat-card-sub">Bộ câu hỏi đã biên soạn</div>
                            </div>

                            <div className="workbench-stat-card stat-white">
                                <div className="stat-card-header">
                                    <span className="stat-card-title">Kho câu hỏi lẻ</span>
                                    <HelpCircle size={20} />
                                </div>
                                <div className="stat-card-val">{questions.length}</div>
                                <div className="stat-card-sub">Câu hỏi trắc nghiệm tự tạo</div>
                            </div>

                            <div className="workbench-stat-card stat-white">
                                <div className="stat-card-header">
                                    <span className="stat-card-title">Bộ đề đã lưu</span>
                                    <Bookmark size={20} />
                                </div>
                                <div className="stat-card-val">{savedSetsData.length}</div>
                                <div className="stat-card-sub">Lưu từ Thư viện cộng đồng</div>
                            </div>
                        </div>

                        {/* Nút hành động nhanh */}
                        <div className="workbench-actions-bar">
                            <button 
                                type="button" 
                                className="btn-workbench-cta btn-cta-dark"
                                onClick={handleOpenCreateSetModal}
                                title="Mở bảng tạo bộ câu hỏi mới"
                            >
                                <FolderPlus size={18} />
                                <span>Tạo bộ đề mới</span>
                            </button>

                            <button 
                                type="button" 
                                className="btn-workbench-cta btn-cta-cyan"
                                onClick={handleOpenCreateQuestionModal}
                                title="Mở bảng tạo câu hỏi trắc nghiệm mới"
                            >
                                <Plus size={18} />
                                <span>Thêm câu hỏi lẻ</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. TABS PHÂN KHU SÁNG TẠO (SEGMENTED SWITCHER) */}
                    <div className="studio-tabs-bar">
                        <button
                            type="button"
                            className={`studio-tab-btn ${activeTab === 'sets' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sets')}
                        >
                            <Layers size={17} />
                            <span>Bộ câu hỏi của tôi</span>
                            <span className="tab-counter-badge">{mySets.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`studio-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('questions')}
                        >
                            <HelpCircle size={17} />
                            <span>Ngân hàng câu hỏi lẻ</span>
                            <span className="tab-counter-badge">{questions.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`studio-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                        >
                            <Bookmark size={17} />
                            <span>Bộ đề đã lưu</span>
                            <span className="tab-counter-badge">{savedSetsData.length}</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. KHU VỰC NỘI DUNG CHÍNH THEO TAB (POSITIVUS WORKSHOP STYLE) */}
            <main className="studio-main-content">
                <div className="section-container">
                    {/* TAB 1: BỘ CÂU HỎI */}
                    {activeTab === 'sets' && (
                        <div className="studio-tab-pane">
                            <div className="studio-pane-header">
                                <div className="pane-header-left">
                                    <h3 className="studio-pane-title">Danh sách bộ đề của bạn ({mySets.length})</h3>
                                    <p className="studio-pane-desc">Nhấp vào bộ đề để mở trang quản lý chi tiết hoặc thêm bớt các câu hỏi bên trong.</p>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-pane-action"
                                    onClick={handleOpenCreateSetModal}
                                >
                                    <Plus size={16} />
                                    <span>Tạo bộ đề mới</span>
                                </button>
                            </div>

                            {mySets.length === 0 ? (
                                <div className="studio-empty-state">
                                    <div className="empty-icon-wrap">
                                        <Layers size={36} />
                                    </div>
                                    <h4>Bạn chưa tạo bộ câu hỏi nào</h4>
                                    <p>Hãy bắt đầu xây dựng bộ đề trắc nghiệm đầu tiên của bạn để chia sẻ hoặc luyện tập!</p>
                                    <button 
                                        type="button" 
                                        className="btn-empty-create"
                                        onClick={handleOpenCreateSetModal}
                                    >
                                        <Plus size={16} />
                                        <span>Tạo bộ đề ngay</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="studio-cards-grid studio-sets-grid">
                                    {mySets.map((set) => {
                                        const topicClass = getTopicBadgeClass(set.topic);
                                        const questionsCount = set.questions?.length || 0;

                                        return (
                                            <div 
                                                key={set._id} 
                                                className="studio-workshop-card"
                                                onClick={() => navigate(`/set/${set._id}`)}
                                                title="Bấm để mở trang chi tiết và quản lý câu hỏi"
                                            >
                                                {/* Header thẻ: Toggles Trạng thái & Môn học */}
                                                <div className="workshop-card-header">
                                                    <div className="card-toggles-wrap">
                                                        {/* Toggle Riêng tư / Công khai */}
                                                        <button 
                                                            type="button"
                                                            className={`pill-toggle-btn ${set.isPublic ? 'status-public' : 'status-private'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTogglePrivacy(set._id, set.isPublic);
                                                            }}
                                                            title={set.isPublic ? "Đang Công khai (Bấm để chuyển sang Riêng tư)" : "Đang Riêng tư (Bấm để chuyển sang Công khai)"}
                                                        >
                                                            {set.isPublic ? (
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
                                                        </button>

                                                        {/* Toggle Ẩn danh (khi công khai) */}
                                                        {set.isPublic && (
                                                            <button 
                                                                type="button"
                                                                className={`pill-toggle-btn ${set.isAnonymous ? 'status-anon' : 'status-named'}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleAnonymous(set._id, set.isAnonymous);
                                                                }}
                                                                title={set.isAnonymous ? "Đang Ẩn danh (Bấm để Hiện tên)" : "Đang Hiện tên tác giả (Bấm để Ẩn danh)"}
                                                            >
                                                                {set.isAnonymous ? (
                                                                    <>
                                                                        <UserX size={12} />
                                                                        <span>Ẩn danh</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye size={12} />
                                                                        <span>Hiện tên</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}

                                                        <span className={`workshop-topic-tag ${topicClass}`}>
                                                            {set.topic || 'Khác'}
                                                        </span>

                                                        <span className="workshop-count-pill">
                                                            {questionsCount} câu hỏi
                                                        </span>
                                                    </div>

                                                    <button 
                                                        type="button"
                                                        className="btn-card-delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSet(set._id);
                                                        }}
                                                        title="Xóa bộ đề này khỏi tài khoản"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Tiêu đề & Mô tả */}
                                                <div className="workshop-card-body">
                                                    <h4 className="workshop-card-title">
                                                        <span>{set.title}</span>
                                                        <ArrowUpRight size={17} className="title-arrow" />
                                                    </h4>
                                                    <p className="workshop-card-desc">
                                                        {set.description || "Bộ câu hỏi chất lượng cao biên soạn tại Góc Sáng Tạo EasyLearn."}
                                                    </p>
                                                </div>

                                                {/* Thanh hành động bên dưới thẻ */}
                                                <div className="workshop-card-footer">
                                                    <div className="footer-actions-left">
                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action btn-action-manage"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/set/${set._id}`);
                                                            }}
                                                            title="Mở bảng biên soạn chi tiết câu hỏi"
                                                        >
                                                            <Wrench size={14} />
                                                            <span>Quản lý câu hỏi</span>
                                                        </button>
                                                    </div>

                                                    <div className="footer-actions-right">
                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExport(set._id, 'excel');
                                                            }}
                                                            title="Tải về file Excel"
                                                        >
                                                            <FileSpreadsheet size={14} />
                                                            <span>Excel</span>
                                                        </button>

                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExport(set._id, 'pdf');
                                                            }}
                                                            title="Tải về file PDF"
                                                        >
                                                            <FileText size={14} />
                                                            <span>PDF</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: NGÂN HÀNG CÂU HỎI LẺ */}
                    {activeTab === 'questions' && (
                        <div className="studio-tab-pane">
                            <div className="studio-pane-header">
                                <div className="pane-header-left">
                                    <h3 className="studio-pane-title">Kho câu hỏi lẻ của bạn ({questions.length})</h3>
                                    <p className="studio-pane-desc">Nhấp vào câu hỏi bất kỳ để chỉnh sửa nhanh nội dung, hoặc gán vào một trong các bộ đề đã tạo.</p>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-pane-action"
                                    onClick={handleOpenCreateQuestionModal}
                                >
                                    <Plus size={16} />
                                    <span>Tạo câu hỏi mới</span>
                                </button>
                            </div>

                            {questions.length === 0 ? (
                                <div className="studio-empty-state">
                                    <div className="empty-icon-wrap">
                                        <HelpCircle size={36} />
                                    </div>
                                    <h4>Ngân hàng câu hỏi của bạn đang trống</h4>
                                    <p>Hãy thêm câu hỏi trắc nghiệm đầu tiên để tích lũy kho đề của bạn!</p>
                                    <button 
                                        type="button" 
                                        className="btn-empty-create"
                                        onClick={handleOpenCreateQuestionModal}
                                    >
                                        <Plus size={16} />
                                        <span>Tạo câu hỏi ngay</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="studio-cards-grid studio-questions-grid">
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

                                        const topicClass = getTopicBadgeClass(q.topic);

                                        return (
                                            <div 
                                                key={q._id} 
                                                className="studio-question-card"
                                                onClick={() => handleOpenEditQuestionModal(q)}
                                                title="Bấm vào câu hỏi để chỉnh sửa nội dung"
                                            >
                                                {/* Header câu hỏi */}
                                                <div className="question-card-header">
                                                    <div className="q-badge-group">
                                                        <span className="q-num-badge">Câu {index + 1}</span>
                                                        <span className={`q-diff-badge ${diffClass}`}>• {diffText}</span>
                                                        <span className={`workshop-topic-tag ${topicClass}`}>{q.topic || 'Khác'}</span>
                                                    </div>

                                                    <button 
                                                        type="button"
                                                        className="btn-card-delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteQuestion(q._id);
                                                        }}
                                                        title="Xóa câu hỏi khỏi kho đề"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Đề bài câu hỏi */}
                                                <h4 className="question-card-text">
                                                    {q.questionText}
                                                </h4>

                                                {/* Lưới 4 đáp án (Đáp án đúng highlight viền xanh nổi bật) */}
                                                {q.options && q.options.length === 4 && (
                                                    <div className="question-options-preview">
                                                        {q.options.map((opt, i) => {
                                                            const label = ['A', 'B', 'C', 'D'][i];
                                                            const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
                                                            return (
                                                                <div key={i} className={`q-option-snippet ${isCorrect ? 'is-correct-opt' : ''}`}>
                                                                    <span className="opt-letter">{label}</span>
                                                                    <span className="opt-content">{opt}</span>
                                                                    {isCorrect && <Check size={13} className="opt-check-icon" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Thanh hành động */}
                                                <div className="workshop-card-footer">
                                                    <div className="footer-actions-left">
                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action btn-add-to-set"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenAddToSetModal(q);
                                                            }}
                                                            title="Thêm câu hỏi này vào một trong các bộ đề của bạn"
                                                        >
                                                            <Plus size={14} />
                                                            <span>Gán vào bộ đề</span>
                                                        </button>
                                                    </div>

                                                    <div className="footer-actions-right">
                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenEditQuestionModal(q);
                                                            }}
                                                            title="Chỉnh sửa nội dung câu hỏi"
                                                        >
                                                            <Pencil size={13} />
                                                            <span>Chỉnh sửa</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: BỘ ĐỀ ĐÃ LƯU */}
                    {activeTab === 'saved' && (
                        <div className="studio-tab-pane">
                            <div className="studio-pane-header">
                                <div className="pane-header-left">
                                    <h3 className="studio-pane-title">Bộ đề đã lưu vào tủ đồ ({savedSetsData.length})</h3>
                                    <p className="studio-pane-desc">Các bộ câu hỏi hay từ Thư viện cộng đồng EasyLearn mà bạn đã lưu lại.</p>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-pane-action"
                                    onClick={() => navigate('/library')}
                                >
                                    <ExternalLink size={15} />
                                    <span>Khám phá Thư viện</span>
                                </button>
                            </div>

                            {savedSetsData.length === 0 ? (
                                <div className="studio-empty-state">
                                    <div className="empty-icon-wrap">
                                        <Bookmark size={36} />
                                    </div>
                                    <h4>Bạn chưa lưu bộ câu hỏi nào</h4>
                                    <p>Khám phá Thư viện đề thi cộng đồng và bấm nút "Lưu bộ" để lưu các bộ đề yêu thích vào đây!</p>
                                    <button 
                                        type="button" 
                                        className="btn-empty-create"
                                        onClick={() => navigate('/library')}
                                    >
                                        <ExternalLink size={16} />
                                        <span>Xem Thư viện đề thi</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="studio-cards-grid studio-sets-grid">
                                    {savedSetsData.map((set) => {
                                        const topicClass = getTopicBadgeClass(set.topic);
                                        const questionsCount = set.questions?.length || 0;
                                        const authorName = set.authorName || set.owner?.displayName || set.owner?.username || 'APEC Group';

                                        return (
                                            <div 
                                                key={set._id} 
                                                className="studio-workshop-card"
                                                onClick={() => navigate(`/set/${set._id}`)}
                                                title="Bấm để xem chi tiết bộ câu hỏi này"
                                            >
                                                <div className="workshop-card-header">
                                                    <div className="card-toggles-wrap">
                                                        <span className={`workshop-topic-tag ${topicClass}`}>
                                                            {set.topic || 'Khác'}
                                                        </span>
                                                        <span className="workshop-count-pill">
                                                            {questionsCount} câu hỏi
                                                        </span>
                                                        <span className="author-credit-pill">
                                                            Biên soạn: {authorName}
                                                        </span>
                                                    </div>

                                                    <button 
                                                        type="button"
                                                        className="btn-card-delete btn-card-unsave"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveSavedSet(set._id);
                                                        }}
                                                        title="Bỏ lưu bộ đề này"
                                                    >
                                                        <Bookmark size={15} fill="currentColor" />
                                                    </button>
                                                </div>

                                                <div className="workshop-card-body">
                                                    <h4 className="workshop-card-title">
                                                        <span>{set.title}</span>
                                                        <ArrowUpRight size={17} className="title-arrow" />
                                                    </h4>
                                                    <p className="workshop-card-desc">
                                                        {set.description || "Bộ đề yêu thích được lưu từ Thư viện cộng đồng EasyLearn."}
                                                    </p>
                                                </div>

                                                <div className="workshop-card-footer">
                                                    <div className="footer-actions-left">
                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action btn-action-manage"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/set/${set._id}`);
                                                            }}
                                                        >
                                                            <ExternalLink size={14} />
                                                            <span>Xem chi tiết</span>
                                                        </button>
                                                    </div>

                                                    <div className="footer-actions-right">
                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExport(set._id, 'excel');
                                                            }}
                                                        >
                                                            <FileSpreadsheet size={14} />
                                                            <span>Excel</span>
                                                        </button>

                                                        <button 
                                                            type="button"
                                                            className="btn-workshop-action"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExport(set._id, 'pdf');
                                                            }}
                                                        >
                                                            <FileText size={14} />
                                                            <span>PDF</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL 1: TẠO BỘ CÂU HỎI MỚI */}
            {isCreateSetModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseCreateSetModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <FolderPlus size={20} />
                                <h3>Tạo Bộ Câu Hỏi Mới</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseCreateSetModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSet} className="studio-modal-form">
                            <div className="form-group-field">
                                <label htmlFor="modal-set-title">Tên bộ đề trắc nghiệm</label>
                                <input 
                                    id="modal-set-title"
                                    className="studio-input"
                                    required 
                                    placeholder="VD: Tổng ôn Toán 12 - Chuyên đề Tích phân" 
                                    value={questionSetFormData.title} 
                                    onChange={(e) => setQuestionSetFormData({...questionSetFormData, title: e.target.value})} 
                                />
                            </div>

                            <div className="form-group-field">
                                <label htmlFor="modal-set-desc">Mô tả ngắn</label>
                                <textarea 
                                    id="modal-set-desc"
                                    className="studio-textarea"
                                    placeholder="Mô tả mục tiêu, kiến thức trọng tâm..." 
                                    value={questionSetFormData.description} 
                                    onChange={(e) => setQuestionSetFormData({...questionSetFormData, description: e.target.value})} 
                                />
                            </div>

                            <div className="form-group-field">
                                <label htmlFor="modal-set-topic">Chủ đề môn học</label>
                                <select 
                                    id="modal-set-topic"
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
                                    <label htmlFor="modal-set-class">Gán trực tiếp vào lớp học (Tùy chọn)</label>
                                    <select
                                        id="modal-set-class"
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
                                    onChange={(e) => setQuestionSetFormData({
                                        ...questionSetFormData, 
                                        isPublic: e.target.checked,
                                        isAnonymous: e.target.checked ? questionSetFormData.isAnonymous : false
                                    })} 
                                />
                                <span>Công khai lên Thư viện cộng đồng</span>
                            </label>

                            {questionSetFormData.isPublic && (
                                <div className="studio-author-visibility-box">
                                    <label className="studio-sublabel">Chế độ hiển thị tác giả trên Thư viện:</label>
                                    <div className="author-toggle-btn-group">
                                        <button
                                            type="button"
                                            className={`btn-author-mode ${!questionSetFormData.isAnonymous ? 'active' : ''}`}
                                            onClick={() => setQuestionSetFormData({ ...questionSetFormData, isAnonymous: false })}
                                        >
                                            <Eye size={14} />
                                            <span>Hiện tên tác giả</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-author-mode ${questionSetFormData.isAnonymous ? 'active' : ''}`}
                                            onClick={() => setQuestionSetFormData({ ...questionSetFormData, isAnonymous: true })}
                                        >
                                            <UserX size={14} />
                                            <span>Đăng Ẩn danh</span>
                                        </button>
                                    </div>
                                    <div className="author-mode-desc">
                                        {!questionSetFormData.isAnonymous ? (
                                            <span>Tác giả hiển thị: <strong>{currentUser?.displayName || currentUser?.username}</strong></span>
                                        ) : (
                                            <span className="anon-warning">Người khác sẽ chỉ thấy <strong>"Ẩn danh"</strong>.</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="studio-modal-actions">
                                <button type="button" className="btn-modal-cancel" onClick={handleCloseCreateSetModal}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn-modal-submit">
                                    <Plus size={16} />
                                    <span>Tạo Bộ Câu Hỏi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: TẠO CÂU HỎI TRẮC NGHIỆM MỚI */}
            {isCreateQuestionModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseCreateQuestionModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <HelpCircle size={20} />
                                <h3>Thêm Câu Hỏi Trắc Nghiệm Mới</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseCreateQuestionModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateQuestion} className="studio-modal-form">
                            <div className="form-group-field">
                                <label htmlFor="create-q-text">Nội dung câu hỏi</label>
                                <textarea 
                                    id="create-q-text"
                                    className="studio-textarea"
                                    required 
                                    placeholder="Nhập đề bài câu hỏi trắc nghiệm..." 
                                    value={formData.questionText} 
                                    onChange={(e) => setFormData({...formData, questionText: e.target.value})} 
                                    style={{ minHeight: '80px' }}
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group-field">
                                    <label htmlFor="create-q-correct">Đáp án đúng</label>
                                    <select 
                                        id="create-q-correct"
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
                                    <label htmlFor="create-q-difficulty">Độ khó</label>
                                    <select 
                                        id="create-q-difficulty"
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
                                <label htmlFor="create-q-topic">Chủ đề môn học</label>
                                <select 
                                    id="create-q-topic"
                                    className="studio-select" 
                                    value={formData.topic} 
                                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                >
                                    <option value="Toán">Toán học</option>
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
                                    <label htmlFor="create-q-set">Gán ngay vào bộ đề (Tùy chọn)</label>
                                    <select 
                                        id="create-q-set"
                                        className="studio-select" 
                                        value={formData.setId} 
                                        onChange={(e) => setFormData({...formData, setId: e.target.value})}
                                    >
                                        <option value="">Chỉ lưu vào ngân hàng chung</option>
                                        {mySets.map(set => (
                                            <option key={set._id} value={set._id}>📦 {set.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="studio-modal-actions">
                                <button type="button" className="btn-modal-cancel" onClick={handleCloseCreateQuestionModal}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn-modal-submit">
                                    <Plus size={16} />
                                    <span>Lưu Câu Hỏi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: CHỈNH SỬA CÂU HỎI */}
            {isEditQuestionModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseEditQuestionModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <Pencil size={20} />
                                <h3>Chỉnh Sửa Câu Hỏi</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseEditQuestionModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditQuestion} className="studio-modal-form">
                            <div className="form-group-field">
                                <label htmlFor="edit-q-text">Nội dung câu hỏi</label>
                                <textarea 
                                    id="edit-q-text"
                                    className="studio-textarea"
                                    required 
                                    value={editingQuestionData.questionText} 
                                    onChange={(e) => setEditingQuestionData({...editingQuestionData, questionText: e.target.value})} 
                                    style={{ minHeight: '80px' }}
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
                                            value={editingQuestionData.optionA} 
                                            onChange={(e) => setEditingQuestionData({...editingQuestionData, optionA: e.target.value})} 
                                        />
                                    </div>
                                    <div className="answer-option-row">
                                        <span className="option-letter-tag">B</span>
                                        <input 
                                            className="studio-input"
                                            required 
                                            value={editingQuestionData.optionB} 
                                            onChange={(e) => setEditingQuestionData({...editingQuestionData, optionB: e.target.value})} 
                                        />
                                    </div>
                                    <div className="answer-option-row">
                                        <span className="option-letter-tag">C</span>
                                        <input 
                                            className="studio-input"
                                            required 
                                            value={editingQuestionData.optionC} 
                                            onChange={(e) => setEditingQuestionData({...editingQuestionData, optionC: e.target.value})} 
                                        />
                                    </div>
                                    <div className="answer-option-row">
                                        <span className="option-letter-tag">D</span>
                                        <input 
                                            className="studio-input"
                                            required 
                                            value={editingQuestionData.optionD} 
                                            onChange={(e) => setEditingQuestionData({...editingQuestionData, optionD: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group-field">
                                    <label htmlFor="edit-q-correct">Đáp án đúng</label>
                                    <select 
                                        id="edit-q-correct"
                                        className="studio-select" 
                                        value={editingQuestionData.correctAnswer} 
                                        onChange={(e) => setEditingQuestionData({...editingQuestionData, correctAnswer: e.target.value})}
                                    >
                                        <option value="A">Đáp án A</option>
                                        <option value="B">Đáp án B</option>
                                        <option value="C">Đáp án C</option>
                                        <option value="D">Đáp án D</option>
                                    </select>
                                </div>

                                <div className="form-group-field">
                                    <label htmlFor="edit-q-difficulty">Độ khó</label>
                                    <select 
                                        id="edit-q-difficulty"
                                        className="studio-select" 
                                        value={editingQuestionData.difficulty} 
                                        onChange={(e) => setEditingQuestionData({...editingQuestionData, difficulty: e.target.value})}
                                    >
                                        <option value="easy">Dễ</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="hard">Khó</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group-field">
                                <label htmlFor="edit-q-topic">Chủ đề môn học</label>
                                <select 
                                    id="edit-q-topic"
                                    className="studio-select" 
                                    value={editingQuestionData.topic} 
                                    onChange={(e) => setEditingQuestionData({...editingQuestionData, topic: e.target.value})}
                                >
                                    <option value="Toán">Toán học</option>
                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                    <option value="Lịch sử">Lịch sử</option>
                                    <option value="Hoá học">Hoá học</option>
                                    <option value="Vật lý">Vật lý</option>
                                    <option value="Tin học">Tin học</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>

                            <div className="studio-modal-actions">
                                <button type="button" className="btn-modal-cancel" onClick={handleCloseEditQuestionModal}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="btn-modal-submit">
                                    <CheckCircle2 size={16} />
                                    <span>Lưu Thay Đổi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: GÁN CÂU HỎI VÀO BỘ ĐỀ */}
            {isAddToSetModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseAddToSetModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <Layers size={20} />
                                <h3>Thêm Câu Hỏi Vào Bộ Đề</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseAddToSetModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="studio-add-to-set-panel">
                            {targetQuestionForSet && (
                                <div className="target-q-preview-box">
                                    <span className="target-q-tag">Câu hỏi đang chọn:</span>
                                    <p className="target-q-text">{targetQuestionForSet.questionText}</p>
                                </div>
                            )}

                            <h4 className="select-set-subheading">Chọn bộ đề đích để thêm:</h4>

                            {mySets.length === 0 ? (
                                <div className="add-set-empty">
                                    <Layers size={36} />
                                    <p>Bạn chưa có bộ câu hỏi nào để thêm.</p>
                                    <button 
                                        type="button" 
                                        className="btn-empty-create"
                                        onClick={() => {
                                            handleCloseAddToSetModal();
                                            handleOpenCreateSetModal();
                                        }}
                                    >
                                        <Plus size={15} />
                                        <span>Tạo bộ đề ngay</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="available-sets-list">
                                    {mySets.map(set => {
                                        const alreadyInSet = (set.questions || []).some(
                                            qId => String(qId) === String(targetQuestionForSet?._id)
                                        );

                                        return (
                                            <div key={set._id} className="available-set-row">
                                                <div className="set-row-info">
                                                    <h5 className="set-row-title">{set.title}</h5>
                                                    <div className="set-row-meta">
                                                        <span>🏷️ {set.topic}</span>
                                                        <span>📝 {set.questions?.length || 0} câu</span>
                                                        <span className={set.isPublic ? "row-pill-pub" : "row-pill-priv"}>
                                                            {set.isPublic ? "Công khai" : "Riêng tư"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="set-row-action">
                                                    {alreadyInSet ? (
                                                        <span className="badge-already-added">
                                                            <CheckCircle2 size={14} />
                                                            <span>Đã có trong bộ</span>
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            type="button" 
                                                            className="btn-add-here"
                                                            onClick={() => handleSelectSetForQuestion(set._id)}
                                                        >
                                                            <Plus size={14} />
                                                            <span>Thêm vào đây</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="studio-modal-actions" style={{ marginTop: '18px' }}>
                                <button type="button" className="btn-modal-cancel" onClick={handleCloseAddToSetModal}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudioPage;
