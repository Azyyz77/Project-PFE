'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { diagnosticsAPI, Diagnostic, CreateDiagnosticData } from '@/lib/api/diagnostics';
import { predefinedProblemsAPI, PredefinedProblem } from '@/lib/api/predefinedProblems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Wrench,
  Plus,
  Search,
  Loader2,
  FileText,
  Calendar,
  User,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

const GRAVITE_OPTIONS = ['Faible', 'Moyenne', 'Élevée', 'Critique'];

export default function DiagnosticsPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const rdvIdParam = searchParams?.get('rdv_id');

  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [problems, setProblems] = useState<PredefinedProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<PredefinedProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Diagnostic | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [form, setForm] = useState<CreateDiagnosticData>({
    rdv_id: 0,
    observations_generales: '',
    recommandations: '',
    problemes: [],
  });
  const [selectedProblems, setSelectedProblems] = useState<Set<number>>(new Set());
  const [problemDetails, setProblemDetails] = useState<Record<number, { description_specifique: string; gravite: string }>>({});

  useEffect(() => {
    loadData();
    if (rdvIdParam) {
      setForm((prev) => ({ ...prev, rdv_id: parseInt(rdvIdParam) }));
      setIsCreateModalOpen(true);
    }
  }, [token, rdvIdParam]);

  useEffect(() => {
    filterProblems();
  }, [searchTerm, selectedCategory, problems]);

  const loadData = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [diagnosticsData, problemsData] = await Promise.all([
        diagnosticsAPI.getAll(),
        predefinedProblemsAPI.getAll({ actif: true }),
      ]);

      setDiagnostics(diagnosticsData.diagnostics);
      setProblems(problemsData.problems);
      setFilteredProblems(problemsData.problems);
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Erreur', { description: err.message || 'Erreur lors du chargement des données' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.categorie.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categorie === selectedCategory);
    }

    setFilteredProblems(filtered);
  };

  const handleCreateClick = () => {
    setForm({
      rdv_id: 0,
      observations_generales: '',
      recommandations: '',
      problemes: [],
    });
    setSelectedProblems(new Set());
    setProblemDetails({});
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (diagnostic: Diagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setIsDetailModalOpen(true);
  };

  const handleProblemToggle = (problemId: number) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
      const newDetails = { ...problemDetails };
      delete newDetails[problemId];
      setProblemDetails(newDetails);
    } else {
      newSelected.add(problemId);
      setProblemDetails({
        ...problemDetails,
        [problemId]: { description_specifique: '', gravite: 'Moyenne' },
      });
    }
    setSelectedProblems(newSelected);
  };

  const handleProblemDetailChange = (problemId: number, field: 'description_specifique' | 'gravite', value: string) => {
    setProblemDetails({
      ...problemDetails,
      [problemId]: {
        ...problemDetails[problemId],
        [field]: value,
      },
    });
  };

  const handleCreate = async () => {
    if (!form.rdv_id) {
      toast.error('Erreur', { description: 'Veuillez saisir un numéro de RDV' });
      return;
    }

    const problemesArray = Array.from(selectedProblems).map((problemId) => ({
      probleme_id: problemId,
      description_specifique: problemDetails[problemId]?.description_specifique || '',
      gravite: problemDetails[problemId]?.gravite || 'Moyenne',
    }));

    const data: CreateDiagnosticData = {
      ...form,
      problemes: problemesArray,
    };

    setIsProcessing(true);
    try {
      await diagnosticsAPI.create(data);
      toast.success('Diagnostic créé avec succès!');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Erreur lors de la création' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryColor = (categorie: string) => {
    const colors: Record<string, string> = {
      Moteur: 'bg-red-100 text-red-700',
      Freinage: 'bg-orange-100 text-orange-700',
      Suspension: 'bg-yellow-100 text-yellow-700',
      Climatisation: 'bg-cyan-100 text-cyan-700',
      Électrique: 'bg-blue-100 text-blue-700',
      Transmission: 'bg-purple-100 text-purple-700',
      Direction: 'bg-pink-100 text-pink-700',
      Échappement: 'bg-gray-100 text-gray-700',
      Carrosserie: 'bg-green-100 text-green-700',
    };
    return colors[categorie] || 'bg-slate-100 text-slate-700';
  };

  const getGraviteColor = (gravite: string) => {
    const colors: Record<string, string> = {
      Faible: 'bg-green-100 text-green-700',
      Moyenne: 'bg-yellow-100 text-yellow-700',
      Élevée: 'bg-orange-100 text-orange-700',
      Critique: 'bg-red-100 text-red-700',
    };
    return colors[gravite] || 'bg-slate-100 text-slate-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categories = Array.from(new Set(problems.map((p) => p.categorie))).sort();

  return (
    <div className="w-full h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Diagnostics Techniques</h1>
            <p className="text-slate-600">
              Créez et consultez les diagnostics des rendez-vous
            </p>
          </div>

          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau diagnostic
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total diagnostics</p>
                  <p className="text-2xl font-bold text-slate-900">{diagnostics.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Cette semaine</p>
                  <p className="text-2xl font-bold text-green-600">
                    {diagnostics.filter((d) => {
                      const date = new Date(d.date_creation);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return date >= weekAgo;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Problèmes disponibles</p>
                  <p className="text-2xl font-bold text-purple-600">{problems.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostics List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : diagnostics.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun diagnostic
            </h3>
            <p className="text-slate-600 mb-4">
              Commencez par créer un diagnostic pour un rendez-vous
            </p>
            <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer un diagnostic
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {diagnostics.map((diagnostic) => (
              <Card key={diagnostic.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">
                          Diagnostic #{diagnostic.id}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-700">
                          RDV #{diagnostic.rdv_id}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Client:</span>
                          <span className="font-semibold text-slate-900">{diagnostic.client_nom}</span>
                        </div>

                        {diagnostic.immatriculation && (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">Véhicule:</span>
                            <span className="font-semibold text-slate-900">
                              {diagnostic.marque} {diagnostic.modele} - {diagnostic.immatriculation}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Date RDV:</span>
                          <span className="text-slate-900">{formatDate(diagnostic.date_heure)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">Créé le:</span>
                          <span className="text-slate-900">{formatDate(diagnostic.date_creation)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(diagnostic)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Détails
                    </Button>
                  </div>

                  {diagnostic.problemes && diagnostic.problemes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">
                        Problèmes identifiés ({diagnostic.problemes.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {diagnostic.problemes.slice(0, 5).map((prob) => (
                          <Badge key={prob.id} className={getCategoryColor(prob.probleme_categorie)}>
                            {prob.probleme_nom}
                            {prob.gravite && (
                              <span className="ml-1">({prob.gravite})</span>
                            )}
                          </Badge>
                        ))}
                        {diagnostic.problemes.length > 5 && (
                          <Badge variant="outline">
                            +{diagnostic.problemes.length - 5} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Diagnostic Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un diagnostic technique</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* RDV ID */}
            <div className="space-y-2">
              <Label htmlFor="rdv_id">Numéro de RDV *</Label>
              <Input
                id="rdv_id"
                type="number"
                value={form.rdv_id || ''}
                onChange={(e) => setForm({ ...form, rdv_id: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 123"
              />
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observations générales</Label>
              <Textarea
                id="observations"
                value={form.observations_generales}
                onChange={(e) => setForm({ ...form, observations_generales: e.target.value })}
                placeholder="Décrivez l'état général du véhicule..."
                rows={4}
              />
            </div>

            {/* Recommandations */}
            <div className="space-y-2">
              <Label htmlFor="recommandations">Recommandations</Label>
              <Textarea
                id="recommandations"
                value={form.recommandations}
                onChange={(e) => setForm({ ...form, recommandations: e.target.value })}
                placeholder="Vos recommandations pour le client..."
                rows={4}
              />
            </div>

            {/* Problems Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Problèmes identifiés</Label>
                <span className="text-sm text-slate-600">
                  {selectedProblems.size} sélectionné(s)
                </span>
              </div>

              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher un problème..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value || 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Problems List */}
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {filteredProblems.length === 0 ? (
                  <div className="p-8 text-center text-slate-600">
                    Aucun problème trouvé
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredProblems.map((problem) => (
                      <div key={problem.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedProblems.has(problem.id)}
                            onCheckedChange={() => handleProblemToggle(problem.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900">{problem.nom}</span>
                              <Badge className={getCategoryColor(problem.categorie)}>
                                {problem.categorie}
                              </Badge>
                            </div>
                            {problem.description && (
                              <p className="text-sm text-slate-600 mb-2">{problem.description}</p>
                            )}

                            {selectedProblems.has(problem.id) && (
                              <div className="mt-3 space-y-2 bg-blue-50 p-3 rounded-lg">
                                <div className="space-y-1">
                                  <Label className="text-xs">Description spécifique</Label>
                                  <Input
                                    placeholder="Détails supplémentaires..."
                                    value={problemDetails[problem.id]?.description_specifique || ''}
                                    onChange={(e) =>
                                      handleProblemDetailChange(problem.id, 'description_specifique', e.target.value)
                                    }
                                    className="text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Gravité</Label>
                                  <Select
                                    value={problemDetails[problem.id]?.gravite || 'Moyenne'}
                                    onValueChange={(value) =>
                                      handleProblemDetailChange(problem.id, 'gravite', value || 'Moyenne')
                                    }
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {GRAVITE_OPTIONS.map((g) => (
                                        <SelectItem key={g} value={g}>
                                          {g}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isProcessing || !form.rdv_id}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer le diagnostic
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du diagnostic #{selectedDiagnostic?.id}</DialogTitle>
          </DialogHeader>

          {selectedDiagnostic && (
            <div className="space-y-6">
              {/* Info générale */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600">RDV</Label>
                    <p className="font-semibold">#{selectedDiagnostic.rdv_id}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Client</Label>
                    <p className="font-semibold">{selectedDiagnostic.client_nom}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Véhicule</Label>
                    <p className="font-semibold">
                      {selectedDiagnostic.marque} {selectedDiagnostic.modele} - {selectedDiagnostic.immatriculation}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Agent</Label>
                    <p className="font-semibold">{selectedDiagnostic.agent_nom}</p>
                  </div>
                  <div>
                    <Label className="text-slate-600">Date création</Label>
                    <p className="font-semibold">{formatDate(selectedDiagnostic.date_creation)}</p>
                  </div>
                  {selectedDiagnostic.date_modification && (
                    <div>
                      <Label className="text-slate-600">Dernière modification</Label>
                      <p className="font-semibold">{formatDate(selectedDiagnostic.date_modification)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Observations */}
              {selectedDiagnostic.observations_generales && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Observations générales</h3>
                  <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                    {selectedDiagnostic.observations_generales}
                  </p>
                </div>
              )}

              {/* Recommandations */}
              {selectedDiagnostic.recommandations && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Recommandations</h3>
                  <p className="text-slate-700 whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                    {selectedDiagnostic.recommandations}
                  </p>
                </div>
              )}

              {/* Problèmes */}
              {selectedDiagnostic.problemes && selectedDiagnostic.problemes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">
                    Problèmes identifiés ({selectedDiagnostic.problemes.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedDiagnostic.problemes.map((prob) => (
                      <Card key={prob.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-slate-900">{prob.probleme_nom}</h4>
                                <Badge className={getCategoryColor(prob.probleme_categorie)}>
                                  {prob.probleme_categorie}
                                </Badge>
                                {prob.gravite && (
                                  <Badge className={getGraviteColor(prob.gravite)}>
                                    {prob.gravite}
                                  </Badge>
                                )}
                              </div>
                              {prob.probleme_description && (
                                <p className="text-sm text-slate-600 mb-2">{prob.probleme_description}</p>
                              )}
                              {prob.description_specifique && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                  <p className="text-sm font-semibold text-yellow-900">Détails spécifiques:</p>
                                  <p className="text-sm text-yellow-800">{prob.description_specifique}</p>
                                </div>
                              )}
                              {prob.probleme_solution && (
                                <div className="bg-green-50 border border-green-200 rounded p-2">
                                  <p className="text-sm font-semibold text-green-900">Solution recommandée:</p>
                                  <p className="text-sm text-green-800">{prob.probleme_solution}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
