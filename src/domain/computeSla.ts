import { requestTypeById, type RequestTypeId } from '../config/requestTypes';
import { ruleForFlag } from '../config/escalation';
import { EXPEDITED_SLA_DAYS } from '../config/slaTargets';

/** SLA date from type target, expedited when an escalation rule says so. */
export function computeSla(typeId: RequestTypeId, riskFlags: string[], createdAt: string): string {
  const type = requestTypeById(typeId);
  let days = type?.slaDays ?? 10;
  if (riskFlags.some((f) => ruleForFlag(f)?.expeditedSla)) days = Math.min(days, EXPEDITED_SLA_DAYS);
  const d = new Date(createdAt);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
