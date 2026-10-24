import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './useDarkMode'; 

export const LandingPageLogic = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useDarkMode(); 

    // Các state quản lý từ khóa tìm kiếm và danh mục đang chọn
    const [searchDev, setSearchDev] = useState("");
    const [searchCommunity, setSearchCommunity] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");

    // Hàm điều hướng sang Library Page kèm tham số URL
    const handleSearch = (e, query, category = selectedCategory) => {
        if (!e || e.key === 'Enter' || e.type === 'click') {
            const catParam = category === "Tất cả" ? "" : category;
            navigate(`/library?search=${encodeURIComponent(query || "")}${catParam ? `&category=${encodeURIComponent(catParam)}` : ""}`);
        }
    };

    // Xuất ra tất cả những gì giao diện cần dùng
    return {
        navigate,
        isDark,
        toggleTheme,
        searchDev,
        setSearchDev,
        searchCommunity,
        setSearchCommunity,
        selectedCategory,
        setSelectedCategory,
        handleSearch
    };
};
