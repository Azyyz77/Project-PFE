'use client';

/**
 * Composant pour protéger les routes nécessitant une authentification
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole && user) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user.role)) {
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si non authentifié, ne rien afficher (redirection en cours)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
