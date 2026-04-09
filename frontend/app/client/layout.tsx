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
  Car,
  Wrench,
  Calendar,
  FileText,
  User,
  Menu,
  LogOut,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const CLIENT_NAV_ITEMS: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/client/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Mes véhicules',
    href: '/client/vehicles',
    icon: <Car className="w-5 h-5" />,
  },
  {
    label: 'Catalogue',
    href: '/client/catalog',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Mes commandes',
    href: '/client/orders',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Rendez-vous',
    href: '/client/rendez-vous',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    label: 'Réclamations',
    href: '/client/complaints',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    label: 'Mes factures',
    href: '/client/invoices',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Mon profil',
    href: '/client/profile',
    icon: <User className="w-5 h-5" />,
  },
];

function ClientSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-950 text-white p-6 min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
        <p className="text-sm text-slate-400">Client</p>
      </div>

      <Separator className="mb-6 bg-slate-800" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {CLIENT_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6 bg-slate-800" />

      {/* User Info */}
      {user && (
        <div className="mb-6 px-4 py-3 bg-slate-900 rounded-lg">
          <p className="text-sm text-slate-400">Connecté en tant que</p>
          <p className="font-semibold text-white truncate">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-slate-500">{user.email}</p>
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

function ClientMobileMenu() {
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
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-900 hover:bg-slate-100 hover:text-slate-900">
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
            <p className="text-sm text-slate-600">Client</p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-2 p-4">
            {CLIENT_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');

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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CLIENT')) {
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

  if (!user || user.role !== 'CLIENT') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ClientSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header with Notifications */}
        <div className="bg-gradient-to-r from-red-900 to-red-950 border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <ClientMobileMenu />
            </div>
            <h1 className="text-xl font-bold text-white">STA Chery</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
