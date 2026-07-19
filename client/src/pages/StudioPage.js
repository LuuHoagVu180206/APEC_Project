import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudioPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // ==========================================
  // 1. STATE CHO "CÂU HỎI LẺ" (Như cũ)
  // ==========================================
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy',
    setId: ''
  });
  
  // ==========================================
  // 2. STATE MỚI CHO "BỘ CÂU HỎI"
  // ==========================================
  const [mySets, setMySets] = useState([]);
  const [questionSetFormData, setQuestionSetFormData] = useState({
    title: '', description: '', isPublic: false
  });

  const [savedSetsData, setSavedSetsData] = useState([]);

  useEffect(() => {
    if (!currentUser) {
        alert("Vui lòng đăng nhập để vào Góc Sáng Tạo!");
        navigate('/login');
        return;
    }
    fetchQuestions();
    fetchMySets();
    fetchSavedSets();
  }, [navigate]);

  // ==========================================
  // 3. CÁC HÀM XỬ LÝ API
  // ==========================================
  
  // --- LẤY DỮ LIỆU ---
  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/questions');
      const myQuestions = res.data.filter(q => q.owner === currentUser._id || q.owner === currentUser.id);
      setQuestions(myQuestions);
    } catch (err) { console.error(err); }
  };

  const fetchMySets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sets/my-sets', {
        headers: { token: currentUser.accessToken }
      });
      setMySets(res.data);
    } catch (err) { console.error(err); }
  };


  const fetchSavedSets = async () => {
    try {
      // 1. Kéo toàn bộ thư viện về
      const res = await axios.get('http://localhost:5000/api/sets/library');
      
      // 2. Lấy túi đồ mới nhất của user từ localStorage
      const latestUser = JSON.parse(localStorage.getItem('user'));
      
      // 3. Lọc ra những bộ có ID nằm trong túi đồ
      const mySaved = res.data.filter(set => latestUser?.savedSets?.includes(set._id));
      setSavedSetsData(mySaved);
    } catch (err) { 
      console.error("Lỗi tải bộ đã lưu:", err); 
    }
  };


  const handleCreateSet = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/sets', questionSetFormData, {
          headers: { token: currentUser.accessToken }
      });
      alert("Tạo Bộ Câu Hỏi thành công!");
      fetchMySets();
      setQuestionSetFormData({ title: '', description: '', isPublic: false }); // Reset form
    } catch (err) {
      alert("Lỗi tạo bộ câu hỏi!");
      console.error(err);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
        const getCorrectText = (key) => {
            if (key === 'A') return formData.optionA;
            if (key === 'B') return formData.optionB;
            if (key === 'C') return formData.optionC;
            return formData.optionD;
        };

        const newQuestion = {
            questionText: formData.questionText,
            options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
            correctAnswer: getCorrectText(formData.correctAnswer), 
            difficulty: formData.difficulty,
            owner: currentUser._id
        };

        const res = await axios.post('http://localhost:5000/api/questions', newQuestion, {
            headers: { token: currentUser.accessToken }
        });
      
      // 2. NẾU USER CÓ CHỌN BỘ CÂU HỎI -> Gọi API nhét nó vào bộ
        if (formData.setId && formData.setId !== '') {
          await axios.put(`http://localhost:5000/api/sets/${formData.setId}/add-question`, {
              questionId: res.data._id 
          }, {
              headers: { token: currentUser.accessToken }
          });
        }
      
        alert("Đã lưu câu hỏi thành công!");
        fetchQuestions(); // Tải lại danh sách câu hỏi
      
      // Reset form sạch sẽ (nhớ giữ lại hoặc reset luôn setId)
        setFormData({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy', setId: '' });
    } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      
      // Hiển thị lỗi ra màn hình
        alert("🛑 Server từ chối với lý do: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
      
      // In chi tiết ra F12 để kiểm tra sâu hơn
      console.error("Chi tiết lỗi:", err.response || err);
    }
  };

  const handleAddToSet = async (questionId, setId) => {
    if (!setId) return; // Nếu chưa chọn thì không làm gì cả
    
    try {
        await axios.put(`http://localhost:5000/api/sets/${setId}/add-question`, {
            questionId: questionId
        }, {
            headers: { token: currentUser.accessToken }
        });
        alert("Đã nhét câu hỏi vào bộ thành công!");
    } catch (err) {
        // Backend sẽ báo lỗi 400 nếu câu hỏi đã nằm sẵn trong bộ đó
        alert(err.response?.data || "Lỗi khi thêm vào bộ!");
    }
  };

  // --- XÓA ---
  const handleDeleteSet = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa BỘ câu hỏi này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/sets/${id}`, { headers: { token: currentUser.accessToken } });
        fetchMySets();
      } catch (err) { alert("Lỗi khi xóa!"); }
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa CÂU HỎI này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${id}`, { headers: { token: currentUser.accessToken } });
        fetchQuestions();
      } catch (err) { alert("Lỗi khi xóa!"); }
    }
  };


  const handleRemoveSavedSet = async (setId) => {
    try {
      // Gọi lại API toggle bọc thép mà chúng ta vừa làm
      await axios.put('http://localhost:5000/api/users/toggle-save-set', { setId }, {
          headers: { token: currentUser.accessToken }
      });
      
      // Cập nhật túi đồ trong localStorage
      let latestUser = JSON.parse(localStorage.getItem('user'));
      latestUser.savedSets = latestUser.savedSets.filter(id => id !== setId);
      localStorage.setItem('user', JSON.stringify(latestUser));
      
      // Đá bộ câu hỏi đó ra khỏi màn hình ngay lập tức
      setSavedSetsData(prev => prev.filter(set => set._id !== setId));
    } catch (err) {
      alert("Lỗi khi bỏ lưu bộ câu hỏi!");
    }
  };


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
                <div key={set._id} style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <strong>{set.title}</strong>
                            <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '5px 0' }}>{set.isPublic ? ' Công khai' : '🔒 Riêng tư'}</p>
                        </div>
                        <button onClick={() => handleDeleteSet(set._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '3px', cursor: 'pointer' }}>Xóa</button>
                    </div>
                </div>
            ))}
        </div>

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
    )
};
export default StudioPage;