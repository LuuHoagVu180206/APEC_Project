import React from 'react';
import { Link } from 'react-router-dom';
import { LibraryPageLogic } from '../pages_logic/LibraryPageLogic';
import Navbar from '../components/Navbar';
import '../pages_styling/LibraryPageStyling.css';
import { getBentoIllustration } from '../components/BentoIllustration';
import { getAuthorInfo } from '../utils/authorUtils';
import { 
    Search, 
    X, 
    Heart, 
    Bookmark, 
    FileSpreadsheet, 
    FileText, 
    Trash2, 
    FolderPlus, 
    Play, 
    BookOpen,
    Layers,
    Flame,
    Trophy,
    ArrowUpRight,
    Star,
    Copy,
    SlidersHorizontal,
    User,
    Check,
    RotateCcw,
    Gamepad2,
    Users
} from 'lucide-react';

const LibraryPage = () => {
    const splitTitleLines = (title) => {
        if (!title) return ['Sự Kiện Tuần'];
        if (title.includes('&')) {
            const parts = title.split('&');
            return [parts[0].trim(), parts[1].trim()];
        }
        if (title.includes(' - ')) {
            const parts = title.split(' - ');
            return [parts[0].trim(), parts[1].trim()];
        }
        const words = title.split(' ');
        if (words.length > 3) {
            const mid = Math.ceil(words.length / 2);
            return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
        }
        return [title];
    };

    const {
        navigate,
        currentUser,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        authorFilter,
        setAuthorFilter,
        typeFilter,
        setTypeFilter,
        sortStat,
        setSortStat,
        isFilterModalOpen,
        setIsFilterModalOpen,
        setAuthorInputFocus,
        authorSuggestions,
        activeFiltersCount,
        isSearchingOrFiltering,
        handleResetFilters,
        savedSets,
        filteredSets,
        weeklySets,
        isLoading,
        canDelete,
        handleLike,
        handleToggleLikeSet,
        handleDelete,
        handleCopySet,
        handlePlaySet,
        handleExport
    } = LibraryPageLogic();

    const categories = [
        'Tất cả',
        'Toán',
        'Tiếng Anh',
        'Vật lý',
        'Hoá học',
        'Sinh học',
        'Tiếng Việt',
        'Lịch sử',
        'Khác'
    ];

    const typeOptions = [
        { id: 'all', label: 'Tất cả các bộ' },
        { id: 'weekly', label: '🔥 Thử thách Tuần' },
        { id: 'default', label: '⭐ Mặc định APEC' },
        { id: 'user', label: '👥 Cộng đồng tạo' }
    ];

    const sortOptions = [
        { id: 'newest', label: 'Mới nhất', icon: RotateCcw },
        { id: 'likes', label: 'Lượt thích nhiều nhất', icon: Heart },
        { id: 'copies', label: 'Lượt sao chép nhiều nhất', icon: Copy },
        { id: 'plays', label: 'Lượt chơi nhiều nhất (Tổng)', icon: Play },
        { id: 'plays_solo', label: 'Lượt chơi Solo (Chơi 1 mình)', icon: Gamepad2 },
        { id: 'plays_multi', label: 'Lượt chơi Chung (Phòng)', icon: Users }
    ];

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

    const getTypeFilterLabel = (id) => {
        const item = typeOptions.find(o => o.id === id);
        return item ? item.label : id;
    };

    const getSortFilterLabel = (id) => {
        const item = sortOptions.find(o => o.id === id);
        return item ? item.label : id;
    };
    // Khởi động trực tiếp vào chế độ Solo - Thử thách tuần (Weekly Challenge)
    const handlePlayWeekly = (wSet, e) => {
        if (e) e.stopPropagation();
        const targetId = wSet?._id || '';
        const targetTitle = wSet?.title || 'Thử Thách Tuần';
        try {
            localStorage.setItem('apec_solo_launch', JSON.stringify({
                setId: targetId,
                setTitle: targetTitle,
                isWeekly: true,
                mode: 'solo',
                autoStart: true,
                timestamp: Date.now()
            }));
        } catch (err) {
            console.warn('Lỗi lưu apec_solo_launch:', err);
        }
        navigate(`/game?setId=${encodeURIComponent(targetId)}&isWeekly=true&mode=solo&autoStart=true`);
    };

    // Khởi động trực tiếp vào chế độ Solo - Bộ đề thông thường trong Thư viện
    const handlePlayRegular = (qSet, e) => {
        if (e) e.stopPropagation();
        const targetId = qSet?._id || '';
        const targetTitle = qSet?.title || 'Bộ Đề Tự Luyện';
        try {
            localStorage.setItem('apec_solo_launch', JSON.stringify({
                setId: targetId,
                setTitle: targetTitle,
                isWeekly: false,
                mode: 'solo',
                autoStart: true,
                timestamp: Date.now()
            }));
        } catch (err) {
            console.warn('Lỗi lưu apec_solo_launch:', err);
        }
        navigate(`/game?setId=${encodeURIComponent(targetId)}&isWeekly=false&mode=solo&autoStart=true`);
    };



    return (
        <div className="library-wrapper">
            {/* 1. NAVBAR DÙNG CHUNG ĐỒNG BỘ TOÀN HỆ THỐNG */}
            <Navbar activePage="library" />

            {/* 2. HERO SEARCH & FILTER WORKSPACE THEO PHONG CÁCH POSITIVUS */}
            <section className="library-hero">
                <div className="section-container">
                    <div className="positivus-section-header">
                        <span className="positivus-section-badge">Thư Viện Đề Thi</span>
                        <p className="positivus-section-desc">
                            Khám phá các bộ câu hỏi chính thức do <strong>APEC Group</strong> biên soạn cùng các đề thi chia sẻ từ cộng đồng giáo viên và học sinh trên toàn quốc.
                        </p>
                    </div>

                    {/* Thanh tìm kiếm, Nút Bộ lọc Nâng cao & Nút Tạo bộ đề mới */}
                    <div className="library-search-panel">
                        <div className="library-search-box">
                            <Search size={20} className="library-search-icon" />
                            <input 
                                type="text"
                                className="library-search-input"
                                placeholder="Tìm kiếm theo tiêu đề, chủ đề, môn học, tác giả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    className="btn-clear-search"
                                    onClick={() => setSearchTerm('')}
                                    title="Xóa tìm kiếm"
                                >
                                    <X size={17} />
                                </button>
                            )}
                        </div>

                        {/* NÚT BỘ LỌC TẬP HỢP TẤT CẢ TIÊU CHÍ */}
                        <button 
                            type="button"
                            className={`btn-library-filter-trigger ${activeFiltersCount > 0 ? 'has-active-filters' : ''}`}
                            onClick={() => setIsFilterModalOpen(true)}
                            title="Mở bộ lọc nâng cao (Tác giả, Chủ đề, Phân loại, Sắp xếp)"
                        >
                            <SlidersHorizontal size={18} />
                            <span>Bộ lọc</span>
                            {activeFiltersCount > 0 && (
                                <span className="filter-count-badge">{activeFiltersCount}</span>
                            )}
                        </button>

                        {/* Nút Tạo bộ đề mới */}
                        <button 
                            type="button"
                            className="btn-library-create-cta"
                            onClick={() => navigate(currentUser ? '/studio' : '/login')}
                            title="Vào Studio tạo bộ đề mới"
                        >
                            <FolderPlus size={19} />
                            <span>Tạo bộ đề mới</span>
                        </button>
                    </div>

                    {/* DẢI TAGS BỘ LỌC ĐANG ÁP DỤNG (ACTIVE FILTER PILLS) */}
                    {isSearchingOrFiltering && (
                        <div className="active-filters-bar">
                            <span className="active-filters-label">Đang lọc theo:</span>
                            <div className="active-chips-wrap">
                                {searchTerm && (
                                    <span className="filter-chip">
                                        <em>Từ khóa:</em> "{searchTerm}"
                                        <button type="button" onClick={() => setSearchTerm('')} title="Bỏ từ khóa">
                                            <X size={13} />
                                        </button>
                                    </span>
                                )}
                                {authorFilter && (
                                    <span className="filter-chip">
                                        <em>Tác giả:</em> {authorFilter}
                                        <button type="button" onClick={() => setAuthorFilter('')} title="Bỏ lọc tác giả">
                                            <X size={13} />
                                        </button>
                                    </span>
                                )}
                                {activeCategory !== 'Tất cả' && (
                                    <span className="filter-chip">
                                        <em>Môn:</em> {activeCategory}
                                        <button type="button" onClick={() => setActiveCategory('Tất cả')} title="Bỏ lọc môn">
                                            <X size={13} />
                                        </button>
                                    </span>
                                )}
                                {typeFilter !== 'all' && (
                                    <span className="filter-chip">
                                        <em>Loại:</em> {getTypeFilterLabel(typeFilter)}
                                        <button type="button" onClick={() => setTypeFilter('all')} title="Bỏ lọc phân loại">
                                            <X size={13} />
                                        </button>
                                    </span>
                                )}
                                {sortStat !== 'newest' && (
                                    <span className="filter-chip">
                                        <em>Xếp theo:</em> {getSortFilterLabel(sortStat)}
                                        <button type="button" onClick={() => setSortStat('newest')} title="Bỏ sắp xếp">
                                            <X size={13} />
                                        </button>
                                    </span>
                                )}

                                <button 
                                    type="button" 
                                    className="btn-clear-all-filters"
                                    onClick={handleResetFilters}
                                    title="Xóa tất cả bộ lọc và hoàn nguyên trạng thái ban đầu"
                                >
                                    <RotateCcw size={13} />
                                    <span>Đặt lại tất cả</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* MODAL / POPOVER BỘ LỌC NÂNG CAO */}
            {isFilterModalOpen && (
                <div className="filter-modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
                    <div className="filter-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-modal-header">
                            <div className="filter-modal-title-group">
                                <SlidersHorizontal size={20} />
                                <h3>Bộ Lọc Đề Thi Nâng Cao</h3>
                            </div>
                            <button 
                                type="button"
                                className="btn-close-filter-modal"
                                onClick={() => setIsFilterModalOpen(false)}
                                title="Đóng bộ lọc"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="filter-modal-body">
                            {/* A. FILTER THEO TÊN TÁC GIẢ KÈM AUTOCOMPLETE GỢI Ý */}
                            <div className="filter-section">
                                <label className="filter-section-title">
                                    <User size={16} />
                                    <span>a. Tác giả biên soạn (Gợi ý tự động)</span>
                                </label>
                                <div className="author-filter-input-wrap">
                                    <input 
                                        type="text"
                                        className="author-filter-input"
                                        placeholder="Nhập tên tác giả (VD: APEC Group, Đạt...)"
                                        value={authorFilter}
                                        onChange={(e) => setAuthorFilter(e.target.value)}
                                        onFocus={() => setAuthorInputFocus(true)}
                                    />
                                    {authorFilter && (
                                        <button 
                                            type="button" 
                                            className="btn-clear-author-input"
                                            onClick={() => setAuthorFilter('')}
                                            title="Xóa tên tác giả"
                                        >
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* Danh sách tên tác giả gợi ý gần nhất */}
                                {authorSuggestions.length > 0 && (
                                    <div className="author-suggestions-box">
                                        <span className="suggestions-label">Gợi ý tác giả có sẵn:</span>
                                        <div className="suggestions-list">
                                            {authorSuggestions.map((name) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    className={`suggestion-pill ${authorFilter.toLowerCase().trim() === name.toLowerCase().trim() ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setAuthorFilter(name);
                                                        setAuthorInputFocus(false);
                                                    }}
                                                >
                                                    <span>{name}</span>
                                                    {authorFilter.toLowerCase().trim() === name.toLowerCase().trim() && (
                                                        <Check size={12} />
                                                    )}
                                                </button>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* B. FILTER THEO CHỦ ĐỀ CÂU HỎI */}
                            <div className="filter-section">
                                <label className="filter-section-title">
                                    <BookOpen size={16} />
                                    <span>b. Chủ đề môn học</span>
                                </label>
                                <div className="filter-options-grid topic-grid">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            className={`filter-opt-btn ${activeCategory === cat ? 'active' : ''}`}
                                            onClick={() => setActiveCategory(cat)}
                                        >
                                            <span>{cat}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* C. FILTER XEM LÀ BỘ CÂU HỎI TUẦN, DEFAULT HAY USER TẠO */}
                            <div className="filter-section">
                                <label className="filter-section-title">
                                    <Layers size={16} />
                                    <span>c. Phân loại bộ câu hỏi</span>
                                </label>
                                <div className="filter-options-grid type-grid">
                                    {typeOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            className={`filter-opt-btn ${typeFilter === opt.id ? 'active' : ''}`}
                                            onClick={() => setTypeFilter(opt.id)}
                                        >
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* D. FILTER THEO SỐ LƯỢT THÍCH, COPY HOẶC SỐ LẦN CHƠI */}
                            <div className="filter-section">
                                <label className="filter-section-title">
                                    <Trophy size={16} />
                                    <span>d. Tiêu chí sắp xếp & Thống kê độ phổ biến</span>
                                </label>
                                <div className="filter-options-grid sort-grid">
                                    {sortOptions.map((sort) => {
                                        const IconComp = sort.icon;
                                        return (
                                            <button
                                                key={sort.id}
                                                type="button"
                                                className={`filter-opt-btn sort-opt-btn ${sortStat === sort.id ? 'active' : ''}`}
                                                onClick={() => setSortStat(sort.id)}
                                            >
                                                <IconComp size={15} />
                                                <span>{sort.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div className="filter-modal-footer">
                            <button 
                                type="button" 
                                className="btn-modal-reset"
                                onClick={handleResetFilters}
                            >
                                <RotateCcw size={15} />
                                <span>Đặt lại mặc định</span>
                            </button>
                            <button 
                                type="button" 
                                className="btn-modal-apply"
                                onClick={() => setIsFilterModalOpen(false)}
                            >
                                <Check size={16} />
                                <span>Áp dụng ({filteredSets.length} bộ đề)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. THỬ THÁCH ĐẤU TRÍ HÀNG TUẦN (WEEKLY CHALLENGES)
                CHỈ HIỂN THỊ KHI NGƯỜI CHƠI CHƯA TÌM KIẾM HOẶC LỌC (!isSearchingOrFiltering)
                KHI BẮT ĐẦU TÌM KIẾM / LỌC, PHẦN NÀY ĐƯỢC GỘP XUỐNG DƯỚI VÀ TUÂN THỦ HOÀN TOÀN THEO BỘ LỌC CỦA NGƯỜI DÙNG */}
            {!isSearchingOrFiltering && (
                <section className="library-weekly-section">
                    <div className="section-container">
                        <div className="positivus-section-header">
                            <span className="positivus-section-badge">Thử Thách Tuần</span>
                            <p className="positivus-section-desc">
                                Đấu trường trí tuệ theo thời gian thực - Chinh phục các câu hỏi đặc biệt để tích lũy điểm Tuần và ghi danh trên Bảng Xếp Hạng.
                            </p>
                            <Link to="/leaderboard" className="positivus-header-link">
                                <span>Bảng Xếp Hạng</span>
                                <ArrowUpRight size={17} />
                            </Link>
                        </div>

                        <div className="hero-weekly-bento-grid">
                            {(weeklySets.length > 0 ? weeklySets.slice(0, 4) : [
                                { _id: 'w1', weekNumber: 1, title: 'Vũ Trụ Bí Ẩn & Khoa Học Không Gian', topic: 'Thiên văn học', questionsCount: 8, authorName: 'APEC Group' },
                                { _id: 'w2', weekNumber: 2, title: 'Bí Ẩn Đại Dương & Đa Dạng Sinh Thái', topic: 'Sinh thái học', questionsCount: 8, authorName: 'APEC Group' },
                                { _id: 'w3', weekNumber: 3, title: 'Đấu Trí Trí Tuệ Nhân Tạo & Cách Mạng 4.0', topic: 'Công nghệ AI', questionsCount: 8, authorName: 'APEC Group' },
                                { _id: 'w4', weekNumber: 4, title: 'Đấu Trường Logic & Toán Ứng Dụng', topic: 'Toán học & Logic', questionsCount: 8, authorName: 'APEC Group' }
                            ]).map((wSet, index) => {
                                // Xen kẽ chuẩn bàn cờ [Xanh, Trắng, Trắng, Xanh]
                                const variants = ['blue', 'light', 'light', 'blue'];
                                const variant = variants[index % variants.length];
                                const qCount = wSet.questions?.length || wSet.questionsCount || 8;

                                return (
                                    <div 
                                        key={wSet._id || index} 
                                        className={`hero-bento-card variant-${variant}`}
                                        onClick={() => handlePlaySet(wSet._id)}
                                    >
                                        <div className="bento-card-top">
                                            <span className="bento-card-tag">{wSet.topic || 'Sự kiện'}</span>
                                            <span className="bento-card-topic">{qCount} câu hỏi • {wSet.authorName || 'APEC Group'}</span>
                                        </div>

                                        <div className="bento-title-wrapper">
                                            <h3 className="bento-title-group">
                                                {splitTitleLines(wSet.title).map((line, lIdx) => (
                                                    <span key={lIdx} className="bento-title-highlight">
                                                        {line}
                                                    </span>
                                                ))}
                                            </h3>
                                        </div>

                                        <div className="bento-art-container">
                                            {getBentoIllustration(wSet.topic, index, variant)}
                                        </div>

                                        <div className="bento-cta-wrapper">
                                            <button 
                                                type="button" 
                                                className="btn-bento-play-now"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlayWeekly(wSet, e);
                                                }}
                                                title="Luyện tập ngay"
                                            >
                                                <div className="bento-cta-circle">
                                                    <ArrowUpRight size={17} strokeWidth={2.5} />
                                                </div>
                                                <span className="bento-cta-label">Luyện tập</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. LƯỚI TẤT CẢ BỘ CÂU HỎI (2 BỘ ĐỀ TRÊN MỖI HÀNG, NÚT ANIMATION HOVER) */}
            <main className="library-main-content">
                <div className="section-container">
                    <div className="library-meta-bar">
                        <div className="meta-bar-left">
                            <span className="library-count-text">
                                Hiển thị <strong>{filteredSets.length}</strong> bộ câu hỏi 
                                {isSearchingOrFiltering ? ' (đã áp dụng bộ lọc nâng cao)' : ` trong danh mục "${activeCategory}"`}
                            </span>
                        </div>
                        <div className="meta-bar-right">
                            <Link to="/leaderboard" className="link-meta-leaderboard">
                                <Trophy size={16} />
                                <span>Bảng Xếp Hạng</span>
                            </Link>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="library-empty-state">
                            <div className="empty-icon-wrap">
                                <Layers size={32} />
                            </div>
                            <h3>Đang tải dữ liệu thư viện...</h3>
                        </div>
                    ) : filteredSets.length === 0 ? (
                        <div className="library-empty-state">
                            <div className="empty-icon-wrap">
                                <BookOpen size={32} />
                            </div>
                            <h3>Không tìm thấy bộ câu hỏi phù hợp</h3>
                            <p>
                                Hãy thử thay đổi từ khóa tìm kiếm, tên tác giả hoặc các tiêu chí trong <strong>Bộ lọc</strong>.
                            </p>
                            <button 
                                type="button"
                                className="btn-empty-reset" 
                                onClick={handleResetFilters}
                            >
                                <RotateCcw size={16} />
                                <span>Đặt lại toàn bộ bộ lọc</span>
                            </button>
                        </div>
                    ) : (
                        <div className="library-grid">
                            {filteredSets.map((qSet) => {
                                const isSaved = savedSets.includes(qSet._id);
                                const topicClass = getTopicBadgeClass(qSet.topic);
                                const authorInfo = getAuthorInfo(qSet, currentUser);
                                const isApecOfficial = authorInfo.isOfficial;
                                const ownerId = qSet.owner?._id || qSet.owner?.id || (typeof qSet.owner === 'string' ? qSet.owner : null);
                                const isMySet = Boolean(currentUser?._id && ownerId && String(currentUser._id) === String(ownerId));
                                const questionsCount = qSet.questions?.length ?? qSet.questionsCount ?? 10;
                                const totalPlays = qSet.playCount || ((qSet.playCountSolo || 0) + (qSet.playCountMultiplayer || 0));

                                return (
                                    <div 
                                        key={qSet._id} 
                                        className={`set-card ${isApecOfficial ? 'card-official-apec' : ''} ${qSet.isWeekly ? 'card-weekly-event' : ''}`}
                                    >
                                        <div className="set-card-content">
                                            {/* Header Tags & Nút Xóa (Icon gọn gàng, không cần chữ) */}
                                            <div className="set-card-header">
                                                <div className="badge-group-header">
                                                    {isApecOfficial && (
                                                        <span className="official-apec-badge">
                                                            <Star size={12} fill="currentColor" /> CHÍNH THỨC • APEC
                                                        </span>
                                                    )}
                                                    {qSet.isWeekly && (
                                                        <span className="weekly-apec-badge">
                                                            <Flame size={12} /> TUẦN {qSet.weekNumber || ''}
                                                        </span>
                                                    )}
                                                    <span className={`set-topic-badge ${topicClass}`}>
                                                        {qSet.topic || 'Khác'}
                                                    </span>
                                                    <span className="set-count-pill">
                                                        {questionsCount} câu
                                                    </span>

                                                    {/* Thống kê lượt chơi & sao chép trực quan */}
                                                    {totalPlays > 0 && (
                                                        <span className="set-stat-pill" title={`Tổng ${totalPlays} lượt chơi (Solo: ${qSet.playCountSolo || 0}, Phòng: ${qSet.playCountMultiplayer || 0})`}>
                                                            <Play size={11} fill="currentColor" /> {totalPlays}
                                                        </span>
                                                    )}
                                                    {(qSet.copyCount || 0) > 0 && (
                                                        <span className="set-stat-pill" title={`${qSet.copyCount} lần được sao chép`}>
                                                            <Copy size={11} /> {qSet.copyCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {canDelete(qSet.owner?._id || qSet.owner) && (
                                                    <button 
                                                        type="button"
                                                        className="btn-delete-card"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(qSet._id);
                                                        }}
                                                        title="Xóa bộ câu hỏi khỏi hệ thống"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                            </div>
                                                )}
                                            </div>

                                            {/* Tiêu đề bộ đề (Bấm để xem chi tiết) */}
                                            <h3 
                                                className="set-card-title"
                                                onClick={() => navigate(`/set/${qSet._id}`)}
                                                title="Bấm để xem chi tiết các câu hỏi trong bộ này"
                                            >
                                                {qSet.title}
                                            </h3>

                                            {/* Mô tả ngắn */}
                                            <p className="set-card-desc">
                                                {qSet.description || "Bộ câu hỏi trắc nghiệm chất lượng cao phục vụ rèn luyện và kiểm tra kiến thức toàn diện."}
                                            </p>

                                            {/* Tác giả bộ đề */}
                                            <div className="set-card-author">
                                                <div className={`author-avatar ${authorInfo.isOfficial ? 'author-avatar-apec' : ''} ${authorInfo.isAnonymous ? 'author-avatar-anon' : ''}`}>
                                                    {authorInfo.avatarImg ? (
                                                        <img src={authorInfo.avatarImg} alt={authorInfo.name} className="author-avatar-thumb" />
                                                    ) : (
                                                        authorInfo.avatarChar
                                                    )}
                                                </div>
                                                <span className="author-name">
                                                    Biên soạn: <strong className={authorInfo.isAnonymous ? 'author-anon-text' : ''}>{authorInfo.name}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action buttons (Rút gọn thành icon, hover mở rộng slide-in chữ theo animation Studio) */}
                                        <div className="set-card-actions">
                                            <div className="action-group-left">
                                                {/* Nút Thả tim */}
                                                <button 
                                                    type="button" 
                                                    className={`btn-library-action btn-action-like ${qSet.likesCount > 0 ? 'liked' : ''}`}
                                                    onClick={() => handleLike(qSet._id)}
                                                    title={`Thả tim (${qSet.likesCount || 0} lượt thích)`}
                                                >
                                                    <Heart size={15} fill={qSet.likesCount > 0 ? "#ef4444" : "none"} />
                                                    <span>{qSet.likesCount || 0} Thích</span>
                                                </button>
                                            </div>

                                                {/* Nút Lưu bộ đề (Ẩn nếu là chủ sở hữu) */}
                                                {!isMySet && (
                                                    <button 
                                                        type="button" 
                                                        className={`btn-library-action btn-action-save ${isSaved ? 'saved' : ''}`}
                                                        onClick={() => handleToggleLikeSet(qSet._id)}
                                                        title={isSaved ? "Đã lưu vào bộ sưu tập cá nhân" : "Lưu vào bộ sưu tập cá nhân"}
                                                    >
                                                        <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                                                        <span>{isSaved ? "Đã lưu" : "Lưu bộ"}</span>
                                                    </button>
                                            </div>
                                                )}

                                                {/* Nút Sao chép về Studio (Ẩn nếu là chủ sở hữu) */}
                                                {!isMySet && (
                                                    <button 
                                                        type="button" 
                                                        className="btn-library-action btn-action-copy"
                                                        onClick={() => handleCopySet(qSet._id)}
                                                        title="Sao chép bộ đề này về Studio của bạn (kèm hậu tố -copy)"
                                                    >
                                                        <Copy size={15} />
                                                        <span>Sao chép</span>
                                                    </button>
                                            </div>
                                                )}

                                                {/* Nút Chơi ngay trong Game */}
                                                <button 
                                                    type="button" 
                                                    className="btn-library-action btn-action-play"
                                                    onClick={(e) => handlePlayRegular(qSet, e)}
                                                    title="Luyện tập ngay bộ đề này trong game"
                                                >
                                                    <Play size={14} fill="currentColor" />
                                                    <span>Luyện tập</span>
                                                </button>
                                            </div>

                                            </div>

                                            <div className="action-group-right">
                                                {/* Nút Xuất Excel */}
                                                <button 
                                                    type="button" 
                                                    className="btn-library-action btn-action-excel"
                                                    onClick={() => handleExport(qSet._id, 'excel')}
                                                    title="Tải về file Excel (.xlsx)"
                                                >
                                                    <FileSpreadsheet size={15} />
                                                    <span>Xuất Excel</span>
                                                </button>
                                            </div>

                                                {/* Nút Xuất PDF */}
                                                <button 
                                                    type="button" 
                                                    className="btn-library-action btn-action-pdf"
                                                    onClick={() => handleExport(qSet._id, 'pdf')}
                                                    title="Tải về file tài liệu PDF"
                                                >
                                                    <FileText size={15} />
                                                    <span>Xuất PDF</span>
                                                </button>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LibraryPage;
