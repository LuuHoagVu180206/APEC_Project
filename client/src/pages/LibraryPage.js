import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LibraryPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [questionSets, setQuestionSets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedSets, setSavedSets] = useState(currentUser?.savedSets || []);
  useEffect(() => {
    fetchLibrary();
  }, []);

  // 1. LẤY DANH SÁCH TỪ THƯ VIỆN CỘNG ĐỒNG
  const fetchLibrary = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sets/library');
      setQuestionSets(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu thư viện:", err);
    }
  };

  // 2. PHÂN QUYỀN XÓA (Admin hoặc Chủ sở hữu)
  const canDelete = (ownerId) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser._id === ownerId || currentUser.id === ownerId) return true;
    return false;
  };

  // 3. THAO TÁC: THÍCH / BỎ THÍCH
  const handleLike = async (setId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thả tim cho bộ câu hỏi này nhé!");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/sets/${setId}/like`, {}, {
        headers: { token: currentUser.accessToken }
      });
      fetchLibrary(); // Gọi lại để cập nhật số đếm tim
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tương tác!");
    }
  };


  const handleToggleLikeSet = async (setId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để lưu bộ câu hỏi vào tủ đồ cá nhân!");
      return;
    }
    try {
      const res = await axios.put('http://localhost:5000/api/users/toggle-save-set', {
          setId: setId
      }, {
          headers: { token: currentUser.accessToken }
      });
      
      // 1. Cập nhật State để UI đổi màu nút ngay lập tức
      let newSavedSets = [...savedSets];
      if (res.data.isSaved) {
          newSavedSets.push(setId); // Thêm ID vào danh sách
      } else {
          newSavedSets = newSavedSets.filter(id => id !== setId); // Xóa ID khỏi danh sách
      }
      setSavedSets(newSavedSets);

      // 2. Cập nhật ngầm vào localStorage để lần sau F5 vẫn giữ nguyên trạng thái
      const updatedUser = { ...currentUser, savedSets: newSavedSets };
      localStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data || err.message;
      
        alert("🛑 Không thể lưu: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
        console.error("Chi tiết lỗi:", err.response || err);
    }
  };

  // 4. THAO TÁC: XÓA
  const handleDelete = async (setId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa bộ câu hỏi này khỏi hệ thống?")) {
      try {
        await axios.delete(`http://localhost:5000/api/sets/${setId}`, {
          headers: { token: currentUser.accessToken }
        });
        fetchLibrary();
      } catch (err) {
        alert("Lỗi hoặc bạn không có quyền xóa!");
      }
    }
  };

  // 5. THAO TÁC: XUẤT FILE (Tính năng chờ)
  const handleExport = async (setId, type) => {
    try {
      // 1. Gửi request báo cho axios biết mình chuẩn bị nhận File (blob)
      const res = await axios.get(`http://localhost:5000/api/sets/${setId}/export?type=${type}`, {
          responseType: 'blob' 
      });

      // 2. Tạo một đường link ảo trong bộ nhớ của trình duyệt
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // 3. Cấu hình đuôi file tự động dựa vào type người dùng chọn (.xlsx hoặc .pdf)
      const extension = type === 'excel' ? 'xlsx' : 'pdf';
      const fileName = `Bo_Cau_Hoi_${setId}.${extension}`;
      link.setAttribute('download', fileName);
      
      // 4. Kích hoạt tải
      document.body.appendChild(link);
      link.click();
      link.remove(); 
      
    } catch (err) {
      console.error("Lỗi xuất file:", err);
      alert("Lỗi khi tải file! Vui lòng thử lại.");
    }
  };

  // 6. XỬ LÝ THANH TÌM KIẾM
  const filteredSets = questionSets.filter(set => 
    set.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 15px', cursor: 'pointer' }}>⬅ Quay lại</button>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>📚 Thư Viện Cộng Đồng</h1>
        
        {/* Nút điều hướng nhanh cho User/Guest */}
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
                  <p style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px' }}>{qSet.description || "Không có mô tả"}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#95a5a6' }}>Tác giả: {qSet.owner?.username || "Ẩn danh"}</p>
                </div>
                
                {/* NÚT XÓA (Chỉ hiện khi có quyền) */}
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
                
                {/* --- NÚT LƯU BỘ CÂU HỎI (Mới thêm) --- */}
                <button 
                  onClick={() => handleToggleLikeSet(qSet._id)} 
                  style={{ 
                    // Nút sẽ tự động đổi màu Xanh nếu ID của bộ này nằm trong danh sách savedSets
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
                {/* ------------------------------------- */}
                
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