'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Car } from 'lucide-react';

export default function ClientVehiclesPage() {
  const { user, token } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) return;
      try {
        const data = await getVehiclesByUser(user.id, token);
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, token]);

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Mes Véhicules</h1>
          <Link href="/client/vehicles/new">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un véhicule
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
            <Car className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-6">Aucun véhicule enregistré</p>
            <Link href="/client/vehicles/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter votre premier véhicule</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">🚗</div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{vehicle.marque_nom} {vehicle.modele_nom}</h3>
                <div className="flex gap-2 mb-4">
                  {vehicle.annee && <Badge variant="outline" className="text-xs">{vehicle.annee}</Badge>}
                  {vehicle.couleur && <Badge variant="outline" className="text-xs">{vehicle.couleur}</Badge>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">N° Châssis: {vehicle.numero_chassis || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
