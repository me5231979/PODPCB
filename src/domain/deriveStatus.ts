import { BURNDOWN_UNITS_PER_DAY } from '../config/slaTargets';
import type { PodRequest, PodTask, RequestStatus } from './types';

/**
 * Status is computed from task state on every read. There is no stored status
 * field anywhere in the model, and none may be added.
 */
export function deriveStatus(request: PodRequest, allTasks: PodTask[], today: string): RequestStatus {
  const tasks = request.tasks;
  if (tasks.length === 0) return { kind: 'assessing' };

  const workable = tasks.filter((t) => t.state !== 'exited');
  const allDone = workable.every((t) => t.state === 'complete');

  const openExits = tasks.filter((t) => t.state === 'exited');
  if (allDone && openExits.length > 0) {
    return { kind: 'awaiting_external', destination: openExits.map((t) => t.exitedTo ?? 'external partner').join(', ') };
  }
  if (allDone) return { kind: 'complete' };

  const blocked = workable.find((t) => t.state === 'blocked');
  if (blocked) return { kind: 'blocked', reason: blocked.blockedReason ?? blocked.label };

  const inProgress = workable.find((t) => t.state === 'in_progress');
  if (inProgress && inProgress.ownerId) return { kind: 'in_progress', ownerId: inProgress.ownerId };

  const assigned = workable.find((t) => t.state === 'assigned');
  if (assigned && assigned.ownerId) return { kind: 'in_progress', ownerId: assigned.ownerId };

  // Everything still queued: honest position and a projected start from burn-down.
  const queuedAhead = allTasks.filter(
    (t) => t.state === 'queued' && t.requestId !== request.id && t.dueDate <= (tasks[0]?.dueDate ?? today),
  );
  const position = queuedAhead.length + 1;
  const aheadWeight = queuedAhead.reduce((s, t) => s + t.weight, 0);
  const days = Math.ceil(aheadWeight / BURNDOWN_UNITS_PER_DAY) + 1;
  const start = new Date(today);
  start.setDate(start.getDate() + days);
  return { kind: 'queued', position, projectedStart: start.toISOString().slice(0, 10) };
}

export type ClockState = 'on_track' | 'at_risk' | 'breached';

export function clockState(request: PodRequest, today: string, atRiskFraction: number): ClockState {
  if (today > request.slaDate) return 'breached';
  const total = new Date(request.slaDate).getTime() - new Date(request.createdAt).getTime();
  const spent = new Date(today).getTime() - new Date(request.createdAt).getTime();
  if (total > 0 && spent / total >= atRiskFraction) return 'at_risk';
  return 'on_track';
}
