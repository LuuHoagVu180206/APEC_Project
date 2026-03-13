import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // Ngăn trang web tải lại khi bấm submit
        setError(""); // Xóa lỗi cũ (nếu có)
        
        if (username.length < 6) {
            return setError("Tên đăng nhập phải có ít nhất 6 ký tự!");
        }
        if (password.length < 6) {
            return setError("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        // 1. Kiểm tra mật khẩu nhập lại
        if (password !== confirmPassword) {
            return setError("Mật khẩu nhập lại không khớp!");
        }

        // 2. Gửi dữ liệu xuống Server
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                username: username,
                password: password
            });
            
            // Nếu thành công
            alert("Đăng ký thành công! Đăng nhập ngay thôi nào.");
            navigate('/login'); // Chuyển hướng sang trang Đăng nhập
            
        } catch (err) {
            // 1. Kiểm tra xem Server có phản hồi lại không (hay là sập/mất mạng)
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                
                // 2. Bắt đúng mạch bệnh: MongoDB báo mã 11000 (Trùng lặp dữ liệu)
                if (serverError.code === 11000) {
                    setError("Tên đăng nhập này đã có người dùng. Hãy chọn tên khác nhé!");
                } 
                // 3. Nếu Server tự gửi một câu thông báo lỗi dạng chữ (Ví dụ: "Mật khẩu quá ngắn")
                else if (typeof serverError === 'string') {
                    setError(serverError);
                } 
                // 4. Các lỗi linh tinh khác từ Database
                else {
                    setError("Lỗi hệ thống: Không thể tạo tài khoản lúc này.");
                }
            } else {
                // 5. Rớt mạng hoặc chưa bật máy chủ Backend
                setError("Mất kết nối với máy chủ. Vui lòng kiểm tra lại mạng!");
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8' }}>
            <form onSubmit={handleRegister} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đăng Ký Tài Khoản</h2>
                
                {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Tên đăng nhập</label>
                    <input 
                        type="text" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Mật khẩu</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Nhập lại mật khẩu</label>
                    <input 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Đăng Ký
                </button>

                <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Đăng nhập</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;