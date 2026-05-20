'use client';

import { useState, useEffect } from 'react';
import { documentsApi, Document, getDocumentDownloadUrl } from '@/lib/api/documents';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, Loader2, Download, Trash2, Plus, Upload, X, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: ''
  });

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

  const resetForm = () => {
    setFormData({ titre: '', description: '', categorie: '' });
    setSelectedFile(null);
    setEditingDocument(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const trimmedTitle = formData.titre.trim();
      const trimmedCategory = formData.categorie.trim();
      const trimmedDescription = formData.description.trim();

      if (!trimmedTitle) {
        toast.error('Veuillez saisir un titre');
        return;
      }

      if (!trimmedCategory) {
        toast.error('Veuillez saisir une catégorie');
        return;
      }

      if (editingDocument) {
        await documentsApi.updateDocument(editingDocument.id, {
          titre: trimmedTitle,
          description: trimmedDescription || null,
          categorie: trimmedCategory,
          file: selectedFile || undefined
        });
        toast.success('Document modifié avec succès');
      } else {
        if (!selectedFile) {
          toast.error('Veuillez sélectionner un fichier');
          return;
        }

        await documentsApi.uploadDocument({
          file: selectedFile,
          titre: trimmedTitle,
          description: trimmedDescription || undefined,
          categorie: trimmedCategory
        });

        toast.success('Document ajouté avec succès');
      }

      setShowModal(false);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(editingDocument ? 'Erreur lors de la modification du document' : 'Erreur lors de l\'ajout du document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (doc: Document) => {
    setEditingDocument(doc);
    setFormData({
      titre: doc.titre || '',
      description: doc.description || '',
      categorie: doc.categorie || ''
    });
    setSelectedFile(null);
    setShowModal(true);
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
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau document
        </Button>
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
                            href={getDocumentDownloadUrl(doc)}
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
                          onClick={() => openEditModal(doc)}
                          className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
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

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {editingDocument ? 'Modifier le document' : 'Ajouter un document'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Titre</label>
                <input
                  type="text"
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Procédure de garantie"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Catégorie *</label>
                <input
                  type="text"
                  required
                  value={formData.categorie}
                  onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Ex: Garantie"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl text-slate-900 text-sm focus:outline-none"
                  placeholder="Description optionnelle"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider">
                  {editingDocument ? 'Remplacer le fichier (optionnel)' : 'Fichier *'}
                </label>
                <input
                  type="file"
                  required={!editingDocument}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {selectedFile && (
                  <p className="text-xs text-slate-500">Fichier sélectionné: {selectedFile.name}</p>
                )}
                {editingDocument && !selectedFile && (
                  <p className="text-xs text-slate-500">Laissez vide pour conserver le fichier actuel.</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl font-bold"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {editingDocument ? 'Enregistrer' : 'Ajouter'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
