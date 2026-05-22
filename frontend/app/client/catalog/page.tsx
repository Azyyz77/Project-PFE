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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Wrench, 
  Package as PackageIcon, 
  Clock, 
  CheckCircle,
  Search,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

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

  if (!user || !token) {
    return null;
  }

  return (
    <main className="client-page-enter min-h-screen bg-[#f5f7fa] p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{t('catalog.title')}</h1>
              <p className="text-slate-600">{t('catalog.discoverServices')}</p>
            </div>
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

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <p className="text-slate-600 text-sm">{t('catalog.serviceTypes')}</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total_types}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <p className="text-slate-600 text-sm">{t('catalog.servicesAvailable')}</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total_sous_types}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <p className="text-orange-700 text-sm">{t('catalog.packagesAvailable')}</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total_packages_actifs}</p>
            </div>
            <div className="bg-gradient-to-br from-[#0f2543]/5 to-[#1b355d]/10 rounded-xl shadow-sm border border-[#0f2543]/20 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <p className="text-[#0f2543] text-sm">{t('catalog.averageDuration')}</p>
              <p className="text-2xl font-bold text-[#1b355d]">{Math.round(stats.duree_moyenne)} min</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="packages" className="space-y-4">
          <TabsList className="rounded-2xl bg-white border border-slate-200 shadow-sm">
            <TabsTrigger value="packages">{t('catalog.packages')}</TabsTrigger>
            <TabsTrigger value="types">{t('catalog.serviceTypes')}</TabsTrigger>
            <TabsTrigger value="services">{t('catalog.allServices')}</TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">{t('catalog.maintenancePackages')}</h2>
                <p className="text-sm text-slate-600">{t('catalog.saveWithBundles')}</p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
                  </div>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                    <PackageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">{t('catalog.noPackagesFound')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPackages.map((pkg, index) => (
                    <div
                      key={pkg.id}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#0f2543] animate-fade-in"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                              <PackageIcon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg">{pkg.nom}</h3>
                          </div>
                          <p className="text-slate-600 text-sm mb-4">{pkg.description}</p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-orange-600">
                              {pkg.prix.toFixed(3)}
                            </p>
                            <span className="text-slate-600 text-sm">TND</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">
                            {pkg.nombre_interventions} {t('catalog.interventionsIncluded')}
                          </p>
                        </div>
                        <Button
                          onClick={() => openPackageDetails(pkg.id)}
                          size="sm"
                          className="bg-gradient-to-r from-[#0f2543] to-[#1b355d] hover:shadow-lg text-white transition-all duration-300 hover:scale-105"
                        >
                          {t('catalog.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Types Tab */}
          <TabsContent value="types">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{t('catalog.serviceTypes')}</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
                  </div>
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                    <Wrench className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">{t('catalog.noTypesFound')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTypes.map((type, index) => (
                    <div
                      key={type.id}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#0f2543] animate-fade-in"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-slate-800 font-semibold text-lg">{type.nom}</h3>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-md">
                          <Wrench className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{t('catalog.delay')}: {type.delai_moyen} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{type.nombre_sous_types} {t('catalog.services')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{t('catalog.allServices')}</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
                  </div>
                </div>
              ) : filteredSubTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                    <Wrench className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">{t('catalog.noServicesFound')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSubTypes.map((subType, index) => (
                    <div
                      key={subType.id}
                      style={{ animationDelay: `${index * 30}ms` }}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#0f2543] animate-fade-in"
                    >
                      <div className="flex-1">
                        <h3 className="text-slate-800 font-semibold">{subType.nom}</h3>
                        <p className="text-slate-600 text-sm">{subType.type_nom}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-700 text-sm">{subType.duree_estimee} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Package Details Modal */}
        <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
          <DialogContent className="bg-white border-slate-200 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-800">{t('catalog.packageDetails')}</DialogTitle>
            </DialogHeader>
            
            {selectedPackage && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                      <PackageIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{selectedPackage.package.nom}</h3>
                  </div>
                  <p className="text-slate-700 mb-4">{selectedPackage.package.description}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-orange-600">
                      {selectedPackage.package.prix.toFixed(3)}
                    </p>
                    <span className="text-slate-600 text-lg">TND</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    {t('catalog.servicesIncluded')}:
                  </h4>
                  <div className="space-y-2">
                    {selectedPackage.interventions.map((intervention) => (
                      <div
                        key={intervention.id}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div>
                          <p className="text-slate-800 font-medium">{intervention.nom}</p>
                          <p className="text-slate-600 text-sm">{intervention.type_nom}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700 text-sm">{intervention.duree_estimee} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#0f2543]/5 to-[#1b355d]/10 border border-[#0f2543]/20 rounded-lg p-4">
                  <p className="text-[#0f2543] text-sm">
                    💡 {t('catalog.toBookPackage')}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <ProtectedRoute>
      <CatalogContent />
    </ProtectedRoute>
  );
}
