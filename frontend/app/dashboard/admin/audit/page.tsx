'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { auditAPI, AuditLog, AuditFilters } from '@/lib/api/audit';
import { toast } from 'sonner';
import {
  Shield,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuditPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState<AuditFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && user && !['ADMIN', 'DIRECTION'].includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  // Load logs
  useEffect(() => {
    loadLogs();
  }, [filters]);

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  const loadLogs = async () => {
    setIsFetching(true);
    setError('');
    try {
      const data = await auditAPI.getLogs(filters);
      setLogs(data.logs);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('[AuditPage] Error loading logs:', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement');
    } finally {
      setIsFetching(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await auditAPI.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('[AuditPage] Error loading stats:', err);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      toast.info('Export en cours...');
      const blob = await auditAPI.exportLogs({ ...filters, format });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Export réussi');
    } catch (err: any) {
      toast.error('Erreur lors de l\'export', {
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
  };

  const openDetailDialog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      CREATE: { color: 'bg-green-600', icon: CheckCircle },
      UPDATE: { color: 'bg-blue-600', icon: Activity },
      DELETE: { color: 'bg-red-600', icon: XCircle },
    };
    const variant = variants[action] || { color: 'bg-gray-600', icon: Activity };
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {action}
      </Badge>
    );
  };

  const getStatusBadge = (statut: string) => {
    if (statut === 'SUCCESS') {
      return <Badge className="bg-green-600 text-white">Succès</Badge>;
    }
    return <Badge variant="destructive">Échec</Badge>;
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Logs d'Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Traçabilité complète des actions dans le système
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.total_logs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créations</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.total_creates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modifications</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.total_updates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suppressions</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.total_deletes}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="ml-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {showFilters ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Action</Label>
                  <select
                    value={filters.action || ''}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Toutes</option>
                    <option value="CREATE">Création</option>
                    <option value="UPDATE">Modification</option>
                    <option value="DELETE">Suppression</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Type d'entité</Label>
                  <select
                    value={filters.entite_type || ''}
                    onChange={(e) => handleFilterChange('entite_type', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="RendezVous">Rendez-vous</option>
                    <option value="Vehicule">Véhicule</option>
                    <option value="Utilisateur">Utilisateur</option>
                    <option value="Agence">Agence</option>
                    <option value="Reclamation">Réclamation</option>
                    <option value="Commande">Commande</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <select
                    value={filters.statut || ''}
                    onChange={(e) => handleFilterChange('statut', e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Tous</option>
                    <option value="SUCCESS">Succès</option>
                    <option value="FAILED">Échec</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Date début</Label>
                  <Input
                    type="date"
                    value={filters.date_debut || ''}
                    onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date fin</Label>
                  <Input
                    type="date"
                    value={filters.date_fin || ''}
                    onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={handleClearFilters} className="w-full">
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun log trouvé
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {new Date(log.date_action).toLocaleString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.utilisateur_nom}</div>
                        <div className="text-xs text-muted-foreground">{log.utilisateur_role}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.entite_type}</div>
                        {log.entite_id && (
                          <div className="text-xs text-muted-foreground">#{log.entite_id}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md truncate">{log.description}</TableCell>
                    <TableCell>{getStatusBadge(log.statut)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailDialog(log)}
                      >
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} sur {totalPages} ({total} logs au total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', page - 1)}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => handleFilterChange('page', page + 1)}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du Log d'Audit</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <div className="font-medium">
                    {new Date(selectedLog.date_action).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Utilisateur</Label>
                  <div className="font-medium">
                    {selectedLog.utilisateur_nom} ({selectedLog.utilisateur_role})
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <div>{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div>{getStatusBadge(selectedLog.statut)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type d'entité</Label>
                  <div className="font-medium">{selectedLog.entite_type}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID Entité</Label>
                  <div className="font-medium">{selectedLog.entite_id || 'N/A'}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP</Label>
                  <div className="font-mono text-sm">{selectedLog.ip_address}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Endpoint</Label>
                  <div className="font-mono text-sm">{selectedLog.endpoint}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <div className="mt-1 p-3 bg-muted rounded-md">{selectedLog.description}</div>
              </div>

              {selectedLog.ancien_valeur && (
                <div>
                  <Label className="text-muted-foreground">Anciennes valeurs</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.ancien_valeur, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.nouveau_valeur && (
                <div>
                  <Label className="text-muted-foreground">Nouvelles valeurs</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.nouveau_valeur, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.erreur_message && (
                <div>
                  <Label className="text-muted-foreground text-red-600">Message d'erreur</Label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                    {selectedLog.erreur_message}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">User Agent</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-xs break-all">
                  {selectedLog.user_agent}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
