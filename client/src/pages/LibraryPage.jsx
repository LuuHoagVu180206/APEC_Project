import React from 'react';
import { LibraryPageLogic } from '../pages_logic/LibraryPageLogic';

const LibraryPage = () => {
    const {
        navigate, currentUser, searchTerm, setSearchTerm, 
        savedSets, filteredSets, canDelete, handleLike, 
        handleToggleLikeSet, handleDelete, handleExport
    } = LibraryPageLogic();

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '8px 15px', cursor: 'pointer' }}>⬅ Quay lại</button>
                <h1 style={{ color: '#2c3e50', margin: 0 }}>📚 Thư Viện Cộng Đồng</h1>
                
                {currentUser ? (
                    <button onClick={() => navigate('/studio')} style={{ padding: '8px 15px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Quản lý câu hỏi</button>
                ) : (
                    <button onClick={() => navigate('/login')} style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Đăng nhập</button>
                )}
            </div>

            {/* THANH TÌM KIẾM */}
            <div style={{ marginBottom: '30px' }}>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm tên bộ câu hỏi..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
                />
            </div>

            {/* DANH SÁCH BỘ CÂU HỎI */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                {filteredSets.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Không tìm thấy bộ câu hỏi nào.</p>
                ) : (
                    filteredSets.map((qSet) => (
                        <div key={qSet._id} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#34495e' }}>{qSet.title}</h3>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#3498db', textTransform: 'uppercase', marginBottom: '5px', display: 'inline-block' }}>
                                        🏷️ CHỦ ĐỀ: {qSet.topic || 'KHÁC'}
                                    </span>
                                    <p style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px' }}>{qSet.description || "Không có mô tả"}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#95a5a6' }}>Tác giả: {qSet.owner?.username || "Ẩn danh"}</p>
                                </div>
                                
                                {canDelete(qSet.owner?._id || qSet.owner) && (
                                    <button onClick={() => handleDelete(qSet._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
                                        🗑 Xóa
                                    </button>
                                )}
                            </div>

                            <hr style={{ border: '0.5px solid #f1f2f6', margin: '15px 0' }} />

                            {/* THANH TƯƠNG TÁC (Like & Export) */}
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <button 
                                    onClick={() => handleLike(qSet._id)} 
                                    style={{ background: 'none', border: '1px solid #ff4757', color: '#ff4757', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ❤️ {qSet.likesCount} Thích
                                </button>
                                
                                <button 
                                    onClick={() => handleToggleLikeSet(qSet._id)} 
                                    style={{ 
                                        background: savedSets.includes(qSet._id) ? '#3498db' : 'none', 
                                        border: '1px solid #3498db', 
                                        color: savedSets.includes(qSet._id) ? 'white' : '#3498db', 
                                        padding: '6px 15px', 
                                        borderRadius: '20px', 
                                        cursor: 'pointer', 
                                        fontWeight: 'bold' 
                                    }}
                                >
                                    {savedSets.includes(qSet._id) ? '🏷️ Đã lưu' : '🔖 Lưu bộ'}
                                </button>
                                
                                <span style={{ color: '#ccc' }}>|</span>

                                <button onClick={() => handleExport(qSet._id, 'excel')} style={{ background: '#2ed573', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
                                    📥 Excel
                                </button>
                                <button onClick={() => handleExport(qSet._id, 'pdf')} style={{ background: '#ff6348', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>
                                    📥 PDF
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default LibraryPage;