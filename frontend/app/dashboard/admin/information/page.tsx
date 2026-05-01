'use client';

import { useState, useEffect } from 'react';
import {
  getAllSections,
  getAllContents,
  createSection,
  updateSection,
  deleteSection,
  createContent,
  updateContent,
  deleteContent,
} from '@/lib/api/information';
import type { Section, Content } from '@/types/information';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInformationPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sections' | 'contents' | 'documents'>('sections');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sectionsData, contentsData] = await Promise.all([
        getAllSections(),
        getAllContents(),
      ]);
      setSections(sectionsData);
      setContents(contentsData);
    } catch (error: any) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSection = async (section: Section) => {
    try {
      await updateSection(section.id, { ...section, actif: !section.actif });
      toast.success(`Section ${section.actif ? 'désactivée' : 'activée'}`);
      loadData();
    } catch (error: any) {
      console.error('Erreur toggle section:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;
    
    try {
      await deleteSection(id);
      toast.success('Section supprimée');
      loadData();
    } catch (error: any) {
      console.error('Erreur suppression section:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleContent = async (content: Content) => {
    try {
      await updateContent(content.id, { ...content, actif: !content.actif });
      toast.success(`Contenu ${content.actif ? 'désactivé' : 'activé'}`);
      loadData();
    } catch (error: any) {
      console.error('Erreur toggle contenu:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteContent = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;
    
    try {
      await deleteContent(id);
      toast.success('Contenu supprimé');
      loadData();
    } catch (error: any) {
      console.error('Erreur suppression contenu:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Gestion des Informations
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gérer les sections, contenus et documents
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'sections'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Sections ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab('contents')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'contents'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Contenus ({contents.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'documents'
              ? 'text-rose-600 border-b-2 border-rose-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Documents
        </button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sections d'Information</CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-slate-500">Ordre</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {section.ordre}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {section.titre}
                        </h3>
                        <Badge variant={section.actif ? 'default' : 'secondary'}>
                          {section.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Slug: {section.slug} • Icône: {section.icone || 'Aucune'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{section.nombre_contenus || 0} contenu(s)</span>
                        <span>{section.nombre_documents || 0} document(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSection(section)}
                      className="gap-2"
                    >
                      {section.actif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {section.actif ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contents Tab */}
      {activeTab === 'contents' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contenus d'Information</CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Contenu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {content.titre}
                      </h3>
                      <Badge variant={content.actif ? 'default' : 'secondary'}>
                        {content.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Section: {content.section_titre} • Ordre: {content.ordre}
                    </p>
                    <div className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {content.contenu.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleContent(content)}
                      className="gap-2"
                    >
                      {content.actif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContent(content.id)}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documents Téléchargeables</CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p>La gestion des documents sera disponible prochainement</p>
              <p className="text-sm mt-2">
                Utilisez la base de données pour ajouter des documents pour le moment
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">Note importante</p>
              <p>
                Cette interface permet de gérer les sections et contenus d'information.
                Pour une gestion complète avec éditeur HTML, utilisez directement la base de données
                ou développez une interface d'édition avancée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
