'use client';
/**
 * Universal DashboardLayout — Sidebar + Topbar for all user roles
 * Supports: CLIENT, AGENT, ADMIN, DIRECTION
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarLinks } from '@/config/sidebarConfig';
import NotificationsBell from '@/components/agent-dashboard/NotificationsBell';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

/**
 * Get role label for display in the sidebar
 */
function getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrateur';
    case 'AGENT':
      return 'Agent SAV';
    case 'DIRECTION':
      return 'Direction';
    case 'CLIENT':
      return 'Client';
    default:
      return 'Utilisateur';
  }
}

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = `${user?.prenom.charAt(0)}${user?.nom.charAt(0) || ''}`.toUpperCase();
  const navItems = getSidebarLinks(user?.role || 'CLIENT');
  const roleLabel = getRoleLabel(user?.role || 'CLIENT');

  return (
    <div className="w-72 bg-[#0c2c5d] h-full flex flex-col overflow-hidden border-r border-blue-900/50">
      {/* Logo Section */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            S
          </div>
          <div>
            <h1 className="text-white font-bold text-base">STA Chery</h1>
            <p className="text-blue-300 text-xs font-medium">Tunisia</p>
          </div>
        </div>
        <div className="mt-3 bg-blue-900/30 rounded-lg p-3">
          <p className="text-blue-100 font-medium text-sm">{user?.prenom} {user?.nom}</p>
          <p className="text-blue-300 text-xs mt-1">{roleLabel}</p>
        </div>
      </div>

      <Separator className="bg-blue-800/30 opacity-100" />

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2 my-4">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white border-l-4 border-orange-400'
                  : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-blue-800/30 opacity-100 mb-3" />

      {/* User Profile & Logout */}
      <div className="p-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-blue-100 font-medium text-sm truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-blue-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={() => logout()}
          variant="ghost"
          size="sm"
          className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}

function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getPageTitle = () => {
    const navItems = getSidebarLinks(user?.role || 'CLIENT');
    const item = navItems.find((i: any) => pathname === i.href || pathname.startsWith(i.href + '/'));
    return item?.label || 'Dashboard';
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const initials = `${user?.prenom.charAt(0)}${user?.nom.charAt(0) || ''}`.toUpperCase();

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="hidden md:flex items-center gap-3">
        <div>
          <h1 className="text-white font-semibold text-sm">{getPageTitle()}</h1>
          <p className="text-slate-500 text-xs capitalize">{dateStr}</p>
        </div>
      </div>

      <div className="md:hidden flex-1" />

      <div className="flex items-center gap-4">
        <NotificationsBell />
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 text-xs">En ligne</span>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Desktop Sidebar - only visible on lg screens */}
      <div className="hidden lg:block w-72 flex-shrink-0 bg-[#0c2c5d] border-r border-blue-900/50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header with Menu */}
        <div className="lg:hidden flex items-center gap-4 h-14 px-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 shrink-0">
          <Sheet>
            <SheetTrigger >
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Menu className="w-6 h-6 text-slate-400 hover:text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-0 bg-[#0c2c5d]">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="text-slate-400 text-sm font-medium">Menu</span>
        </div>

        {/* Topbar */}
        <Topbar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
