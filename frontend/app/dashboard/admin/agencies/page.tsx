'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { agenciesAPI, Agency, CreateAgencyData, UpdateAgencyData } from '@/lib/api/agencies';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Phone,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AgenciesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all'>('all');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAgencyData>({
    nom: '',
    ville: '',
    telephone: '',
    adresse: '',
  });

  // Redirect if not admin
  useEffect(() => {
    console.log('[AgenciesPage] User check:', { 
      isLoading, 
      user: user ? { id: user.id, role: user.role, email: user.email } : null 
    });
    
    if (!isLoading && user && !['ADMIN', 'DIRECTION'].includes(user.role)) {
      console.log('[AgenciesPage] Unauthorized - redirecting');
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  // Load agencies
  useEffect(() => {
    loadAgencies();
  }, []);

  // Filter agencies
  useEffect(() => {
    let filtered = agencies;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.ville.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAgencies(filtered);
  }, [agencies, searchQuery]);

  const loadAgencies = async () => {
    setIsFetching(true);
    setError('');
    try {
      console.log('[AgenciesPage] Loading agencies...');
      const data = await agenciesAPI.getAll();
      console.log('[AgenciesPage] Agencies loaded:', data);
      setAgencies(data);
    } catch (err: any) {
      console.error('[AgenciesPage] Error loading agencies:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors du chargement';
      setError(errorMessage);
      
      // Si erreur d'authentification, afficher un message spécifique
      if (err.response?.status === 401) {
        setError('Vous devez être connecté en tant qu\'administrateur pour accéder à cette page');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreate = async () => {
    try {
      await agenciesAPI.create(formData);
      toast.success('Agence créée avec succès');
      setIsCreateDialogOpen(false);
      resetForm();
      loadAgencies();
    } catch (err: any) {
      toast.error('Erreur', {
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedAgency) return;
    try {
      await agenciesAPI.update(selectedAgency.id, formData);
      toast.success('Agence mise à jour avec succès');
      setIsEditDialogOpen(false);
      resetForm();
      loadAgencies();
    } catch (err: any) {
      toast.error('Erreur', {
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAgency) return;
    try {
      await agenciesAPI.delete(selectedAgency.id);
      toast.success('Agence supprimée avec succès');
      setIsDeleteDialogOpen(false);
      setSelectedAgency(null);
      loadAgencies();
    } catch (err: any) {
      toast.error('Erreur', {
        description: err.response?.data?.error || err.message,
      });
    }
  };

  const openEditDialog = (agency: Agency) => {
    setSelectedAgency(agency);
    setFormData({
      nom: agency.nom,
      ville: agency.ville,
      telephone: agency.telephone || '',
      adresse: agency.adresse || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      ville: '',
      telephone: '',
      adresse: '',
    });
    setSelectedAgency(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Agences</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les agences Chery à travers la Tunisie
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Agence
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agences</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Villes Couvertes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(agencies.map((a) => a.ville)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredAgencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucune agence trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgencies.map((agency) => (
                  <TableRow key={agency.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {agency.nom}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {agency.ville}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {agency.telephone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {agency.telephone}
                          </div>
                        )}
                        {agency.adresse && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {agency.adresse}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(agency)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(agency)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle agence</DialogTitle>
          </DialogHeader>
          <AgencyForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'agence</DialogTitle>
          </DialogHeader>
          <AgencyForm formData={formData} setFormData={setFormData} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'agence</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer l'agence <strong>{selectedAgency?.nom}</strong> ?
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Agency Form Component
function AgencyForm({
  formData,
  setFormData,
}: {
  formData: CreateAgencyData;
  setFormData: React.Dispatch<React.SetStateAction<CreateAgencyData>>;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="STA Tunis"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ville">Ville *</Label>
          <Input
            id="ville"
            value={formData.ville}
            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
            placeholder="Tunis"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input
          id="telephone"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          placeholder="+216 XX XXX XXX"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adresse">Adresse</Label>
        <Input
          id="adresse"
          value={formData.adresse}
          onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          placeholder="123 Avenue Habib Bourguiba"
        />
      </div>
    </div>
  );
}
