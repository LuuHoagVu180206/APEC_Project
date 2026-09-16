import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            alert('Đăng nhập thành công!');
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/game');
        } catch (err) {
            console.error(err);
            alert('Sai tài khoản hoặc mật khẩu!');
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
        navigate('/game');
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