import { requestTypeById, type CapabilityRequirement, type RequestTypeId } from '../config/requestTypes';
import { ruleForFlag } from '../config/escalation';

/**
 * Request type + risk flags -> required capabilities with proficiency floors.
 * Escalation flags add their routed capability; exiting flags add nothing here
 * (the exit is represented as a task in generateTasks).
 */
export function deriveRequirements(typeId: RequestTypeId, riskFlags: string[]): CapabilityRequirement[] {
  const type = requestTypeById(typeId);
  if (!type || type.refused) return [];

  const merged = new Map<string, CapabilityRequirement>();
  for (const req of type.baseCapabilities) merged.set(req.capabilityId, { ...req });

  for (const flag of riskFlags) {
    const rule = ruleForFlag(flag);
    if (!rule) continue;
    for (const capId of [rule.routesToCapability, rule.consultCapability]) {
      if (!capId) continue;
      const existing = merged.get(capId);
      const floor = 3 as const; // escalated work carries a higher floor
      if (!existing) merged.set(capId, { capabilityId: capId, proficiencyFloor: floor });
      else if (existing.proficiencyFloor < floor) existing.proficiencyFloor = floor;
    }
  }
  return [...merged.values()];
}
