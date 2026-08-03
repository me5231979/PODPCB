import type { CapabilityRequirement } from '../config/requestTypes';
import {
  CONTINUITY_BONUS,
  DECAY_DISCOUNT,
  DECAY_MONTHS,
  LOAD_PENALTY_EXPONENT,
} from '../config/weighting';
import { computeLoad } from './computeLoad';
import type { PodTask, Practitioner } from './types';

export type CandidateScore = {
  practitionerId: string;
  qualified: boolean;
  available: boolean;
  score: number;
  load: number;
};

function isAvailable(p: Practitioner, onDate: string): boolean {
  return !p.availability.some((w) => w.start <= onDate && onDate <= w.end);
}

function monthsBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso);
  const b = new Date(bIso);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/**
 * Score = capability match × proficiency headroom × continuity bonus − load penalty.
 *
 * Proficiency headroom prefers the LOWEST qualified proficiency: routing every
 * hard thing to the strongest person is how a routing system destroys its best
 * practitioner. Level 4 is reserved for work that requires level 4.
 */
export function scoreCandidates(
  requirement: CapabilityRequirement,
  practitioners: Practitioner[],
  allTasks: PodTask[],
  businessUnit: string,
  onDate: string,
): CandidateScore[] {
  return practitioners.map((p) => {
    const cap = p.capabilities.find((c) => c.capabilityId === requirement.capabilityId);
    const available = isAvailable(p, onDate);
    const load = computeLoad(p.id, allTasks);

    // Below the proficiency floor is not a candidate at any load.
    if (!cap || cap.proficiency < requirement.proficiencyFloor) {
      return { practitionerId: p.id, qualified: false, available, score: 0, load };
    }

    let match = 1.0;
    if (cap.lastEvidenceAt && monthsBetween(cap.lastEvidenceAt, onDate) > DECAY_MONTHS) {
      match *= DECAY_DISCOUNT; // decaying capability — discounted, never silently removed
    }

    // Headroom: distance above the floor lowers the score.
    const headroom = 1 - 0.2 * (cap.proficiency - requirement.proficiencyFloor);

    const continuity = p.priorBusinessUnits.includes(businessUnit) ? 1 + CONTINUITY_BONUS : 1;

    const fraction = Math.min(load / p.capacityCeiling, 1);
    const loadPenalty = Math.pow(fraction, LOAD_PENALTY_EXPONENT);

    const score = Math.max(match * headroom * continuity - loadPenalty, 0);
    return { practitionerId: p.id, qualified: true, available, score, load };
  });
}
