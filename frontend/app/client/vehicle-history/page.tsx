'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Car, History, TrendingUp, Calendar } from 'lucide-react';

interface Vehicle {
  id: number;
  immatriculation: string;
  marque_nom: string;
  modele_nom: string;
  version_nom: string;
  annee: number;
  kilometrage: number;
  couleur?: string;
  statut_validation?: string;
}

export default function VehicleHistoryListPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
        throw new Error(t('vehicleHistory.notConnected'));
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      const response = await fetch(`http://localhost:3000/api/vehicles/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t('vehicleHistory.errorLoading'));
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
      <div className="flex items-center justify-center min-h-screen bg-[#f5f7fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#0f2543]/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#0f2543] animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-600 animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header - Beautiful with Animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg transform hover:scale-110 transition-transform duration-300">
              <History className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0f2543]">
                {t('vehicleHistory.title')}
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {t('vehicleHistory.consultHistory')}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm animate-shake">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-xl bg-gradient-to-br from-[#0f2543]/10 to-[#1b355d]/10">
              <Car className="w-10 h-10 text-[#0f2543]" />
            </div>
            <p className="text-slate-700 text-xl font-semibold mb-2">{t('vehicleHistory.noVehicles')}</p>
            <p className="text-slate-500 text-sm mb-6">
              {t('vehicleHistory.addVehicleToConsult')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/client/vehicles/new')}
              className="px-8 py-3 bg-gradient-to-r from-[#0f2543] to-[#1b355d] text-white rounded-lg hover:shadow-lg hover:shadow-[#0f2543]/30 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              {t('vehicleHistory.addVehicle')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => {
              // Format immatriculation: "229 تونس 4891" format (3 digits + تونس + 4 digits)
              const formatImmatriculation = (immat: string) => {
                // Remove any existing spaces and "تونس"
                const cleaned = immat.replace(/\s+/g, '').replace('تونس', '');
                // Split into parts: first 3 digits, middle "تونس", last 4 digits
                if (cleaned.length >= 7) {
                  const part1 = cleaned.slice(0, 3); // First 3 numbers
                  const part2 = cleaned.slice(3, 7); // Last 4 numbers
                  return `${part2} تونس ${part1}`; // Reversed: 4 digits + تونس + 3 digits
                }
                return immat;
              };

              return (
                <div
                  key={vehicle.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-[#0f2543]/30 transform hover:-translate-y-1"
                  style={{ 
                    animation: 'fadeIn 0.5s ease-out forwards',
                    animationDelay: `${index * 100}ms`,
                    opacity: 0
                  }}
                >
                  {/* Vehicle Header - Beautiful with Sidebar Colors */}
                  <div className="relative bg-gradient-to-br from-[#0f2543] to-[#1b355d] p-6 text-white overflow-hidden">
                    {/* Animated Background */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm">
                          <Car className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/70 mb-1">Année</p>
                          <span className="text-sm font-semibold bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
                            {vehicle.annee}
                          </span>
                        </div>
                      </div>
                      
                      {/* Car Name - Brand + Model + Version in Header */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-white group-hover:scale-105 transition-transform duration-300">
                          {vehicle.marque_nom} {vehicle.modele_nom} {vehicle.version_nom}
                        </h3>
                      </div>
                      
                      {/* Immatriculation with تونس in middle - 3 numbers + تونس + 4 numbers */}
                      <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/20">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm">
                          <span className="text-xs font-bold">#</span>
                        </div>
                        <p className="text-base font-bold tracking-wider" dir="rtl">
                          {formatImmatriculation(vehicle.immatriculation)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info - Beautiful Layout */}
                  <div className="p-5 space-y-3">
                    {/* Mileage */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0f2543]/5 to-[#1b355d]/5 rounded-xl border border-[#0f2543]/10 group-hover:border-[#0f2543]/30 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-md group-hover:scale-110 transition-transform duration-300">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase">{t('vehicleHistory.mileage')}</p>
                          <p className="text-lg font-bold text-[#0f2543]">
                            {vehicle.kilometrage?.toLocaleString() || 0} <span className="text-sm font-normal">km</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Color */}
                    {vehicle.couleur && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group-hover:border-[#0f2543]/20 transition-all duration-300">
                        <span className="text-sm text-slate-600 font-medium">{t('vehicleHistory.color')}</span>
                        <span className="font-semibold text-[#0f2543] px-3 py-1 bg-white rounded-lg shadow-sm">{vehicle.couleur}</span>
                      </div>
                    )}

                    {/* Status */}
                    {vehicle.statut_validation && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group-hover:border-[#0f2543]/20 transition-all duration-300">
                        <span className="text-sm text-slate-600 font-medium">{t('vehicleHistory.status')}</span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                            vehicle.statut_validation === 'VALIDE'
                              ? 'bg-green-500 text-white'
                              : vehicle.statut_validation === 'EN_ATTENTE'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {vehicle.statut_validation}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button - Beautiful */}
                  <div className="px-5 pb-5">
                    <button
                      type="button"
                      onClick={() => viewHistory(vehicle.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0f2543] to-[#1b355d] text-white rounded-lg hover:shadow-lg hover:shadow-[#0f2543]/30 transition-all duration-300 transform hover:scale-[1.02] font-medium group/btn"
                    >
                      <History className="w-5 h-5 group-hover/btn:rotate-12 transition-transform duration-300" />
                      {t('vehicleHistory.viewHistory')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box - Beautiful */}
        <div className="mt-8 bg-gradient-to-br from-[#0f2543]/5 to-[#1b355d]/5 border border-[#0f2543]/20 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-md flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#0f2543] mb-3 text-lg">
                {t('vehicleHistory.whatContainsTitle')}
              </h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f2543]"></span>
                  {t('vehicleHistory.allInterventionsPerformed')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f2543]"></span>
                  {t('vehicleHistory.completeAppointmentHistory')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f2543]"></span>
                  {t('vehicleHistory.statisticsAndCosts')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0f2543]"></span>
                  {t('vehicleHistory.exportPossibility')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
