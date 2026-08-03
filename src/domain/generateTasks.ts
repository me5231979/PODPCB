import { capabilityById } from '../config/capabilities';
import { ruleForFlag } from '../config/escalation';
import { requestTypeById, type CapabilityRequirement, type RequestTypeId } from '../config/requestTypes';
import { BU_COMPLEXITY, RISK_FLAG_MULTIPLIERS } from '../config/weighting';
import type { PodTask } from './types';

export function complexityScore(typeId: RequestTypeId, riskFlags: string[], businessUnit: string): number {
  const type = requestTypeById(typeId);
  if (!type || type.refused) return 0;
  let weight = type.baseWeight;
  for (const flag of riskFlags) weight *= RISK_FLAG_MULTIPLIERS[flag] ?? 1;
  weight *= BU_COMPLEXITY[businessUnit] ?? 1;
  return Math.round(weight);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Request -> task graph. One task per required capability, plus an exit task
 * per risk flag whose escalation rule leaves the boundary (FLSA, immigration).
 * Exit tasks are created already `exited` — they are not workable inside the pod.
 */
export function generateTasks(
  requestId: string,
  typeId: RequestTypeId,
  requirements: CapabilityRequirement[],
  riskFlags: string[],
  businessUnit: string,
  createdAt: string,
  slaDate: string,
): PodTask[] {
  const type = requestTypeById(typeId);
  if (!type || type.refused) return [];

  const total = complexityScore(typeId, riskFlags, businessUnit);
  const perTask = Math.max(Math.round(total / Math.max(requirements.length, 1)), 2);

  const tasks: PodTask[] = requirements.map((req, i) => {
    const cap = capabilityById(req.capabilityId);
    return {
      id: `${requestId}-t${i + 1}`,
      requestId,
      capabilityId: req.capabilityId,
      label: cap ? cap.label : req.capabilityId,
      ownerId: null,
      dependsOn: [],
      weight: perTask,
      dueDate: addDays(createdAt, Math.round(((i + 1) / (requirements.length + 1)) * daysBetween(createdAt, slaDate))),
      state: 'queued',
    };
  });

  // Governance review, when present, precedes specialist work.
  const governance = tasks.find((t) => capabilityById(t.capabilityId)?.domain === 'governance');
  if (governance) {
    for (const t of tasks) {
      if (t.id !== governance.id) t.dependsOn = [governance.id];
    }
  }

  let exitIndex = 0;
  for (const flag of riskFlags) {
    const rule = ruleForFlag(flag);
    if (!rule?.exitsTo) continue;
    exitIndex += 1;
    tasks.push({
      id: `${requestId}-x${exitIndex}`,
      requestId,
      capabilityId: 'external_review',
      label: `${rule.label} — with ${rule.exitsTo}`,
      ownerId: null,
      dependsOn: [],
      weight: 0, // carries no internal load; nobody inside the pod can move it
      dueDate: slaDate,
      state: 'exited',
      exitedTo: rule.exitsTo,
    });
  }

  return tasks;
}

function daysBetween(aIso: string, bIso: string): number {
  return Math.max(Math.round((new Date(bIso).getTime() - new Date(aIso).getTime()) / 86_400_000), 1);
}
