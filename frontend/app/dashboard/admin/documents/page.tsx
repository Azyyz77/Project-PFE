'use client';

import { useState, useEffect } from 'react';
import { documentsApi, Document } from '@/lib/api/documents';

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
    if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        await documentsApi.deleteDocument(id);
        loadDocuments();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Gestion des Documents</h1>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-300">Chargement...</div>
      ) : (
        <div className="bg-slate-900 rounded-lg shadow overflow-hidden border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-100">{doc.titre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{doc.type_mime || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{doc.categorie || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {doc.admin_id ? `Admin #${doc.admin_id}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                    {doc.date_creation ? formatDate(doc.date_creation) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 mr-4"
                      >
                        Télécharger
                      </a>
                    )}
                    <button onClick={() => handleDelete(doc.id)} className="text-red-400 hover:text-red-300">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
