'use client';
/**
 * DashboardLayout — Topbar pour l'agent SAV
 */

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationsBell from './NotificationsBell';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { id: 'summary',       label: 'Tableau de bord',  icon: '◈' },
  { id: 'appointments',  label: 'Rendez-vous',       icon: '📅' },
  { id: 'vehicles',      label: 'Véhicules',          icon: '🚗' },
  { id: 'complaints',    label: 'Réclamations',       icon: '⚠️' },
  { id: 'statistics',    label: 'Statistiques',       icon: '📊' },
];

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardLayout({ children, activeTab, onTabChange }: Props) {
  const { user, logout } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden font-sans flex flex-col">
        {/* Topbar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3
          bg-slate-900/80 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-white font-semibold text-sm">
                {NAV.find(n => n.id === activeTab)?.label ?? 'Dashboard'}
              </h1>
              <p className="text-slate-500 text-xs capitalize">{dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-xs">En ligne</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
    </div>
  );
}
