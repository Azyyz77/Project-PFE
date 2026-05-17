'use client';

import { useState, useEffect } from 'react';
import { documentsApi, Document } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, Loader2, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsApi.getAllDocuments();
      setDocuments(response || []);
    } catch (error) {
      console.error('Erreur:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce document ?')) {
      try {
        await documentsApi.deleteDocument(id);
        toast.success('Document supprimé avec succès');
        loadDocuments();
      } catch (error) {
        toast.error('Erreur lors de la suppression du document');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <FileText className="w-7 h-7 text-orange-500" />
            Gestion des Documents
          </h1>
          <p className="text-slate-500 text-xs mt-1">Consultez, téléchargez et gérez l'ensemble des fichiers joints de la plateforme.</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucun document répertorié</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Titre du fichier</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type MIME</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Créé par</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date d'ajout</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-lg">📄</span>
                      {doc.titre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">{doc.type_mime || <span className="text-slate-400 font-normal">-</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {doc.categorie || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-semibold">
                      {doc.admin_id ? `Admin #${doc.admin_id}` : <span className="text-slate-400 font-normal">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                      {doc.date_creation ? formatDate(doc.date_creation) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                            >
                              <Download className="w-4 h-4 mr-1.5" />
                              Télécharger
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
