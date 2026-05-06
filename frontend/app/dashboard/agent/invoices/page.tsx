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
  Mail, 
  Eye,
  Filter,
  Search
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

export default function InvoicesPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [factures, setFactures] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT', 'ADMIN'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadFactures();
    }
  }, [token, statusFilter]);

  const loadFactures = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = statusFilter ? { statut: statusFilter } : undefined;
      const data = await invoicesApi.list(filters);
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

  const handleSendEmail = async (id: number) => {
    if (!confirm('Envoyer cette facture par email au client ?')) return;
    try {
      await invoicesApi.sendByEmail(id);
      alert('Facture envoyée par email avec succès!');
      await loadFactures();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'envoi');
    }
  };

  const filteredFactures = factures.filter(f => 
    f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.commande_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${f.client_prenom} ${f.client_nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Factures
            </h1>
            <p className="text-slate-400 mt-1">
              Gestion des factures clients
            </p>
          </div>
        </div>

        {/* Filtres */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, commande, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filtre statut */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="EMISE">Émise</option>
                  <option value="ENVOYEE">Envoyée</option>
                  <option value="PAYEE">Payée</option>
                  <option value="ANNULEE">Annulée</option>
                </select>
              </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-2 text-slate-400 font-medium">Numéro</th>
                      <th className="text-left py-3 px-2 text-slate-400 font-medium">Commande</th>
                      <th className="text-left py-3 px-2 text-slate-400 font-medium">Client</th>
                      <th className="text-right py-3 px-2 text-slate-400 font-medium">Montant</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">Statut</th>
                      <th className="text-center py-3 px-2 text-slate-400 font-medium">Date</th>
                      <th className="text-right py-3 px-2 text-slate-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFactures.map((facture) => (
                      <tr key={facture.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="py-3 px-2">
                          <span className="text-white font-medium">{facture.numero}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {facture.commande_numero}
                        </td>
                        <td className="py-3 px-2 text-slate-300">
                          {facture.client_prenom} {facture.client_nom}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="text-white font-semibold">
                            {facture.montant_ttc.toFixed(2)} TND
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[facture.statut]} text-white`}>
                            {STATUS_LABELS[facture.statut]}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-slate-300 text-sm">
                          {new Date(facture.date_emission).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/agent/invoices/${facture.id}`)}
                              className="border-slate-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(facture.id, facture.numero)}
                              className="border-slate-700"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {facture.statut === 'EMISE' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendEmail(facture.id)}
                                className="border-slate-700"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
