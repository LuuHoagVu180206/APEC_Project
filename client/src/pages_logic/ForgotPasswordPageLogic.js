import { useState } from 'react';
import axios from 'axios';

const getErrorMessage = (error, fallback) => {
    const response = error.response?.data;
    if (typeof response === 'string') return response;
    if (typeof response?.message === 'string') return response.message;
    return fallback;
};

export const ForgotPasswordPageLogic = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendOTP = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setNotice(response.data.message);
            setStep(2);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Không thể gửi OTP lúc này.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOTP = async (event) => {
        event.preventDefault();
        setError('');
        setNotice('');
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', { email, otp });
            setResetToken(response.data.resetToken);
            setStep(3);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'OTP không hợp lệ hoặc đã hết hạn.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setNotice('');
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setOtp('');
            setNotice(response.data.message);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Không thể gửi lại OTP lúc này.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                resetToken,
                password,
                confirmPassword
            });
            setStep(4);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Không thể đặt lại mật khẩu.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step,
        email,
        setEmail,
        otp,
        setOtp,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        error,
        notice,
        isSubmitting,
        handleSendOTP,
        handleVerifyOTP,
        handleResendOTP,
        handleResetPassword
    };
};