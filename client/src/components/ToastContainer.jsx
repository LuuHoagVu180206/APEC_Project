import React, { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import './Toast.css';
import { 
    CheckCircle2, 
    AlertCircle, 
    AlertTriangle, 
    Info, 
    X 
} from 'lucide-react';

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Lắng nghe các toast được gửi đến
        const unsubscribe = toast.subscribe((newToast) => {
            setToasts((prev) => [...prev, newToast]);

            if (newToast.duration > 0) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
                }, newToast.duration);
            }
        });

        // Tự động chuyển đổi các lệnh alert() cũ thành Toast Notification đồng bộ
        const originalAlert = window.alert;
        window.alert = (msg) => {
            if (!msg) return;
            const str = typeof msg === 'object' ? JSON.stringify(msg) : String(msg);
            const lower = str.toLowerCase();
            
            if (lower.includes('lỗi') || lower.includes('thất bại') || lower.includes('sai ') || lower.includes('không có quyền') || str.includes('🛑')) {
                toast.error(str);
            } else if (lower.includes('thành công') || str.includes('✅') || str.includes('🎉') || lower.includes('chúc mừng')) {
                toast.success(str);
            } else if (lower.includes('vui lòng') || lower.includes('chưa') || lower.includes('không thể') || str.includes('⚠️')) {
                toast.warning(str);
            } else {
                toast.info(str);
            }
        };

        return () => {
            unsubscribe();
            window.alert = originalAlert;
        };
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="easylearn-toast-container">
            {toasts.map((item) => {
                let Icon = Info;
                if (item.type === 'success') Icon = CheckCircle2;
                if (item.type === 'error') Icon = AlertCircle;
                if (item.type === 'warning') Icon = AlertTriangle;

                return (
                    <div 
                        key={item.id} 
                        className={`easylearn-toast-box toast-${item.type}`}
                        role="alert"
                    >
                        <div className="toast-icon-wrap">
                            <Icon size={20} strokeWidth={2.5} />
                        </div>

                        <div className="toast-content-wrap">
                            {item.title && <h5 className="toast-title">{item.title}</h5>}
                            <p className="toast-message">{item.message}</p>
                        </div>

                        <button 
                            type="button" 
                            className="toast-close-btn"
                            onClick={() => removeToast(item.id)}
                            aria-label="Đóng thông báo"
                        >
                            <X size={15} />
                        </button>

                        {item.duration > 0 && (
                            <div 
                                className="toast-progress-bar" 
                                style={{ animationDuration: `${item.duration}ms` }} 
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ToastContainer;

