'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import type { RepairOrderSummary, RepairOrderStatus } from '@/types/repairOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateFromAppointmentModal from '@/components/repair-orders/CreateFromAppointmentModal';
import { 
  FileText, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

const STATUS_COLORS: Record<RepairOrderStatus, string> = {
  BROUILLON: 'bg-gray-500',
  EN_COURS: 'bg-blue-500',
  TERMINEE: 'bg-green-500',
  FACTUREE: 'bg-purple-500',
  ANNULEE: 'bg-red-500',
};

const STATUS_LABELS: Record<RepairOrderStatus, string> = {
  BROUILLON: 'Brouillon',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  FACTUREE: 'Facturée',
  ANNULEE: 'Annulée',
};

const STATUS_ICONS: Record<RepairOrderStatus, any> = {
  BROUILLON: AlertCircle,
  EN_COURS: Clock,
  TERMINEE: CheckCircle2,
  FACTUREE: FileText,
  ANNULEE: XCircle,
};

export default function RepairOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [commandes, setCommandes] = useState<RepairOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT', 'ADMIN'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && token) {
      loadCommandes();
    }
  }, [user, token, statusFilter]);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = statusFilter ? { statut: statusFilter } : undefined;
      const data = await repairOrdersApi.list(filters);
      setCommandes(data);
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommandes = commandes.filter(commande => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (commande.numero || '').toLowerCase().includes(searchLower) ||
      (commande.client_nom || '').toLowerCase().includes(searchLower) ||
      (commande.client_prenom || '').toLowerCase().includes(searchLower) ||
      (commande.immatriculation || '').toLowerCase().includes(searchLower)
    );
  });

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              Commandes de Réparation
            </h1>
            <p className="text-slate-400 mt-1">
              Gérez les commandes de réparation et les factures
            </p>
          </div>
          
          {/* Bouton Créer */}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Créer depuis RDV
          </Button>
        </div>

        {/* Filtres */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, client, immatriculation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtre statut */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="BROUILLON">Brouillon</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINEE">Terminée</option>
                  <option value="FACTUREE">Facturée</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(['BROUILLON', 'EN_COURS', 'TERMINEE', 'FACTUREE', 'ANNULEE'] as RepairOrderStatus[]).map((status) => {
            const count = commandes.filter(c => c.statut === status).length;
            const Icon = STATUS_ICONS[status];
            return (
              <Card key={status} className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{STATUS_LABELS[status]}</p>
                      <p className="text-2xl font-bold text-white mt-1">{count}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${STATUS_COLORS[status]}/10 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${STATUS_COLORS[status].replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Liste des commandes */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">
              Commandes ({filteredCommandes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                Chargement des commandes...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                {error}
              </div>
            ) : filteredCommandes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucune commande trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Numéro</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Client</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Véhicule</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Statut</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Montant</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                      <th className="text-right py-3 px-4 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommandes.map((commande) => {
                      const Icon = STATUS_ICONS[commande.statut];
                      return (
                        <tr key={commande.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <span className="text-white font-mono">{commande.numero}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">
                              {commande.client_prenom} {commande.client_nom}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-white">{commande.immatriculation}</div>
                            <div className="text-slate-400 text-sm">
                              {commande.marque_nom} {commande.modele_nom}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[commande.statut]}`}>
                              <Icon className="w-3 h-3" />
                              {STATUS_LABELS[commande.statut]}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-semibold">
                              {commande.montant_total?.toFixed(2) || '0.00'} TND
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-slate-400 text-sm">
                              {new Date(commande.date_creation).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => router.push(`/dashboard/agent/repair-orders/${commande.id}`)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modale de création */}
      <CreateFromAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadCommandes();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
