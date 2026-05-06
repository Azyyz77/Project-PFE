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
      'Garantie': 'bg-blue-900 text-blue-200',
      'Assurance': 'bg-green-900 text-green-200',
      'SAV': 'bg-orange-900 text-orange-200',
      'Manuel': 'bg-purple-900 text-purple-200',
    };
    return colors[category] || 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">{t('documents.title')}</h1>
        <p className="text-slate-400">{t('documents.accessImportantDocuments')}</p>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? t('documents.all') : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-300">{t('documents.loading')}</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">{t('documents.noDocuments')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-cyan-500" />
                <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(doc.categorie)}`}>
                  {doc.categorie}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg mb-2 text-slate-100">{doc.titre}</h3>
              
              {doc.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{doc.description}</p>
              )}
              
              <div className="text-xs text-slate-500 mb-4">
                <div>{t('documents.addedOn')}: {new Date(doc.date_creation).toLocaleDateString()}</div>
                {doc.taille_mo && <div>{t('documents.size')}: {doc.taille_mo.toFixed(2)} Mo</div>}
              </div>
              
              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  {t('documents.view')}
                </a>
                <a
                  href={doc.url}
                  download
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm"
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
