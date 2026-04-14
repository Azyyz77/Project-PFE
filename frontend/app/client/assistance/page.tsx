'use client';

import { useState } from 'react';
import { diagnosticApi } from '@/lib/api/diagnostic';
import { Search, Wrench, AlertCircle, CheckCircle } from 'lucide-react';

interface DiagnosticProblem {
  id: number;
  nom: string;
  description?: string;
  solution?: string;
  categorie?: string;
}

export default function ClientAssistancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DiagnosticProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<DiagnosticProblem | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Veuillez entrer une description du problème');
      return;
    }

    try {
      setLoading(true);
      const data = await diagnosticApi.searchProblems(searchQuery);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Assistance Diagnostic</h1>
        <p className="text-slate-400">Décrivez votre problème et trouvez des solutions</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: Bruit au démarrage, voyant moteur allumé..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-600"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Résultats */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-100 mb-4">
            {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
          </h2>
          
          <div className="grid gap-4">
            {results.map(problem => (
              <div
                key={problem.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-cyan-600 transition-colors cursor-pointer"
                onClick={() => setSelectedProblem(problem)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-900/30 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg text-slate-100">{problem.nom}</h3>
                      {problem.categorie && (
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                          {problem.categorie}
                        </span>
                      )}
                    </div>
                    
                    {problem.description && (
                      <p className="text-slate-400 text-sm mb-3">{problem.description}</p>
                    )}
                    
                    <button className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
                      <Wrench className="w-4 h-4" />
                      Voir la solution
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de solution */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-lg max-w-2xl w-full p-6 border border-slate-800 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-green-900/30 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">{selectedProblem.nom}</h2>
                {selectedProblem.categorie && (
                  <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                    {selectedProblem.categorie}
                  </span>
                )}
              </div>
            </div>
            
            {selectedProblem.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-100 mb-2">Description du problème</h3>
                <p className="text-slate-400">{selectedProblem.description}</p>
              </div>
            )}
            
            {selectedProblem.solution && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-100 mb-2">Solution recommandée</h3>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-300 whitespace-pre-line">{selectedProblem.solution}</p>
                </div>
              </div>
            )}
            
            <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                💡 Si le problème persiste, nous vous recommandons de prendre rendez-vous avec un de nos techniciens.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedProblem(null)}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Fermer
              </button>
              <button
                onClick={() => window.location.href = '/client/rendez-vous'}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Prendre rendez-vous
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {results.length === 0 && !loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
          <h3 className="font-semibold text-slate-100 mb-4">Problèmes fréquents</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Voyant moteur allumé',
              'Bruit au freinage',
              'Problème de démarrage',
              'Climatisation inefficace',
              'Vibrations au volant',
              'Consommation excessive',
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(suggestion);
                  handleSearch();
                }}
                className="text-left px-4 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-cyan-400 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
