'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPerformanceStats,
  AgentPerformance,
  TopAgent,
  AgentWorkload,
  PerformanceStatsResponse,
  StatsFilters,
} from '@/lib/api/directionStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Star,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Couleurs
const COLORS = {
  primary: '#e11d48',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#06b6d4',
  purple: '#8b5cf6',
};

export default function DirectionStaffPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [performanceData, setPerformanceData] = useState<PerformanceStatsResponse | null>(null);
  const [filteredAgents, setFilteredAgents] = useState<AgentPerformance[]>([]);

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    if (performanceData) {
      filterAgents();
    }
  }, [searchTerm, performanceData]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const filters: StatsFilters = {};
      if (dateDebut) filters.dateDebut = dateDebut;
      if (dateFin) filters.dateFin = dateFin;

      const data = await getPerformanceStats(filters);
      setPerformanceData(data);
      setFilteredAgents(data.performance_agents || []);
    } catch (error: any) {
      console.error('Erreur chargement personnel:', error);
      toast.error('Erreur lors du chargement des données du personnel');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    if (!performanceData) return;
    
    const filtered = performanceData.performance_agents.filter((agent) =>
      agent.agent_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agence_nom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgents(filtered);
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleResetFilters = () => {
    setDateDebut('');
    setDateFin('');
    setSearchTerm('');
    setTimeout(() => loadData(), 100);
  };

  const handleExport = () => {
    toast.info('Export en cours de développement');
  };

  const getPerformanceBadge = (note: number) => {
    if (note >= 4.5) return { variant: 'default' as const, label: 'Excellent' };
    if (note >= 4.0) return { variant: 'default' as const, label: 'Très Bien' };
    if (note >= 3.5) return { variant: 'secondary' as const, label: 'Bien' };
    if (note >= 3.0) return { variant: 'secondary' as const, label: 'Moyen' };
    return { variant: 'secondary' as const, label: 'À améliorer' };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const topAgents = performanceData?.top_agents || [];
  const workload = performanceData?.charge_travail || [];

  // Statistiques globales
  const totalAgents = filteredAgents.length;
  const totalRdv = filteredAgents.reduce((sum, a) => sum + a.total_rdv, 0);
  const avgNote = filteredAgents.length > 0
    ? filteredAgents.reduce((sum, a) => sum + (a.note_moyenne || 0), 0) / filteredAgents.length
    : 0;
  const totalFeedbacks = filteredAgents.reduce((sum, a) => sum + a.total_feedbacks, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Gestion du Personnel
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Vue d'ensemble des performances des agents (lecture seule)
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                type="text"
                placeholder="Nom d'agent ou agence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
            <Button onClick={handleApplyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Appliquer
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Agents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalAgents}
                </p>
              </div>
              <Users className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total RDV</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalRdv.toLocaleString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Note Moyenne</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {avgNote.toFixed(2)} / 5
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Feedbacks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {totalFeedbacks}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Agents - Performance */}
        {topAgents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top 10 Agents - Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topAgents.slice(0, 10).map((agent) => ({
                    nom: agent.agent_nom.length > 12 ? agent.agent_nom.substring(0, 12) + '...' : agent.agent_nom,
                    note: agent.note_moyenne || 0,
                    feedbacks: agent.total_feedbacks,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'note') return [`${Number(value).toFixed(2)} / 5`, 'Note'];
                      return [value, 'Feedbacks'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="note" fill={COLORS.warning} name="Note Moyenne" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Charge de Travail */}
        {workload.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                Charge de Travail - Top 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={workload.slice(0, 10).map((agent) => ({
                    nom: agent.agent_nom.length > 12 ? agent.agent_nom.substring(0, 12) + '...' : agent.agent_nom,
                    rdv: agent.total_rdv,
                    heures: Math.round(agent.total_minutes_travail / 60),
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rdv" fill={COLORS.primary} name="Total RDV" />
                  <Bar dataKey="heures" fill={COLORS.info} name="Heures Travail" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Performance Radar - Top 5 */}
        {topAgents.length >= 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Globale - Top 5</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={topAgents.slice(0, 5).map((agent) => ({
                  agent: agent.agent_nom.length > 10 ? agent.agent_nom.substring(0, 10) + '...' : agent.agent_nom,
                  note: agent.note_moyenne || 0,
                  feedbacks: Math.min(agent.total_feedbacks / 10, 5), // Normalize to 0-5
                }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="agent" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="Note" dataKey="note" stroke={COLORS.warning} fill={COLORS.warning} fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Durée Moyenne par Agent */}
        {filteredAgents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Durée Moyenne des RDV - Top 10</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={filteredAgents
                    .sort((a, b) => b.total_rdv - a.total_rdv)
                    .slice(0, 10)
                    .map((agent) => ({
                      nom: agent.agent_nom.length > 12 ? agent.agent_nom.substring(0, 12) + '...' : agent.agent_nom,
                      duree: Math.round(agent.duree_moyenne_min || 0),
                    }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nom" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} min`, 'Durée']} />
                  <Legend />
                  <Line type="monotone" dataKey="duree" stroke={COLORS.success} strokeWidth={2} name="Durée (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste Détaillée des Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-white">Agent</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-white">Agence</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Total RDV</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Terminés</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Durée Moy.</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Note</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Feedbacks</th>
                  <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Performance</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-slate-500">
                      Aucun agent trouvé
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => {
                    const badge = getPerformanceBadge(agent.note_moyenne || 0);
                    const completionRate = agent.total_rdv > 0
                      ? ((agent.rdv_termines / agent.total_rdv) * 100).toFixed(1)
                      : '0';

                    return (
                      <tr
                        key={agent.agent_id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="p-3">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {agent.agent_nom}
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {agent.agence_nom}
                        </td>
                        <td className="p-3 text-center font-medium text-slate-900 dark:text-white">
                          {agent.total_rdv}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {agent.rdv_termines}
                          </span>
                          <span className="text-xs text-slate-500 ml-1">
                            ({completionRate}%)
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                          {Math.round(agent.duree_moyenne_min || 0)} min
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {(agent.note_moyenne || 0).toFixed(2)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-slate-600 dark:text-slate-400">
                          {agent.total_feedbacks}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={badge.variant}>
                            {badge.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
