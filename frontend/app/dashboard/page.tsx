'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
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
import { Vehicle, VersionCatalogItem } from '@/types/vehicle';

type PlateType = '' | 'TUNIS' | 'NT' | 'RS';

type VehicleFormState = {
  plate_type: PlateType;
  tunis_left: string;
  tunis_right: string;
  nt_serial: string;
  numero_chassis: string;
  marque_id: string;
  modele_id: string;
  version_id: string;
  couleur: string;
  annee: string;
};

const EMPTY_VEHICLE_FORM: VehicleFormState = {
  plate_type: '',
  tunis_left: '',
  tunis_right: '',
  nt_serial: '',
  numero_chassis: '',
  marque_id: '',
  modele_id: '',
  version_id: '',
  couleur: '',
  annee: '',
};

const VEHICLE_FIELD_LIMITS = {
  immatriculation: 20,
  tunisPart: 3,
  ntSerial: 5,
  numeroChassis: 17,
  couleur: 50,
};

const TUNIS_PLATE_LABEL = 'تونس';
const NT_PLATE_LABEL = 'ن.ت';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [versions, setVersions] = useState<VersionCatalogItem[]>([]);

  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);

  const [vehicleError, setVehicleError] = useState('');
  const [vehicleSuccess, setVehicleSuccess] = useState('');

  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);

  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);

  // Only CLIENT role can manage their own vehicles
  const isClient = useMemo(() => {
    if (!user) return false;
    return user.type_utilisateur === 'CLIENT';
  }, [user]);

  const isStaff = useMemo(() => {
    if (!user) return false;
    return ['ADMIN', 'AGENT', 'DIRECTION'].includes(user.type_utilisateur);
  }, [user]);

  useEffect(() => {
    if (user && isStaff) {
      router.replace('/dashboard/agent');
    }
  }, [user, isStaff, router]);

  useEffect(() => {
    const loadVehicles = async () => {
      if (!user || !token || !isClient) return;

      setIsLoadingVehicles(true);
      setVehicleError('');

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

  useEffect(() => {
    const loadVersions = async () => {
      if (!token || !isClient) return;

      setIsLoadingVersions(true);
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

  if (!user) return null;
  if (isStaff) return null;

  const firstName = user.prenom || 'Utilisateur';
  const lastName = user.nom || '';
  const displayRole = user.type_utilisateur || 'CLIENT';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ''}`.toUpperCase();

  const getRoleBadgeColor = (role: string) => {
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'DIRECTION':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'CLIENT':
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    const normalizedRole = role.toUpperCase();
    switch (normalizedRole) {
      case 'ADMIN':
        return 'Administrateur';
      case 'AGENT':
        return 'Agent SAV';
      case 'DIRECTION':
        return 'Direction';
      case 'CLIENT':
        return 'Client';
      default:
        return 'Utilisateur';
    }
  };

  const buildVehicleFormFromVehicle = (vehicle: Vehicle): VehicleFormState => {
    const selectedVersion = versions.find((version) => version.id === vehicle.version_id);
    const parsedPlate = parseImmatriculation(vehicle.immatriculation);

    return {
      plate_type: parsedPlate.plate_type,
      tunis_left: parsedPlate.tunis_left,
      tunis_right: parsedPlate.tunis_right,
      nt_serial: parsedPlate.nt_serial,
      numero_chassis: vehicle.numero_chassis,
      marque_id: selectedVersion ? String(selectedVersion.marque_id) : '',
      modele_id: selectedVersion ? String(selectedVersion.modele_id) : '',
      version_id: String(vehicle.version_id),
      couleur: vehicle.couleur || '',
      annee: String(vehicle.annee),
    };
  };

  const brandOptions = useMemo(() => {
    const uniqueBrands = new Map<number, string>();

    versions.forEach((version) => {
      if (!uniqueBrands.has(version.marque_id)) {
        uniqueBrands.set(version.marque_id, version.marque_nom);
      }
    });

    return Array.from(uniqueBrands.entries()).map(([id, nom]) => ({ id: String(id), nom }));
  }, [versions]);

  const getModelOptions = (marqueId: string) => {
    if (!marqueId) return [];

    const uniqueModels = new Map<number, string>();

    versions
      .filter((version) => String(version.marque_id) === marqueId)
      .forEach((version) => {
        if (!uniqueModels.has(version.modele_id)) {
          uniqueModels.set(version.modele_id, version.modele_nom);
        }
      });

    return Array.from(uniqueModels.entries()).map(([id, nom]) => ({ id: String(id), nom }));
  };

  const getVersionOptions = (marqueId: string, modeleId: string) => {
    if (!marqueId || !modeleId) return [];

    return versions.filter(
      (version) => String(version.marque_id) === marqueId && String(version.modele_id) === modeleId
    );
  };

  const parseImmatriculation = (immatriculation: string): VehicleFormState => {
    const tunisMatch = immatriculation.match(/^(\d{1,3})\s*تونس\s*(\d{1,3})$/u);
    if (tunisMatch) {
      return {
        ...EMPTY_VEHICLE_FORM,
        plate_type: 'TUNIS',
        tunis_left: tunisMatch[1],
        tunis_right: tunisMatch[2],
      };
    }

    const ntMatch = immatriculation.match(/^(\d{1,5})\s*ن\.ت$/u);
    if (ntMatch) {
      return {
        ...EMPTY_VEHICLE_FORM,
        plate_type: 'NT',
        nt_serial: ntMatch[1],
      };
    }

    return {
      ...EMPTY_VEHICLE_FORM,
      plate_type: 'TUNIS',
    };
  };

  const buildImmatriculation = (form: VehicleFormState) => {
    if (form.plate_type === 'TUNIS') {
      return `${form.tunis_left.trim()} ${TUNIS_PLATE_LABEL} ${form.tunis_right.trim()}`;
    }

    if (form.plate_type === 'NT') {
      return `${form.nt_serial.trim()} ${NT_PLATE_LABEL}`;
    }

    return '';
  };

  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setVehicleForm((prev) => {
      if (name === 'plate_type') {
        return {
          ...prev,
          plate_type: value as PlateType,
          tunis_left: '',
          tunis_right: '',
          nt_serial: '',
        };
      }

      if (name === 'marque_id') {
        return {
          ...prev,
          marque_id: value,
          modele_id: '',
          version_id: '',
        };
      }

      if (name === 'modele_id') {
        return {
          ...prev,
          modele_id: value,
          version_id: '',
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setEditForm((prev) => {
      if (name === 'plate_type') {
        return {
          ...prev,
          plate_type: value as PlateType,
          tunis_left: '',
          tunis_right: '',
          nt_serial: '',
        };
      }

      if (name === 'marque_id') {
        return {
          ...prev,
          marque_id: value,
          modele_id: '',
          version_id: '',
        };
      }

      if (name === 'modele_id') {
        return {
          ...prev,
          modele_id: value,
          version_id: '',
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const validateVehicleForm = (form: VehicleFormState) => {
    if (!form.plate_type || !form.numero_chassis || !form.version_id || !form.annee) {
      return 'Tous les champs obligatoires du véhicule doivent être remplis.';
    }

    if (form.plate_type === 'TUNIS') {
      if (!form.tunis_left.trim() || !form.tunis_right.trim()) {
        return 'Veuillez compléter les deux parties de la plaque tunisienne.';
      }

      if (!/^\d{1,3}$/.test(form.tunis_left.trim()) || !/^\d{1,3}$/.test(form.tunis_right.trim())) {
        return 'Le type Tunisie exige deux blocs numériques de 1 à 3 chiffres.';
      }
    }

    if (form.plate_type === 'NT') {
      if (!form.nt_serial.trim()) {
        return 'Veuillez compléter le numéro du type ن.ت.';
      }

      if (!/^\d{1,5}$/.test(form.nt_serial.trim())) {
        return 'Le type ن.ت exige un bloc numérique de 1 à 5 chiffres.';
      }
    }

    const builtImmatriculation = buildImmatriculation(form);
    if (!builtImmatriculation || builtImmatriculation.length > VEHICLE_FIELD_LIMITS.immatriculation) {
      return `L'immatriculation ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.immatriculation} caractères.`;
    }

    if (form.numero_chassis.trim().length > VEHICLE_FIELD_LIMITS.numeroChassis) {
      return `Le numéro de châssis ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.numeroChassis} caractères.`;
    }

    if (form.couleur.trim().length > VEHICLE_FIELD_LIMITS.couleur) {
      return `La couleur ne doit pas dépasser ${VEHICLE_FIELD_LIMITS.couleur} caractères.`;
    }

    const versionId = Number(form.version_id);
    const annee = Number(form.annee);

    if (Number.isNaN(versionId) || versionId <= 0) {
      return 'version_id doit être un nombre positif.';
    }

    if (Number.isNaN(annee) || annee < 1950 || annee > 2100) {
      return 'Année invalide (1950-2100).';
    }

    return null;
  };

  const handleAddVehicle = async (e: FormEvent) => {
    e.preventDefault();
    setVehicleError('');
    setVehicleSuccess('');

    if (!token) {
      setVehicleError('Session invalide, veuillez vous reconnecter.');
      return;
    }

    const validationError = validateVehicleForm(vehicleForm);
    if (validationError) {
      setVehicleError(validationError);
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
      setVehicleSuccess('Véhicule ajouté avec succès.');
    } catch (error: any) {
      setVehicleError(error.message || 'Erreur lors de la création du véhicule');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const startEditVehicle = (vehicle: Vehicle) => {
    setVehicleError('');
    setVehicleSuccess('');
    setEditingVehicleId(vehicle.id);
    setEditForm(buildVehicleFormFromVehicle(vehicle));
  };

  const cancelEditVehicle = () => {
    setEditingVehicleId(null);
    setEditForm(EMPTY_VEHICLE_FORM);
  };

  const submitEditVehicle = async (e: FormEvent, vehicleId: number) => {
    e.preventDefault();
    setVehicleError('');
    setVehicleSuccess('');

    if (!token) {
      setVehicleError('Session invalide, veuillez vous reconnecter.');
      return;
    }

    const validationError = validateVehicleForm(editForm);
    if (validationError) {
      setVehicleError(validationError);
      return;
    }

    try {
      const immatriculation = buildImmatriculation(editForm);

      const updated = await updateVehicle(
        vehicleId,
        {
          immatriculation,
          numero_chassis: editForm.numero_chassis.trim(),
          version_id: Number(editForm.version_id),
          couleur: editForm.couleur.trim() || undefined,
          annee: Number(editForm.annee),
        },
        token
      );

      setVehicles((prev) => prev.map((v) => (v.id === vehicleId ? updated : v)));
      setVehicleSuccess('Véhicule mis à jour avec succès.');
      cancelEditVehicle();
    } catch (error: any) {
      setVehicleError(error.message || 'Erreur lors de la mise à jour du véhicule');
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    setVehicleError('');
    setVehicleSuccess('');

    if (!token) {
      setVehicleError('Session invalide, veuillez vous reconnecter.');
      return;
    }

    if (!window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      return;
    }

    try {
      await deleteVehicle(vehicleId, token);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setVehicleSuccess('Véhicule supprimé avec succès.');
      if (editingVehicleId === vehicleId) {
        cancelEditVehicle();
      }
    } catch (error: any) {
      setVehicleError(error.message || 'Erreur lors de la suppression du véhicule');
    }
  };

  const vehicleModelOptions = getModelOptions(vehicleForm.marque_id);
  const vehicleVersionOptions = getVersionOptions(vehicleForm.marque_id, vehicleForm.modele_id);
  const editModelOptions = getModelOptions(editForm.marque_id);
  const editVersionOptions = getVersionOptions(editForm.marque_id, editForm.modele_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tableau de bord</h1>
          <div className="flex items-center gap-3">
            <a
              href="/profile"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none transition-colors"
            >
              Mon profil
            </a>
            <button
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <section className="rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
              {initials}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Bienvenue, {firstName} {lastName}!
              </h2>
              <p className="text-gray-600">
                Vous êtes connecté(e) en tant que {getRoleLabel(displayRole)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Rendez-vous SAV</h3>
          <p className="text-sm text-gray-600 mb-4">
            Gérez vos prises de rendez-vous et consultez votre historique.
          </p>
          <Link
            href="/dashboard/rendez-vous"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Ouvrir la page Rendez-vous
          </Link>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Informations du compte</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
              <p className="text-lg text-gray-900">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getRoleBadgeColor(displayRole)}`}
              >
                {getRoleLabel(displayRole)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
              <p className="text-lg text-gray-900">{firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
              <p className="text-lg text-gray-900">{lastName || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
              <p className="text-lg text-gray-900">{user.telephone || '-'}</p>
            </div>
          </div>
        </section>

        {/* Vehicle Management Section - Only for CLIENT users */}
        {isClient && (
          <>
            <section className="rounded-xl bg-white p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter un véhicule</h3>

              {vehicleError && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{vehicleError}</p>}
              {vehicleSuccess && <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{vehicleSuccess}</p>}

              <form onSubmit={handleAddVehicle} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select
                  name="plate_type"
                  value={vehicleForm.plate_type}
                  onChange={handleVehicleInputChange}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Choisir le type d'immatriculation</option>
                  <option value="TUNIS">Type Tunisie: 123 تونس 456</option>
                  <option value="NT">Type ن.ت: 12345 ن.ت</option>
                    </select>
                {vehicleForm.plate_type === 'TUNIS' ? (
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                    <input
                      type="text"
                      name="tunis_left"
                      placeholder="123"
                      value={vehicleForm.tunis_left}
                      onChange={handleVehicleInputChange}
                      maxLength={VEHICLE_FIELD_LIMITS.tunisPart}
                      inputMode="numeric"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                    <div className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                      {TUNIS_PLATE_LABEL}
                    </div>
                    <input
                      type="text"
                      name="tunis_right"
                      placeholder="456"
                      value={vehicleForm.tunis_right}
                      onChange={handleVehicleInputChange}
                      maxLength={VEHICLE_FIELD_LIMITS.tunisPart}
                      inputMode="numeric"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                ) : vehicleForm.plate_type === 'NT' ? (
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      name="nt_serial"
                      placeholder="12345"
                      value={vehicleForm.nt_serial}
                      onChange={handleVehicleInputChange}
                      maxLength={VEHICLE_FIELD_LIMITS.ntSerial}
                      inputMode="numeric"
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                    <div className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                      {NT_PLATE_LABEL}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
                    Sélectionnez d'abord un type d'immatriculation.
                  </div>
                )}
                <input
                  type="text"
                  name="numero_chassis"
                  placeholder="Numéro de châssis"
                  value={vehicleForm.numero_chassis}
                  onChange={handleVehicleInputChange}
                  maxLength={VEHICLE_FIELD_LIMITS.numeroChassis}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
                <select
                  name="marque_id"
                  value={vehicleForm.marque_id}
                  onChange={handleVehicleInputChange}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  required
                >
                  <option value="">Sélectionner une marque</option>
                  {brandOptions.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.nom}
                    </option>
                  ))}
                </select>
                <select
                  name="modele_id"
                  value={vehicleForm.modele_id}
                  onChange={handleVehicleInputChange}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  required
                  disabled={!vehicleForm.marque_id}
                >
                  <option value="">Sélectionner un modèle</option>
                  {vehicleModelOptions.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.nom}
                    </option>
                  ))}
                </select>
                <select
                  name="version_id"
                  value={vehicleForm.version_id}
                  onChange={handleVehicleInputChange}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  required
                  disabled={!vehicleForm.modele_id}
                >
                  <option value="">Sélectionner une version</option>
                  {vehicleVersionOptions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.version_nom}
                      {version.motorisation ? ` - ${version.motorisation}` : ''}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="annee"
                  placeholder="Année"
                  value={vehicleForm.annee}
                  onChange={handleVehicleInputChange}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="couleur"
                  placeholder="Couleur (optionnel)"
                  value={vehicleForm.couleur}
                  onChange={handleVehicleInputChange}
                  maxLength={VEHICLE_FIELD_LIMITS.couleur}
                  className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2"
                />
                <button
                  type="submit"
                  disabled={isSubmittingVehicle}
                  className="sm:col-span-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmittingVehicle ? 'Ajout en cours...' : 'Ajouter le véhicule'}
                </button>
              </form>
            </section>

        <section className="rounded-xl bg-white p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Mes véhicules</h3>
          {isLoadingVehicles ? (
            <p className="text-gray-600">Chargement des véhicules...</p>
          ) : vehicles.length === 0 ? (
            <p className="text-gray-600">Aucun véhicule trouvé.</p>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{vehicle.immatriculation}</p>
                      <p className="text-sm text-gray-700">Châssis: {vehicle.numero_chassis}</p>
                      <p className="text-sm text-gray-700">
                        {vehicle.marque_nom || '-'} / {vehicle.modele_nom || '-'} / {vehicle.version_nom || '-'}
                      </p>
                      <p className="text-sm text-gray-700">
                        Année: {vehicle.annee} {vehicle.couleur ? `- Couleur: ${vehicle.couleur}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEditVehicle(vehicle)}
                        className="rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {editingVehicleId === vehicle.id && (
                    <form
                      onSubmit={(e) => submitEditVehicle(e, vehicle.id)}
                      className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-2"
                    >
                      <select
                        name="plate_type"
                        value={editForm.plate_type}
                        onChange={handleEditInputChange}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        required
                      >
                        <option value="">Choisir le type d'immatriculation</option>
                        <option value="TUNIS">Type Tunisie: 123 تونس 456</option>
                        <option value="NT">Type ن.ت: 12345 ن.ت</option>
                      </select>
                      {editForm.plate_type === 'TUNIS' ? (
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                          <input
                            type="text"
                            name="tunis_left"
                            placeholder="123"
                            value={editForm.tunis_left}
                            onChange={handleEditInputChange}
                            maxLength={VEHICLE_FIELD_LIMITS.tunisPart}
                            inputMode="numeric"
                            className="rounded-lg border border-gray-300 px-3 py-2"
                            required
                          />
                          <div className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                            {TUNIS_PLATE_LABEL}
                          </div>
                          <input
                            type="text"
                            name="tunis_right"
                            placeholder="456"
                            value={editForm.tunis_right}
                            onChange={handleEditInputChange}
                            maxLength={VEHICLE_FIELD_LIMITS.tunisPart}
                            inputMode="numeric"
                            className="rounded-lg border border-gray-300 px-3 py-2"
                            required
                          />
                        </div>
                      ) : editForm.plate_type === 'NT' ? (
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <input
                            type="text"
                            name="nt_serial"
                            placeholder="12345"
                            value={editForm.nt_serial}
                            onChange={handleEditInputChange}
                            maxLength={VEHICLE_FIELD_LIMITS.ntSerial}
                            inputMode="numeric"
                            className="rounded-lg border border-gray-300 px-3 py-2"
                            required
                          />
                          <div className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">
                            {NT_PLATE_LABEL}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500">
                          Sélectionnez d'abord un type d'immatriculation.
                        </div>
                      )}
                      <input
                        type="text"
                        name="numero_chassis"
                        value={editForm.numero_chassis}
                        onChange={handleEditInputChange}
                        maxLength={VEHICLE_FIELD_LIMITS.numeroChassis}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        required
                      />
                      <select
                        name="marque_id"
                        value={editForm.marque_id}
                        onChange={handleEditInputChange}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        required
                      >
                        <option value="">Sélectionner une marque</option>
                        {brandOptions.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.nom}
                          </option>
                        ))}
                      </select>
                      <select
                        name="modele_id"
                        value={editForm.modele_id}
                        onChange={handleEditInputChange}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        required
                        disabled={!editForm.marque_id}
                      >
                        <option value="">Sélectionner un modèle</option>
                        {editModelOptions.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.nom}
                          </option>
                        ))}
                      </select>
                      <select
                        name="version_id"
                        value={editForm.version_id}
                        onChange={handleEditInputChange}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        required
                        disabled={!editForm.modele_id}
                      >
                        <option value="">Sélectionner une version</option>
                        {editVersionOptions.map((version) => (
                          <option key={version.id} value={version.id}>
                            {version.version_nom}
                            {version.motorisation ? ` - ${version.motorisation}` : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="annee"
                        value={editForm.annee}
                        onChange={handleEditInputChange}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        name="couleur"
                        value={editForm.couleur}
                        onChange={handleEditInputChange}
                        maxLength={VEHICLE_FIELD_LIMITS.couleur}
                        className="rounded-lg border border-gray-300 px-3 py-2 sm:col-span-2"
                        placeholder="Couleur"
                      />
                      <div className="sm:col-span-2 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditVehicle}
                          className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-400"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
            </section>
          </>
        )}

        {/* Staff Dashboard - For ADMIN, AGENT, DIRECTION */}
        {isStaff && (
          <section className="rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Centre de Gestion</h3>
            <p className="text-gray-600">
              Vous êtes connecté(e) en tant que {getRoleLabel(displayRole)}. Votre tableau de bord personnalisé sera disponible bientôt.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
