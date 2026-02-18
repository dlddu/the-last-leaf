'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import AppLogo from '@/components/AppLogo';
import AuthCard from '@/components/AuthCard';
import Divider from '@/components/Divider';
import AuthLink from '@/components/AuthLink';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }

      // Redirect to diary on success
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
        <AppLogo tagline="일기를 쓰면, 자서전이 됩니다" />

        <AuthCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="email-input"
                placeholder="이메일을 입력하세요"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="password-input"
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : '로그인'}
            </button>
          </form>

          <div className="mt-4">
            <Divider />
          </div>

          <div className="mt-4">
            <GoogleLoginButton />
          </div>

          <div className="mt-4">
            <AuthLink text="계정이 없으신가요?" linkText="회원가입" href="/auth/signup" />
          </div>
        </AuthCard>
      </div>
    </main>
  );
}
