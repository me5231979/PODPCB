import { z } from 'zod';

export const RequestTypeId = z.enum([
  'backfill',
  'new_position',
  'reclassification',
  'org_redesign',
  'workforce_plan',
  'succession_review',
  'offer_exception',
  'data_request',
  'employee_relations', // present so intake can refuse it by name — never creates a record
]);
export type RequestTypeId = z.infer<typeof RequestTypeId>;

export type CapabilityRequirement = {
  capabilityId: string;
  proficiencyFloor: 1 | 2 | 3 | 4;
};

export type RiskQuestion = {
  id: string;
  /** Plain-language question shown to the requester. */
  question: string;
  /** Internal flag raised when the requester answers yes. */
  flagId: string;
};

export type RequestTypeDef = {
  id: RequestTypeId;
  label: string;
  description: string;
  /** Refused at intake — hard stop, no record, held at the API layer too. */
  refused?: { redirectTo: string; reason: string };
  baseCapabilities: CapabilityRequirement[];
  baseWeight: number;
  slaDays: number;
  riskQuestions: RiskQuestion[];
  attributeFields: { id: string; label: string; kind: 'text' | 'textarea' | 'select'; options?: string[] }[];
};

export const REQUEST_TYPES: RequestTypeDef[] = [
  {
    id: 'backfill',
    label: 'Backfill an existing position',
    description: 'Refill a vacated role with no change to classification or structure.',
    baseCapabilities: [{ capabilityId: 'general_recruiting', proficiencyFloor: 2 }],
    baseWeight: 8,
    slaDays: 10,
    riskQuestions: [
      { id: 'q_exec', question: 'Is this role at the director level or above?', flagId: 'executive_scope' },
      { id: 'q_clinical', question: 'Does this role require a clinical license?', flagId: 'clinical' },
      { id: 'q_visa', question: 'Might the leading candidate need visa sponsorship?', flagId: 'immigration' },
    ],
    attributeFields: [
      { id: 'positionTitle', label: 'Position title', kind: 'text' },
      { id: 'vacancyDate', label: 'Date the position became vacant', kind: 'text' },
      { id: 'hiringLeader', label: 'Hiring leader', kind: 'text' },
    ],
  },
  {
    id: 'new_position',
    label: 'Create a new position',
    description: 'A role that does not exist today, including funding and placement.',
    baseCapabilities: [
      { capabilityId: 'general_recruiting', proficiencyFloor: 2 },
      { capabilityId: 'comp_classification', proficiencyFloor: 2 },
      { capabilityId: 'position_data', proficiencyFloor: 1 },
    ],
    baseWeight: 14,
    slaDays: 15,
    riskQuestions: [
      { id: 'q_exec', question: 'Is this role at the director level or above?', flagId: 'executive_scope' },
      { id: 'q_band', question: 'Do you expect the pay to sit outside the standard band for this kind of role?', flagId: 'band_exception' },
      { id: 'q_visa', question: 'Might the leading candidate need visa sponsorship?', flagId: 'immigration' },
    ],
    attributeFields: [
      { id: 'positionTitle', label: 'Proposed title', kind: 'text' },
      { id: 'fundingSource', label: 'Funding source', kind: 'text' },
      { id: 'hiringLeader', label: 'Hiring leader', kind: 'text' },
    ],
  },
  {
    id: 'reclassification',
    label: 'Reclassify a position',
    description: 'Change the classification, band, or exemption status of an existing role.',
    baseCapabilities: [
      { capabilityId: 'comp_classification', proficiencyFloor: 3 },
      { capabilityId: 'pay_band_validation', proficiencyFloor: 2 },
    ],
    baseWeight: 16,
    slaDays: 20,
    riskQuestions: [
      { id: 'q_band', question: 'Is the proposed pay outside the current band?', flagId: 'band_exception' },
      { id: 'q_flsa', question: 'Does the change affect overtime eligibility (exempt vs non-exempt)?', flagId: 'flsa' },
      { id: 'q_contested', question: 'Has this reclassification been requested and declined before?', flagId: 'contested' },
    ],
    attributeFields: [
      { id: 'positionTitle', label: 'Current position title', kind: 'text' },
      { id: 'proposedTitle', label: 'Proposed title', kind: 'text' },
      { id: 'businessCase', label: 'What changed about the work', kind: 'textarea' },
    ],
  },
  {
    id: 'org_redesign',
    label: 'Redesign an organization',
    description: 'Restructure reporting lines, spans, or layers within a unit.',
    baseCapabilities: [
      { capabilityId: 'org_structure_design', proficiencyFloor: 3 },
      { capabilityId: 'spans_layers', proficiencyFloor: 2 },
      { capabilityId: 'position_data', proficiencyFloor: 2 },
      { capabilityId: 'budget_impact', proficiencyFloor: 2 },
    ],
    baseWeight: 30,
    slaDays: 40,
    riskQuestions: [
      { id: 'q_exec', question: 'Is a dean, vice chancellor, or executive sponsoring this work?', flagId: 'executive_scope' },
      { id: 'q_headcount', question: 'Could any current employee’s role be eliminated or materially changed?', flagId: 'org_risk' },
    ],
    attributeFields: [
      { id: 'unitScope', label: 'Which part of the organization', kind: 'text' },
      { id: 'businessCase', label: 'What outcome the redesign should produce', kind: 'textarea' },
    ],
  },
  {
    id: 'workforce_plan',
    label: 'Build a workforce plan',
    description: 'Forward-looking headcount, skills, and cost plan for a unit.',
    baseCapabilities: [
      { capabilityId: 'workforce_plan_build', proficiencyFloor: 3 },
      { capabilityId: 'demand_forecasting', proficiencyFloor: 2 },
      { capabilityId: 'workforce_dashboards', proficiencyFloor: 2 },
    ],
    baseWeight: 24,
    slaDays: 45,
    riskQuestions: [
      { id: 'q_exec', question: 'Is a dean, vice chancellor, or executive sponsoring this work?', flagId: 'executive_scope' },
    ],
    attributeFields: [
      { id: 'planHorizon', label: 'Planning horizon', kind: 'select', options: ['One year', 'Two years', 'Three years'] },
      { id: 'businessCase', label: 'What decisions the plan should support', kind: 'textarea' },
    ],
  },
  {
    id: 'succession_review',
    label: 'Run a succession review',
    description: 'Assess succession risk and readiness for critical roles.',
    baseCapabilities: [
      { capabilityId: 'succession_risk', proficiencyFloor: 3 },
      { capabilityId: 'governance_advisory', proficiencyFloor: 2 },
    ],
    baseWeight: 18,
    slaDays: 30,
    riskQuestions: [],
    attributeFields: [
      { id: 'roleScope', label: 'Roles in scope', kind: 'textarea' },
    ],
  },
  {
    id: 'offer_exception',
    label: 'Request an offer exception',
    description: 'An offer outside standard terms — pay band, sign-on, or expedited timing.',
    baseCapabilities: [
      { capabilityId: 'offer_construction', proficiencyFloor: 2 },
      { capabilityId: 'pay_band_validation', proficiencyFloor: 3 },
    ],
    baseWeight: 12,
    slaDays: 5,
    riskQuestions: [
      { id: 'q_band', question: 'Is the proposed offer above the approved band?', flagId: 'band_exception' },
      { id: 'q_retention', question: 'Is there a written competing offer in hand?', flagId: 'urgent_retention' },
      { id: 'q_visa', question: 'Does the candidate need visa sponsorship?', flagId: 'immigration' },
    ],
    attributeFields: [
      { id: 'positionTitle', label: 'Position title', kind: 'text' },
      { id: 'exceptionDetail', label: 'What exception you are requesting and why', kind: 'textarea' },
    ],
  },
  {
    id: 'data_request',
    label: 'Request workforce data or a dashboard',
    description: 'Reports, dashboards, or one-time data pulls about your workforce.',
    baseCapabilities: [{ capabilityId: 'workforce_dashboards', proficiencyFloor: 2 }],
    baseWeight: 6,
    slaDays: 7,
    riskQuestions: [],
    attributeFields: [
      { id: 'dataNeed', label: 'What you need to see and what decision it supports', kind: 'textarea' },
    ],
  },
  {
    id: 'employee_relations',
    label: 'Employee relations concern',
    description: 'Workplace concerns, investigations, and legal-sensitive matters.',
    refused: {
      redirectTo: 'Employee Relations intake at hr.vanderbilt.edu/employee-relations',
      reason:
        'Employee relations matters sit outside this system by design. No form, no draft, and no record is created here.',
    },
    baseCapabilities: [],
    baseWeight: 0,
    slaDays: 0,
    riskQuestions: [],
    attributeFields: [],
  },
];

export const requestTypeById = (id: string): RequestTypeDef | undefined =>
  REQUEST_TYPES.find((t) => t.id === id);
