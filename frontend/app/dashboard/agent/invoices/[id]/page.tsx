'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesApi } from '@/lib/api/invoices';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  EMISE: 'bg-blue-500',
  ENVOYEE: 'bg-purple-500',
  PAYEE: 'bg-green-500',
  ANNULEE: 'bg-red-500',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  EMISE: 'Émise',
  ENVOYEE: 'Envoyée',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
};

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [facture, setFacture] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT', 'ADMIN'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (params.id && token) {
      loadFacture();
    }
  }, [params.id, token]);

  const loadFacture = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getById(Number(params.id));
      setFacture(data);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!facture) return;
    try {
      const blob = await invoicesApi.downloadPDF(facture.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${facture.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors du téléchargement');
    }
  };

  const handleSendEmail = async () => {
    if (!facture) return;
    if (!confirm('Envoyer cette facture par email au client ?')) return;
    try {
      await invoicesApi.sendByEmail(facture.id);
      alert('Facture envoyée par email avec succès!');
      await loadFacture();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'envoi');
    }
  };

  const handleMarkAsPaid = async () => {
    if (!facture) return;
    if (!paymentMode) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    try {
      await invoicesApi.updateStatus(facture.id, {
        statut: 'PAYEE',
        mode_paiement: paymentMode,
        notes: paymentNotes
      });
      alert('Facture marquée comme payée!');
      setShowPaymentModal(false);
      await loadFacture();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = async () => {
    if (!facture) return;
    const reason = prompt('Raison de l\'annulation:');
    if (!reason) return;

    try {
      await invoicesApi.cancel(facture.id, reason);
      alert('Facture annulée avec succès!');
      await loadFacture();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'annulation');
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
        <div className="text-slate-400">Chargement de la facture...</div>
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400">{error || 'Facture non trouvée'}</p>
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
                Facture {facture.numero}
                <span className={`px-3 py-1 rounded-full text-sm ${STATUS_COLORS[facture.statut]} text-white`}>
                  {STATUS_LABELS[facture.statut]}
                </span>
              </h1>
              <p className="text-slate-400 mt-1">
                Commande: {facture.commande_numero}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            {facture.statut === 'EMISE' && (
              <Button
                onClick={handleSendEmail}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par Email
              </Button>
            )}
            {(facture.statut === 'EMISE' || facture.statut === 'ENVOYEE') && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marquer Payée
              </Button>
            )}
            {facture.statut !== 'PAYEE' && facture.statut !== 'ANNULEE' && (
              <Button
                onClick={handleCancel}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-semibold">
                {facture.client_prenom} {facture.client_nom}
              </p>
              {facture.client_telephone && (
                <p className="text-slate-400 text-sm">{facture.client_telephone}</p>
              )}
              {facture.client_email && (
                <p className="text-slate-400 text-sm">{facture.client_email}</p>
              )}
              {facture.client_adresse && (
                <p className="text-slate-400 text-sm mt-2">{facture.client_adresse}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white font-semibold">{facture.vehicule_immatriculation}</p>
              <p className="text-slate-400 text-sm">
                {facture.vehicule_marque} {facture.vehicule_modele}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Total TTC:</span>
                  <span className="text-white text-2xl">{facture.montant_ttc.toFixed(2)} TND</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détails de la facture */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Date d'émission</p>
                <p className="text-white font-medium">
                  {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {facture.date_envoi && (
                <div>
                  <p className="text-slate-400">Date d'envoi</p>
                  <p className="text-white font-medium">
                    {new Date(facture.date_envoi).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {facture.date_paiement && (
                <div>
                  <p className="text-slate-400">Date de paiement</p>
                  <p className="text-white font-medium">
                    {new Date(facture.date_paiement).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {facture.mode_paiement && (
                <div>
                  <p className="text-slate-400">Mode de paiement</p>
                  <p className="text-white font-medium">{facture.mode_paiement}</p>
                </div>
              )}
            </div>
            {facture.notes && (
              <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm">Notes:</p>
                <p className="text-white text-sm">{facture.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lignes de la facture */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">
              Lignes de facturation ({facture.lignes?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!facture.lignes || facture.lignes.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucune ligne
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
                    </tr>
                  </thead>
                  <tbody>
                    {facture.lignes.map((ligne) => (
                      <tr key={ligne.id} className="border-b border-slate-800">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agence */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Agence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white font-semibold">{facture.agence_nom}</p>
            {facture.agence_adresse && (
              <p className="text-slate-400 text-sm">{facture.agence_adresse}</p>
            )}
            {facture.agence_telephone && (
              <p className="text-slate-400 text-sm">Tél: {facture.agence_telephone}</p>
            )}
            {facture.agence_email && (
              <p className="text-slate-400 text-sm">Email: {facture.agence_email}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-900 border-slate-800 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Enregistrer le paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Mode de paiement *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Virement">Virement</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleMarkAsPaid}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirmer le paiement
                </Button>
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-700"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
