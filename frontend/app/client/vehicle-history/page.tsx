'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, History, TrendingUp, Calendar } from 'lucide-react';

interface Vehicle {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  couleur?: string;
  statut_validation?: string;
}

export default function VehicleHistoryListPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        throw new Error('Utilisateur non connecté');
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      const response = await fetch(`http://localhost:3000/api/vehicles/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des véhicules');
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewHistory = (vehicleId: number) => {
    router.push(`/client/vehicles/${vehicleId}/history`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <History className="w-8 h-8 text-red-600" />
          Historique de mes véhicules
        </h1>
        <p className="text-gray-600 mt-2">
          Consultez l'historique complet de vos véhicules : interventions, rendez-vous et statistiques
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Vehicles Grid */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun véhicule enregistré</p>
          <p className="text-gray-500 text-sm mt-2">
            Ajoutez un véhicule pour consulter son historique
          </p>
          <button
            onClick={() => router.push('/client/vehicles/new')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Ajouter un véhicule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200"
            >
              {/* Vehicle Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <Car className="w-8 h-8" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    {vehicle.annee}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-2">
                  {vehicle.marque} {vehicle.modele}
                </h3>
                <p className="text-red-100 text-sm mt-1">{vehicle.immatriculation}</p>
              </div>

              {/* Vehicle Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Kilométrage
                  </span>
                  <span className="font-medium text-gray-900">
                    {vehicle.kilometrage?.toLocaleString() || 0} km
                  </span>
                </div>

                {vehicle.couleur && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Couleur</span>
                    <span className="font-medium text-gray-900">{vehicle.couleur}</span>
                  </div>
                )}

                {vehicle.statut_validation && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Statut</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        vehicle.statut_validation === 'VALIDE'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.statut_validation === 'EN_ATTENTE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vehicle.statut_validation}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => viewHistory(vehicle.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <History className="w-5 h-5" />
                  Voir l'historique
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Que contient l'historique ?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Toutes les interventions effectuées sur votre véhicule</li>
              <li>• L'historique complet de vos rendez-vous</li>
              <li>• Les statistiques et coûts totaux</li>
              <li>• La possibilité d'exporter vos données</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
