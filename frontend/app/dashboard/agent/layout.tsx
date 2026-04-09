'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import NotificationBell from '@/components/NotificationBell';
import {
  LayoutDashboard,
  Wrench,
  Search,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Menu,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const AGENT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard/agent',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Toutes les commandes',
    href: '/dashboard/agent/repair-orders',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Inspection de véhicule',
    href: '/dashboard/agent/vehicle-inspection',
    icon: <Search className="w-5 h-5" />,
  },
  {
    label: 'Mes clients',
    href: '/dashboard/agent/clients',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Rendez-vous',
    href: '/dashboard/agent/appointments',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: 'Catalogue',
    href: '/dashboard/agent/catalog',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Réclamations',
    href: '/dashboard/agent/complaints',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    label: 'Statistiques',
    href: '/dashboard/agent/statistics',
    icon: <BarChart3 className="w-5 h-5" />,
  },
];

function AgentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // No need to call router.replace - logout() handles the redirect
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-blue-900 text-white p-6 min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
        <p className="text-sm text-blue-300">Agent</p>
      </div>

      <Separator className="mb-6 bg-blue-800" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {AGENT_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-blue-200 hover:bg-blue-800'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6 bg-blue-800" />

      {/* User Info */}
      {user && (
        <div className="mb-6 px-4 py-3 bg-blue-800 rounded-lg">
          <p className="text-sm text-blue-300">Connecté en tant que</p>
          <p className="font-semibold text-white truncate">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-blue-400">{user.email}</p>
        </div>
      )}

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="destructive"
        className="w-full flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </Button>
    </div>
  );
}

function AgentMobileMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // No need to call router.replace - logout() handles the redirect
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-900 hover:bg-slate-100 hover:text-slate-900">
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
            <p className="text-sm text-slate-600">Agent</p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-2 p-4">
            {AGENT_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Separator />

          {user && (
            <div className="p-4 space-y-4">
              <div className="px-4 py-3 bg-slate-100 rounded-lg">
                <p className="text-sm text-slate-600">Connecté en tant que</p>
                <p className="font-semibold text-slate-900">
                  {user.prenom} {user.nom}
                </p>
              </div>

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
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

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isLoggingOut } = useAuth();

  useEffect(() => {
    console.log('AgentLayout: Checking auth', { isLoading, isLoggingOut, user: user?.role });
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'AGENT')) {
      console.log('AgentLayout: Unauthorized, redirecting to /unauthorized');
      window.location.href = '/unauthorized';
    } else if (!isLoading && user) {
      console.log('AgentLayout: User authorized', user.role);
    }
  }, [user, isLoading, isLoggingOut]);

  if (isLoading) {
    console.log('AgentLayout: Loading...');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'AGENT') {
    console.log('AgentLayout: No user or wrong role, returning null');
    return null;
  }

  console.log('AgentLayout: Rendering layout');
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AgentSidebar />

      <div className="flex-1 flex flex-col">
        {/* Desktop Header with Notifications */}
        <div className="hidden lg:flex bg-white border-b p-4 items-center justify-end">
          <NotificationBell />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-900">STA Chery - Agent</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <AgentMobileMenu />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
