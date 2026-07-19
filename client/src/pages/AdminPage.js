import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

  const AdminPage = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));


    const [currentVersion, setCurrentVersion] = useState("v1.0");
    const [newVersion, setNewVersion] = useState("");


    const [allQuestions, setAllQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

  
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");


  useEffect(() => {
      if (!currentUser || currentUser.role !== 'admin') {
        navigate('/');
        return;
      }
      fetchAllQuestions();
      fetchVersion();
    }, [navigate]);


    const fetchVersion = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/settings/version');
          setCurrentVersion(res.data.version);
      } catch (err) {
          console.error(err);
      }
  };


  const executeDelete = async () => {
      if (!deleteReason.trim()) {
        alert("Admin phải nhập lý do để lưu vết hệ thống!");
        return;
      }

      try {
        // Dùng axios.delete gửi kèm data trong body (chuẩn RESTful)
        await axios.delete(`http://localhost:5000/api/questions/${deleteTarget._id}`, {
          headers: { token: currentUser.accessToken },
          data: { reason: deleteReason } // Gửi lý do xuống Backend
        });
        
        alert("Đã xóa câu hỏi và ghi nhận lý do!");
        
        // Dọn dẹp hiện trường
        setDeleteTarget(null);
        setDeleteReason("");
        fetchAllQuestions();
      } catch (err) {
        alert("Lỗi khi thực thi lệnh xóa!");
        console.error(err);
      }
  };


  const filteredQuestions = allQuestions.filter(q => 
    q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

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


  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/game')} style={{ marginBottom: '20px' }}>⬅ Quay lại Game</button>
      
      <h1 style={{ textAlign: 'center' }}>⚙️ Quản trị hệ thống</h1>
      

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


      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>🛡️ Kiểm duyệt nội dung ({allQuestions.length} câu hỏi)</h2>
        
        <input 
          type="text" 
          placeholder="🔍 Tìm kiếm câu hỏi vi phạm..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        {/* BẢNG DANH SÁCH CÂU HỎI */}
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8f9fa', position: 'sticky', top: 0 }}>
                    <tr>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>ID Nội dung</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Câu hỏi</th>
                        <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredQuestions.map(q => (
                        <tr key={q._id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', color: '#7f8c8d', fontSize: '12px' }}>{q._id.slice(-6)}</td>
                            <td style={{ padding: '12px' }}>
                                <strong>{q.questionText}</strong>
                                <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '4px' }}>
                                    Lựa chọn: {q.options.join(' | ')}
                                </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                                <button 
                                    // Bấm nút xóa ở bảng -> Bật Modal lên
                                    onClick={() => setDeleteTarget(q)} 
                                    style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Xóa bài
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>


      {deleteTarget && (
          <div style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' 
          }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                  <h3 style={{ color: '#c0392b', marginTop: 0 }}>⚠️ Kỷ luật nội dung</h3>
                  <p style={{ fontSize: '14px', color: '#555' }}>
                      Bạn đang chuẩn bị xóa câu hỏi: <br/>
                      <strong>"{deleteTarget.questionText}"</strong>
                  </p>
                  
                  <textarea 
                      placeholder="Nhập lý do xóa (Bắt buộc) - VD: Chứa ngôn từ đả kích..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      style={{ width: '100%', height: '80px', padding: '10px', marginTop: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                      <button 
                          onClick={() => { setDeleteTarget(null); setDeleteReason(""); }} 
                          style={{ padding: '8px 15px', background: '#ecf0f1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                          Hủy bỏ
                      </button>
                      <button 
                          onClick={executeDelete} 
                          style={{ padding: '8px 15px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                          Thực thi Xóa
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>  
  );
};

export default AdminPage;


