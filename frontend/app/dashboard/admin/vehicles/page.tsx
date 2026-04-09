'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Car, ArrowLeft, Loader2, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Vehicle {
  id: number;
  immatriculation: string;
  vin: string;
  couleur: string;
  annee: number;
  marque_nom: string;
  modele_nom: string;
  version_nom: string;
  client_nom: string;
  client_prenom: string;
  statut_validation: string;
}

export default function AdminVehiclesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !['ADMIN', 'DIRECTION'].includes(user.role))) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      loadVehicles();
    }
  }, [user, authLoading]);

  const loadVehicles = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      setLoading(true);
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/agent-dashboard/vehicles`;
      console.log('Fetching vehicles from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Erreur lors du chargement des véhicules');
      }
      
      const result = await response.json();
      console.log('Vehicles data:', result);
      setVehicles(result.data || []);
    } catch (error: any) {
      console.error('Erreur chargement véhicules:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.marque_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modele_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${v.client_nom} ${v.client_prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (statut: string) => {
    const colors: Record<string, string> = {
      VALIDE: 'bg-green-100 text-green-800',
      EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
      REFUSE: 'bg-red-100 text-red-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 p-6">
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
                <Car className="w-8 h-8" />
                Tous les véhicules
              </h1>
              <p className="text-white/70 mt-1">Liste complète des véhicules enregistrés</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{vehicles.length}</p>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <p className="text-green-100 text-sm">Validés</p>
            <p className="text-2xl font-bold text-green-50">
              {vehicles.filter(v => v.statut_validation === 'VALIDE').length}
            </p>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <p className="text-yellow-100 text-sm">En attente</p>
            <p className="text-2xl font-bold text-yellow-50">
              {vehicles.filter(v => v.statut_validation === 'EN_ATTENTE').length}
            </p>
          </div>
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
            <p className="text-red-100 text-sm">Refusés</p>
            <p className="text-2xl font-bold text-red-50">
              {vehicles.filter(v => v.statut_validation === 'REFUSE').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              placeholder="Rechercher par immatriculation, marque, modèle ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">Aucun véhicule trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Véhicule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Immatriculation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Propriétaire</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Année</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {vehicle.marque_nom} {vehicle.modele_nom}
                        </div>
                        <div className="text-xs text-white/50">{vehicle.version_nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white/80 font-mono">{vehicle.immatriculation}</div>
                        <div className="text-xs text-white/50">{vehicle.couleur}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-white/50" />
                          <span className="text-sm text-white/80">
                            {vehicle.client_prenom} {vehicle.client_nom}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {vehicle.annee}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadge(vehicle.statut_validation)}>
                          {vehicle.statut_validation}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
