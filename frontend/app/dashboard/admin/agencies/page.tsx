'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, Loader2, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Agency {
  id: number;
  nom: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
}

export default function AdminAgenciesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !['ADMIN', 'DIRECTION'].includes(user.role))) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (token) {
      loadAgencies();
    }
  }, [token]);

  const loadAgencies = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/appointments/agencies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAgencies(data.agencies || []);
    } catch (error) {
      console.error('Erreur chargement agences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || !token) {
    return (
      <div className="min-h-screen admin-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="admin-page p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                Gérer les agences
              </h1>
              <p className="text-white/70 mt-1">Liste de toutes les agences Chery</p>
            </div>
          </div>
        </div>

        {/* Agencies Grid */}
        {loading ? (
          <div className="admin-card p-12 text-center border border-white/20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          </div>
        ) : agencies.length === 0 ? (
          <div className="admin-card p-12 text-center border border-white/20">
            <Building2 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">Aucune agence trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <div
                key={agency.id}
                className="admin-card p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{agency.nom}</h3>
                    <p className="text-sm text-white/50">ID: {agency.id}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/80">{agency.adresse}</p>
                      <p className="text-white/60">{agency.ville}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-white/50" />
                    <p className="text-white/80">{agency.telephone}</p>
                  </div>
                  {agency.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-white/50" />
                      <p className="text-white/80">{agency.email}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

