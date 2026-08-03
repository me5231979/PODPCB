import { useMemo, useState } from 'react';
import { REQUEST_TYPES, requestTypeById, type RequestTypeId } from '../../config/requestTypes';
import { gateForType } from '../../config/gates';
import { PRACTITIONERS, TODAY } from '../../data/seed';
import { checkGate } from '../../domain/checkGate';
import { computeSla } from '../../domain/computeSla';
import { deriveRequirements } from '../../domain/deriveRequirements';
import { generateTasks } from '../../domain/generateTasks';
import { assign } from '../../domain/assign';
import { routeEscalation } from '../../domain/routeEscalation';
import { capabilityById } from '../../config/capabilities';
import { useAppStore } from '../../store/AppStore';
import { practitionerName } from '../../components/status';

const STEPS = ['What you need', 'Context', 'Completeness', 'Risk', 'Review'] as const;

export function SubmitFlow({ onDone, onCancel }: { onDone: (id: string | null) => void; onCancel: () => void }) {
  const { currentUser, allTasks, submitRequest } = useAppStore();
  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState<RequestTypeId | null>(null);
  const [title, setTitle] = useState('');
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [cleared, setCleared] = useState<string[]>([]);
  const [riskAnswers, setRiskAnswers] = useState<Record<string, boolean>>({});
  const [gateError, setGateError] = useState<string | null>(null);

  const type = typeId ? requestTypeById(typeId) : undefined;
  const refused = type?.refused;

  const riskFlags = useMemo(
    () => (type ? type.riskQuestions.filter((q) => riskAnswers[q.id]).map((q) => q.flagId) : []),
    [type, riskAnswers],
  );

  // Live assembly preview — recomputed from the domain layer as the requester types.
  const preview = useMemo(() => {
    if (!type || refused) return null;
    const requirements = deriveRequirements(type.id, riskFlags);
    const slaDate = computeSla(type.id, riskFlags, TODAY);
    const tasks = generateTasks('PREVIEW', type.id, requirements, riskFlags, currentUser.businessUnit, TODAY, slaDate);
    const team = new Map<string, string[]>();
    let queued = 0;
    for (const task of tasks) {
      if (task.state === 'exited') continue;
      const req = requirements.find((r) => r.capabilityId === task.capabilityId);
      if (!req) continue;
      const decision = assign(task, req, PRACTITIONERS, allTasks, currentUser.businessUnit, TODAY);
      const capLabel = capabilityById(task.capabilityId)?.label ?? task.capabilityId;
      if (decision.selected) {
        const existing = team.get(decision.selected) ?? [];
        team.set(decision.selected, [...existing, capLabel]);
      } else {
        queued += 1;
      }
    }
    return { requirements, slaDate, escalations: routeEscalation(riskFlags), team, queued };
  }, [type, refused, riskFlags, currentUser.businessUnit, allTasks]);

  const gateItems = type && !refused ? gateForType(type.id) : [];
  const gateResult = type ? checkGate(type.id, cleared) : null;
  const gateClear = gateResult?.ok ?? false;

  const canAdvance = (): boolean => {
    if (step === 0) return Boolean(type) && !refused;
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return gateClear;
    return true;
  };

  const create = () => {
    if (!type) return;
    const result = submitRequest({
      type: type.id,
      businessUnit: currentUser.businessUnit,
      requesterId: currentUser.id,
      title,
      attributes,
      riskFlags,
      clearedGateItems: cleared,
    });
    if (result.ok) onDone(result.request.id);
    else setGateError(result.gate.refused ? result.gate.reason : 'Submission stays locked until every completeness item clears.');
  };

  return (
    <div className="py-12">
      <button onClick={onCancel} className="cursor-pointer text-sm font-medium text-vu-oak hover:underline">
        ← Your requests
      </button>
      <p className="eyebrow mt-4 text-vu-oak">Create request</p>
      <h1 className="mt-1 font-serif text-3xl leading-[1.1]">
        Tell us what you need. <em className="text-vu-oak">We assemble the team.</em>
      </h1>

      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-2 rounded-vu border px-3 py-1.5 text-sm ${
              i === step
                ? 'border-vu-gold bg-vu-gold/15 font-medium text-vu-black'
                : i < step
                  ? 'border-vu-sage bg-vu-sage/20 text-vu-black'
                  : 'border-vu-gray-light text-vu-gray-dark'
            }`}
          >
            <span className="font-condensed font-bold">{String(i + 1).padStart(2, '0')}</span> {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 0 && (
            <fieldset>
              <legend className="font-serif text-xl">What do you need?</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {REQUEST_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className={`card block cursor-pointer transition-colors duration-200 hover:border-vu-gold ${
                      typeId === t.id ? 'border-vu-gold ring-1 ring-vu-gold' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="request-type"
                      value={t.id}
                      checked={typeId === t.id}
                      onChange={() => { setTypeId(t.id); setCleared([]); setRiskAnswers({}); }}
                      className="sr-only"
                    />
                    <div className="font-medium">{t.label}</div>
                    <div className="mt-1 text-sm text-vu-gray-dark">{t.description}</div>
                  </label>
                ))}
              </div>
              {refused && (
                <div role="alert" className="mt-6 rounded-vu border-2 border-vu-oak bg-vu-sand p-6">
                  <p className="eyebrow text-vu-oak">This system cannot take this request</p>
                  <p className="mt-2">{refused.reason}</p>
                  <p className="mt-2 font-medium">Go to {refused.redirectTo}.</p>
                </div>
              )}
            </fieldset>
          )}

          {step === 1 && type && (
            <div>
              <h2 className="font-serif text-xl">Context</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium">Request title</span>
                  <input
                    className="mt-1 w-full rounded-vu border border-vu-gray-light bg-vu-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vu-gold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g. ${type.label} — <position or unit>`}
                  />
                </label>
                <p className="text-sm text-vu-gray-dark">Business unit: <span className="font-medium text-vu-black">{currentUser.businessUnit}</span> (from your identity)</p>
                {type.attributeFields.map((f) => (
                  <label key={f.id} className="block">
                    <span className="text-sm font-medium">{f.label}</span>
                    {f.kind === 'textarea' ? (
                      <textarea
                        rows={3}
                        className="mt-1 w-full rounded-vu border border-vu-gray-light bg-vu-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vu-gold"
                        value={attributes[f.id] ?? ''}
                        onChange={(e) => setAttributes((a) => ({ ...a, [f.id]: e.target.value }))}
                      />
                    ) : f.kind === 'select' ? (
                      <select
                        className="mt-1 w-full cursor-pointer rounded-vu border border-vu-gray-light bg-vu-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vu-gold"
                        value={attributes[f.id] ?? ''}
                        onChange={(e) => setAttributes((a) => ({ ...a, [f.id]: e.target.value }))}
                      >
                        <option value="">Choose…</option>
                        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        className="mt-1 w-full rounded-vu border border-vu-gray-light bg-vu-white px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vu-gold"
                        value={attributes[f.id] ?? ''}
                        onChange={(e) => setAttributes((a) => ({ ...a, [f.id]: e.target.value }))}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 2 && type && (
            <div>
              <h2 className="font-serif text-xl">Completeness</h2>
              <p className="mt-2 max-w-[65ch] text-sm text-vu-gray-dark">
                The back-and-forth that used to happen after submission happens here instead. Submission stays locked
                until every item clears.
              </p>
              {gateItems.length === 0 ? (
                <p className="mt-4 rounded-vu border border-vu-sage bg-vu-sage/20 p-4 text-sm">
                  This request type has no completeness requirements. You can continue.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {gateItems.map((item) => {
                    const checked = cleared.includes(item.id);
                    return (
                      <li key={item.id} className="card">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 cursor-pointer accent-[#946E24]"
                            checked={checked}
                            onChange={(e) =>
                              setCleared((c) => (e.target.checked ? [...c, item.id] : c.filter((x) => x !== item.id)))
                            }
                          />
                          <span>
                            <span className="font-medium">{item.label}</span>
                            <span className="mt-1 block text-sm text-vu-gray-dark">{item.help}</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {!gateClear && gateItems.length > 0 && (
                <p className="mt-4 text-sm font-medium text-vu-oak">
                  {gateItems.length - cleared.length} item{gateItems.length - cleared.length === 1 ? '' : 's'} remaining.
                  Submission is locked until they clear.
                </p>
              )}
            </div>
          )}

          {step === 3 && type && (
            <div>
              <h2 className="font-serif text-xl">A few questions about risk</h2>
              <p className="mt-2 text-sm text-vu-gray-dark">Plain answers. They shape who joins the working group and how fast we move.</p>
              {type.riskQuestions.length === 0 ? (
                <p className="mt-4 rounded-vu border border-vu-sage bg-vu-sage/20 p-4 text-sm">No risk questions for this request type.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {type.riskQuestions.map((q) => (
                    <li key={q.id} className="card flex items-center justify-between gap-4">
                      <span>{q.question}</span>
                      <div className="flex gap-2" role="radiogroup" aria-label={q.question}>
                        {[true, false].map((v) => (
                          <button
                            key={String(v)}
                            onClick={() => setRiskAnswers((a) => ({ ...a, [q.id]: v }))}
                            className={`cursor-pointer rounded-vu border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
                              riskAnswers[q.id] === v
                                ? 'border-vu-gold bg-vu-gold text-vu-black'
                                : 'border-vu-gray-light hover:border-vu-gold'
                            }`}
                          >
                            {v ? 'Yes' : 'No'}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 4 && type && preview && (
            <div>
              <h2 className="font-serif text-xl">Review before you create it</h2>
              <dl className="mt-4 space-y-4">
                <div className="card">
                  <dt className="eyebrow text-vu-oak">Request</dt>
                  <dd className="mt-1 font-medium">{title || '(untitled)'}</dd>
                  <dd className="text-sm text-vu-gray-dark">{type.label} · {currentUser.businessUnit}</dd>
                </div>
                <div className="card">
                  <dt className="eyebrow text-vu-oak">Your working group</dt>
                  {preview.team.size === 0 && preview.queued === 0 ? (
                    <dd className="mt-1 text-sm text-vu-gray-dark">Assembled at creation.</dd>
                  ) : (
                    <dd className="mt-2 space-y-2">
                      {[...preview.team.entries()].map(([pid, caps]) => (
                        <div key={pid} className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="font-medium">{practitionerName(pid)}</span>
                          <span className="text-right text-vu-gray-dark">{caps.join(', ')}</span>
                        </div>
                      ))}
                      {preview.queued > 0 && (
                        <p className="text-sm text-vu-gray-dark">
                          {preview.queued} piece{preview.queued === 1 ? '' : 's'} of work will queue for capacity — you will
                          see a projected start date on your dashboard.
                        </p>
                      )}
                    </dd>
                  )}
                </div>
                <div className="card">
                  <dt className="eyebrow text-vu-oak">Due date</dt>
                  <dd className="mt-1 font-medium">{preview.slaDate}</dd>
                </div>
                {preview.escalations.length > 0 && (
                  <div className="card">
                    <dt className="eyebrow text-vu-oak">Escalation path</dt>
                    <dd className="mt-2 space-y-1 text-sm">
                      {preview.escalations.map(({ rule, stays }) => (
                        <p key={rule.flagId}>
                          <span className="font-medium">{rule.label}</span>{' '}
                          {stays ? '— handled inside your working group.' : `— goes to ${rule.exitsTo}; we track the return date.`}
                        </p>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              {gateError && <p role="alert" className="mt-4 text-sm font-medium text-vu-oak">{gateError}</p>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
              className="cursor-pointer rounded-vu border border-vu-gray-light px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-vu-gold"
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn-gold" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
                Continue
              </button>
            ) : (
              <button className="btn-gold" onClick={create}>
                Create request
              </button>
            )}
          </div>
        </div>

        <aside aria-label="Working group assembling" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-vu bg-vu-black p-6 text-vu-white">
            <p className="eyebrow text-vu-gold">Assembling as you type</p>
            {!type || refused ? (
              <p className="mt-3 text-sm text-vu-white/70">Choose a request type and the working group forms here.</p>
            ) : preview ? (
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-vu-white/50">Capabilities identified</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {preview.requirements.map((r) => (
                      <li key={r.capabilityId} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-vu-gold" aria-hidden="true" />
                        {capabilityById(r.capabilityId)?.label ?? r.capabilityId}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-vu-white/50">Practitioners matched</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {[...preview.team.keys()].map((pid) => (
                      <li key={pid} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-vu-gold" aria-hidden="true" />
                        {practitionerName(pid)}
                      </li>
                    ))}
                    {preview.queued > 0 && (
                      <li className="text-vu-white/70">{preview.queued} task{preview.queued === 1 ? '' : 's'} will queue for capacity</li>
                    )}
                  </ul>
                </div>
                {preview.escalations.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-vu-white/50">Escalation path forming</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {preview.escalations.map(({ rule, stays }) => (
                        <li key={rule.flagId}>{rule.label}{stays ? '' : ` → ${rule.exitsTo}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t border-vu-gold/20 pt-4">
                  <p className="text-xs uppercase tracking-wide text-vu-white/50">Due date</p>
                  <p className="mt-1 font-serif text-2xl text-vu-gold">{preview.slaDate}</p>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
