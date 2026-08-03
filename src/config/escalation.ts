export type EscalationRule = {
  flagId: string;
  label: string;
  /** Capability that owns the escalation inside the system, if it stays. */
  routesToCapability?: string;
  consultCapability?: string;
  leadershipInformed?: boolean;
  expeditedSla?: boolean;
  /** Work that leaves the organization boundary. One-way — it does not return. */
  exitsTo?: string;
};

export const ESCALATION_RULES: EscalationRule[] = [
  {
    flagId: 'band_exception',
    label: 'Offer outside approved pay band',
    routesToCapability: 'pay_band_validation',
    consultCapability: 'governance_advisory',
  },
  {
    flagId: 'flsa',
    label: 'FLSA / exemption classification',
    exitsTo: 'Leave Team / EOA',
  },
  {
    flagId: 'mobility_conflict',
    label: 'Internal mobility conflict',
    routesToCapability: 'governance_advisory',
  },
  {
    flagId: 'urgent_retention',
    label: 'Documented urgent retention',
    routesToCapability: 'governance_advisory',
    expeditedSla: true,
  },
  {
    flagId: 'offer_rescission',
    label: 'Offer rescission',
    routesToCapability: 'governance_advisory',
    leadershipInformed: true,
  },
  {
    flagId: 'org_risk',
    label: 'Policy ambiguity or organizational risk',
    routesToCapability: 'governance_advisory',
    consultCapability: 'comp_classification',
  },
  {
    flagId: 'executive_scope',
    label: 'Dean / VC / executive-sponsored',
    routesToCapability: 'governance_advisory',
    leadershipInformed: true,
  },
  {
    flagId: 'immigration',
    label: 'Visa sponsorship or immigration',
    exitsTo: 'Office of Immigration Services',
  },
  {
    flagId: 'clinical',
    label: 'Clinical licensure requirement',
    routesToCapability: 'clinical_hiring',
  },
  {
    flagId: 'contested',
    label: 'Previously declined reclassification',
    routesToCapability: 'governance_advisory',
  },
];

export const ruleForFlag = (flagId: string): EscalationRule | undefined =>
  ESCALATION_RULES.find((r) => r.flagId === flagId);
