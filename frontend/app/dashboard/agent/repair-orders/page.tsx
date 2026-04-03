'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAppointments } from '@/lib/api/agentDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Calendar, User, Car, Clock, FileText, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface RepairOrder {
  id: number;
  rdvId: number;
  clientNom: string;
  clientPrenom: string;
  clientTelephone?: string;
  vehicule: string;
  immatriculation: string;
  dateRdv: string;
  statutRdv: string;
  interventions: {
    id: number;
    type: string;
    sousType: string;
    statut: string;
    prix?: number;
  }[];
}

export default function RepairOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const appointments = await fetchAppointments(token, {});
      
      // Transformer les rendez-vous en commandes de réparation
      const repairOrders: RepairOrder[] = appointments
        .filter((rdv: any) => rdv.interventions && rdv.interventions.length > 0)
        .map((rdv: any) => ({
          id: rdv.id,
          rdvId: rdv.id,
          clientNom: rdv.client_nom,
          clientPrenom: rdv.client_prenom,
          clientTelephone: rdv.client_telephone,
          vehicule: `${rdv.marque_nom} ${rdv.modele_nom}`,
          immatriculation: rdv.immatriculation,
          dateRdv: rdv.date_rendez_vous,
          statutRdv: rdv.statut,
          interventions: rdv.interventions.map((inv: any) => ({
            id: inv.id,
            type: inv.type_nom,
            sousType: inv.sous_type_nom,
            statut: inv.statut,
            prix: inv.prix
          }))
        }));
      
      setOrders(repairOrders);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les commandes' });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (statut: string): string => {
    const map: Record<string, string> = {
      EN_ATTENTE: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      EN_COURS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      TERMINE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      ANNULE: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return map[statut] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const rdvStatusColor = (statut: string): string => {
    const map: Record<string, string> = {
      PLANIFIE: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      CONFIRME: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      EN_COURS: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      TERMINE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      ANNULE: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return map[statut] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const statusLabel = (statut: string): string => {
    const map: Record<string, string> = {
      PLANIFIE: 'Planifié',
      CONFIRME: 'Confirmé',
      EN_COURS: 'En cours',
      EN_ATTENTE: 'En attente',
      TERMINE: 'Terminé',
      ANNULE: 'Annulé',
    };
    return map[statut] || statut;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filterStatus || order.statutRdv === filterStatus;
    const matchesSearch = !searchTerm || 
      `${order.clientNom} ${order.clientPrenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vehicule.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Wrench className="w-7 h-7 text-orange-500" />
          Commandes de Réparation
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
          />
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">En cours</p>
          <p className="text-2xl font-bold text-blue-500">
            {orders.filter(o => o.statutRdv === 'EN_COURS').length}
          </p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-sm">Terminées</p>
          <p className="text-2xl font-bold text-emerald-500">
            {orders.filter(o => o.statutRdv === 'TERMINE').length}
          </p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-orange-400 text-sm">Total Interventions</p>
          <p className="text-2xl font-bold text-orange-500">
            {orders.reduce((sum, o) => sum + o.interventions.length, 0)}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 mt-4">Chargement...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Wrench className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Aucune commande trouvée</p>
            <p className="text-slate-500 text-sm">
              {searchTerm || filterStatus ? 'Essayez de modifier vos filtres' : 'Les commandes apparaîtront ici'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/50 transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">
                      Commande #{order.id}
                    </h3>
                    <Badge className={rdvStatusColor(order.statutRdv)} variant="outline">
                      {statusLabel(order.statutRdv)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(order.dateRdv)}</span>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-3 gap-6 mb-4">
                {/* Client */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Client
                  </p>
                  <p className="text-white font-medium">
                    {order.clientPrenom} {order.clientNom}
                  </p>
                  {order.clientTelephone && (
                    <p className="text-slate-400 text-sm">{order.clientTelephone}</p>
                  )}
                </div>

                {/* Vehicle */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Car className="w-3 h-3" />
                    Véhicule
                  </p>
                  <p className="text-white font-medium">{order.vehicule}</p>
                  <p className="text-slate-400 text-sm font-mono">{order.immatriculation}</p>
                </div>

                {/* Interventions Count */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Wrench className="w-3 h-3" />
                    Interventions
                  </p>
                  <p className="text-white font-medium">{order.interventions.length} service(s)</p>
                </div>
              </div>

              {/* Interventions List */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                  Détails des interventions
                </p>
                <div className="space-y-2">
                  {order.interventions.map((intervention) => (
                    <div
                      key={intervention.id}
                      className="flex justify-between items-center bg-slate-900/50 rounded-lg p-3"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">
                          {intervention.type}
                        </p>
                        <p className="text-slate-400 text-xs">{intervention.sousType}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColor(intervention.statut)} variant="outline" size="sm">
                          {statusLabel(intervention.statut)}
                        </Badge>
                        {intervention.prix && (
                          <span className="text-emerald-400 font-semibold font-mono">
                            {intervention.prix} DT
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
