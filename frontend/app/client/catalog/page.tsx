'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/components/client';import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const router = useRouter();
  
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
      toast.error(t('common.error'), { description: t('vehicleHistory.errorLoading') });
    } finally {
      setLoading(false);
    }
  }, [token, t]);

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
      toast.error(t('common.error'), { description: t('vehicles.detailsUnavailable') });
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
    return <ClientLoadingState message={t('common.loading')} />;
  }

  return (
    <ClientPageWrapper className="space-y-10 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 shadow-sm border border-slate-200/80"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              {t('catalog.discoverServices')}            </div>
            <h1 className="mb-4 text-4xl sm:text-3xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('catalog.title')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed">
              {t('catalog.discoverServices')}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('catalog.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 py-3.5 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50"
            />
          </div>
          
          {/* Search */}
          <div className="relative mt-4">
            <input
              type="text"
              placeholder={t('catalog.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 pl-11 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2543] w-full shadow-sm"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
            iconColor="text-blue-600"
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
          <TabsList className="h-auto p-1.5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
            <TabsTrigger value="packages" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold transition-all uppercase tracking-wide text-[10px]">
              {t('catalog.packages')}
            </TabsTrigger>
            <TabsTrigger value="types" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold transition-all uppercase tracking-wide text-[10px]">
              {t('catalog.serviceTypes')}
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold transition-all uppercase tracking-wide text-[10px]">
              {t('catalog.allServices')}
            </TabsTrigger>          </TabsList>
        </div>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPackages.length === 0 ? (
              <div className="col-span-full">
                <ClientEmptyState
                  icon={PackageIcon}
                  title={t('catalog.noPackagesFound')}
                  description={t('catalog.noPackagesFound')}
                />              </div>
            ) : (
              filteredPackages.map((pkg, idx) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ClientCard className="group h-full overflow-hidden border border-slate-200/80 shadow-sm bg-white rounded-2xl relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <PackageIcon className="h-32 w-32 -mr-10 -mt-10 rotate-12" />
                    </div>
                    
                    <div className="flex flex-col h-full relative z-10 p-6">
                      <div className="mb-6 flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner">
                          <PackageIcon className="h-7 w-7" />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-1">{t('catalog.price')}</p>
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-3xl font-extrabold text-slate-900 tracking-tighter">{pkg.prix.toFixed(3)}</span>
                            <span className="text-xs font-extrabold text-slate-400 uppercase">TND</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">{pkg.nom}</h3>
                          <p className="text-slate-500 font-semibold text-sm leading-relaxed">{pkg.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase tracking-wider">
                              <Wrench className="h-3.5 w-3.5 text-blue-500" />
                              {pkg.nombre_interventions} {t('catalog.services')}
                           </span>
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-extrabold uppercase tracking-wider">
                              <Tag className="h-3.5 w-3.5" />
                              Forfait
                           </span>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                         <div className="text-slate-400 text-xs font-extrabold">
                            TTC
                         </div>
                         <ClientButton 
                           variant="primary" 
                           onClick={() => openPackageDetails(pkg.id)}
                           icon={ArrowRight}
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
                <ClientCard hover className="h-full border border-slate-200/80 bg-white rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                       {type.nombre_sous_types} {t('catalog.services')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-slate-800 mb-2">{type.nom}</h3>
                  
                  <div className="mt-4 flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
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
          <ClientCard className="p-2 overflow-hidden border border-slate-200/80 bg-white rounded-2xl shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredSubTypes.map((subType, idx) => (
                <motion.div
                  key={subType.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{subType.nom}</h3>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">{subType.type_nom}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-600 text-[10px] font-extrabold uppercase tracking-wide">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
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
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-md bg-white">
          {selectedPackage && (
            <div className="relative">
               {/* Modal Header */}
               <div className="bg-slate-50 border-b border-slate-100 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-blue-600/5 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <PackageIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t('catalog.packageDetails')}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-slate-900">{selectedPackage.package.nom}</h2>
                    <p className="text-slate-500 font-semibold text-sm leading-relaxed">{selectedPackage.package.description}</p>
                  </div>
               </div>

               <div className="p-8 bg-white">
                  <div className="grid grid-cols-2 gap-6 mb-10">
                     <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">{t('catalog.price')}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-800">{selectedPackage.package.prix.toFixed(3)}</span>
                          <span className="text-xs font-extrabold text-slate-400 uppercase">TND</span>
                        </div>
                     </div>
                     <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">{t('catalog.interventions')}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-slate-800">{selectedPackage.interventions.length}</span>
                          <span className="text-xs font-extrabold text-slate-400 uppercase">Incluses</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="px-1 text-xs font-extrabold uppercase tracking-wide text-slate-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      {t('catalog.servicesIncluded')}
                    </h4>
                    <div className="grid gap-3 max-h-60 overflow-y-auto pr-1">
                      {selectedPackage.interventions.map((intervention) => (
                        <div
                          key={intervention.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-blue-100 group"
                        >
                          <div>
                            <p className="font-extrabold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{intervention.nom}</p>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{intervention.type_nom}</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow-sm text-slate-500 text-[10px] font-extrabold uppercase tracking-wide border border-slate-150">
                            <Clock className="h-3 w-3 text-blue-500" />
                            {intervention.duree_estimee} min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 p-5 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                    <p className="text-xs font-bold text-blue-600 leading-relaxed">
                      💡 {t('catalog.toBookPackage')}
                    </p>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-2xl">
                  <ClientButton variant="secondary" onClick={() => setPackageModalOpen(false)}>
                    {t('common.close')}
                  </ClientButton>
                  <ClientButton variant="primary" onClick={() => {
                    setPackageModalOpen(false);
                    router.push('/client/rendez-vous');
                  }}>
                    {t('catalog.bookNow')}
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

