import type { CapabilityRequirement } from '../config/requestTypes';
import { ANCHOR_OVERRIDE_CEILING } from '../config/weighting';
import { capabilityById } from '../config/capabilities';
import { computeLoad } from './computeLoad';
import { scoreCandidates } from './scoreCandidates';
import type { AssignmentDecision, PodTask, Practitioner } from './types';

const GOVERNANCE_DOMAINS = new Set(['governance']);

/**
 * Select an owner for a task, or throttle it to the queue.
 *
 * EC anchoring: governance and advisory tasks for an anchored business unit go
 * to the anchored EC regardless of load, up to the hard override ceiling.
 */
export function assign(
  task: Pick<PodTask, 'id' | 'capabilityId' | 'weight'>,
  requirement: CapabilityRequirement,
  practitioners: Practitioner[],
  allTasks: PodTask[],
  businessUnit: string,
  onDate: string,
): AssignmentDecision {
  const scores = scoreCandidates(requirement, practitioners, allTasks, businessUnit, onDate);
  const capability = capabilityById(task.capabilityId);

  // Anchoring check for governance/advisory work.
  if (capability && GOVERNANCE_DOMAINS.has(capability.domain)) {
    const anchor = practitioners.find(
      (p) => p.primaryRole === 'EC' && p.anchoredBusinessUnits?.includes(businessUnit),
    );
    if (anchor) {
      const anchorScore = scores.find((s) => s.practitionerId === anchor.id);
      const anchorLoad = computeLoad(anchor.id, allTasks);
      if (anchorScore?.qualified && anchorScore.available && anchorLoad < ANCHOR_OVERRIDE_CEILING) {
        return {
          taskId: task.id,
          selected: anchor.id,
          reason: 'anchored',
          scores: scores.map(({ practitionerId, score, load, qualified }) => ({ practitionerId, score, load, qualified })),
          decidedAt: onDate,
        };
      }
    }
  }

  const eligible = scores
    .filter((s) => s.qualified && s.available)
    .sort((a, b) => b.score - a.score);

  const record = scores.map(({ practitionerId, score, load, qualified }) => ({ practitionerId, score, load, qualified }));

  if (eligible.length === 0) {
    const anyQualified = scores.some((s) => s.qualified);
    return {
      taskId: task.id,
      selected: null,
      reason: anyQualified ? 'throttled_no_capacity' : 'no_qualified_candidate',
      scores: record,
      decidedAt: onDate,
    };
  }

  const best = eligible[0];
  const bestP = practitioners.find((p) => p.id === best.practitionerId)!;

  // Throttle rather than assign work that cannot start.
  if (best.load + task.weight > bestP.capacityCeiling) {
    return { taskId: task.id, selected: null, reason: 'throttled_no_capacity', scores: record, decidedAt: onDate };
  }

  return { taskId: task.id, selected: best.practitionerId, reason: 'assigned', scores: record, decidedAt: onDate };
}
