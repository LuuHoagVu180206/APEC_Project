import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

const semesterPattern = /^Kỳ\s+\d+\s+20\d{2}-20\d{2}$/;

export const CreateClassPageLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [formData, setFormData] = useState({
        className: '',
        semester: '',
        description: '',
        teacherName: currentUser?.fullName || currentUser?.username || ''
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'teacher') {
            navigate(currentUser ? '/' : '/login', { replace: true });
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (formData.semester && !semesterPattern.test(formData.semester.trim())) {
            setError('Học kỳ cần theo định dạng: Kỳ n 202x-202x.');
            return;
        }

        setIsSaving(true);
        try {
            await axios.post('http://localhost:5000/api/classes', formData, {
                headers: { token: currentUser.accessToken }
            });
            navigate('/teacher/dashboard');
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể tạo lớp. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    return { formData, setFormData, error, isSaving, handleSubmit, navigate };
};