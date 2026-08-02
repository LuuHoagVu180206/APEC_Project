import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuestionSetPage = () => {
    const { id } = useParams(); // Lấy ID của bộ câu hỏi từ trên thanh địa chỉ URL
    const navigate = useNavigate();
    
    const [setData, setSetData] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchSetDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/sets/${id}`);
                setSetData(res.data.set);
                setQuestions(res.data.questions);
            } catch (err) {
                alert("Không thể tải chi tiết bộ câu hỏi!");
                console.error(err);
            }
        };
        fetchSetDetails();
    }, [id]);

    if (!setData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải dữ liệu...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <button 
                onClick={() => navigate(-1)} 
                style={{ padding: '8px 15px', cursor: 'pointer', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
                ⬅ Quay lại
            </button>

            <div style={{ background: '#ecf0f1', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>📖 {setData.title}</h2>
                <p style={{ color: '#7f8c8d' }}>{setData.description}</p>
                <span style={{ fontSize: '14px', background: '#3498db', color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                    Tổng số: {questions.length} câu
                </span>
            </div>

            <h3>Danh sách câu hỏi chi tiết:</h3>
            
            {questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                    Bộ câu hỏi này hiện chưa có câu hỏi nào.
                </div>
            ) : (
                questions.map((q, index) => (
                    <div key={q._id} style={{ 
                        background: 'white', 
                        border: '1px solid #bdc3c7', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        marginBottom: '20px', 
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
                    }}>
                        {/* 1. Tiêu đề câu hỏi */}
                        <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '18px', lineHeight: '1.4' }}>
                            <span style={{ color: '#e74c3c' }}>Câu {index + 1}:</span> {q.questionText}
                        </h4>
                        
                        {/* 2. Lưới hiển thị 4 đáp án (Chia làm 2 cột) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            
                            {/* Chạy vòng lặp qua mảng options. Nếu DB của bạn không dùng 'q.options', hãy báo lại mình nhé! */}
                            {q.options && q.options.map((opt, i) => {
                                const labels = ['A', 'B', 'C', 'D'];
                                
                                // Kiểm tra xem đáp án này có phải đáp án đúng không (So sánh chữ A, B, C, D hoặc nội dung)
                                const isCorrect = q.correctAnswer === labels[i] || q.correctAnswer === opt;
                                
                                return (
                                    <div key={i} style={{ 
                                        padding: '12px 15px', 
                                        background: isCorrect ? '#d4efdf' : '#f8f9fa', // Màu xanh nhạt nếu là đáp án đúng
                                        border: isCorrect ? '2px solid #27ae60' : '1px solid #dfe6e9',
                                        borderRadius: '6px',
                                        color: isCorrect ? '#27ae60' : '#2c3e50',
                                        fontWeight: isCorrect ? 'bold' : 'normal',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span><strong>{labels[i]}.</strong> {opt}</span>
                                        {isCorrect && <span>✔</span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* 3. Phần thông tin phụ (Độ khó & Đáp án tóm tắt) */}
                        <div style={{ 
                            borderTop: '1px dashed #ccc', 
                            paddingTop: '12px', 
                            fontSize: '14px', 
                            color: '#7f8c8d',
                            display: 'flex',
                            gap: '20px'
                        }}>
                            <div><strong>Đáp án đúng:</strong> <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{q.correctAnswer}</span></div>
                            <div><strong>Độ khó:</strong> <span style={{ textTransform: 'capitalize' }}>{q.difficulty || 'Chưa phân loại'}</span></div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default QuestionSetPage;