/**
 * Sidebar Wrapper - Only shows on authenticated pages
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];

export function SidebarWrapper() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show sidebar on auth pages or while loading
  if (isLoading || !isAuthenticated || AUTH_PAGES.includes(pathname)) {
    return null;
  }

  return <AppSidebar />;
}
