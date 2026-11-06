import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPageLogic } from '../pages_logic/AdminPageLogic';
import '../pages_styling/AdminPageStyling.css';
import {
    ShieldCheck,
    AlertTriangle,
    Flag,
    FolderArchive,
    Settings,
    Trash2,
    CheckCircle2,
    Search,
    ArrowLeft,
    Layers,
    HelpCircle
} from 'lucide-react';

const AdminPage = () => {
    const {
        activeTab,
        setActiveTab,
        reportedSets,
        reportedQuestions,
        pendingReportsCount,
        allQuestionSets,
        allQuestions,
        contentSubTab,
        setContentSubTab,
        searchTerm,
        setSearchTerm,
        currentVersion,
        newVersion,
        setNewVersion,
        handleUpdateVersion,
        deleteTarget,
        deleteReason,
        setDeleteReason,
        isDeleting,
        openDeleteModal,
        closeDeleteModal,
        executeDelete,
        dismissTarget,
        dismissReason,
        setDismissReason,
        isDismissing,
        openDismissModal,
        closeDismissModal,
        executeDismiss,
        filteredQuestionSets,
        filteredQuestions
    } = AdminPageLogic();

    return (
        <div className="admin-dash-root">
            <div className="admin-dash-container">
                {/* 1. TOP NAVIGATION & BADGES */}
                <header className="admin-dash-top-nav">
                    <div className="admin-dash-back-group">
                        <Link to="/game" className="admin-nav-btn">
                            <ArrowLeft size={16} /> Quay lại Game
                        </Link>
                        <Link to="/" className="admin-nav-btn">
                            <ArrowLeft size={16} /> Trang chủ
                        </Link>
                        <Link to="/school-requests/admin" className="admin-nav-btn">
                            School Requests
                        </Link>
                        <Link to="/admin/schools" className="admin-nav-btn">
                            School Communities
                        </Link>
                    </div>

                    <div className="admin-role-badge">
                        <ShieldCheck size={18} />
                        <span>QUẢN TRỊ VIÊN HỆ THỐNG</span>
                    </div>
                </header>

                {/* 2. HERO BANNER & HUD STATS */}
                <section className="admin-dash-hero">
                    <div className="admin-dash-hero-info">
                        <div className="admin-dash-tag">
                            <ShieldCheck size={14} /> Trung tâm Giám sát & Kiểm duyệt
                        </div>
                        <h1>Bảng Điều Khiển Quản Trị Hệ Thống</h1>
                        <p>
                            Giám sát an toàn cộng đồng, xử lý các báo cáo vi phạm nội dung và quản lý toàn bộ kho đề thi, câu hỏi trắc nghiệm trên toàn hệ thống.
                        </p>
                    </div>

                    <div className="admin-dash-hud-stats">
                        <div className={`admin-dash-hud-pill ${pendingReportsCount > 0 ? 'alert' : ''}`}>
                            <div className="admin-dash-hud-num">{pendingReportsCount}</div>
                            <div className="admin-dash-hud-lbl">Báo cáo chờ xử lý</div>
                        </div>

                        <div className="admin-dash-hud-pill">
                            <div className="admin-dash-hud-num">{allQuestionSets.length}</div>
                            <div className="admin-dash-hud-lbl">Tổng bộ câu hỏi</div>
                        </div>

                        <div className="admin-dash-hud-pill">
                            <div className="admin-dash-hud-num">{allQuestions.length}</div>
                            <div className="admin-dash-hud-lbl">Tổng câu hỏi</div>
                        </div>

                        <div className="admin-dash-hud-pill">
                            <div className="admin-dash-hud-num">{currentVersion}</div>
                            <div className="admin-dash-hud-lbl">Phiên bản Game</div>
                        </div>
                    </div>
                </section>

                {/* 3. TABS NAVIGATION */}
                <nav className="admin-tabs-bar">
                    <button 
                        type="button" 
                        className={`admin-tab-btn ${activeTab === 'reported' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reported')}
                    >
                        <Flag size={18} />
                        <span>Cần Kiểm Duyệt & Bị Báo Cáo</span>
                        {pendingReportsCount > 0 ? (
                            <span className="admin-tab-badge badge-danger">{pendingReportsCount}</span>
                        ) : (
                            <span className="admin-tab-badge badge-count">0</span>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className={`admin-tab-btn ${activeTab === 'all_content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all_content')}
                        title="Ẩn các nội dung thông thường vào tab riêng này theo yêu cầu"
                    >
                        <FolderArchive size={18} />
                        <span>Kho Nội Dung Toàn Bộ Hệ Thống</span>
                        <span className="admin-tab-badge badge-count">
                            {allQuestionSets.length + allQuestions.length}
                        </span>
                    </button>

                    <button 
                        type="button" 
                        className={`admin-tab-btn ${activeTab === 'game_settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('game_settings')}
                    >
                        <Settings size={18} />
                        <span>Cấu Hình Game ({currentVersion})</span>
                    </button>
                </nav>

                {/* ==================================================================
                   TAB 1: MÀN HÌNH CHÍNH - CHỈ HIỆN CÁC MỤC BỊ BÁO CÁO (REPORTED ITEMS)
                   ================================================================== */}
                {activeTab === 'reported' && (
                    <section className="admin-section">
                        <div className="admin-section-header">
                            <h2>
                                <AlertTriangle size={22} color="#ef4444" />
                                <span>Hàng Đợi Nội Dung Bị Báo Cáo Vi Phạm ({pendingReportsCount})</span>
                            </h2>
                        </div>

                        {reportedSets.length === 0 && reportedQuestions.length === 0 ? (
                            /* EMPTY STATE: HỆ THỐNG TRONG SẠCH */
                            <div className="admin-empty-state">
                                <div className="admin-empty-icon">
                                    <ShieldCheck size={36} />
                                </div>
                                <h3>Hệ thống hoàn toàn trong sạch!</h3>
                                <p>
                                    Hiện tại không có bộ câu hỏi hay câu hỏi nào bị người dùng báo cáo vi phạm. Tất cả nội dung đang hoạt động ổn định và an toàn.
                                </p>
                                <button 
                                    type="button"
                                    className="admin-nav-btn"
                                    style={{ margin: '0 auto' }}
                                    onClick={() => setActiveTab('all_content')}
                                >
                                    <FolderArchive size={16} /> Xem kho nội dung hệ thống
                                </button>
                            </div>
                        ) : (
                            /* DANH SÁCH BỘ ĐỀ VÀ CÂU HỎI BỊ BÁO CÁO */
                            <div className="admin-reports-grid">
                                {/* A. CÁC BỘ CÂU HỎI BỊ BÁO CÁO */}
                                {reportedSets.map((qSet) => {
                                    const latestReport = qSet.reports && qSet.reports.length > 0 ? qSet.reports[0] : null;
                                    return (
                                        <div key={qSet._id} className="admin-report-card border-danger">
                                            <div className="admin-report-card-header">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span className="admin-report-type-badge set">
                                                        <Layers size={13} /> Bộ câu hỏi
                                                    </span>
                                                    <span className="admin-report-count-badge">
                                                        <AlertTriangle size={13} /> {qSet.reports?.length || 1} báo cáo vi phạm
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    ID: <code>{qSet._id}</code>
                                                </span>
                                            </div>

                                            <div className="admin-report-card-body">
                                                <div className="admin-report-target-box">
                                                    <h3 className="admin-report-target-title">
                                                        {qSet.title}
                                                    </h3>
                                                    <div className="admin-report-target-meta">
                                                        <span>Chủ đề: <strong>{qSet.topic || 'Khác'}</strong></span>
                                                        <span>Tác giả: <strong>{qSet.authorName || qSet.owner?.displayName || qSet.owner?.username || 'APEC Group'}</strong></span>
                                                        <span>Số câu: <strong>{qSet.questions?.length || 0} câu</strong></span>
                                                        <span>Trạng thái: <strong>{qSet.isPublic ? 'Công khai' : 'Riêng tư'}</strong></span>
                                                    </div>
                                                </div>

                                                {/* DANH SÁCH CHI TIẾT CÁC LẦN REPORT */}
                                                <div className="admin-report-details-box">
                                                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                                        Chi tiết khiếu nại từ người dùng:
                                                    </span>
                                                    {(qSet.reports || []).map((rep) => (
                                                        <div key={rep._id} className="admin-report-sub-item">
                                                            <div className="admin-report-sub-header">
                                                                <span className="admin-report-reason-tag">
                                                                    <AlertTriangle size={12} /> {rep.reason}
                                                                </span>
                                                                <span>
                                                                    Bởi: <strong>{rep.reporterName || 'Ẩn danh'}</strong> • {new Date(rep.createdAt).toLocaleString('vi-VN')}
                                                                </span>
                                                            </div>
                                                            {rep.description ? (
                                                                <p className="admin-report-desc-text">
                                                                    "{rep.description}"
                                                                </p>
                                                            ) : (
                                                                <p className="admin-report-desc-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                                    (Không có mô tả chi tiết kèm theo)
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="admin-report-card-actions">
                                                <button 
                                                    type="button" 
                                                    className="btn-admin-dismiss"
                                                    onClick={() => openDismissModal(latestReport || { _id: qSet._id, targetType: 'QuestionSet', targetId: qSet._id, targetTitle: qSet.title })}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    <span>Bác bỏ báo cáo (Hợp lệ)</span>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn-admin-delete"
                                                    onClick={() => openDeleteModal(qSet, 'QuestionSet', latestReport?._id)}
                                                >
                                                    <Trash2 size={16} />
                                                    <span>Xóa bộ đề vi phạm</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* B. CÁC CÂU HỎI BỊ BÁO CÁO */}
                                {reportedQuestions.map((q) => {
                                    const latestReport = q.reports && q.reports.length > 0 ? q.reports[0] : null;
                                    return (
                                        <div key={q._id} className="admin-report-card border-danger">
                                            <div className="admin-report-card-header">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span className="admin-report-type-badge question">
                                                        <HelpCircle size={13} /> Câu hỏi đơn lẻ
                                                    </span>
                                                    <span className="admin-report-count-badge">
                                                        <AlertTriangle size={13} /> {q.reports?.length || 1} báo cáo vi phạm
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    ID: <code>{q._id}</code>
                                                </span>
                                            </div>

                                            <div className="admin-report-card-body">
                                                <div className="admin-report-target-box">
                                                    <h3 className="admin-report-target-title">
                                                        {q.questionText}
                                                    </h3>
                                                    <div className="admin-report-target-meta">
                                                        <span>Chủ đề: <strong>{q.topic || 'Khác'}</strong></span>
                                                        <span>Đáp án đúng: <strong style={{ color: '#16a34a' }}>{q.correctAnswer}</strong></span>
                                                        <span>Các phương án: <strong>{Array.isArray(q.options) ? q.options.join(' | ') : ''}</strong></span>
                                                    </div>
                                                </div>

                                                <div className="admin-report-details-box">
                                                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>
                                                        Chi tiết khiếu nại từ người dùng:
                                                    </span>
                                                    {(q.reports || []).map((rep) => (
                                                        <div key={rep._id} className="admin-report-sub-item">
                                                            <div className="admin-report-sub-header">
                                                                <span className="admin-report-reason-tag">
                                                                    <AlertTriangle size={12} /> {rep.reason}
                                                                </span>
                                                                <span>
                                                                    Bởi: <strong>{rep.reporterName || 'Ẩn danh'}</strong> • {new Date(rep.createdAt).toLocaleString('vi-VN')}
                                                                </span>
                                                            </div>
                                                            {rep.description ? (
                                                                <p className="admin-report-desc-text">
                                                                    "{rep.description}"
                                                                </p>
                                                            ) : (
                                                                <p className="admin-report-desc-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                                    (Không có mô tả chi tiết kèm theo)
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="admin-report-card-actions">
                                                <button 
                                                    type="button" 
                                                    className="btn-admin-dismiss"
                                                    onClick={() => openDismissModal(latestReport || { _id: q._id, targetType: 'Question', targetId: q._id, targetTitle: q.questionText })}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    <span>Bác bỏ báo cáo (Hợp lệ)</span>
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn-admin-delete"
                                                    onClick={() => openDeleteModal(q, 'Question', latestReport?._id)}
                                                >
                                                    <Trash2 size={16} />
                                                    <span>Xóa câu hỏi vi phạm</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* ==================================================================
                   TAB 2: KHO NỘI DUNG HỆ THỐNG (TAB RIÊNG ẨN TẤT CẢ NỘI DUNG BÌNH THƯỜNG)
                   ================================================================== */}
                {activeTab === 'all_content' && (
                    <section className="admin-section">
                        <div className="admin-content-sub-nav">
                            <div className="admin-sub-toggle-group">
                                <button 
                                    type="button"
                                    className={`admin-sub-btn ${contentSubTab === 'sets' ? 'active' : ''}`}
                                    onClick={() => setContentSubTab('sets')}
                                >
                                    <Layers size={15} /> Bộ câu hỏi ({allQuestionSets.length})
                                </button>
                                <button 
                                    type="button"
                                    className={`admin-sub-btn ${contentSubTab === 'questions' ? 'active' : ''}`}
                                    onClick={() => setContentSubTab('questions')}
                                >
                                    <HelpCircle size={15} /> Câu hỏi ({allQuestions.length})
                                </button>
                            </div>

                            <div className="admin-search-box">
                                <Search size={16} color="var(--text-secondary)" />
                                <input 
                                    type="text" 
                                    placeholder={contentSubTab === 'sets' ? "Tìm theo tên bộ đề, chủ đề, tác giả..." : "Tìm nội dung câu hỏi..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {contentSubTab === 'sets' ? (
                            /* BẢNG BỘ CÂU HỎI */
                            <div className="admin-table-card">
                                <div className="admin-table-wrap">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tên Bộ Đề</th>
                                                <th>Chủ Đề</th>
                                                <th>Tác Giả</th>
                                                <th>Số Câu</th>
                                                <th>Lượt Chơi</th>
                                                <th>Trạng Thái</th>
                                                <th>Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredQuestionSets.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                                                        Không tìm thấy bộ câu hỏi nào phù hợp với từ khóa "{searchTerm}".
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredQuestionSets.map(set => (
                                                    <tr key={set._id}>
                                                        <td className="admin-table-id">{set._id.slice(-6)}</td>
                                                        <td>
                                                            <div className="admin-table-title">{set.title}</div>
                                                            {set.description && <div className="admin-table-sub">{set.description.slice(0, 60)}...</div>}
                                                        </td>
                                                        <td>
                                                            <span className="admin-report-type-badge set">{set.topic || 'Khác'}</span>
                                                        </td>
                                                        <td>{set.authorName || set.owner?.displayName || set.owner?.username || 'APEC Group'}</td>
                                                        <td>{set.questions?.length || 0}</td>
                                                        <td>{set.playCount || 0}</td>
                                                        <td>
                                                            {set.isDefault ? (
                                                                <span style={{ color: '#2563eb', fontWeight: 800 }}>Chính thức</span>
                                                            ) : set.isPublic ? (
                                                                <span style={{ color: '#16a34a', fontWeight: 700 }}>Công khai</span>
                                                            ) : (
                                                                <span style={{ color: 'var(--text-secondary)' }}>Riêng tư</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button 
                                                                type="button" 
                                                                className="btn-admin-delete"
                                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                onClick={() => openDeleteModal(set, 'QuestionSet')}
                                                            >
                                                                <Trash2 size={13} /> Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            /* BẢNG CÂU HỎI ĐƠN LẺ */
                            <div className="admin-table-card">
                                <div className="admin-table-wrap">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nội Dung Câu Hỏi</th>
                                                <th>Chủ Đề</th>
                                                <th>Phương Án & Đáp Án Đúng</th>
                                                <th>Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredQuestions.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px' }}>
                                                        Không tìm thấy câu hỏi nào phù hợp với từ khóa "{searchTerm}".
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredQuestions.map(q => (
                                                    <tr key={q._id}>
                                                        <td className="admin-table-id">{q._id.slice(-6)}</td>
                                                        <td>
                                                            <div className="admin-table-title">{q.questionText}</div>
                                                        </td>
                                                        <td>
                                                            <span className="admin-report-type-badge question">{q.topic || 'Khác'}</span>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                                {Array.isArray(q.options) ? q.options.join(' | ') : ''}
                                                            </div>
                                                            <div style={{ fontSize: '12.5px', color: '#16a34a', fontWeight: 800, marginTop: '2px' }}>
                                                                ✓ {q.correctAnswer}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                type="button" 
                                                                className="btn-admin-delete"
                                                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                                                onClick={() => openDeleteModal(q, 'Question')}
                                                            >
                                                                <Trash2 size={13} /> Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* ==================================================================
                   TAB 3: CẤU HÌNH PHIÊN BẢN GAME
                   ================================================================== */}
                {activeTab === 'game_settings' && (
                    <section className="admin-section">
                        <div className="admin-version-card">
                            <h2 style={{ margin: '0 0 16px 0', fontSize: '22px' }}>
                                🚀 Quản Lý Phiên Bản Game WebGL
                            </h2>
                            <div className="admin-version-current">
                                Phiên bản hiện tại đang hoạt động: <span className="admin-version-highlight">{currentVersion}</span>
                            </div>

                            <div className="admin-version-input-row">
                                <input 
                                    className="admin-version-input"
                                    placeholder="Nhập tên folder mới (VD: v1.1, v2.0)..." 
                                    value={newVersion}
                                    onChange={(e) => setNewVersion(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    className="admin-nav-btn"
                                    style={{ 
                                        backgroundColor: 'var(--positivus-cyan, #b9fbc0)', 
                                        color: 'var(--positivus-dark, #191a23)', 
                                        padding: '12px 24px',
                                        fontSize: '14px'
                                    }}
                                    onClick={handleUpdateVersion}
                                >
                                    Cập nhật ngay
                                </button>
                            </div>

                            <p className="admin-version-note">
                                💡 <strong>Lưu ý:</strong> Đảm bảo bạn đã xuất bản build Godot và đưa thư mục tương ứng vào <code>client/public/game/{'{newVersion}'}</code> trước khi chuyển đổi phiên bản hệ thống.
                            </p>
                        </div>
                    </section>
                )}
            </div>

            {/* ==================================================================
               MODAL KỶ LUẬT NỘI DUNG (XÓA BÀI & LƯU LÝ DO)
               ================================================================== */}
            {deleteTarget && (
                <div className="admin-modal-backdrop" onClick={closeDeleteModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div className="admin-modal-icon-badge">
                                <Trash2 size={22} />
                            </div>
                            <div>
                                <h3>Kỷ Luật & Xóa Nội Dung</h3>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Hành động này sẽ xóa vĩnh viễn nội dung khỏi DB và lưu lý do kiểm duyệt.
                                </span>
                            </div>
                        </div>

                        <div className="admin-modal-target-box">
                            <strong>Nội dung chuẩn bị xóa:</strong>
                            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                "{deleteTarget.item.title || deleteTarget.item.questionText}"
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 800 }}>
                                Lý do xóa (Bắt buộc lưu vết kiểm duyệt):
                            </label>
                            <textarea 
                                className="admin-modal-textarea"
                                placeholder="Nhập lý do xóa (VD: Chứa ngôn từ đả kích, nội dung sai lệch...)"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                            />
                        </div>

                        <div className="admin-modal-actions">
                            <button 
                                type="button" 
                                className="btn-admin-dismiss"
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="button" 
                                className="btn-admin-delete"
                                onClick={executeDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Đang thực thi...' : 'Thực thi Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================================================================
               MODAL BÁC BỎ BÁO CÁO (ĐÁNH DẤU NỘI DUNG HỢP LỆ)
               ================================================================== */}
            {dismissTarget && (
                <div className="admin-modal-backdrop" onClick={closeDismissModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <div className="admin-modal-icon-badge" style={{ background: '#dcfce7', borderColor: '#22c55e', color: '#15803d' }}>
                                <CheckCircle2 size={22} />
                            </div>
                            <div>
                                <h3>Bác Bỏ Báo Cáo Vi Phạm</h3>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Đánh dấu nội dung là hợp lệ và gỡ bỏ khiếu nại khỏi hàng đợi.
                                </span>
                            </div>
                        </div>

                        <div className="admin-modal-target-box">
                            <strong>Nội dung được giữ lại:</strong>
                            <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                "{dismissTarget.targetTitle || 'Nội dung được báo cáo'}"
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 800 }}>
                                Ghi chú kiểm duyệt:
                            </label>
                            <textarea 
                                className="admin-modal-textarea"
                                placeholder="Nhập ghi chú (VD: Nội dung hoàn toàn hợp lệ, không vi phạm tiêu chuẩn cộng đồng...)"
                                value={dismissReason}
                                onChange={(e) => setDismissReason(e.target.value)}
                            />
                        </div>

                        <div className="admin-modal-actions">
                            <button 
                                type="button" 
                                className="btn-admin-dismiss"
                                onClick={closeDismissModal}
                                disabled={isDismissing}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="button" 
                                className="admin-nav-btn"
                                style={{ backgroundColor: '#22c55e', color: '#ffffff', borderColor: '#16a34a' }}
                                onClick={executeDismiss}
                                disabled={isDismissing}
                            >
                                {isDismissing ? 'Đang xử lý...' : 'Xác nhận Hợp lệ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
