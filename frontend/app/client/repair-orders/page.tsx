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
import type { ComponentType } from 'react';

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

const STATUS_ICONS: Record<RepairOrderStatus, ComponentType<{ className?: string }>> = {
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
    } catch (error: unknown) {
      console.error('Erreur chargement commandes:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors du chargement des commandes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f2f5d] via-[#173d7a] to-[#1d4f98] p-8 text-white shadow-[0_18px_40px_rgba(15,47,93,0.35)] transition-shadow duration-500">
          <div className="pointer-events-none absolute -right-10 top-4 h-44 w-44 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-24 bottom-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mes Commandes de Réparation</h1>
                <p className="text-sm text-blue-100">Consultez l&apos;historique de vos réparations et factures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['EN_COURS', 'TERMINEE', 'FACTUREE', 'ANNULEE'] as RepairOrderStatus[]).map((status) => {
            const count = commandes.filter(c => c.statut === status).length;
            const Icon = STATUS_ICONS[status];
            return (
              <Card key={status} className="rounded-2xl border border-slate-200/70 bg-white shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">{STATUS_LABELS[status]}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl ${STATUS_COLORS[status]}/10 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${STATUS_COLORS[status].replace('bg-', 'text-')}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Liste des commandes */}
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">
              Historique ({commandes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">
                Chargement de vos commandes...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : commandes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 text-lg">Aucune commande pour le moment</p>
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
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#0f2543] hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-semibold text-slate-900">
                              {commande.numero}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white ${STATUS_COLORS[commande.statut]}`}>
                              <Icon className="w-3 h-3" />
                              {STATUS_LABELS[commande.statut]}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-slate-500 text-sm">Véhicule</p>
                              <p className="font-medium text-slate-900">{commande.immatriculation}</p>
                              <p className="text-slate-500 text-sm">
                                {commande.marque_nom} {commande.modele_nom}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-slate-500 text-sm">Agence</p>
                              <p className="font-medium text-slate-900">{commande.agence_nom}</p>
                            </div>
                            
                            <div>
                              <p className="text-slate-500 text-sm">Date</p>
                              <p className="font-medium text-slate-900">
                                {new Date(commande.date_creation).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-slate-500 text-sm">Montant total</p>
                            <p className="text-slate-900 text-2xl font-bold">
                              {commande.montant_total?.toFixed(2) || '0.00'} TND
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => router.push(`/client/repair-orders/${commande.id}`)}
                          className="ml-4 bg-gradient-to-r from-[#0f2543] to-[#1d4f98] text-white hover:shadow-lg"
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
