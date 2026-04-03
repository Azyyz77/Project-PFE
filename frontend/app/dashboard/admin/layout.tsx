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
  Users,
  Building2,
  Car,
  Wrench,
  FileText,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Gérer les utilisateurs',
    href: '/dashboard/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'Gérer les agences',
    href: '/dashboard/admin/agencies',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    label: 'Tous les véhicules',
    href: '/dashboard/admin/vehicles',
    icon: <Car className="w-5 h-5" />,
  },
  {
    label: 'Toutes les commandes',
    href: '/dashboard/admin/orders',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Rapports',
    href: '/dashboard/admin/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Paramètres',
    href: '/dashboard/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-red-950 text-white p-6 min-h-screen">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-orange-400">STA Chery</h1>
        <p className="text-sm text-red-300">Administrateur</p>
      </div>

      <Separator className="mb-6 bg-red-900" />

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-red-200 hover:bg-red-900'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-6 bg-red-900" />

      {/* User Info */}
      {user && (
        <div className="mb-6 px-4 py-3 bg-red-900 rounded-lg">
          <p className="text-sm text-red-300">Connecté en tant que</p>
          <p className="font-semibold text-white truncate">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-red-400">{user.email}</p>
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

function AdminMobileMenu() {
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
            <p className="text-sm text-slate-600">Administrateur</p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-2 p-4">
            {ADMIN_NAV_ITEMS.map((item) => {
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
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

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-950">STA Chery - Admin</h1>
          <AdminMobileMenu />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
