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
      toast.error('Veuillez sélectionner une image valide.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop lourde (max 5Mo).');
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
    if (!immatriculation) newErrors.immatriculation = 'Requis';
    if (!form.numero_chassis.trim()) newErrors.numero_chassis = 'Requis';
    if (!form.marque) newErrors.marque = 'Requis';
    if (!form.modele) newErrors.modele = 'Requis';
    if (!form.version_id) newErrors.version_id = 'Requis';
    if (!form.annee) newErrors.annee = 'Requis';
    if (!form.couleur) newErrors.couleur = 'Requis';
    if (!imageCarteGrise) newErrors.image_carte_grise = 'Requis';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!user || !token) {
      setApiError('Session expirée');
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
        throw new Error(data.error || 'Erreur lors de l\'ajout');
      }

      setSuccess(true);
      toast.success('Véhicule ajouté avec succès !');

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
          <ClientCard className="max-w-md w-full text-center p-12">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md shadow-emerald-500/20">
               <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#050505] mb-4">Véhicule Enregistré</h2>
            <p className="text-[#8A8D91] font-medium mb-8">
              Votre véhicule a été ajouté à votre garage. Un agent STA Chery vérifiera vos documents sous peu.
            </p>
            <ClientButton variant="primary" fullWidth onClick={() => router.push('/client/vehicles')}>
              Voir mon garage
            </ClientButton>
          </ClientCard>
        </motion.div>
      </ClientPageWrapper>
    );
  }

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-white shadow-md"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-400 backdrop-blur-md border border-white/10">
                <Car className="h-3.5 w-3.5" />
                Nouveau Véhicule
              </div>
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Ajoutez un <span className="text-blue-500">Moteur</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed">
              Enregistrez votre véhicule STA Chery pour accéder à l'historique complet des entretiens et réserver vos prochains rendez-vous en un clic.
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          <ClientCard className="p-10 space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-[#050505] tracking-tight">Spécifications Techniques</h2>
                  <p className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Détails de votre véhicule</p>
               </div>
            </div>

            {/* Plate Selection */}
            <div className="space-y-4">
               <label className="text-xs font-bold text-[#B0B3B8] uppercase tracking-wide">Type d'immatriculation *</label>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'TUNIS', label: 'Tunisie (123 تونس 456)', icon: Zap },
                    { id: 'NT', label: 'N.T (12345 ن.ت)', icon: ShieldCheck }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setPlateType(type.id as PlateType)}
                      className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                        plateType === type.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10' 
                          : 'border-[#E4E6EB] bg-[#F0F2F5] text-[#B0B3B8] hover:border-[#E4E6EB]'
                      }`}
                    >
                      <type.icon className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase tracking-wide">{type.label}</span>
                    </button>
                  ))}
               </div>

               <div className="p-8 rounded-lg bg-white text-white shadow-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="relative z-10">
                    {plateType === 'TUNIS' ? (
                      <div className="flex items-center justify-center gap-6">
                        <input 
                          type="text" 
                          placeholder="123"
                          value={tunisPlate.part1}
                          onChange={(e) => setTunisPlate(prev => ({ ...prev, part1: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                          className="bg-white/10 border-2 border-white/20 rounded-lg w-24 p-5 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all"
                        />
                        <span className="text-3xl font-bold opacity-40">تونس</span>
                        <input 
                          type="text" 
                          placeholder="4567"
                          value={tunisPlate.part2}
                          onChange={(e) => setTunisPlate(prev => ({ ...prev, part2: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          className="bg-white/10 border-2 border-white/20 rounded-lg w-32 p-5 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-6">
                        <input 
                          type="text" 
                          placeholder="12345"
                          value={ntPlate}
                          onChange={(e) => setNtPlate(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          className="bg-white/10 border-2 border-white/20 rounded-lg w-48 p-5 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all"
                        />
                        <span className="text-3xl font-bold opacity-40">ن.ت</span>
                      </div>
                    )}
                  </div>
                  {errors.immatriculation && <p className="text-center text-blue-400 text-[10px] font-bold mt-4 uppercase tracking-wide">Immatriculation requise</p>}
               </div>
            </div>

            {/* Technical Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Numéro de Châssis *</label>
                  <input 
                    name="numero_chassis"
                    value={form.numero_chassis}
                    onChange={handleChange}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="VF1..."
                  />
                  {errors.numero_chassis && <p className="text-blue-500 text-[10px] font-bold uppercase tracking-wide">Requis</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Année *</label>
                  <input 
                    name="annee"
                    type="number"
                    value={form.annee}
                    onChange={handleChange}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="2023"
                  />
                  {errors.annee && <p className="text-blue-500 text-[10px] font-bold uppercase tracking-wide">Requis</p>}
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Marque *</label>
                  <select 
                    name="marque"
                    value={form.marque}
                    onChange={handleChange}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Sélectionnez une marque</option>
                    {marques.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Modèle *</label>
                  <select 
                    name="modele"
                    value={form.modele}
                    onChange={handleChange}
                    disabled={!form.marque}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">Sélectionnez un modèle</option>
                    {modeles.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>

               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Version *</label>
                  <select 
                    name="version_id"
                    value={form.version_id}
                    onChange={handleChange}
                    disabled={!form.modele}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none disabled:opacity-50"
                  >
                    <option value="">Sélectionnez une version</option>
                    {versions.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.version_nom} {v.motorisation ? `(${v.motorisation})` : ''}
                      </option>
                    ))}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Couleur *</label>
                  <select 
                    name="couleur"
                    value={form.couleur}
                    onChange={handleChange}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Couleur</option>
                    {colors.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                  </select>
               </div>
            </div>
          </ClientCard>
        </div>

        {/* Sidebar: Documents & Photos */}
        <div className="space-y-8">
           <ClientCard className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-blue-600" />
                 </div>
                 <h3 className="text-xl font-bold text-[#050505] tracking-tight">Documents</h3>
              </div>

              {/* Photo Carte Grise */}
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide flex items-center justify-between">
                    Carte Grise *
                    {previewCarteGrise && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Reçue</span>}
                 </label>
                 <div className={`relative group ${errors.image_carte_grise ? 'border-blue-500' : ''}`}>
                    {previewCarteGrise ? (
                      <div className="relative rounded-lg overflow-hidden aspect-video border-2 border-emerald-100 shadow-sm">
                        <img src={previewCarteGrise} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage('carte_grise')} className="p-3 bg-blue-600 text-white rounded-full">
                              <X className="h-5 w-5" />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[#E4E6EB] bg-[#F0F2F5] hover:bg-[#E4E6EB] hover:border-blue-500/30 transition-all cursor-pointer">
                        <Plus className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Ajouter la photo</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'carte_grise')} className="hidden" />
                      </label>
                    )}
                 </div>
                 {errors.image_carte_grise && <p className="text-blue-500 text-[10px] font-bold uppercase tracking-wide text-center">La carte grise est obligatoire</p>}
              </div>

              {/* Photo Vehicule */}
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide flex items-center justify-between">
                    Photo du Véhicule
                    {previewVehicule && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Reçue</span>}
                 </label>
                 <div className="relative group">
                    {previewVehicule ? (
                      <div className="relative rounded-lg overflow-hidden aspect-video border-2 border-blue-100 shadow-sm">
                        <img src={previewVehicule} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage('vehicule')} className="p-3 bg-blue-600 text-white rounded-full">
                              <X className="h-5 w-5" />
                           </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[#E4E6EB] bg-[#F0F2F5] hover:bg-[#E4E6EB] hover:border-blue-500/30 transition-all cursor-pointer">
                        <Plus className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Ajouter la photo</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'vehicule')} className="hidden" />
                      </label>
                    )}
                 </div>
              </div>
           </ClientCard>

           <div className="p-8 rounded-lg bg-blue-50 border border-blue-100">
              <div className="flex gap-4">
                 <Info className="h-5 w-5 text-blue-600 shrink-0" />
                 <p className="text-xs font-medium text-blue-800 leading-relaxed">
                    Vos documents seront cryptés et transmis de manière sécurisée à nos agents pour validation.
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
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Véhicule'}
              </ClientButton>
              <ClientButton 
                type="button" 
                variant="outline" 
                fullWidth 
                size="large"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Annuler
              </ClientButton>
           </div>
        </div>
      </form>
    </ClientPageWrapper>
  );
}
