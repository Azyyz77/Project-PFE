'use client';

import { FormEvent, useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  createVehicle,
  deleteVehicle,
  getVehiclesByUser,
  getVersionCatalog,
  updateVehicle,
} from '@/lib/api/vehicles';
import { submitComplaint, fetchClientComplaints } from '@/lib/api/clientDashboard';
import { Vehicle, VersionCatalogItem } from '@/types/vehicle';
import { Toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car, Calendar, FileText, ChevronRight, Plus } from 'lucide-react';

// Import utilities and constants
import {
  EMPTY_VEHICLE_FORM,
  buildVehicleFormFromVehicle,
  getBrandOptions,
  getModelOptions,
  getVersionOptions,
  validateVehicleForm,
  buildImmatriculation,
  VehicleFormState,
} from '@/lib/vehicle-utils';

import {
  EMPTY_COMPLAINT_FORM,
  getComplaintStatusLabel,
  ComplaintFormState,
} from '@/lib/complaint-utils';

// Import components
import { VehicleForm } from '@/components/dashboard/VehicleForm';
import { VehicleList } from '@/components/dashboard/VehicleList';
import { ComplaintForm } from '@/components/dashboard/ComplaintForm';
import { ComplaintList } from '@/components/dashboard/ComplaintList';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [versions, setVersions] = useState<VersionCatalogItem[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  // Loading state
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);
  const [vehicleError, setVehicleError] = useState('');
  const [vehicleSuccess, setVehicleSuccess] = useState('');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);

  // Complaint form state
  const [complaintForm, setComplaintForm] = useState<ComplaintFormState>(EMPTY_COMPLAINT_FORM);
  const [complaintError, setComplaintError] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');

  // Check if user is client
  const isClient = useMemo(() => user?.role === 'CLIENT', [user]);

  // Redirect non-clients
  useEffect(() => {
    if (user && !isClient) {
      router.replace('/dashboard/agent');
    }
  }, [user, isClient, router]);

  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      if (!user || !token || !isClient) return;
      try {
        const data = await getVehiclesByUser(user.id, token);
        setVehicles(data);
      } catch (error: any) {
        setVehicleError(error.message || 'Erreur lors du chargement des véhicules');
      } finally {
        setIsLoadingVehicles(false);
      }
    };
    loadVehicles();
  }, [user, token, isClient]);

  // Load versions
  useEffect(() => {
    const loadVersions = async () => {
      if (!token || !isClient) return;
      try {
        const data = await getVersionCatalog(token);
        setVersions(data);
      } catch (error: any) {
        setVehicleError(error.message || 'Erreur lors du chargement des versions');
      } finally {
        setIsLoadingVersions(false);
      }
    };
    loadVersions();
  }, [token, isClient]);

  // Load complaints
  useEffect(() => {
    const loadComplaints = async () => {
      if (!user || !token || !isClient) return;
      try {
        const data = await fetchClientComplaints(token);
        setComplaints(data);
      } catch (error: any) {
        setComplaintError(error.message || 'Erreur lors du chargement des réclamations');
      } finally {
        setIsLoadingComplaints(false);
      }
    };
    loadComplaints();
  }, [user, token, isClient]);

  // Vehicle form handlers
  const handleVehicleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setVehicleForm((prev) => {
        if (name === 'plate_type') {
          return { ...prev, plate_type: value as any, tunis_left: '', tunis_right: '', nt_serial: '' };
        }
        if (name === 'marque_id') {
          return { ...prev, marque_id: value, modele_id: '', version_id: '' };
        }
        if (name === 'modele_id') {
          return { ...prev, modele_id: value, version_id: '' };
        }
        return { ...prev, [name]: value };
      });
    },
    []
  );

  const handleAddVehicle = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setVehicleError('');
      setVehicleSuccess('');

      if (!token) {
        setVehicleError('Session invalide');
        Toast.error('Session invalide');
        return;
      }

      const validationError = validateVehicleForm(vehicleForm);
      if (validationError) {
        setVehicleError(validationError);
        Toast.error(validationError);
        return;
      }

      setIsSubmittingVehicle(true);
      try {
        const immatriculation = buildImmatriculation(vehicleForm);
        const created = await createVehicle(
          {
            immatriculation,
            numero_chassis: vehicleForm.numero_chassis.trim(),
            version_id: Number(vehicleForm.version_id),
            couleur: vehicleForm.couleur.trim() || undefined,
            annee: Number(vehicleForm.annee),
          },
          token
        );

        setVehicles((prev) => [created, ...prev]);
        setVehicleForm(EMPTY_VEHICLE_FORM);
        setShowVehicleForm(false);
        Toast.success('Véhicule ajouté');
      } catch (error: any) {
        const msg = error.message || 'Erreur lors de la création';
        setVehicleError(msg);
        Toast.error(msg);
      } finally {
        setIsSubmittingVehicle(false);
      }
    },
    [token, vehicleForm]
  );

  const handleDeleteVehicle = useCallback(
    async (vehicleId: number) => {
      if (!token) return;
      if (!window.confirm('Êtes-vous sûr ?')) return;

      try {
        await deleteVehicle(vehicleId, token);
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        Toast.success('Véhicule supprimé');
      } catch (error: any) {
        Toast.error(error.message || 'Erreur lors de la suppression');
      }
    },
    [token]
  );

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setEditForm(buildVehicleFormFromVehicle(vehicle, versions));
  }, [versions]);

  // Complaint form handlers
  const handleComplaintInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setComplaintForm((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmitComplaint = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setComplaintError('');

      if (!token) {
        setComplaintError('Session invalide');
        Toast.error('Session invalide');
        return;
      }

      if (!complaintForm.sujet.trim() || !complaintForm.description.trim()) {
        const msg = 'Remplissez tous les champs';
        setComplaintError(msg);
        Toast.error(msg);
        return;
      }

      setIsSubmittingComplaint(true);
      try {
        const created = await submitComplaint(token, {
          sujet: complaintForm.sujet.trim(),
          description: complaintForm.description.trim(),
        });

        setComplaints((prev) => [created, ...prev]);
        setComplaintForm(EMPTY_COMPLAINT_FORM);
        Toast.success('Réclamation créée');
      } catch (error: any) {
        const msg = error.message || 'Erreur';
        setComplaintError(msg);
        Toast.error(msg);
      } finally {
        setIsSubmittingComplaint(false);
      }
    },
    [token, complaintForm]
  );

  if (!user || !isClient) return null;

  const initials = `${user.prenom.charAt(0)}${user.nom.charAt(0) || ''}`.toUpperCase();
  const modelOptions = getModelOptions(vehicleForm.marque_id, versions);
  const versionOptions = getVersionOptions(vehicleForm.marque_id, vehicleForm.modele_id, versions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
            <CardContent className="pt-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold">{initials}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Bienvenue, {user.prenom}!</h1>
                  <p className="text-blue-100 mt-1">Gérez vos véhicules et suivez vos réclamations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/rendez-vous">
            <Card className="hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Prendre un Rendez-vous</h3>
                    <p className="text-sm text-gray-500">Gérez votre SAV</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Mon Profil</h3>
                    <p className="text-sm text-gray-500">Mes informations</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{vehicles.length} Véhicules</h3>
                  <p className="text-sm text-gray-500">Ci-dessous</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vehicles */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-6 h-6 text-purple-600" />
                    <CardTitle>Mes Véhicules</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowVehicleForm(!showVehicleForm)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {showVehicleForm && (
                  <VehicleForm
                    form={vehicleForm}
                    isSubmitting={isSubmittingVehicle}
                    error={vehicleError}
                    versions={versions}
                    modelOptions={modelOptions}
                    versionOptions={versionOptions}
                    onInputChange={handleVehicleInputChange}
                    onSubmit={handleAddVehicle}
                    onCancel={() => {
                      setShowVehicleForm(false);
                      setVehicleForm(EMPTY_VEHICLE_FORM);
                    }}
                  />
                )}
                <VehicleList
                  vehicles={vehicles}
                  isLoading={isLoadingVehicles}
                  isEditing={editingVehicleId !== null}
                  editingVehicleId={editingVehicleId}
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteVehicle}
                />
              </CardContent>
            </Card>

            {/* Complaints */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <CardTitle>Réclamations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <ComplaintForm
                  form={complaintForm}
                  isSubmitting={isSubmittingComplaint}
                  error={complaintError}
                  onInputChange={handleComplaintInputChange}
                  onSubmit={handleSubmitComplaint}
                />

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Historique</h3>
                  <ComplaintList complaints={complaints} isLoading={isLoadingComplaints} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="border-b pb-3">
                <CardTitle>Mes Informations</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">ID</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{user.id}</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium">Rôle</p>
                  <Badge variant="outline" className="mt-1">Client</Badge>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{user.email}</p>
                </div>

                {user.telephone && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Téléphone</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{user.telephone}</p>
                  </div>
                )}

                <Link href="/profile" className="block pt-2 border-t">
                  <Button variant="default" className="w-full">
                    Modifier Profil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
