'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CleanupPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    
    console.log('✅ Cleared localStorage and cookies');
    
    // Redirect to login after 1 second
    setTimeout(() => {
      router.replace('/login');
    }, 1000);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Nettoyage en cours...</p>
      </div>
    </div>
  );
}
