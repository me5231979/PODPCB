import { PRACTITIONERS } from '../data/seed';
import type { ClockState } from '../domain/deriveStatus';
import type { RequestStatus } from '../domain/types';

export const practitionerName = (id: string | null): string =>
  (id && PRACTITIONERS.find((p) => p.id === id)?.name) || 'Unassigned';

export function statusLabel(status: RequestStatus): string {
  switch (status.kind) {
    case 'complete': return 'Complete';
    case 'awaiting_external': return `Awaiting ${status.destination}`;
    case 'blocked': return 'Blocked';
    case 'in_progress': return `In progress — ${practitionerName(status.ownerId)}`;
    case 'queued': return `Queued — position ${status.position}, projected start ${status.projectedStart}`;
    case 'assessing': return 'Assessing';
  }
}

/** Neutral chip styling; saturated accents stay reserved for data viz. */
export function StatusChip({ status }: { status: RequestStatus }) {
  const tone: Record<RequestStatus['kind'], string> = {
    complete: 'bg-vu-sage/30 text-vu-black border-vu-sage',
    awaiting_external: 'bg-vu-sky/30 text-vu-black border-vu-sky',
    blocked: 'bg-vu-sand text-vu-oak border-vu-gold',
    in_progress: 'bg-vu-gold/15 text-vu-oak border-vu-gold/50',
    queued: 'bg-vu-cream text-vu-gray-dark border-vu-gray-light',
    assessing: 'bg-vu-cream text-vu-gray-dark border-vu-gray-light',
  };
  return (
    <span className={`inline-flex items-center rounded-vu border px-2.5 py-1 text-xs font-medium ${tone[status.kind]}`}>
      {statusLabel(status)}
    </span>
  );
}

export function ClockChip({ clock }: { clock: ClockState }) {
  const map: Record<ClockState, { label: string; cls: string }> = {
    on_track: { label: 'On track', cls: 'text-vu-sage' },
    at_risk: { label: 'At risk', cls: 'text-vu-highlight' },
    breached: { label: 'Past due', cls: 'text-vu-oak' },
  };
  const m = map[clock];
  return <span className={`text-xs font-semibold uppercase tracking-wide ${m.cls}`}>{m.label}</span>;
}

export function daysBetween(aIso: string, bIso: string): number {
  return Math.round((new Date(bIso).getTime() - new Date(aIso).getTime()) / 86_400_000);
}
