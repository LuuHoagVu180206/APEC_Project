import React from 'react';
import { StudioPageLogic } from '../pages_logic/StudioPageLogic';
const StudioPage = () => {

    const {
        navigate, currentUser, questions, formData, setFormData,
        mySets, questionSetFormData, setQuestionSetFormData, savedSetsData,
        handleCreateSet, handleCreateQuestion, handleAddToSet, handleDeleteSet,
        handleDeleteQuestion, handleRemoveSavedSet, handleExport
    } = StudioPageLogic();

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
      <button onClick={() => navigate('/game')} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>⬅ Quay lại Game</button>
      <h1 style={{ textAlign: 'center', color: '#2ecc71' }}>Bộ quản lý câu hỏi của {currentUser?.username}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* ================= KHU VỰC 1: BỘ CÂU HỎI ================= */}
            <div>
                <div style={{ background: '#e8f4f8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ color: '#2980b9', marginTop: 0 }}> Tạo Bộ Câu Hỏi Mới</h3>
                    <form onSubmit={handleCreateSet} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input 
                            required 
                            placeholder="Tên bộ câu hỏi (VD: Toán lớp 10)" 
                            value={questionSetFormData.title} 
                            onChange={(e) => setQuestionSetFormData({...questionSetFormData, title: e.target.value})} 
                            style={{ padding: '8px' }} 
                        />
                        <textarea 
                            placeholder="Mô tả ngắn gọn..." 
                            value={questionSetFormData.description} 
                            onChange={(e) => setQuestionSetFormData({...questionSetFormData, description: e.target.value})} 
                            style={{ padding: '8px', minHeight: '60px' }} 
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={questionSetFormData.isPublic} 
                                onChange={(e) => setQuestionSetFormData({...questionSetFormData, isPublic: e.target.checked})} 
                            />
                            Công khai lên Thư viện cộng đồng
                        </label>
                        <button type="submit" style={{ padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Tạo Bộ</button>
                    </form>
                </div>
            </div>
            <h3>Bộ câu hỏi của bạn ({mySets.length})</h3>
            {mySets.map((set) => (
        <div key={set._id} style={{ background: 'white', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
            
            {/* Khung cha: Đẩy 2 cụm ra 2 đầu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* CỤM BÊN TRÁI: Tiêu đề & Trạng thái */}
                <div>
                    <h3 style={{ margin: 0, color: '#2c3e50' }}>{set.title}</h3>
                    <div style={{ fontSize: '13px', color: '#7f8c8d', marginTop: '5px' }}>
                        {set.isPublic ? "🌐 Công khai" : "🔒 Riêng tư"}
                    </div>
                </div>

                {/* CỤM BÊN PHẢI: Gói tất cả các nút vào đây và dùng 'gap' để kéo chúng lại gần nhau */}
                <div style={{ display: 'flex', gap: '8px' }}> 
                    
                    <button 
                        onClick={() => navigate(`/set/${set._id}`)}
                        style={{ background: '#3498db', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Xem bộ
                    </button>
                    
                    <button 
                        onClick={() => handleExport(set._id, 'excel')}
                        style={{ background: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Excel
                    </button>
                    
                    <button 
                        onClick={() => handleExport(set._id, 'pdf')}
                        style={{ background: '#c0392b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        PDF
                    </button>

                    <button 
                        onClick={() => handleDeleteSet(set._id)}
                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Xóa
                    </button>

                </div>
                
            </div>
        </div>
            ))}

        {/* ================= KHU VỰC 2: CÂU HỎI LẺ ================= */}
        <div>
            <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ color: '#27ae60', marginTop: 0 }}> Thêm Câu Hỏi Mới</h3>
                <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input required name="questionText" placeholder="Nội dung câu hỏi..." value={formData.questionText} onChange={(e) => setFormData({...formData, questionText: e.target.value})} style={{ padding: '8px' }} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input required name="optionA" placeholder="Đáp án A" value={formData.optionA} onChange={(e) => setFormData({...formData, optionA: e.target.value})} style={{ padding: '8px' }} />
                        <input required name="optionB" placeholder="Đáp án B" value={formData.optionB} onChange={(e) => setFormData({...formData, optionB: e.target.value})} style={{ padding: '8px' }} />
                        <input required name="optionC" placeholder="Đáp án C" value={formData.optionC} onChange={(e) => setFormData({...formData, optionC: e.target.value})} style={{ padding: '8px' }} />
                        <input required name="optionD" placeholder="Đáp án D" value={formData.optionD} onChange={(e) => setFormData({...formData, optionD: e.target.value})} style={{ padding: '8px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select name="correctAnswer" value={formData.correctAnswer} onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})} style={{ padding: '5px', flex: 1 }}>
                            <option value="A">Đúng: A</option>
                            <option value="B">Đúng: B</option>
                            <option value="C">Đúng: C</option>
                            <option value="D">Đúng: D</option>
                        </select>
                        <select name="difficulty" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})} style={{ padding: '5px', flex: 1 }}>
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                        </select>
                    </div>

                    <button type="submit" style={{ padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Lưu Câu Hỏi</button>
                </form>
            </div>

            <h3>Câu hỏi bạn đã tạo ({questions.length})</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {questions.map((q, index) => (
                <div key={q._id} style={{ background: '#fff', border: '1px solid #ddd', padding: '10px', marginBottom: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <strong>Câu {index + 1}: {q.questionText}</strong>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>Đúng: {q.correctAnswer}</div>
                        </div>
                        
                        {/* KHU VỰC NÚT BẤM (Cập nhật mới) */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            
                            {/* Menu chọn bộ câu hỏi */}
                            <select 
                                defaultValue=""
                                onChange={(e) => {
                                    handleAddToSet(q._id, e.target.value);
                                    e.target.value = ""; // Reset lại menu về mặc định sau khi chọn xong
                                }}
                                style={{ padding: '4px', fontSize: '12px', borderRadius: '3px', border: '1px solid #ccc', cursor: 'pointer' }}
                            >
                                <option value="" disabled>➕ Thêm vào bộ...</option>
                                {mySets.map(set => (
                                    <option key={set._id} value={set._id}>📦 {set.title}</option>
                                ))}
                            </select>

                            {/* Nút xóa giữ nguyên */}
                            <button onClick={() => handleDeleteQuestion(q._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>
                                Xóa
                            </button>
                        </div>

                    </div>
                ))}
            </div>
            
            <h3 style={{ marginTop: '30px', color: '#e67e22' }}>Bộ câu hỏi đã lưu ({savedSetsData.length})</h3>
            {savedSetsData.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#7f8c8d' }}>Bạn chưa lưu bộ câu hỏi nào từ thư viện.</p>
            ) : (
                savedSetsData.map((set) => (
                    <div key={set._id} style={{ background: '#fef9e7', border: '1px dashed #f39c12', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <strong style={{ color: '#d35400' }}>🔖 {set.title}</strong>
                                <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '5px 0' }}>
                                    Tác giả: {set.owner?.username || "Ẩn danh"}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleRemoveSavedSet(set._id)} 
                                style={{ background: 'white', color: '#e74c3c', border: '1px solid #e74c3c', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                ✖ Bỏ lưu
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
    );
};

export default StudioPage;