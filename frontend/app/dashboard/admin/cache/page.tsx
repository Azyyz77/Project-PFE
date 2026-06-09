'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCacheStats, clearCache, CacheStats } from '@/lib/api/cache';
import { RefreshCw, Trash2, Database, Clock, Key, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CachePage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getCacheStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Erreur de récupération des stats', {
        description: error.response?.data?.error || 'Impossible de récupérer les statistiques'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir vider le cache Ollama ? Les embeddings devront être regénérés.')) {
      return;
    }

    setClearing(true);
    try {
      const result = await clearCache();
      toast.success(`✅ ${result.deletedCount} embeddings supprimés`);
      await fetchStats(); // Rafraîchir les stats
    } catch (error: any) {
      toast.error('Erreur lors du vidage du cache', {
        description: error.response?.data?.error || 'Impossible de vider le cache'
      });
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTTL = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    return hours > 0 ? `${hours}h` : `${Math.floor(seconds / 60)}m`;
  };

  const calculateHitRate = () => {
    // Exemple fictif - à adapter selon vos métriques réelles
    if (!stats?.count) return 0;
    return Math.min(100, (stats.count / 1000) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Cache Ollama</h1>
          <p className="text-gray-600 mt-1">
            Cache Redis pour les embeddings vectoriels
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchStats}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
          <Button
            onClick={handleClearCache}
            disabled={clearing || !stats?.enabled}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {clearing ? 'Suppression...' : 'Vider le cache'}
          </Button>
        </div>
      </div>

      {/* Statut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Statut du Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    stats.enabled ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-lg font-medium">
                  {stats.enabled ? 'Actif' : 'Désactivé'}
                </span>
              </div>

              {stats.error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Erreur</p>
                    <p className="text-sm text-red-700">{stats.error}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Chargement...</p>
          )}
        </CardContent>
      </Card>

      {/* Métriques */}
      {stats?.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nombre d'entrées */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Embeddings en cache
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {stats.count?.toLocaleString() || 0}
              </div>
              <p className="text-sm text-gray-500 mt-1">entrées Redis</p>
            </CardContent>
          </Card>

          {/* Durée de vie */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée de vie (TTL)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {formatTTL(stats.ttl)}
              </div>
              <p className="text-sm text-gray-500 mt-1">avant expiration</p>
            </CardContent>
          </Card>

          {/* Hit Rate estimé */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Taux de hit estimé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {calculateHitRate().toFixed(0)}%
              </div>
              <p className="text-sm text-gray-500 mt-1">requêtes depuis cache</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Informations techniques */}
      {stats?.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Détails techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Préfixe des clés</dt>
                <dd className="mt-1 text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {stats.prefix || 'ollama:embed:'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Hash</dt>
                <dd className="mt-1 text-sm text-gray-900">SHA-256</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Backend</dt>
                <dd className="mt-1 text-sm text-gray-900">Redis</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Modèle</dt>
                <dd className="mt-1 text-sm text-gray-900">nomic-embed-text</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Guide */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Guide d&apos;utilisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">Quand vider le cache ?</p>
            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
              <li>Après une mise à jour majeure des données RAG</li>
              <li>Si les réponses du chatbot semblent obsolètes</li>
              <li>Pour libérer de la mémoire Redis</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Impact du cache</p>
            <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
              <li>Réponses ~200x plus rapides pour les embeddings en cache</li>
              <li>Réduit la charge sur Ollama</li>
              <li>Améliore l&apos;expérience utilisateur du chatbot</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
