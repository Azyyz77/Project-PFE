'use client';

import { useEffect, useState, useCallback } from 'react';
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
  ANNULEE: 'bg-red-500',
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

  const loadFacture = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getById(Number(params.id));
      setFacture(data);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id && token) {
      loadFacture();
    }
  }, [params.id, token, loadFacture]);

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
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    }
  };

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="text-slate-500">Chargement de la facture...</div>
      </div>
    );
  }

  if (error || !facture) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-600">{error || 'Facture non trouvée'}</p>
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
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f2f5d] via-[#173d7a] to-[#1d4f98] p-8 text-white shadow-[0_18px_40px_rgba(15,47,93,0.35)] transition-shadow duration-500">
          <div className="pointer-events-none absolute -right-10 top-4 h-44 w-44 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute right-24 bottom-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Facture {facture.numero}
                <span className={`rounded-full px-3 py-1 text-sm ${STATUS_COLORS[facture.statut]} text-white`}>
                  {STATUS_LABELS[facture.statut]}
                </span>
              </h1>
              <p className="mt-1 text-blue-100">
                Commande: {facture.commande_numero}
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadPDF}
            className="rounded-xl bg-gradient-to-r from-[#0f2543] to-[#1d4f98] text-white hover:shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          </div>
        </div>

        {/* Statut de paiement */}
        {facture.statut === 'PAYEE' ? (
          <Card className="rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-emerald-700 font-semibold">Facture payée</p>
                  <p className="text-emerald-700 text-sm">
                    Payée le {new Date(facture.date_paiement!).toLocaleDateString('fr-FR')}
                    {facture.mode_paiement && ` par ${facture.mode_paiement}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : facture.statut === 'ANNULEE' ? (
          <Card className="rounded-2xl border border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-red-700 font-semibold">Facture annulée</p>
                  {facture.notes && (
                    <p className="text-red-700 text-sm">{facture.notes}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-amber-600" />
                <div>
                  <p className="text-amber-700 font-semibold">Paiement en attente</p>
                  <p className="text-amber-700 text-sm">
                    Veuillez régler cette facture auprès de l&apos;agence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Montant */}
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Montant à payer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-slate-900">
                {facture.montant_ttc.toFixed(2)} TND
              </p>
              <p className="text-slate-500 mt-2">TTC</p>
            </div>
          </CardContent>
        </Card>

        {/* Détails */}
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Détails de la facture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Date d&apos;émission</p>
                  <p className="text-slate-900 font-medium">
                    {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Véhicule</p>
                  <p className="text-slate-900 font-medium">
                    {facture.vehicule_immatriculation}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {facture.vehicule_marque} {facture.vehicule_modele}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lignes */}
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Détail des prestations</CardTitle>
          </CardHeader>
          <CardContent>
            {!facture.lignes || facture.lignes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucune ligne
              </div>
            ) : (
              <div className="space-y-3">
                {facture.lignes.map((ligne) => (
                  <div
                    key={ligne.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{ligne.description}</p>
                      <p className="text-slate-500 text-sm">
                        {ligne.quantite} × {ligne.prix_unitaire.toFixed(2)} TND
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold">
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
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 text-sm">Agence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-900 font-semibold">{facture.agence_nom}</p>
            {facture.agence_adresse && (
              <p className="text-slate-500 text-sm">{facture.agence_adresse}</p>
            )}
            {facture.agence_telephone && (
              <p className="text-slate-500 text-sm">Tél: {facture.agence_telephone}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
