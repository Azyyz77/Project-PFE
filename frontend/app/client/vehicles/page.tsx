'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getVehiclesByUser, deleteVehicle } from '@/lib/api/vehicles';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Car, CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientVehiclesPage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const vehiclesCountLabel = useMemo(() => {
    const count = vehicles.length;
    return `${count} ${t('vehicles.registeredVehicles')}`;
  }, [vehicles.length, t]);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) return;
      try {
        const data = await getVehiclesByUser(user.id, token);
        setVehicles(data);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user, token]);

  const handleDelete = async (vehicleId: number) => {
    if (!token) return;
    
    if (!confirm(t('vehicles.confirmDelete'))) {
      return;
    }

    setDeletingId(vehicleId);
    try {
      await deleteVehicle(vehicleId, token);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success(t('vehicles.deleteSuccess'));
    } catch (error: any) {
      console.error('Failed to delete vehicle:', error);
      toast.error(t('common.error'), { description: error.message || t('vehicles.deleteError') });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full bg-[#f5f7fa]">
      <div className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t('vehicles.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{vehiclesCountLabel}</p>
          </div>
          <Link href="/client/vehicles/new">
            <Button className="rounded-full bg-[#1b355d] px-5 text-white hover:bg-[#17305a]">
              <Plus className="mr-2 h-4 w-4" />
              {t('vehicles.addVehicle')}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => {
              const statusStyles: Record<string, string> = {
                VALIDE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                EN_ATTENTE: 'bg-amber-50 text-amber-700 border-amber-200',
                REFUSE: 'bg-rose-50 text-rose-700 border-rose-200',
              };

              const statusTextStyles: Record<string, string> = {
                VALIDE: 'text-emerald-700',
                EN_ATTENTE: 'text-amber-700',
                REFUSE: 'text-rose-700',
              };

              const statusLabels: Record<string, string> = {
                VALIDE: t('vehicles.validated'),
                EN_ATTENTE: t('dashboard.pending'),
                REFUSE: t('dashboard.refused'),
              };

              const status = vehicle.statut_validation || 'EN_ATTENTE';
              const statusLabel = statusLabels[status] || 'En attente';
              const statusIcon = status === 'VALIDE'
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : status === 'REFUSE'
                  ? <AlertTriangle className="h-3.5 w-3.5" />
                  : <Clock3 className="h-3.5 w-3.5" />;

              const vehicleName = [vehicle.marque_nom, vehicle.modele_nom, vehicle.version_nom]
                .filter(Boolean)
                .join(' ');

              const detailsLine = [vehicle.motorisation, vehicle.transmission, vehicle.annee]
                .filter(Boolean)
                .join(' · ');

              const mileage = vehicle.kilometrage ?? vehicle.kilometrage_actuel ?? vehicle.kilometrage_km;

              return (
                <div
                  key={vehicle.id}
                  className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                      <Car className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Link href={`/client/vehicles/${vehicle.id}/edit`}>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
                          title={t('vehicles.modify')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={deletingId === vehicle.id}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                        title={t('vehicles.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {vehicleName || t('vehicles.vehicle')}
                    </h3>
                    <p className="text-sm text-slate-500">{detailsLine || t('vehicles.detailsUnavailable')}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t('vehicles.registration')}</span>
                      <span className="font-medium text-slate-700">{vehicle.immatriculation || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t('vehicles.color')}</span>
                      <span className="font-medium text-slate-700">{vehicle.couleur || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{t('vehicles.mileage')}</span>
                      <span className="font-medium text-slate-700">
                        {mileage ? `${Number(mileage).toLocaleString('fr-FR')} km` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <Badge className={`border px-3 py-1 text-xs ${statusStyles[status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-current" />
                      {statusLabel}
                    </Badge>
                    <div className={`flex items-center gap-2 text-xs ${statusTextStyles[status] || 'text-slate-400'}`}>
                      {statusIcon}
                      <span>{statusLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/client/vehicles/new" className="flex">
              <div className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-slate-400 transition hover:border-slate-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm">{t('vehicles.addVehicle')}</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
