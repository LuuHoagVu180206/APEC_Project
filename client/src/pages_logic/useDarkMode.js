import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    // Khởi tạo state dựa trên localStorage. Nếu chưa có, mặc định là Light mode.
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    // Mỗi khi isDark thay đổi, cập nhật thuộc tính ở thẻ <html> và lưu vào localStorage
    useEffect(() => {
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return { isDark, toggleTheme };
};