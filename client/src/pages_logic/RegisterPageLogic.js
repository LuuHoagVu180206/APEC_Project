import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const RegisterPageLogic = (role = 'user') => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); 
        setError(""); 
        
        if (username.length < 6) return setError("Tên đăng nhập phải có ít nhất 6 ký tự!");
        if (password.length < 6) return setError("Mật khẩu phải có ít nhất 6 ký tự!");
        if (password !== confirmPassword) return setError("Mật khẩu nhập lại không khớp!");

        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, password, role });
            alert("Đăng ký thành công! Đăng nhập ngay thôi nào.");
            navigate('/login'); 
        } catch (err) {
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.code === 11000) {
                    setError("Tên đăng nhập này đã có người dùng. Hãy chọn tên khác nhé!");
                } else if (typeof serverError === 'string') {
                    setError(serverError);
                } else {
                    setError("Lỗi hệ thống: Không thể tạo tài khoản lúc này.");
                }
            } else {
                setError("Mất kết nối với máy chủ. Vui lòng kiểm tra lại mạng!");
            }
        }
    };

    return {
        username, setUsername, password, setPassword,
        confirmPassword, setConfirmPassword, error, handleRegister
    };
};