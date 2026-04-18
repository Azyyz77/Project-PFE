'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getVehiclesByUser } from '@/lib/api/vehicles';
import { Vehicle } from '@/types/vehicle';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Car,
  Mail,
  Phone,
  Hash,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}

/* ─── Stat Chip ─── */
function StatChip({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="flex-1 rounded-xl bg-white/10 dark:bg-white/[0.07] backdrop-blur-sm px-4 py-3 text-center border border-white/20 dark:border-white/10">
      <p className={`text-2xl font-bold ${accent ? 'text-amber-300' : 'text-white'}`}>{value}</p>
      <p className="text-[0.7rem] text-white/65 dark:text-white/60 mt-0.5 uppercase tracking-widest">{label}</p>
    </div>
  );
}

/* ─── Quick-action card ─── */
function ActionCard({
  href, emoji, title, sub, cta,
  darkFrom, darkTo, darkBorder,
  lightFrom, lightTo, lightBorder,
  ctaDark, ctaLight,
}: {
  href: string; emoji: string; title: string; sub: string; cta: string;
  darkFrom: string; darkTo: string; darkBorder: string;
  lightFrom: string; lightTo: string; lightBorder: string;
  ctaDark: string; ctaLight: string;
}) {
  return (
    <Link href={href}>
      <div className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-6
        bg-gradient-to-br ${darkFrom} ${darkTo} ${darkBorder}
        dark:bg-gradient-to-br dark:${darkFrom} dark:${darkTo} dark:${darkBorder}
      `}
        style={{}}
      >
        <div className="text-4xl mb-4">{emoji}</div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-slate-500 dark:text-white/55 text-xs mb-5">{sub}</p>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${ctaLight} dark:${ctaDark}`}>
          <span>{cta}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

/* ─── Shared card shell ─── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0c1424] ${className}`}>
      {children}
    </div>
  );
}

/* ─── Main ─── */
function ClientDashboardContent() {
  const { user, token } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  const isClient = useMemo(() => user?.role === 'CLIENT', [user]);

  useEffect(() => {
    if (user && !isClient) router.replace('/dashboard/agent');
  }, [user, isClient, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !token || !isClient) return;
      try { setVehicles(await getVehiclesByUser(user.id, token)); }
      catch { /* silent */ }
      finally { setIsLoadingVehicles(false); }
    };
    load();
  }, [user, token, isClient]);



  if (!isClient || isLoadingVehicles) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#f33e49]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#f33e49] animate-spin" />
        </div>
      </div>
    );
  }

  const today = new Date();

  return (
    <div className="px-5 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto space-y-8">

      {/* ══ Welcome Banner ══ */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-white/[0.08] bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-[#0c1527] dark:via-[#111e35] dark:to-[#0a1120]">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-white/10 dark:bg-[#1c4a9f]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-72 w-72 rounded-full bg-white/10 dark:bg-[#f33e49]/12 blur-3xl" />

        <div className="relative p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 dark:bg-gradient-to-br dark:from-[#f33e49] dark:to-[#ff8a92] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-black/20">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-amber-300" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs uppercase tracking-[0.25em] mb-1">{t('dashboard.welcomeBack')}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
              {user?.prenom} {user?.nom} 👋
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {today.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Stats */}
          <div className="flex w-full sm:w-auto gap-3 shrink-0">
            <StatChip value={vehicles.length} label={t('common.vehiclesCount')} />
            <StatChip value="—" label={t('common.nextAppointments')} accent />
          </div>
        </div>
      </div>

      {/* ══ Quick-Action Cards ══ */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-white/40 mb-4">{t('common.quickAccess')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Rendez-vous */}
          <Link href="/client/rendez-vous">
            <div className="group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-6
              bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-400
              dark:from-[#0c1f14] dark:to-[#112918] dark:border-emerald-900/60 dark:hover:border-emerald-700/50">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('appointments.title')}</h3>
              <p className="text-slate-500 dark:text-white/55 text-xs mb-5">{t('dashboard.manageAppointments')}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{t('dashboard.see')}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Mon Profil */}
          <Link href="/client/profile">
            <div className="group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-6
              bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400
              dark:from-[#0c1524] dark:to-[#0f1c36] dark:border-blue-900/60 dark:hover:border-blue-700/50">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('nav.clientProfile')}</h3>
              <p className="text-slate-500 dark:text-white/55 text-xs mb-5">{t('dashboard.managePersonalInfo')}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>{t('dashboard.edit')}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Mes Véhicules */}
          <Link href="/client/vehicles">
            <div className="group relative overflow-hidden rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-6
              bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 hover:border-violet-400
              dark:from-[#180c22] dark:to-[#1e1030] dark:border-purple-900/60 dark:hover:border-purple-700/50">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{t('common.myVehicles')}</h3>
              <p className="text-slate-500 dark:text-white/55 text-xs mb-5">
                {language === 'ar'
                  ? `${vehicles.length} ${vehicles.length === 1 ? 'مركبة مسجلة' : 'مركبات مسجلة'}`
                  : `${vehicles.length} véhicule${vehicles.length !== 1 ? 's' : ''} enregistré${vehicles.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                <span>{t('dashboard.see')}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ══ Main Content ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Vehicles – 2 cols ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('common.myVehicles')}</h2>
            <Link
              href="/client/vehicles/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                bg-[#f33e49]/10 hover:bg-[#f33e49]/20 border border-[#f33e49]/25
                text-[#f33e49] dark:text-[#ff6b74] text-xs font-semibold transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('dashboard.add')}
            </Link>
          </div>

          {isLoadingVehicles ? (
            <Spinner />
          ) : vehicles.length === 0 ? (
            <EmptyState icon={<Car className="w-8 h-8 text-slate-300 dark:text-white/20" />} message={t('common.noVehicle')}>
              <Link href="/client/vehicles/new">
                <button className="mt-4 px-5 py-2 rounded-full bg-[#f33e49]/10 hover:bg-[#f33e49]/20 border border-[#f33e49]/25 text-[#f33e49] dark:text-[#ff6b74] text-xs font-semibold transition-all">
                  {t('common.addFirstVehicle')}
                </button>
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="group p-5 flex items-center gap-4 hover:border-slate-300 dark:hover:border-white/[0.14] hover:shadow-sm dark:hover:bg-[#0f1930] transition-all duration-200">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-2xl shrink-0">
                    🚗
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{vehicle.marque_nom} {vehicle.modele_nom}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {vehicle.annee && (
                        <span className="text-[0.68rem] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50">
                          {vehicle.annee}
                        </span>
                      )}
                      {vehicle.couleur && (
                        <span className="text-[0.68rem] px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-white/50">
                          {vehicle.couleur}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.68rem] text-slate-400 dark:text-white/30 mt-1.5">{t('common.chassisNumber')}: {vehicle.numero_chassis || '—'}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.07] text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition" title={t('common.edit')}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-[#f33e49]/10 text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-[#ff6b74] transition" title={t('common.delete')}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Profile Card – 1 col ── */}
        <div className="lg:col-span-1">
          <Card className="p-6 space-y-5 sticky top-20">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f33e49] to-[#ff8a92] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#f33e49]/20">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">{user?.prenom} {user?.nom}</p>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest bg-[#f33e49]/10 border border-[#f33e49]/25 text-[#f33e49] dark:text-[#ff6b74]">
                  {t('common.client')}
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/[0.06]" />

            {/* Info */}
            <div className="space-y-3">
              <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label={t('common.email')} value={user?.email} />
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label={t('common.phone')} value={user?.telephone || '—'} />
              <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label={t('common.clientId')} value={`#${user?.id}`} />
            </div>

            <div className="h-px bg-slate-100 dark:bg-white/[0.06]" />

            <Link href="/client/profile" className="w-full block">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#f33e49] to-[#ff5a65] hover:from-[#ff4d58] hover:to-[#ff6b74] text-white text-xs font-semibold transition-all duration-200 shadow-lg shadow-[#f33e49]/20">
                {t('common.editProfile')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </Card>
        </div>
      </div>


    </div>
  );
}

/* ── Helpers ── */
function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-[#f33e49]/15" />
        <div className="absolute inset-0 rounded-full border-2 border-t-[#f33e49] animate-spin" />
      </div>
    </div>
  );
}

function EmptyState({ icon, message, children }: { icon: React.ReactNode; message: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] py-12 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] flex items-center justify-center">
        {icon}
      </div>
      <p className="text-slate-400 dark:text-white/35 text-sm">{message}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.07] flex items-center justify-center text-slate-400 dark:text-white/30 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[0.65rem] text-slate-400 dark:text-white/35 uppercase tracking-widest">{label}</p>
        <p className="text-slate-800 dark:text-white/80 text-xs font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
