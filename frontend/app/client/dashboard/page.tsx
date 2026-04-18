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
  CalendarDays,
  User as UserIcon,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}

function StatCard({ value, label, className = '' }: { value: string | number; label: string; className?: string }) {
  return (
    <Card className={`overflow-hidden shadow-sm ${className}`}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-10">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">
            {t('dashboard.welcomeBack')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {user?.prenom} {user?.nom}
          </h1>
          <p className="text-muted-foreground mt-2">{formattedDate}</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <StatCard value={vehicles.length} label={t('common.vehiclesCount')} className="flex-1 md:w-40" />
          <StatCard value="—" label={t('common.nextAppointments')} className="flex-1 md:w-40 bg-primary/5" />
        </div>
      </div>

      <div className="h-px w-full bg-border" />

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">{t('common.quickAccess')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/client/rendez-vous" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <CardContent className="p-6">
                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <CalendarDays className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{t('appointments.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('dashboard.manageAppointments')}</p>
                <div className="flex items-center text-sm font-medium text-primary group-hover:text-primary/80">
                  {t('dashboard.see')} <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/client/profile" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <CardContent className="p-6">
                <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <UserIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{t('nav.clientProfile')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('dashboard.managePersonalInfo')}</p>
                <div className="flex items-center text-sm font-medium text-primary group-hover:text-primary/80">
                  {t('dashboard.edit')} <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/client/vehicles" className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30">
              <CardContent className="p-6">
                <div className="size-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                  <Car className="size-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{t('common.myVehicles')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'ar'
                    ? `${vehicles.length} ${vehicles.length === 1 ? 'مركبة مسجلة' : 'مركبات مسجلة'}`
                    : `${vehicles.length} véhicule${vehicles.length !== 1 ? 's' : ''} enregistré${vehicles.length !== 1 ? 's' : ''}`}
                </p>
                <div className="flex items-center text-sm font-medium text-primary group-hover:text-primary/80">
                  {t('dashboard.see')} <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Vehicles Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{t('common.myVehicles')}</h2>
              <p className="text-sm text-muted-foreground">Gérez votre flotte et historique d'entretien</p>
            </div>
            <Link href="/client/vehicles/new" className={buttonVariants({ variant: "default", size: "sm" })}>
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.add')}
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Car className="size-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('common.noVehicle')}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Ajoutez votre premier véhicule pour commencer à prendre des rendez-vous d'entretien.
                </p>
                <Link href="/client/vehicles/new" className={buttonVariants({ variant: "default" })}>
                  {t('common.addFirstVehicle')}
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="group transition-all hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-muted flex items-center justify-center">
                          <Car className="size-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold">{vehicle.marque_nom} {vehicle.modele_nom}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {vehicle.annee && <Badge variant="secondary" className="font-normal">{vehicle.annee}</Badge>}
                            {vehicle.couleur && <Badge variant="outline" className="font-normal">{vehicle.couleur}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                            <Hash className="size-3.5" />
                            {vehicle.numero_chassis || '—'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <Edit2 className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informations du profil</CardTitle>
              <CardDescription>Vos coordonnées de contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
                <div>
                  <p className="font-semibold">{user?.prenom} {user?.nom}</p>
                  <Badge variant="secondary" className="mt-1 font-normal text-xs">{t('common.client')}</Badge>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{t('common.email')}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{t('common.phone')}</p>
                    <p className="text-sm text-muted-foreground">{user?.telephone || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="size-4 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{t('common.clientId')}</p>
                    <p className="text-sm text-muted-foreground">#{user?.id}</p>
                  </div>
                </div>
              </div>

              <Link href="/client/profile" className={buttonVariants({ variant: "outline", className: "w-full mt-2" })}>
                <Settings className="size-4 mr-2" />
                {t('common.editProfile')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
