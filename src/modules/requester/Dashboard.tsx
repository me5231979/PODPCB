import { TODAY } from '../../data/seed';
import { AT_RISK_FRACTION } from '../../config/slaTargets';
import { clockState } from '../../domain/deriveStatus';
import { deriveStatus } from '../../domain/deriveStatus';
import { useAppStore } from '../../store/AppStore';
import { ClockChip, StatusChip, daysBetween, practitionerName } from '../../components/status';
import type { PodRequest, RequestStatus } from '../../domain/types';

function holder(status: RequestStatus): string {
  if (status.kind === 'in_progress') return practitionerName(status.ownerId);
  if (status.kind === 'awaiting_external') return status.destination;
  return '—';
}

const attentionRank: Record<RequestStatus['kind'], number> = {
  blocked: 0, queued: 1, awaiting_external: 2, in_progress: 3, assessing: 4, complete: 5,
};

export function RequesterDashboard({
  onOpen,
  onNewRequest,
}: {
  onOpen: (id: string) => void;
  onNewRequest: () => void;
}) {
  const { requests, allTasks, currentUser } = useAppStore();
  const mine = requests
    .filter((r) => r.requesterId === currentUser.id)
    .map((r) => ({ r, status: deriveStatus(r, allTasks, TODAY), clock: clockState(r, TODAY, AT_RISK_FRACTION) }))
    .sort((a, b) => {
      const byAttention = attentionRank[a.status.kind] - attentionRank[b.status.kind];
      return byAttention !== 0 ? byAttention : a.r.slaDate.localeCompare(b.r.slaDate);
    });

  return (
    <div>
      <section className="py-12">
        <p className="eyebrow text-vu-oak">Your requests</p>
        <div className="mt-2 flex items-end justify-between gap-6">
          <h1 className="font-serif text-4xl leading-[1.1]">
            Where your work <em className="text-vu-oak">stands</em>
          </h1>
          <button className="btn-gold shrink-0" onClick={onNewRequest}>
            Create request
          </button>
        </div>
        <p className="mt-3 max-w-[65ch] text-vu-gray-dark">
          Every request shows who holds it and when it is due. Status comes from the work itself — nobody updates it by hand.
        </p>
      </section>

      {mine.length === 0 ? (
        <div className="card text-center">
          <p className="font-serif text-xl">No requests yet.</p>
          <p className="mt-2 text-sm text-vu-gray-dark">Create a request and watch the working group assemble as you type.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {mine.map(({ r, status, clock }) => {
            const stageDays = daysBetween(r.createdAt, TODAY);
            return (
              <li key={r.id}>
                <button
                  onClick={() => onOpen(r.id)}
                  className="card block w-full cursor-pointer text-left transition-colors duration-200 hover:border-vu-gold"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-vu-gray-dark">{r.id}</div>
                      <div className="font-serif text-xl">{r.title}</div>
                    </div>
                    <ClockChip clock={clock} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-vu-gray-dark">Status</div>
                      <div className="mt-1"><StatusChip status={status} /></div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-vu-gray-dark">Held by</div>
                      <div className="mt-1 font-medium">{holder(status)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-vu-gray-dark">Days in flight</div>
                      <div className="mt-1 font-medium">{stageDays}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-vu-gray-dark">Due</div>
                      <div className="mt-1 font-medium">{r.slaDate}</div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export type { PodRequest };
