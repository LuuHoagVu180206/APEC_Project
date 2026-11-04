import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuthorInfo } from '../utils/authorUtils';

const SESSION_STORAGE_KEY = 'library_filter_state';

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

    // Khởi tạo bộ lọc từ sessionStorage nếu người dùng vừa F5/refresh trang
    const getInitialFilterState = () => {
        try {
            const savedSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (savedSession) {
                return JSON.parse(savedSession);
            }
        } catch (e) {
            console.warn('Lỗi đọc sessionStorage:', e);
        }

        const searchParams = new URLSearchParams(location.search);
        return {
            searchTerm: searchParams.get('search') || "",
            activeCategory: searchParams.get('category') || "Tất cả",
            authorFilter: "",
            typeFilter: "all",      // 'all' | 'weekly' | 'default' | 'user'
            sortStat: "newest"       // 'newest' | 'likes' | 'copies' | 'plays' | 'plays_solo' | 'plays_multi'
        };
    };

    const initialFilters = getInitialFilterState();

    const [questionSets, setQuestionSets] = useState([]);
    const [weeklySets, setWeeklySets] = useState([]);
    const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
    const [activeCategory, setActiveCategory] = useState(initialFilters.activeCategory);
    const [authorFilter, setAuthorFilter] = useState(initialFilters.authorFilter || "");
    const [typeFilter, setTypeFilter] = useState(initialFilters.typeFilter || "all");
    const [sortStat, setSortStat] = useState(initialFilters.sortStat || "newest");
    
    // Quản lý modal / popover bộ lọc nâng cao
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [authorInputFocus, setAuthorInputFocus] = useState(false);

    const [savedSets, setSavedSets] = useState(currentUser?.savedSets || []);
    const [schoolMemberships, setSchoolMemberships] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Đồng bộ URL params nếu có
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchVal = params.get('search');
        const catVal = params.get('category');
        if (searchVal !== null && searchVal !== '') {
            setSearchTerm(searchVal);
        }
        if (catVal !== null && catVal !== '') {
            setActiveCategory(catVal);
        }
    }, [location.search]);

    // Lưu trạng thái bộ lọc vào sessionStorage khi có thay đổi để duy trì khi F5
    useEffect(() => {
        const hasCustomFilter = Boolean(
            searchTerm.trim() !== "" ||
            activeCategory !== "Tất cả" ||
            authorFilter.trim() !== "" ||
            typeFilter !== "all" ||
            sortStat !== "newest"
        );

        if (hasCustomFilter) {
            const stateToSave = {
                searchTerm,
                activeCategory,
                authorFilter,
                typeFilter,
                sortStat
            };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
        } else {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, [searchTerm, activeCategory, authorFilter, typeFilter, sortStat]);

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
            setQuestionSets(res.data || []);
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

    // Kiểm tra xem người dùng có đang áp dụng bất kỳ bộ lọc hay tìm kiếm nào không
    const isSearchingOrFiltering = Boolean(
        searchTerm.trim() !== "" ||
        authorFilter.trim() !== "" ||
        activeCategory !== "Tất cả" ||
        typeFilter !== "all" ||
        sortStat !== "newest"
    );

    // Đếm số lượng bộ lọc đang kích hoạt (để hiển thị badge trên nút Filter)
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (authorFilter.trim() !== "") count += 1;
        if (activeCategory !== "Tất cả") count += 1;
        if (typeFilter !== "all") count += 1;
        if (sortStat !== "newest") count += 1;
        return count;
    }, [authorFilter, activeCategory, typeFilter, sortStat]);

    // Trích xuất danh sách tất cả tác giả từ các bộ câu hỏi hiện có (loại bỏ trùng lặp)
    const allAuthors = useMemo(() => {
        const authorSet = new Set();
        // Luôn có APEC Group
        authorSet.add("APEC Group");

        const extract = (setList) => {
            setList.forEach(item => {
                const info = getAuthorInfo(item, currentUser);
                if (info && info.name && !info.isAnonymous && info.name !== "Người dùng ẩn danh") {
                    authorSet.add(info.name.trim());
                }
            });
        };

        extract(questionSets);
        extract(weeklySets);
        return Array.from(authorSet).sort();
    }, [questionSets, weeklySets, currentUser]);

    // Gợi ý tác giả khớp gần nhất với từ khóa người dùng nhập
    const authorSuggestions = useMemo(() => {
        if (!authorFilter.trim()) return allAuthors.slice(0, 6);
        const query = authorFilter.toLowerCase().trim();
        return allAuthors.filter(name => name.toLowerCase().includes(query)).slice(0, 8);
    }, [authorFilter, allAuthors]);

    // Đặt lại toàn bộ bộ lọc & tìm kiếm về mặc định
    const handleResetFilters = () => {
        setSearchTerm("");
        setActiveCategory("Tất cả");
        setAuthorFilter("");
        setTypeFilter("all");
        setSortStat("newest");
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
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
            alert("🛑 " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
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

    const handleCopySet = async (setId) => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để sao chép bộ câu hỏi!");
            navigate('/login');
            return;
        }

        try {
            const res = await axios.post(`http://localhost:5000/api/sets/${setId}/copy`, {}, {
                headers: { token: currentUser.accessToken }
            });
            alert(`✅ ${res.data.message || 'Đã sao chép bộ câu hỏi thành công!'}\nBộ đề mới đã được lưu vào Studio của bạn dưới dạng Riêng tư.`);
            // Cập nhật lại số lượt copy
            fetchLibrary();
            if (window.confirm("Bạn có muốn chuyển đến Studio để xem bộ đề vừa sao chép không?")) {
                navigate('/studio');
            }
        } catch (err) {
            console.error("Lỗi sao chép bộ câu hỏi:", err);
            const msg = err.response?.data?.message || err.response?.data || "Lỗi khi sao chép bộ câu hỏi!";
            alert(msg);
        }
    };

    const handlePlaySet = async (setId) => {
        if (setId && !String(setId).startsWith('w')) {
            axios.post(`http://localhost:5000/api/sets/${setId}/play`, { mode: 'solo' }).catch(() => {});
        }
        navigate(setId ? `/game?setId=${setId}` : '/game');
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

    // TẬP HỢP TẤT CẢ CÁC BỘ CÂU HỎI THEO BỐI CẢNH TÌM KIẾM / LỌC
    // Khi đang tìm kiếm hoặc lọc: gộp cả weeklySets vào danh sách chung (khử trùng lặp qua _id)
    // Khi không tìm kiếm: danh sách câu hỏi chính bên dưới loại trừ các bộ weekly đã hiện ở khối trên
    const combinedSets = useMemo(() => {
        const map = new Map();
        
        if (isSearchingOrFiltering) {
            // Gộp tất cả
            questionSets.forEach(s => { if (s._id) map.set(String(s._id), s); });
            weeklySets.forEach(w => { if (w._id) map.set(String(w._id), w); });
        } else {
            // Không lọc: khối trên đã hiện weeklySets, khối dưới chỉ hiện các bộ đề còn lại
            questionSets.forEach(s => {
                if (s._id) {
                    // Nếu là đề weekly mà đã có trong danh sách weekly thì không lặp lại ở dưới
                    if (!s.isWeekly) {
                        map.set(String(s._id), s);
                    }
                }
            });
        }
        return Array.from(map.values());
    }, [questionSets, weeklySets, isSearchingOrFiltering]);

    // XỬ LÝ LỌC & SẮP XẾP TOÀN DIỆN
    const filteredSets = useMemo(() => {
        const searchLower = searchTerm.trim().toLowerCase();
        const authorLower = authorFilter.trim().toLowerCase();

        const result = combinedSets.filter(set => {
            const authorInfo = getAuthorInfo(set, currentUser);
            const authorName = (authorInfo.name || '').toLowerCase();

            // 1. Lọc theo từ khóa tìm kiếm chung (tiêu đề, mô tả, chủ đề, tên tác giả)
            const matchesSearch = 
                !searchLower ||
                (set.title && set.title.toLowerCase().includes(searchLower)) || 
                (set.topic && set.topic.toLowerCase().includes(searchLower)) ||
                (set.description && set.description.toLowerCase().includes(searchLower)) ||
                authorName.includes(searchLower);

            if (!matchesSearch) return false;

            // 2. Lọc theo Tên tác giả (Author Filter)
            if (authorLower) {
                if (!authorName.includes(authorLower)) {
                    return false;
                }
            }

            // 3. Lọc theo Chủ đề (Topic Category Filter)
            const matchesCategory = 
                activeCategory === "Tất cả" || 
                activeCategory === "Phổ biến" || 
                (set.topic && set.topic.toLowerCase().includes(activeCategory.toLowerCase())) ||
                (activeCategory === "Khác" && (!set.topic || !['toán', 'tiếng anh', 'lịch sử', 'hoá học', 'vật lý', 'tin học', 'sinh'].some(k => set.topic.toLowerCase().includes(k))));

            if (!matchesCategory) return false;

            // 4. Lọc theo Phân loại bộ câu hỏi (Type Filter: 'all' | 'weekly' | 'default' | 'user')
            if (typeFilter === 'weekly') {
                if (!set.isWeekly) return false;
            } else if (typeFilter === 'default') {
                if (!set.isDefault || set.isWeekly) return false;
            } else if (typeFilter === 'user') {
                if (set.isDefault || set.isWeekly) return false;
            }

            return true;
        });

        // 5. Sắp xếp theo số liệu thống kê (Sort by Stats)
        result.sort((a, b) => {
            if (sortStat === 'likes') {
                return (b.likesCount || 0) - (a.likesCount || 0);
            }
            if (sortStat === 'copies') {
                return (b.copyCount || 0) - (a.copyCount || 0);
            }
            if (sortStat === 'plays') {
                const playsB = (b.playCount || 0) || ((b.playCountSolo || 0) + (b.playCountMultiplayer || 0));
                const playsA = (a.playCount || 0) || ((a.playCountSolo || 0) + (a.playCountMultiplayer || 0));
                return playsB - playsA;
            }
            if (sortStat === 'plays_solo') {
                return (b.playCountSolo || 0) - (a.playCountSolo || 0);
            }
            if (sortStat === 'plays_multi') {
                return (b.playCountMultiplayer || 0) - (a.playCountMultiplayer || 0);
            }
            // Mặc định: 'newest' (ngày tạo mới nhất hoặc default lên đầu)
            if (b.isDefault !== a.isDefault) {
                return (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0);
            }
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        return result;
    }, [combinedSets, searchTerm, authorFilter, activeCategory, typeFilter, sortStat, currentUser]);

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    return {
        navigate,
        currentUser,
        searchTerm,
        setSearchTerm,
        activeCategory,
        setActiveCategory,
        authorFilter,
        setAuthorFilter,
        typeFilter,
        setTypeFilter,
        sortStat,
        setSortStat,
        isFilterModalOpen,
        setIsFilterModalOpen,
        authorInputFocus,
        setAuthorInputFocus,
        allAuthors,
        authorSuggestions,
        activeFiltersCount,
        isSearchingOrFiltering,
        handleResetFilters,
        savedSets,
        filteredSets,
        weeklySets,
        isLoading,
        schoolActionLabel,
        canDelete,
        handleLike,
        handleToggleLikeSet,
        handleDelete,
        handleCopySet,
        handlePlaySet,
        handleExport,
        handleLogout
    };
};
