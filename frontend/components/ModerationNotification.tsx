'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell, FileText } from 'lucide-react';
import { getPendingFiles } from '@/lib/api/moderation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ModerationNotification() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Vérifier si l'utilisateur peut modérer
  const canModerate = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const loadPendingCount = async () => {
    if (!canModerate) {
      setLoading(false);
      return;
    }

    try {
      const response = await getPendingFiles({ page: 1, limit: 1 });
      setPendingCount(response.pagination.total);
    } catch (error) {
      console.error('Erreur chargement notifications modération:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadPendingCount, 30000);
    
    return () => clearInterval(interval);
  }, [canModerate]);

  if (!canModerate || loading) {
    return null;
  }

  if (pendingCount === 0) {
    return null;
  }

  return (
    <Link
      href="/dashboard/admin/moderation"
      className="relative inline-flex items-center justify-center rounded-md border border-amber-300/40 bg-amber-50 p-2 text-amber-700 transition-colors hover:bg-amber-100 hover:border-amber-400"
      title={`${pendingCount} fichier(s) en attente de modération`}
    >
      <div className="relative">
        <FileText className="w-5 h-5" />
        {pendingCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {pendingCount > 99 ? '99+' : pendingCount}
          </Badge>
        )}
      </div>
    </Link>
  );
}