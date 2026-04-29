'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NotificationBell from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { PhoneVerificationBanner } from '@/components/PhoneVerificationBanner';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Car,
  Calendar,
  FileText,
  User,
  Menu,
  LogOut,
  ShoppingBag,
  Tag,
  HelpCircle,
  Star,
  AlertCircle,
  MessageCircle,
  Clock,
  Settings,
  Wrench,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', href: '/client/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Mes véhicules', href: '/client/vehicles', icon: <Car className="h-4 w-4" /> },
  { label: 'Historique véhicules', href: '/client/vehicle-history', icon: <Clock className="h-4 w-4" /> },
  { label: 'Catalogue', href: '/client/catalog', icon: <Wrench className="h-4 w-4" /> },
  { label: 'Promotions', href: '/client/promotions', icon: <Tag className="h-4 w-4" /> },
  { label: 'Mes commandes', href: '/client/orders', icon: <ShoppingBag className="h-4 w-4" /> },
  { label: 'Rendez-vous', href: '/client/rendez-vous', icon: <Calendar className="h-4 w-4" /> },
  { label: 'Mes documents', href: '/client/documents', icon: <FileText className="h-4 w-4" /> },
  { label: 'Assistant SAV', href: '/client/chatbot', icon: <MessageCircle className="h-4 w-4" /> },
  { label: 'Assistance', href: '/client/assistance', icon: <HelpCircle className="h-4 w-4" /> },
  { label: 'Mes Avis', href: '/client/feedback', icon: <Star className="h-4 w-4" /> },
  { label: 'Réclamations', href: '/client/complaints', icon: <AlertCircle className="h-4 w-4" /> },
  { label: 'Mon profil', href: '/client/profile', icon: <User className="h-4 w-4" /> },
];

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
        isActive
          ? 'bg-[#1b335a] text-white font-medium'
          : 'text-slate-200 hover:bg-[#132744] hover:text-white'
      }`}
    >
      <span className={isActive ? 'text-white' : 'text-slate-300'}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="client-sidebar flex h-full min-h-0 flex-col bg-[#0b1f3a] border-r border-[#0b1f3a]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[#0f2747]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
          <Car className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">STA CHERY</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-300">ESPACE CLIENT</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="client-sidebar-scroll flex-1 min-h-0 space-y-1 overflow-y-scroll px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <div key={item.href} onClick={onLinkClick}>
              <SidebarLink item={item} isActive={isActive} />
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t border-[#0f2747] p-4">
          <div className="space-y-1">
            <Link href="/client/profile">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-[#132744]">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </button>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-[#132744]"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientSidebar() {
  return (
    <aside className="hidden h-screen w-[240px] shrink-0 overflow-hidden bg-[#0b1f3a] lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}

function ClientMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left" className="h-full w-[240px] border-0 bg-[#0b1f3a] p-0">
        <SidebarContent onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'CLIENT')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-red-500" />
          </div>
          <p className="text-sm uppercase tracking-widest text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CLIENT') return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ClientSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <ClientMobileMenu />
            <h1 className="text-lg font-semibold text-slate-900">Espace Client</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <LanguageSelector />
            <ThemeToggle />

            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-slate-500">Client</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div key={pathname} className="client-page-transition">
            <PhoneVerificationBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
