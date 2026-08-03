import { CAPABILITIES, capabilityById } from '../../config/capabilities';
import { PRACTITIONERS, TODAY } from '../../data/seed';
import { AT_RISK_FRACTION } from '../../config/slaTargets';
import { clockState, deriveStatus } from '../../domain/deriveStatus';
import { computeLoad } from '../../domain/computeLoad';
import { useAppStore } from '../../store/AppStore';

export function LeadershipView() {
  const { requests, allTasks, decisions } = useAppStore();

  const queuedByCapability = new Map<string, number>();
  for (const t of allTasks) {
    if (t.state === 'queued') {
      queuedByCapability.set(t.capabilityId, (queuedByCapability.get(t.capabilityId) ?? 0) + 1);
    }
  }

  // Capabilities with fewer than two qualified practitioners are single points of failure.
  const coverageGaps = CAPABILITIES.filter(
    (cap) => PRACTITIONERS.filter((p) => p.capabilities.some((c) => c.capabilityId === cap.id && c.proficiency >= 2)).length < 2,
  );

  const statuses = requests.map((r) => ({
    r,
    status: deriveStatus(r, allTasks, TODAY),
    clock: clockState(r, TODAY, AT_RISK_FRACTION),
  }));
  const open = statuses.filter((s) => s.status.kind !== 'complete');
  const breached = open.filter((s) => s.clock === 'breached').length;
  const atRisk = open.filter((s) => s.clock === 'at_risk').length;
  const throttled = decisions.filter((d) => d.reason === 'throttled_no_capacity').length;

  const stat = (value: string | number, label: string, note?: string) => (
    <div className="card">
      <p className="font-serif text-4xl text-vu-black">{value}</p>
      <p className="eyebrow mt-2 text-vu-oak">{label}</p>
      {note && <p className="mt-1 text-xs text-vu-gray-dark">{note}</p>}
    </div>
  );

  return (
    <div className="py-12">
      <p className="eyebrow text-vu-oak">Leadership</p>
      <h1 className="mt-1 font-serif text-4xl leading-[1.1]">
        Capacity is a fact, <em className="text-vu-oak">not a feeling</em>
      </h1>
      <p className="mt-3 max-w-[65ch] text-vu-gray-dark">
        Sustained queue depth is a staffing signal, not a routing problem. If a capability queues persistently, the
        answer is headcount or capability development.
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat(open.length, 'Open requests')}
        {stat(atRisk, 'At risk', 'Past 75% of the SLA window')}
        {stat(breached, 'Past due')}
        {stat(throttled, 'Throttled to queue', 'Assignments refused for lack of capacity')}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="eyebrow text-vu-oak">Queue depth by capability</h2>
          {queuedByCapability.size === 0 ? (
            <p className="mt-3 text-sm text-vu-gray-dark">Nothing is queued. Every accepted request has an owner.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {[...queuedByCapability.entries()].sort((a, b) => b[1] - a[1]).map(([capId, n]) => (
                <li key={capId} className="flex items-center justify-between text-sm">
                  <span>{capabilityById(capId)?.label ?? capId}</span>
                  <span className="font-semibold">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="eyebrow text-vu-oak">Coverage gaps — single points of failure</h2>
          <p className="mt-2 text-xs text-vu-gray-dark">Capabilities with fewer than two qualified practitioners. Surfaced permanently by design.</p>
          <ul className="mt-3 space-y-2">
            {coverageGaps.map((cap) => (
              <li key={cap.id} className="flex items-center justify-between text-sm">
                <span>{cap.label}</span>
                <span className="rounded-vu bg-vu-sand px-2 py-0.5 text-xs font-medium text-vu-oak">1 qualified</span>
              </li>
            ))}
            {coverageGaps.length === 0 && <li className="text-sm text-vu-gray-dark">Every capability has at least two qualified practitioners.</li>}
          </ul>
        </div>

        <div className="card">
          <h2 className="eyebrow text-vu-oak">Team load</h2>
          <ul className="mt-3 space-y-2">
            {PRACTITIONERS.map((p) => {
              const load = computeLoad(p.id, allTasks);
              return (
                <li key={p.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>{p.name} <span className="text-vu-gray-dark">· {p.primaryRole}</span></span>
                    <span className="text-vu-gray-dark">{load}/{p.capacityCeiling}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-vu-gray-light">
                    <div
                      className={`h-1.5 rounded-full ${load / p.capacityCeiling > 0.85 ? 'bg-vu-oak' : 'bg-vu-gold'}`}
                      style={{ width: `${Math.min((load / p.capacityCeiling) * 100, 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card">
          <h2 className="eyebrow text-vu-oak">Assignment decisions</h2>
          <p className="mt-2 text-xs text-vu-gray-dark">Every decision is logged with its full input set. Overrides are how you find out the model is wrong.</p>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {decisions.slice(-12).reverse().map((d) => (
              <li key={d.taskId} className="flex items-center justify-between border-b border-vu-gray-light pb-2 last:border-0">
                <span className="text-vu-gray-dark">{d.taskId}</span>
                <span className={`text-xs font-medium uppercase tracking-wide ${d.reason === 'assigned' || d.reason === 'anchored' ? 'text-vu-sage' : 'text-vu-oak'}`}>
                  {d.reason.replaceAll('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-vu bg-vu-black p-8 text-vu-white">
        <h2 className="eyebrow text-vu-gold">Open questions for leadership</h2>
        <p className="mt-2 max-w-[65ch] text-sm text-vu-white/70">
          Surfaced here until resolved, per the build spec. These are decisions, not features.
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ['Throttle authority', 'Who backs the system when it tells a dean their request is queued?'],
            ['Anchoring policy', 'Which business units get an anchored EC, and what is the hard override ceiling?'],
            ['Capability floor for governance', 'Which decisions require a specific person rather than a qualified one?'],
            ['Transactional offload', 'Thirteen tasks moving to five other teams. Tracked here; no system performs it.'],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-3">
              <span className="font-condensed text-2xl font-bold text-vu-gold">{String(i + 1).padStart(2, '0')}</span>
              <span>
                <span className="font-medium">{title}.</span>{' '}
                <span className="text-sm text-vu-white/70">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
