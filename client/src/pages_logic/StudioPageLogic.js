import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const StudioPageLogic = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({
        questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy', setId: ''
    });
  
    const [mySets, setMySets] = useState([]);
    const [questionSetFormData, setQuestionSetFormData] = useState({
        title: '', description: '', isPublic: false, classId: ''
    });
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [savedSetsData, setSavedSetsData] = useState([]);

    useEffect(() => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để vào Góc Sáng Tạo!");
            navigate('/login');
            return;
        }
        fetchQuestions();
        fetchMySets();
        fetchSavedSets();
        if (currentUser.role === 'teacher') fetchTeacherClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const fetchQuestions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/questions');
            const myQuestions = res.data.filter(q => q.owner === currentUser._id || q.owner === currentUser.id);
            setQuestions(myQuestions);
        } catch (err) { console.error(err); }
    };

    const fetchMySets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sets/my-sets', {
                headers: { token: currentUser.accessToken }
            });
            setMySets(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTeacherClasses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/classes/mine', {
                headers: { token: currentUser.accessToken }
            });
            setTeacherClasses(res.data);
        } catch (err) {
            console.error('Lỗi tải danh sách lớp:', err);
        }
    };

    const fetchSavedSets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sets/library');
            const latestUser = JSON.parse(localStorage.getItem('user'));
            const mySaved = res.data.filter(set => latestUser?.savedSets?.includes(set._id));
            setSavedSetsData(mySaved);
        } catch (err) { console.error("Lỗi tải bộ đã lưu:", err); }
    };

    const handleCreateSet = async (e) => {
        e.preventDefault();
        try {
            const { classId, ...setData } = questionSetFormData;
            const res = await axios.post('http://localhost:5000/api/sets', setData, {
                headers: { token: currentUser.accessToken }
            });

            if (currentUser.role === 'teacher' && classId) {
                try {
                    await axios.post(`http://localhost:5000/api/classes/${classId}/question-sets`, {
                        questionSetId: res.data._id
                    }, { headers: { token: currentUser.accessToken } });
                } catch (linkError) {
                    const errorMessage = typeof linkError.response?.data === 'string'
                        ? linkError.response.data
                        : 'Không thể thêm bộ câu hỏi vào lớp đã chọn.';
                    alert(`Đã tạo bộ câu hỏi nhưng chưa thêm được vào lớp: ${errorMessage}`);
                    fetchMySets();
                    setQuestionSetFormData({ title: '', description: '', isPublic: false, classId: '' });
                    return;
                }
            }

            alert(classId ? 'Đã tạo bộ câu hỏi và thêm vào lớp!' : 'Tạo Bộ Câu Hỏi thành công!');
            fetchMySets();
            setQuestionSetFormData({ title: '', description: '', isPublic: false, classId: '' });
        } catch (err) {
            alert("Lỗi tạo bộ câu hỏi!");
            console.error(err);
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            const getCorrectText = (key) => {
                if (key === 'A') return formData.optionA;
                if (key === 'B') return formData.optionB;
                if (key === 'C') return formData.optionC;
                return formData.optionD;
            };

            const newQuestion = {
                questionText: formData.questionText,
                options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
                correctAnswer: getCorrectText(formData.correctAnswer), 
                difficulty: formData.difficulty,
                owner: currentUser._id
            };

            const res = await axios.post('http://localhost:5000/api/questions', newQuestion, { headers: { token: currentUser.accessToken }});
          
            if (formData.setId && formData.setId !== '') {
                await axios.put(`http://localhost:5000/api/sets/${formData.setId}/add-question`, { questionId: res.data._id }, { headers: { token: currentUser.accessToken }});
            }
          
            alert("Đã lưu câu hỏi thành công!");
            fetchQuestions(); 
            setFormData({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy', setId: '' });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            alert("🛑 Server từ chối với lý do: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
            console.error("Chi tiết lỗi:", err.response || err);
        }
    };

    const handleAddToSet = async (questionId, setId) => {
        if (!setId) return; 
        try {
            await axios.put(`http://localhost:5000/api/sets/${setId}/add-question`, { questionId: questionId }, { headers: { token: currentUser.accessToken }});
            alert("Đã nhét câu hỏi vào bộ thành công!");
        } catch (err) {
            alert(err.response?.data || "Lỗi khi thêm vào bộ!");
        }
    };

    const handleDeleteSet = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa BỘ câu hỏi này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/sets/${id}`, { headers: { token: currentUser.accessToken } });
                fetchMySets();
            } catch (err) { alert("Lỗi khi xóa!"); }
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa CÂU HỎI này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/questions/${id}`, { headers: { token: currentUser.accessToken } });
                fetchQuestions();
            } catch (err) { alert("Lỗi khi xóa!"); }
        }
    };

    const handleRemoveSavedSet = async (setId) => {
        try {
            await axios.put('http://localhost:5000/api/users/toggle-save-set', { setId }, { headers: { token: currentUser.accessToken }});
            
            let latestUser = JSON.parse(localStorage.getItem('user'));
            latestUser.savedSets = latestUser.savedSets.filter(id => id !== setId);
            localStorage.setItem('user', JSON.stringify(latestUser));
            
            setSavedSetsData(prev => prev.filter(set => set._id !== setId));
        } catch (err) {
            alert("Lỗi khi bỏ lưu bộ câu hỏi!");
        }
    };

    const handleExport = async (setId, type) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/sets/${setId}/export?type=${type}`, {
                responseType: 'blob',
                headers: { token: currentUser.accessToken }
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const extension = type === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `Bo_Cau_Hoi_${setId}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove(); 
        } catch (err) {
            alert("Lỗi xuất file!");
        }
    };

    return {
        navigate, currentUser, questions, formData, setFormData,
        mySets, questionSetFormData, setQuestionSetFormData, teacherClasses, savedSetsData,
        handleCreateSet, handleCreateQuestion, handleAddToSet, handleDeleteSet,
        handleDeleteQuestion, handleRemoveSavedSet, handleExport
    };
};