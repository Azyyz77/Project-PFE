'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from '@/lib/api/axios';

// Couleurs
const COLORS = {
  primary: '#e11d48',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

interface BillingStats {
  total_factures: number;
  factures_payees: number;
  factures_impayees: number;
  factures_annulees: number;
  montant_total: number;
  montant_paye: number;
  montant_impaye: number;
  montant_moyen: number;
  taux_paiement: number;
}

interface FactureByAgency {
  agence_id: number;
  agence_nom: string;
  total_factures: number;
  montant_total: number;
  montant_paye: number;
  taux_paiement: number;
}

interface MonthlyBilling {
  annee: number;
  mois: number;
  total_factures: number;
  montant_total: number;
  montant_paye: number;
}

interface PaymentMethod {
  mode_paiement: string;
  count: number;
  montant_total: number;
}

export default function DirectionBillingPage() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  
  // Data states
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [facturesByAgency, setFacturesByAgency] = useState<FactureByAgency[]>([]);
  const [monthlyBilling, setMonthlyBilling] = useState<MonthlyBilling[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Construire les paramètres de filtre
      const params = new URLSearchParams();
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);
      
      const queryString = params.toString();
      const url = `/direction/stats/billing${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url);
      const data = response.data.data;

      setBillingStats(data.global);
      setFacturesByAgency(data.par_agence || []);
      setMonthlyBilling(data.evolution_mensuelle || []);
      setPaymentMethods(data.modes_paiement || []);
    } catch (error: any) {
      console.error('Erreur chargement facturation:', error);
      toast.error('Erreur lors du chargement des données de facturation');
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

  const handleExport = () => {
    toast.info('Export en cours de développement');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const statusData = billingStats ? [
    { name: 'Payées', value: billingStats.factures_payees, color: COLORS.success },
    { name: 'Impayées', value: billingStats.factures_impayees, color: COLORS.warning },
    { name: 'Annulées', value: billingStats.factures_annulees, color: COLORS.danger },
  ] : [];

  const monthlyData = monthlyBilling.slice().reverse().slice(0, 6).map((month) => ({
    mois: new Date(month.annee, month.mois - 1).toLocaleDateString('fr-FR', { month: 'short' }),
    factures: month.total_factures,
    montant: month.montant_total,
    paye: month.montant_paye,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Revenus & Facturation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Vue d'ensemble des revenus et de la facturation
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

      {/* Summary Cards */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Revenu Total</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {billingStats.montant_total.toLocaleString('fr-TN')} TND
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {billingStats.total_factures} factures
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Montant Payé</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {billingStats.montant_paye.toLocaleString('fr-TN')} TND
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {billingStats.factures_payees} factures
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Montant Impayé</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {billingStats.montant_impaye.toLocaleString('fr-TN')} TND
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {billingStats.factures_impayees} factures
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Taux de Paiement</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {billingStats.taux_paiement.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Moyenne: {billingStats.montant_moyen.toLocaleString('fr-TN')} TND
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par Statut */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Modes de Paiement */}
        {paymentMethods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Modes de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethods}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mode_paiement" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => `${Number(value).toLocaleString('fr-TN')} TND`}
                  />
                  <Legend />
                  <Bar dataKey="montant_total" fill={COLORS.primary} name="Montant (TND)" />
                  <Bar dataKey="count" fill={COLORS.info} name="Nombre" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Évolution Mensuelle */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution Mensuelle des Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorMontant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPaye" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `${Number(value).toLocaleString('fr-TN')} TND`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="montant" 
                  stroke={COLORS.primary} 
                  fillOpacity={1} 
                  fill="url(#colorMontant)" 
                  name="Montant Total"
                />
                <Area 
                  type="monotone" 
                  dataKey="paye" 
                  stroke={COLORS.success} 
                  fillOpacity={1} 
                  fill="url(#colorPaye)" 
                  name="Montant Payé"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenus par Agence */}
        {facturesByAgency.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenus par Agence</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={facturesByAgency.slice(0, 10).map((agency) => ({
                    nom: agency.agence_nom.length > 15 ? agency.agence_nom.substring(0, 15) + '...' : agency.agence_nom,
                    total: agency.montant_total,
                    paye: agency.montant_paye,
                    taux: agency.taux_paiement,
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
                    formatter={(value: any, name?: string | number) => {
                      const nameStr = String(name || '');
                      if (nameStr === 'taux') return [`${Number(value).toFixed(1)}%`, 'Taux Paiement'];
                      return [`${Number(value).toLocaleString('fr-TN')} TND`, nameStr];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill={COLORS.primary} name="Montant Total" />
                  <Bar dataKey="paye" fill={COLORS.success} name="Montant Payé" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Table */}
      {facturesByAgency.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Détails par Agence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3 text-sm font-semibold text-slate-900 dark:text-white">Agence</th>
                    <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Factures</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-900 dark:text-white">Montant Total</th>
                    <th className="text-right p-3 text-sm font-semibold text-slate-900 dark:text-white">Montant Payé</th>
                    <th className="text-center p-3 text-sm font-semibold text-slate-900 dark:text-white">Taux Paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {facturesByAgency.map((agency) => (
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
                      <td className="p-3 text-center font-medium text-slate-900 dark:text-white">
                        {agency.total_factures}
                      </td>
                      <td className="p-3 text-right font-medium text-slate-900 dark:text-white">
                        {agency.montant_total.toLocaleString('fr-TN')} TND
                      </td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400 font-medium">
                        {agency.montant_paye.toLocaleString('fr-TN')} TND
                      </td>
                      <td className="p-3 text-center">
                        <Badge 
                          variant={agency.taux_paiement >= 80 ? 'default' : agency.taux_paiement >= 60 ? 'secondary' : 'destructive'}
                        >
                          {agency.taux_paiement.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
