'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import AppLogo from '@/components/AppLogo';
import AuthCard from '@/components/AuthCard';
import Divider from '@/components/Divider';
import AuthLink from '@/components/AuthLink';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validation — KEEP THIS EXACTLY AS IS
  const validateForm = (): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!passwordConfirm) return 'Please confirm your password';
    if (password !== passwordConfirm) return 'Passwords do not match';
    if (!nickname || nickname.trim().length === 0) return 'Nickname is required';
    return null;
  };

  // handleSubmit — KEEP THIS EXACTLY AS IS (calls /api/auth/signup, redirects to /diary)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, passwordConfirm, nickname }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Failed to create account'); return; }
      router.push('/diary');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <AppLogo tagline="일기를 기록하고 자서전을 만들어 보세요" />
        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="email-input"
                placeholder="이메일 주소를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="password-input"
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password-confirm" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                id="password-confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                data-testid="password-confirm-input"
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                data-testid="nickname-input"
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div
                className="text-red-500 text-sm"
                role="alert"
                data-testid="error-message"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              data-testid="submit-button"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          <div className="mt-4">
            <Divider />
          </div>

          <div className="mt-4">
            <GoogleLoginButton />
          </div>

          <div className="mt-4">
            <AuthLink text="이미 계정이 있으신가요?" linkText="로그인" href="/auth/login" />
          </div>
        </AuthCard>
      </div>
    </main>
  );
}
