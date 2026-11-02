// Hệ thống Toast Notification đồng bộ giao diện & Theme EasyLearn
const listeners = new Set();

export const toast = {
    show: (message, type = 'info', title = null, duration = 3500) => {
        if (!message) return;
        const msgStr = typeof message === 'object' ? (message.message || JSON.stringify(message)) : String(message);
        const id = Date.now() + Math.random().toString(36).substring(2, 7);
        const toastItem = {
            id,
            message: msgStr,
            type: ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info',
            title: title || (type === 'success' ? 'Thành công' : type === 'error' ? 'Thông báo' : type === 'warning' ? 'Lưu ý' : 'Thông tin'),
            duration
        };
        listeners.forEach(fn => fn(toastItem));
        return id;
    },
    success: (message, title = 'Thành công') => toast.show(message, 'success', title),
    error: (message, title = 'Thông báo lỗi') => toast.show(message, 'error', title),
    warning: (message, title = 'Lưu ý') => toast.show(message, 'warning', title),
    info: (message, title = 'Thông tin') => toast.show(message, 'info', title),
    subscribe: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }
};

export default toast;

