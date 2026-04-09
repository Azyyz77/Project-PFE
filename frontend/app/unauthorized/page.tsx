'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any stale auth data
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login immediately
      router.replace('/login');
    }
  }, [router]);

  const handleBackToLogin = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    
    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Accès refusé</h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les droits pour accéder à cette page.
          Veuillez vous connecter avec un compte autorisé.
        </p>

        <Button
          onClick={handleBackToLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
}
