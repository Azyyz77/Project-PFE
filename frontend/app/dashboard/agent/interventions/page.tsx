'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ComplaintsManagement from '@/components/agent-dashboard/ComplaintsManagement';

export default function InterventionsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT', 'ADMIN'].includes(user.role))) {
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
      <ComplaintsManagement token={token} />
  );
}
