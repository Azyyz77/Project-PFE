'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { invoicesApi } from '@/lib/api/invoices';
import type { InvoiceSummary, InvoiceStatus } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye,
  Search,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import type { ComponentType } from 'react';

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

const STATUS_ICONS: Record<InvoiceStatus, ComponentType<{ className?: string }>> = {
  EMISE: Clock,
  ENVOYEE: Clock,
  PAYEE: CheckCircle,
  ANNULEE: XCircle,
};

export default function ClientInvoicesPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [factures, setFactures] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadFactures();
    }
  }, [token]);

  const loadFactures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getMyInvoices();
      setFactures(data);
    } catch (error: unknown) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: number, numero: string) => {
    try {
      const blob = await invoicesApi.downloadPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facture_${numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Erreur lors du téléchargement');
    }
  };

  const filteredFactures = factures.filter(f => 
    f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.commande_numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer les statistiques
  const totalFactures = factures.length;
  const facturesPayees = factures.filter(f => f.statut === 'PAYEE').length;
  const facturesEnAttente = factures.filter(f => f.statut === 'EMISE' || f.statut === 'ENVOYEE').length;
  const montantTotal = factures.reduce((sum, f) => sum + f.montant_ttc, 0);
  const montantPaye = factures.filter(f => f.statut === 'PAYEE').reduce((sum, f) => sum + f.montant_ttc, 0);
  const montantEnAttente = factures.filter(f => f.statut === 'EMISE' || f.statut === 'ENVOYEE').reduce((sum, f) => sum + f.montant_ttc, 0);

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
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mes Factures</h1>
              <p className="text-sm text-blue-100">Consultez et téléchargez vos factures</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Total factures</p>
                  <p className="text-2xl font-bold text-slate-900">{totalFactures}</p>
                </div>
                <FileText className="w-8 h-8 text-[#1d4f98]" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Payées</p>
                  <p className="text-2xl font-bold text-emerald-600">{facturesPayees}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">En attente</p>
                  <p className="text-2xl font-bold text-amber-600">{facturesEnAttente}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-md">
            <CardContent className="p-4">
              <div>
                <p className="text-slate-600 text-sm">Montant total</p>
                <p className="text-2xl font-bold text-slate-900">{montantTotal.toFixed(2)} TND</p>
                <div className="mt-2 text-xs">
                  <span className="text-emerald-600">Payé: {montantPaye.toFixed(2)} TND</span>
                  <br />
                  <span className="text-amber-600">En attente: {montantEnAttente.toFixed(2)} TND</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de facture ou commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0f2543]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des factures */}
        <Card className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">
              {filteredFactures.length} facture(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">
                Chargement des factures...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : filteredFactures.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Aucune facture trouvée
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFactures.map((facture) => {
                  const StatusIcon = STATUS_ICONS[facture.statut];
                  return (
                    <div
                      key={facture.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#0f2543] hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-slate-900 font-semibold text-lg">
                              {facture.numero}
                            </h3>
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white ${STATUS_COLORS[facture.statut]}`}>
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_LABELS[facture.statut]}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Commande</p>
                              <p className="text-slate-900">{facture.commande_numero}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Véhicule</p>
                              <p className="text-slate-900">{facture.vehicule_immatriculation}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Date</p>
                              <p className="text-slate-900">
                                {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Montant</p>
                              <p className="text-slate-900 font-semibold">
                                {facture.montant_ttc.toFixed(2)} TND
                              </p>
                            </div>
                          </div>
                          {facture.date_paiement && (
                            <div className="mt-2 text-sm">
                              <span className="text-emerald-600">
                                ✓ Payée le {new Date(facture.date_paiement).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/client/invoices/${facture.id}`)}
                            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:border-[#0f2543] hover:text-[#0f2543]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadPDF(facture.id, facture.numero)}
                            className="rounded-xl bg-gradient-to-r from-[#0f2543] to-[#1d4f98] text-white hover:shadow-lg"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                          </Button>
                        </div>
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
