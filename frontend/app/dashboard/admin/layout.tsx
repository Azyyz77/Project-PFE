'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import NotificationBell from '@/components/NotificationBell';
import { AnimatePresence, motion } from 'framer-motion';
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
  MessageSquare,
  Sparkles,
  User,
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
    label: 'Types d\'intervention',
    href: '/dashboard/admin/intervention-types',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Sous-types',
    href: '/dashboard/admin/sub-types',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Marques et modèles',
    href: '/dashboard/admin/brands-models',
    icon: <Car className="w-5 h-5" />,
  },
  {
    label: 'Couleurs',
    href: '/dashboard/admin/colors',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: 'Packages',
    href: '/dashboard/admin/packages',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: 'Plages horaires',
    href: '/dashboard/admin/timeslots',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: 'Documents',
    href: '/dashboard/admin/documents',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Feedbacks',
    href: '/dashboard/admin/feedbacks',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    label: 'Promotions',
    href: '/dashboard/admin/promotions',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    label: 'Publier messages',
    href: '/dashboard/admin/messages',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    label: 'Rapports',
    href: '/dashboard/admin/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Statuts',
    href: '/dashboard/admin/statuses',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: 'Permissions',
    href: '/dashboard/admin/permissions',
    icon: <User className="w-5 h-5" />,
  },
  {
    label: 'Paramètres',
    href: '/dashboard/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

const ADMIN_NAV_GROUPS = [
  {
    label: 'Gestion operationnelle',
    items: ADMIN_NAV_ITEMS.slice(0, 5),
  },
  {
    label: 'Referentiel services',
    items: ADMIN_NAV_ITEMS.slice(5, 15),
  },
  {
    label: 'Suivi et parametres',
    items: ADMIN_NAV_ITEMS.slice(15),
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // No need to call router.replace - logout() handles the redirect
  };

  return (
    <div className="relative hidden lg:flex flex-col w-72 bg-slate-950/95 text-white p-6 min-h-screen border-r border-slate-800 overflow-hidden">
      <div className="pointer-events-none absolute -top-28 -right-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-20 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Logo */}
      <div className="mb-8 relative z-10">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Control Center</p>
        <h1 className="text-2xl font-bold text-slate-100 mt-2">STA Chery</h1>
        <p className="text-sm text-slate-400">Administrateur</p>
      </div>

      <Separator className="mb-6 bg-slate-800" />

      {/* Navigation */}
      <nav className="flex-1 space-y-5 relative z-10">
        {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label}>
            <p className="px-2 mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((item, index) => {
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: (groupIndex * 0.06) + (index * 0.03) }}
                  >
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 overflow-hidden ${
                        isActive
                          ? 'text-cyan-100 border border-cyan-300/20 shadow-[0_0_0_1px_rgba(34,211,238,0.1)]'
                          : 'text-slate-300 hover:bg-slate-900/90 hover:translate-x-1'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="admin-active-bg-desktop"
                          className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20"
                          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{item.icon}</span>
                      <span className="relative z-10 font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="admin-active-indicator-desktop"
                          className="relative z-10 ml-auto"
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <Separator className="bg-slate-800" />

          {user && (
            <div className="mt-4 px-4 py-3 bg-slate-900 rounded-lg border border-slate-800">
              <p className="text-sm text-slate-400">Compte administrateur</p>
              <p className="font-semibold text-white truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-200">
                <Sparkles className="w-3 h-3" />
                Session admin active
              </div>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </nav>
    </div>
  );
}

function AdminMobileMenu() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // No need to call router.replace - logout() handles the redirect
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-900 hover:bg-slate-100 hover:text-slate-900"
        aria-label="Ouvrir le menu administrateur"
        title="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 bg-slate-950 text-slate-100 border-slate-800">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Control Center</p>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">STA Chery</h1>
            <p className="text-sm text-slate-400">Administrateur</p>
          </div>

          <Separator />

          <nav className="flex-1 space-y-5 p-4">
            {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
              <div key={group.label}>
                <p className="px-2 mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
                <div className="space-y-2">
                  {group.items.map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, delay: (groupIndex * 0.05) + (index * 0.02) }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 overflow-hidden ${
                            isActive
                              ? 'text-cyan-200 border border-cyan-300/20'
                              : 'text-slate-300 hover:bg-slate-900 hover:translate-x-1'
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="admin-active-bg-mobile"
                              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20"
                              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{item.icon}</span>
                          <span className="relative z-10 font-medium">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="admin-active-indicator-mobile"
                              className="relative z-10 ml-auto"
                              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Separator className="bg-slate-800" />

              {user && (
                <div className="mt-4 px-4 py-3 bg-slate-900 rounded-lg border border-slate-800">
                  <p className="text-sm text-slate-400">Compte administrateur</p>
                  <p className="font-semibold text-slate-100">
                    {user.prenom} {user.nom}
                  </p>
                </div>
              )}

              <Button
                onClick={handleLogout}
                variant="destructive"
                className="mt-4 w-full bg-rose-600 hover:bg-rose-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </nav>
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
  const { user, isLoading, isLoggingOut, logout } = useAuth();
  const pathname = usePathname();

  const handleQuickLogout = () => {
    logout();
  };

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'ADMIN')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

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

  const hour = new Date().getHours();
  const salutation = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Desktop Header with Notifications */}
        <div className="hidden lg:flex bg-slate-950/95 border-b border-slate-800 px-6 py-4 items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Administration</p>
            <h2 className="text-lg font-semibold text-slate-100">Pilotage du système</h2>
            <p className="text-sm text-cyan-300/90 mt-1">{salutation}, {user.prenom}. Ravi de vous revoir.</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link
              href="/dashboard/admin/settings"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900/70 text-slate-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
              aria-label="Compte administrateur"
              title="Compte administrateur"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleQuickLogout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-rose-500/35 bg-rose-500/10 text-rose-200 transition-colors hover:border-rose-400 hover:bg-rose-500/20"
              aria-label="Déconnexion rapide"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">STA Chery - Admin</h1>
            <p className="text-xs text-cyan-300/90">{salutation}, {user.prenom}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <AdminMobileMenu />
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            className="flex-1 overflow-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
