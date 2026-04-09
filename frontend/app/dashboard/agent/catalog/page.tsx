'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  TrendingUp,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export default function CatalogPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  
  const [types, setTypes] = useState<InterventionType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);
  const [packageModalOpen, setPackageModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

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
      setPackages(packagesData);
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

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Wrench className="w-7 h-7 text-orange-500" />
          Catalogue d'Interventions
        </h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 w-80"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Types d'intervention</p>
              <p className="text-2xl font-bold text-white">{stats.total_types}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Sous-types</p>
              <p className="text-2xl font-bold text-white">{stats.total_sous_types}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="p-4">
              <p className="text-orange-400 text-sm">Packages actifs</p>
              <p className="text-2xl font-bold text-orange-500">{stats.total_packages_actifs}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <p className="text-slate-400 text-sm">Total packages</p>
              <p className="text-2xl font-bold text-white">{stats.total_packages}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <p className="text-blue-400 text-sm">Durée moyenne</p>
              <p className="text-2xl font-bold text-blue-500">{Math.round(stats.duree_moyenne)} min</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="types" className="space-y-4">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="types">Types d'intervention</TabsTrigger>
          <TabsTrigger value="subtypes">Sous-types</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>

        {/* Types Tab */}
        <TabsContent value="types">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Types d'intervention</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun type trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTypes.map((type) => (
                    <Card key={type.id} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-white font-semibold text-lg">{type.nom}</h3>
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-orange-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">Délai moyen: {type.delai_moyen} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">{type.nombre_sous_types} sous-type(s)</span>
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

        {/* SubTypes Tab */}
        <TabsContent value="subtypes">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Sous-types d'intervention</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : filteredSubTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun sous-type trouvé</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSubTypes.map((subType) => (
                    <div
                      key={subType.id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{subType.nom}</h3>
                        <p className="text-slate-400 text-sm">{subType.type_nom}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 text-sm">{subType.duree_estimee} min</span>
                        </div>
                        <Badge variant="outline" className="border-orange-500/30 text-orange-500">
                          ID: {subType.id}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Packages d'intervention</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <PackageIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">Aucun package trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPackages.map((pkg) => (
                    <Card key={pkg.id} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-white font-semibold text-lg">{pkg.nom}</h3>
                              {pkg.actif ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <p className="text-slate-400 text-sm mb-3">{pkg.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-orange-500">
                              {pkg.prix_estimatif.toFixed(3)} TND
                            </p>
                            <p className="text-slate-400 text-xs">
                              {pkg.nombre_interventions} intervention(s)
                            </p>
                          </div>
                          <Button
                            onClick={() => openPackageDetails(pkg.id)}
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Détails
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
      </Tabs>

      {/* Package Details Modal */}
      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Détails du Package</DialogTitle>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{selectedPackage.package.nom}</h3>
                  {selectedPackage.package.actif ? (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Actif</Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Inactif</Badge>
                  )}
                </div>
                <p className="text-slate-400 mb-3">{selectedPackage.package.description}</p>
                <p className="text-2xl font-bold text-orange-500">
                  {selectedPackage.package.prix_estimatif.toFixed(3)} TND
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Interventions incluses:</h4>
                <div className="space-y-2">
                  {selectedPackage.interventions.map((intervention) => (
                    <div
                      key={intervention.id}
                      className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">{intervention.nom}</p>
                        <p className="text-slate-400 text-sm">{intervention.type_nom}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">{intervention.duree_estimee} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
