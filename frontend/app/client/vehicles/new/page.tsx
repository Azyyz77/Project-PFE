'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Car, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getVersionCatalog } from '@/lib/api/vehicles';
import type { VersionCatalogItem } from '@/types/vehicle';

type PlateType = 'TUNIS' | 'NT';

export default function NewVehiclePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Version catalog
  const [versionCatalog, setVersionCatalog] = useState<VersionCatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  
  // Filtered lists
  const [marques, setMarques] = useState<string[]>([]);
  const [modeles, setModeles] = useState<string[]>([]);
  const [versions, setVersions] = useState<VersionCatalogItem[]>([]);

  // Plate type
  const [plateType, setPlateType] = useState<PlateType>('TUNIS');
  
  // TUNIS format: 123 تونس 456
  const [tunisPlate, setTunisPlate] = useState({ part1: '', part2: '' });
  
  // NT format: 12345 ن.ت
  const [ntPlate, setNtPlate] = useState('');

  const [form, setForm] = useState({
    numero_chassis: '',
    marque: '',
    modele: '',
    version_id: '',
    annee: '',
    couleur: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load version catalog on mount
  useEffect(() => {
    loadVersionCatalog();
  }, [token]);

  // Extract unique marques when catalog loads
  useEffect(() => {
    if (versionCatalog.length > 0) {
      const uniqueMarques = Array.from(new Set(versionCatalog.map(v => v.marque_nom))).sort();
      setMarques(uniqueMarques);
    }
  }, [versionCatalog]);

  // Filter modeles when marque changes
  useEffect(() => {
    if (form.marque) {
      const filteredModeles = Array.from(
        new Set(
          versionCatalog
            .filter(v => v.marque_nom === form.marque)
            .map(v => v.modele_nom)
        )
      ).sort();
      setModeles(filteredModeles);
      
      // Reset modele and version if marque changes
      setForm(prev => ({ ...prev, modele: '', version_id: '' }));
      setVersions([]);
    } else {
      setModeles([]);
      setVersions([]);
    }
  }, [form.marque, versionCatalog]);

  // Filter versions when modele changes
  useEffect(() => {
    if (form.marque && form.modele) {
      const filteredVersions = versionCatalog
        .filter(v => v.marque_nom === form.marque && v.modele_nom === form.modele)
        .sort((a, b) => a.version_nom.localeCompare(b.version_nom));
      setVersions(filteredVersions);
      
      // Reset version if modele changes
      setForm(prev => ({ ...prev, version_id: '' }));
    } else {
      setVersions([]);
    }
  }, [form.modele, form.marque, versionCatalog]);

  const loadVersionCatalog = async () => {
    if (!token) return;

    setIsLoadingCatalog(true);
    try {
      const data = await getVersionCatalog(token);
      setVersionCatalog(data);
    } catch (err: any) {
      console.error('Error loading catalog:', err);
      toast.error('Erreur', { description: 'Impossible de charger le catalogue de véhicules' });
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const buildImmatriculation = (): string => {
    if (plateType === 'TUNIS') {
      const { part1, part2 } = tunisPlate;
      if (!part1 || !part2) return '';
      return `${part1} تونس ${part2}`;
    } else {
      if (!ntPlate) return '';
      return `${ntPlate} ن.ت`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const immatriculation = buildImmatriculation();
    if (!immatriculation) {
      newErrors.immatriculation = 'L\'immatriculation est obligatoire';
    }

    if (!form.numero_chassis.trim()) {
      newErrors.numero_chassis = 'Le numéro de châssis est obligatoire';
    }
    if (!form.marque) {
      newErrors.marque = 'La marque est obligatoire';
    }
    if (!form.modele) {
      newErrors.modele = 'Le modèle est obligatoire';
    }
    if (!form.version_id) {
      newErrors.version_id = 'La version est obligatoire';
    }
    if (!form.annee) {
      newErrors.annee = 'L\'année est obligatoire';
    } else {
      const year = parseInt(form.annee);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        newErrors.annee = `L'année doit être entre 1900 et ${currentYear + 1}`;
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!user || !token) {
      setApiError('Vous devez être connecté pour ajouter un véhicule');
      return;
    }

    setIsSubmitting(true);

    try {
      const immatriculation = buildImmatriculation();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          immatriculation,
          numero_chassis: form.numero_chassis.trim(),
          version_id: parseInt(form.version_id),
          couleur: form.couleur.trim() || undefined,
          annee: parseInt(form.annee),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout du véhicule');
      }

      setSuccess(true);
      toast.success('Véhicule ajouté avec succès!', {
        description: 'Votre véhicule est en attente de validation par un agent SAV.',
      });

      setTimeout(() => {
        router.push('/client/vehicles');
      }, 2000);
    } catch (err: any) {
      const msg = err.message || 'Erreur lors de l\'ajout du véhicule';
      setApiError(msg);
      toast.error('Erreur', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Véhicule ajouté!</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Votre véhicule a été enregistré avec succès. Il sera validé par un agent SAV sous peu.
              </p>
              <Button onClick={() => router.push('/client/vehicles')} className="w-full">
                Voir mes véhicules
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/client/vehicles">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ajouter un véhicule</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Enregistrez votre véhicule pour le suivi</p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Informations du véhicule</CardTitle>
                <CardDescription>Remplissez tous les champs obligatoires (*)</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {apiError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plate Type Selection */}
              <div className="space-y-3">
                <Label>Type d'immatriculation *</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPlateType('TUNIS')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      plateType === 'TUNIS'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Format Tunis</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">123 تونس 456</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlateType('NT')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      plateType === 'NT'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">Format NT</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">12345 ن.ت</div>
                  </button>
                </div>
              </div>

              {/* Immatriculation Input */}
              <div className="space-y-2">
                <Label htmlFor="immatriculation">Immatriculation *</Label>
                {plateType === 'TUNIS' ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="tunis_part1"
                      value={tunisPlate.part1}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setTunisPlate(prev => ({ ...prev, part1: value }));
                        if (errors.immatriculation) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.immatriculation;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="123"
                      disabled={isSubmitting}
                      className={`flex-1 text-center ${errors.immatriculation ? 'border-red-500' : ''}`}
                    />
                    <span className="text-lg font-semibold">تونس</span>
                    <Input
                      id="tunis_part2"
                      value={tunisPlate.part2}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setTunisPlate(prev => ({ ...prev, part2: value }));
                        if (errors.immatriculation) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.immatriculation;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="456"
                      disabled={isSubmitting}
                      className={`flex-1 text-center ${errors.immatriculation ? 'border-red-500' : ''}`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      id="nt_plate"
                      value={ntPlate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                        setNtPlate(value);
                        if (errors.immatriculation) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.immatriculation;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="12345"
                      disabled={isSubmitting}
                      className={`flex-1 ${errors.immatriculation ? 'border-red-500' : ''}`}
                    />
                    <span className="text-lg font-semibold">ن.ت</span>
                  </div>
                )}
                {errors.immatriculation && (
                  <p className="text-xs text-red-600">{errors.immatriculation}</p>
                )}
                {buildImmatriculation() && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Aperçu: {buildImmatriculation()}
                  </p>
                )}
              </div>

              {/* Numéro de châssis */}
              <div className="space-y-2">
                <Label htmlFor="numero_chassis">Numéro de châssis *</Label>
                <Input
                  id="numero_chassis"
                  name="numero_chassis"
                  value={form.numero_chassis}
                  onChange={handleChange}
                  placeholder="Ex: VF1RFD00654123456"
                  disabled={isSubmitting}
                  className={errors.numero_chassis ? 'border-red-500' : ''}
                />
                {errors.numero_chassis && (
                  <p className="text-xs text-red-600">{errors.numero_chassis}</p>
                )}
              </div>

              {/* Marque */}
              <div className="space-y-2">
                <Label htmlFor="marque">Marque *</Label>
                {isLoadingCatalog ? (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-slate-600">Chargement...</span>
                  </div>
                ) : (
                  <select
                    id="marque"
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full rounded-md border ${
                      errors.marque ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    } bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Sélectionnez une marque</option>
                    {marques.map((marque) => (
                      <option key={marque} value={marque}>
                        {marque}
                      </option>
                    ))}
                  </select>
                )}
                {errors.marque && (
                  <p className="text-xs text-red-600">{errors.marque}</p>
                )}
              </div>

              {/* Modèle */}
              <div className="space-y-2">
                <Label htmlFor="modele">Modèle *</Label>
                <select
                  id="modele"
                  name="modele"
                  value={form.modele}
                  onChange={handleChange}
                  disabled={isSubmitting || !form.marque}
                  className={`w-full rounded-md border ${
                    errors.modele ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                >
                  <option value="">Sélectionnez un modèle</option>
                  {modeles.map((modele) => (
                    <option key={modele} value={modele}>
                      {modele}
                    </option>
                  ))}
                </select>
                {errors.modele && (
                  <p className="text-xs text-red-600">{errors.modele}</p>
                )}
              </div>

              {/* Version */}
              <div className="space-y-2">
                <Label htmlFor="version_id">Version *</Label>
                <select
                  id="version_id"
                  name="version_id"
                  value={form.version_id}
                  onChange={handleChange}
                  disabled={isSubmitting || !form.modele}
                  className={`w-full rounded-md border ${
                    errors.version_id ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                  } bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                >
                  <option value="">Sélectionnez une version</option>
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.version_nom}
                      {version.motorisation && ` - ${version.motorisation}`}
                      {version.transmission && ` - ${version.transmission}`}
                    </option>
                  ))}
                </select>
                {errors.version_id && (
                  <p className="text-xs text-red-600">{errors.version_id}</p>
                )}
              </div>

              {/* Année et Couleur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annee">Année *</Label>
                  <Input
                    id="annee"
                    name="annee"
                    type="number"
                    value={form.annee}
                    onChange={handleChange}
                    placeholder="Ex: 2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    disabled={isSubmitting}
                    className={errors.annee ? 'border-red-500' : ''}
                  />
                  {errors.annee && (
                    <p className="text-xs text-red-600">{errors.annee}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="couleur">Couleur</Label>
                  <Input
                    id="couleur"
                    name="couleur"
                    value={form.couleur}
                    onChange={handleChange}
                    placeholder="Ex: Blanc"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Votre véhicule sera vérifié et validé par un agent SAV avant de pouvoir prendre rendez-vous.
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Link href="/client/vehicles" className="flex-1">
                  <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Car className="mr-2 h-4 w-4" />
                      Ajouter le véhicule
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
