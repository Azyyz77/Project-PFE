'use client';

import { useState } from 'react';
import { chatbotApi } from '@/lib/api/chatbot';
import { CheckCircle, XCircle, Loader2, MessageCircle } from 'lucide-react';

export default function TestChatbotPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    duration?: number;
  }>>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const tests = [
      {
        name: 'Test 1: Simple greeting',
        message: 'Bonjour',
        expectedKeywords: ['bonjour', 'assistant', 'chery']
      },
      {
        name: 'Test 2: Appointment question',
        message: 'Comment prendre un rendez-vous?',
        expectedKeywords: ['rendez-vous', 'plateforme', 'ligne']
      },
      {
        name: 'Test 3: Vehicle models',
        message: 'Quels sont les modèles Chery disponibles?',
        expectedKeywords: ['tiggo', 'modèle', 'chery']
      },
      {
        name: 'Test 4: Warranty question',
        message: 'Quelle est la garantie?',
        expectedKeywords: ['garantie', 'ans', 'km']
      }
    ];

    for (const test of tests) {
      const startTime = Date.now();
      
      try {
        setResults(prev => [...prev, {
          test: test.name,
          status: 'pending',
          message: 'En cours...'
        }]);

        const response = await chatbotApi.sendMessage({
          message: test.message,
          history: []
        });

        const duration = Date.now() - startTime;
        const reply = response.reply.toLowerCase();
        const hasKeywords = test.expectedKeywords.some(keyword => 
          reply.includes(keyword.toLowerCase())
        );

        setResults(prev => prev.map((r, i) => 
          i === prev.length - 1 ? {
            test: test.name,
            status: hasKeywords ? 'success' : 'error',
            message: hasKeywords 
              ? `✅ Réponse reçue en ${duration}ms` 
              : `⚠️ Réponse reçue mais mots-clés manquants`,
            duration
          } : r
        ));

        // Wait a bit between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const duration = Date.now() - startTime;
        setResults(prev => prev.map((r, i) => 
          i === prev.length - 1 ? {
            test: test.name,
            status: 'error',
            message: `❌ Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
            duration
          } : r
        ));
      }
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgDuration = results.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-8 w-8 text-[#E30613]" />
            <h1 className="text-3xl font-bold text-gray-900">
              Test du Chatbot AI
            </h1>
          </div>
          <p className="text-gray-600">
            Cette page teste l'intégration du chatbot avec Groq AI
          </p>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={runTests}
            disabled={testing}
            className="w-full bg-gradient-to-r from-[#E30613] to-[#C00510] text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Tests en cours...
              </>
            ) : (
              <>
                <MessageCircle className="h-5 w-5" />
                Lancer les tests
              </>
            )}
          </button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Résumé</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-gray-600">Réussis</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-gray-600">Échoués</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{avgDuration}ms</div>
                <div className="text-sm text-gray-600">Temps moyen</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Résultats détaillés</h2>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : result.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {result.test}
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    {result.duration && (
                      <div className="text-sm font-mono text-gray-500">
                        {result.duration}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && !testing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Instructions
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Assurez-vous que le backend est démarré (port 3000)</li>
              <li>• Vérifiez que la clé API Groq est configurée dans .env</li>
              <li>• Cliquez sur "Lancer les tests" pour commencer</li>
              <li>• Les tests vérifieront la vitesse et la qualité des réponses</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
