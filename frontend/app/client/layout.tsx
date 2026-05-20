'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  ShoppingBag,
  Tag,
  Receipt,
  LayoutGrid,
  Info,
  Search,
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
      { labelKey: 'nav.clientDashboard', href: '/client/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      { labelKey: 'nav.clientVehicles', href: '/client/vehicles', icon: <Car className="h-5 w-5" /> },
      { labelKey: 'nav.clientAppointments', href: '/client/rendez-vous', icon: <Calendar className="h-5 w-5" /> },
    ],
  },
  {
    titleKey: 'SUIVI',
    items: [
    { labelKey: 'nav.clientHistory', href: '/client/vehicle-history', icon: <Clock className="h-5 w-5" /> },
    { labelKey: 'nav.clientRepairOrders', href: '/client/repair-orders', icon: <FileText className="h-5 w-5" /> },
    { labelKey: 'nav.clientOrders', href: '/client/orders', icon: <ShoppingBag className="h-5 w-5" /> },
    { labelKey: 'nav.clientCatalog', href: '/client/catalog', icon: <LayoutGrid className="h-5 w-5" /> },
    { labelKey: 'nav.clientPromotions', href: '/client/promotions-vehicules', icon: <Tag className="h-5 w-5" /> },
    { labelKey: 'invoices.title', href: '/client/invoices', icon: <Receipt className="h-5 w-5" /> },
    ],
  },
  {
    titleKey: 'AUTRES',
    items: [
      { labelKey: 'nav.clientInformations', href: '/client/informations', icon: <Info className="h-5 w-5" /> },
      { labelKey: 'nav.clientDocuments', href: '/client/documents', icon: <FileText className="h-5 w-5" /> },
      { labelKey: 'nav.clientComplaints', href: '/client/complaints', icon: <AlertCircle className="h-5 w-5" />, badgeKey: 'complaints' },
      { labelKey: 'nav.clientChatbot', href: '/client/chatbot', icon: <MessageCircle className="h-5 w-5" /> },
      { labelKey: 'nav.clientProfile', href: '/client/profile', icon: <User className="h-5 w-5" /> },
      { labelKey: 'nav.clientInspection', href: '/client/vehicle-inspection', icon: <Receipt className="h-5 w-5" /> },
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
    <div className="client-sidebar flex h-full flex-col bg-[#0f2543] text-slate-100">
      <div className="border-b border-[#1a3559]">
        <Link
          href="/client/dashboard"
          className="flex items-center gap-3 px-4 py-5 transition-all duration-300 hover:bg-[#132a4a]"
        >
          <div className="flex h-14 w-24 items-center justify-center shrink-0">
            <img src="/chery-logo-clean.png" alt="Chery" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-base font-bold text-white whitespace-nowrap">STA Chery</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 whitespace-nowrap">
              {t('nav.clientSpace')}
            </p>
          </div>
        </Link>
      </div>

      {user && (
        <div className="px-4 py-4 border-b border-[#1a3559] transition-all duration-300 hover:bg-[#132a4a]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-lg">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.prenom} {user.nom}</p>
              <p className="text-xs text-slate-400">{t('common.client')}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="client-sidebar-scroll flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {navSections.map((section, idx) => (
          <motion.div
            key={section.titleKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1a3559]">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-white hover:shadow-lg"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
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
        console.error('Error loading mobile counts:', error);
      }
    };
    loadCounts();
  }, [user, token]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a3559] text-white transition-all hover:bg-[#17325a] lg:hidden focus:outline-none">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] border-0 bg-[#0f2543] p-0">
        <SidebarContent onLinkClick={() => setIsOpen(false)} badgeCounts={badgeCounts} />
      </SheetContent>
    </Sheet>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut, token } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [badgeCounts, setBadgeCounts] = useState({ appointments: 0, complaints: 0 });

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'CLIENT')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

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
        console.error('Error loading layout counts:', error);
      }
    };
    loadCounts();
  }, [user, token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-lg border-4 border-blue-500/20 animate-pulse" />
            <div className="absolute inset-0 animate-spin rounded-lg border-4 border-t-red-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/40">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CLIENT') return null;

  // Find current page title from nav items
  const allNavItems = getNavSections().flatMap(s => s.items);
  const currentItem = allNavItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'));
  const pageTitle = currentItem ? t(currentItem.labelKey) : t('nav.dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F5]">
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-[280px] shrink-0 lg:block">
        <SidebarContent badgeCounts={badgeCounts} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-[#E4E6EB] shadow-sm">
          <div className="flex items-center gap-4">
            <ClientMobileMenu />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-[#050505]">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-[#F0F2F5] text-[#65676B] focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
              <Search className="h-4 w-4" />
              <input type="text" placeholder={t('catalog.search')} className="bg-transparent border-none outline-none text-sm w-40 font-normal placeholder-[#65676B]" />
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <NotificationBell />
            </div>

            <div className="h-6 w-px bg-[#E4E6EB]" />

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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F0F2F5]">
          <PhoneVerificationBanner />
          
          <div className="max-w-[1200px] mx-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
