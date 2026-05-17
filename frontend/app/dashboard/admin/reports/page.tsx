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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <FileText className="w-7 h-7 text-orange-500" />
            Rapports & Analyses
          </h1>
          <p className="text-slate-500 text-xs mt-1">Consultez les indicateurs clés de performance, les top interventions et les revenus cumulés.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-slate-200/80 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Global Stats */}
          {globalReport && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold uppercase tracking-wider text-[10px]">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Utilisateurs</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{globalReport.users.total_users}</p>
                  </div>
                  <p className="text-slate-500 text-[11px] font-bold mt-2 uppercase">
                    {globalReport.users.active_users} comptes actifs
                  </p>
                </div>

                <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold uppercase tracking-wider text-[10px]">
                      <Car className="w-4 h-4 text-purple-600" />
                      <span>Véhicules</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{globalReport.vehicles.total_vehicles}</p>
                  </div>
                  <p className="text-slate-500 text-[11px] font-bold mt-2 uppercase">
                    {globalReport.vehicles.validated} validés officiels
                  </p>
                </div>

                <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-orange-700 font-bold uppercase tracking-wider text-[10px]">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span>Rendez-vous SAV</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{globalReport.appointments.total_appointments}</p>
                  </div>
                  <p className="text-slate-500 text-[11px] font-bold mt-2 uppercase">
                    {globalReport.appointments.completed} clôturés
                  </p>
                </div>

                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Revenus globaux</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      {(globalReport.revenue.total_revenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
                    </p>
                  </div>
                  <p className="text-slate-500 text-[11px] font-bold mt-2 uppercase">
                    {globalReport.revenue.paid_appointments} factures payées
                  </p>
                </div>
              </div>

              {/* Top 10 Interventions */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Top 10 des interventions demandées</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-4">Intervention</th>
                        <th className="px-6 py-4">Type de catégorie</th>
                        <th className="px-6 py-4 text-right">Nombre d'occurrences</th>
                        <th className="px-6 py-4 text-right">Coût unitaire moyen</th>
                        <th className="px-6 py-4 text-right">Volume chiffre d'affaires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topInterventions.map((intervention, index) => (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{intervention.intervention_nom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">{intervention.type_nom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-extrabold text-right">{intervention.nombre_fois}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold text-right">
                            {intervention.cout_moyen.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-extrabold text-right">
                            {intervention.revenu_total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Agency Report */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Performance opérationnelle par agence</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-4">Agence</th>
                        <th className="px-6 py-4">Gouvernorat/Ville</th>
                        <th className="px-6 py-4 text-right">Total RDV</th>
                        <th className="px-6 py-4 text-right">Terminés</th>
                        <th className="px-6 py-4 text-right">Agents SAV</th>
                        <th className="px-6 py-4 text-right">Revenus cumulés</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {agencyReport.map((agency) => (
                        <tr key={agency.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{agency.nom}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">{agency.ville}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">{agency.total_appointments}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold text-right">{agency.completed_appointments}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">{agency.total_agents}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-extrabold text-right">
                            {(agency.total_revenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} TND
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
  );
}
