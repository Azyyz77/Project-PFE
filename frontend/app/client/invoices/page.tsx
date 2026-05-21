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

const STATUS_ICONS: Record<InvoiceStatus, any> = {
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
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
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
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors du téléchargement');
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8" />
            Mes Factures
          </h1>
          <p className="text-slate-400 mt-1">
            Consultez et téléchargez vos factures
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total factures</p>
                  <p className="text-2xl font-bold text-white">{totalFactures}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Payées</p>
                  <p className="text-2xl font-bold text-green-500">{facturesPayees}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">En attente</p>
                  <p className="text-2xl font-bold text-orange-500">{facturesEnAttente}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div>
                <p className="text-slate-400 text-sm">Montant total</p>
                <p className="text-2xl font-bold text-white">{montantTotal.toFixed(2)} TND</p>
                <div className="mt-2 text-xs">
                  <span className="text-green-500">Payé: {montantPaye.toFixed(2)} TND</span>
                  <br />
                  <span className="text-orange-500">En attente: {montantEnAttente.toFixed(2)} TND</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro de facture ou commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Liste des factures */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">
              {filteredFactures.length} facture(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-400">
                Chargement des factures...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-400">
                {error}
              </div>
            ) : filteredFactures.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Aucune facture trouvée
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFactures.map((facture) => {
                  const StatusIcon = STATUS_ICONS[facture.statut];
                  return (
                    <div
                      key={facture.id}
                      className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">
                              {facture.numero}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[facture.statut]} text-white flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {STATUS_LABELS[facture.statut]}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Commande</p>
                              <p className="text-white">{facture.commande_numero}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Véhicule</p>
                              <p className="text-white">{facture.vehicule_immatriculation}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Date</p>
                              <p className="text-white">
                                {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Montant</p>
                              <p className="text-white font-semibold">
                                {facture.montant_ttc.toFixed(2)} TND
                              </p>
                            </div>
                          </div>
                          {facture.date_paiement && (
                            <div className="mt-2 text-sm">
                              <span className="text-green-400">
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
                            className="border-slate-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadPDF(facture.id, facture.numero)}
                            className="bg-blue-600 hover:bg-blue-700"
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
