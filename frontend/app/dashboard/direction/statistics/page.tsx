'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGlobalStats,
  getRevenueStats,
  getSatisfactionStats,
  getPerformanceStats,
  GlobalStatsResponse,
  RevenueStatsResponse,
  SatisfactionStatsResponse,
  PerformanceStatsResponse,
  StatsFilters,
} from '@/lib/api/directionStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StatisticsPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  
  // Data states
  const [globalStats, setGlobalStats] = useState<GlobalStatsResponse | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStatsResponse | null>(null);
  const [satisfactionStats, setSatisfactionStats] = useState<SatisfactionStatsResponse | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStatsResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const filters: StatsFilters = {};
      if (dateDebut) filters.dateDebut = dateDebut;
      if (dateFin) filters.dateFin = dateFin;

      const [global, revenue, satisfaction, performance] = await Promise.all([
        getGlobalStats(filters),
        getRevenueStats(filters),
        getSatisfactionStats(filters),
        getPerformanceStats(filters),
      ]);

      setGlobalStats(global);
      setRevenueStats(revenue);
      setSatisfactionStats(satisfaction);
      setPerformanceStats(performance);
    } catch (error: any) {
      console.error('Erreur chargement statistiques:', error);
      
      // Check if it's an authorization error
      if (error.message?.includes('non autorisé') || error.message?.includes('Route non trouvée')) {
        toast.error('Accès refusé: Seuls les utilisateurs avec le rôle DIRECTION peuvent accéder à ces statistiques');
      } else {
        toast.error('Erreur lors du chargement des statistiques');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleResetFilters = () => {
    setDateDebut('');
    setDateFin('');
    setTimeout(() => loadData(), 100);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Statistiques Globales
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Vue d'ensemble des performances et KPIs
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="dateDebut">Date de début</Label>
              <Input
                id="dateDebut"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="dateFin">Date de fin</Label>
              <Input
                id="dateFin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
            <Button onClick={handleApplyFilters}>
              Appliquer
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full mb-6 overflow-x-auto">
          <TabsTrigger value="global" className="flex-1 min-w-0">Global</TabsTrigger>
          <TabsTrigger value="revenue" className="flex-1 min-w-0">Revenus</TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex-1 min-w-0">Satisfaction</TabsTrigger>
          <TabsTrigger value="performance" className="flex-1 min-w-0">Performance</TabsTrigger>
        </TabsList>

        {/* Global Tab */}
        <TabsContent value="global" className="w-full min-w-0 overflow-hidden">
          {globalStats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 min-w-0">
                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total RDV
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {globalStats.global.total_rdv.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Clients Uniques
                    </CardTitle>
                    <Users className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {globalStats.global.total_clients.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Véhicules
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {globalStats.global.total_vehicules.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Durée Moyenne
                    </CardTitle>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {Math.round(globalStats.global.duree_moyenne_min || 0)} min
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution */}
              <Card className="mb-6 min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Répartition par Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
                    {globalStats.par_statut.map((stat) => (
                      <div key={stat.statut} className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {stat.statut}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stat.count}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {stat.pourcentage.toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Evolution */}
              <Card className="min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Évolution Mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {globalStats.evolution_mensuelle.slice(0, 6).map((month) => (
                      <div key={`${month.annee}-${month.mois}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {new Date(month.annee, month.mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 dark:text-slate-400">
                            {month.total_rdv} RDV
                          </span>
                          <Badge variant="default">
                            {month.rdv_termines} terminés
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="w-full min-w-0 overflow-hidden">
          {revenueStats && (
            <>
              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 min-w-0">
                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Revenu Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {revenueStats.global.revenu_total?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Revenu Moyen
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {revenueStats.global.revenu_moyen?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Revenu Min
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {revenueStats.global.revenu_min?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Revenu Max
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {revenueStats.global.revenu_max?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue by Agency */}
              <Card className="mb-6 min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Revenus par Agence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {revenueStats.par_agence.slice(0, 10).map((agency) => (
                      <div key={agency.agence_id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {agency.agence_nom}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 dark:text-slate-400">
                            {agency.total_rdv} RDV
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {agency.revenu_total?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Type */}
              <Card className="min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Revenus par Type d'Intervention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {revenueStats.par_type_intervention.slice(0, 10).map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {type.intervention || 'Non spécifié'}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 dark:text-slate-400">
                            {type.nombre_rdv} RDV
                          </span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {type.revenu_total?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="w-full min-w-0 overflow-hidden">
          {satisfactionStats && (
            <>
              {/* Satisfaction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 min-w-0">
                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Note Moyenne
                    </CardTitle>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {satisfactionStats.satisfaction.note_moyenne?.toFixed(2) || '0'} / 5
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Taux de Satisfaction
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {satisfactionStats.satisfaction.taux_satisfaction?.toFixed(1) || '0'}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total Feedbacks
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {satisfactionStats.satisfaction.total_feedbacks}
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Réclamations
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {satisfactionStats.reclamations.total_reclamations}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {satisfactionStats.reclamations.reclamations_resolues} résolues
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback Distribution */}
              <Card className="mb-6 min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Distribution des Feedbacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 min-w-0">
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {satisfactionStats.satisfaction.feedbacks_positifs}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Positifs (4-5)</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {satisfactionStats.satisfaction.feedbacks_neutres}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Neutres (3)</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {satisfactionStats.satisfaction.feedbacks_negatifs}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Négatifs (1-2)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Satisfaction by Agency */}
              <Card className="min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Satisfaction par Agence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {satisfactionStats.par_agence.map((agency) => (
                      <div key={agency.agence_id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {agency.agence_nom}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 dark:text-slate-400">
                            {agency.total_feedbacks} avis
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                              {agency.note_moyenne?.toFixed(2) || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="w-full min-w-0 overflow-hidden">
          {performanceStats && (
            <>
              {/* Top Agents */}
              <Card className="mb-6 min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Top 10 Agents - Satisfaction Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {performanceStats.top_agents.map((agent, index) => (
                      <div key={agent.agent_id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {agent.agent_nom}
                            </p>
                            <p className="text-xs text-slate-500">{agent.agence_nom}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 dark:text-slate-400">
                            {agent.total_feedbacks} avis
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-600 dark:text-yellow-400">
                              {agent.note_moyenne?.toFixed(2) || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Performance */}
              <Card className="min-w-0 overflow-hidden">
                <CardHeader>
                  <CardTitle>Performance des Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto min-w-0">
                    <table className="w-full min-w-0">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Agent
                          </th>
                          <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Agence
                          </th>
                          <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            RDV
                          </th>
                          <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Terminés
                          </th>
                          <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Durée Moy.
                          </th>
                          <th className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceStats.performance_agents.slice(0, 20).map((agent) => (
                          <tr 
                            key={agent.agent_id}
                            className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="p-3 font-medium text-slate-900 dark:text-white">
                              {agent.agent_nom}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">
                              {agent.agence_nom}
                            </td>
                            <td className="p-3 text-right text-slate-900 dark:text-white">
                              {agent.total_rdv}
                            </td>
                            <td className="p-3 text-right text-green-600 dark:text-green-400">
                              {agent.rdv_termines}
                            </td>
                            <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                              {Math.round(agent.duree_moyenne_min || 0)} min
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                  {agent.note_moyenne?.toFixed(2) || '-'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
