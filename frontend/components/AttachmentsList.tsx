'use client';

import React, { useState, useEffect } from 'react';
import { getAttachments, deleteAttachment, downloadAttachment, formatFileSize, getFileIcon, type Attachment } from '@/lib/api/attachments';

interface AttachmentsListProps {
  entiteType: string;
  entiteId: number;
  onAttachmentDeleted?: () => void;
  className?: string;
}

export default function AttachmentsList({
  entiteType,
  entiteId,
  onAttachmentDeleted,
  className = ''
}: AttachmentsListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Charger les pièces jointes
  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAttachments(entiteType, entiteId);
      
      if (response.success) {
        setAttachments(response.attachments);
      } else {
        setError('Erreur lors du chargement des pièces jointes');
      }
    } catch (err: any) {
      console.error('Erreur chargement pièces jointes:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une pièce jointe
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pièce jointe ?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await deleteAttachment(id);
      
      if (response.success) {
        setAttachments(prev => prev.filter(att => att.id !== id));
        onAttachmentDeleted?.();
      } else {
        setError(response.message || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  // Télécharger une pièce jointe
  const handleDownload = (id: number, filename: string) => {
    const url = downloadAttachment(id);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Charger les pièces jointes au montage
  useEffect(() => {
    if (entiteType && entiteId) {
      loadAttachments();
    }
  }, [entiteType, entiteId]);

  if (loading) {
    return (
      <div className={`attachments-list ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Chargement des pièces jointes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`attachments-list ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={loadAttachments}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className={`attachments-list ${className}`}>
        <div className="text-center p-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <p>Aucune pièce jointe</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`attachments-list ${className}`}>
      <div className="space-y-3">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
            {/* Preview ou icône */}
            <div className="flex-shrink-0">
              {attachment.isImage ? (
                <img 
                  src={downloadAttachment(attachment.id)}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded cursor-pointer"
                  onClick={() => window.open(downloadAttachment(attachment.id), '_blank')}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
                  {getFileIcon(attachment.type_mime)}
                </div>
              )}
            </div>

            {/* Informations du fichier */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.url}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatFileSize(attachment.taille_mo * 1024 * 1024)}</span>
                <span>{attachment.type_mime}</span>
                <span>{formatDate(attachment.date_upload)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Bouton télécharger */}
              <button
                onClick={() => handleDownload(attachment.id, attachment.url)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Télécharger"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* Bouton supprimer */}
              <button
                onClick={() => handleDelete(attachment.id)}
                disabled={deletingId === attachment.id}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Supprimer"
              >
                {deletingId === attachment.id ? (
                  <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{attachments.length} pièce(s) jointe(s)</span>
          <span>
            Total: {formatFileSize(
              attachments.reduce((sum, att) => sum + (att.taille_mo * 1024 * 1024), 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}