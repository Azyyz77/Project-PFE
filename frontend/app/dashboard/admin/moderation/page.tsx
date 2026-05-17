'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
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
  Filter,
  ArrowLeft,
  ShieldAlert,
  Loader2
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
      setError('Un commentaire est requis pour le rejet du fichier');
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
    
    try {
      window.open(downloadUrl, '_blank');
    } catch (error) {
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
    return `${sizeInMB.toFixed(2)} Mo`;
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/admin">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl gap-2 px-3 pl-2">
              <ArrowLeft className="w-5 h-5" />
              Retour au tableau de bord
            </Button>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mt-3">
            <ShieldAlert className="w-7 h-7 text-orange-500" />
            Modération des fichiers
          </h1>
          <p className="text-slate-500 text-xs mt-1">Vérifiez, validez ou rejetez les fichiers uploadés par les clients.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => loadPendingFiles(pagination.page)}
            disabled={loading}
            className="border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Badge className="bg-orange-50 text-orange-700 border border-orange-200/50 shadow-none text-sm px-3.5 py-1.5 rounded-full font-bold">
            {pagination.total} en attente
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4 text-slate-400" />
          Filtrer par type :
        </div>
        <div className="flex gap-2">
          {[
            { key: 'ALL', label: 'Tous les fichiers' },
            { key: 'RDV', label: 'Rendez-vous' },
            { key: 'RECLAMATION', label: 'Réclamations' }
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange(key as any)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold ${
                filter === key 
                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800' 
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/50 text-rose-800">
          <XCircle className="w-4 h-4 text-rose-500" />
          <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions Alert */}
      <Alert className="rounded-2xl border-orange-200 bg-orange-50/30 text-orange-950 flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-orange-500 mt-0.5" />
        <AlertDescription className="text-xs leading-relaxed">
          <strong className="font-bold text-orange-950 block mb-0.5">Consignes de modération</strong> 
          Vérifiez scrupuleusement la lisibilité et l'authenticité de chaque fichier. Un rejet requiert obligatoirement un motif clair qui sera communiqué au client pour correction.
        </AlertDescription>
      </Alert>

      {/* Files List Container */}
      {loading ? (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
        </div>
      ) : pendingFiles.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Tout est en ordre !</h3>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'ALL' 
              ? 'Aucun fichier en attente de modération.' 
              : `Aucun fichier de type ${filter === 'RDV' ? 'Rendez-vous' : 'Réclamation'} n'attend de validation.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {pendingFiles.map((file) => (
            <div key={file.id} className="bg-white border-l-4 border-l-orange-500 border-y border-r border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-center">
                    {getFileIcon(file.type_mime)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base break-all">{file.url}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 font-medium">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {formatFileSize(file.taille_mo)}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {formatDate(file.date_upload)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file.id, file.url)}
                    className="border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold px-3 py-1.5"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Télécharger
                  </Button>
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200/50 shadow-none rounded-xl text-xs font-semibold py-1 px-2.5 gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    En attente
                  </Badge>
                </div>
              </div>

              {/* Client Info Block */}
              <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800">{file.client_nom}</span>
                  <span className="text-slate-500">({file.client_email})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-lg">
                    {file.entite_type_label}
                  </Badge>
                  <span className="font-mono text-slate-400">ID #{file.entite_id}</span>
                </div>
              </div>

              {/* Comment and Feedback Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Commentaires internes ou motif de rejet
                </label>
                <Textarea
                  value={comments[file.id] || ''}
                  onChange={(e) => setComments(prev => ({ ...prev, [file.id]: e.target.value }))}
                  placeholder="Écrivez un commentaire interne pour documenter votre décision ou spécifier le motif du rejet..."
                  className="min-h-20 bg-slate-50/30 border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl placeholder:text-slate-400 text-sm focus:outline-none"
                />
              </div>

              {/* Moderation Actions Button Block */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => handleReject(file.id)}
                  disabled={processingId === file.id}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl font-bold text-xs"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  {processingId === file.id ? 'Rejet en cours...' : 'Rejeter'}
                </Button>
                <Button
                  onClick={() => handleApprove(file.id)}
                  disabled={processingId === file.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  {processingId === file.id ? 'Approbation...' : 'Approuver'}
                </Button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs font-semibold text-slate-500">
                Page {pagination.page} sur {pagination.totalPages} ({pagination.total} fichiers en attente)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  className="border-slate-200 hover:bg-slate-50 rounded-xl text-xs"
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="border-slate-200 hover:bg-slate-50 rounded-xl text-xs"
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
