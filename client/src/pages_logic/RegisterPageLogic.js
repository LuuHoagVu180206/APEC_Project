import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';

export const RegisterPageLogic = (role = 'user') => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); 
        setError(""); 
        
        if (username.length < 6) {
            setError("Tên đăng nhập phải có ít nhất 6 ký tự!");
            toast.warning("Tên đăng nhập phải có ít nhất 6 ký tự!");
            return;
        }
        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            toast.warning("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }
        if (password !== confirmPassword) {
            setError("Mật khẩu nhập lại không khớp!");
            toast.warning("Mật khẩu nhập lại không khớp!");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, password, role });
            toast.success("Đăng ký thành công! Đăng nhập ngay thôi nào.");
            setTimeout(() => {
                navigate('/login'); 
            }, 600);
        } catch (err) {
            let errorMsg = "Mất kết nối với máy chủ. Vui lòng kiểm tra lại mạng!";
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.code === 11000) {
                    errorMsg = "Tên đăng nhập này đã có người dùng. Hãy chọn tên khác nhé!";
                } else if (typeof serverError === 'string') {
                    errorMsg = serverError;
                } else if (serverError.message) {
                    errorMsg = serverError.message;
                } else {
                    errorMsg = "Lỗi hệ thống: Không thể tạo tài khoản lúc này.";
                }
            }
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    return {
        username, setUsername, password, setPassword,
        confirmPassword, setConfirmPassword, error, handleRegister
    };
};
