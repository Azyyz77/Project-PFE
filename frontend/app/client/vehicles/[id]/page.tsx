'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClientLoadingState } from '@/components/client';

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    // Par défaut, on redirige vers l'historique du véhicule
    if (id) {
      router.replace(`/client/vehicles/${id}/history`);
    }
  }, [id, router]);

  return <ClientLoadingState message="Redirection vers l'historique du véhicule..." />;
}
