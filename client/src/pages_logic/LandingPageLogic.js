import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from './useDarkMode'; 

export const LandingPageLogic = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useDarkMode(); 

    // Các state quản lý từ khóa tìm kiếm
    const [searchDev, setSearchDev] = useState("");
    const [searchCommunity, setSearchCommunity] = useState("");

    // Hàm điều hướng sang Library Page kèm tham số URL
    const handleSearch = (e, query, category = "Tất cả") => {
        if (e.key === 'Enter' || e.type === 'click') {
            navigate(`/library?search=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
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
        handleSearch
    };
};