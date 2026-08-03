import { TODAY } from '../../data/seed';
import { AT_RISK_FRACTION } from '../../config/slaTargets';
import { requestTypeById } from '../../config/requestTypes';
import { clockState, deriveStatus } from '../../domain/deriveStatus';
import { routeEscalation } from '../../domain/routeEscalation';
import { useAppStore } from '../../store/AppStore';
import { ClockChip, StatusChip, practitionerName } from '../../components/status';

type Stage = { label: string; state: 'done' | 'current' | 'upcoming'; detail?: string };

export function RequestDetail({ requestId, onBack }: { requestId: string; onBack: () => void }) {
  const { requests, allTasks } = useAppStore();
  const request = requests.find((r) => r.id === requestId);
  if (!request) {
    return (
      <div className="py-12">
        <p>That request does not exist. It may have been created in another session.</p>
        <button className="btn-gold mt-4" onClick={onBack}>Back to your requests</button>
      </div>
    );
  }

  const status = deriveStatus(request, allTasks, TODAY);
  const clock = clockState(request, TODAY, AT_RISK_FRACTION);
  const escalations = routeEscalation(request.riskFlags);
  const workable = request.tasks.filter((t) => t.state !== 'exited');
  const exits = request.tasks.filter((t) => t.state === 'exited');

  const anyAssigned = workable.some((t) => t.state !== 'queued');
  const anyStarted = workable.some((t) => ['in_progress', 'blocked', 'complete'].includes(t.state));
  const done = status.kind === 'complete';

  const stages: Stage[] = [
    { label: 'Submitted', state: 'done', detail: request.createdAt },
    { label: 'Capability assessment', state: 'done', detail: `${request.requiredCapabilities.length} capabilities identified` },
    { label: 'Assigned', state: anyAssigned ? 'done' : 'current', detail: anyAssigned ? undefined : 'Queued for capacity' },
    { label: 'In work', state: done ? 'done' : anyStarted ? 'current' : 'upcoming' },
    ...(escalations.length > 0
      ? [{ label: 'Escalated', state: (done ? 'done' : anyStarted ? 'current' : 'upcoming') as Stage['state'], detail: escalations.map((e) => e.rule.label).join(' · ') }]
      : []),
    { label: 'Decision', state: done ? 'done' : 'upcoming' },
    { label: 'Complete', state: done ? 'done' : 'upcoming', detail: done ? undefined : `Due ${request.slaDate}` },
  ];

  return (
    <div className="py-12">
      <button onClick={onBack} className="cursor-pointer text-sm font-medium text-vu-oak hover:underline">
        ← Your requests
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-vu-oak">{request.id} · {requestTypeById(request.type)?.label}</p>
          <h1 className="mt-1 font-serif text-3xl leading-[1.1]">{request.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusChip status={status} />
          <ClockChip clock={clock} />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="eyebrow text-vu-oak">Timeline</h2>
        <ol className="mt-4 space-y-0">
          {stages.map((s, i) => (
            <li key={s.label} className="relative flex gap-4 pb-6">
              {i < stages.length - 1 && (
                <span className="absolute left-[7px] top-5 h-full w-px bg-vu-gray-light" aria-hidden="true" />
              )}
              <span
                className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-2 ${
                  s.state === 'done'
                    ? 'border-vu-gold bg-vu-gold'
                    : s.state === 'current'
                      ? 'border-vu-gold bg-vu-white'
                      : 'border-vu-gray-light bg-vu-white'
                }`}
                aria-hidden="true"
              />
              <div>
                <div className={`font-medium ${s.state === 'upcoming' ? 'text-vu-gray-dark' : ''}`}>{s.label}</div>
                {s.detail && <div className="text-sm text-vu-gray-dark">{s.detail}</div>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h2 className="eyebrow text-vu-oak">The work</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {workable.map((t) => (
            <li key={t.id} className="card">
              <div className="font-medium">{t.label}</div>
              <div className="mt-2 text-sm text-vu-gray-dark">
                {t.state === 'queued' ? 'Waiting for capacity' : `${practitionerName(t.ownerId)} · due ${t.dueDate}`}
              </div>
              <div className="mt-2 text-xs uppercase tracking-wide text-vu-gray-dark">{t.state.replace('_', ' ')}</div>
            </li>
          ))}
        </ul>
        {exits.length > 0 && (
          <div className="mt-4 rounded-vu border border-vu-sky bg-vu-sky/20 p-4">
            <div className="eyebrow text-vu-black">Outside this team</div>
            {exits.map((t) => (
              <p key={t.id} className="mt-2 text-sm">
                <span className="font-medium">{t.label}.</span>{' '}
                This item has left our boundary and is waiting on {t.exitedTo}. We track the return date; no one here can move it.
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
