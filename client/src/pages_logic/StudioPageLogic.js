import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy', topic: 'Toán', explanation: '', setId: ''
    });
  
    const [mySets, setMySets] = useState([]);
    const [questionSetFormData, setQuestionSetFormData] = useState({
        title: '', description: '', topic: 'Toán', isPublic: false, classId: ''
    });
    const [teacherClasses, setTeacherClasses] = useState([]);
    const [savedSetsData, setSavedSetsData] = useState([]);
    const [schoolMemberships, setSchoolMemberships] = useState([]);
    const [activeTab, setActiveTab] = useState('sets'); // 'sets' | 'questions' | 'saved'
    const [creationMode, setCreationMode] = useState('manual'); // 'manual' | 'ai'
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
    const [isSavingBatch, setIsSavingBatch] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
        const [aiSourceType, setAiSourceType] = useState('text'); // 'text' | 'image'
    const [aiImagePreview, setAiImagePreview] = useState('');
    const [aiImageName, setAiImageName] = useState('');
    const [aiImagePrompt, setAiImagePrompt] = useState('');
    const [isGeneratingImageBatch, setIsGeneratingImageBatch] = useState(false);

    const [aiInputData, setAiInputData] = useState({
        context: '',
        numQuestions: 3,
        topic: 'Vật lý',
        difficulty: 'mixed',
        setId: ''
    });

    const canGenerateAiExplanation = Boolean(
        formData.questionText && formData.questionText.trim() &&
        formData.optionA && formData.optionA.trim() &&
        formData.optionB && formData.optionB.trim() &&
        formData.optionC && formData.optionC.trim() &&
        formData.optionD && formData.optionD.trim()
    );

    const handleGenerateAiExplanation = async () => {
        if (!canGenerateAiExplanation || isGeneratingAi) return;
        setIsGeneratingAi(true);
        try {
            const res = await axios.post('http://localhost:5000/api/questions/generate-explanation', {
                questionText: formData.questionText,
                options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
                correctAnswer: formData.correctAnswer,
                topic: formData.topic
            }, {
                headers: { token: currentUser.accessToken }
            });

            if (res.data?.explanation) {
                setFormData(prev => ({
                    ...prev,
                    explanation: res.data.explanation
                }));
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || "Không thể tạo lời giải thích bằng AI. Vui lòng kiểm tra lại dịch vụ Ollama!";
            alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleGenerateQuestionsFromContext = async (e) => {
        if (e) e.preventDefault();
        if (!aiInputData.context || aiInputData.context.trim().length < 10) {
            alert("Vui lòng nhập đoạn tài liệu hoặc khái niệm kiến thức (tối thiểu 10 ký tự) để AI có cơ sở tạo câu hỏi!");
            return;
        }
        setIsGeneratingBatch(true);
        try {
            const res = await axios.post('http://localhost:5000/api/questions/generate-from-context', {
                context: aiInputData.context,
                numQuestions: aiInputData.numQuestions,
                topic: aiInputData.topic,
                difficulty: aiInputData.difficulty
            }, {
                headers: { token: currentUser.accessToken }
            });

            if (res.data?.questions && res.data.questions.length > 0) {
                setGeneratedQuestions(res.data.questions);
                if (res.data.questions.length === 1) {
                    const singleQ = res.data.questions[0];
                    setFormData({
                        questionText: singleQ.questionText,
                        optionA: singleQ.options[0] || '',
                        optionB: singleQ.options[1] || '',
                        optionC: singleQ.options[2] || '',
                        optionD: singleQ.options[3] || '',
                        correctAnswer: singleQ.correctAnswer === singleQ.options[1] ? 'B' : singleQ.correctAnswer === singleQ.options[2] ? 'C' : singleQ.correctAnswer === singleQ.options[3] ? 'D' : 'A',
                        difficulty: singleQ.difficulty || 'medium',
                        topic: singleQ.topic || aiInputData.topic || 'Khác',
                        explanation: singleQ.explanation || '',
                        setId: aiInputData.setId || ''
                    });
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Không thể tạo câu hỏi từ tài liệu bằng AI. Vui lòng kiểm tra lại dịch vụ Ollama!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsGeneratingBatch(false);
        }
    };

    
    // Tự động tối ưu hóa và co giãn kích thước ảnh (tối đa 1200px)
    // Giúp số lượng token hình ảnh vừa vặn với context size của model và tăng tốc độ xử lý AI
    const optimizeImageForAI = (dataUrl, maxDim = 1200, quality = 0.85) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    };

    const handleImageSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)!");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert("Dung lượng ảnh tối đa là 20MB. Vui lòng chọn ảnh nhẹ hơn!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const optimized = await optimizeImageForAI(e.target.result);
                setAiImagePreview(optimized);
                setAiImageName(file.name);
            } catch {
                setAiImagePreview(e.target.result);
                setAiImageName(file.name);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setAiImagePreview('');
        setAiImageName('');
    };

    const handlePasteImage = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    handleImageSelect(blob);
                    e.preventDefault();
                    break;
                }
            }
        }
    };

    const handleGenerateQuestionsFromImage = async (e) => {
        if (e) e.preventDefault();
        if (!aiImagePreview) {
            alert("Vui lòng tải lên hoặc dán hình ảnh trước khi tạo câu hỏi!");
            return;
        }
        setIsGeneratingImageBatch(true);
        try {
            const res = await axios.post('http://localhost:5000/api/questions/generate-from-image', {
                image: aiImagePreview,
                prompt: aiImagePrompt,
                numQuestions: aiInputData.numQuestions,
                topic: aiInputData.topic,
                difficulty: aiInputData.difficulty
            }, {
                headers: { token: currentUser.accessToken }
            });

            if (res.data?.questions && res.data.questions.length > 0) {
                setGeneratedQuestions(res.data.questions);
                if (res.data.questions.length === 1) {
                    const singleQ = res.data.questions[0];
                    setFormData({
                        questionText: singleQ.questionText,
                        optionA: singleQ.options[0] || '',
                        optionB: singleQ.options[1] || '',
                        optionC: singleQ.options[2] || '',
                        optionD: singleQ.options[3] || '',
                        correctAnswer: singleQ.correctAnswer === singleQ.options[1] ? 'B' : singleQ.correctAnswer === singleQ.options[2] ? 'C' : singleQ.correctAnswer === singleQ.options[3] ? 'D' : 'A',
                        difficulty: singleQ.difficulty || 'medium',
                        topic: singleQ.topic || aiInputData.topic || 'Khác',
                        explanation: singleQ.explanation || '',
                        setId: aiInputData.setId || ''
                    });
                }
            }
        } catch (err) {
            let msg = err.response?.data?.message || err.response?.data || "Không thể tạo câu hỏi từ hình ảnh bằng AI Qwen2-VL. Vui lòng kiểm tra lại dịch vụ Ollama!";
            if (typeof msg === 'string' && msg.includes('exceeds the available context size')) {
                msg = "Hình ảnh có kích thước/chi tiết quá lớn vượt quá giới hạn token của AI. Hệ thống đã tối ưu ảnh, vui lòng thử lại hoặc chụp/cắt gọn riêng phần câu hỏi!";
            }
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsGeneratingImageBatch(false);
        }
    };

    const handleLoadIntoForm = (q) => {
        setFormData({
            questionText: q.questionText,
            optionA: q.options[0] || '',
            optionB: q.options[1] || '',
            optionC: q.options[2] || '',
            optionD: q.options[3] || '',
            correctAnswer: q.correctAnswer === q.options[1] ? 'B' : q.correctAnswer === q.options[2] ? 'C' : q.correctAnswer === q.options[3] ? 'D' : 'A',
            difficulty: q.difficulty || 'medium',
            topic: q.topic || aiInputData.topic || 'Khác',
            explanation: q.explanation || '',
            setId: aiInputData.setId || ''
        });
        setCreationMode('manual');
        alert("Đã nạp câu hỏi vào biểu mẫu! Bạn có thể chỉnh sửa nội dung và bấm 'Lưu Câu Hỏi'.");
    };

    const handleSaveSingleGeneratedQuestion = async (q) => {
        try {
            const newQuestion = {
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                difficulty: q.difficulty || 'medium',
                topic: q.topic || aiInputData.topic || 'Khác',
                owner: currentUser._id
            };
            const res = await axios.post('http://localhost:5000/api/questions', newQuestion, {
                headers: { token: currentUser.accessToken }
            });

            if (aiInputData.setId) {
                await axios.put(`http://localhost:5000/api/sets/${aiInputData.setId}/add-question`, {
                    questionId: res.data._id
                }, { headers: { token: currentUser.accessToken } });
            }

            setGeneratedQuestions(prev => prev.filter(item => item !== q));
            fetchQuestions();
            alert("Đã lưu câu hỏi vào ngân hàng thành công!");
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi lưu câu hỏi!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        }
    };

    const handleSaveAllGeneratedQuestions = async () => {
        if (generatedQuestions.length === 0 || isSavingBatch) return;
        setIsSavingBatch(true);
        try {
            const res = await axios.post('http://localhost:5000/api/questions/batch', {
                questions: generatedQuestions,
                setId: aiInputData.setId || undefined
            }, {
                headers: { token: currentUser.accessToken }
            });

            alert(res.data?.message || `Đã lưu thành công ${generatedQuestions.length} câu hỏi!`);
            setGeneratedQuestions([]);
            fetchQuestions();
            if (aiInputData.setId) fetchMySets();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi lưu danh sách câu hỏi!";
            alert(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsSavingBatch(false);
        }
    };

    const handleClearGeneratedQuestions = () => {
        setGeneratedQuestions([]);
    };

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
                    setQuestionSetFormData({ title: '', description: '', topic: 'Toán', isPublic: false, classId: '' });
                    return;
                }
            }

            alert(classId ? 'Đã tạo bộ câu hỏi và thêm vào lớp!' : 'Tạo Bộ Câu Hỏi thành công!');
            fetchMySets();
            setQuestionSetFormData({ title: '', description: '', topic: 'Toán', isPublic: false, classId: '' });
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
                explanation: formData.explanation ? formData.explanation.trim() : '',
                difficulty: formData.difficulty,
                topic: formData.topic || 'Khác',
                owner: currentUser._id
            };

            const res = await axios.post('http://localhost:5000/api/questions', newQuestion, { headers: { token: currentUser.accessToken }});
          
            if (formData.setId && formData.setId !== '') {
                await axios.put(`http://localhost:5000/api/sets/${formData.setId}/add-question`, { questionId: res.data._id }, { headers: { token: currentUser.accessToken }});
            }
          
            alert("Đã lưu câu hỏi thành công!");
            fetchQuestions(); 
            setFormData({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', difficulty: 'easy', topic: 'Toán', explanation: '', setId: '' });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            alert("🛑 Server từ chối: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
            console.error("Chi tiết lỗi:", err.response || err);
        }
    };

    const handleAddToSet = async (questionId, setId) => {
        if (!setId) return; 
        try {
            await axios.put(`http://localhost:5000/api/sets/${setId}/add-question`, { questionId: questionId }, { headers: { token: currentUser.accessToken }});
            alert("Đã thêm câu hỏi vào bộ thành công!");
        } catch (err) {
            alert(err.response?.data || "Lỗi khi thêm vào bộ!");
        }
    };

    const handleDeleteSet = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa BỘ câu hỏi này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/sets/${id}`, { headers: { token: currentUser.accessToken } });
                fetchMySets();
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi khi xóa BỘ CÂU HỎI!";
                alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
            }
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa CÂU HỎI này?")) {
            try {
                await axios.delete(`http://localhost:5000/api/questions/${id}`, { headers: { token: currentUser.accessToken } });
                alert("Đã xóa câu hỏi thành công!");
                fetchQuestions();
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.response?.data || "Lỗi khi xóa câu hỏi!";
                alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
            }
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
        handleCreateSet, 
        handleCreateQuestion, 
        handleAddToSet, 
        handleDeleteSet,
        handleDeleteQuestion, 
        handleRemoveSavedSet, 
        handleExport,
        handleLogout,
        isGeneratingAi,
        canGenerateAiExplanation,
        handleGenerateAiExplanation,
        creationMode,
        setCreationMode,
        aiInputData,
        setAiInputData,
        isGeneratingBatch,
        isSavingBatch,
        generatedQuestions,
        handleGenerateQuestionsFromContext,
        aiSourceType,
        setAiSourceType,
        aiImagePreview,
        setAiImagePreview,
        aiImageName,
        aiImagePrompt,
        setAiImagePrompt,
        isGeneratingImageBatch,
        handleImageSelect,
        handleRemoveImage,
        handlePasteImage,
        handleGenerateQuestionsFromImage,
        handleLoadIntoForm,
        handleSaveSingleGeneratedQuestion,
        handleSaveAllGeneratedQuestions,
        handleClearGeneratedQuestions
    };
};
