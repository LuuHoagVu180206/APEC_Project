import React from 'react';
import { Link } from 'react-router-dom';
import { LibraryPageLogic } from '../pages_logic/LibraryPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import '../pages_styling/LibraryPageStyling.css';
import { 
    Sparkles, 
    Search, 
    X, 
    Heart, 
    Bookmark, 
    FileSpreadsheet, 
    FileText, 
    Trash2, 
    FolderPlus, 
    Sun, 
    Moon, 
    LogOut, 
    Play, 
    BookOpen,
    Layers,
    Bot,
    Loader2,
    CheckCircle2,
    ArrowRight,
    BookmarkCheck,
    Zap
} from 'lucide-react';

const LibraryPage = () => {
    const {
        navigate,
        currentUser,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        savedSets,
        filteredSets,
        isLoading,
        schoolActionLabel,
        canDelete,
        handleLike,
        handleToggleLikeSet,
        handleDelete,
        handleExport,
        handleLogout,
        // AI Discovery hooks
        aiQuery,
        setAiQuery,
        isAiSearching,
        aiDiscoveryResult,
        aiError,
        handleAiDiscovery,
        handleClearAiDiscovery,
        handleQuickPrompt
    } = LibraryPageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    const categories = [
        'Tất cả',
        'Toán học',
        'Tiếng Anh',
        'Hoá học',
        'Vật lý',
        'Lịch sử',
        'Tin học',
        'Khác'
    ];

    const getTopicBadgeClass = (topic) => {
        if (!topic) return 'badge-other';
        const t = topic.toLowerCase();
        if (t.includes('toán')) return 'badge-math';
        if (t.includes('tiếng anh') || t.includes('anh')) return 'badge-english';
        if (t.includes('lịch sử') || t.includes('sử')) return 'badge-history';
        if (t.includes('hoá') || t.includes('vật lý') || t.includes('sinh')) return 'badge-science';
        return 'badge-other';
    };

    return (
        <div className="library-wrapper">
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

                        {currentUser?.role === 'teacher' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">{currentUser.username.charAt(0).toUpperCase()}</span>
                                    <span>{currentUser.username}</span>
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
                        ) : currentUser?.role === 'user' || currentUser?.role === 'admin' ? (
                            <div className="teacher-account-menu">
                                <Link className="nav-username" to="/profile">
                                    <span className="user-avatar-badge">{currentUser.username.charAt(0).toUpperCase()}</span>
                                    <span>{currentUser.username}</span>
                                </Link>
                                <div className="teacher-account-dropdown">
                                    {currentUser.role === 'admin' && <Link to="/admin">Quản trị hệ thống</Link>}
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

            {/* 2. HERO SECTION & TÌM KIẾM */}
            <section className="library-hero">
                <div className="library-backdrop-glow"></div>
                <div className="library-header-content">
                    <div className="library-pill-badge">
                        <BookOpen size={14} />
                        <span>Kho Tàng Đề Thi & Tri Thức</span>
                    </div>

                    <h1 className="library-title">Thư Viện Câu Hỏi Cộng Đồng</h1>
                    <p className="library-subtitle">
                        Nơi giáo viên và người học trên cả nước chia sẻ các bộ câu hỏi chọn lọc. Ôn luyện, lưu bộ đề yêu thích hoặc xuất tài liệu ôn thi.
                    </p>

                    {/* AI SMART ASSIGNMENT DISCOVERY & AUTO SAVE TO STUDIO */}
                    <div className="ai-discovery-card">
                        <div className="ai-discovery-header">
                            <div className="ai-pill-badge">
                                <Bot size={16} />
                                <span>AI Smart Assignment Discovery & Auto save to studio</span>
                                <span className="ai-model-tag">SLM Qwen2.5:7b</span>
                            </div>
                            <p className="ai-helper-desc">
                                Nhập yêu cầu bằng ngôn ngữ tự nhiên. SLM phân tích môn & chủ đề, truy xuất DB qua Index tối ưu, thẩm định mức độ phù hợp và tự động lưu vào Studio.
                            </p>
                        </div>

                        <form className="ai-discovery-form" onSubmit={(e) => { e.preventDefault(); handleAiDiscovery(); }}>
                            <div className="ai-discovery-input-box">
                                <Sparkles size={18} className="ai-input-sparkle" />
                                <input
                                    type="text"
                                    className="ai-discovery-input"
                                    placeholder="Nhập yêu cầu (Ví dụ: Tìm cho tôi các bộ đề Vật lý 12 về Dao động điều hòa)..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    disabled={isAiSearching}
                                />
                                {aiQuery && !isAiSearching && (
                                    <button 
                                        type="button" 
                                        className="btn-ai-clear" 
                                        onClick={() => setAiQuery('')}
                                        title="Xóa nội dung"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className={`btn-ai-submit ${isAiSearching ? 'loading' : ''}`}
                                    disabled={isAiSearching || !aiQuery.trim()}
                                >
                                    {isAiSearching ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>AI Đang Phân Tích & Lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            <span>Khám phá & Lưu Studio</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Gợi ý truy vấn nhanh */}
                        <div className="ai-prompt-suggestions">
                            <span className="suggestion-label">Gợi ý thử nhanh:</span>
                            <button
                                type="button"
                                className="suggestion-chip"
                                onClick={() => handleQuickPrompt("Tìm cho tôi các bộ đề Vật lý 12 về Dao động điều hòa")}
                                disabled={isAiSearching}
                            >
                                <Zap size={12} /> Vật lý 12: Dao động điều hòa
                            </button>
                            <button
                                type="button"
                                className="suggestion-chip"
                                onClick={() => handleQuickPrompt("Bộ đề trắc nghiệm Toán học 12 khảo sát hàm số và cực trị")}
                                disabled={isAiSearching}
                            >
                                <Zap size={12} /> Toán 12: Đạo hàm & Khảo sát hàm số
                            </button>
                            <button
                                type="button"
                                className="suggestion-chip"
                                onClick={() => handleQuickPrompt("Bộ câu hỏi trắc nghiệm Lịch sử Đảng Cộng sản Việt Nam")}
                                disabled={isAiSearching}
                            >
                                <Zap size={12} /> Lịch sử Đảng Cộng sản
                            </button>
                        </div>

                        {/* Loading Pipeline State */}
                        {isAiSearching && (
                            <div className="ai-searching-state">
                                <div className="ai-searching-indicator">
                                    <Loader2 size={22} className="animate-spin text-purple" />
                                    <div className="ai-searching-text">
                                        <strong>Hệ thống AI SLM (Qwen2.5:7b) đang xử lý yêu cầu...</strong>
                                        <div className="ai-pipeline-steps">
                                            <span className="pipeline-step active">1. Phân tích ngữ nghĩa</span>
                                            <span className="pipeline-arrow">→</span>
                                            <span className="pipeline-step active">2. Truy xuất DB qua Index</span>
                                            <span className="pipeline-arrow">→</span>
                                            <span className="pipeline-step active">3. SLM thẩm định</span>
                                            <span className="pipeline-arrow">→</span>
                                            <span className="pipeline-step active">4. Tự động lưu Studio</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {aiError && (
                            <div className="ai-error-box">
                                <span>⚠️ {aiError}</span>
                                <button type="button" onClick={handleClearAiDiscovery} className="btn-close-error">✕</button>
                            </div>
                        )}

                        {/* Chat AI Response Card */}
                        {aiDiscoveryResult && (
                            <div className="ai-chat-response-card">
                                <div className="ai-chat-response-header">
                                    <div className="ai-chat-sender">
                                        <div className="ai-avatar-circle">
                                            <Bot size={18} />
                                        </div>
                                        <div>
                                            <div className="ai-sender-title">
                                                <strong>Trợ lý AI EasyLearn (Qwen2.5:7b)</strong>
                                                <span className="ai-badge-verified">
                                                    <CheckCircle2 size={12} /> Đã thẩm định & Tự động lưu
                                                </span>
                                            </div>
                                            <div className="ai-analysis-tags">
                                                <span className="analysis-tag">Môn: <strong>{aiDiscoveryResult.queryAnalysis?.subject || 'Đa môn'}</strong></span>
                                                {aiDiscoveryResult.queryAnalysis?.topic && (
                                                    <span className="analysis-tag">Chủ đề: <strong>{aiDiscoveryResult.queryAnalysis.topic}</strong></span>
                                                )}
                                                {aiDiscoveryResult.queryAnalysis?.grade && (
                                                    <span className="analysis-tag">Khối: <strong>Lớp {aiDiscoveryResult.queryAnalysis.grade}</strong></span>
                                                )}
                                                <span className="analysis-tag-success">
                                                    <BookmarkCheck size={13} /> Đã lưu vào Studio: <strong>{aiDiscoveryResult.stats?.newlySaved || 0} mới</strong> ({aiDiscoveryResult.stats?.alreadySaved || 0} có sẵn)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ai-response-actions">
                                        <button
                                            type="button"
                                            className="btn-go-studio"
                                            onClick={() => navigate('/studio?tab=saved')}
                                            title="Đi đến Studio để xem các bộ đề đã lưu"
                                        >
                                            <span>Mở Studio của tôi</span>
                                            <ArrowRight size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-dismiss-ai"
                                            onClick={handleClearAiDiscovery}
                                            title="Đóng kết quả AI"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* AI Message Bubble */}
                                <div className="ai-message-bubble">
                                    <p className="ai-message-text">{aiDiscoveryResult.message}</p>
                                    {aiDiscoveryResult.summary && (
                                        <p className="ai-summary-note">💡 <em>{aiDiscoveryResult.summary}</em></p>
                                    )}
                                </div>

                                {/* Matched Sets Grid */}
                                {aiDiscoveryResult.matchedSets && aiDiscoveryResult.matchedSets.length > 0 && (
                                    <div className="ai-matched-sets-section">
                                        <div className="ai-matched-header">
                                            <h4>Danh sách {aiDiscoveryResult.matchedSets.length} bộ đề được chọn lọc & lưu vào Studio:</h4>
                                        </div>
                                        <div className="ai-matched-grid">
                                            {aiDiscoveryResult.matchedSets.map((set) => (
                                                <div key={set._id} className="ai-matched-card">
                                                    <div className="ai-matched-card-top">
                                                        <span className={`set-topic-badge ${getTopicBadgeClass(set.topic)}`}>
                                                            {set.topic || 'Khác'}
                                                        </span>
                                                        <span className="ai-confidence-pill">
                                                            {set.confidence || 85}% phù hợp
                                                        </span>
                                                    </div>

                                                    <h4
                                                        className="ai-matched-title"
                                                        onClick={() => navigate(`/set/${set._id}`)}
                                                        title="Xem chi tiết bộ câu hỏi"
                                                    >
                                                        {set.title}
                                                    </h4>

                                                    <p className="ai-matched-desc">
                                                        {set.description || "Bộ đề trắc nghiệm chuẩn kiến thức."}
                                                    </p>

                                                    {set.matchReason && (
                                                        <div className="ai-match-reason">
                                                            <strong>Lý do AI chọn:</strong> {set.matchReason}
                                                        </div>
                                                    )}

                                                    <div className="ai-matched-footer">
                                                        <div className="ai-saved-indicator">
                                                            <BookmarkCheck size={14} />
                                                            <span>
                                                                {set.isNewlySaved ? 'Vừa lưu vào Studio' : 'Đã có trong Studio'}
                                                            </span>
                                                        </div>

                                                        <div className="ai-matched-btns">
                                                            <button
                                                                type="button"
                                                                className="btn-view-set-mini"
                                                                onClick={() => navigate(`/set/${set._id}`)}
                                                            >
                                                                <Play size={12} fill="currentColor" /> Xem bộ
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-studio-mini"
                                                                onClick={() => navigate('/studio?tab=saved')}
                                                            >
                                                                Studio
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Thanh tìm kiếm truyền thống & Nút Tạo đề */}
                    <div className="library-search-container">
                        <div className="library-search-wrapper">
                            <Search size={18} className="library-search-icon" />
                            <input 
                                type="text"
                                className="library-search-input"
                                placeholder="Tìm kiếm bộ câu hỏi theo tên, chủ đề hoặc mô tả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    className="btn-clear-search"
                                    onClick={() => setSearchTerm('')}
                                    title="Xóa tìm kiếm"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <button 
                            className="btn-studio-cta"
                            onClick={() => navigate(currentUser ? '/studio' : '/login')}
                        >
                            <FolderPlus size={17} />
                            <span>Tạo bộ đề mới</span>
                        </button>
                    </div>

                    {/* Bộ lọc danh mục */}
                    <div className="library-categories">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. LƯỚI BỘ CÂU HỎI */}
            <main className="library-main-content">
                <div className="library-meta-bar">
                    <span className="library-count-text">
                        Hiển thị <strong>{filteredSets.length}</strong> bộ câu hỏi công khai
                    </span>
                </div>

                {isLoading ? (
                    <div className="library-empty-state">
                        <div className="empty-icon-wrap">
                            <Layers size={28} />
                        </div>
                        <h3>Đang tải dữ liệu thư viện...</h3>
                    </div>
                ) : filteredSets.length === 0 ? (
                    <div className="library-empty-state">
                        <div className="empty-icon-wrap">
                            <BookOpen size={28} />
                        </div>
                        <h3>Không tìm thấy bộ câu hỏi nào</h3>
                        <p>
                            Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục "Tất cả" để khám phá thêm nhiều nội dung nhé.
                        </p>
                        <button 
                            className="btn-studio-cta" 
                            onClick={() => { setSearchTerm(''); setActiveCategory('Tất cả'); }}
                        >
                            Xem tất cả bộ đề
                        </button>
                    </div>
                ) : (
                    <div className="library-grid">
                        {filteredSets.map((qSet) => {
                            const isSaved = savedSets.includes(qSet._id);
                            const topicClass = getTopicBadgeClass(qSet.topic);

                            return (
                                <div key={qSet._id} className="set-card">
                                    <div>
                                        <div className="set-card-header">
                                            <span className={`set-topic-badge ${topicClass}`}>
                                                {qSet.topic || 'Khác'}
                                            </span>

                                            {canDelete(qSet.owner?._id || qSet.owner) && (
                                                <button 
                                                    className="btn-delete-card"
                                                    onClick={() => handleDelete(qSet._id)}
                                                    title="Xóa bộ câu hỏi khỏi hệ thống"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <h3 
                                            className="set-card-title"
                                            onClick={() => navigate(`/set/${qSet._id}`)}
                                            title="Bấm để xem chi tiết các câu hỏi trong bộ này"
                                        >
                                            {qSet.title}
                                        </h3>

                                        <p className="set-card-desc">
                                            {qSet.description || "Bộ câu hỏi trắc nghiệm chất lượng cao phục vụ rèn luyện và kiểm tra kiến thức."}
                                        </p>

                                        <div className="set-card-author">
                                            <div className="author-avatar">
                                                {(qSet.owner?.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="author-name">
                                                Tác giả: <strong>{qSet.owner?.username || "Ẩn danh"}</strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="set-card-actions">
                                        <div className="action-group-left">
                                            <button 
                                                className="btn-card-icon liked"
                                                onClick={() => handleLike(qSet._id)}
                                                title="Thả tim cho bộ đề này"
                                            >
                                                <Heart size={14} fill="#ef4444" />
                                                <span>{qSet.likesCount || 0}</span>
                                            </button>

                                            <button 
                                                className={`btn-card-icon ${isSaved ? 'saved' : ''}`}
                                                onClick={() => handleToggleLikeSet(qSet._id)}
                                                title={isSaved ? "Đã lưu vào bộ sưu tập cá nhân" : "Lưu vào bộ sưu tập cá nhân"}
                                            >
                                                <Bookmark size={14} fill={isSaved ? "var(--accent-blue)" : "none"} />
                                                <span>{isSaved ? "Đã lưu" : "Lưu bộ"}</span>
                                            </button>

                                            <button 
                                                className="btn-card-icon"
                                                onClick={() => navigate(`/set/${qSet._id}`)}
                                                title="Xem danh sách câu hỏi"
                                            >
                                                <Play size={13} fill="currentColor" />
                                                <span>Xem bộ</span>
                                            </button>
                                        </div>

                                        <div className="action-group-right">
                                            <button 
                                                className="btn-export-mini"
                                                onClick={() => handleExport(qSet._id, 'excel')}
                                                title="Tải về file Excel"
                                            >
                                                <FileSpreadsheet size={13} style={{ marginRight: '4px' }} />
                                                Excel
                                            </button>

                                            <button 
                                                className="btn-export-mini"
                                                onClick={() => handleExport(qSet._id, 'pdf')}
                                                title="Tải về file PDF"
                                            >
                                                <FileText size={13} style={{ marginRight: '4px' }} />
                                                PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LibraryPage;
