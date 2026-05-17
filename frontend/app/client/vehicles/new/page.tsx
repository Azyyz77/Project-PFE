'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ClientPageWrapper,
  ClientButton,
  ClientCard,
  ClientLoadingState,
} from '@/components/client';
import { 
  ArrowLeft, 
  Car, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ShieldCheck,
  Zap,
  Camera,
  FileText,
  ChevronRight,
  Info,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { getVersionCatalog } from '@/lib/api/vehicles';
import { getAllColors, type Color } from '@/lib/api/colors';
import type { VersionCatalogItem } from '@/types/vehicle';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [imageVehicule, setImageVehicule] = useState<File | null>(null);
  const [imageCarteGrise, setImageCarteGrise] = useState<File | null>(null);
  const [previewVehicule, setPreviewVehicule] = useState<string>('');
  const [previewCarteGrise, setPreviewCarteGrise] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load version catalog on mount
  useEffect(() => {
    loadVersionCatalog();
    loadColors();
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
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const loadColors = async () => {
    if (!token) return;
    setIsLoadingColors(true);
    try {
      const data = await getAllColors();
      setColors(data.filter(c => c.actif));
    } catch (err: any) {
      console.error('Error loading colors:', err);
    } finally {
      setIsLoadingColors(false);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'vehicule' | 'carte_grise') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('vehicles.invalidImage'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('vehicles.imageTooHeavy'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'vehicule') {
        setImageVehicule(file);
        setPreviewVehicule(reader.result as string);
      } else {
        setImageCarteGrise(file);
        setPreviewCarteGrise(reader.result as string);
      }
    };
    reader.readAsDataURL(file);

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
      setImageVehicule(null);
      setPreviewVehicule('');
    } else {
      setImageCarteGrise(null);
      setPreviewCarteGrise('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const immatriculation = buildImmatriculation();
    if (!immatriculation) newErrors.immatriculation = t('vehicles.requiredField');
    if (!form.numero_chassis.trim()) newErrors.numero_chassis = t('vehicles.requiredField');
    if (!form.marque) newErrors.marque = t('vehicles.requiredField');
    if (!form.modele) newErrors.modele = t('vehicles.requiredField');
    if (!form.version_id) newErrors.version_id = t('vehicles.requiredField');
    if (!form.annee) newErrors.annee = t('vehicles.requiredField');
    if (!form.couleur) newErrors.couleur = t('vehicles.requiredField');
    if (!imageCarteGrise) newErrors.image_carte_grise = t('vehicles.requiredField');
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(t('vehicles.fillRequired'));
      return;
    }

    if (!user || !token) {
      setApiError(t('vehicles.sessionExpired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const immatriculation = buildImmatriculation();
      const image_vehicule_base64 = previewVehicule || undefined;
      const image_carte_grise_base64 = previewCarteGrise || undefined;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/vehicles`, {
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
        throw new Error(data.error || t('vehicles.addError'));
      }

      setSuccess(true);
      toast.success(t('vehicles.addSuccess'));

      setTimeout(() => {
        router.push('/client/vehicles');
      }, 2000);
    } catch (err: any) {
      setApiError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <ClientPageWrapper className="flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ClientCard className="max-w-md w-full text-center p-12 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md shadow-emerald-500/20">
               <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">{t('vehicles.successTitle')}</h2>
            <p className="text-slate-500 font-semibold mb-8">
              {t('vehicles.successDesc')}
            </p>
            <ClientButton variant="primary" fullWidth size="large" onClick={() => router.push('/client/vehicles')} className="rounded-xl font-bold uppercase tracking-wide">
              {t('vehicles.viewGarage')}
            </ClientButton>
          </ClientCard>
        </motion.div>
      </ClientPageWrapper>
    );
  }

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 border border-slate-200/80 shadow-sm"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button 
                type="button"
                onClick={() => router.back()}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/60 shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
                <Car className="h-3.5 w-3.5" />
                {t('vehicles.newVehicle')}
              </div>
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('vehicles.addMotor')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed">
              {t('vehicles.registerDesc')}
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          <ClientCard className="p-8 sm:p-10 space-y-10 bg-white border border-slate-200/85 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">{t('vehicles.techSpecs')}</h2>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">{t('vehicles.detailsDesc')}</p>
               </div>
            </div>

            {/* Plate Selection */}
            <div className="space-y-4">
               <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('vehicles.plateType')} *</label>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'TUNIS', label: t('vehicles.tunisFormat'), icon: Zap },
                    { id: 'NT', label: t('vehicles.ntFormat'), icon: ShieldCheck }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setPlateType(type.id as PlateType)}
                      className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        plateType === type.id 
                          ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-sm' 
                          : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <type.icon className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase tracking-wide">{type.label}</span>
                    </button>
                  ))}
               </div>

               <div className="p-8 rounded-2xl bg-slate-900 text-white shadow-sm relative overflow-hidden group border border-slate-800">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="relative z-10">
                    {plateType === 'TUNIS' ? (
                      <div className="flex items-center justify-center gap-6">
                        <input 
                          type="text" 
                          placeholder="123"
                          value={tunisPlate.part1}
                          onChange={(e) => setTunisPlate(prev => ({ ...prev, part1: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                          className="bg-white/10 border-2 border-white/20 rounded-xl w-24 p-4 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all font-mono placeholder:text-white/20"
                        />
                        <span className="text-3xl font-extrabold opacity-40">تونس</span>
                        <input 
                          type="text" 
                          placeholder="4567"
                          value={tunisPlate.part2}
                          onChange={(e) => setTunisPlate(prev => ({ ...prev, part2: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          className="bg-white/10 border-2 border-white/20 rounded-xl w-32 p-4 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all font-mono placeholder:text-white/20"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-6">
                        <input 
                          type="text" 
                          placeholder="12345"
                          value={ntPlate}
                          onChange={(e) => setNtPlate(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          className="bg-white/10 border-2 border-white/20 rounded-xl w-48 p-4 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all font-mono placeholder:text-white/20"
                        />
                        <span className="text-3xl font-extrabold opacity-40">ن.ت</span>
                      </div>
                    )}
                  </div>
                  {errors.immatriculation && <p className="text-center text-red-400 text-[10px] font-bold mt-4 uppercase tracking-wide">Immatriculation requise</p>}
               </div>
            </div>

            {/* Technical Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('vehicles.chassisNumber')} *</label>
                  <input 
                    name="numero_chassis"
                    value={form.numero_chassis}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="VF1..."
                  />
                  {errors.numero_chassis && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{t('vehicles.requiredField')}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('vehicles.yearInput')} *</label>
                  <input 
                    name="annee"
                    type="number"
                    value={form.annee}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="2023"
                  />
                  {errors.annee && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{t('vehicles.requiredField')}</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Marque *</label>
                  <select 
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">{t('vehicles.selectMarque')}</option>
                    {marques.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Modèle *</label>
                  <select 
                    name="modele"
                    value={form.modele}
                    onChange={handleChange}
                    disabled={!form.marque}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">{t('vehicles.selectModele')}</option>
                    {modeles.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>

               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Version *</label>
                  <select 
                    name="version_id"
                    value={form.version_id}
                    onChange={handleChange}
                    disabled={!form.modele}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">{t('vehicles.selectVersion')}</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.version_nom} {v.motorisation ? `(${v.motorisation})` : ''}
                      </option>
                    ))}
                  </select>
               </div>

               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Couleur *</label>
                  <select 
                    name="couleur"
                    value={form.couleur}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">{t('vehicles.colorSelect')}</option>
                    {colors.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                  </select>
               </div>
            </div>
          </ClientCard>
        </div>

        {/* Sidebar: Documents & Photos */}
        <div className="space-y-8">
           <ClientCard className="p-8 space-y-8 bg-white border border-slate-200/85 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-blue-600" />
                 </div>
                 <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">{t('vehicles.documents')}</h3>
              </div>

              {/* Photo Carte Grise */}
              <div className="space-y-4">
                 <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    {t('vehicles.carteGrise')} *
                    {previewCarteGrise && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {t('vehicles.received')}</span>}
                 </label>
                 <div className={`relative group ${errors.image_carte_grise ? 'border-red-400 border-2 rounded-xl' : ''}`}>
                    {previewCarteGrise ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm">
                        <img src={previewCarteGrise} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage('carte_grise')} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg">
                              <X className="h-5 w-5" />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-500/50 transition-all cursor-pointer">
                        <Plus className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('vehicles.addPhoto')}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'carte_grise')} className="hidden" />
                      </label>
                    )}
                 </div>
                 {errors.image_carte_grise && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">{t('vehicles.photoRequired')}</p>}
              </div>

              {/* Photo Vehicule */}
              <div className="space-y-4">
                 <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    {t('vehicles.photoVehicule')}
                    {previewVehicule && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {t('vehicles.received')}</span>}
                 </label>
                 <div className="relative group">
                    {previewVehicule ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm">
                        <img src={previewVehicule} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage('vehicule')} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg">
                              <X className="h-5 w-5" />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-500/50 transition-all cursor-pointer">
                        <Plus className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t('vehicles.addPhoto')}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'vehicule')} className="hidden" />
                      </label>
                    )}
                 </div>
              </div>
           </ClientCard>

           <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex gap-4">
                 <Info className="h-5 w-5 text-blue-600 shrink-0" />
                 <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                    {t('vehicles.securityNotice')}
                 </p>
              </div>
           </div>

           <div className="space-y-4">
              <ClientButton 
                type="submit" 
                variant="primary" 
                fullWidth 
                size="large" 
                disabled={isSubmitting}
                icon={isSubmitting ? undefined : Plus}
                className="rounded-xl font-bold uppercase tracking-wide py-3.5"
              >
                {isSubmitting ? t('vehicles.saving') : t('vehicles.saveVehicle')}
              </ClientButton>
              <ClientButton 
                type="button" 
                variant="outline" 
                fullWidth 
                size="large"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="rounded-xl font-bold uppercase tracking-wide py-3.5 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              >
                {t('vehicles.cancel')}
              </ClientButton>
           </div>
        </div>
      </form>
    </ClientPageWrapper>
  );
}
