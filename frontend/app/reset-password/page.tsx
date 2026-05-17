'use client';

import { useState, FormEvent } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../../lib/api/auth';
import { useLanguage } from '@/contexts/LanguageContext';

function ResetPasswordContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('auth.passwordLengthError'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMatchError'));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      router.push('/login?reset=true');
    } catch (err: any) {
      setError(err.message || t('auth.passwordResetError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="rounded-xl bg-white p-8 shadow-lg text-center">
          <p className="text-red-600 font-semibold mb-4">{t('auth.invalidResetLink')}</p>
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            {t('auth.restart')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {t('auth.newPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.newPasswordDesc')}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.newPassword')}
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.confirmPasswordLabel')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting ? t('auth.savingPassword') : t('auth.savePassword')}
          </button>

          <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('auth.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

