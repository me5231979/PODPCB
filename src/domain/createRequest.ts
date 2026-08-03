import type { RequestTypeId } from '../config/requestTypes';
import { assign } from './assign';
import { checkGate, type GateResult } from './checkGate';
import { complexityScore, generateTasks } from './generateTasks';
import { computeSla } from './computeSla';
import { deriveRequirements } from './deriveRequirements';
import type { AssignmentDecision, PodRequest, PodTask, Practitioner } from './types';

export type CreateRequestInput = {
  id: string;
  type: RequestTypeId;
  businessUnit: string;
  requesterId: string;
  title: string;
  attributes: Record<string, unknown>;
  riskFlags: string[];
  clearedGateItems: string[];
  createdAt: string;
};

export type CreateRequestResult =
  | { ok: true; request: PodRequest; decisions: AssignmentDecision[] }
  | { ok: false; gate: Exclude<GateResult, { ok: true }> };

/**
 * The full intake pipeline as one pure function:
 * gate -> requirements -> task graph -> assignment (or throttle).
 * Refusal (Employee Relations) and incompleteness hold here, below any UI.
 */
export function createRequest(
  input: CreateRequestInput,
  practitioners: Practitioner[],
  existingTasks: PodTask[],
): CreateRequestResult {
  const gate = checkGate(input.type, input.clearedGateItems);
  if (!gate.ok) return { ok: false, gate };

  const requirements = deriveRequirements(input.type, input.riskFlags);
  const slaDate = computeSla(input.type, input.riskFlags, input.createdAt);
  const tasks = generateTasks(
    input.id, input.type, requirements, input.riskFlags,
    input.businessUnit, input.createdAt, slaDate,
  );

  const decisions: AssignmentDecision[] = [];
  for (const task of tasks) {
    if (task.state === 'exited') continue;
    const requirement = requirements.find((r) => r.capabilityId === task.capabilityId);
    if (!requirement) continue;
    const decision = assign(task, requirement, practitioners, [...existingTasks, ...tasks], input.businessUnit, input.createdAt);
    decisions.push(decision);
    if (decision.selected) {
      task.ownerId = decision.selected;
      task.state = 'assigned';
    }
  }

  const request: PodRequest = {
    id: input.id,
    type: input.type,
    businessUnit: input.businessUnit,
    requesterId: input.requesterId,
    title: input.title,
    attributes: input.attributes,
    riskFlags: input.riskFlags,
    requiredCapabilities: requirements,
    complexityScore: complexityScore(input.type, input.riskFlags, input.businessUnit),
    tasks,
    createdAt: input.createdAt,
    slaDate,
  };

  return { ok: true, request, decisions };
}
