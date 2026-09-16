import { useState, useEffect } from 'react';
import axios from 'axios';

export const ProfilePageLogic = () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        bio: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            setFormData({
                fullName: currentUser.fullName || '',
                email: currentUser.email || '',
                bio: currentUser.bio || ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage('Đang cập nhật...');

        try {
            const res = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
                headers: { token: currentUser.accessToken }
            });

            const updatedUser = { ...res.data, accessToken: currentUser.accessToken };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setMessage('✅ Cập nhật thông tin thành công!');
            
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('❌ Lỗi khi cập nhật thông tin!');
        }
    };

    return {
        currentUser,
        formData,
        setFormData,
        message,
        handleUpdateProfile
    };
};