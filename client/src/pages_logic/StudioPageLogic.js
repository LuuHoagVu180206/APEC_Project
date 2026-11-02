import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';

export const StudioPageLogic = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('user'));
            return saved?.username ? saved : null;
        } catch {
            return null;
        }
    });

    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({
        questionText: '', 
        optionA: '', 
        optionB: '', 
        optionC: '', 
        optionD: '', 
        correctAnswer: 'A', 
        difficulty: 'easy', 
        topic: 'Toán', 
        setId: ''
    });
  
    const [mySets, setMySets] = useState([]);
    const [questionSetFormData, setQuestionSetFormData] = useState({
        title: '', 
        description: '', 
        topic: 'Toán', 
        isPublic: false, 
        isAnonymous: false,
        classId: ''
    });
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [savedSetsData, setSavedSetsData] = useState([]);
    const [schoolMemberships, setSchoolMemberships] = useState([]);
    const [activeTab, setActiveTab] = useState('sets'); // 'sets' | 'questions' | 'saved'

    // Modals cho Sáng tạo gọn gàng
    const [isCreateSetModalOpen, setIsCreateSetModalOpen] = useState(false);
    const [isCreateQuestionModalOpen, setIsCreateQuestionModalOpen] = useState(false);
    const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);
    const [targetQuestionForSet, setTargetQuestionForSet] = useState(null);

    // Form data chỉnh sửa câu hỏi lẻ
    const [editingQuestionData, setEditingQuestionData] = useState({
        _id: '',
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        difficulty: 'easy',
        topic: 'Toán'
    });

    useEffect(() => {
        if (!currentUser) {
            toast.warning("Vui lòng đăng nhập để vào Góc Sáng Tạo!");
            navigate('/login');
            return;
        }
        fetchQuestions();
        fetchMySets();
        fetchSavedSets();
        if (currentUser.role === 'teacher') fetchTeacherClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    // Lấy thông tin trường học
    useEffect(() => {
        if (!currentUser?.accessToken) return;
        let isActive = true;
        axios.get('http://localhost:5000/api/schools/mine', {
            headers: { token: currentUser.accessToken }
        }).then((res) => {
            if (isActive) setSchoolMemberships(res.data);
        }).catch(() => {});
        return () => { isActive = false; };
    }, [currentUser]);

    const fetchQuestions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/questions/mine', {
                headers: { token: currentUser.accessToken }
            });
            setQuestions(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách câu hỏi:", err);
            // Fallback lấy toàn bộ nếu /mine có trục trặc
            try {
                const fallbackRes = await axios.get('http://localhost:5000/api/questions');
                const myQs = (fallbackRes.data || []).filter(q => {
                    const qOwner = q.owner?._id || q.owner?.id || (typeof q.owner === 'string' ? q.owner : null);
                    return qOwner && (qOwner === currentUser._id || qOwner === currentUser.id);
                });
                setQuestions(myQs);
            } catch {
                setQuestions([]);
            }
        }
    };

    const fetchMySets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sets/my-sets', {
                headers: { token: currentUser.accessToken }
            });
            setMySets(res.data || []);
        } catch (err) { 
            console.error("Lỗi lấy danh sách bộ đề:", err); 
        }
    };

    const fetchTeacherClasses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/classes/mine', {
                headers: { token: currentUser.accessToken }
            });
            setTeacherClasses(res.data || []);
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
        } catch (err) { 
            console.error("Lỗi tải bộ đã lưu:", err); 
        }
    };

    // Mở / Đóng Modal Tạo Bộ Câu Hỏi
    const handleOpenCreateSetModal = () => {
        setQuestionSetFormData({ 
            title: '', 
            description: '', 
            topic: 'Toán', 
            isPublic: false, 
            isAnonymous: false, 
            classId: '' 
        });
        setIsCreateSetModalOpen(true);
    };

    const handleCloseCreateSetModal = () => {
        setIsCreateSetModalOpen(false);
    };

    // Tạo Bộ Câu Hỏi Mới
    const handleCreateSet = async (e) => {
        e.preventDefault();
        try {
            const { classId, ...setData } = questionSetFormData;
            const payload = {
                ...setData,
                isAnonymous: setData.isPublic ? Boolean(setData.isAnonymous) : false
            };
            const res = await axios.post('http://localhost:5000/api/sets', payload, {
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
                    toast.warning(`Đã tạo bộ câu hỏi nhưng chưa thêm được vào lớp: ${errorMessage}`);
                    fetchMySets();
                    setIsCreateSetModalOpen(false);
                    return;
                }
            }

            toast.success(classId ? 'Đã tạo bộ câu hỏi và thêm vào lớp thành công!' : 'Tạo Bộ Câu Hỏi mới thành công!');
            fetchMySets();
            setIsCreateSetModalOpen(false);
            setQuestionSetFormData({ title: '', description: '', topic: 'Toán', isPublic: false, isAnonymous: false, classId: '' });
        } catch (err) {
            toast.error("Lỗi tạo bộ câu hỏi!");
            console.error(err);
        }
    };

    // Mở / Đóng Modal Tạo Câu Hỏi Mới
    const handleOpenCreateQuestionModal = () => {
        setFormData({ 
            questionText: '', 
            optionA: '', 
            optionB: '', 
            optionC: '', 
            optionD: '', 
            correctAnswer: 'A', 
            difficulty: 'easy', 
            topic: 'Toán', 
            setId: '' 
        });
        setIsCreateQuestionModalOpen(true);
    };

    const handleCloseCreateQuestionModal = () => {
        setIsCreateQuestionModalOpen(false);
    };

    // Tạo Câu Hỏi Mới
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
                questionText: formData.questionText.trim(),
                options: [formData.optionA.trim(), formData.optionB.trim(), formData.optionC.trim(), formData.optionD.trim()],
                correctAnswer: getCorrectText(formData.correctAnswer).trim(), 
                difficulty: formData.difficulty,
                topic: formData.topic || 'Khác',
                owner: currentUser._id
            };

            const res = await axios.post('http://localhost:5000/api/questions', newQuestion, { 
                headers: { token: currentUser.accessToken }
            });
          
            if (formData.setId && formData.setId !== '') {
                await axios.put(`http://localhost:5000/api/sets/${formData.setId}/add-question`, { 
                    questionId: res.data._id 
                }, { 
                    headers: { token: currentUser.accessToken }
                });
                fetchMySets();
            }
          
            toast.success("Đã lưu câu hỏi vào ngân hàng thành công!");
            fetchQuestions(); 
            setIsCreateQuestionModalOpen(false);
            setFormData({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy', topic: 'Toán', setId: '' });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            toast.error("Server từ chối: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
            console.error("Chi tiết lỗi:", err.response || err);
        }
    };

    // Mở Modal Chỉnh Sửa Câu Hỏi Lẻ
    const handleOpenEditQuestionModal = (q) => {
        let optA = q.options?.[0] || '';
        let optB = q.options?.[1] || '';
        let optC = q.options?.[2] || '';
        let optD = q.options?.[3] || '';

        // Xác định letter của correctAnswer
        let cAns = 'A';
        if (q.correctAnswer === optB || q.correctAnswer === 'B') cAns = 'B';
        else if (q.correctAnswer === optC || q.correctAnswer === 'C') cAns = 'C';
        else if (q.correctAnswer === optD || q.correctAnswer === 'D') cAns = 'D';

        setEditingQuestionData({
            _id: q._id,
            questionText: q.questionText || '',
            optionA: optA,
            optionB: optB,
            optionC: optC,
            optionD: optD,
            correctAnswer: cAns,
            difficulty: q.difficulty || 'easy',
            topic: q.topic || 'Toán'
        });
        setIsEditQuestionModalOpen(true);
    };

    const handleCloseEditQuestionModal = () => {
        setIsEditQuestionModalOpen(false);
    };

    // Lưu Cập Nhật Câu Hỏi Lẻ
    const handleSaveEditQuestion = async (e) => {
        e.preventDefault();
        try {
            const getCorrectText = (key) => {
                if (key === 'A') return editingQuestionData.optionA;
                if (key === 'B') return editingQuestionData.optionB;
                if (key === 'C') return editingQuestionData.optionC;
                return editingQuestionData.optionD;
            };

            const payload = {
                questionText: editingQuestionData.questionText.trim(),
                options: [
                    editingQuestionData.optionA.trim(),
                    editingQuestionData.optionB.trim(),
                    editingQuestionData.optionC.trim(),
                    editingQuestionData.optionD.trim()
                ],
                correctAnswer: getCorrectText(editingQuestionData.correctAnswer).trim(),
                difficulty: editingQuestionData.difficulty,
                topic: editingQuestionData.topic || 'Khác'
            };

            const res = await axios.put(`http://localhost:5000/api/questions/${editingQuestionData._id}`, payload, {
                headers: { token: currentUser.accessToken }
            });

            setQuestions(prev => prev.map(q => q._id === editingQuestionData._id ? res.data : q));
            toast.success("Đã cập nhật câu hỏi thành công!");
            setIsEditQuestionModalOpen(false);
        } catch (err) {
            console.error("Lỗi cập nhật câu hỏi:", err);
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi cập nhật câu hỏi!";
            toast.error(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        }
    };

    // Mở / Đóng Modal Thêm Câu Hỏi Vào Bộ Đề
    const handleOpenAddToSetModal = (q) => {
        setTargetQuestionForSet(q);
        setIsAddToSetModalOpen(true);
    };

    const handleCloseAddToSetModal = () => {
        setIsAddToSetModalOpen(false);
        setTargetQuestionForSet(null);
    };

    // Chọn bộ đề để thêm câu hỏi vào
    const handleSelectSetForQuestion = async (setId) => {
        if (!targetQuestionForSet || !setId) return;
        try {
            await axios.put(`http://localhost:5000/api/sets/${setId}/add-question`, { 
                questionId: targetQuestionForSet._id 
            }, { 
                headers: { token: currentUser.accessToken }
            });
            toast.success("Đã thêm câu hỏi vào bộ đề thành công!");
            fetchMySets();
            setIsAddToSetModalOpen(false);
            setTargetQuestionForSet(null);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi khi thêm vào bộ!";
            toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
        }
    };

    const handleToggleAnonymous = async (setId, currentAnonymous) => {
        try {
            const nextAnonymous = !currentAnonymous;
            await axios.put(`http://localhost:5000/api/sets/${setId}`, {
                isAnonymous: nextAnonymous
            }, {
                headers: { token: currentUser.accessToken }
            });
            fetchMySets();
            toast.success(nextAnonymous ? "Đã chuyển sang chế độ Ẩn danh." : "Đã bật hiển thị tên tác giả.");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi thay đổi chế độ hiển thị tác giả!");
        }
    };

    const handleTogglePrivacy = async (setId, currentPublic) => {
        try {
            const nextPublic = !currentPublic;
            await axios.put(`http://localhost:5000/api/sets/${setId}`, {
                isPublic: nextPublic,
                isAnonymous: nextPublic ? undefined : false
            }, {
                headers: { token: currentUser.accessToken }
            });
            fetchMySets();
            toast.success(nextPublic ? "Bộ câu hỏi hiện đã Công khai trên Thư viện!" : "Đã chuyển bộ câu hỏi về trạng thái Riêng tư.");
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi cập nhật trạng thái công khai!");
        }
    };

    const handleDeleteSet = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa BỘ câu hỏi này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/sets/${id}`, { 
                    headers: { token: currentUser.accessToken } 
                });
                fetchMySets();
                toast.success("Đã xóa bộ câu hỏi thành công!");
            } catch (err) { 
                toast.error("Lỗi khi xóa bộ câu hỏi!"); 
            }
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa CÂU HỎI này khỏi ngân hàng?")) {
            try {
                await axios.delete(`http://localhost:5000/api/questions/${id}`, { 
                    headers: { token: currentUser.accessToken } 
                });
                fetchQuestions();
                toast.success("Đã xóa câu hỏi khỏi ngân hàng thành công!");
            } catch (err) { 
                toast.error("Lỗi khi xóa câu hỏi!"); 
            }
        }
    };

    const handleRemoveSavedSet = async (setId) => {
        try {
            await axios.put('http://localhost:5000/api/users/toggle-save-set', { setId }, { 
                headers: { token: currentUser.accessToken }
            });
            
            let latestUser = JSON.parse(localStorage.getItem('user'));
            latestUser.savedSets = latestUser.savedSets.filter(id => id !== setId);
            localStorage.setItem('user', JSON.stringify(latestUser));
            
            setSavedSetsData(prev => prev.filter(set => set._id !== setId));
            toast.info("Đã bỏ lưu bộ câu hỏi khỏi bộ sưu tập.");
        } catch (err) {
            toast.error("Lỗi khi bỏ lưu bộ câu hỏi!");
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
            toast.success(`Đã xuất file ${type.toUpperCase()} thành công!`);
        } catch (err) {
            toast.error("Lỗi xuất file!");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
        setSchoolMemberships([]);
        navigate('/');
    };

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    return {
        navigate, 
        currentUser, 
        questions, 
        formData, 
        setFormData,
        mySets, 
        questionSetFormData, 
        setQuestionSetFormData, 
        teacherClasses, 
        savedSetsData,
        schoolActionLabel,
        activeTab,
        setActiveTab,
        isCreateSetModalOpen,
        isCreateQuestionModalOpen,
        isEditQuestionModalOpen,
        isAddToSetModalOpen,
        targetQuestionForSet,
        editingQuestionData,
        setEditingQuestionData,
        handleOpenCreateSetModal,
        handleCloseCreateSetModal,
        handleOpenCreateQuestionModal,
        handleCloseCreateQuestionModal,
        handleOpenEditQuestionModal,
        handleCloseEditQuestionModal,
        handleSaveEditQuestion,
        handleOpenAddToSetModal,
        handleCloseAddToSetModal,
        handleSelectSetForQuestion,
        handleCreateSet, 
        handleCreateQuestion, 
        handleDeleteSet,
        handleDeleteQuestion, 
        handleRemoveSavedSet, 
        handleExport,
        handleLogout,
        handleToggleAnonymous,
        handleTogglePrivacy
    };
};
