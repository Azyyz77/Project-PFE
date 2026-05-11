'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Plus,
  Settings,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { getVersionCatalog, getVehicleById, updateVehicle } from '@/lib/api/vehicles';
import { getAllColors, type Color } from '@/lib/api/colors';
import type { VersionCatalogItem } from '@/types/vehicle';
import { motion, AnimatePresence } from 'framer-motion';

type PlateType = 'TUNIS' | 'NT';

export default function EditVehiclePage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

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
  const [tunisPlate, setTunisPlate] = useState({ part1: '', part2: '' });
  const [ntPlate, setNtPlate] = useState('');

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
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true);

  // Load version catalog and colors on mount
  useEffect(() => {
    loadVersionCatalog();
    loadColors();
  }, [token]);

  // Load vehicle data
  useEffect(() => {
    const loadVehicle = async () => {
      if (!token || !vehicleId) return;
      
      setIsLoadingVehicle(true);
      try {
        const vehicle = await getVehicleById(parseInt(vehicleId), token);
        
        setForm({
          numero_chassis: vehicle.numero_chassis,
          marque: vehicle.marque_nom || '',
          modele: vehicle.modele_nom || '',
          version_id: vehicle.version_id.toString(),
          annee: vehicle.annee.toString(),
          couleur: vehicle.couleur || '',
        });
        
        const immat = vehicle.immatriculation;
        if (immat.includes('تونس')) {
          setPlateType('TUNIS');
          const parts = immat.split('تونس').map(p => p.trim());
          setTunisPlate({ part1: parts[0] || '', part2: parts[1] || '' });
        } else if (immat.includes('ن.ت')) {
          setPlateType('NT');
          setNtPlate(immat.replace('ن.ت', '').trim());
        }
        
        if (vehicle.image_vehicule) setPreviewVehicule(vehicle.image_vehicule);
        if (vehicle.image_carte_grise) setPreviewCarteGrise(vehicle.image_carte_grise);
        
      } catch (error: any) {
        console.error('Error loading vehicle:', error);
        toast.error('Impossible de charger le véhicule');
        router.push('/client/vehicles');
      } finally {
        setIsLoadingVehicle(false);
      }
    };
    
    loadVehicle();
  }, [token, vehicleId, router]);

  useEffect(() => {
    if (versionCatalog.length > 0) {
      const uniqueMarques = Array.from(new Set(versionCatalog.map(v => v.marque_nom))).sort();
      setMarques(uniqueMarques);
    }
  }, [versionCatalog]);

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
    }
  }, [form.marque, versionCatalog]);

  useEffect(() => {
    if (form.marque && form.modele) {
      const filteredVersions = versionCatalog
        .filter(v => v.marque_nom === form.marque && v.modele_nom === form.modele)
        .sort((a, b) => a.version_nom.localeCompare(b.version_nom));
      setVersions(filteredVersions);
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
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'vehicule' | 'carte_grise') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'vehicule') {
        setPreviewVehicule(reader.result as string);
      } else {
        setPreviewCarteGrise(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: 'vehicule' | 'carte_grise') => {
    if (type === 'vehicule') setPreviewVehicule('');
    else setPreviewCarteGrise('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    if (!user || !token) return;

    setIsSubmitting(true);

    try {
      const immatriculation = buildImmatriculation();
      const image_vehicule_base64 = previewVehicule || undefined;
      const image_carte_grise_base64 = previewCarteGrise || undefined;

      await updateVehicle(
        parseInt(vehicleId),
        {
          immatriculation,
          numero_chassis: form.numero_chassis.trim(),
          version_id: parseInt(form.version_id),
          couleur: form.couleur.trim() || undefined,
          annee: parseInt(form.annee),
          image_vehicule: image_vehicule_base64,
          image_carte_grise: image_carte_grise_base64,
        },
        token
      );

      setSuccess(true);
      toast.success('Véhicule modifié avec succès !');

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

  if (isLoadingVehicle || isLoadingCatalog) return <ClientLoadingState message="Chargement des données du véhicule..." />;

  if (success) {
    return (
      <ClientPageWrapper className="flex items-center justify-center min-h-[70vh]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ClientCard className="max-w-md w-full text-center p-12">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md shadow-blue-600/20">
               <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#050505] mb-4">Modifications Enregistrées</h2>
            <p className="text-[#8A8D91] font-medium mb-8">
              Les informations de votre véhicule ont été mises à jour avec succès.
            </p>
            <ClientButton variant="primary" fullWidth onClick={() => router.push('/client/vehicles')}>
              Retour au garage
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
                <Settings className="h-3.5 w-3.5" />
                Configuration Véhicule
              </div>
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Modifier <span className="text-blue-500">Véhicule</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed">
              Mettez à jour les informations de votre {form.marque} {form.modele}. Toute modification de document entraînera une nouvelle vérification.
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <ClientCard className="p-10 space-y-10">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <RefreshCcw className="h-6 w-6 text-blue-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-[#050505] tracking-tight">Données Actuelles</h2>
                  <p className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Ajustez vos paramètres</p>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-xs font-bold text-[#B0B3B8] uppercase tracking-wide">Type d'immatriculation *</label>
               <div className="grid grid-cols-2 gap-4">
                  {['TUNIS', 'NT'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPlateType(type as PlateType)}
                      className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                        plateType === type 
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10' 
                          : 'border-[#E4E6EB] bg-[#F0F2F5] text-[#B0B3B8]'
                      }`}
                    >
                      <Zap className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase tracking-wide">{type === 'TUNIS' ? 'Tunisie' : 'N.T'}</span>
                    </button>
                  ))}
               </div>

               <div className="p-8 rounded-lg bg-white text-white shadow-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="relative z-10 flex items-center justify-center gap-6">
                    {plateType === 'TUNIS' ? (
                      <>
                        <input value={tunisPlate.part1} onChange={(e) => setTunisPlate(p => ({ ...p, part1: e.target.value }))} className="bg-white/10 border-2 border-white/20 rounded-lg w-24 p-5 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all" />
                        <span className="text-3xl font-bold opacity-40">تونس</span>
                        <input value={tunisPlate.part2} onChange={(e) => setTunisPlate(p => ({ ...p, part2: e.target.value }))} className="bg-white/10 border-2 border-white/20 rounded-lg w-32 p-5 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all" />
                      </>
                    ) : (
                      <>
                        <input value={ntPlate} onChange={(e) => setNtPlate(e.target.value)} className="bg-white/10 border-2 border-white/20 rounded-lg w-48 p-5 text-2xl font-bold text-center focus:border-blue-500 outline-none transition-all" />
                        <span className="text-3xl font-bold opacity-40">ن.ت</span>
                      </>
                    )}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Numéro de Châssis *</label>
                  <input name="numero_chassis" value={form.numero_chassis} onChange={handleChange} className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:border-blue-500 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Année *</label>
                  <input name="annee" type="number" value={form.annee} onChange={handleChange} className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold focus:border-blue-500 outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Marque *</label>
                  <select name="marque" value={form.marque} onChange={handleChange} className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold appearance-none">
                    {marques.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Modèle *</label>
                  <select name="modele" value={form.modele} onChange={handleChange} className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold appearance-none">
                    {modeles.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Version *</label>
                  <select name="version_id" value={form.version_id} onChange={handleChange} className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold appearance-none">
                    {versions.map(v => <option key={v.id} value={v.id}>{v.version_nom}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Couleur *</label>
                  <select name="couleur" value={form.couleur} onChange={handleChange} className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-4 text-sm font-bold appearance-none">
                    {colors.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                  </select>
               </div>
            </div>
          </ClientCard>
        </div>

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
                 <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Carte Grise *</label>
                 <div className="relative group">
                    {previewCarteGrise ? (
                      <div className="relative rounded-lg overflow-hidden aspect-video border-2 border-blue-100">
                        <img src={previewCarteGrise} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage('carte_grise')} className="p-3 bg-blue-600 text-white rounded-full"><X className="h-5 w-5" /></button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[#E4E6EB] bg-[#F0F2F5] cursor-pointer"><Plus /><input type="file" onChange={(e) => handleImageChange(e, 'carte_grise')} className="hidden" /></label>
                    )}
                 </div>
              </div>

              {/* Photo Vehicule */}
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Photo du Véhicule</label>
                 <div className="relative group">
                    {previewVehicule ? (
                      <div className="relative rounded-lg overflow-hidden aspect-video border-2 border-blue-100">
                        <img src={previewVehicule} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => removeImage('vehicule')} className="p-3 bg-blue-600 text-white rounded-full"><X className="h-5 w-5" /></button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-[#E4E6EB] bg-[#F0F2F5] cursor-pointer"><Plus /><input type="file" onChange={(e) => handleImageChange(e, 'vehicule')} className="hidden" /></label>
                    )}
                 </div>
              </div>
           </ClientCard>

           <div className="space-y-4">
              <ClientButton type="submit" variant="primary" fullWidth size="large" disabled={isSubmitting}>
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
              </ClientButton>
              <ClientButton type="button" variant="outline" fullWidth size="large" onClick={() => router.back()} disabled={isSubmitting}>
                Annuler
              </ClientButton>
           </div>
        </div>
      </form>
    </ClientPageWrapper>
  );
}
