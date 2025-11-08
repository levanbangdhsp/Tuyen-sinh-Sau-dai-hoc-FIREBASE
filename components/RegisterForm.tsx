import React, { useState, useRef } from 'react';
import { Page } from '../types';
import InputField from './InputField';
import Alert from './Alert';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { validatePassword, PasswordValidationResult, formatFullName, validateEmail, validatePhone } from '../utils/validation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface RegisterFormProps {
  navigate: (page: Page) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ navigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePassword(''));
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validatePassword(newPassword));
  };
  
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedName = formatFullName(e.target.value);
    if (formattedName !== fullName) {
      setFullName(formattedName);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Validation in visual order ---
    if (!fullName.trim()) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Họ và tên.');
      fullNameRef.current?.focus();
      return;
    }
    if (!email.trim()) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Email.');
      emailRef.current?.focus();
      return;
    }
    if (!validateEmail(email)) {
      setError('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Mật khẩu.');
      passwordRef.current?.focus();
      return;
    }
    if (!passwordValidation.valid) {
      setError('Mật khẩu không đáp ứng các yêu cầu bảo mật.');
      passwordRef.current?.focus();
      return;
    }
    if (!confirmPassword) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Nhập lại mật khẩu.');
      confirmPasswordRef.current?.focus();
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      confirmPasswordRef.current?.focus();
      return;
    }
    // Phone validation is last, as requested
    if (!phone.trim()) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Số điện thoại.');
      phoneRef.current?.focus();
      return;
    }
    if (!validatePhone(phone)) {
        setError('Số điện thoại không hợp lệ. Phải là số và có 10 chữ số.');
        phoneRef.current?.focus();
        return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      
      // Explicitly send the verification email
      await sendEmailVerification(user);
      
      setSuccess('Đăng ký thành công! Một email xác minh đã được gửi đến bạn. Vui lòng kiểm tra hộp thư (cả thư mục spam) để kích hoạt tài khoản.');

      // Automatically navigate to login page after 3 seconds
      setTimeout(() => {
        navigate(Page.Login);
      }, 3000);

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng trong hệ thống. Bạn quay lại trang Đăng nhập và bấm quên mật khẩu để lấy lại mật khẩu, hoặc đăng ký tài khoản với email khác.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
        console.error("Registration error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-green-600 py-4">
        <h2 className="text-xl font-bold text-center text-white uppercase tracking-wider">
          Đăng ký tài khoản
        </h2>
      </div>
      <div className="p-8">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            ref={fullNameRef}
            id="fullName"
            label="Họ tên:"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={handleNameBlur}
            required
          />
          <InputField
            ref={emailRef}
            id="email"
            label="Email:"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            ref={passwordRef}
            id="password"
            label="Mật khẩu:"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setIsPasswordFocused(true)}
            required
          />
          <InputField
            ref={confirmPasswordRef}
            id="confirmPassword"
            label="Nhập lại mật khẩu:"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {(isPasswordFocused || password) && <PasswordStrengthIndicator validationResult={passwordValidation} />}
          <InputField
            ref={phoneRef}
            id="phone"
            label="Số điện thoại:"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 ease-in-out disabled:bg-green-400"
          >
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              onClick={() => navigate(Page.Login)}
              className="font-medium text-sky-600 hover:text-sky-800"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;