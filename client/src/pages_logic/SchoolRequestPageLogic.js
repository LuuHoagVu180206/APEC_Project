import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialForm = {
    schoolName: '',
    abbreviation: '',
    representativeName: '',
    representativeRole: '',
    contactEmail: '',
    website: '',
    location: '',
    description: '',
    reason: ''
};

const readCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

export const SchoolRequestPageLogic = () => {
    const navigate = useNavigate();
    const [currentUser] = useState(readCurrentUser);
    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser) navigate('/login', { replace: true });
    }, [currentUser, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/school-requests', formData, {
                headers: { token: currentUser.accessToken }
            });
            alert('Đã gửi yêu cầu tạo School Community để admin xét duyệt.');
            navigate('/');
        } catch (requestError) {
            setError(typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Không thể gửi yêu cầu. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return { currentUser, formData, setFormData, error, isSubmitting, handleSubmit, navigate };
};