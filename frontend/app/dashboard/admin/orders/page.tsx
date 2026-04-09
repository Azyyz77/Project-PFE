'use client';

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
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('statut', filterStatus);

      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/orders?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/admin/orders/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);

      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();

      setOrders(ordersData.orders || []);
      setStats(statsData.stats || null);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
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
      PLANIFIE: 'bg-blue-100 text-blue-800',
      CONFIRME: 'bg-green-100 text-green-800',
      EN_COURS: 'bg-yellow-100 text-yellow-800',
      TERMINE: 'bg-emerald-100 text-emerald-800',
      ANNULE: 'bg-red-100 text-red-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wrench className="w-8 h-8" />
                Toutes les commandes
              </h1>
              <p className="text-white/70 mt-1">Gestion de toutes les commandes de réparation</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-white/70 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total_commandes}</p>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
              <p className="text-blue-100 text-sm">Planifiées</p>
              <p className="text-2xl font-bold text-blue-50">{stats.planifiees}</p>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <p className="text-green-100 text-sm">Confirmées</p>
              <p className="text-2xl font-bold text-green-50">{stats.confirmees}</p>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
              <p className="text-yellow-100 text-sm">En cours</p>
              <p className="text-2xl font-bold text-yellow-50">{stats.en_cours}</p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/30">
              <p className="text-emerald-100 text-sm">Terminées</p>
              <p className="text-2xl font-bold text-emerald-50">{stats.terminees}</p>
            </div>
            <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <p className="text-red-100 text-sm">Annulées</p>
              <p className="text-2xl font-bold text-red-50">{stats.annulees}</p>
            </div>
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
              <p className="text-orange-100 text-sm">Interventions</p>
              <p className="text-2xl font-bold text-orange-50">{stats.total_interventions}</p>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
              <p className="text-purple-100 text-sm">Revenu</p>
              <p className="text-2xl font-bold text-purple-50">{stats.revenu_total?.toFixed(0)} TND</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="PLANIFIE">Planifié</option>
              <option value="CONFIRME">Confirmé</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Véhicule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Agence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Interventions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Coût</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/50" />
                          <span className="text-sm text-white/80">
                            {new Date(order.date_heure).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-white/50" />
                          <div>
                            <div className="text-sm text-white/80">{order.client_prenom} {order.client_nom}</div>
                            <div className="text-xs text-white/50">{order.client_telephone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-white/50" />
                          <div>
                            <div className="text-sm text-white/80">{order.marque_nom} {order.modele_nom}</div>
                            <div className="text-xs text-white/50 font-mono">{order.immatriculation}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white/80">{order.agence_nom}</div>
                        <div className="text-xs text-white/50">{order.agence_ville}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {order.agent_nom ? `${order.agent_prenom} ${order.agent_nom}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {order.nombre_interventions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                        {order.cout_total ? `${order.cout_total.toFixed(2)} TND` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadge(order.statut)}>{order.statut}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

