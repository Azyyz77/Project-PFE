'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'ADMIN':
          router.replace('/dashboard/admin');
          break;
        case 'AGENT':
          router.replace('/dashboard/agent');
          break;
        case 'DIRECTION':
          router.replace('/dashboard/direction');
          break;
        case 'CLIENT':
        default:
          router.replace('/client/dashboard');
          break;
      }
    } else if (!isLoading && !user) {
      // Not authenticated, redirect to login
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
