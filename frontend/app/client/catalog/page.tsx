'use client';

import { useEffect, useState, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getInterventionTypes,
  getSubTypes,
  getPackages,
  getPackageDetails,
  getCatalogStats,
  InterventionType,
  SubType,
  Package,
  PackageDetails,
  CatalogStats
} from '@/lib/api/interventionCatalog';
import {
  ClientPageWrapper,
  ClientCard,
  ClientCardHeader,
  ClientCardContent,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Wrench, 
  Package as PackageIcon, 
  Clock, 
  CheckCircle,
  Search,
  Tag,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function CatalogContent() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);

  const loadCatalog = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [typesData, subTypesData, packagesData, statsData] = await Promise.all([
        getInterventionTypes(token),
        getSubTypes(token),
        getPackages(token),
        getCatalogStats(token)
      ]);
      
      setTypes(typesData);
      setSubTypes(subTypesData);
      setPackages(packagesData.filter(pkg => pkg.actif));
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger le catalogue' });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadCatalog();
    }
  }, [token, loadCatalog]);

  const openPackageDetails = async (packageId: number) => {
    if (!token) return;
    
    try {
      const details = await getPackageDetails(token, packageId);
      setSelectedPackage(details);
      setPackageModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les détails du package' });
    }
  };

  const filteredTypes = types.filter(type =>
    type.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubTypes = subTypes.filter(subType =>
    subType.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subType.type_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPackages = packages.filter(pkg =>
    pkg.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <ClientLoadingState message={t('catalog.loading') || 'Chargement du catalogue...'} />;
  }

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              {t('catalog.discoverServices')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-5xl font-black tracking-tight leading-none">
              Catalogue <span className="text-red-500">Services</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Explorez notre gamme complète de services d'entretien et de forfaits exclusifs pour votre véhicule.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t('catalog.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all focus:bg-white/10 focus:ring-4 focus:ring-red-500/10"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ─── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ClientStatCard
            label={t('catalog.serviceTypes')}
            value={stats.total_types}
            icon={Wrench}
            iconColor="text-red-600"
          />
          <ClientStatCard
            label={t('catalog.servicesAvailable')}
            value={stats.total_sous_types}
            icon={CheckCircle}
            iconColor="text-blue-600"
          />
          <ClientStatCard
            label={t('catalog.packagesAvailable')}
            value={stats.total_packages_actifs}
            icon={PackageIcon}
            iconColor="text-amber-500"
          />
          <ClientStatCard
            label={t('catalog.averageDuration')}
            value={`${Math.round(stats.duree_moyenne)} min`}
            icon={Clock}
            iconColor="text-emerald-500"
          />
        </div>
      )}

      {/* ─── Catalog Tabs ─── */}
      <Tabs defaultValue="packages" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="h-auto p-1.5 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <TabsTrigger value="packages" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold transition-all uppercase tracking-widest text-[10px]">
              {t('catalog.packages')}
            </TabsTrigger>
            <TabsTrigger value="types" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold transition-all uppercase tracking-widest text-[10px]">
              {t('catalog.serviceTypes')}
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-2xl px-8 py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold transition-all uppercase tracking-widest text-[10px]">
              {t('catalog.allServices')}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPackages.length === 0 ? (
              <div className="col-span-full">
                <ClientEmptyState
                  icon={PackageIcon}
                  title={t('catalog.noPackagesFound')}
                  description="Essayez de modifier vos critères de recherche."
                />
              </div>
            ) : (
              filteredPackages.map((pkg, idx) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ClientCard className="group h-full overflow-hidden border-none shadow-xl shadow-slate-200/50">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <PackageIcon className="h-32 w-32 -mr-10 -mt-10 rotate-12" />
                    </div>
                    
                    <div className="flex flex-col h-full relative z-10">
                      <div className="mb-6 flex items-start justify-between">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-inner">
                          <PackageIcon className="h-8 w-8" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Prix Forfaitaire</p>
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-4xl font-black text-slate-800 tracking-tighter">{pkg.prix.toFixed(3)}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase">TND</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{pkg.nom}</h3>
                          <p className="text-slate-500 font-medium leading-relaxed">{pkg.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider">
                              <Wrench className="h-3.5 w-3.5" />
                              {pkg.nombre_interventions} Services
                           </span>
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                              <Tag className="h-3.5 w-3.5" />
                              Offre Spéciale
                           </span>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                         <div className="text-slate-400 text-xs font-bold">
                            TVA Incluse
                         </div>
                         <ClientButton 
                           variant="primary" 
                           onClick={() => openPackageDetails(pkg.id)}
                           icon={ArrowRight}
                           iconPosition="right"
                         >
                           {t('catalog.viewDetails')}
                         </ClientButton>
                      </div>
                    </div>
                  </ClientCard>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map((type, idx) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ClientCard hover className="h-full border-slate-100/50">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       {type.nombre_sous_types} Services
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{type.nom}</h3>
                  
                  <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {type.delai_moyen} Min
                    </span>
                  </div>
                </ClientCard>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <ClientCard className="p-2 overflow-hidden border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="divide-y divide-slate-50">
              {filteredSubTypes.map((subType, idx) => (
                <motion.div
                  key={subType.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">{subType.nom}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subType.type_nom}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5" />
                      {subType.duree_estimee} min
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          </ClientCard>
        </TabsContent>
      </Tabs>

      {/* ─── Package Details Modal ─── */}
      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          {selectedPackage && (
            <div className="relative">
               {/* Modal Header */}
               <div className="bg-[#0b1221] p-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-red-600/20 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <PackageIcon className="h-8 w-8 text-red-500" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Détails du Forfait</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">{selectedPackage.package.nom}</h2>
                    <p className="text-slate-400 font-medium leading-relaxed">{selectedPackage.package.description}</p>
                  </div>
               </div>

               <div className="p-8 bg-white">
                  <div className="grid grid-cols-2 gap-6 mb-10">
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Prix Total</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-800">{selectedPackage.package.prix.toFixed(3)}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase">TND</span>
                        </div>
                     </div>
                     <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Interventions</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-800">{selectedPackage.interventions.length}</span>
                          <span className="text-xs font-bold text-slate-400 uppercase">Incluses</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="px-1 text-xs font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      Services Inclus
                    </h4>
                    <div className="grid gap-3">
                      {selectedPackage.interventions.map((intervention) => (
                        <div
                          key={intervention.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:border-red-100 group"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-red-600 transition-colors">{intervention.nom}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{intervention.type_nom}</p>
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white shadow-sm text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                            <Clock className="h-3 w-3" />
                            {intervention.duree_estimee} min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 p-6 rounded-[2rem] bg-red-50/50 border border-red-100 text-center">
                    <p className="text-sm font-bold text-red-600">
                      💡 {t('catalog.toBookPackage')}
                    </p>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                  <ClientButton variant="secondary" onClick={() => setPackageModalOpen(false)}>
                    Fermer
                  </ClientButton>
                  <ClientButton variant="primary" onClick={() => {
                    setPackageModalOpen(false);
                    // Add logic to navigate to booking with this package
                  }}>
                    Réserver ce forfait
                  </ClientButton>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ClientPageWrapper>
  );
}

export default function CatalogPage() {
  return (
    <ProtectedRoute>
      <CatalogContent />
    </ProtectedRoute>
  );
}
