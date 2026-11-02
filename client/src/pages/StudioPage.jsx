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
    Eye,
    UserX,
    Pencil,
    X,
    CheckCircle2
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
        handleLogout,
        handleToggleAnonymous,
        handleTogglePrivacy
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
                        <h1 className="studio-title">Góc Sáng Tạo của {currentUser?.displayName || currentUser?.username}</h1>
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

            {/* 4. KHU VỰC NỘI DUNG CHÍNH THEO TAB (BỐ CỤC THOÁNG ĐÃNG) */}
            <main className="studio-main-content">
                {/* TAB 1: BỘ CÂU HỎI */}
                {activeTab === 'sets' && (
                    <div className="studio-tab-pane">
                        <div className="studio-pane-header">
                            <div>
                                <h3 className="studio-pane-title">Bộ câu hỏi của tôi ({mySets.length})</h3>
                                <p className="studio-pane-desc">Nhấp vào bộ câu hỏi bất kỳ để xem và quản lý chi tiết các câu hỏi bên trong.</p>
                            </div>
                            <button 
                                type="button" 
                                className="btn-studio-create-main btn-create-set"
                                onClick={handleOpenCreateSetModal}
                                title="Mở bảng tạo bộ câu hỏi mới"
                            >
                                <Plus size={16} />
                                <span>Tạo bộ câu hỏi mới</span>
                            </button>
                        </div>

                        {mySets.length === 0 ? (
                            <div className="studio-empty-box">
                                <Layers size={44} color="var(--text-muted)" />
                                <h4>Bạn chưa tạo bộ câu hỏi nào</h4>
                                <p>Hãy bấm nút "Tạo bộ câu hỏi mới" phía trên để bắt đầu xây dựng bộ đề trắc nghiệm đầu tiên của bạn!</p>
                                <button 
                                    type="button" 
                                    className="btn-studio-create-main btn-create-set"
                                    onClick={handleOpenCreateSetModal}
                                    style={{ marginTop: '16px' }}
                                >
                                    <Plus size={16} />
                                    <span>Tạo bộ câu hỏi ngay</span>
                                </button>
                            </div>
                        ) : (
                            <div className="studio-sets-cards-grid">
                                {mySets.map((set) => (
                                    <div 
                                        key={set._id} 
                                        className="studio-item-card studio-set-card-clickable"
                                        onClick={() => navigate(`/set/${set._id}`)}
                                        title="Bấm để mở trang chi tiết bộ câu hỏi này"
                                    >
                                        <div className="item-card-top">
                                            <div className="item-title-group">
                                                <h4>{set.title}</h4>
                                                <div className="item-meta-tags">
                                                    <span 
                                                        className={set.isPublic ? "pill-privacy-public clickable" : "pill-privacy-private clickable"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleTogglePrivacy(set._id, set.isPublic);
                                                        }}
                                                        title={set.isPublic ? "Đang Công khai (Bấm để chuyển thành Riêng tư)" : "Đang Riêng tư (Bấm để chuyển thành Công khai)"}
                                                    >
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

                                                    {set.isPublic && (
                                                        <span
                                                            className={`pill-author-mode clickable ${set.isAnonymous ? 'mode-anon' : 'mode-named'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleAnonymous(set._id, set.isAnonymous);
                                                            }}
                                                            title={set.isAnonymous ? "Đang Ẩn danh (Bấm để Hiện tên tác giả)" : "Đang Hiện tên tác giả (Bấm để Đăng Ẩn danh)"}
                                                        >
                                                            {set.isAnonymous ? (
                                                                <>
                                                                    <UserX size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                                                    Ẩn danh
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye size={11} style={{ display: 'inline', marginRight: '3px' }} />
                                                                    Hiện tên: {currentUser?.displayName || currentUser?.username}
                                                                </>
                                                            )}
                                                        </span>
                                                    )}

                                                    <span>🏷️ {set.topic}</span>
                                                    <span>📝 {set.questions?.length || 0} câu</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="item-card-desc">
                                            {set.description || "Chưa có mô tả cho bộ đề này. Bấm vào để thêm mô tả và câu hỏi."}
                                        </p>

                                        <div className="item-card-actions">
                                            <div className="action-btns-group">
                                                <button 
                                                    type="button"
                                                    className="btn-studio-action btn-view-set"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/set/${set._id}`);
                                                    }}
                                                    title="Mở trang chi tiết bộ câu hỏi"
                                                >
                                                    <ExternalLink size={13} />
                                                    <span>Xem chi tiết</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    className="btn-studio-action"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(set._id, 'excel');
                                                    }}
                                                    title="Xuất đề ra bảng tính Excel"
                                                >
                                                    <FileSpreadsheet size={13} />
                                                    <span>Excel</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    className="btn-studio-action"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(set._id, 'pdf');
                                                    }}
                                                    title="Xuất tài liệu in ấn PDF"
                                                >
                                                    <FileText size={13} />
                                                    <span>PDF</span>
                                                </button>
                                            </div>

                                            <button 
                                                type="button"
                                                className="btn-studio-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSet(set._id);
                                                }}
                                                title="Xóa bộ đề này khỏi tài khoản"
                                            >
                                                <Trash2 size={15} />
                                                <span>Xóa bộ</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: NGÂN HÀNG CÂU HỎI LẺ */}
                {activeTab === 'questions' && (
                    <div className="studio-tab-pane">
                        <div className="studio-pane-header">
                            <div>
                                <h3 className="studio-pane-title">Ngân hàng câu hỏi lẻ ({questions.length})</h3>
                                <p className="studio-pane-desc">Bấm vào câu hỏi bất kỳ để chỉnh sửa nội dung, hoặc bấm nút để thêm vào bộ đề.</p>
                            </div>
                            <button 
                                type="button" 
                                className="btn-studio-create-main btn-create-q"
                                onClick={handleOpenCreateQuestionModal}
                                title="Mở bảng tạo câu hỏi trắc nghiệm mới"
                            >
                                <Plus size={16} />
                                <span>Tạo câu hỏi mới</span>
                            </button>
                        </div>

                        {questions.length === 0 ? (
                            <div className="studio-empty-box">
                                <HelpCircle size={44} color="var(--text-muted)" />
                                <h4>Ngân hàng câu hỏi của bạn đang trống</h4>
                                <p>Hãy bấm nút "Tạo câu hỏi mới" để tạo các câu hỏi trắc nghiệm và quản lý trong kho đề của bạn!</p>
                                <button 
                                    type="button" 
                                    className="btn-studio-create-main btn-create-q"
                                    onClick={handleOpenCreateQuestionModal}
                                    style={{ marginTop: '16px' }}
                                >
                                    <Plus size={16} />
                                    <span>Tạo câu hỏi ngay</span>
                                </button>
                            </div>
                        ) : (
                            <div className="studio-questions-cards-grid">
                                {questions.map((q, index) => {
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
                                        <div 
                                            key={q._id} 
                                            className="studio-item-card studio-question-card-clickable"
                                            onClick={() => handleOpenEditQuestionModal(q)}
                                            title="Bấm vào câu hỏi để chỉnh sửa nội dung"
                                        >
                                            <div className="item-card-top">
                                                <div className="item-title-group">
                                                    <h4>Câu {index + 1}: {q.questionText}</h4>
                                                    <div className="item-meta-tags">
                                                        <span className={diffClass}>• Độ khó: {diffText}</span>
                                                        <span>• Môn: {q.topic || 'Khác'}</span>
                                                    </div>
                                                </div>

                                                <div className="q-card-top-actions">
                                                    <button
                                                        type="button"
                                                        className="btn-studio-icon-action"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEditQuestionModal(q);
                                                        }}
                                                        title="Chỉnh sửa câu hỏi này"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn-studio-icon-action btn-del"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteQuestion(q._id);
                                                        }}
                                                        title="Xóa câu hỏi khỏi ngân hàng"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
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
                                                    <button 
                                                        type="button"
                                                        className="btn-studio-action btn-add-q-to-set"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenAddToSetModal(q);
                                                        }}
                                                        title="Thêm câu hỏi này vào một trong các bộ đề của bạn"
                                                    >
                                                        <Plus size={14} />
                                                        <span>Thêm vào bộ đề</span>
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        className="btn-studio-action"
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

                                                <button 
                                                    type="button"
                                                    className="btn-studio-delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteQuestion(q._id);
                                                    }}
                                                    title="Xóa câu hỏi khỏi ngân hàng"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Xóa</span>
                                                </button>
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
                            <div>
                                <h3 className="studio-pane-title">Bộ đề đã lưu ({savedSetsData.length})</h3>
                                <p className="studio-pane-desc">Các bộ câu hỏi hay từ thư viện cộng đồng mà bạn đã lưu vào tủ đồ cá nhân.</p>
                            </div>
                        </div>

                        {savedSetsData.length === 0 ? (
                            <div className="studio-empty-box">
                                <Bookmark size={44} color="var(--text-muted)" />
                                <h4>Bạn chưa lưu bộ câu hỏi nào</h4>
                                <p>Khám phá Thư viện đề thi cộng đồng và bấm nút "Lưu bộ" để lưu các bộ đề yêu thích vào đây!</p>
                                <button 
                                    type="button" 
                                    className="btn-studio-create-main"
                                    onClick={() => navigate('/library')}
                                    style={{ marginTop: '16px' }}
                                >
                                    <ExternalLink size={16} />
                                    <span>Khám phá Thư viện</span>
                                </button>
                            </div>
                        ) : (
                            <div className="studio-sets-cards-grid">
                                {savedSetsData.map((set) => (
                                    <div 
                                        key={set._id} 
                                        className="studio-item-card studio-set-card-clickable"
                                        onClick={() => navigate(`/set/${set._id}`)}
                                        title="Bấm để xem chi tiết bộ câu hỏi này"
                                    >
                                        <div className="item-card-top">
                                            <div className="item-title-group">
                                                <h4>{set.title}</h4>
                                                <div className="item-meta-tags">
                                                    <span>🏷️ {set.topic}</span>
                                                    <span>📝 {set.questions?.length || 0} câu</span>
                                                    <span>👤 Tác giả: {set.authorName || set.owner?.displayName || set.owner?.username || 'APEC Group'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="item-card-desc">
                                            {set.description || "Bộ đề lưu từ Thư viện cộng đồng EasyLearn."}
                                        </p>

                                        <div className="item-card-actions">
                                            <div className="action-btns-group">
                                                <button 
                                                    type="button"
                                                    className="btn-studio-action btn-view-set"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/set/${set._id}`);
                                                    }}
                                                >
                                                    <ExternalLink size={13} />
                                                    <span>Xem chi tiết</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    className="btn-studio-action"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(set._id, 'excel');
                                                    }}
                                                >
                                                    <FileSpreadsheet size={13} />
                                                    <span>Excel</span>
                                                </button>

                                                <button 
                                                    type="button"
                                                    className="btn-studio-action"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExport(set._id, 'pdf');
                                                    }}
                                                >
                                                    <FileText size={13} />
                                                    <span>PDF</span>
                                                </button>
                                            </div>

                                            <button 
                                                type="button"
                                                className="btn-studio-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveSavedSet(set._id);
                                                }}
                                                title="Bỏ lưu bộ đề này"
                                            >
                                                <Bookmark size={14} fill="currentColor" />
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

            {/* MODAL 1: TẠO BỘ CÂU HỎI MỚI (GỌN GÀNG, ĐẸP MẮT) */}
            {isCreateSetModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseCreateSetModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <FolderPlus size={19} color="var(--accent-gold)" />
                                <h3>Tạo Bộ Câu Hỏi Mới</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseCreateSetModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSet} className="studio-modal-form">
                            <div className="form-group-field">
                                <label htmlFor="modal-set-title">Tên bộ đề</label>
                                <input 
                                    id="modal-set-title"
                                    className="studio-input"
                                    required 
                                    placeholder="VD: Tổng ôn Toán 12 - Giải tích" 
                                    value={questionSetFormData.title} 
                                    onChange={(e) => setQuestionSetFormData({...questionSetFormData, title: e.target.value})} 
                                />
                            </div>

                            <div className="form-group-field">
                                <label htmlFor="modal-set-desc">Mô tả ngắn</label>
                                <textarea 
                                    id="modal-set-desc"
                                    className="studio-textarea"
                                    placeholder="Mô tả nội dung, mục tiêu ôn tập..." 
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
                                    <label htmlFor="modal-set-class">Gán trực tiếp vào lớp (Tùy chọn)</label>
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
                                            title="Hiển thị tên tác giả khi người khác xem bộ này"
                                        >
                                            <Eye size={14} />
                                            <span>Hiện tên tác giả</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-author-mode mode-anon-btn ${questionSetFormData.isAnonymous ? 'active' : ''}`}
                                            onClick={() => setQuestionSetFormData({ ...questionSetFormData, isAnonymous: true })}
                                            title="Đăng dưới dạng Ẩn danh"
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
                                <button type="submit" className="btn-modal-submit btn-submit-gold">
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
                                <HelpCircle size={19} color="var(--accent-blue)" />
                                <h3>Thêm Câu Hỏi Trắc Nghiệm Mới</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseCreateQuestionModal}>
                                <X size={18} />
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
                                    style={{ minHeight: '75px' }}
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
                                <button type="submit" className="btn-modal-submit btn-submit-blue">
                                    <Plus size={16} />
                                    <span>Lưu Câu Hỏi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: CHỈNH SỬA CÂU HỎI LẺ (KHI BẤM VÀO CÂU HỎI) */}
            {isEditQuestionModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseEditQuestionModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <Pencil size={19} color="var(--accent-blue)" />
                                <h3>Chỉnh Sửa Câu Hỏi</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseEditQuestionModal}>
                                <X size={18} />
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
                                    style={{ minHeight: '75px' }}
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
                                <button type="submit" className="btn-modal-submit btn-submit-blue">
                                    <CheckCircle2 size={16} />
                                    <span>Lưu Thay Đổi</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: PANEL CHỌN BỘ CÂU HỎI ĐỂ THÊM CÂU HỎI VÀO */}
            {isAddToSetModalOpen && (
                <div className="studio-modal-backdrop" onClick={handleCloseAddToSetModal}>
                    <div className="studio-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="studio-modal-header">
                            <div className="modal-title-wrap">
                                <Layers size={19} color="var(--accent-gold)" />
                                <h3>Thêm Câu Hỏi Vào Bộ Đề</h3>
                            </div>
                            <button type="button" className="btn-modal-close" onClick={handleCloseAddToSetModal}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="studio-add-to-set-panel">
                            {targetQuestionForSet && (
                                <div className="target-q-preview-box">
                                    <span className="target-q-tag">Câu hỏi đang chọn:</span>
                                    <p className="target-q-text">{targetQuestionForSet.questionText}</p>
                                </div>
                            )}

                            <h4 className="select-set-subheading">Chọn bộ đề của bạn:</h4>

                            {mySets.length === 0 ? (
                                <div className="add-set-empty">
                                    <Layers size={32} />
                                    <p>Bạn chưa có bộ câu hỏi nào để thêm.</p>
                                    <button 
                                        type="button" 
                                        className="btn-studio-create-main btn-create-set"
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

                            <div className="studio-modal-actions" style={{ marginTop: '16px' }}>
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
