'use client';

import { useState, useEffect } from 'react';
import {
  getActiveSections,
  getContentsBySection,
  getDocumentsBySection,
  incrementDownloadCount,
  formatFileSize,
} from '@/lib/api/information';
import type { Section, Content, Document } from '@/types/information';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  FileText,
  FileCheck,
  Wrench,
  Phone,
  Download,
  FileIcon,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// Map icon names to components
const iconMap: Record<string, any> = {
  Shield,
  FileText,
  FileCheck,
  Wrench,
  Phone,
  Info,
};

export default function InformationsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadSectionData(selectedSection.id);
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveSections();
      setSections(data);
      
      // Select first section by default
      if (data.length > 0) {
        setSelectedSection(data[0]);
      }
    } catch (error: any) {
      console.error('Erreur chargement sections:', error);
      toast.error('Erreur lors du chargement des sections');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSectionData = async (sectionId: number) => {
    try {
      setIsLoadingContent(true);
      const [contentsData, documentsData] = await Promise.all([
        getContentsBySection(sectionId),
        getDocumentsBySection(sectionId),
      ]);
      setContents(contentsData);
      setDocuments(documentsData);
    } catch (error: any) {
      console.error('Erreur chargement contenu:', error);
      toast.error('Erreur lors du chargement du contenu');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Increment download counter
      await incrementDownloadCount(doc.id);
      
      // In a real app, this would download the actual file
      // For now, we just show a message
      toast.success(`Téléchargement de ${doc.nom_fichier} démarré`);
      
      // TODO: Implement actual file download
      // window.open(doc.chemin_fichier, '_blank');
    } catch (error: any) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Info;
    return iconMap[iconName] || Info;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Informations et Documents
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Tout ce que vous devez savoir sur la garantie, l'assurance et les documents requis
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Sections */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = getIcon(section.icone);
                    const isSelected = selectedSection?.id === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-l-4 border-rose-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-l-4 border-transparent'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1 font-medium">{section.titre}</span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoadingContent ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-rose-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Section Title */}
                {selectedSection && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const Icon = getIcon(selectedSection.icone);
                          return <Icon className="h-8 w-8 text-rose-500" />;
                        })()}
                        <div>
                          <CardTitle className="text-2xl">{selectedSection.titre}</CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {contents.length} article{contents.length > 1 ? 's' : ''} • {documents.length} document{documents.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                {/* Contents */}
                {contents.length > 0 && (
                  <div className="space-y-4">
                    {contents.map((content) => (
                      <Card key={content.id}>
                        <CardHeader>
                          <CardTitle className="text-xl">{content.titre}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="prose prose-slate dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: content.contenu }}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Documents */}
                {documents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Documents Téléchargeables
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-shrink-0">
                                <FileIcon className="h-8 w-8 text-rose-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {doc.titre}
                                </h4>
                                {doc.description && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {doc.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                  <span>{doc.nom_fichier}</span>
                                  {doc.taille_octets && (
                                    <span>{formatFileSize(doc.taille_octets)}</span>
                                  )}
                                  <span>{doc.nombre_telechargements} téléchargement{doc.nombre_telechargements > 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDownload(doc)}
                              className="flex-shrink-0 gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Télécharger
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {contents.length === 0 && documents.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Info className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">
                        Aucun contenu disponible pour cette section
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
