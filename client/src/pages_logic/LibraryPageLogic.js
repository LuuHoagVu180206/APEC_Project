import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export const LibraryPageLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('user'));
            return saved?.username ? saved : null;
        } catch {
            return null;
        }
    });

    const searchParams = new URLSearchParams(location.search);
    const initialSearch = searchParams.get('search') || "";
    const initialCategory = searchParams.get('category') || "Tất cả";

    const [questionSets, setQuestionSets] = useState([]);
    const [weeklySets, setWeeklySets] = useState([]);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [savedSets, setSavedSets] = useState(currentUser?.savedSets || []);
    const [schoolMemberships, setSchoolMemberships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Tự động nhận và đồng bộ từ khóa tìm kiếm khi chuyển hướng từ Landing Page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchVal = params.get('search');
        const catVal = params.get('category');
        if (searchVal !== null) {
            setSearchTerm(searchVal);
        }
        if (catVal !== null) {
            setActiveCategory(catVal);
        }
    }, [location.search]);

    useEffect(() => {
        fetchLibrary();
        fetchWeeklySets();
    }, []);

    // Tải danh sách trường cho navbar
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

    const fetchLibrary = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/sets/library');
            setQuestionSets(res.data);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu thư viện:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWeeklySets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/sets/weekly');
            setWeeklySets(res.data || []);
        } catch (err) {
            console.warn("Lỗi lấy danh sách đề Weekly:", err);
        }
    };

    const canDelete = (ownerId) => {
        if (!currentUser) return false;
        if (currentUser.role === 'admin') return true;
        if (currentUser._id === ownerId || currentUser.id === ownerId) return true;
        return false;
    };

    const handleLike = async (setId) => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để thả tim cho bộ câu hỏi này nhé!");
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/sets/${setId}/like`, {}, {
                headers: { token: currentUser.accessToken }
            });
            fetchLibrary(); 
        } catch (err) {
            console.error(err);
            alert("Lỗi khi tương tác!");
        }
    };

    const handleToggleLikeSet = async (setId) => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để lưu bộ câu hỏi vào tủ đồ cá nhân!");
            return;
        }
        try {
            const res = await axios.put('http://localhost:5000/api/users/toggle-save-set', {
                setId: setId
            }, {
                headers: { token: currentUser.accessToken }
            });
            
            let newSavedSets = [...savedSets];
            if (res.data.isSaved) {
                newSavedSets.push(setId); 
            } else {
                newSavedSets = newSavedSets.filter(id => id !== setId); 
            }
            setSavedSets(newSavedSets);

            const updatedUser = { ...currentUser, savedSets: newSavedSets };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            alert("🛑 Không thể lưu: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
            console.error("Chi tiết lỗi:", err.response || err);
        }
    };

    const handleDelete = async (setId) => {
        if (window.confirm("Bạn chắc chắn muốn xóa bộ câu hỏi này khỏi hệ thống?")) {
            try {
                await axios.delete(`http://localhost:5000/api/sets/${setId}`, {
                    headers: { token: currentUser.accessToken }
                });
                fetchLibrary();
            } catch (err) {
                alert("Lỗi hoặc bạn không có quyền xóa!");
            }
        }
    };

    const handleExport = async (setId, type) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/sets/${setId}/export?type=${type}`, {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const extension = type === 'excel' ? 'xlsx' : 'pdf';
            const fileName = `Bo_Cau_Hoi_${setId}.${extension}`;
            link.setAttribute('download', fileName);
            
            document.body.appendChild(link);
            link.click();
            link.remove(); 
        } catch (err) {
            console.error("Lỗi xuất file:", err);
            alert("Lỗi khi tải file! Vui lòng thử lại.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
        setSchoolMemberships([]);
        navigate('/');
    };

    const filteredSets = questionSets.filter(set => {
        const searchLower = searchTerm.toLowerCase();
        
        const matchesSearch = 
            !searchTerm ||
            set.title.toLowerCase().includes(searchLower) || 
            (set.topic && set.topic.toLowerCase().includes(searchLower)) ||
            (set.description && set.description.toLowerCase().includes(searchLower));
        
        const matchesCategory = 
            activeCategory === "Tất cả" || 
            activeCategory === "Phổ biến" || 
            (set.topic && set.topic.toLowerCase().includes(activeCategory.toLowerCase())) ||
            (activeCategory === "Khác" && (!set.topic || !['toán', 'tiếng anh', 'lịch sử', 'hoá học', 'vật lý', 'tin học', 'sinh'].some(k => set.topic.toLowerCase().includes(k))));
            
        return matchesSearch && matchesCategory;
    });

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    return {
        navigate,
        currentUser,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        savedSets,
        filteredSets,
        weeklySets,
        isLoading,
        schoolActionLabel,
        canDelete,
        handleLike,
        handleToggleLikeSet,
        handleDelete,
        handleExport,
        handleLogout
    };
};
