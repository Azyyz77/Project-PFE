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
  Tag,
  Receipt,
  LayoutGrid,
  Info,
  ChevronRight,
  Bell,
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
      { labelKey: 'nav.clientCatalog', href: '/client/catalog', icon: <LayoutGrid className="h-5 w-5" /> },
      { labelKey: 'nav.clientPromotions', href: '/client/promotions-vehicules', icon: <Tag className="h-5 w-5" /> },
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
    ],
  },
];

function SidebarLink({ item, isActive, badgeCount }: { item: NavItem; isActive: boolean; badgeCount?: number }) {
  const { t } = useLanguage();
  const shouldShowBadge = typeof badgeCount === 'number' && badgeCount > 0;

  return (
    <Link href={item.href} className="relative block group">
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-900/20'
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
      >
        <span className={`${isActive ? 'text-white' : 'group-hover:text-red-400 transition-colors'}`}>
          {item.icon}
        </span>
        <span className="flex-1 text-sm font-medium tracking-wide">
          {t(item.labelKey)}
        </span>
        
        {shouldShowBadge && (
          <Badge className="h-5 min-w-[20px] rounded-full bg-white text-red-600 px-1.5 text-[10px] font-bold">
            {badgeCount}
          </Badge>
        )}

        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        
        {!isActive && (
          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </motion.div>
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
    <div className="flex h-full flex-col bg-[#0b1221] text-slate-300 border-r border-white/5">
      {/* Logo Section */}
      <div className="px-8 py-10">
        <Link href="/client/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-red-600/20 blur-sm group-hover:bg-red-600/40 transition-all duration-300" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-xl shadow-red-900/30">
              <Car className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tighter text-white uppercase">
              STA <span className="text-red-500">Chery</span>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t('nav.clientSpace')}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-8 scrollbar-none">
        {navSections.map((section, idx) => (
          <motion.div 
            key={section.titleKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3 className="mb-4 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600">
              {t(section.titleKey)}
            </h3>
            <div className="space-y-1.5">
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

      {/* Footer / Logout */}
      <div className="p-6">
        <div className="rounded-3xl bg-white/5 p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/10 py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-600 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
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
      <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 lg:hidden focus:outline-none">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] border-0 bg-[#0b1221] p-0">
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
      <div className="flex min-h-screen items-center justify-center bg-[#0b1221]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-3xl border-4 border-red-500/20 animate-pulse" />
            <div className="absolute inset-0 animate-spin rounded-3xl border-4 border-t-red-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/40">{t('common.loading')}</p>
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
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-[280px] shrink-0 lg:block">
        <SidebarContent badgeCounts={badgeCounts} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-5">
          {/* Glassmorphism Header Background */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 -z-10" />
          
          <div className="flex items-center gap-6">
            <ClientMobileMenu />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t('common.client')} • {user.prenom} {user.nom}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar - Aesthetic only for now */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100/50 border border-slate-200 text-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500/20 transition-all duration-300">
              <Search className="h-4 w-4" />
              <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-xs w-40 font-medium" />
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <NotificationBell />
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1" />

            <Link href="/client/profile" className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm transition-transform group-hover:scale-95">
                <span className="text-sm font-black text-red-600 uppercase">
                  {user.prenom?.[0]}{user.nom?.[0]}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <PhoneVerificationBanner />
          
          <div className="max-w-[1600px] mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        </main>
      </div>
    </div>
  );
}
