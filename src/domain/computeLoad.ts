import type { PodTask, Practitioner } from './types';

const OPEN_STATES = new Set(['assigned', 'in_progress', 'blocked']);

/** Weighted open work for one practitioner. Exited and complete tasks carry no load. */
export function computeLoad(practitionerId: string, allTasks: PodTask[]): number {
  return allTasks
    .filter((t) => t.ownerId === practitionerId && OPEN_STATES.has(t.state))
    .reduce((sum, t) => sum + t.weight, 0);
}

export function loadFraction(p: Practitioner, allTasks: PodTask[]): number {
  return computeLoad(p.id, allTasks) / p.capacityCeiling;
}
