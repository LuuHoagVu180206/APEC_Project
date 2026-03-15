import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // ==========================================
    // STATE CHO PHẦN 1: CẬP NHẬT PHIÊN BẢN GAME
    // ==========================================
    const [gameVersion, setGameVersion] = useState("");
    const [versionMessage, setVersionMessage] = useState("");

    // ==========================================
    // STATE CHO PHẦN 2: BỘ CÂU HỎI
    // ==========================================
    const [mySets, setMySets] = useState([]); // Danh sách các bộ đã tạo
    const [title, setTitle] = useState("");   // Tên bộ mới đang tạo
    const [isPublic, setIsPublic] = useState(false); // 👉 THÊM DÒNG NÀY: Khởi tạo công tắc Public
    // Khởi tạo form với 1 câu hỏi trống mặc định
    const [questions, setQuestions] = useState([
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
    ]);

    // ------------------------------------------
    // KIỂM TRA QUYỀN VÀ TẢI DỮ LIỆU BAN ĐẦU
    // ------------------------------------------
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            alert("Bạn không có quyền truy cập trang này!");
            navigate('/');
            return;
        }
        setUser(storedUser);
        fetchMySets(storedUser.accessToken);
    }, [navigate]);

    // Hàm lấy danh sách bộ câu hỏi từ Server
    const fetchMySets = async (token) => {
        try {
            const res = await axios.get('http://localhost:5000/api/questionset/my-sets', {
                headers: { token: token }
            });
            setMySets(res.data);
        } catch (err) {
            console.error("Lỗi lấy danh sách bộ câu hỏi:", err);
        }
    };

    // ------------------------------------------
    // CÁC HÀM XỬ LÝ CHO PHẦN GAME VERSION
    // ------------------------------------------
    const handleUpdateVersion = async () => {
        try {
            await axios.post('http://localhost:5000/api/settings/version', { version: gameVersion });
            setVersionMessage(`✅ Cập nhật thành công! Game sẽ chạy bản: ${gameVersion}`);
        } catch (err) {
            setVersionMessage("❌ Lỗi khi cập nhật phiên bản.");
        }
    };

    // ------------------------------------------
    // CÁC HÀM XỬ LÝ CHO PHẦN TẠO BỘ CÂU HỎI
    // ------------------------------------------
    // 1. Hàm sửa nội dung của 1 câu hỏi trong form
    const handleQuestionChange = (index, field, value, optIndex = null) => {
        const updatedQuestions = [...questions];
        if (field === 'options') {
            updatedQuestions[index].options[optIndex] = value;
        } else {
            updatedQuestions[index][field] = value;
        }
        setQuestions(updatedQuestions);
    };

    // 2. Hàm thêm 1 khung câu hỏi trống mới
    const handleAddMoreQuestion = () => {
        setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: "" }]);
    };

    // 3. Hàm gửi dữ liệu lên Server để lưu
    const handleCreateSet = async (e) => {
        e.preventDefault();
        try {
            const newSet = { title, isPublic, questions };
            await axios.post('http://localhost:5000/api/questionset', newSet, {
                headers: { token: user.accessToken }
            });
            alert("✅ Đã tạo bộ câu hỏi thành công!");
            
            // Xóa form và tải lại danh sách
            setTitle("");
            setQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswer: "" }]);
            fetchMySets(user.accessToken);
            
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi khi tạo bộ câu hỏi!");
        }
    };

    // ------------------------------------------
    // GIAO DIỆN (UI)
    // ------------------------------------------
    if (!user) return null;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>⚙️ BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN</h2>
                <button onClick={() => navigate('/')} style={{ padding: '10px', cursor: 'pointer' }}>⬅️ Quay lại Game</button>
            </div>

            {/* KHU VỰC 1: CẬP NHẬT PHIÊN BẢN GAME */}
            <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>🚀 Cập nhật phiên bản Game</h3>
                <input 
                    type="text" 
                    placeholder="Nhập tên thư mục (VD: v2.0)" 
                    value={gameVersion} 
                    onChange={(e) => setGameVersion(e.target.value)}
                    style={{ padding: '8px', width: '250px', marginRight: '10px' }}
                />
                <button onClick={handleUpdateVersion} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cập nhật</button>
                {versionMessage && <p style={{ color: 'green', fontWeight: 'bold' }}>{versionMessage}</p>}
            </div>

            {/* KHU VỰC 2: TẠO BỘ CÂU HỎI MỚI */}
            <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>📝 Tạo Bộ Câu Hỏi Mới</h3>
                <form onSubmit={handleCreateSet}>
                    <input 
                        type="text" 
                        required
                        placeholder="Tên bộ câu hỏi (VD: Đề Toán Học Kỳ 1)" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ padding: '10px', width: '100%', marginBottom: '20px', fontWeight: 'bold', fontSize: '16px', boxSizing: 'border-box' }}
                    />
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{ cursor: 'pointer', fontWeight: 'bold', color: '#d35400' }}>
                            <input 
                                type="checkbox" 
                                checked={isPublic} 
                                onChange={(e) => setIsPublic(e.target.checked)} 
                                style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                            />
                            🌍 Chia sẻ công khai (Mọi người đều có thể copy bộ đề này)
                        </label>
                    </div>
                    {/* Lặp qua danh sách câu hỏi đang tạo */}
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', marginBottom: '15px', border: '1px solid #ccc' }}>
                            <h4>Câu hỏi {qIndex + 1}</h4>
                            <input 
                                type="text" required placeholder="Nội dung câu hỏi..." 
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                            />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                {[0, 1, 2, 3].map(optIndex => (
                                    <input 
                                        key={optIndex} type="text" required placeholder={`Đáp án ${optIndex + 1}`}
                                        value={q.options[optIndex]}
                                        onChange={(e) => handleQuestionChange(qIndex, 'options', e.target.value, optIndex)}
                                        style={{ padding: '8px' }}
                                    />
                                ))}
                            </div>

                            <input 
                                type="text" required placeholder="Copy đáp án đúng dán vào đây" 
                                value={q.correctAnswer}
                                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '2px solid #28a745', boxSizing: 'border-box' }}
                            />
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={handleAddMoreQuestion} style={{ padding: '10px', flex: 1, backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            ➕ Thêm câu hỏi
                        </button>
                        <button type="submit" style={{ padding: '10px', flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                            💾 Lưu Bộ Câu Hỏi
                        </button>
                    </div>
                </form>
            </div>

            {/* KHU VỰC 3: XEM LẠI CÁC BỘ ĐÃ TẠO */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                <h3>📚 Kho Câu Hỏi Của Bạn</h3>
                {mySets.length === 0 ? (
                    <p>Bạn chưa tạo bộ câu hỏi nào.</p>
                ) : (
                    <ul>
                        {mySets.map(set => (
                            <li key={set._id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}>
                                <strong>{set.title}</strong> - (Gồm {set.questions.length} câu hỏi) 
                                <span style={{ color: 'gray', fontSize: '12px', marginLeft: '10px' }}>
                                    (Tạo lúc: {new Date(set.createdAt).toLocaleDateString()})
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminPage;