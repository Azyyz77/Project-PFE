'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAgencyStats, AgencyStats } from '@/lib/api/directionStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AgenciesStatsPage() {
  const { token } = useAuth();
  const [agencies, setAgencies] = useState<AgencyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof AgencyStats>('total_rdv');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getAgencyStats();
      setAgencies(data);
    } catch (error: any) {
      console.error('Erreur chargement stats agences:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof AgencyStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedAgencies = [...agencies].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;
    return sortOrder === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

  // Calculer les totaux
  const totals = agencies.reduce((acc, agency) => ({
    total_rdv: acc.total_rdv + agency.total_rdv,
    rdv_termines: acc.rdv_termines + agency.rdv_termines,
    rdv_annules: acc.rdv_annules + agency.rdv_annules,
    rdv_no_show: acc.rdv_no_show + agency.rdv_no_show,
  }), { total_rdv: 0, rdv_termines: 0, rdv_annules: 0, rdv_no_show: 0 });

  const avgCompletionRate = agencies.length > 0
    ? agencies.reduce((sum, a) => sum + a.taux_completion, 0) / agencies.length
    : 0;

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
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Statistiques par Agence
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Vue comparative des performances de toutes les agences
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Agences
            </CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {agencies.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total RDV
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totals.total_rdv.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totals.rdv_termines} terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Taux de Complétion Moyen
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {avgCompletionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              RDV Annulés
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totals.rdv_annules}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totals.rdv_no_show} no-show
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agencies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des Agences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th 
                    className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('agence_nom')}
                  >
                    Agence {sortBy === 'agence_nom' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('ville')}
                  >
                    Ville {sortBy === 'ville' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('total_rdv')}
                  >
                    Total RDV {sortBy === 'total_rdv' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('rdv_termines')}
                  >
                    Terminés {sortBy === 'rdv_termines' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('taux_completion')}
                  >
                    Taux Complétion {sortBy === 'taux_completion' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('rdv_annules')}
                  >
                    Annulés {sortBy === 'rdv_annules' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSort('duree_moy_min')}
                  >
                    Durée Moy. {sortBy === 'duree_moy_min' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAgencies.map((agency) => (
                  <tr 
                    key={agency.agence_id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {agency.agence_nom}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {agency.ville}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-900 dark:text-white">
                      {agency.total_rdv}
                    </td>
                    <td className="p-3 text-right text-green-600 dark:text-green-400">
                      {agency.rdv_termines}
                    </td>
                    <td className="p-3 text-right">
                      <Badge 
                        variant={agency.taux_completion >= 80 ? 'default' : agency.taux_completion >= 60 ? 'secondary' : 'destructive'}
                        className="font-semibold"
                      >
                        {agency.taux_completion.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-red-600 dark:text-red-400">
                      {agency.rdv_annules}
                      {agency.rdv_no_show > 0 && (
                        <span className="text-xs text-slate-500 ml-1">
                          (+{agency.rdv_no_show} NS)
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-400">
                      {agency.duree_moy_min ? (
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(agency.duree_moy_min)} min
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {agencies.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Aucune donnée disponible</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Agences - Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedAgencies.slice(0, 5).map((agency, index) => (
                <div key={agency.agence_id} className="flex items-center justify-between">
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
                      {agency.total_rdv}
                    </p>
                    <p className="text-xs text-slate-500">RDV</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Agences - Taux de Complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...agencies]
                .sort((a, b) => b.taux_completion - a.taux_completion)
                .slice(0, 5)
                .map((agency, index) => (
                  <div key={agency.agence_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 text-sm font-bold text-green-600 dark:text-green-400">
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
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {agency.taux_completion.toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {agency.rdv_termines}/{agency.total_rdv}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
