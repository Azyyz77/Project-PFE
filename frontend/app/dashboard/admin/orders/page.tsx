'use client';

import api from '@/lib/api/axios';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Wrench, ArrowLeft, Loader2, Search, Calendar, User, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { toast } from 'sonner';

interface Order {
  id: number;
  date_heure: string;
  statut: string;
  description: string;
  immatriculation: string;
  marque_nom: string;
  modele_nom: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  agence_nom: string;
  agence_ville: string;
  agent_nom: string | null;
  agent_prenom: string | null;
  nombre_interventions: number;
  cout_total: number | null;
}

interface OrdersStats {
  total_commandes: number;
  planifiees: number;
  confirmees: number;
  en_cours: number;
  terminees: number;
  annulees: number;
  revenu_total: number;
  total_interventions: number;
}

export default function AdminOrdersPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrdersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !['ADMIN', 'DIRECTION'].includes(user.role))) {
      router.replace('/unauthorized');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('statut', filterStatus);
      
      const queryString = params.toString();
      const ordersUrl = queryString ? `/admin/orders?${queryString}` : '/admin/orders';

      const [ordersRes, statsRes] = await Promise.all([
        api.get(ordersUrl),
        api.get('/admin/orders/stats'),
      ]);

      setOrders(ordersRes.data.orders || []);
      setStats(statsRes.data.stats || null);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o =>
    o.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${o.client_nom} ${o.client_prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.agence_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (statut: string) => {
    const colors: Record<string, string> = {
      PLANIFIE: 'bg-blue-50 text-blue-700 border border-blue-200/50 shadow-none',
      CONFIRME: 'bg-green-50 text-green-700 border border-green-200/50 shadow-none',
      EN_COURS: 'bg-amber-50 text-amber-700 border border-amber-200/50 shadow-none',
      TERMINE: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-none',
      ANNULE: 'bg-rose-50 text-rose-700 border border-rose-200/50 shadow-none',
    };
    return colors[statut] || 'bg-slate-50 text-slate-600 border border-slate-200/50';
  };

  if (authLoading || !user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <Wrench className="w-7 h-7 text-orange-500" />
            Toutes les commandes SAV
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gérez et suivez l'ensemble des ordres de réparation et commandes d'interventions.</p>
        </div>
      </div>

      {/* Stats Counter Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{stats.total_commandes}</p>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Planifiées</p>
            <p className="text-xl font-extrabold text-blue-900 mt-1">{stats.planifiees}</p>
          </div>
          <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Confirmées</p>
            <p className="text-xl font-extrabold text-green-900 mt-1">{stats.confirmees}</p>
          </div>
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">En cours</p>
            <p className="text-xl font-extrabold text-amber-900 mt-1">{stats.en_cours}</p>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Terminées</p>
            <p className="text-xl font-extrabold text-emerald-900 mt-1">{stats.terminees}</p>
          </div>
          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Annulées</p>
            <p className="text-xl font-extrabold text-rose-900 mt-1">{stats.annulees}</p>
          </div>
          <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Interv.</p>
            <p className="text-xl font-extrabold text-orange-900 mt-1">{stats.total_interventions}</p>
          </div>
          <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Revenu</p>
            <p className="text-base font-extrabold text-purple-900 mt-1.5 truncate">
              {stats.revenu_total ? `${stats.revenu_total.toFixed(0)} TND` : '0 TND'}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par immatriculation, client ou agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 font-semibold"
        >
          <option value="">Tous les statuts</option>
          <option value="PLANIFIE">Planifiées</option>
          <option value="CONFIRME">Confirmées</option>
          <option value="EN_COURS">En cours</option>
          <option value="TERMINE">Terminées</option>
          <option value="ANNULE">Annulées</option>
        </select>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucune commande répertoriée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agence</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Interv.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coût total</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(order.date_heure).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{order.client_prenom} {order.client_nom}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{order.client_telephone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">{order.marque_nom} {order.modele_nom}</div>
                          <div className="text-xs text-slate-500 font-mono font-semibold mt-0.5">{order.immatriculation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{order.agence_nom}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{order.agence_ville}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                      {order.agent_nom ? `${order.agent_prenom} ${order.agent_nom}` : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">
                      {order.nombre_interventions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-extrabold">
                      {order.cout_total ? `${order.cout_total.toFixed(2)} TND` : <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(order.statut)}`}>
                        {order.statut}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
