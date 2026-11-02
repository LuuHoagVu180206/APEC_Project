import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../utils/toast';

export const QuestionSetPageLogic = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('user'));
            return saved?.username ? saved : null;
        } catch {
            return null;
        }
    });
    
    const [setData, setSetData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [schoolMemberships, setSchoolMemberships] = useState([]);

    // Modals & States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    // Chế độ thêm câu hỏi: 'new' (tạo câu hỏi mới) hoặc 'existing' (chọn từ câu hỏi có sẵn)
    const [addQuestionMode, setAddQuestionMode] = useState('new');
    const [myExistingQuestions, setMyExistingQuestions] = useState([]);
    const [isFetchingExistingQuestions, setIsFetchingExistingQuestions] = useState(false);
    const [selectedExistingIds, setSelectedExistingIds] = useState([]);
    const [existingSearchKeyword, setExistingSearchKeyword] = useState('');

    // Form data chỉnh sửa bộ câu hỏi
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        topic: 'Toán',
        isPublic: false,
        isAnonymous: false
    });

    // Form data thêm câu hỏi mới trực tiếp
    const [newQuestionData, setNewQuestionData] = useState({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        difficulty: 'easy',
        topic: 'Toán'
    });

    const [savedSets, setSavedSets] = useState(currentUser?.savedSets || []);

    const fetchSetDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/sets/${id}`, {
                headers: currentUser?.accessToken ? { token: currentUser.accessToken } : {}
            });
            setSetData(res.data.set);
            setQuestions(res.data.questions || []);
            setEditFormData({
                title: res.data.set.title || '',
                description: res.data.set.description || '',
                topic: res.data.set.topic || 'Toán',
                isPublic: Boolean(res.data.set.isPublic),
                isAnonymous: Boolean(res.data.set.isAnonymous)
            });
            setNewQuestionData(prev => ({
                ...prev,
                topic: res.data.set.topic || 'Toán'
            }));
        } catch (err) {
            toast.error("Không thể tải chi tiết bộ câu hỏi!");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSetDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.accessToken, id]);

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

    const ownerId = setData?.owner?._id || setData?.owner?.id || (typeof setData?.owner === 'string' ? setData.owner : null);
    const currentUserId = currentUser?._id || currentUser?.id;
    const isOwner = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));
    const isSaved = Boolean(setData && savedSets.includes(setData._id));

    // Lấy ngân hàng câu hỏi do user tự tạo
    const fetchMyQuestions = async () => {
        if (!currentUser?.accessToken) return;
        setIsFetchingExistingQuestions(true);
        try {
            const res = await axios.get('http://localhost:5000/api/questions/mine', {
                headers: { token: currentUser.accessToken }
            });
            setMyExistingQuestions(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy danh sách câu hỏi của tôi:", err);
            // Fallback lấy toàn bộ nếu /mine có trục trặc
            try {
                const fallbackRes = await axios.get('http://localhost:5000/api/questions');
                const myQs = (fallbackRes.data || []).filter(q => {
                    const qOwner = q.owner?._id || q.owner?.id || (typeof q.owner === 'string' ? q.owner : null);
                    return qOwner && String(qOwner) === String(currentUserId);
                });
                setMyExistingQuestions(myQs);
            } catch {
                setMyExistingQuestions([]);
            }
        } finally {
            setIsFetchingExistingQuestions(false);
        }
    };

    // Mở / Đóng Modal chỉnh sửa bộ câu hỏi
    const handleOpenEditModal = () => {
        if (!isOwner) return;
        setEditFormData({
            title: setData?.title || '',
            description: setData?.description || '',
            topic: setData?.topic || 'Toán',
            isPublic: Boolean(setData?.isPublic),
            isAnonymous: Boolean(setData?.isAnonymous)
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    // Lưu thông tin chỉnh sửa bộ câu hỏi
    const handleSaveEditSet = async (e) => {
        e.preventDefault();
        if (!isOwner) return;

        setIsSavingEdit(true);
        try {
            const payload = {
                title: editFormData.title.trim(),
                description: editFormData.description.trim(),
                topic: editFormData.topic,
                isPublic: editFormData.isPublic,
                isAnonymous: editFormData.isPublic ? editFormData.isAnonymous : false
            };

            const res = await axios.put(`http://localhost:5000/api/sets/${id}`, payload, {
                headers: { token: currentUser.accessToken }
            });
            setSetData(res.data);
            setIsEditModalOpen(false);
            toast.success("Đã cập nhật thông tin bộ câu hỏi thành công!");
        } catch (err) {
            console.error("Lỗi cập nhật bộ câu hỏi:", err);
            toast.error("Lỗi khi cập nhật bộ câu hỏi!");
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Mở / Đóng Modal thêm câu hỏi
    const handleOpenAddQuestionModal = () => {
        if (!isOwner) return;
        setNewQuestionData({
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 'A',
            difficulty: 'easy',
            topic: setData?.topic || 'Toán'
        });
        setAddQuestionMode('new');
        setSelectedExistingIds([]);
        setExistingSearchKeyword('');
        setIsAddQuestionModalOpen(true);
        fetchMyQuestions();
    };

    const handleCloseAddQuestionModal = () => {
        setIsAddQuestionModalOpen(false);
        setSelectedExistingIds([]);
    };

    // Thêm câu hỏi mới tạo trực tiếp vào bộ đề
    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        if (!isOwner) return;
        setIsAddingQuestion(true);
        try {
            const getCorrectText = (key) => {
                if (key === 'A') return newQuestionData.optionA;
                if (key === 'B') return newQuestionData.optionB;
                if (key === 'C') return newQuestionData.optionC;
                return newQuestionData.optionD;
            };

            const payload = {
                questionText: newQuestionData.questionText.trim(),
                options: [
                    newQuestionData.optionA.trim(),
                    newQuestionData.optionB.trim(),
                    newQuestionData.optionC.trim(),
                    newQuestionData.optionD.trim()
                ],
                correctAnswer: getCorrectText(newQuestionData.correctAnswer),
                difficulty: newQuestionData.difficulty,
                topic: newQuestionData.topic || setData.topic || 'Khác'
            };

            const res = await axios.post(`http://localhost:5000/api/sets/${id}/questions`, payload, {
                headers: { token: currentUser.accessToken }
            });

            setQuestions(prev => [...prev, res.data.question]);
            setIsAddQuestionModalOpen(false);
            toast.success("Đã thêm câu hỏi mới vào bộ đề thành công!");
        } catch (err) {
            console.error("Lỗi thêm câu hỏi:", err);
            toast.error(err.response?.data?.message || err.response?.data || "Lỗi khi thêm câu hỏi!");
        } finally {
            setIsAddingQuestion(false);
        }
    };

    // Chọn / Bỏ chọn câu hỏi có sẵn
    const handleToggleSelectExistingQuestion = (questionId) => {
        setSelectedExistingIds(prev => {
            if (prev.includes(questionId)) {
                return prev.filter(qId => qId !== questionId);
            } else {
                return [...prev, questionId];
            }
        });
    };

    // Thêm các câu hỏi có sẵn đã chọn vào bộ đề
    const handleAddExistingQuestionsToSet = async () => {
        if (!isOwner) return;
        if (selectedExistingIds.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một câu hỏi để thêm!");
            return;
        }

        setIsAddingQuestion(true);
        try {
            const res = await axios.put(`http://localhost:5000/api/sets/${id}/add-questions`, {
                questionIds: selectedExistingIds
            }, {
                headers: { token: currentUser.accessToken }
            });

            if (res.data?.questions) {
                setQuestions(res.data.questions);
            } else {
                await fetchSetDetails();
            }

            toast.success(res.data?.message || `Đã thêm thành công ${selectedExistingIds.length} câu hỏi vào bộ đề!`);
            setIsAddQuestionModalOpen(false);
            setSelectedExistingIds([]);
        } catch (err) {
            console.error("Lỗi thêm câu hỏi có sẵn:", err);
            toast.error(err.response?.data?.message || err.response?.data || "Lỗi khi thêm câu hỏi vào bộ!");
        } finally {
            setIsAddingQuestion(false);
        }
    };

    // Xóa câu hỏi khỏi bộ đề
    const handleDeleteQuestion = async (questionId) => {
        if (!isOwner) return;
        if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi bộ đề?")) return;

        try {
            await axios.put(`http://localhost:5000/api/sets/${id}/remove-question`, {
                questionId
            }, {
                headers: { token: currentUser.accessToken }
            });
            setQuestions(prev => prev.filter(q => q._id !== questionId));
            toast.success("Đã xóa câu hỏi khỏi bộ đề thành công!");
        } catch (err) {
            console.error("Lỗi xóa câu hỏi:", err);
            toast.error("Lỗi khi xóa câu hỏi!");
        }
    };

    // Sao chép bộ câu hỏi về Góc Sáng Tạo của mình
    const handleCopySet = async () => {
        if (!currentUser) {
            toast.warning("Vui lòng đăng nhập để sao chép bộ câu hỏi!");
            navigate('/login');
            return;
        }
        if (isOwner) {
            toast.warning("Bạn không thể sao chép bộ câu hỏi của chính mình!");
            return;
        }

        setIsCopying(true);
        try {
            const res = await axios.post(`http://localhost:5000/api/sets/${id}/copy`, {}, {
                headers: { token: currentUser.accessToken }
            });
            toast.success(`Đã sao chép bộ đề thành công! Bộ đề mới đã được lưu vào Studio của bạn với tên: ${res.data.set?.title}`);
            if (window.confirm("Bộ đề đã được lưu vào Studio của bạn dưới dạng Riêng tư. Bạn có muốn chuyển đến Studio ngay không?")) {
                navigate('/studio');
            }
        } catch (err) {
            console.error("Lỗi sao chép bộ câu hỏi:", err);
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi sao chép bộ câu hỏi!";
            toast.error(msg);
        } finally {
            setIsCopying(false);
        }
    };

    // Thả tim / Lưu bộ câu hỏi
    const handleToggleSave = async () => {
        if (!currentUser) {
            toast.warning("Vui lòng đăng nhập để lưu bộ câu hỏi vào tủ đồ cá nhân!");
            return;
        }
        if (isOwner) {
            toast.warning("Bạn không thể lưu bộ câu hỏi của chính mình!");
            return;
        }

        try {
            const res = await axios.put('http://localhost:5000/api/users/toggle-save-set', {
                setId: id
            }, {
                headers: { token: currentUser.accessToken }
            });

            let newSavedSets = [...savedSets];
            if (res.data.isSaved) {
                newSavedSets.push(id);
                toast.success("Đã lưu bộ câu hỏi vào bộ sưu tập cá nhân!");
            } else {
                newSavedSets = newSavedSets.filter(sId => sId !== id);
                toast.info("Đã bỏ lưu bộ câu hỏi khỏi bộ sưu tập.");
            }
            setSavedSets(newSavedSets);

            const updatedUser = { ...currentUser, savedSets: newSavedSets };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
        }
    };

    const handleExport = async (type) => {
        if (!setData?._id) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/sets/${setData._id}/export?type=${type}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = type === 'excel' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `Bo_Cau_Hoi_${setData._id}.${ext}`);
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
        navigate('/');
    };

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    return {
        id,
        navigate,
        currentUser,
        setData,
        questions,
        isLoading,
        isOwner,
        isSaved,
        schoolActionLabel,
        isEditModalOpen,
        isAddQuestionModalOpen,
        isSavingEdit,
        isAddingQuestion,
        isCopying,
        editFormData,
        setEditFormData,
        newQuestionData,
        setNewQuestionData,
        addQuestionMode,
        setAddQuestionMode,
        myExistingQuestions,
        isFetchingExistingQuestions,
        selectedExistingIds,
        existingSearchKeyword,
        setExistingSearchKeyword,
        handleOpenEditModal,
        handleCloseEditModal,
        handleSaveEditSet,
        handleOpenAddQuestionModal,
        handleCloseAddQuestionModal,
        handleCreateQuestion,
        handleToggleSelectExistingQuestion,
        handleAddExistingQuestionsToSet,
        handleDeleteQuestion,
        handleCopySet,
        handleToggleSave,
        handleExport,
        handleLogout
    };
};
