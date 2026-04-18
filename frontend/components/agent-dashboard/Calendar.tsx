'use client';

import { useMemo } from 'react';
import { PlanningRDV } from '@/lib/api/planning';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, Car, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Constants ────────────────────────────────────────────

const WEEK_DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const WEEK_DAYS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 08:00 – 17:00

// ─── Status helpers ───────────────────────────────────────

export const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; dot: string }> = {
  PLANIFIE:  { label: 'Planifié',   bg: 'bg-blue-50',    border: 'border-blue-200',  text: 'text-blue-700',  dot: 'bg-blue-400' },
  CONFIRME:  { label: 'Confirmé',   bg: 'bg-indigo-50',  border: 'border-indigo-200',text: 'text-indigo-700',dot: 'bg-indigo-400' },
  EN_COURS:  { label: 'En cours',   bg: 'bg-amber-50',   border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  TERMINE:   { label: 'Terminé',    bg: 'bg-emerald-50', border: 'border-emerald-200',text:'text-emerald-700',dot:'bg-emerald-400' },
  ANNULE:    { label: 'Annulé',     bg: 'bg-red-50',     border: 'border-red-200',   text: 'text-red-700',   dot: 'bg-red-400' },
  NO_SHOW:   { label: 'No-show',    bg: 'bg-slate-50',   border: 'border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' },
};

function getStatusConfig(statut: string) {
  return STATUS_CONFIG[statut] ?? { label: statut, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' };
}

function toLocalISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ─── Types ────────────────────────────────────────────────

export type CalendarView = 'month' | 'week' | 'day';

interface CalendarProps {
  rdvs: PlanningRDV[];
  view: CalendarView;
  cursor: Date;               // first visible day for week/day, first of month for month
  onCursorChange: (d: Date) => void;
  onEventClick?: (rdv: PlanningRDV) => void;
  onDrop?: (rdvId: number, newDateTime: string) => void;
  isLoading?: boolean;
}

// ─── Legend ───────────────────────────────────────────────

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.values(STATUS_CONFIG).map((s) => (
        <div key={s.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`size-2.5 rounded-full ${s.dot}`} />
          {s.label}
        </div>
      ))}
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────

function MonthView({ rdvs, cursor, onCursorChange, onEventClick }: CalendarProps) {
  const todayISO = toLocalISO(new Date());

  const { title, cells } = useMemo(() => {
    const year  = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ iso: string | null; day: number | null }> = [];
    for (let i = 0; i < first; i++) cells.push({ iso: null, day: null });
    for (let d = 1; d <= days; d++) {
      cells.push({ iso: toLocalISO(new Date(year, month, d)), day: d });
    }
    while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });

    return {
      title: cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      cells,
    };
  }, [cursor]);

  // Group RDV by date ISO
  const rdvByDate = useMemo(() => {
    const map: Record<string, PlanningRDV[]> = {};
    rdvs.forEach((r) => {
      const iso = toLocalISO(new Date(r.date_heure));
      if (!map[iso]) map[iso] = [];
      map[iso].push(r);
    });
    return map;
  }, [rdvs]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold capitalize">{title}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {WEEK_DAYS_SHORT.map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground text-center py-2">{d}</div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 border-l border-t">
        {cells.map((cell, i) => {
          const dayRdvs = cell.iso ? (rdvByDate[cell.iso] ?? []) : [];
          const isToday = cell.iso === todayISO;

          return (
            <div
              key={i}
              className={`min-h-24 border-b border-r p-1.5 ${cell.iso ? 'bg-background hover:bg-muted/30' : 'bg-muted/10'} transition-colors`}
            >
              {cell.day !== null && (
                <>
                  <span className={`text-xs font-semibold mb-1 inline-flex size-6 items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}>
                    {cell.day}
                  </span>

                  <div className="space-y-0.5">
                    {dayRdvs.slice(0, 3).map((rdv) => {
                      const s = getStatusConfig(rdv.statut);
                      const time = new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <button
                          key={rdv.rdv_id}
                          onClick={() => onEventClick?.(rdv)}
                          className={`w-full text-left text-[0.65rem] leading-none px-1.5 py-1 rounded border ${s.bg} ${s.border} ${s.text} truncate hover:opacity-80 transition-opacity`}
                        >
                          {time} · {rdv.client_prenom} {rdv.client_nom}
                        </button>
                      );
                    })}
                    {dayRdvs.length > 3 && (
                      <p className="text-[0.6rem] text-muted-foreground pl-1">+{dayRdvs.length - 3} autres</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────

function WeekView({ rdvs, cursor, onCursorChange, onEventClick }: CalendarProps) {
  // Find Monday of the cursor's week
  const monday = useMemo(() => {
    const d = new Date(cursor);
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [cursor]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [monday]);

  const todayISO = toLocalISO(new Date());

  const title = `${days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const rdvByDateHour = useMemo(() => {
    const map: Record<string, PlanningRDV[]> = {};
    rdvs.forEach((r) => {
      const d = new Date(r.date_heure);
      const key = `${toLocalISO(d)}_${d.getHours()}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [rdvs]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => { const d = new Date(monday); d.setDate(d.getDate() - 7); onCursorChange(d); }}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { const d = new Date(monday); d.setDate(d.getDate() + 7); onCursorChange(d); }}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid border-b" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
            <div className="py-2" />
            {days.map((d) => {
              const iso = toLocalISO(d);
              const isToday = iso === todayISO;
              return (
                <div key={iso} className={`py-2 text-center border-l ${isToday ? 'bg-primary/5' : ''}`}>
                  <p className="text-xs text-muted-foreground">{WEEK_DAYS_SHORT[d.getDay()]}</p>
                  <p className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>{d.getDate()}</p>
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid border-b" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
              <div className="text-xs text-muted-foreground text-right pr-3 py-2 shrink-0">{hour}h</div>
              {days.map((d) => {
                const iso = toLocalISO(d);
                const key = `${iso}_${hour}`;
                const cellRdvs = rdvByDateHour[key] ?? [];
                const isToday = iso === todayISO;
                return (
                  <div key={key} className={`border-l min-h-14 p-0.5 ${isToday ? 'bg-primary/5' : ''}`}>
                    {cellRdvs.map((rdv) => {
                      const s = getStatusConfig(rdv.statut);
                      return (
                        <button
                          key={rdv.rdv_id}
                          onClick={() => onEventClick?.(rdv)}
                          className={`w-full text-left text-[0.65rem] leading-snug p-1.5 rounded border ${s.bg} ${s.border} ${s.text} mb-0.5 hover:opacity-80 transition-opacity`}
                        >
                          <p className="font-semibold truncate">{rdv.client_prenom} {rdv.client_nom}</p>
                          <p className="truncate opacity-75">{rdv.vehicule_immatriculation}</p>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────

function DayView({ rdvs, cursor, onCursorChange, onEventClick }: CalendarProps) {
  const todayISO = toLocalISO(new Date());
  const cursorISO = toLocalISO(cursor);
  const isToday = cursorISO === todayISO;

  const title = cursor.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const rdvByHour = useMemo(() => {
    const map: Record<number, PlanningRDV[]> = {};
    rdvs.forEach((r) => {
      const d = new Date(r.date_heure);
      if (toLocalISO(d) === cursorISO) {
        const h = d.getHours();
        if (!map[h]) map[h] = [];
        map[h].push(r);
      }
    });
    return map;
  }, [rdvs, cursorISO]);

  const prevDay = () => { const d = new Date(cursor); d.setDate(d.getDate() - 1); onCursorChange(d); };
  const nextDay = () => { const d = new Date(cursor); d.setDate(d.getDate() + 1); onCursorChange(d); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-semibold capitalize ${isToday ? 'text-primary' : ''}`}>{title}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={prevDay}><ChevronLeft className="size-4" /></Button>
          <Button variant="ghost" size="icon" onClick={nextDay}><ChevronRight className="size-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        {HOURS.map((hour) => {
          const hourRdvs = rdvByHour[hour] ?? [];
          return (
            <div key={hour} className="flex gap-4 items-start">
              <span className="w-12 text-xs text-right text-muted-foreground pt-2 shrink-0">{hour}h00</span>
              <div className={`flex-1 min-h-14 rounded-lg border ${hourRdvs.length > 0 ? 'border-border' : 'border-dashed border-muted'} p-2 space-y-1.5`}>
                {hourRdvs.map((rdv) => {
                  const s = getStatusConfig(rdv.statut);
                  const time = new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <button
                      key={rdv.rdv_id}
                      onClick={() => onEventClick?.(rdv)}
                      className={`w-full text-left p-3 rounded-md border ${s.bg} ${s.border} ${s.text} hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="size-3.5 opacity-70" />
                        <span className="text-xs font-semibold">{time}</span>
                        <Badge className={`ml-auto text-[0.6rem] px-1.5 py-0 ${s.bg} ${s.text} border ${s.border}`}>{s.label}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs opacity-80">
                        <span className="flex items-center gap-1"><User className="size-3" />{rdv.client_prenom} {rdv.client_nom}</span>
                        <span className="flex items-center gap-1"><Car className="size-3" />{rdv.vehicule_immatriculation}</span>
                      </div>
                      {rdv.type_intervention && (
                        <p className="text-xs mt-1 opacity-70">{rdv.type_intervention} — {rdv.sous_type_intervention}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Calendar ────────────────────────────────────────

export function AgentCalendar(props: CalendarProps) {
  if (props.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (props.view === 'month') return <MonthView {...props} />;
  if (props.view === 'week')  return <WeekView {...props} />;
  return <DayView {...props} />;
}
