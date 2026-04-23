'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Calendar,
  MessageSquare,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import { 
  getPendingFiles, 
  approveFile, 
  rejectFile, 
  downloadFileForModeration,
  type PendingFile 
} from '@/lib/api/moderation';

export default function ModerationPage() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'RDV' | 'RECLAMATION'>('ALL');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Charger les fichiers en attente
  const loadPendingFiles = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit: pagination.limit };
      if (filter !== 'ALL') {
        params.entiteType = filter;
      }

      const response = await getPendingFiles(params);
      setPendingFiles(response.files);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setError('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  // Approuver un fichier
  const handleApprove = async (fileId: number) => {
    try {
      setProcessingId(fileId);
      setError(null);
      
      await approveFile(fileId, comments[fileId]);
      
      // Recharger la liste
      await loadPendingFiles(pagination.page);
      setComments(prev => ({ ...prev, [fileId]: '' }));
    } catch (error: any) {
      console.error('Erreur approbation:', error);
      setError(error.message || 'Erreur lors de l\'approbation');
    } finally {
      setProcessingId(null);
    }
  };

  // Rejeter un fichier
  const handleReject = async (fileId: number) => {
    if (!comments[fileId]?.trim()) {
      setError('Un commentaire est requis pour le rejet');
      return;
    }

    try {
      setProcessingId(fileId);
      setError(null);
      
      await rejectFile(fileId, comments[fileId]);
      
      // Recharger la liste
      await loadPendingFiles(pagination.page);
      setComments(prev => ({ ...prev, [fileId]: '' }));
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      setError(error.message || 'Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  // Télécharger un fichier
  const handleDownload = (fileId: number, fileName: string) => {
    const downloadUrl = downloadFileForModeration(fileId);
    
    // Try direct window.open first
    try {
      window.open(downloadUrl, '_blank');
    } catch (error) {
      // Fallback to programmatic link click
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Changer de page
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadPendingFiles(newPage);
    }
  };

  // Changer le filtre
  const handleFilterChange = (newFilter: 'ALL' | 'RDV' | 'RECLAMATION') => {
    setFilter(newFilter);
    // Recharger avec le nouveau filtre
    setTimeout(() => loadPendingFiles(1), 0);
  };

  useEffect(() => {
    loadPendingFiles();
  }, [filter]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modération des Fichiers</h1>
          <p className="text-gray-600">Vérifiez et approuvez les fichiers uploadés par les clients</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => loadPendingFiles(pagination.page)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {pagination.total} en attente
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtrer par type:</span>
        <div className="flex space-x-2">
          {[
            { key: 'ALL', label: 'Tous' },
            { key: 'RDV', label: 'Rendez-vous' },
            { key: 'RECLAMATION', label: 'Réclamations' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Alert>
        <MessageSquare className="w-4 h-4" />
        <AlertDescription>
          <strong>Instructions:</strong> Vérifiez chaque fichier pour vous assurer qu'il est approprié et conforme aux politiques. 
          Approuvez les fichiers valides ou rejetez-les avec un commentaire explicatif.
        </AlertDescription>
      </Alert>

      {/* Files List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : pendingFiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun fichier en attente
            </h3>
            <p className="text-gray-600">
              {filter === 'ALL' 
                ? 'Tous les fichiers ont été modérés' 
                : `Aucun fichier ${filter === 'RDV' ? 'de rendez-vous' : 'de réclamation'} en attente`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingFiles.map((file) => (
            <Card key={file.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon(file.type_mime)}</div>
                    <div>
                      <CardTitle className="text-lg">{file.url}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {formatFileSize(file.taille_mo)}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(file.date_upload)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file.id, file.url)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      <Clock className="w-3 h-3 mr-1" />
                      En attente
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{file.client_nom}</span>
                    <span className="text-gray-500">({file.client_email})</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <Badge variant="outline" className="mr-2">
                      {file.entite_type_label}
                    </Badge>
                    #{file.entite_id}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel pour approbation, requis pour rejet)
                  </label>
                  <Textarea
                    value={comments[file.id] || ''}
                    onChange={(e) => setComments(prev => ({ ...prev, [file.id]: e.target.value }))}
                    placeholder="Ajoutez un commentaire sur ce fichier..."
                    className="min-h-20"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(file.id)}
                    disabled={processingId === file.id}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {processingId === file.id ? 'Rejet...' : 'Rejeter'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(file.id)}
                    disabled={processingId === file.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {processingId === file.id ? 'Approbation...' : 'Approuver'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} fichiers)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}