'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getActiveSections,
  getContentsBySection,
  getDocumentsBySection,
  incrementDownloadCount,
  formatFileSize,
} from '@/lib/api/information';
import type { Section, Content, Document } from '@/types/information';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
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
  BookOpen,
  Sparkles,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
  const router = useRouter();
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
      toast.success(`Téléchargement de ${doc.nom_fichier} démarré`);
      
      // TODO: Implement actual file download if the API provides a URL
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
    return <ClientLoadingState message="Chargement des informations..." />;
  }

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 text-white shadow-md"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-400 backdrop-blur-md border border-white/10">
              <BookOpen className="h-3.5 w-3.5" />
              Centre de Connaissances Chery
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Informations <span className="text-blue-500">Utiles</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed">
              Tout ce que vous devez savoir sur votre véhicule, nos services, la garantie et l'assistance technique.
            </p>
          </div>

          <div className="shrink-0 flex items-center justify-center h-40 w-40 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl">
             <div className="text-center">
                <Sparkles className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Aide & Guide</p>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ─── Sidebar - Sections ─── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="px-4">
            <h3 className="text-xs font-bold text-[#B0B3B8] uppercase tracking-wide mb-4">Catégories</h3>
          </div>
          <div className="grid gap-2">
            {sections.map((section, idx) => {
              const Icon = getIcon(section.icone);
              const isSelected = selectedSection?.id === section.id;
              
              return (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedSection(section)}
                  className={`group relative flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 text-left border-none ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 translate-x-2'
                      : 'bg-white text-[#65676B] hover:bg-[#F0F2F5] shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isSelected ? 'bg-white/20' : 'bg-[#E4E6EB] group-hover:bg-slate-200'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 font-bold text-sm tracking-tight">{section.titre}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </motion.button>
              );
            })}
          </div>

          <div className="p-6 rounded-lg bg-blue-50 border border-blue-100 mt-8">
             <Phone className="h-6 w-6 text-blue-600 mb-3" />
             <h4 className="font-bold text-[#050505] text-sm mb-1 uppercase tracking-tight">Besoin d'aide ?</h4>
             <p className="text-xs text-[#8A8D91] font-medium mb-4 leading-relaxed">Notre équipe technique est disponible 24/7 pour vous accompagner.</p>
             <ClientButton variant="primary" className="w-full text-xs py-2 h-auto" onClick={() => router.push('/client/assistance')}>
                Contacter l'assistance
             </ClientButton>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {isLoadingContent ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6"
              >
                {[1, 2].map(i => (
                  <div key={i} className="h-64 rounded-lg bg-white animate-pulse" />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={selectedSection?.id || 'empty'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Section Header */}
                {selectedSection && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4">
                    <div>
                       <h2 className="text-3xl font-bold text-[#050505] tracking-tight">{selectedSection.titre}</h2>
                       <p className="text-[#B0B3B8] text-sm font-medium mt-1">
                          {contents.length} Article{contents.length > 1 ? 's' : ''} • {documents.length} Document{documents.length > 1 ? 's' : ''}
                       </p>
                    </div>
                    <div className="h-px flex-1 bg-[#E4E6EB] hidden sm:block mx-8" />
                    <div className="flex items-center gap-2">
                       <Zap className="h-4 w-4 text-amber-500" />
                       <span className="text-[10px] font-bold text-[#B0B3B8] uppercase tracking-wide">Mis à jour</span>
                    </div>
                  </div>
                )}

                {/* Contents List */}
                <div className="space-y-6">
                  {contents.length > 0 ? (
                    contents.map((content, idx) => (
                      <motion.div
                        key={content.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <ClientCard className="p-8 sm:p-10 border-none shadow-sm group">
                          <h3 className="text-2xl font-bold text-[#050505] tracking-tight mb-6 group-hover:text-blue-600 transition-colors">
                            {content.titre}
                          </h3>
                          <div
                            className="prose prose-slate max-w-none prose-p:text-[#8A8D91] prose-p:leading-relaxed prose-headings:text-[#050505] prose-strong:text-[#050505]"
                            dangerouslySetInnerHTML={{ __html: content.contenu }}
                          />
                        </ClientCard>
                      </motion.div>
                    ))
                  ) : (
                    !documents.length && (
                      <ClientEmptyState
                        icon={Info}
                        title="Aucun contenu"
                        description="Cette section ne contient pas encore d'articles."
                        className="bg-white border-none shadow-sm"
                      />
                    )
                  )}
                </div>

                {/* Documents List */}
                {documents.length > 0 && (
                  <div className="space-y-6">
                    <div className="px-4">
                       <h3 className="text-xs font-bold text-[#B0B3B8] uppercase tracking-wide">Documents téléchargeables</h3>
                    </div>
                    <div className="grid gap-4">
                      {documents.map((doc, idx) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <ClientCard className="p-6 border-none shadow-lg shadow-slate-100 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-500 group">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-[#F0F2F5] text-[#B0B3B8] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <FileIcon className="h-8 w-8" />
                              </div>
                              <div className="flex-1 text-center sm:text-left min-w-0">
                                <h4 className="font-bold text-[#050505] text-lg tracking-tight truncate group-hover:text-blue-600 transition-colors">
                                  {doc.titre}
                                </h4>
                                {doc.description && (
                                  <p className="text-sm text-[#B0B3B8] font-medium mt-1 line-clamp-1">
                                    {doc.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                                     <History className="h-3 w-3" />
                                     {doc.nom_fichier?.split('.').pop()?.toUpperCase()}
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                                     <Zap className="h-3 w-3" />
                                     {doc.taille_octets ? formatFileSize(doc.taille_octets) : 'N/A'}
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-slate-200" />
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 text-blue-500/60">
                                     <Download className="h-3 w-3" />
                                     {doc.nombre_telechargements} Téléchargements
                                  </span>
                                </div>
                              </div>
                              <ClientButton
                                variant="secondary"
                                onClick={() => handleDownload(doc)}
                                icon={Download}
                                className="w-full sm:w-auto rounded-lg group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                              >
                                {t('documents.download')}
                              </ClientButton>
                            </div>
                          </ClientCard>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ClientPageWrapper>
  );
}
