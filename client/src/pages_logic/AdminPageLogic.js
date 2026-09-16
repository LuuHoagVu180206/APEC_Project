import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AdminPageLogic = () => {
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [currentVersion, setCurrentVersion] = useState("v1.0");
    const [newVersion, setNewVersion] = useState("");
    const [allQuestions, setAllQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteReason, setDeleteReason] = useState("");

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchAllQuestions();
        fetchVersion();
    }, [navigate]);

    const fetchAllQuestions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/questions');
            setAllQuestions(res.data);
        } catch (err) {
            console.error("Lỗi lấy danh sách câu hỏi:", err);
        }
    };

    const fetchVersion = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/settings/version');
            setCurrentVersion(res.data.version);
        } catch (err) {
            console.error(err);
        }
    };

    const executeDelete = async () => {
        if (!deleteReason.trim()) {
            alert("Admin phải nhập lý do để lưu vết hệ thống!");
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/questions/${deleteTarget._id}`, {
                headers: { token: currentUser.accessToken },
                data: { reason: deleteReason }
            });
            
            alert("Đã xóa câu hỏi và ghi nhận lý do!");
            setDeleteTarget(null);
            setDeleteReason("");
            fetchAllQuestions();
        } catch (err) {
            alert("Lỗi khi thực thi lệnh xóa!");
            console.error(err);
        }
    };

    const handleUpdateVersion = async () => {
        if (!newVersion) return alert("Vui lòng nhập tên phiên bản!");
        try {
            await axios.post('http://localhost:5000/api/settings/version', {
                version: newVersion
            });
            alert(`Đã chuyển game sang phiên bản: ${newVersion}`);
            setCurrentVersion(newVersion);
            setNewVersion("");
        } catch (err) {
            alert("Lỗi cập nhật version");
        }
    };

    const filteredQuestions = allQuestions.filter(q => 
        q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Xuất các biến và hàm cần thiết cho UI
    return {
        navigate,
        currentVersion,
        newVersion,
        setNewVersion,
        searchTerm,
        setSearchTerm,
        deleteTarget,
        setDeleteTarget,
        deleteReason,
        setDeleteReason,
        filteredQuestions,
        executeDelete,
        handleUpdateVersion,
        allQuestions
    };
};