'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
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
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-green-950 text-white p-6 min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
        <p className="text-sm text-green-300">Direction</p>
      </div>

      <Separator className="mb-6 bg-green-900" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {DIRECTION_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-green-200 hover:bg-green-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6 bg-green-900" />

      {/* User Info */}
      {user && (
        <div className="mb-6 px-4 py-3 bg-green-900 rounded-lg">
          <p className="text-sm text-green-300">Connecté en tant que</p>
          <p className="font-semibold text-white truncate">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-green-400">{user.email}</p>
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

function DirectionMobileMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <button className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-900 hover:bg-slate-100 hover:text-slate-900">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
            <p className="text-sm text-slate-600">Direction</p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-2 p-4">
            {DIRECTION_NAV_ITEMS.map((item) => {
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

export default function DirectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'DIRECTION')) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'DIRECTION') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DirectionSidebar />

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-950">STA Chery - Direction</h1>
          <DirectionMobileMenu />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
