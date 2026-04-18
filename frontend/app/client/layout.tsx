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
import { useLanguage } from '@/contexts/LanguageContext';
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
  labelKey: string;
  href: string;
  icon: React.ReactNode;
}

const CLIENT_NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.clientDashboard', href: '/client/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { labelKey: 'nav.clientVehicles', href: '/client/vehicles', icon: <Car className="w-4 h-4" /> },
  { labelKey: 'nav.clientHistory', href: '/client/vehicle-history', icon: <FileText className="w-4 h-4" /> },
  { labelKey: 'nav.clientCatalog', href: '/client/catalog', icon: <Wrench className="w-4 h-4" /> },
  { labelKey: 'nav.clientPromotions', href: '/client/promotions', icon: <Tag className="w-4 h-4" /> },
  { labelKey: 'nav.clientOrders', href: '/client/orders', icon: <ShoppingBag className="w-4 h-4" /> },
  { labelKey: 'nav.clientAppointments', href: '/client/rendez-vous', icon: <Calendar className="w-4 h-4" /> },
  { labelKey: 'nav.clientDocuments', href: '/client/documents', icon: <FileText className="w-4 h-4" /> },
  { labelKey: 'nav.clientChatbot', href: '/client/chatbot', icon: <MessageCircle className="w-4 h-4" /> },
  { labelKey: 'nav.clientAssistance', href: '/client/assistance', icon: <HelpCircle className="w-4 h-4" /> },
  { labelKey: 'nav.clientFeedback', href: '/client/feedback', icon: <Star className="w-4 h-4" /> },
  { labelKey: 'nav.clientComplaints', href: '/client/complaints', icon: <AlertCircle className="w-4 h-4" /> },
  { labelKey: 'nav.clientProfile', href: '/client/profile', icon: <User className="w-4 h-4" /> },
];

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const { t } = useLanguage();

  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/35 dark:bg-rose-500/15 dark:text-rose-300'
          : 'text-slate-600 dark:text-white/60 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white'
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-rose-500" />
      )}
      <span className={isActive
        ? 'text-rose-500 dark:text-rose-300'
        : 'text-slate-400 transition-colors group-hover:text-slate-600 dark:text-white/40 dark:group-hover:text-white/70'
      }>
        {item.icon}
      </span>
      <span>{t(item.labelKey)}</span>
      {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-rose-400 dark:text-rose-300/80" />}
    </Link>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#070c14]">
      {/* Logo */}
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
          <div>
            <p className="text-sm font-bold tracking-[0.18em] text-slate-900 dark:text-white">STA CHERY</p>
            <p className="mt-0.5 text-[0.62rem] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">{t('nav.clientSpace')}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-slate-200 dark:bg-white/[0.08]" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {CLIENT_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <div key={item.href} onClick={onLinkClick}>
              <SidebarLink item={item} isActive={isActive} />
            </div>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-slate-200 dark:bg-white/[0.08]" />

      {/* User Footer */}
      {user && (
        <div className="space-y-3 px-4 py-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-xs font-bold text-white">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">{user.prenom} {user.nom}</p>
              <p className="truncate text-[0.65rem] text-slate-400 dark:text-white/40">{user.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-100 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-300"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

function ClientSidebar() {
  return (
    <aside className="hidden min-h-screen w-[250px] shrink-0 lg:flex lg:flex-col">
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

      <SheetContent side="left" className="w-[250px] border-0 p-0">
        <SidebarContent onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isLoggingOut } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !isLoggingOut && (!user || user.role !== 'CLIENT')) {
      window.location.href = '/unauthorized';
    }
  }, [user, isLoading, isLoggingOut]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#070c14]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#f33e49]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#f33e49] animate-spin" />
          </div>
          <p className="text-slate-400 dark:text-white/50 text-sm tracking-widest uppercase">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'CLIENT') return null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070c14] dark:text-white">
      <ClientSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3.5 backdrop-blur-lg dark:border-white/[0.07] dark:bg-[#070c14]/90">
          <div className="flex items-center gap-3">
            <ClientMobileMenu />
            <span className="text-sm font-semibold tracking-wide text-slate-800 dark:text-white lg:hidden">STA Chery</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <LanguageSelector />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <PhoneVerificationBanner />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
