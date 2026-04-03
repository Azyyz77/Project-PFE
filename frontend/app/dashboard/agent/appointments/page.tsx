'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentsTable from '@/components/agent-dashboard/AppointmentsTable';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
      <AppointmentsTable token={token} />
  );
}
