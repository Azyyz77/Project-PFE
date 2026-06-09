'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import VehiclesManagement from '@/components/agent-dashboard/VehiclesManagement';

export default function VehicleInspectionPage() {
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
      <VehiclesManagement token={token} />
  );
}
