'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { documentsApi, Document, getDocumentDownloadUrl } from '@/lib/api/documents';
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

export default function ClientDocumentsPage() {
  const { t, language } = useLanguage();
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
      'Garantie': { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', icon: ShieldCheck },
      'Assurance': { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', icon: Zap },
      'SAV': { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', icon: Layers },
      'Manuel': { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600', icon: FileText },
    };
    return colors[category] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', icon: FileText };  };

  const formatDate = (dateStr: string) => {
    const localeMap: any = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-US' };
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <ClientLoadingState message={t('documents.loading')} />;
  }

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 border border-slate-200/80 shadow-sm"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <Layers className="h-3.5 w-3.5" />
              {t('documents.library')}            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('documents.title')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed">
              {t('documents.accessImportantDocuments')}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('documents.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 py-3.5 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Category Filter ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-blue-600">
            <Filter className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{t('documents.filterByCategory')}</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wide transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm scale-105'
                  : 'bg-white text-slate-400 hover:text-slate-600 shadow-sm border border-slate-200 hover:border-slate-300'
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
            className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden"
          >
            <ClientEmptyState
              icon={FileText}
              title={t('documents.noDocuments')}
              description={searchTerm ? t('documents.noMatchingDocuments') : t('documents.noDocuments')}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, idx) => {
              const category = getCategoryColor(doc.categorie);
              const CategoryIcon = category.icon;
              const downloadUrl = getDocumentDownloadUrl(doc);

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ClientCard className="group h-full flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-blue-200 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${category.bg} border group-hover:scale-110 transition-transform`}>
                        <CategoryIcon className="h-7 w-7" />
                      </div>
                      <Badge className={`${category.bg} ${category.text} border-none px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider`}>
                        {doc.categorie}
                      </Badge>
                    </div>

                    <div className="flex-1 space-y-3 mb-8">
                      <h3 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                        {doc.titre}
                      </h3>
                      {doc.description && (
                        <p className="text-slate-500 text-sm font-semibold leading-relaxed line-clamp-3">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                         <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">{t('documents.addedOn')}</p>
                               <p className="text-xs font-extrabold text-slate-600">{formatDate(doc.date_creation)}</p>
                            </div>
                         </div>
                         {doc.taille_mo && (
                            <div className="text-right">
                               <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider leading-none mb-1">{t('documents.size')}</p>
                               <span className="inline-flex px-2 py-0.5 rounded-md bg-white text-[10px] font-bold text-slate-500 border border-slate-200">
                                  {doc.taille_mo.toFixed(2)} MO
                                </span>
                            </div>
                         )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <ClientButton
                          variant="secondary"
                          onClick={() => downloadUrl && window.open(downloadUrl, '_blank')}
                          icon={Eye}
                          className="w-full text-xs rounded-xl"
                        >
                          {t('documents.view')}
                        </ClientButton>
                        <ClientButton
                          variant="primary"
                          onClick={() => {
                            if (!downloadUrl) return;
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = doc.titre;
                            link.click();
                          }}
                          icon={Download}
                          className="w-full text-xs rounded-xl"
                        >
                          {t('documents.download')}
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

