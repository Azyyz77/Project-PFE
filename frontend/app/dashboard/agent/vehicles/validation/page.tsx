'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleValidationAPI, PendingVehicle, ValidationStats } from '@/lib/api/vehicleValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Calendar,
  Hash,
  Palette,
  Image as ImageIcon,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleValidationPage() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<PendingVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<PendingVehicle[]>([]);
  const [stats, setStats] = useState<ValidationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('EN_ATTENTE');
  
  // Modal states
  const [selectedVehicle, setSelectedVehicle] = useState<PendingVehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [rejectReason, setRejectReason] = useState('');
  const [validateComment, setValidateComment] = useState('');

  useEffect(() => {
    loadData();
  }, [token, activeTab]);

  useEffect(() => {
    filterVehicles();
  }, [searchTerm, vehicles]);

  const loadData = async () => {
    if (!token) {
      toast.error('Non authentifié', { description: 'Veuillez vous connecter' });
      return;
    }

    setIsLoading(true);
    try {
      // Load vehicles based on active tab
      let vehiclesData;
      if (activeTab === 'EN_ATTENTE') {
        vehiclesData = await vehicleValidationAPI.getPending();
      } else {
        vehiclesData = await vehicleValidationAPI.getAll({ statut: activeTab });
      }
      
      setVehicles(vehiclesData.vehicles);
      setFilteredVehicles(vehiclesData.vehicles);

      // Load stats
      const statsData = await vehicleValidationAPI.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      
      // Better error messages
      let errorMessage = 'Erreur lors du chargement des données';
      if (err.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error('Erreur', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const filterVehicles = () => {
    if (!searchTerm.trim()) {
      setFilteredVehicles(vehicles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = vehicles.filter(
      (v) =>
        v.immatriculation.toLowerCase().includes(term) ||
        v.numero_chassis.toLowerCase().includes(term) ||
        v.client_nom.toLowerCase().includes(term) ||
        v.marque.toLowerCase().includes(term) ||
        v.modele.toLowerCase().includes(term)
    );
    setFilteredVehicles(filtered);
  };

  const handleViewDetails = (vehicle: PendingVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleValidateClick = (vehicle: PendingVehicle) => {
    setSelectedVehicle(vehicle);
    setValidateComment('');
    setIsValidateModalOpen(true);
  };

  const handleRejectClick = (vehicle: PendingVehicle) => {
    setSelectedVehicle(vehicle);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleValidate = async () => {
    if (!selectedVehicle) return;

    setIsProcessing(true);
    try {
      await vehicleValidationAPI.validate(selectedVehicle.id, validateComment);
      toast.success('Véhicule validé avec succès!');
      setIsValidateModalOpen(false);
      setSelectedVehicle(null);
      setValidateComment('');
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Erreur lors de la validation' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVehicle || !rejectReason.trim()) {
      toast.error('Erreur', { description: 'La raison du refus est obligatoire' });
      return;
    }

    setIsProcessing(true);
    try {
      await vehicleValidationAPI.reject(selectedVehicle.id, rejectReason);
      toast.success('Véhicule refusé');
      setIsRejectModalOpen(false);
      setSelectedVehicle(null);
      setRejectReason('');
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Erreur lors du refus' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusMap = {
      EN_ATTENTE: {
        label: 'En attente',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
        icon: <Clock className="w-3 h-3" />,
      },
      VALIDE: {
        label: 'Validé',
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      REFUSE: {
        label: 'Refusé',
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
        icon: <XCircle className="w-3 h-3" />,
      },
    };

    const status = statusMap[statut as keyof typeof statusMap] || statusMap.EN_ATTENTE;

    return (
      <Badge className={status.className}>
        {status.icon}
        <span className="ml-1">{status.label}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Validation des Véhicules</h1>
          <p className="text-slate-600">
            Gérez les demandes de validation des véhicules clients
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <Car className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.en_attente}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Validés</p>
                    <p className="text-2xl font-bold text-green-600">{stats.valides}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Refusés</p>
                    <p className="text-2xl font-bold text-red-600">{stats.refuses}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Délai moyen</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.delai_moyen_heures ? `${Math.round(stats.delai_moyen_heures)}h` : 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par immatriculation, châssis, client, marque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="EN_ATTENTE">
              En attente ({stats?.en_attente || 0})
            </TabsTrigger>
            <TabsTrigger value="VALIDE">
              Validés ({stats?.valides || 0})
            </TabsTrigger>
            <TabsTrigger value="REFUSE">
              Refusés ({stats?.refuses || 0})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Vehicles List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Car className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun véhicule trouvé
            </h3>
            <p className="text-slate-600">
              {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun véhicule dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Vehicle Image */}
                    <div className="flex-shrink-0">
                      {vehicle.image_vehicule ? (
                        <img
                          src={vehicle.image_vehicule}
                          alt={`${vehicle.marque} ${vehicle.modele}`}
                          className="w-full lg:w-48 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full lg:w-48 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Car className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {vehicle.marque} {vehicle.modele}
                          </h3>
                          <p className="text-sm text-slate-600">{vehicle.version_nom}</p>
                        </div>
                        {getStatusBadge(vehicle.statut_validation)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Immat:</span>
                          <span className="font-semibold text-slate-900">{vehicle.immatriculation}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Châssis:</span>
                          <span className="font-mono text-xs text-slate-900">{vehicle.numero_chassis}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Année:</span>
                          <span className="font-semibold text-slate-900">{vehicle.annee}</span>
                        </div>

                        {vehicle.couleur && (
                          <div className="flex items-center gap-2 text-sm">
                            <Palette className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Couleur:</span>
                            <span className="font-semibold text-slate-900">{vehicle.couleur}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Client:</span>
                          <span className="font-semibold text-slate-900">{vehicle.client_nom}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Ajouté:</span>
                          <span className="text-slate-900">{formatDate(vehicle.date_ajout)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(vehicle)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>

                        {vehicle.statut_validation === 'EN_ATTENTE' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleValidateClick(vehicle)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Valider
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectClick(vehicle)}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Refuser
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du véhicule</DialogTitle>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Informations du véhicule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Marque</Label>
                    <p className="font-semibold">{selectedVehicle.marque}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Modèle</Label>
                    <p className="font-semibold">{selectedVehicle.modele}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Version</Label>
                    <p className="font-semibold">{selectedVehicle.version_nom}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Immatriculation</Label>
                    <p className="font-semibold">{selectedVehicle.immatriculation}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Numéro de châssis</Label>
                    <p className="font-mono text-sm">{selectedVehicle.numero_chassis}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Année</Label>
                    <p className="font-semibold">{selectedVehicle.annee}</p>
                  </div>
                  {selectedVehicle.couleur && (
                    <div>
                      <Label className="text-slate-600">Couleur</Label>
                      <p className="font-semibold">{selectedVehicle.couleur}</p>
                    </div>
                  )}
                  {selectedVehicle.motorisation && (
                    <div>
                      <Label className="text-slate-600">Motorisation</Label>
                      <p className="font-semibold">{selectedVehicle.motorisation}</p>
                    </div>
                  )}
                  {selectedVehicle.transmission && (
                    <div>
                      <Label className="text-slate-600">Transmission</Label>
                      <p className="font-semibold">{selectedVehicle.transmission}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Informations du client</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">Nom complet</Label>
                    <p className="font-semibold">{selectedVehicle.client_nom}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Email</Label>
                    <p className="font-semibold">{selectedVehicle.client_email}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Téléphone</Label>
                    <p className="font-semibold">{selectedVehicle.client_telephone}</p>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVehicle.image_vehicule ? (
                    <div>
                      <Label className="text-slate-600 mb-2 block">Photo du véhicule</Label>
                      <img
                        src={selectedVehicle.image_vehicule}
                        alt="Véhicule"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-lg p-8 flex flex-col items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Aucune photo du véhicule</p>
                    </div>
                  )}

                  {selectedVehicle.image_carte_grise ? (
                    <div>
                      <Label className="text-slate-600 mb-2 block">Carte grise</Label>
                      <img
                        src={selectedVehicle.image_carte_grise}
                        alt="Carte grise"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-lg p-8 flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">Aucune carte grise</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Validate Modal */}
      <Dialog open={isValidateModalOpen} onOpenChange={setIsValidateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le véhicule</DialogTitle>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Vous êtes sur le point de valider le véhicule{' '}
                  <strong>{selectedVehicle.immatriculation}</strong> de{' '}
                  <strong>{selectedVehicle.client_nom}</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="validateComment">Commentaire (optionnel)</Label>
                <Textarea
                  id="validateComment"
                  value={validateComment}
                  onChange={(e) => setValidateComment(e.target.value)}
                  placeholder="Ajoutez un commentaire si nécessaire..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsValidateModalOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser le véhicule</DialogTitle>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vous êtes sur le point de refuser le véhicule{' '}
                  <strong>{selectedVehicle.immatriculation}</strong> de{' '}
                  <strong>{selectedVehicle.client_nom}</strong>.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="rejectReason">Raison du refus *</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Expliquez la raison du refus..."
                  rows={4}
                  required
                />
                <p className="text-xs text-slate-600">
                  Cette raison sera communiquée au client
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectReason.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refus...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Refuser
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
