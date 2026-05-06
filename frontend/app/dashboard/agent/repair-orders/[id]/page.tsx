'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { repairOrdersApi } from '@/lib/api/repairOrders';
import type { RepairOrder, RepairOrderStatus } from '@/types/repairOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddLineForm from '@/components/repair-orders/AddLineForm';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileText,
  CheckCircle,
  Clock,
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
  BROUILLON: 'Brouillon',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  FACTUREE: 'Facturée',
  ANNULEE: 'Annulée',
};

export default function RepairOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [commande, setCommande] = useState<RepairOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddLine, setShowAddLine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT', 'ADMIN'].includes(user.role))) {
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

  const handleAddLine = async (line: any) => {
    try {
      await repairOrdersApi.addLine(Number(params.id), line);
      await loadCommande();
      setShowAddLine(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout');
    }
  };

  const handleDeleteLine = async (ligneId: number) => {
    if (!confirm('Supprimer cette ligne ?')) return;
    try {
      await repairOrdersApi.deleteLine(Number(params.id), ligneId);
      await loadCommande();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleUpdateStatus = async (statut: RepairOrderStatus) => {
    const messages: Record<string, string> = {
      EN_COURS: 'Démarrer cette commande ?',
      TERMINEE: 'Marquer cette commande comme terminée ?',
      ANNULEE: 'Annuler cette commande ?',
    };

    if (!confirm(messages[statut] || 'Changer le statut ?')) return;

    try {
      await repairOrdersApi.updateStatus(Number(params.id), { statut });
      await loadCommande();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleCreateInvoice = async () => {
    if (!confirm('Créer la facture pour cette commande ?')) return;
    try {
      await repairOrdersApi.createInvoice(Number(params.id));
      await loadCommande();
      alert('Facture créée avec succès !');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la création de la facture');
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
                {commande.client_prenom} {commande.client_nom} - {commande.immatriculation}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {commande.statut === 'BROUILLON' && (
              <Button
                onClick={() => handleUpdateStatus('EN_COURS')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Démarrer
              </Button>
            )}
            {commande.statut === 'EN_COURS' && (
              <Button
                onClick={() => handleUpdateStatus('TERMINEE')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Terminer
              </Button>
            )}
            {commande.statut === 'TERMINEE' && (
              <Button
                onClick={handleCreateInvoice}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Créer Facture
              </Button>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-semibold">
                {commande.client_prenom} {commande.client_nom}
              </p>
              {commande.client_telephone && (
                <p className="text-slate-400 text-sm">{commande.client_telephone}</p>
              )}
              {commande.client_email && (
                <p className="text-slate-400 text-sm">{commande.client_email}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-semibold">{commande.immatriculation}</p>
              <p className="text-slate-400 text-sm">
                {commande.marque_nom} {commande.modele_nom}
              </p>
              <p className="text-slate-400 text-sm">{commande.numero_chassis}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-white text-2xl">{commande.montant_total?.toFixed(2) || '0.00'} TND</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lignes */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                Lignes de commande ({commande.lignes.length})
              </CardTitle>
              {!['FACTUREE', 'ANNULEE'].includes(commande.statut) && (
                <Button
                  onClick={() => setShowAddLine(!showAddLine)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une ligne
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showAddLine && (
              <div className="mb-6 p-4 bg-slate-800 rounded-lg">
                <AddLineForm 
                  onSubmit={handleAddLine} 
                  onCancel={() => setShowAddLine(false)} 
                />
              </div>
            )}

            {commande.lignes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucune ligne ajoutée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-2 text-slate-400 font-medium">Type</th>
                      <th className="text-left py-3 px-2 text-slate-400 font-medium">Description</th>
                      <th className="text-right py-3 px-2 text-slate-400 font-medium">Qté</th>
                      <th className="text-right py-3 px-2 text-slate-400 font-medium">Prix Unit.</th>
                      <th className="text-right py-3 px-2 text-slate-400 font-medium">Total</th>
                      {!['FACTUREE', 'ANNULEE'].includes(commande.statut) && (
                        <th className="text-right py-3 px-2 text-slate-400 font-medium">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {commande.lignes.map((ligne) => (
                      <tr key={ligne.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ligne.type === 'INTERVENTION' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {ligne.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white">{ligne.description}</td>
                        <td className="py-3 px-2 text-right text-white">{ligne.quantite}</td>
                        <td className="py-3 px-2 text-right text-white">
                          {ligne.prix_unitaire.toFixed(2)} TND
                        </td>
                        <td className="py-3 px-2 text-right text-white font-semibold">
                          {ligne.prix_total.toFixed(2)} TND
                        </td>
                        {!['FACTUREE', 'ANNULEE'].includes(commande.statut) && (
                          <td className="py-3 px-2 text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLine(ligne.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Créée le</p>
                <p className="text-white font-medium">
                  {new Date(commande.date_creation).toLocaleString('fr-FR')}
                </p>
              </div>
              {commande.date_validation && (
                <div>
                  <p className="text-slate-400">Validée le</p>
                  <p className="text-white font-medium">
                    {new Date(commande.date_validation).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
              {commande.date_debut && (
                <div>
                  <p className="text-slate-400">Démarrée le</p>
                  <p className="text-white font-medium">
                    {new Date(commande.date_debut).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
              {commande.date_fin && (
                <div>
                  <p className="text-slate-400">Terminée le</p>
                  <p className="text-white font-medium">
                    {new Date(commande.date_fin).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
