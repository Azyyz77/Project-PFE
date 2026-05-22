'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PhoneVerificationBanner } from '@/components/PhoneVerificationBanner';
import NotificationBell from '@/components/NotificationBell';
import LanguageSelector from '@/components/LanguageSelector';
import { Badge } from '@/components/ui/badge';
import { fetchClientComplaints } from '@/lib/api/clientDashboard';
import { getMyAppointments } from '@/lib/api/appointments';
import {
  LayoutDashboard,
  Car,
  Calendar,
  FileText,
  User,
  Menu,
  LogOut,
  Star,
  AlertCircle,
  MessageCircle,
  Clock,
  Settings,
  LifeBuoy,
  Tag,
  Receipt,
  LayoutGrid,
  Info,
  ShoppingBag,
} from 'lucide-react';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeKey?: 'appointments' | 'complaints';
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const getNavSections = (): NavSection[] => [
  {
    titleKey: 'PRINCIPAL',
    items: [
      { labelKey: 'nav.clientDashboard', href: '/client/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { labelKey: 'nav.clientVehicles', href: '/client/vehicles', icon: <Car className="h-4 w-4" /> },
      { labelKey: 'nav.clientAppointments', href: '/client/rendez-vous', icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    titleKey: 'SUIVI',
    items: [
      { labelKey: 'nav.clientHistory', href: '/client/vehicle-history', icon: <Clock className="h-4 w-4" /> },
      { labelKey: 'nav.clientRepairOrders', href: '/client/repair-orders', icon: <FileText className="h-4 w-4" /> },
      { labelKey: 'nav.clientCatalog', href: '/client/catalog', icon: <LayoutGrid className="h-4 w-4" /> },
      { labelKey: 'invoices.title', href: '/client/invoices', icon: <Receipt className="h-4 w-4" /> },
    ],
  },
  {
    titleKey: 'AUTRES',
    items: [
      { labelKey: 'nav.clientInformations', href: '/client/informations', icon: <Info className="h-4 w-4" /> },
      { labelKey: 'nav.clientDocuments', href: '/client/documents', icon: <FileText className="h-4 w-4" /> },
      { labelKey: 'nav.clientComplaints', href: '/client/complaints', icon: <AlertCircle className="h-4 w-4" />, badgeKey: 'complaints' },
      { labelKey: 'nav.clientChatbot', href: '/client/chatbot', icon: <MessageCircle className="h-4 w-4" /> },
      { labelKey: 'nav.client.inspiration', href:'/client/vehicle-inspection', icon: <MessageCircle className="h-4 w-4" />  },
      { labelKey: 'nav.clientFeedback', href: '/client/feedback', icon: <Star className="h-4 w-4" /> },
      { labelKey: 'nav.clientProfile', href: '/client/profile', icon: <User className="h-4 w-4" /> },
    ],
  },
];

function SidebarLink({ item, isActive, badgeCount }: { item: NavItem; isActive: boolean; badgeCount?: number }) {
  const { t } = useLanguage();
  const shouldShowBadge = typeof badgeCount === 'number' && badgeCount > 0;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-sm transition-all duration-300 transform hover:scale-[1.02] ${
        isActive
          ? 'bg-gradient-to-r from-[#1b355d] to-[#1f3d6b] text-white font-medium shadow-[0_10px_20px_rgba(12,28,52,0.35)] scale-[1.02]'
          : 'text-slate-300 hover:bg-[#17325a] hover:text-white hover:shadow-lg'
      }`}
    >
      <span
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-red-500 to-red-600 transition-all duration-300 ${
          isActive ? 'opacity-100 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'opacity-0 group-hover:opacity-60'
        }`}
      />
      <span className={`transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-white'}`}>
        {item.icon}
      </span>
      <span className="flex-1 whitespace-nowrap">{t(item.labelKey)}</span>
      {shouldShowBadge && (
        <Badge className="h-5 min-w-[20px] rounded-full bg-gradient-to-r from-red-500 to-red-600 px-1.5 text-[10px] font-bold text-white shadow-lg animate-pulse">
          {badgeCount}
        </Badge>
      )}
    </Link>
  );
}

function SidebarContent({
  onLinkClick,
  badgeCounts,
}: {
  onLinkClick?: () => void;
  badgeCounts?: { appointments: number; complaints: number };
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navSections = getNavSections();

  return (
    <div className="client-sidebar flex h-full flex-col bg-[#0f2543]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1a3559] transition-all duration-300 hover:bg-[#132a4a]">
        <div className="flex h-14 w-24 items-center justify-center shrink-0 transform transition-transform duration-300 hover:scale-105">
          <img src="/chery-logo-clean.png" alt="Chery" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-base font-bold text-white whitespace-nowrap">STA Chery</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-400 whitespace-nowrap">ESPACE CLIENT</p>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-4 border-b border-[#1a3559] transition-all duration-300 hover:bg-[#132a4a]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-lg transform transition-transform duration-300 hover:scale-110">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.prenom} {user.nom}</p>
              <p className="text-xs text-slate-400">{t('common.client')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="client-sidebar-scroll flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.titleKey}>
            <h3 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {t(section.titleKey)}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const badgeCount = item.badgeKey ? badgeCounts?.[item.badgeKey] : item.badge;
                return (
                  <div key={item.href} onClick={onLinkClick}>
                    <SidebarLink item={item} isActive={isActive} badgeCount={badgeCount} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      {user && (
        <div className="border-t border-[#1a3559] p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-white transform hover:scale-[1.02] hover:shadow-lg"
          >
            <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ClientSidebar() {
  const { user, token } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState({ appointments: 0, complaints: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      if (!user || !token || user.role !== 'CLIENT') return;
      try {
        const [appointmentsData, complaintsData] = await Promise.all([
          getMyAppointments(token),
          fetchClientComplaints(token),
        ]);
        setBadgeCounts({
          appointments: appointmentsData.length,
          complaints: complaintsData.length,
        });
      } catch (error) {
        console.error('Error loading client sidebar counts:', error);
      }
    };

    loadCounts();
  }, [user, token]);

  return (
    <aside className="hidden h-screen w-[240px] shrink-0 overflow-hidden bg-[#0f2543] lg:flex lg:flex-col">
      <SidebarContent badgeCounts={badgeCounts} />
    </aside>
  );
}

function ClientMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState({ appointments: 0, complaints: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      if (!user || !token || user.role !== 'CLIENT') return;
      try {
        const [appointmentsData, complaintsData] = await Promise.all([
          getMyAppointments(token),
          fetchClientComplaints(token),
        ]);
        setBadgeCounts({
          appointments: appointmentsData.length,
          complaints: complaintsData.length,
        });
      } catch (error) {
        console.error('Error loading client mobile sidebar counts:', error);
      }
    };

    loadCounts();
  }, [user, token]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden">
        <Menu className="h-5 w-5" />
      </SheetTrigger>

      <SheetContent side="left" className="h-full w-[240px] border-0 bg-[#0f2543] p-0">
        <SidebarContent onLinkClick={() => setIsOpen(false)} badgeCounts={badgeCounts} />
      </SheetContent>
    </Sheet>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'CLIENT')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

  useEffect(() => {
    setIsPageReady(false);
    const id = requestAnimationFrame(() => setIsPageReady(true));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-red-500" />
          </div>
          <p className="text-sm uppercase tracking-widest text-slate-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CLIENT') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">
      <ClientSidebar />

      <div className="flex min-w-0 flex-1 flex-col min-h-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 py-3.5 shadow-sm">
          <div className="flex items-center gap-4">
            <ClientMobileMenu />
            <div className="leading-tight">
              <h1 className="text-base font-semibold text-slate-700">{t('nav.dashboard')}</h1>
              <p className="text-xs text-slate-500">{t('common.client')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <NotificationBell />

            <div className="h-6 w-px bg-slate-200" />

            {/* Settings Icon */}
            <button 
              type="button" 
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-300 hover:scale-110 hover:rotate-90"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* User Avatar */}
            <Link href="/client/profile">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-12">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <PhoneVerificationBanner />
          <div
            key={pathname}
            className={`client-page-transition client-page-stagger ${isPageReady ? 'client-page-enter' : 'opacity-0'}`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
