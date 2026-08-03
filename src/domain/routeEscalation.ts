import { ESCALATION_RULES, type EscalationRule } from '../config/escalation';

export type EscalationPath = {
  rule: EscalationRule;
  stays: boolean;
};

/** Risk flags -> the escalation paths the requester will see before confirming. */
export function routeEscalation(riskFlags: string[]): EscalationPath[] {
  return riskFlags
    .map((f) => ESCALATION_RULES.find((r) => r.flagId === f))
    .filter((r): r is EscalationRule => Boolean(r))
    .map((rule) => ({ rule, stays: !rule.exitsTo }));
}
