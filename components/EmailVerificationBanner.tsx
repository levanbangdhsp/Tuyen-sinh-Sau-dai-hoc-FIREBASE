import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import InformationCircleIcon from './icons/InformationCircleIcon';
import SpinnerIcon from './icons/SpinnerIcon';

const EmailVerificationBanner: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (cooldown > 0) {
            timerRef.current = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [cooldown]);
    
    const handleResendVerification = async () => {
        if (cooldown > 0 || loading) return;

        setLoading(true);
        setMessage('');
        setError('');
        const currentUser = auth.currentUser;

        if (currentUser) {
            try {
                await sendEmailVerification(currentUser);
                setMessage('Email xác minh đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam).');
                setCooldown(60); // Bắt đầu 60 giây chờ
            } catch (err: any) {
                console.error("Lỗi khi gửi lại email xác minh:", err);
                if (err.code === 'auth/too-many-requests') {
                    setError('Bạn đã yêu cầu gửi lại email quá nhiều lần. Vui lòng đợi một lát trước khi thử lại.');
                    setCooldown(60); // Bắt đầu 60 giây chờ khi có lỗi
                } else {
                    setError('Không thể gửi lại email xác minh. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        } else {
            setError('Không tìm thấy người dùng hiện tại. Vui lòng đăng nhập lại.');
            setLoading(false);
        }
    };

    const isButtonDisabled = loading || cooldown > 0;
    const buttonText = () => {
        if (loading) return 'Đang gửi...';
        if (cooldown > 0) return `Đợi (${cooldown}s)`;
        return 'Gửi lại Email';
    };


    return (
        <div className="bg-yellow-100 border-b-2 border-yellow-200 text-yellow-800" role="alert">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center">
                    <InformationCircleIcon className="w-6 h-6 mr-3 flex-shrink-0"/>
                    <div className="flex-1">
                        <p className="font-bold">Tài khoản của bạn chưa được xác minh</p>
                        <p className="text-sm">Vui lòng kiểm tra email của bạn để kích hoạt tài khoản. Điều này giúp bảo mật và cho phép bạn sử dụng đầy đủ các tính năng.</p>
                        {message && <p className="text-sm font-semibold text-green-700 mt-1">{message}</p>}
                        {error && <p className="text-sm font-semibold text-red-700 mt-1">{error}</p>}
                    </div>
                    <button
                        onClick={handleResendVerification}
                        disabled={isButtonDisabled}
                        className="ml-4 w-36 flex-shrink-0 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors text-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading && <SpinnerIcon className="w-4 h-4 mr-2" />}
                        {buttonText()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationBanner;