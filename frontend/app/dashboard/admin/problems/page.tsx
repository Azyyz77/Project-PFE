'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { predefinedProblemsAPI, PredefinedProblem, ProblemCategory } from '@/lib/api/predefinedProblems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  'Moteur',
  'Freinage',
  'Suspension',
  'Climatisation',
  'Électrique',
  'Transmission',
  'Direction',
  'Échappement',
  'Carrosserie',
];

export default function ProblemsPage() {
  const { token } = useAuth();
  const [problems, setProblems] = useState<PredefinedProblem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<PredefinedProblem[]>([]);
  const [categories, setCategories] = useState<ProblemCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<PredefinedProblem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [form, setForm] = useState({
    nom: '',
    description: '',
    solution: '',
    categorie: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    filterProblems();
  }, [searchTerm, selectedCategory, showInactive, problems]);

  const loadData = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const [problemsData, categoriesData] = await Promise.all([
        predefinedProblemsAPI.getAll(),
        predefinedProblemsAPI.getCategories(),
      ]);

      setProblems(problemsData.problems);
      setFilteredProblems(problemsData.problems);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      toast.error('Erreur', { description: err.message || 'Erreur lors du chargement des données' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProblems = () => {
    let filtered = problems;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.categorie.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.categorie === selectedCategory);
    }

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter((p) => p.actif);
    }

    setFilteredProblems(filtered);
  };

  const handleCreateClick = () => {
    setForm({ nom: '', description: '', solution: '', categorie: '' });
    setErrors({});
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (problem: PredefinedProblem) => {
    setSelectedProblem(problem);
    setForm({
      nom: problem.nom,
      description: problem.description || '',
      solution: problem.solution || '',
      categorie: problem.categorie,
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (problem: PredefinedProblem) => {
    setSelectedProblem(problem);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.nom.trim()) {
      newErrors.nom = 'Le nom est obligatoire';
    }
    if (!form.categorie) {
      newErrors.categorie = 'La catégorie est obligatoire';
    }

    return newErrors;
  };

  const handleCreate = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);
    try {
      await predefinedProblemsAPI.create(form);
      toast.success('Problème créé avec succès!');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Erreur lors de la création' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProblem) return;

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsProcessing(true);
    try {
      await predefinedProblemsAPI.update(selectedProblem.id, form);
      toast.success('Problème mis à jour avec succès!');
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Erreur lors de la mise à jour' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProblem) return;

    setIsProcessing(true);
    try {
      await predefinedProblemsAPI.delete(selectedProblem.id);
      toast.success('Problème désactivé avec succès!');
      setIsDeleteModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Erreur lors de la suppression' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (problem: PredefinedProblem) => {
    try {
      await predefinedProblemsAPI.update(problem.id, { actif: !problem.actif });
      toast.success(problem.actif ? 'Problème désactivé' : 'Problème activé');
      loadData();
    } catch (err: any) {
      toast.error('Erreur', { description: err.message });
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

  return (
    <div className="w-full h-full overflow-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Problèmes Prédéfinis</h1>
            <p className="text-slate-600">
              Gérez le catalogue des problèmes techniques
            </p>
          </div>

          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau problème
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{problems.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {problems.filter((p) => p.actif).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Inactifs</p>
                  <p className="text-2xl font-bold text-red-600">
                    {problems.filter((p) => !p.actif).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Catégories</p>
                  <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category filter */}
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Show inactive toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showInactive"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showInactive" className="cursor-pointer">
                  Afficher les inactifs
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun problème trouvé
            </h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Aucun résultat pour vos critères de recherche'
                : 'Commencez par créer un problème prédéfini'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={handleCreateClick} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer un problème
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProblems.map((problem) => (
              <Card key={problem.id} className={!problem.actif ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{problem.nom}</h3>
                        <Badge className={getCategoryColor(problem.categorie)}>
                          {problem.categorie}
                        </Badge>
                        {!problem.actif && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Inactif
                          </Badge>
                        )}
                      </div>

                      {problem.description && (
                        <p className="text-slate-600 mb-3">{problem.description}</p>
                      )}

                      {problem.solution && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">
                            Solution recommandée:
                          </p>
                          <p className="text-sm text-blue-800">{problem.solution}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(problem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(problem)}
                        className={problem.actif ? 'text-red-600' : 'text-green-600'}
                      >
                        {problem.actif ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un problème prédéfini</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du problème *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex: Voyant moteur allumé"
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select value={form.categorie} onValueChange={(value) => setForm({ ...form, categorie: value || '' })}>
                <SelectTrigger className={errors.categorie ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorie && <p className="text-xs text-red-600">{errors.categorie}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez le problème..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution">Solution recommandée</Label>
              <Textarea
                id="solution"
                value={form.solution}
                onChange={(e) => setForm({ ...form, solution: e.target.value })}
                placeholder="Décrivez la solution..."
                rows={3}
              />
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
              disabled={isProcessing}
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
                  Créer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le problème</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nom">Nom du problème *</Label>
              <Input
                id="edit-nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && <p className="text-xs text-red-600">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-categorie">Catégorie *</Label>
              <Select value={form.categorie} onValueChange={(value) => setForm({ ...form, categorie: value || '' })}>
                <SelectTrigger className={errors.categorie ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categorie && <p className="text-xs text-red-600">{errors.categorie}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-solution">Solution recommandée</Label>
              <Textarea
                id="edit-solution"
                value={form.solution}
                onChange={(e) => setForm({ ...form, solution: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mettre à jour
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
