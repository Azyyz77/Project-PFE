'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getGlobalStats,
  getRevenueStats,
  getSatisfactionStats,
  getPerformanceStats,
  getAgencyStats,
  GlobalStatsResponse,
  RevenueStatsResponse,
  SatisfactionStatsResponse,
  PerformanceStatsResponse,
  AgencyStats,
  StatsFilters,
} from '@/lib/api/directionStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  Star,
  Building2,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
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
  primary: '#e11d48',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
};

const PIE_COLORS = ['#e11d48', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DirectionReportsPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  
  // Data states
  const [globalStats, setGlobalStats] = useState<GlobalStatsResponse | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStatsResponse | null>(null);
  const [satisfactionStats, setSatisfactionStats] = useState<SatisfactionStatsResponse | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStatsResponse | null>(null);
  const [agencies, setAgencies] = useState<AgencyStats[]>([]);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const filters: StatsFilters = {};
      if (dateDebut) filters.dateDebut = dateDebut;
      if (dateFin) filters.dateFin = dateFin;

      const [global, revenue, satisfaction, performance, agencyData] = await Promise.all([
        getGlobalStats(filters),
        getRevenueStats(filters),
        getSatisfactionStats(filters),
        getPerformanceStats(filters),
        getAgencyStats(),
      ]);

      setGlobalStats(global);
      setRevenueStats(revenue);
      setSatisfactionStats(satisfaction);
      setPerformanceStats(performance);
      setAgencies(agencyData);
    } catch (error: any) {
      console.error('Erreur chargement rapports:', error);
      toast.error('Erreur lors du chargement des rapports');
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

  const handleExportPDF = () => {
    toast.info('Export PDF en cours de développement');
  };

  const handleExportExcel = () => {
    toast.info('Export Excel en cours de développement');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 print:p-4">
      {/* Header */}
      <div className="flex items-center justify-between print:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Rapports de Performance
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Rapport complet des performances du réseau
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <FileText className="h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
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

      {/* Executive Summary */}
      {globalStats && revenueStats && satisfactionStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-rose-500" />
              Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {globalStats.global.total_rdv.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total RDV</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-500/10">
                <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {revenueStats.global.revenu_total?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' }) || '0 TND'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Revenu Total</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-500/10">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {satisfactionStats.satisfaction.note_moyenne?.toFixed(2) || '0'} / 5
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Satisfaction</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-rose-50 dark:bg-rose-500/10">
                <Building2 className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {agencies.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Agences</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Mensuelle */}
        {globalStats && (
          <Card>
            <CardHeader>
              <CardTitle>Évolution Mensuelle des RDV</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={globalStats.evolution_mensuelle.slice().reverse().slice(0, 6).map((month) => ({
                    mois: new Date(month.annee, month.mois - 1).toLocaleDateString('fr-FR', { month: 'short' }),
                    total: month.total_rdv,
                    termines: month.rdv_termines,
                  }))}
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
                  <Area type="monotone" dataKey="total" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorTotal)" name="Total" />
                  <Area type="monotone" dataKey="termines" stroke={COLORS.success} fillOpacity={1} fill="url(#colorTermines)" name="Terminés" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Répartition par Statut */}
        {globalStats && (
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
                    dataKey="value"
                  >
                    {globalStats.par_statut.map((_stat, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top 5 Agences - Revenu */}
        {revenueStats && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Agences - Revenu</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueStats.par_agence.slice(0, 5).map((agency) => ({
                    nom: agency.agence_nom.length > 10 ? agency.agence_nom.substring(0, 10) + '...' : agency.agence_nom,
                    revenu: agency.revenu_total || 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value.toLocaleString('fr-TN')} TND`} />
                  <Bar dataKey="revenu" fill={COLORS.success} name="Revenu (TND)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top 5 Agents - Performance */}
        {performanceStats && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Agents - Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={performanceStats.top_agents.slice(0, 5).map((agent) => ({
                    nom: agent.agent_nom.length > 10 ? agent.agent_nom.substring(0, 10) + '...' : agent.agent_nom,
                    note: agent.note_moyenne || 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)} / 5`} />
                  <Bar dataKey="note" fill={COLORS.warning} name="Note Moyenne" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agences */}
        {agencies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance des Agences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agencies.slice(0, 10).map((agency, index) => (
                  <div key={agency.agence_id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 text-sm font-bold text-rose-600 dark:text-rose-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {agency.agence_nom}
                        </p>
                        <p className="text-xs text-slate-500">{agency.ville}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {agency.total_rdv} RDV
                      </p>
                      <Badge variant={agency.taux_completion >= 80 ? 'default' : 'secondary'}>
                        {agency.taux_completion.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {globalStats && satisfactionStats && (
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs Clés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">Clients Uniques</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {globalStats.global.total_clients.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-slate-700 dark:text-slate-300">Taux de Satisfaction</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {satisfactionStats.satisfaction.taux_satisfaction?.toFixed(1) || '0'}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">Durée Moyenne</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Math.round(globalStats.global.duree_moyenne_min || 0)} min
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-slate-700 dark:text-slate-300">Total Feedbacks</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {satisfactionStats.satisfaction.total_feedbacks}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <Card className="print:mt-8">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-slate-500">
            <p>Rapport généré le {new Date().toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p className="mt-1">Système de Gestion SAV - Chery Tunisie</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

