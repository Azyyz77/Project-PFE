'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Car, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getVersionCatalog } from '@/lib/api/vehicles';
import { getAllColors, type Color } from '@/lib/api/colors';
import type { VersionCatalogItem } from '@/types/vehicle';

type PlateType = 'TUNIS' | 'NT';

export default function NewVehiclePage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Version catalog
  const [versionCatalog, setVersionCatalog] = useState<VersionCatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  
  // Colors
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoadingColors, setIsLoadingColors] = useState(true);
  
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
  
  // Field-specific error for first part
  const [part1Error, setPart1Error] = useState('');

  const [form, setForm] = useState({
    numero_chassis: '',
    marque: '',
    modele: '',
    version_id: '',
    annee: '',
    couleur: '',
  });

  // Images
  const [imageCarteGrise, setImageCarteGrise] = useState<File | null>(null);
  const [previewVehicule, setPreviewVehicule] = useState<string>('');
  const [previewCarteGrise, setPreviewCarteGrise] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // (moved) Load version catalog on mount — will be invoked after loaders are defined

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

  const loadVersionCatalog = useCallback(async () => {
    if (!token) return;

    setIsLoadingCatalog(true);
    try {
      const data = await getVersionCatalog(token);
      setVersionCatalog(data);
    } catch (err: unknown) {
      console.error('Error loading catalog:', err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t('common.error'), { description: msg || t('common.error') });
    } finally {
      setIsLoadingCatalog(false);
    }
  }, [token, t]);

  const loadColors = useCallback(async () => {
    if (!token) return;

    setIsLoadingColors(true);
    try {
      const data = await getAllColors();
      // Filtrer seulement les couleurs actives
      setColors(data.filter(c => c.actif));
    } catch (err: unknown) {
      console.error('Error loading colors:', err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t('common.error'), { description: msg || t('common.error') });
    } finally {
      setIsLoadingColors(false);
    }
  }, [t, token]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'vehicule' | 'carte_grise') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Le fichier doit être une image");
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'vehicule') {
        setPreviewVehicule(reader.result as string);
      } else {
        setImageCarteGrise(file);
        setPreviewCarteGrise(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Supprimer l'erreur si elle existe
    if (errors[`image_${type}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`image_${type}`];
        return newErrors;
      });
    }
  };

  const removeImage = (type: 'vehicule' | 'carte_grise') => {
    if (type === 'vehicule') {
      setPreviewVehicule('');
    } else {
      setImageCarteGrise(null);
      setPreviewCarteGrise('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const immatriculation = buildImmatriculation();
    if (!immatriculation) {
      newErrors.immatriculation = "L'immatriculation est obligatoire";
    } else if (plateType === 'TUNIS') {
      const { part1, part2 } = tunisPlate;
      const num1 = parseInt(part1) || 0;
      
      if (!part1 || num1 < 1 || num1 > 260) {
        newErrors.immatriculation = "Le numéro de série (bloc 1) doit être compris entre 1 et 260";
      } else if (!part2 || part2.length < 3 || part2.length > 4) {
        newErrors.immatriculation = "Le numéro d'ordre (bloc 2) doit contenir 3 ou 4 chiffres";
      }
    } else if (plateType === 'NT') {
      if (!ntPlate || ntPlate.length < 4 || ntPlate.length > 5) {
        newErrors.immatriculation = "Le numéro de plaque (NT) doit contenir 4 ou 5 chiffres";
      }
    }

    if (!form.numero_chassis.trim()) {
      newErrors.numero_chassis = "Le numéro de châssis est obligatoire";
    }
    if (!form.marque) {
      newErrors.marque = "La marque est obligatoire";
    }
    if (!form.modele) {
      newErrors.modele = "Le modèle est obligatoire";
    }
    if (!form.version_id) {
      newErrors.version_id = "La version est obligatoire";
    }
    if (!form.annee) {
      newErrors.annee = "L'année est obligatoire";
    } else {
      const year = parseInt(form.annee);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        newErrors.annee = `L'année doit être comprise entre 1900 et ${currentYear + 1}`;
      }
    }

    if (!form.couleur) {
      newErrors.couleur = "La couleur est obligatoire";
    }

    if (!imageCarteGrise) {
      newErrors.image_carte_grise = "La photo de la carte grise est obligatoire";
    }

    return newErrors;
  };

  // Load version catalog on mount (after loaders are declared)
  useEffect(() => {
    loadVersionCatalog();
    loadColors();
  }, [token, loadVersionCatalog, loadColors]);

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
      setApiError(t('common.error'));
      return;
    }

    setIsSubmitting(true);

    try {
      const immatriculation = buildImmatriculation();
      
      // Prepare image data (already in Base64 from FileReader)
      const image_vehicule_base64 = previewVehicule || undefined;
      const image_carte_grise_base64 = previewCarteGrise || undefined;

      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const API_URL = rawApiUrl.replace(/\/$/, '');
      const vehiclesEndpoint = API_URL.endsWith('/api') ? `${API_URL}/vehicles` : `${API_URL}/api/vehicles`;
      const response = await fetch(vehiclesEndpoint, {
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
          image_vehicule: image_vehicule_base64,
          image_carte_grise: image_carte_grise_base64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }

      setSuccess(true);
      toast.success(t('vehicles.vehicleAdded'), {
        description: t('vehicles.vehicleAddedSuccess'),
      });

      setTimeout(() => {
        router.push('/client/vehicles');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err) || t('common.error');
      setApiError(msg);
      toast.error(t('common.error'), { description: msg });
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('vehicles.vehicleAdded')}</h2>
              <p className="text-slate-600 dark:text-slate-400">
                {t('vehicles.vehicleAddedSuccess')}
              </p>
              <Button onClick={() => router.push('/client/vehicles')} className="w-full">
                {t('vehicles.viewMyVehicles')}
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('vehicles.addNewVehicle')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('vehicles.fillRequired')}</p>
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
                <CardTitle>{t('vehicles.vehicleInfo')}</CardTitle>
                <CardDescription>{t('vehicles.fillRequired')}</CardDescription>
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
                <Label>{t('vehicles.plateType')} *</Label>
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
                    <div className="font-semibold">{t('vehicles.tunisFormat')}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">123 تونس 4567</div>
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
                    <div className="font-semibold">{t('vehicles.ntFormat')}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">12345 ن.ت</div>
                  </button>
                </div>
              </div>

              {/* Immatriculation Input */}
              <div className="space-y-2">
                <Label htmlFor="immatriculation">{t('vehicles.registration')} *</Label>
                {plateType === 'TUNIS' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        id="tunis_part1"
                        value={tunisPlate.part1}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const numValue = parseInt(value) || 0;
                          
                          // Check if exceeds limit
                          if (numValue > 260) {
                            setPart1Error(t('vehicles.maxPlateNumber'));
                            return;
                          }
                          
                          // Clear error if valid
                          setPart1Error('');
                          
                          // Validate: must be between 1 and 260
                          if (value === '' || (numValue >= 1 && numValue <= 260)) {
                            setTunisPlate(prev => ({ ...prev, part1: value.slice(0, 3) }));
                            if (errors.immatriculation) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.immatriculation;
                                return newErrors;
                              });
                            }
                          }
                        }}
                        placeholder="123"
                        disabled={isSubmitting}
                        maxLength={3}
                        className={`text-center ${errors.immatriculation || part1Error ? 'border-red-500' : ''}`}
                      />
                      {part1Error && (
                        <p className="text-[11px] text-red-600 mt-1 text-center">{part1Error}</p>
                      )}
                    </div>
                    <span className="text-lg font-semibold">تونس</span>
                    <div className="flex-1">
                      <Input
                        id="tunis_part2"
                        value={tunisPlate.part2}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          // Allow 3 to 4 digits
                          if (value.length <= 4) {
                            setTunisPlate(prev => ({ ...prev, part2: value }));
                            if (errors.immatriculation) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.immatriculation;
                                return newErrors;
                              });
                            }
                          }
                        }}
                        placeholder="4567"
                        disabled={isSubmitting}
                        maxLength={4}
                        className={`text-center ${errors.immatriculation ? 'border-red-500' : ''}`}
                      />
                    </div>
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
                      maxLength={5}
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
                    {t('vehicles.preview')}: {buildImmatriculation()}
                  </p>
                )}
              </div>

              {/* Numéro de châssis */}
              <div className="space-y-2">
                <Label htmlFor="numero_chassis">{t('vehicles.chassisNumber')} *</Label>
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
                <Label htmlFor="marque">{t('vehicles.brand')} *</Label>
                {isLoadingCatalog ? (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-slate-600">{t('vehicles.loading')}</span>
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
                    <option value="">{t('vehicles.selectBrand')}</option>
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
                <Label htmlFor="modele">{t('vehicles.model')} *</Label>
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
                  <option value="">{t('vehicles.selectModel')}</option>
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
                <Label htmlFor="version_id">{t('vehicles.version')} *</Label>
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
                  <option value="">{t('vehicles.selectVersion')}</option>
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
                  <Label htmlFor="annee">{t('vehicles.year')} *</Label>
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
                  <Label htmlFor="couleur">{t('vehicles.color')} *</Label>
                  <select
                    id="couleur"
                    name="couleur"
                    value={form.couleur}
                    onChange={handleChange}
                    disabled={isSubmitting || isLoadingColors}
                    className={`w-full rounded-md border ${errors.couleur ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                  >
                    <option value="">
                      {isLoadingColors ? t('vehicles.loading') : t('vehicles.selectColor')}
                    </option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.nom}>
                        {color.nom}
                      </option>
                    ))}
                  </select>
                  {errors.couleur && (
                    <p className="text-xs text-red-600">{errors.couleur}</p>
                  )}
                  {colors.length === 0 && !isLoadingColors && (
                    <p className="text-xs text-gray-500">{t('common.none')}</p>
                  )}
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg">{t('vehicles.photos')}</h3>
                
                {/* Photo du véhicule (optionnel) */}
                <div className="space-y-2">
                  <Label htmlFor="image_vehicule">{t('vehicles.vehiclePhoto')}</Label>
                  <Input
                    type="file"
                    id="image_vehicule"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'vehicule')}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">{t('vehicles.imageFormat')}</p>
                  {previewVehicule && (
                    <div className="relative inline-block">
                      <Image
                        src={previewVehicule}
                        alt={t('vehicles.preview')}
                        width={320}
                        height={240}
                        unoptimized
                        className="max-w-xs max-h-48 rounded border border-slate-300 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('vehicule')}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors"
                        title={t('vehicles.removeImage')}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Photo carte grise (obligatoire) */}
                <div className="space-y-2">
                  <Label htmlFor="image_carte_grise">{t('vehicles.carteGrisePhoto')} *</Label>
                  <Input
                    type="file"
                    id="image_carte_grise"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'carte_grise')}
                    disabled={isSubmitting}
                    className={`w-full ${errors.image_carte_grise ? 'border-red-500' : ''}`}
                  />
                  <p className="text-xs text-slate-500">{t('vehicles.imageFormat')}</p>
                  {errors.image_carte_grise && (
                    <p className="text-xs text-red-600">{errors.image_carte_grise}</p>
                  )}
                  {previewCarteGrise && (
                    <div className="relative inline-block">
                      <Image
                        src={previewCarteGrise}
                        alt={t('vehicles.preview')}
                        width={320}
                        height={240}
                        unoptimized
                        className="max-w-xs max-h-48 rounded border border-slate-300 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('carte_grise')}
                        className="absolute top-2 right-2 bg-Blue-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-colors"
                        title={t('vehicles.removeImage')}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Alert */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  {t('vehicles.vehicleAddedSuccess')}
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Link href="/client/vehicles" className="flex-1">
                  <Button type="button" variant="outline" className="w-full" disabled={isSubmitting}>
                    {t('common.cancel')}
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
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Car className="mr-2 h-4 w-4" />
                      {t('vehicles.addVehicle')}
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
