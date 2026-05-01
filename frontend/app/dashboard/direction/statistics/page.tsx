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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

// Couleurs pour les graphiques
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <Card>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Global Tab */}
        <TabsContent value="global" className="space-y-6">
          {globalStats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
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

                <Card>
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

                <Card>
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

                <Card>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Répartition par Statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={globalStats.par_statut.map((stat) => ({
                            name: stat.statut,
                            value: stat.count,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {globalStats.par_statut.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques par Statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {globalStats.par_statut.map((stat, index) => (
                        <div key={stat.statut} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {stat.statut}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                              {stat.count}
                            </span>
                            <Badge variant="outline">
                              {stat.pourcentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Evolution */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution Mensuelle des Rendez-vous</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart
                      data={globalStats.evolution_mensuelle.slice().reverse().map((month) => ({
                        mois: new Date(month.annee, month.mois - 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
                        total: month.total_rdv,
                        termines: month.rdv_termines,
                        annules: 0,
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorTermines" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke={COLORS.primary} 
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        name="Total RDV"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="termines" 
                        stroke={COLORS.success} 
                        fillOpacity={1} 
                        fill="url(#colorTermines)" 
                        name="Terminés"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueStats && (
            <>
              {/* Revenue Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
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

                <Card>
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

                <Card>
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

                <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Revenus par Agence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={revenueStats.par_agence.slice(0, 10).map((agency) => ({
                        nom: agency.agence_nom.length > 15 ? agency.agence_nom.substring(0, 15) + '...' : agency.agence_nom,
                        revenu: agency.revenu_total || 0,
                        rdv: agency.total_rdv,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="nom" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => {
                          if (typeof value === 'number') {
                            return [value.toLocaleString('fr-TN') + ' TND', 'Revenu'];
                          }
                          return [value, 'RDV'];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenu" fill={COLORS.success} name="Revenu (TND)" />
                      <Bar dataKey="rdv" fill={COLORS.info} name="Nombre de RDV" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenus par Type d'Intervention</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={revenueStats.par_type_intervention.slice(0, 10).map((type) => ({
                        nom: (type.intervention || 'Non spécifié').length > 20 
                          ? (type.intervention || 'Non spécifié').substring(0, 20) + '...' 
                          : (type.intervention || 'Non spécifié'),
                        revenu: type.revenu_total || 0,
                        nombre: type.nombre_rdv,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="nom" type="category" width={90} />
                      <Tooltip 
                        formatter={(value: any) => {
                          if (typeof value === 'number') {
                            return [value.toLocaleString('fr-TN') + ' TND', 'Revenu'];
                          }
                          return [value, 'Nombre'];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenu" fill={COLORS.primary} name="Revenu (TND)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-6">
          {satisfactionStats && (
            <>
              {/* Satisfaction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
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

                <Card>
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

                <Card>
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

                <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des Feedbacks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
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
              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction par Agence</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={satisfactionStats.par_agence.map((agency) => ({
                        nom: agency.agence_nom.length > 15 ? agency.agence_nom.substring(0, 15) + '...' : agency.agence_nom,
                        note: agency.note_moyenne || 0,
                        feedbacks: agency.total_feedbacks,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="nom" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                      />
                      <YAxis domain={[0, 5]} />
                      <Tooltip 
                        formatter={(value: any) => {
                          if (typeof value === 'number' && value < 10) {
                            return [Number(value).toFixed(2) + ' / 5', 'Note Moyenne'];
                          }
                          return [value, 'Feedbacks'];
                        }}
                      />
                      <Legend />
                      <Bar dataKey="note" fill={COLORS.warning} name="Note Moyenne" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {performanceStats && (
            <>
              {/* Top Agents */}
              <Card>
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
              <Card>
                <CardHeader>
                  <CardTitle>Performance des Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
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
