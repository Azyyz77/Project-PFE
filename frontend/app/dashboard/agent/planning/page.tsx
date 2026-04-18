'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  fetchPlanning,
  fetchPlanningAgencies,
  moveAppointment,
  PlanningRDV,
  PlanningAgency,
} from '@/lib/api/planning';
import { AgentCalendar, CalendarLegend, CalendarView, STATUS_CONFIG } from '@/components/agent-dashboard/Calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LayoutGrid,
  Rows3,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  Car,
  User,
  MapPin,
  Phone,
  Wrench,
  AlertTriangle,
  Move,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────

function toLocalISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekRange(cursor: Date): { start: Date; end: Date } {
  const d = new Date(cursor);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(cursor: Date): { start: Date; end: Date } {
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end   = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  return { start, end };
}

// ─── RDV Detail Dialog ────────────────────────────────────

interface DetailDialogProps {
  rdv: PlanningRDV | null;
  onClose: () => void;
  onMove: (rdvId: number, newDateTime: string) => Promise<void>;
}

function RdvDetailDialog({ rdv, onClose, onMove }: DetailDialogProps) {
  const [moveDate, setMoveDate] = useState('');
  const [moveTime, setMoveTime] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);

  if (!rdv) return null;

  const s = STATUS_CONFIG[rdv.statut] ?? { label: rdv.statut, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' };
  const canMove = !['TERMINE', 'ANNULE', 'NO_SHOW'].includes(rdv.statut);
  const rdvDate = new Date(rdv.date_heure);
  const formattedDate = rdvDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = rdvDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handleMove = async () => {
    if (!moveDate || !moveTime) return;
    setIsMoving(true);
    try {
      await onMove(rdv.rdv_id, `${moveDate}T${moveTime}:00`);
      setShowMoveForm(false);
      onClose();
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={!!rdv} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>Détail du rendez-vous</DialogTitle>
            <Badge className={`text-xs ${s.bg} ${s.text} border ${s.border}`}>{s.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="size-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium capitalize">{formattedDate}</p>
              <p className="text-sm text-muted-foreground">{formattedTime}</p>
            </div>
          </div>

          {/* Client */}
          <div className="flex items-start gap-3">
            <User className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-medium">{rdv.client_prenom} {rdv.client_nom}</p>
              {rdv.client_telephone && (
                <a href={`tel:${rdv.client_telephone}`} className="text-xs text-primary flex items-center gap-1 mt-0.5">
                  <Phone className="size-3" />{rdv.client_telephone}
                </a>
              )}
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-start gap-3">
            <Car className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Véhicule</p>
              <p className="text-sm font-medium">{rdv.vehicule_marque} {rdv.vehicule_modele}</p>
              <p className="text-xs text-muted-foreground">{rdv.vehicule_immatriculation}</p>
            </div>
          </div>

          {/* Agency */}
          <div className="flex items-start gap-3">
            <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Agence</p>
              <p className="text-sm font-medium">{rdv.agence_nom}</p>
              <p className="text-xs text-muted-foreground">{rdv.agence_ville}</p>
            </div>
          </div>

          {/* Intervention */}
          {rdv.type_intervention && (
            <div className="flex items-start gap-3">
              <Wrench className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Intervention</p>
                <p className="text-sm font-medium">{rdv.type_intervention}</p>
                {rdv.sous_type_intervention && (
                  <p className="text-xs text-muted-foreground">{rdv.sous_type_intervention}</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {rdv.description && (
            <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Notes</p>
              <p>{rdv.description}</p>
            </div>
          )}

          {/* Move form */}
          {canMove && showMoveForm && (
            <div className="p-3 rounded-lg border border-border space-y-3">
              <p className="text-sm font-medium flex items-center gap-2"><Move className="size-4" /> Déplacer le rendez-vous</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Nouvelle date</label>
                  <input
                    type="date"
                    value={moveDate}
                    min={toLocalISO(new Date())}
                    onChange={(e) => setMoveDate(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Heure</label>
                  <input
                    type="time"
                    value={moveTime}
                    onChange={(e) => setMoveTime(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          {canMove && !showMoveForm && (
            <Button variant="outline" onClick={() => setShowMoveForm(true)}>
              <Move className="size-4 mr-2" />
              Déplacer
            </Button>
          )}
          {canMove && showMoveForm && (
            <Button onClick={handleMove} disabled={!moveDate || !moveTime || isMoving}>
              {isMoving ? 'Déplacement...' : 'Confirmer le déplacement'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function PlanningPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<CalendarView>('week');
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [rdvs, setRdvs] = useState<PlanningRDV[]>([]);
  const [agencies, setAgencies] = useState<PlanningAgency[]>([]);
  const [selectedAgenceId, setSelectedAgenceId] = useState<number | ''>('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [selectedRdv, setSelectedRdv] = useState<PlanningRDV | null>(null);

  // Redirect if not agent/admin
  useEffect(() => {
    if (!isLoading && user && !['AGENT', 'ADMIN', 'DIRECTION'].includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [user, isLoading, router]);

  // Load agencies once
  useEffect(() => {
    if (!token) return;
    fetchPlanningAgencies(token)
      .then(setAgencies)
      .catch(() => {}); // silent
  }, [token]);

  // Compute date range from view + cursor
  const { dateDebut, dateFin } = useMemo(() => {
    let start: Date, end: Date;
    if (view === 'month') {
      ({ start, end } = getMonthRange(cursor));
    } else if (view === 'week') {
      ({ start, end } = getWeekRange(cursor));
    } else {
      start = new Date(cursor);
      end   = new Date(cursor);
    }
    return { dateDebut: toLocalISO(start), dateFin: toLocalISO(end) };
  }, [view, cursor]);

  // Load planning when range or filter changes
  const loadPlanning = useCallback(async () => {
    if (!token) return;
    setIsFetching(true);
    setError('');
    try {
      const data = await fetchPlanning(
        token,
        dateDebut,
        dateFin,
        selectedAgenceId !== '' ? selectedAgenceId : undefined
      );
      setRdvs(data);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement du planning.');
    } finally {
      setIsFetching(false);
    }
  }, [token, dateDebut, dateFin, selectedAgenceId]);

  useEffect(() => {
    loadPlanning();
  }, [loadPlanning]);

  // Move appointment handler
  const handleMove = async (rdvId: number, newDateTime: string) => {
    if (!token) return;
    try {
      await moveAppointment(token, rdvId, newDateTime);
      toast.success('Rendez-vous déplacé avec succès.');
      await loadPlanning();
    } catch (e: any) {
      toast.error('Erreur', { description: e.message });
      throw e;
    }
  };

  if (isLoading || !user || !token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  // Summary stats
  const statsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    rdvs.forEach((r) => { counts[r.statut] = (counts[r.statut] ?? 0) + 1; });
    return counts;
  }, [rdvs]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning</h1>
          <p className="text-muted-foreground mt-1">Visualisez et gérez les rendez-vous de votre agence.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            {(['month', 'week', 'day'] as CalendarView[]).map((v) => {
              const icons: Record<CalendarView, React.ReactNode> = {
                month: <LayoutGrid className="size-4" />,
                week:  <Rows3 className="size-4" />,
                day:   <Calendar className="size-4" />,
              };
              const labels: Record<CalendarView, string> = { month: 'Mois', week: 'Semaine', day: 'Jour' };
              return (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    view === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {icons[v]}
                  <span className="hidden sm:inline">{labels[v]}</span>
                </button>
              );
            })}
          </div>

          {/* Refresh */}
          <Button variant="outline" size="icon" onClick={loadPlanning} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardContent className="py-3 px-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="size-4" />
              <span className="font-medium">Filtres</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Agence</label>
              <select
                value={selectedAgenceId}
                onChange={(e) => setSelectedAgenceId(e.target.value === '' ? '' : Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Toutes les agences</option>
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>{a.nom} — {a.ville}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{rdvs.length} rendez-vous</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats strip ── */}
      {rdvs.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(statsByStatus).map(([status, count]) => {
            const s = STATUS_CONFIG[status] ?? { label: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
            return (
              <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${s.bg} ${s.border} ${s.text}`}>
                <span className={`size-2 rounded-full ${s.dot}`} />
                {s.label} · {count}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Calendar ── */}
      <Card>
        <CardContent className="p-5">
          <AgentCalendar
            rdvs={rdvs}
            view={view}
            cursor={cursor}
            onCursorChange={setCursor}
            onEventClick={setSelectedRdv}
            isLoading={isFetching}
          />
        </CardContent>
      </Card>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">Légende :</span>
        <CalendarLegend />
      </div>

      {/* ── RDV Detail Dialog ── */}
      <RdvDetailDialog
        rdv={selectedRdv}
        onClose={() => setSelectedRdv(null)}
        onMove={handleMove}
      />
    </div>
  );
}
