'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Loader2, TrendingUp, Users, Car, Calendar, DollarSign, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  getGlobalReport,
  getAgencyReport,
  getTopInterventions,
  type GlobalReport,
  type AgencyReport,
  type TopIntervention,
} from '@/lib/api/adminReports';

export default function AdminReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [globalReport, setGlobalReport] = useState<GlobalReport | null>(null);
  const [agencyReport, setAgencyReport] = useState<AgencyReport[]>([]);
  const [topInterventions, setTopInterventions] = useState<TopIntervention[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const [global, agencies, interventions] = await Promise.all([
        getGlobalReport(token),
        getAgencyReport(token),
        getTopInterventions(token),
      ]);

      setGlobalReport(global);
      setAgencyReport(agencies);
      setTopInterventions(interventions);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen admin-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="admin-page p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Rapports
            </h1>
            <p className="text-white/70 mt-1">Rapports et statistiques du système</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Stats */}
            {globalReport && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="admin-card p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-orange-500" />
                      <h3 className="text-white/70 text-sm">Utilisateurs</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{globalReport.users.total_users}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {globalReport.users.active_users} actifs
                    </p>
                  </div>

                  <div className="admin-card p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Car className="w-5 h-5 text-orange-500" />
                      <h3 className="text-white/70 text-sm">Véhicules</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{globalReport.vehicles.total_vehicles}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {globalReport.vehicles.validated} validés
                    </p>
                  </div>

                  <div className="admin-card p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <h3 className="text-white/70 text-sm">Rendez-vous</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{globalReport.appointments.total_appointments}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {globalReport.appointments.completed} terminés
                    </p>
                  </div>

                  <div className="admin-card p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-orange-500" />
                      <h3 className="text-white/70 text-sm">Revenus</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {(globalReport.revenue.total_revenue || 0).toFixed(2)} TND
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {globalReport.revenue.paid_appointments} paiements
                    </p>
                  </div>
                </div>

                {/* Top Interventions */}
                <div className="admin-card p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-white">Top 10 Interventions</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white/70 text-sm font-medium pb-3">Intervention</th>
                          <th className="text-left text-white/70 text-sm font-medium pb-3">Type</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">Nombre</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">Coût moyen</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">Revenu total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topInterventions.map((intervention, index) => (
                          <tr key={index} className="border-b border-white/10">
                            <td className="py-3 text-white">{intervention.intervention_nom}</td>
                            <td className="py-3 text-white/70">{intervention.type_nom}</td>
                            <td className="py-3 text-white text-right">{intervention.nombre_fois}</td>
                            <td className="py-3 text-white text-right">
                              {intervention.cout_moyen.toFixed(2)} TND
                            </td>
                            <td className="py-3 text-white text-right font-semibold">
                              {intervention.revenu_total.toFixed(2)} TND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Agency Report */}
                <div className="admin-card p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-white">Performance par Agence</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white/70 text-sm font-medium pb-3">Agence</th>
                          <th className="text-left text-white/70 text-sm font-medium pb-3">Ville</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">RDV Total</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">RDV Terminés</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">Agents</th>
                          <th className="text-right text-white/70 text-sm font-medium pb-3">Revenu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agencyReport.map((agency) => (
                          <tr key={agency.id} className="border-b border-white/10">
                            <td className="py-3 text-white">{agency.nom}</td>
                            <td className="py-3 text-white/70">{agency.ville}</td>
                            <td className="py-3 text-white text-right">{agency.total_appointments}</td>
                            <td className="py-3 text-white text-right">{agency.completed_appointments}</td>
                            <td className="py-3 text-white text-right">{agency.total_agents}</td>
                            <td className="py-3 text-white text-right font-semibold">
                              {(agency.total_revenue || 0).toFixed(2)} TND
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

