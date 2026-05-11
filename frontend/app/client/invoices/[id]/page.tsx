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
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  EMISE: 'bg-blue-500',
  ENVOYEE: 'bg-purple-500',
  PAYEE: 'bg-green-500',
  ANNULEE: 'bg-blue-500',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  EMISE: 'Émise',
  ENVOYEE: 'Envoyée',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
};

export default function ClientInvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [facture, setFacture] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
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

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-[#B0B3B8]">Chargement...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-[#B0B3B8]">Chargement de la facture...</div>
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white border-slate-800">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-blue-400">{error || 'Facture non trouvée'}</p>
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
      <div className="max-w-4xl mx-auto space-y-6">
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
              <p className="text-[#B0B3B8] mt-1">
                Commande: {facture.commande_numero}
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>

        {/* Statut de paiement */}
        {facture.statut === 'PAYEE' ? (
          <Card className="bg-green-900/20 border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-green-400 font-semibold">Facture payée</p>
                  <p className="text-green-300 text-sm">
                    Payée le {new Date(facture.date_paiement!).toLocaleDateString('fr-FR')}
                    {facture.mode_paiement && ` par ${facture.mode_paiement}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : facture.statut === 'ANNULEE' ? (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="text-blue-400 font-semibold">Facture annulée</p>
                  {facture.notes && (
                    <p className="text-red-300 text-sm">{facture.notes}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-orange-900/20 border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-orange-400 font-semibold">Paiement en attente</p>
                  <p className="text-orange-300 text-sm">
                    Veuillez régler cette facture auprès de l'agence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Montant */}
        <Card className="bg-white border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Montant à payer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-white">
                {facture.montant_ttc.toFixed(2)} TND
              </p>
              <p className="text-[#B0B3B8] mt-2">TTC</p>
            </div>
          </CardContent>
        </Card>

        {/* Détails */}
        <Card className="bg-white border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#B0B3B8]">Date d'émission</p>
                  <p className="text-white font-medium">
                    {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-[#B0B3B8]">Véhicule</p>
                  <p className="text-white font-medium">
                    {facture.vehicule_immatriculation}
                  </p>
                  <p className="text-[#B0B3B8] text-xs">
                    {facture.vehicule_marque} {facture.vehicule_modele}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lignes */}
        <Card className="bg-white border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Détail des prestations</CardTitle>
          </CardHeader>
          <CardContent>
            {!facture.lignes || facture.lignes.length === 0 ? (
              <div className="text-center py-8 text-[#B0B3B8]">
                Aucune ligne
              </div>
            ) : (
              <div className="space-y-3">
                {facture.lignes.map((ligne) => (
                  <div
                    key={ligne.id}
                    className="flex items-center justify-between p-3 bg-[#F0F2F5] rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{ligne.description}</p>
                      <p className="text-[#B0B3B8] text-sm">
                        {ligne.quantite} × {ligne.prix_unitaire.toFixed(2)} TND
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {ligne.prix_total.toFixed(2)} TND
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agence */}
        <Card className="bg-white border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Agence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white font-semibold">{facture.agence_nom}</p>
            {facture.agence_adresse && (
              <p className="text-[#B0B3B8] text-sm">{facture.agence_adresse}</p>
            )}
            {facture.agence_telephone && (
              <p className="text-[#B0B3B8] text-sm">Tél: {facture.agence_telephone}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
