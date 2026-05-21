'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import type { RepairOrderSummary, RepairOrderStatus } from '@/types/repairOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

const STATUS_COLORS: Record<RepairOrderStatus, string> = {
  BROUILLON: 'bg-gray-500',
  EN_COURS: 'bg-blue-500',
  TERMINEE: 'bg-green-500',
  FACTUREE: 'bg-purple-500',
  ANNULEE: 'bg-red-500',
};

const STATUS_LABELS: Record<RepairOrderStatus, string> = {
  BROUILLON: 'En préparation',
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

export default function ClientRepairOrdersPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [commandes, setCommandes] = useState<RepairOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && token) {
      loadCommandes();
    }
  }, [user, token]);

  const loadCommandes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairOrdersApi.getMyOrders();
      setCommandes(data);
    } catch (err: any) {
      console.error('Erreur chargement commandes:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            Mes Commandes de Réparation
          </h1>
          <p className="text-slate-400 mt-1">
            Consultez l'historique de vos réparations et factures
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['EN_COURS', 'TERMINEE', 'FACTUREE', 'ANNULEE'] as RepairOrderStatus[]).map((status) => {
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
                    <div className={`w-10 h-10 rounded-lg ${STATUS_COLORS[status]}/10 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${STATUS_COLORS[status].replace('bg-', 'text-')}`} />
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
              Historique ({commandes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                Chargement de vos commandes...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                {error}
              </div>
            ) : commandes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Aucune commande pour le moment</p>
                <p className="text-slate-500 text-sm mt-2">
                  Vos commandes de réparation apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {commandes.map((commande) => {
                  const Icon = STATUS_ICONS[commande.statut];
                  return (
                    <div
                      key={commande.id}
                      className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-white font-mono font-semibold">
                              {commande.numero}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[commande.statut]}`}>
                              <Icon className="w-3 h-3" />
                              {STATUS_LABELS[commande.statut]}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-slate-400 text-sm">Véhicule</p>
                              <p className="text-white font-medium">{commande.immatriculation}</p>
                              <p className="text-slate-400 text-sm">
                                {commande.marque_nom} {commande.modele_nom}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-slate-400 text-sm">Agence</p>
                              <p className="text-white font-medium">{commande.agence_nom}</p>
                            </div>
                            
                            <div>
                              <p className="text-slate-400 text-sm">Date</p>
                              <p className="text-white font-medium">
                                {new Date(commande.date_creation).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <p className="text-slate-400 text-sm">Montant total</p>
                            <p className="text-white text-2xl font-bold">
                              {commande.montant_total?.toFixed(2) || '0.00'} TND
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => router.push(`/client/repair-orders/${commande.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 ml-4"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
