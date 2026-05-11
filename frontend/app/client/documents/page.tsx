'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { documentsApi } from '@/lib/api/documents';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface Document {
  id: number;
  titre: string;
  description?: string;
  url: string;
  categorie: string;
  type_mime?: string;
  taille_mo?: number;
  date_creation: string;
}

export default function ClientDocumentsPage() {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsApi.getAllDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.categorie)))];
  
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.categorie === selectedCategory;
    const matchesSearch = doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (doc.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; icon: any }> = {
      'Garantie': { bg: 'bg-blue-100', text: 'text-blue-700', icon: ShieldCheck },
      'Assurance': { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Zap },
      'SAV': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Layers },
      'Manuel': { bg: 'bg-purple-100', text: 'text-purple-700', icon: FileText },
    };
    return colors[category] || { bg: 'bg-[#E4E6EB]', text: 'text-slate-700', icon: FileText };
  };

  if (loading) {
    return <ClientLoadingState message="Chargement de vos documents..." />;
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
              <Layers className="h-3.5 w-3.5" />
              Bibliothèque de Documents
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-bold tracking-tight leading-none">
              Vos <span className="text-blue-500">Fichiers</span>
            </h1>
            <p className="text-[#B0B3B8] font-medium text-lg leading-relaxed">
              Accédez instantanément à vos contrats, manuels d'utilisation, certificats de garantie et documents d'assurance.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A8D91]" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Category Filter ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
            <Filter className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-[#050505] tracking-tight">Filtrer par catégorie</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'bg-white text-[#B0B3B8] hover:text-[#65676B] shadow-sm border border-[#E4E6EB] hover:border-[#E4E6EB]'
              }`}
            >
              {cat === 'all' ? t('documents.all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Documents Grid ─── */}
      <AnimatePresence mode="popLayout">
        {filteredDocuments.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ClientEmptyState
              icon={FileText}
              title={t('documents.noDocuments')}
              description={searchTerm ? "Aucun document ne correspond à votre recherche." : "Vous n'avez pas encore de documents disponibles."}
              className="bg-white border-none shadow-md shadow-slate-100"
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc, idx) => {
              const category = getCategoryColor(doc.categorie);
              const CategoryIcon = category.icon;

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ClientCard className="group h-full flex flex-col p-8 border-none shadow-sm hover:shadow-md hover:shadow-blue-500/10 transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${category.bg} ${category.text} shadow-inner group-hover:scale-110 transition-transform`}>
                        <CategoryIcon className="h-7 w-7" />
                      </div>
                      <Badge className={`${category.bg} ${category.text} border-none px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide`}>
                        {doc.categorie}
                      </Badge>
                    </div>

                    <div className="flex-1 space-y-3 mb-8">
                      <h3 className="text-xl font-bold text-[#050505] tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                        {doc.titre}
                      </h3>
                      {doc.description && (
                        <p className="text-[#B0B3B8] text-sm font-medium leading-relaxed line-clamp-3">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-[#F0F2F5] border border-[#E4E6EB]">
                         <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-slate-300" />
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide leading-none">Ajouté le</p>
                               <p className="text-xs font-bold text-[#65676B]">{new Date(doc.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                         </div>
                         {doc.taille_mo && (
                            <div className="text-right">
                               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wide leading-none mb-1">Taille</p>
                               <span className="inline-flex px-2 py-0.5 rounded-md bg-white text-[10px] font-bold text-[#8A8D91] border border-[#E4E6EB]">
                                  {doc.taille_mo.toFixed(2)} MO
                               </span>
                            </div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <ClientButton
                          variant="secondary"
                          onClick={() => window.open(doc.url, '_blank')}
                          icon={Eye}
                          className="w-full text-xs rounded-lg"
                        >
                          Consulter
                        </ClientButton>
                        <ClientButton
                          variant="primary"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.url;
                            link.download = doc.titre;
                            link.click();
                          }}
                          icon={Download}
                          className="w-full text-xs rounded-lg"
                        >
                          Télécharger
                        </ClientButton>
                      </div>
                    </div>
                  </ClientCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </ClientPageWrapper>
  );
}
