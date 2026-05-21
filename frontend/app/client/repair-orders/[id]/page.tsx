'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import type { RepairOrder, RepairOrderStatus } from '@/types/repairOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock
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

export default function ClientRepairOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [commande, setCommande] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (params.id && token) {
      loadCommande();
    }
  }, [params.id, token]);

  const loadCommande = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repairOrdersApi.getById(Number(params.id));
      setCommande(data);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement de la commande...</div>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400">{error || 'Commande non trouvée'}</p>
                <Button
                  onClick={() => router.back()}
                  className="mt-4"
                  variant="outline"
                >
                  Retour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Commande {commande.numero}
                <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[commande.statut]} text-white`}>
                  {STATUS_LABELS[commande.statut]}
                </span>
              </h1>
              <p className="text-slate-400 mt-1">
                {commande.immatriculation} - {commande.marque_nom} {commande.modele_nom}
              </p>
            </div>
          </div>
        </div>

        {/* Statut de la commande */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-2">Statut de votre réparation</p>
                <div className="flex items-center gap-3">
                  {commande.statut === 'BROUILLON' && (
                    <>
                      <Clock className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="text-white font-semibold">En préparation</p>
                        <p className="text-slate-400 text-sm">Votre commande est en cours de préparation</p>
                      </div>
                    </>
                  )}
                  {commande.statut === 'EN_COURS' && (
                    <>
                      <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
                      <div>
                        <p className="text-white font-semibold">Réparation en cours</p>
                        <p className="text-slate-400 text-sm">Nos techniciens travaillent sur votre véhicule</p>
                      </div>
                    </>
                  )}
                  {commande.statut === 'TERMINEE' && (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-semibold">Réparation terminée</p>
                        <p className="text-slate-400 text-sm">Votre véhicule est prêt</p>
                      </div>
                    </>
                  )}
                  {commande.statut === 'FACTUREE' && (
                    <>
                      <FileText className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-white font-semibold">Facturée</p>
                        <p className="text-slate-400 text-sm">Votre facture est disponible</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-slate-400 text-sm">Montant total</p>
                <p className="text-white text-3xl font-bold">
                  {commande.montant_total?.toFixed(2) || '0.00'} TND
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-semibold text-lg">{commande.immatriculation}</p>
              <p className="text-slate-400">
                {commande.marque_nom} {commande.modele_nom}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Châssis: {commande.numero_chassis}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Agence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-semibold">{commande.agence_nom}</p>
              {commande.agence_adresse && (
                <p className="text-slate-400 text-sm">{commande.agence_adresse}</p>
              )}
              {commande.agence_telephone && (
                <p className="text-slate-400 text-sm">{commande.agence_telephone}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Détail des travaux */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Détail des travaux</CardTitle>
          </CardHeader>
          <CardContent>
            {commande.lignes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucun détail disponible pour le moment
              </div>
            ) : (
              <div className="space-y-3">
                {commande.lignes.map((ligne) => (
                  <div
                    key={ligne.id}
                    className="flex items-center justify-between p-4 bg-slate-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ligne.type === 'INTERVENTION' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {ligne.type === 'INTERVENTION' ? 'Main d\'œuvre' : 'Pièce'}
                        </span>
                        <span className="text-white font-medium">{ligne.description}</span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {ligne.quantite} × {ligne.prix_unitaire.toFixed(2)} TND
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold text-lg">
                        {ligne.prix_total.toFixed(2)} TND
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Récapitulatif */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-white text-xl font-bold">
                <span>Montant Total</span>
                <span>{commande.montant_total?.toFixed(2) || '0.00'} TND</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">
                Montant TTC (TVA incluse)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        {(commande.date_creation || commande.date_fin) && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {commande.date_creation && (
                  <div>
                    <p className="text-slate-400">Créée le</p>
                    <p className="text-white font-medium">
                      {new Date(commande.date_creation).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {commande.date_debut && (
                  <div>
                    <p className="text-slate-400">Démarrée le</p>
                    <p className="text-white font-medium">
                      {new Date(commande.date_debut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                {commande.date_fin && (
                  <div>
                    <p className="text-slate-400">Terminée le</p>
                    <p className="text-white font-medium">
                      {new Date(commande.date_fin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
