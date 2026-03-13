import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);

  // State cho form thêm câu hỏi mới
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A', // Mặc định đáp án đúng là A
    difficulty: 'easy'
  });

  const [currentVersion, setCurrentVersion] = useState("v1.0");
  const [newVersion, setNewVersion] = useState("");
  
  // 1. Kiểm tra quyền Admin (đơn giản) và tải câu hỏi
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // Nếu không phải admin thì đá về trang chủ (bảo mật cơ bản)
    if (!user || user.username !== 'admin') {
      alert("Bạn không có quyền truy cập trang này!");
      navigate('/');
      return;
    }
    fetchQuestions();
    fetchVersion();
  }, [navigate]);

  const fetchQuestions = async () => {
    const res = await axios.get('http://localhost:5000/api/questions');
    setQuestions(res.data);
  };

  const fetchVersion = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/settings/version');
        setCurrentVersion(res.data.version);
    } catch (err) {
        console.error(err);
    }
};

  // 2. Xử lý khi nhập liệu vào Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Gửi câu hỏi mới lên Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn bị dữ liệu đúng cấu trúc Database
      const newQuestion = {
        questionText: formData.questionText,
        options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
        // Lưu ý: Logic này giả định đáp án đúng là nội dung text. 
        // Nếu game bạn so sánh A,B,C,D thì sửa lại logic ở đây nhé.
        correctAnswer: getCorrectText(formData.correctAnswer), 
        difficulty: formData.difficulty
      };

      await axios.post('http://localhost:5000/api/questions', newQuestion);
      alert("Thêm câu hỏi thành công!");
      fetchQuestions(); // Tải lại danh sách
      
      // Reset form
      setFormData({...formData, questionText: '', optionA: '', optionB: '', optionC: '', optionD: ''});
    } catch (err) {
      alert("Lỗi thêm câu hỏi");
    }
  };
  const handleUpdateVersion = async () => {
    if (!newVersion) return alert("Vui lòng nhập tên phiên bản!");
    try {
        await axios.post('http://localhost:5000/api/settings/version', {
            version: newVersion
        });
        alert(`Đã chuyển game sang phiên bản: ${newVersion}`);
        setCurrentVersion(newVersion);
        setNewVersion("");
      } catch (err) {
        alert("Lỗi cập nhật version");
      }
  };

  // Hàm phụ trợ: Lấy text của đáp án đúng dựa vào lựa chọn A/B/C/D
  const getCorrectText = (key) => {
    if (key === 'A') return formData.optionA;
    if (key === 'B') return formData.optionB;
    if (key === 'C') return formData.optionC;
    return formData.optionD;
  };

  // 4. Xóa câu hỏi
  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa câu hỏi này?")) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        alert("Lỗi khi xóa");
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/game')} style={{ marginBottom: '20px' }}>⬅ Quay lại Game</button>
      
      <h1 style={{ textAlign: 'center' }}>⚙️ Quản Lý Ngân Hàng Câu Hỏi</h1>
      
      {/* --- KHUNG QUẢN LÝ VERSION (MỚI) --- */} 
       <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #90caf9' }}>
           <h3>🚀 Phiên bản Game hiện tại: <span style={{ color: 'red' }}>{currentVersion}</span></h3>
           <div style={{ display: 'flex', gap: '10px' }}>
               <input 
                 placeholder="Nhập tên folder mới (vd: v1.1)" 
                 value={newVersion}
                 onChange={(e) => setNewVersion(e.target.value)}
                 style={{ padding: '8px', flex: 1 }}
               />
               <button onClick={handleUpdateVersion} style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer' }}>
                   Cập nhật ngay
               </button>
           </div>
           <small>Lưu ý: Đảm bảo bạn đã tạo folder `public/game/{newVersion}` trước nhé.</small>
       </div>

      {/* FORM THÊM CÂU HỎI */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Thêm câu hỏi mới</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input required name="questionText" placeholder="Nội dung câu hỏi..." value={formData.questionText} onChange={handleChange} style={{ padding: '8px' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input required name="optionA" placeholder="Đáp án A" value={formData.optionA} onChange={handleChange} style={{ padding: '8px' }} />
            <input required name="optionB" placeholder="Đáp án B" value={formData.optionB} onChange={handleChange} style={{ padding: '8px' }} />
            <input required name="optionC" placeholder="Đáp án C" value={formData.optionC} onChange={handleChange} style={{ padding: '8px' }} />
            <input required name="optionD" placeholder="Đáp án D" value={formData.optionD} onChange={handleChange} style={{ padding: '8px' }} />
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <label>
              Đáp án đúng: 
              <select name="correctAnswer" value={formData.correctAnswer} onChange={handleChange} style={{ marginLeft: '10px', padding: '5px' }}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </label>
            
            <label>
              Độ khó: 
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={{ marginLeft: '10px', padding: '5px' }}>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </label>
          </div>

          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Lưu Câu Hỏi</button>
        </form>
      </div>

      {/* DANH SÁCH CÂU HỎI */}
      <h3>Danh sách hiện có ({questions.length})</h3>
      {questions.map((q, index) => (
        <div key={q._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Câu {index + 1}: {q.questionText}</strong>
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
              • Đúng: {q.correctAnswer} <br/>
              • Các lựa chọn: {q.options.join(' | ')}
            </div>
          </div>
          <button onClick={() => handleDelete(q._id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Xóa</button>
        </div>
      ))}
    </div>
    
  );
};

export default AdminPage;


