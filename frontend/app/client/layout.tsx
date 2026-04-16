'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Calendar,
  FileText,
  User,
  Menu,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Tag,
  HelpCircle,
  Star,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const CLIENT_NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', href: '/client/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Mes véhicules',   href: '/client/vehicles',   icon: <Car className="w-4 h-4" /> },
  { label: 'Catalogue',       href: '/client/catalog',    icon: <Wrench className="w-4 h-4" /> },
  { label: 'Promotions',      href: '/client/promotions', icon: <Tag className="w-4 h-4" /> },
  { label: 'Mes commandes',   href: '/client/orders',     icon: <ShoppingBag className="w-4 h-4" /> },
  { label: 'Rendez-vous',     href: '/client/rendez-vous',icon: <Calendar className="w-4 h-4" /> },
  { label: 'Mes documents',   href: '/client/documents',  icon: <FileText className="w-4 h-4" /> },
  { label: 'Assistant SAV',   href: '/client/chatbot',    icon: <MessageCircle className="w-4 h-4" /> },
  { label: 'Assistance',      href: '/client/assistance', icon: <HelpCircle className="w-4 h-4" /> },
  { label: 'Mes Avis',        href: '/client/feedback',   icon: <Star className="w-4 h-4" /> },
  { label: 'Réclamations',    href: '/client/complaints', icon: <AlertCircle className="w-4 h-4" /> },
  { label: 'Mon profil',      href: '/client/profile',    icon: <User className="w-4 h-4" /> },
];

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-[#f33e49]/15 text-[#f33e49] dark:text-[#ff6b74] border border-[#f33e49]/30'
          : 'text-slate-500 dark:text-white/55 hover:text-slate-800 dark:hover:text-white/90 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#f33e49] rounded-r-full" />
      )}
      <span className={isActive
        ? 'text-[#f33e49] dark:text-[#ff6b74]'
        : 'text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/70 transition-colors'
      }>
        {item.icon}
      </span>
      <span>{item.label}</span>
      {isActive && <ChevronRight className="ml-auto w-3.5 h-3.5 text-[#f33e49]/70 dark:text-[#ff6b74]/70" />}
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#070c14] border-r border-slate-200 dark:border-white/[0.07]">
      {/* Logo */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f33e49] shadow-[0_0_10px_rgba(243,62,73,0.7)]" />
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-slate-900 dark:text-white">STA CHERY</p>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 mt-0.5">Espace Client</p>
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-slate-100 dark:bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {CLIENT_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <div key={item.href} onClick={onLinkClick}>
              <SidebarLink item={item} isActive={isActive} />
            </div>
          );
        })}
      </nav>

      <div className="mx-5 h-px bg-slate-100 dark:bg-white/[0.06]" />

      {/* User Footer */}
      {user && (
        <div className="px-4 py-5 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f33e49] to-[#ff8a92] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.prenom} {user.nom}</p>
              <p className="text-[0.65rem] text-slate-400 dark:text-white/40 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#f33e49]/10 hover:bg-[#f33e49]/20 border border-[#f33e49]/20 text-[#f33e49] dark:text-[#ff6b74] text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

function ClientSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[230px] shrink-0 min-h-screen">
      <SidebarContent />
    </aside>
  );
}

function ClientMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 transition">
        <Menu className="w-5 h-5" />
      </SheetTrigger>

      <SheetContent side="left" className="w-[230px] p-0 border-0">
        <SidebarContent onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'CLIENT')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#070c14]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#f33e49]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#f33e49] animate-spin" />
          </div>
          <p className="text-slate-400 dark:text-white/50 text-sm tracking-widest uppercase">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CLIENT') return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-white">
      <ClientSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5
          bg-white/90 dark:bg-[#070c14]/90
          border-b border-slate-200 dark:border-white/[0.07]
          backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <ClientMobileMenu />
            <span className="text-slate-800 dark:text-white font-semibold tracking-wide text-sm lg:hidden">STA Chery</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
