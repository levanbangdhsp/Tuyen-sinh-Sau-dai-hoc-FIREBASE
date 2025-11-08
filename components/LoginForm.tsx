import React, { useState, useRef } from 'react';
import { Page, User } from '../types';
import InputField from './InputField';
import Alert from './Alert';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  navigate: (page: Page) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Email.');
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setError('Bạn vui lòng điền đầy đủ thông tin vào Mật khẩu.');
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // The onAuthStateChanged listener in App.tsx will handle the user state update.
      // We just need to trigger the navigation.
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        phone: firebaseUser.phoneNumber || '',
        // FIX: Add missing emailVerified property to conform to the User type.
        emailVerified: firebaseUser.emailVerified,
      };
      
      onLoginSuccess(user);

    } catch (err: any) {
      // Handles cases like wrong password, user not found, etc.
      if (err.code === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        // This is an expected user error, so we don't log it to the console.
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
        // Log unexpected errors for debugging.
        console.error("Login error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-sky-600 py-4">
        <h2 className="text-xl font-bold text-center text-white uppercase tracking-wider">
          Đăng nhập tài khoản
        </h2>
      </div>
      <div className="p-8">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            ref={emailRef}
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
          <InputField
            ref={passwordRef}
            id="password"
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="text-right mb-4">
            <button
              type="button"
              onClick={() => navigate(Page.ForgotPassword)}
              className="font-medium text-sm text-sky-600 hover:text-sky-800"
            >
              Quên mật khẩu?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-200 ease-in-out disabled:bg-sky-400"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigate(Page.Register)}
              className="font-medium text-sky-600 hover:text-sky-800"
            >
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;