import React from 'react';
import { StudioPageLogic } from '../pages_logic/StudioPageLogic';
import { useDarkMode } from '../pages_logic/useDarkMode';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import '../pages_styling/StudioPageStyling.css';

const StudioPage = () => {
    const {
        navigate, currentUser, questions, formData, setFormData,
        mySets, questionSetFormData, setQuestionSetFormData, savedSetsData,
        handleCreateSet, handleCreateQuestion, handleAddToSet, handleDeleteSet,
        handleDeleteQuestion, handleRemoveSavedSet, handleExport
    } = StudioPageLogic();

    const { isDark, toggleTheme } = useDarkMode();

    return (
        <div className="studio-wrapper">
            {/* NAVBAR DÙNG CHUNG */}
            <nav className="navbar">
                <div className="nav-left">
                    <h2 className="logo" onClick={() => navigate('/Landing')} style={{ cursor: 'pointer' }}>EasyLearn</h2>
                    <button className="btn-icon" onClick={toggleTheme}>
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
                <div className="nav-right">
                    <button className="btn-secondary" onClick={() => navigate('/game')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
                        <ArrowLeft size={18} /> Về Game
                    </button>
                </div>
            </nav>

            <div className="studio-container">
                <h1 className="studio-title">Góc Sáng Tạo của {currentUser?.username}</h1>
                
                <div className="studio-grid">
                    {/* ================= CỘT 1: BỘ CÂU HỎI ================= */}
                    <div>
                        <div className="studio-card">
                            <h3>📦 Tạo Bộ Câu Hỏi Mới</h3>
                            <form onSubmit={handleCreateSet} style={{ display: 'flex', flexDirection: 'column' }}>
                                <input 
                                    className="studio-input"
                                    required 
                                    placeholder="Tên bộ câu hỏi (VD: Toán lớp 10)" 
                                    value={questionSetFormData.title} 
                                    onChange={(e) => setQuestionSetFormData({...questionSetFormData, title: e.target.value})} 
                                />
                                <textarea 
                                    className="studio-textarea"
                                    placeholder="Mô tả ngắn gọn..." 
                                    value={questionSetFormData.description} 
                                    onChange={(e) => setQuestionSetFormData({...questionSetFormData, description: e.target.value})} 
                                    style={{ minHeight: '80px' }} 
                                />
                                <select 
                                    className="studio-select"
                                    value={questionSetFormData.topic} 
                                    onChange={(e) => setQuestionSetFormData({...questionSetFormData, topic: e.target.value})} 
                                >
                                    <option value="Toán">Toán</option>
                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                    <option value="Lịch sử">Lịch sử</option>
                                    <option value="Hoá học">Hoá học</option>
                                    <option value="Khác">Khác</option>
                                </select>
                                <label className="checkbox-wrapper">
                                    <input 
                                        type="checkbox" 
                                        checked={questionSetFormData.isPublic} 
                                        onChange={(e) => setQuestionSetFormData({...questionSetFormData, isPublic: e.target.checked})} 
                                    />
                                    Công khai lên Thư viện cộng đồng
                                </label>
                                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Tạo Bộ</button>
                            </form>
                        </div>

                        <h3 style={{ color: 'var(--text-main)' }}>Bộ câu hỏi của bạn ({mySets.length})</h3>
                        {mySets.map((set) => (
                            <div key={set._id} className="studio-list-item">
                                <div className="studio-list-header">
                                    <div>
                                        <h3 className="studio-list-title" style={{ border: 'none', marginBottom: 0, padding: 0 }}>{set.title}</h3>
                                        <p className="studio-list-desc">
                                            {set.isPublic ? "🌐 Công khai" : "🔒 Riêng tư"} | {set.topic}
                                        </p>
                                    </div>
                                </div>
                                <div className="studio-actions"> 
                                    <button onClick={() => navigate(`/set/${set._id}`)} className="btn-action btn-blue">Xem bộ</button>
                                    <button onClick={() => handleExport(set._id, 'excel')} className="btn-action btn-green">Excel</button>
                                    <button onClick={() => handleExport(set._id, 'pdf')} className="btn-action btn-orange">PDF</button>
                                    <button onClick={() => handleDeleteSet(set._id)} className="btn-action btn-red">Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ================= CỘT 2: CÂU HỎI LẺ & ĐÃ LƯU ================= */}
                    <div>
                        <div className="studio-card">
                            <h3>➕ Thêm Câu Hỏi Mới</h3>
                            <form onSubmit={handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column' }}>
                                <input className="studio-input" required name="questionText" placeholder="Nội dung câu hỏi..." value={formData.questionText} onChange={(e) => setFormData({...formData, questionText: e.target.value})} />
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input className="studio-input" required name="optionA" placeholder="Đáp án A" value={formData.optionA} onChange={(e) => setFormData({...formData, optionA: e.target.value})} />
                                    <input className="studio-input" required name="optionB" placeholder="Đáp án B" value={formData.optionB} onChange={(e) => setFormData({...formData, optionB: e.target.value})} />
                                    <input className="studio-input" required name="optionC" placeholder="Đáp án C" value={formData.optionC} onChange={(e) => setFormData({...formData, optionC: e.target.value})} />
                                    <input className="studio-input" required name="optionD" placeholder="Đáp án D" value={formData.optionD} onChange={(e) => setFormData({...formData, optionD: e.target.value})} />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select className="studio-select" name="correctAnswer" value={formData.correctAnswer} onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}>
                                        <option value="A">Đúng: A</option>
                                        <option value="B">Đúng: B</option>
                                        <option value="C">Đúng: C</option>
                                        <option value="D">Đúng: D</option>
                                    </select>
                                    <select className="studio-select" name="difficulty" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                                        <option value="easy">Dễ</option>
                                        <option value="medium">Trung bình</option>
                                        <option value="hard">Khó</option>
                                    </select>
                                    <select className="studio-select" name="topic" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})}>
                                        <option value="Toán">Toán</option>
                                        <option value="Tiếng Anh">Tiếng Anh</option>
                                        <option value="Lịch sử">Lịch sử</option>
                                        <option value="Hoá học">Hoá học</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Lưu Câu Hỏi</button>
                            </form>
                        </div>

                        <h3 style={{ color: 'var(--text-main)' }}>Câu hỏi bạn đã tạo ({questions.length})</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                            {questions.map((q, index) => (
                                <div key={q._id} className="studio-list-item" style={{ padding: '12px' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <h4 className="studio-list-title">Câu {index + 1}: {q.questionText}</h4>
                                        <p className="studio-list-desc">Đúng: {q.correctAnswer}</p>
                                    </div>
                                    
                                    <div className="studio-actions">
                                        <select 
                                            className="studio-select"
                                            defaultValue=""
                                            onChange={(e) => {
                                                handleAddToSet(q._id, e.target.value);
                                                e.target.value = ""; 
                                            }}
                                            style={{ width: 'auto', marginBottom: 0, padding: '6px' }}
                                        >
                                            <option value="" disabled>➕ Thêm vào bộ...</option>
                                            {mySets.map(set => (
                                                <option key={set._id} value={set._id}>📦 {set.title}</option>
                                            ))}
                                        </select>

                                        <button onClick={() => handleDeleteQuestion(q._id)} className="btn-action btn-red">Xóa</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <h3 style={{ marginTop: '30px', color: 'var(--text-main)' }}>Bộ câu hỏi đã lưu ({savedSetsData.length})</h3>
                        {savedSetsData.length === 0 ? (
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Bạn chưa lưu bộ câu hỏi nào từ thư viện.</p>
                        ) : (
                            savedSetsData.map((set) => (
                                <div key={set._id} className="studio-list-item" style={{ borderLeft: '4px solid var(--primary-yellow)' }}>
                                    <div className="studio-list-header">
                                        <div>
                                            <h4 className="studio-list-title">🔖 {set.title}</h4>
                                            <p className="studio-list-desc">Tác giả: {set.owner?.username || "Ẩn danh"}</p>
                                        </div>
                                        <button onClick={() => handleRemoveSavedSet(set._id)} className="btn-action btn-red" style={{ background: 'transparent', border: '1px solid var(--error-red)', color: 'var(--error-red)' }}>
                                            ✖ Bỏ lưu
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioPage;