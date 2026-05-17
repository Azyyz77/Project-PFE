'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import NotificationBell from '@/components/NotificationBell';
import ModerationNotification from '@/components/ModerationNotification';
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
  Shield,
  AlertTriangle,
  Info,
  CalendarDays,
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
    label: 'Gérer les ouvriers',
    href: '/dashboard/admin/workers',
    icon: <Wrench className="w-5 h-5" />,
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
    label: 'Planning',
    href: '/dashboard/admin/planning',
    icon: <CalendarDays className="w-5 h-5" />,
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
    label: 'Problèmes prédéfinis',
    href: '/dashboard/admin/problems',
    icon: <AlertTriangle className="w-5 h-5" />,
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
    label: 'Modération fichiers',
    href: '/dashboard/admin/moderation',
    icon: <Shield className="w-5 h-5" />,
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
    label: 'Informations',
    href: '/dashboard/admin/information',
    icon: <Info className="w-5 h-5" />,
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
    label: 'Logs d\'audit',
    href: '/dashboard/admin/audit',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    label: 'Paramètres',
    href: '/dashboard/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

const ADMIN_NAV_GROUPS = [
  {
    label: 'Gestion opérationnelle',
    items: ADMIN_NAV_ITEMS.slice(0, 7),
  },
  {
    label: 'Référentiel services',
    items: ADMIN_NAV_ITEMS.slice(7, 18),
  },
  {
    label: 'Suivi et paramètres',
    items: ADMIN_NAV_ITEMS.slice(18),
  },
];

function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="relative hidden lg:flex flex-col w-72 bg-white text-slate-800 p-6 min-h-screen border-r border-slate-200/80 overflow-y-auto">
      {/* Brand Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">
            C
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-orange-600">STA CHERY</p>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">Espace Admin</h1>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">Gestion concession & SAV Tunisie</p>
      </div>

      <Separator className="mb-6 bg-slate-100" />

      {/* Navigation */}
      <nav className="flex-1 space-y-6">
        {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
          <div key={group.label} className="space-y-2">
            <p className="px-3 text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item, index) => {
                const isActive = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: (groupIndex * 0.04) + (index * 0.02) }}
                  >
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 font-semibold border border-orange-200/30'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={`transition-colors duration-150 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-orange-500" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 space-y-4">
          {user && (
            <div className="px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Session Active</p>
              <p className="font-semibold text-slate-800 truncate mt-1 text-sm">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] text-orange-700 font-medium">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Administrateur
              </div>
            </div>
          )}

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 hover:border-rose-200 rounded-xl"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
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
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50"
        aria-label="Ouvrir le menu administrateur"
        title="Ouvrir le menu"
      >
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 bg-white text-slate-800 border-slate-200 overflow-y-auto">
        <div className="flex flex-col h-full p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tighter">
                C
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-orange-600">STA CHERY</p>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">Espace Admin</h1>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Gestion concession & SAV</p>
          </div>

          <Separator className="mb-4 bg-slate-100" />

          <nav className="flex-1 space-y-6">
            {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
              <div key={group.label} className="space-y-2">
                <p className="px-3 text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((item, index) => {
                    const isActive = pathname === item.href;

                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15, delay: (groupIndex * 0.04) + (index * 0.02) }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                            isActive
                              ? 'bg-orange-50 text-orange-600 font-semibold border border-orange-200/30'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className={`transition-colors duration-150 ${isActive ? 'text-orange-600' : 'text-slate-400'}`}>
                            {item.icon}
                          </span>
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-4">
              {user && (
                <div className="px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <p className="font-semibold text-slate-800 truncate text-sm">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                </div>
              )}

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 hover:border-rose-200 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2 text-slate-400" />
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const hour = new Date().getHours();
  const salutation = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white border-b border-slate-200/80 px-8 py-5 items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Espace d'administration</p>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">Pilotage du système</h2>
            <p className="text-xs text-slate-500 mt-1">{salutation}, {user.prenom}. Ravi de vous revoir.</p>
          </div>
          <div className="flex items-center gap-3">
            <ModerationNotification />
            <NotificationBell />
            <Link
              href="/dashboard/admin/settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              aria-label="Paramètres administrateur"
              title="Paramètres administrateur"
            >
              <User className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={handleQuickLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              aria-label="Déconnexion"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">STA Chery</h1>
            <p className="text-xs text-slate-500">{salutation}, {user.prenom}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <ModerationNotification />
            <NotificationBell />
            <AdminMobileMenu />
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            className="flex-1 overflow-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
