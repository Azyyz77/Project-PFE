'use client';
/**
 * DashboardLayout — Sidebar + topbar pour l'agent SAV
 */

import { useState, useEffect } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      <aside
        className={`flex flex-col shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
            S
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">STA Chery</p>
              <p className="text-slate-400 text-xs">Agent SAV</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.prenom} {user?.nom}</p>
                <p className="text-slate-500 text-xs truncate">{user?.email}</p>
              </div>
              <button onClick={logout} title="Déconnexion" className="text-slate-500 hover:text-red-400 transition-colors text-base">⊗</button>
            </div>
          ) : (
            <button onClick={logout} title="Déconnexion"
              className="w-full flex items-center justify-center py-2 text-slate-500 hover:text-red-400 transition-colors">
              ⊗
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3
          bg-slate-900/80 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white transition-colors text-xl"
            >
              ☰
            </button>
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
    </div>
  );
}
