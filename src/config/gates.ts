import type { RequestTypeId } from './requestTypes';

export type GateItem = {
  id: string;
  label: string;
  /** Shown when the item is unchecked — states what to do next, never apologizes. */
  help: string;
};

/**
 * Completeness gates. A request that fails its gate cannot be created —
 * enforced in domain code (checkGate), not only in the form.
 */
export const GATES: Partial<Record<RequestTypeId, GateItem[]>> = {
  backfill: [
    { id: 'pd_current', label: 'Position description is current', help: 'Attach or confirm the position description reflects the work today.' },
    { id: 'budget_written', label: 'Written budget confirmation', help: 'Budget approval must be in writing. Verbal confirmation does not clear this gate.' },
  ],
  new_position: [
    { id: 'business_case', label: 'Business case with need, cost, and funding source', help: 'State why the role exists, what it costs, and where the funding comes from.' },
    { id: 'pd_complete', label: 'Complete position description', help: 'A full position description, not a draft outline.' },
    { id: 'org_chart', label: 'Org chart showing where the role sits', help: 'Attach an org chart reflecting the reporting line for this role.' },
    { id: 'budget_written', label: 'Written budget confirmation', help: 'Budget approval must be in writing. Verbal confirmation does not clear this gate.' },
  ],
  reclassification: [
    { id: 'business_case', label: 'Business case with need, cost, and funding source', help: 'State what changed about the work, what it costs, and where the funding comes from.' },
    { id: 'pd_complete', label: 'Complete position description', help: 'The proposed position description, complete.' },
    { id: 'org_chart', label: 'Org chart showing where the role sits', help: 'Attach an org chart reflecting where the reclassified role sits.' },
    { id: 'budget_written', label: 'Written budget confirmation', help: 'Budget approval must be in writing. Verbal confirmation does not clear this gate.' },
    { id: 'checklist_reviewed', label: 'Pre-submission checklist reviewed', help: 'Review the compensation pre-submission checklist before creating the request.' },
  ],
  org_redesign: [
    { id: 'sponsor_named', label: 'Executive sponsor named', help: 'Name the leader accountable for the redesign decision.' },
    { id: 'current_state', label: 'Current-state org chart attached', help: 'Attach the org chart as it exists today.' },
  ],
  workforce_plan: [
    { id: 'sponsor_named', label: 'Executive sponsor named', help: 'Name the leader who will act on the plan.' },
  ],
  offer_exception: [
    { id: 'offer_detail', label: 'Proposed offer terms documented', help: 'Document the full proposed terms, not a range.' },
    { id: 'budget_written', label: 'Written budget confirmation', help: 'Budget approval must be in writing. Verbal confirmation does not clear this gate.' },
  ],
};

export const gateForType = (typeId: RequestTypeId): GateItem[] => GATES[typeId] ?? [];
