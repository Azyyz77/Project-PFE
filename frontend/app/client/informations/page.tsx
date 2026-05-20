'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {t('informations.title')}
            </h1>
            <p className="text-slate-600">
              {t('informations.everythingYouNeed')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Sections */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-[#0f2543] to-[#1b355d]">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{t('informations.sections')}</h2>
            </div>
            <nav className="p-2">
              {sections.map((section, index) => {
                const Icon = getIcon(section.icone);
                const isSelected = selectedSection?.id === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-300 mb-1 animate-fade-in hover:scale-[1.02] hover:shadow-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#0f2543] to-[#1b355d] text-white shadow-lg scale-[1.02]'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`} />
                    <span className="flex-1 font-medium">{section.titre}</span>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${isSelected ? 'translate-x-1' : ''}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section Title */}
              {selectedSection && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    {(() => {
                      const Icon = getIcon(selectedSection.icone);
                      return (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                      );
                    })()}
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedSection.titre}</h2>
                      <p className="text-sm text-slate-600 mt-1">
                        {contents.length} {t('informations.articles')}{contents.length > 1 ? 's' : ''} • {documents.length} {t('informations.documents')}{documents.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contents */}
              {contents.length > 0 && (
                <div className="space-y-4">
                  {contents.map((content, index) => (
                    <div
                      key={content.id}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
                    >
                      <h3 className="text-xl font-semibold text-slate-800 mb-4">{content.titre}</h3>
                      <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.contenu }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-[#0f2543]" />
                    {t('informations.downloadableDocuments')}
                  </h3>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div
                        key={doc.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="flex items-center justify-between p-4 rounded-lg border border-slate-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-[#0f2543] animate-fade-in"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-md">
                            <FileIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800">
                              {doc.titre}
                            </h4>
                            {doc.description && (
                              <p className="text-sm text-slate-600 mt-1">
                                {doc.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>{doc.nom_fichier}</span>
                              {doc.taille_octets && (
                                <span>{formatFileSize(doc.taille_octets)}</span>
                              )}
                              <span>{doc.nombre_telechargements} {t('informations.downloads')}{doc.nombre_telechargements > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDownload(doc)}
                          className="flex-shrink-0 gap-2 bg-gradient-to-r from-[#0f2543] to-[#1b355d] hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          <Download className="h-4 w-4" />
                          {t('documents.download')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {contents.length === 0 && documents.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                    <Info className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">
                    {t('informations.noContent')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
