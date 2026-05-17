'use client';

import api from '@/lib/api/axios';
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
    try {
      setLoading(true);
      const response = await api.get('/agent-dashboard/vehicles');
      setVehicles(response.data.data || []);
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
      VALIDE: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-none',
      EN_ATTENTE: 'bg-amber-50 text-amber-700 border border-amber-200/50 shadow-none',
      REFUSE: 'bg-rose-50 text-rose-700 border border-rose-200/50 shadow-none',
    };
    return colors[statut] || 'bg-slate-50 text-slate-600 border border-slate-200/50';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Car className="w-7 h-7 text-orange-500" />
            Gestion des véhicules
          </h1>
          <p className="text-slate-500 text-xs mt-1">Liste complète et statut de validation des véhicules clients.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total enregistrés</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Validés</p>
          <p className="text-3xl font-extrabold text-emerald-900 tracking-tight mt-1">
            {vehicles.filter(v => v.statut_validation === 'VALIDE').length}
          </p>
        </div>
        <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">En attente</p>
          <p className="text-3xl font-extrabold text-amber-900 tracking-tight mt-1">
            {vehicles.filter(v => v.statut_validation === 'EN_ATTENTE').length}
          </p>
        </div>
        <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Refusés</p>
          <p className="text-3xl font-extrabold text-rose-900 tracking-tight mt-1">
            {vehicles.filter(v => v.statut_validation === 'REFUSE').length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par immatriculation, marque, modèle ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl"
          />
        </div>
      </div>

      {/* Vehicles Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-16 text-center">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucun véhicule répertorié</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Immatriculation</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Propriétaire</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Année</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {vehicle.marque_nom} {vehicle.modele_nom}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{vehicle.version_nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-slate-700 font-semibold">{vehicle.immatriculation}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{vehicle.couleur}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700 font-medium">
                          {vehicle.client_prenom} {vehicle.client_nom}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {vehicle.annee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(vehicle.statut_validation)}`}>
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
  );
}
