import { useState } from 'react';
import { PRACTITIONERS, TODAY } from '../../data/seed';
import { capabilityById } from '../../config/capabilities';
import { computeLoad } from '../../domain/computeLoad';
import { useAppStore } from '../../store/AppStore';
import { daysBetween } from '../../components/status';
import type { TaskState } from '../../domain/types';

const ACTIONS: { label: string; next: TaskState }[] = [
  { label: 'Start', next: 'in_progress' },
  { label: 'Complete', next: 'complete' },
];

export function PractitionerQueue() {
  const { currentUser, requests, allTasks, updateTaskState } = useAppStore();
  const me = PRACTITIONERS.find((p) => p.id === currentUser.id);
  const [blockReasonFor, setBlockReasonFor] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  if (!me) {
    return <div className="py-12"><p>This view is for practitioners. Switch users to see a queue.</p></div>;
  }

  const myTasks = allTasks
    .filter((t) => t.ownerId === me.id && t.state !== 'complete' && t.state !== 'exited')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const myLoad = computeLoad(me.id, allTasks);

  return (
    <div className="py-12">
      <p className="eyebrow text-vu-oak">Your queue</p>
      <h1 className="mt-1 font-serif text-4xl leading-[1.1]">
        {myTasks.length === 0 ? 'Nothing assigned to you.' : `${myTasks.length} open task${myTasks.length === 1 ? '' : 's'}`}
      </h1>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {myTasks.map((t) => {
            const req = requests.find((r) => r.id === t.requestId);
            const remaining = daysBetween(TODAY, t.dueDate);
            return (
              <li key={t.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-vu-gray-dark">{req?.id} · {req?.businessUnit}</div>
                    <div className="font-serif text-lg">{t.label}</div>
                    <div className="mt-1 text-sm text-vu-gray-dark">
                      For: {req?.title} · earned by {capabilityById(t.capabilityId)?.label ?? t.capabilityId}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{t.weight} units</div>
                    <div className={remaining < 0 ? 'font-semibold text-vu-oak' : 'text-vu-gray-dark'}>
                      {remaining < 0 ? `${-remaining} days past due` : `${remaining} days remaining`}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-vu bg-vu-cream px-2 py-1 text-xs uppercase tracking-wide text-vu-gray-dark">
                    {t.state.replace('_', ' ')}
                  </span>
                  {ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      className="cursor-pointer rounded-vu border border-vu-gray-light px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:border-vu-gold"
                      onClick={() => updateTaskState(t.id, a.next)}
                    >
                      {a.label}
                    </button>
                  ))}
                  <button
                    className="cursor-pointer rounded-vu border border-vu-gray-light px-3 py-1.5 text-sm font-medium transition-colors duration-200 hover:border-vu-gold"
                    onClick={() => { setBlockReasonFor(t.id); setBlockReason(''); }}
                  >
                    Block with reason
                  </button>
                </div>
                {blockReasonFor === t.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      autoFocus
                      className="w-full rounded-vu border border-vu-gray-light px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-vu-gold"
                      placeholder="What is blocking this work"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                    />
                    <button
                      className="btn-gold"
                      disabled={!blockReason.trim()}
                      onClick={() => { updateTaskState(t.id, 'blocked', blockReason.trim()); setBlockReasonFor(null); }}
                    >
                      Block
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-vu bg-vu-black p-6 text-vu-white">
            <p className="eyebrow text-vu-gold">Your capacity</p>
            <p className="mt-3 font-serif text-3xl">{myLoad} <span className="text-lg text-vu-white/60">/ {me.capacityCeiling}</span></p>
            <div className="mt-3 h-2 w-full rounded-full bg-vu-white/10" role="meter" aria-valuemin={0} aria-valuemax={me.capacityCeiling} aria-valuenow={myLoad} aria-label="Weighted load against ceiling">
              <div
                className="h-2 rounded-full bg-vu-gold transition-all duration-300"
                style={{ width: `${Math.min((myLoad / me.capacityCeiling) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-vu-white/60">Weighted units of open work. Visible because you cannot argue about a number you cannot see.</p>
          </div>

          <div className="card">
            <p className="eyebrow text-vu-oak">Team load</p>
            <ul className="mt-3 space-y-2">
              {PRACTITIONERS.map((p) => {
                const load = computeLoad(p.id, allTasks);
                return (
                  <li key={p.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className={p.id === me.id ? 'font-semibold' : ''}>{p.name}</span>
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
        </aside>
      </section>
    </div>
  );
}
