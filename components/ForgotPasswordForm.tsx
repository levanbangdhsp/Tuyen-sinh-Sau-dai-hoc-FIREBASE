import React, { useState } from 'react';
import { Page } from '../types';
import InputField from './InputField';
import Alert from './Alert';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

interface ForgotPasswordFormProps {
  navigate: (page: Page) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setLoading(true);

    // FIX: Use a static, whitelisted URL for actionCodeSettings to resolve the
    // 'auth/invalid-continue-uri' error. In sandboxed environments,
    // window.location.href may not provide a valid domain, causing the API call to fail.
    const actionCodeSettings = {
      url: 'https://tuyensinhsdh-hcmue.web.app',
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSuccess('Yêu cầu đặt lại mật khẩu đã được gửi. Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một liên kết. Vui lòng kiểm tra kỹ hộp thư chính và thư mục Thư rác/Spam.');
    } catch (err: any) {
      // Handle specific Firebase errors
      if (err.code === 'auth/invalid-email') {
        setError('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (err.code === 'auth/api-key-not-valid') {
          setError('Lỗi cấu hình: API key không hợp lệ. Vui lòng liên hệ quản trị viên.');
          console.error("Firebase Auth Error: Invalid API Key. Check firebaseConfig.ts.", err);
      } else {
        // For security, don't reveal if the user was not found.
        // We still show a success-like message, but can show a generic error if preferred.
        // Using a generic error message here to be safe.
        setError('Không thể gửi email đặt lại mật khẩu. Vui lòng kiểm tra lại địa chỉ email và thử lại.');
        
        // Log unexpected errors to the console for debugging, but not auth/user-not-found
        if (err.code !== 'auth/user-not-found') {
            console.error("Password reset error:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-sky-600 py-4">
        <h2 className="text-xl font-bold text-center text-white uppercase tracking-wider">
          Quên mật khẩu
        </h2>
      </div>
      <div className="p-8">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}
        <form onSubmit={handleSubmit}>
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-200 ease-in-out disabled:bg-sky-400"
          >
            {loading ? 'Đang gửi...' : 'Gửi Email đặt lại Mật khẩu'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            onClick={() => navigate(Page.Login)}
            className="font-medium text-sm text-sky-600 hover:text-sky-800"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;