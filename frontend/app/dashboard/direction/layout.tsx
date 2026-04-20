'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import LanguageSelector from '@/components/LanguageSelector';
import {
  LayoutDashboard,
  BarChart3,
  Building2,
  FileText,
  Users,
  TrendingUp,
  Menu,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const DIRECTION_NAV_ITEMS: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard/direction',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Statistiques globales',
    href: '/dashboard/direction/statistics',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Vue des agences',
    href: '/dashboard/direction/agencies',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    label: 'Rapports de performance',
    href: '/dashboard/direction/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Vue du personnel',
    href: '/dashboard/direction/staff',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Revenus & Facturation',
    href: '/dashboard/direction/billing',
    icon: <TrendingUp className="w-5 h-5" />,
  },
];

function DirectionSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // No need to call router.replace - logout() handles the redirect
  };

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-white/[0.08] dark:bg-[#070c14] lg:flex">
      {/* Logo */}
      <div className="mb-6 px-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">STA Chery</h1>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-white/45">Direction</p>
          </div>
          <LanguageSelector />
        </div>
      </div>

      <Separator className="mb-4 bg-slate-200 dark:bg-white/[0.08]" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-1">
        {DIRECTION_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/35 dark:bg-rose-500/15 dark:text-rose-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/[0.06] dark:hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto h-4 w-4 text-rose-400 dark:text-rose-300/80" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4 bg-slate-200 dark:bg-white/[0.08]" />

      {/* User Info */}
      {user && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-white/45">Connecte en tant que</p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {user.prenom} {user.nom}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-white/50">{user.email}</p>
        </div>
      )}

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        className="w-full items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </Button>
    </aside>
  );
}

function DirectionMobileMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // No need to call router.replace - logout() handles the redirect
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-900 transition hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-wide text-slate-900">STA Chery</h1>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Direction</p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-1 p-4">
            {DIRECTION_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'border border-rose-200 bg-rose-50 text-rose-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {user && (
            <div className="p-4 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Connecte en tant que</p>
                <p className="text-sm font-semibold text-slate-900">
                  {user.prenom} {user.nom}
                </p>
              </div>

              <Button
                onClick={handleLogout}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function DirectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isLoggingOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'DIRECTION')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#070c14]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'DIRECTION') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070c14]">
      <DirectionSidebar />

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#070c14] lg:hidden">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white">STA Chery - Direction</h1>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <DirectionMobileMenu />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
