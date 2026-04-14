'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Wrench, 
  Package as PackageIcon, 
  Clock, 
  CheckCircle,
  XCircle,
  Search,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

function CatalogContent() {
  const { user, token } = useAuth();
  
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      loadCatalog();
    }
  }, [token]);

  const loadCatalog = async () => {
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
      setPackages(packagesData.filter(pkg => pkg.actif)); // Afficher uniquement les packages actifs
      setStats(statsData);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger le catalogue' });
    } finally {
      setLoading(false);
    }
  };

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-950 p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-20 -top-20 size-40 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-8 h-8" />
                <h1 className="text-3xl sm:text-4xl font-bold">Catalogue de Services</h1>
              </div>
              <p className="text-sm text-blue-100">Découvrez nos services et packages d'entretien</p>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-80 backdrop-blur-sm"
              />
              <Search className="w-5 h-5 text-blue-200 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Types de service</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_types}</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Services disponibles</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_sous_types}</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30">
              <CardContent className="p-4">
                <p className="text-orange-600 dark:text-orange-400 text-sm">Packages disponibles</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">{stats.total_packages_actifs}</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30">
              <CardContent className="p-4">
                <p className="text-blue-600 dark:text-blue-400 text-sm">Durée moyenne</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{Math.round(stats.duree_moyenne)} min</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="packages" className="space-y-4">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="types">Types de service</TabsTrigger>
            <TabsTrigger value="services">Tous les services</TabsTrigger>
          </TabsList>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Packages d'entretien</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">Économisez avec nos offres groupées</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : filteredPackages.length === 0 ? (
                  <div className="text-center py-12">
                    <PackageIcon className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Aucun package trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPackages.map((pkg) => (
                      <Card key={pkg.id} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500/50 transition-all hover:shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <PackageIcon className="w-5 h-5 text-orange-500" />
                                <h3 className="text-slate-900 dark:text-white font-semibold text-lg">{pkg.nom}</h3>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{pkg.description}</p>
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-orange-500">
                                  {pkg.prix.toFixed(3)}
                                </p>
                                <span className="text-slate-600 dark:text-slate-400 text-sm">TND</span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                {pkg.nombre_interventions} intervention(s) incluse(s)
                              </p>
                            </div>
                            <Button
                              onClick={() => openPackageDetails(pkg.id)}
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                            >
                              Voir détails
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Types Tab */}
          <TabsContent value="types">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Types de service</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : filteredTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Aucun type trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTypes.map((type) => (
                      <Card key={type.id} className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500/50 transition-all">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-slate-900 dark:text-white font-semibold text-lg">{type.nom}</h3>
                            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-orange-500" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">Délai: {type.delai_moyen} min</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Tag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">{type.nombre_sous_types} service(s)</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Tous les services</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : filteredSubTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Aucun service trouvé</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSubTypes.map((subType) => (
                      <div
                        key={subType.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500/50 transition-all"
                      >
                        <div className="flex-1">
                          <h3 className="text-slate-900 dark:text-white font-semibold">{subType.nom}</h3>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">{subType.type_nom}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300 text-sm">{subType.duree_estimee} min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Package Details Modal */}
        <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Détails du Package</DialogTitle>
            </DialogHeader>
            
            {selectedPackage && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <PackageIcon className="w-6 h-6 text-orange-500" />
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedPackage.package.nom}</h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{selectedPackage.package.description}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-orange-500">
                      {selectedPackage.package.prix.toFixed(3)}
                    </p>
                    <span className="text-slate-600 dark:text-slate-400 text-lg">TND</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Services inclus:
                  </h4>
                  <div className="space-y-2">
                    {selectedPackage.interventions.map((intervention) => (
                      <div
                        key={intervention.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium">{intervention.nom}</p>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">{intervention.type_nom}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300 text-sm">{intervention.duree_estimee} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    💡 Pour réserver ce package, rendez-vous dans la section "Rendez-vous" et sélectionnez les services inclus.
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
