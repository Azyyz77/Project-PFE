'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import { fetchClientComplaints } from '@/lib/api/clientDashboard';
import { Vehicle } from '@/types/vehicle';
import { Calendar, Plus, AlertCircle, CheckCircle, Clock, MessageSquare, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}

function ClientDashboardContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);

  const isClient = useMemo(() => user?.role === 'CLIENT', [user]);

  useEffect(() => {
    if (user && !isClient) {
      router.replace('/dashboard/agent');
    }
  }, [user, isClient, router]);

  useEffect(() => {
    const loadVehicles = async () => {
      if (!user || !token || !isClient) return;
      try {
        const data = await getVehiclesByUser(user.id, token);
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, [user, token, isClient]);

  useEffect(() => {
    const loadComplaints = async () => {
      if (!user || !token || !isClient) return;
      try {
        const data = await fetchClientComplaints(token);
        setComplaints(data);
      } catch (error) {
        console.error('Failed to load complaints:', error);
      } finally {
        setIsLoadingComplaints(false);
      }
    };
    loadComplaints();
  }, [user, token, isClient]);

  if (!isClient || isLoadingVehicles) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ── Welcome Banner ── */}
        <div className="mb-8 rounded-3xl overflow-hidden shadow-lg">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 sm:p-12 min-h-64 flex items-center justify-between overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
            
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
                <div>
                  <h1 className="text-white text-3xl sm:text-4xl font-bold">Bienvenue, {user?.prenom}! 👋</h1>
                  <p className="text-white/80 text-sm mt-1">Gérez vos véhicules et rendez-vous</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{vehicles.length}</div>
                  <div className="text-xs opacity-80">Véhicules</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold">{complaints.length}</div>
                  <div className="text-xs opacity-80">Réclamations</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-300">—</div>
                  <div className="text-xs opacity-80">RDV À venir</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block text-white/20 text-8xl font-bold">{today.getDate()}</div>
          </div>
        </div>

        {/* ── Quick Action Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/client/appointments/new">
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-8 cursor-pointer border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
              <div className="text-5xl mb-3">📅</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Prendre un Rendez-vous</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Réservez une intervention</p>
              <div className="flex items-center text-green-600 dark:text-green-400 group-hover:gap-2 transition-all gap-1">
                <span className="text-sm font-semibold">Continuer</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/client/profile">
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl p-8 cursor-pointer border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
              <div className="text-5xl mb-3">👤</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mon Profil</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Gérez vos informations</p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all gap-1">
                <span className="text-sm font-semibold">Éditer</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/client/vehicles">
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-8 cursor-pointer border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl">
              <div className="text-5xl mb-3">🚗</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mes Véhicules</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all gap-1">
                <span className="text-sm font-semibold">Voir</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Vehicles Section - 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mes Véhicules</h2>
              <Link href="/client/vehicles/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </Link>
            </div>

            {isLoadingVehicles ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="text-5xl mb-3">🚗</div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Aucun véhicule enregistré</p>
                <Link href="/client/vehicles/new">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter votre premier véhicule</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-3xl">🚗</div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{vehicle.marque_nom} {vehicle.modele_nom}</h3>
                            <div className="flex gap-2">
                              {vehicle.annee && <Badge variant="outline" className="text-xs">{vehicle.annee}</Badge>}
                              {vehicle.couleur && <Badge variant="outline" className="text-xs">{vehicle.couleur}</Badge>}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">N° Châssis: {vehicle.numero_chassis || '—'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                          <Edit2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Card - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 sticky top-4">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
              </div>

              {/* Name & Role */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{user?.prenom} {user?.nom}</h3>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">CLIENT</Badge>
              </div>

              {/* Info */}
              <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Email</p>
                    <p className="text-slate-900 dark:text-white font-medium truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">Téléphone</p>
                    <p className="text-slate-900 dark:text-white font-medium">{user?.telephone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-lg">🆔</span>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">ID Client</p>
                    <p className="text-slate-900 dark:text-white font-medium">#{user?.id}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link href="/client/profile" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                  Modifier Profil
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Réclamations Section ── */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Mes Réclamations</h2>
          
          {isLoadingComplaints ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">Aucune réclamation enregistrée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complaints.map((complaint) => {
                const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
                  OUVERTE: { color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200', label: 'Ouverte', icon: '🟡' },
                  EN_COURS: { color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200', label: 'En cours', icon: '🔵' },
                  RESOLUE: { color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200', label: 'Résolue', icon: '🟢' },
                  FERMEE: { color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200', label: 'Fermée', icon: '🔴' },
                };
                const config = statusConfig[complaint.statut] || statusConfig.OUVERTE;

                return (
                  <div key={complaint.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-slate-900 dark:text-white flex-1">{complaint.sujet || 'Sans titre'}</h4>
                      <span className="text-2xl">{config.icon}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{complaint.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">#{complaint.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
