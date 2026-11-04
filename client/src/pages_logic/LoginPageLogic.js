import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';

export const LoginPageLogic = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            toast.success('Đăng nhập thành công! Chào mừng bạn trở lại.');
            localStorage.setItem('user', JSON.stringify(res.data));
            axios.post('http://localhost:5000/api/auth/web-session', { user: res.data }).catch(() => {});
            setTimeout(() => {
                navigate('/game');
            }, 400);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data || 'Sai tài khoản hoặc mật khẩu! Vui lòng kiểm tra lại.';
            toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        }
    };

    const handleGuestLogin = () => {
        const randomNum = Math.floor(Math.random() * 10000);
        const guestData = {
            _id: `guest_${randomNum}`,
            username: `Guest_${randomNum}`,
            role: 'guest',
            accessToken: null 
        };
        localStorage.setItem('user', JSON.stringify(guestData));
        toast.info(`Chào mừng ${guestData.username}! Bạn đang tham gia dưới chế độ Khách.`);
        setTimeout(() => {
            navigate('/game');
        }, 500);
    };

    // Xuất ra để Giao diện sử dụng
    return {
        username,
        setUsername,
        password,
        setPassword,
        handleLogin,
        handleGuestLogin,
        navigate
    };
};
