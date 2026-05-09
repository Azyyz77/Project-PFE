'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSummary } from '@/lib/api/agentDashboard';
import DashboardSummary from '@/components/agent-dashboard/DashboardSummary';

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();
  
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!user || !['AGENT'].includes(user.role)) {
        router.replace('/login');
      } else if (token) {
        loadSummary();
      }
    }
  }, [user, token, isLoading, router]);

  const loadSummary = async () => {
    if (!token) return;
    try {
      setLoadingSummary(true);
      setError(null);
      const data = await fetchSummary();
      setSummaryData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoadingSummary(false);
    }
  };

  if (isLoading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Erreur de connexion</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
        <button onClick={logout} className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
          Se déconnecter et retourner à la connexion
        </button>
      </div>
    );
  }

  const renderContent = () => {
    if (!token) return null;
    return loadingSummary ? (
      <div className="p-6 text-slate-400 text-center animate-pulse mt-10">Chargement de la vue d'ensemble...</div>
    ) : summaryData ? (
      <DashboardSummary data={summaryData} onRefresh={loadSummary} />
    ) : null;
  };

  return (
      <div className="p-6">
        {renderContent()}
      </div>
  );
}
