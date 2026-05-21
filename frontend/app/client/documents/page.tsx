'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { documentsApi } from '@/lib/api/documents';
import { FileText, Download, Eye } from 'lucide-react';

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

  const categories = ['all', ...new Set(documents.map(doc => doc.categorie))];
  
  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.categorie === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Garantie': 'bg-blue-100 text-blue-700',
      'Assurance': 'bg-green-100 text-green-700',
      'SAV': 'bg-orange-100 text-orange-700',
      'Manuel': 'bg-purple-100 text-purple-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{t('documents.title')}</h1>
            <p className="text-slate-600">{t('documents.accessImportantDocuments')}</p>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat, index) => (
          <button
            key={cat}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 animate-fade-in hover:scale-105 hover:shadow-md ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#0f2543] to-[#1b355d] text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat === 'all' ? t('documents.all') : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#0f2543]/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-[#0f2543]" />
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg">{t('documents.noDocuments')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc, index) => (
            <div
              key={doc.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="bg-white border border-slate-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#0f2543] animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f2543] to-[#1b355d] shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.categorie)}`}>
                  {doc.categorie}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 text-slate-800">{doc.titre}</h3>
              
              {doc.description && (
                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{doc.description}</p>
              )}
              
              <div className="text-xs text-slate-500 mb-4 space-y-1">
                <div>{t('documents.addedOn')}: {new Date(doc.date_creation).toLocaleDateString()}</div>
                {doc.taille_mo && <div>{t('documents.size')}: {doc.taille_mo.toFixed(2)} Mo</div>}
              </div>
              
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#0f2543] to-[#1b355d] text-white rounded-lg hover:shadow-lg text-sm transition-all duration-300 hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  {t('documents.view')}
                </a>
                <a
                  href={doc.url}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 text-sm border border-slate-200 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  <Download className="w-4 h-4" />
                  {t('documents.download')}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
