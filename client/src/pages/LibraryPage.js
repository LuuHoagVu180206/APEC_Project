import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LibraryPage = () => {
    const navigate = useNavigate();
    const [publicSets, setPublicSets] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Gọi API lấy các đề Public
        axios.get('http://localhost:5000/api/questionset/public')
            .then(res => setPublicSets(res.data))
            .catch(err => console.log(err));
    }, [navigate, user]);

    const handleClone = async (setId) => {
        try {
            await axios.post(`http://localhost:5000/api/questionset/clone/${setId}`, {}, {
                headers: { token: user.accessToken }
            });
            alert("✅ Đã chép bộ câu hỏi này vào kho của bạn! Hãy quay lại Sảnh để chơi.");
        } catch (err) {
            alert("❌ Lỗi khi chép đề!");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>🌐 THƯ VIỆN ĐỀ THI CỘNG ĐỒNG</h2>
                <button onClick={() => navigate('/')} style={{ padding: '10px 20px', backgroundColor: '#34495e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    🏠 Về Sảnh Game
                </button>
            </div>

            {publicSets.length === 0 ? (
                <p>Hiện chưa có ai chia sẻ bộ câu hỏi nào.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {publicSets.map(set => (
                        <div key={set._id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #3498db' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#2980b9' }}>{set.title}</h3>
                            <p style={{ margin: '5px 0', color: '#7f8c8d' }}>✍️ Tác giả: <strong>{set.createdBy?.username || 'Ẩn danh'}</strong></p>
                            <p style={{ margin: '5px 0', color: '#7f8c8d' }}>📝 Số lượng: {set.questions.length} câu</p>
                            <button 
                                onClick={() => handleClone(set._id)}
                                style={{ marginTop: '15px', padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                📥 Thêm vào kho của tôi
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryPage;