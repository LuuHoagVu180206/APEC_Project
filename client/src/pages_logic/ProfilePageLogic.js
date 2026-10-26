import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const ProfilePageLogic = () => {
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('user'));
            return saved?.username ? saved : null;
        } catch {
            return null;
        }
    });

    const [formData, setFormData] = useState({
        displayName: '',
        fullName: '',
        phone: '',
        email: '',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [schoolMemberships, setSchoolMemberships] = useState([]);

    // 1. Kiểm tra đăng nhập và tải dữ liệu người dùng mới nhất
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchLatestProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/me', {
                    headers: { token: currentUser.accessToken }
                });
                const userData = res.data;
                setFormData({
                    displayName: userData.displayName || '',
                    fullName: userData.fullName || '',
                    phone: userData.phone || '',
                    email: userData.email || '',
                    avatar: userData.avatar || ''
                });

                // Cập nhật lại localStorage nếu có dữ liệu mới
                const updated = { ...currentUser, ...userData };
                localStorage.setItem('user', JSON.stringify(updated));
                setCurrentUser(updated);
            } catch (err) {
                // Fallback nếu không gọi được API
                setFormData({
                    displayName: currentUser.displayName || '',
                    fullName: currentUser.fullName || '',
                    phone: currentUser.phone || '',
                    email: currentUser.email || '',
                    avatar: currentUser.avatar || ''
                });
            }
        };

        fetchLatestProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    // 2. Tải danh sách trường cho navbar
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

    // 3. Xử lý tải ảnh đại diện từ máy tính
    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setProfileMessage({ type: 'error', text: 'Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, JPEG, WEBP)!' });
            return;
        }

        // Giới hạn 3MB
        if (file.size > 3 * 1024 * 1024) {
            setProfileMessage({ type: 'error', text: 'Kích thước ảnh tối đa là 3MB. Vui lòng chọn ảnh nhỏ hơn!' });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result }));
            setProfileMessage({ type: 'info', text: 'Ảnh đại diện mới đã được nạp. Hãy bấm "Lưu thay đổi" để áp dụng!' });
        };
        reader.onerror = () => {
            setProfileMessage({ type: 'error', text: 'Không thể đọc tệp ảnh!' });
        };
        reader.readAsDataURL(file);
    };

    // 4. Xóa ảnh đại diện (trở về avatar chữ cái mặc định của web)
    const handleRemoveAvatar = () => {
        setFormData(prev => ({ ...prev, avatar: '' }));
        setProfileMessage({ type: 'info', text: 'Đã bỏ ảnh đại diện (sẽ dùng avatar mặc định). Bấm "Lưu thay đổi" để xác nhận!' });
    };

    // 5. Cập nhật hồ sơ thông tin cá nhân
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const res = await axios.put('http://localhost:5000/api/users/update-profile', formData, {
                headers: { token: currentUser.accessToken }
            });

            const updatedUser = { ...res.data, accessToken: currentUser.accessToken };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            setProfileMessage({ type: 'success', text: 'Cập nhật hồ sơ cá nhân thành công!' });
            setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
        } catch (err) {
            console.error("Lỗi cập nhật hồ sơ:", err);
            const errText = err.response?.data || 'Không thể cập nhật hồ sơ lúc này!';
            setProfileMessage({ type: 'error', text: typeof errText === 'string' ? errText : 'Lỗi cập nhật hồ sơ!' });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // 6. Đổi mật khẩu
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setPasswordMessage({ type: '', text: '' });

        if (passwordData.newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
            setIsChangingPassword(false);
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp với mật khẩu mới!' });
            setIsChangingPassword(false);
            return;
        }

        try {
            const res = await axios.put('http://localhost:5000/api/users/change-password', passwordData, {
                headers: { token: currentUser.accessToken }
            });

            setPasswordMessage({ type: 'success', text: res.data?.message || 'Đổi mật khẩu thành công!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
        } catch (err) {
            console.error("Lỗi đổi mật khẩu:", err);
            const errText = err.response?.data || 'Đổi mật khẩu không thành công!';
            setPasswordMessage({ type: 'error', text: typeof errText === 'string' ? errText : 'Lỗi đổi mật khẩu!' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
        navigate('/');
    };

    const schoolActionLabel = schoolMemberships.length > 0 ? 'Trường của tôi' : 'Tham gia trường';

    return {
        currentUser,
        formData,
        setFormData,
        passwordData,
        setPasswordData,
        profileMessage,
        passwordMessage,
        isUpdatingProfile,
        isChangingPassword,
        schoolActionLabel,
        handleAvatarUpload,
        handleRemoveAvatar,
        handleUpdateProfile,
        handleChangePassword,
        handleLogout,
        navigate
    };
};
