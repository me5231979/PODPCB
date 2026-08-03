import type { Practitioner } from '../domain/types';

export const BUSINESS_UNITS = [
  'Operations & Infrastructure',
  'School of Medicine Basic Sciences',
  'College of Arts & Science',
  'School of Engineering',
  'Owen Graduate School of Management',
  'Peabody College',
  'Blair School of Music',
  'School of Nursing',
  'Vanderbilt Law School',
  'Divinity School',
  'Athletics',
  'Student Affairs',
  'Development & Alumni Relations',
  'Finance',
  'Information Technology',
  'Research Administration',
  'Facilities',
  'Public Safety',
  'Libraries',
];

/** Fourteen practitioners across four primary roles, per the FY27 model. */
export const PRACTITIONERS: Practitioner[] = [
  {
    id: 'ec-jordan', name: 'Jordan Hayes', primaryRole: 'EC',
    capabilities: [
      { capabilityId: 'governance_advisory', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-06-15' },
      { capabilityId: 'policy_interpretation', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-05-02' },
      { capabilityId: 'org_structure_design', proficiency: 3, source: 'assignment_history', lastEvidenceAt: '2026-04-20' },
      { capabilityId: 'workforce_plan_build', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-03-11' },
    ],
    capacityCeiling: 100, anchoredBusinessUnits: ['Operations & Infrastructure', 'Facilities', 'Public Safety'],
    availability: [], priorBusinessUnits: ['Operations & Infrastructure', 'Facilities'],
  },
  {
    id: 'ec-priya', name: 'Priya Natarajan', primaryRole: 'EC',
    capabilities: [
      { capabilityId: 'governance_advisory', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-01' },
      { capabilityId: 'succession_risk', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-06-10' },
      { capabilityId: 'spans_layers', proficiency: 3, source: 'assignment_history', lastEvidenceAt: '2026-02-14' },
      { capabilityId: 'workforce_plan_build', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-06-28' },
    ],
    capacityCeiling: 100, anchoredBusinessUnits: ['School of Medicine Basic Sciences', 'School of Nursing'],
    availability: [], priorBusinessUnits: ['School of Medicine Basic Sciences'],
  },
  {
    id: 'ec-marcus', name: 'Marcus Bell', primaryRole: 'EC',
    capabilities: [
      { capabilityId: 'governance_advisory', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-06-20' },
      { capabilityId: 'org_structure_design', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-15' },
      { capabilityId: 'spans_layers', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-15' },
      { capabilityId: 'demand_forecasting', proficiency: 2, source: 'manual', lastEvidenceAt: '2026-01-05' },
    ],
    capacityCeiling: 100, anchoredBusinessUnits: ['College of Arts & Science', 'Peabody College', 'Blair School of Music'],
    availability: [], priorBusinessUnits: ['College of Arts & Science', 'Peabody College'],
  },
  {
    id: 'ec-elena', name: 'Elena Rossi', primaryRole: 'EC',
    capabilities: [
      { capabilityId: 'governance_advisory', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-20' },
      { capabilityId: 'policy_interpretation', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-20' },
      { capabilityId: 'succession_risk', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-05-30' },
    ],
    capacityCeiling: 100, anchoredBusinessUnits: ['Athletics', 'Student Affairs'],
    availability: [{ start: '2026-08-10', end: '2026-08-21', reason: 'pto' }],
    priorBusinessUnits: ['Athletics', 'Student Affairs', 'Finance'],
  },
  {
    id: 'rec-sam', name: 'Sam Okafor', primaryRole: 'Recruiter',
    capabilities: [
      { capabilityId: 'general_recruiting', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-25' },
      { capabilityId: 'offer_construction', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-01' },
      { capabilityId: 'executive_search', proficiency: 3, source: 'assignment_history', lastEvidenceAt: '2026-04-02' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['Operations & Infrastructure', 'Information Technology'],
  },
  {
    id: 'rec-dana', name: 'Dana Whitfield', primaryRole: 'Recruiter',
    capabilities: [
      { capabilityId: 'general_recruiting', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-18' },
      { capabilityId: 'clinical_hiring', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-22' },
      { capabilityId: 'offer_construction', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-06-15' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['School of Nursing', 'School of Medicine Basic Sciences'],
  },
  {
    id: 'rec-luis', name: 'Luis Fuentes', primaryRole: 'Recruiter',
    capabilities: [
      { capabilityId: 'general_recruiting', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-10' },
      { capabilityId: 'faculty_search', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-06-30' },
      { capabilityId: 'offer_construction', proficiency: 2, source: 'manual' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['College of Arts & Science', 'Vanderbilt Law School'],
  },
  {
    id: 'rec-amara', name: 'Amara Diallo', primaryRole: 'Recruiter',
    capabilities: [
      { capabilityId: 'general_recruiting', proficiency: 2, source: 'profile', lastEvidenceAt: '2026-07-28' },
      { capabilityId: 'offer_construction', proficiency: 2, source: 'profile', lastEvidenceAt: '2026-07-28' },
    ],
    capacityCeiling: 80, availability: [], priorBusinessUnits: ['Student Affairs'],
  },
  {
    id: 'comp-grace', name: 'Grace Lindqvist', primaryRole: 'Compensation',
    capabilities: [
      { capabilityId: 'comp_classification', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-20' },
      { capabilityId: 'pay_band_validation', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-20' },
      { capabilityId: 'flsa_analysis', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-06-05' },
      { capabilityId: 'budget_impact', proficiency: 3, source: 'assignment_history', lastEvidenceAt: '2026-05-19' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['Finance', 'Operations & Infrastructure'],
  },
  {
    id: 'comp-theo', name: 'Theo Vance', primaryRole: 'Compensation',
    capabilities: [
      { capabilityId: 'comp_classification', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-12' },
      { capabilityId: 'pay_band_validation', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-12' },
      { capabilityId: 'budget_impact', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-24' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['Athletics', 'Development & Alumni Relations'],
  },
  {
    id: 'comp-noor', name: 'Noor Haddad', primaryRole: 'Compensation',
    capabilities: [
      { capabilityId: 'comp_classification', proficiency: 2, source: 'profile', lastEvidenceAt: '2026-07-26' },
      { capabilityId: 'pay_band_validation', proficiency: 2, source: 'profile', lastEvidenceAt: '2026-07-26' },
      { capabilityId: 'budget_impact', proficiency: 2, source: 'manual' },
    ],
    capacityCeiling: 90, availability: [], priorBusinessUnits: ['Libraries'],
  },
  {
    id: 'hris-wen', name: 'Wen Zhao', primaryRole: 'HRIS',
    capabilities: [
      { capabilityId: 'workforce_dashboards', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-29' },
      { capabilityId: 'attrition_modeling', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-06-18' },
      { capabilityId: 'position_data', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-08' },
      { capabilityId: 'demand_forecasting', proficiency: 3, source: 'assignment_history', lastEvidenceAt: '2026-04-25' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['Information Technology', 'Finance'],
  },
  {
    id: 'hris-ade', name: 'Ade Balogun', primaryRole: 'HRIS',
    capabilities: [
      { capabilityId: 'workforce_dashboards', proficiency: 3, source: 'profile', lastEvidenceAt: '2026-07-14' },
      { capabilityId: 'position_data', proficiency: 4, source: 'profile', lastEvidenceAt: '2026-07-27' },
      { capabilityId: 'workforce_plan_build', proficiency: 2, source: 'manual' },
    ],
    capacityCeiling: 100, availability: [], priorBusinessUnits: ['Research Administration'],
  },
  {
    id: 'hris-kate', name: 'Kate Morrow', primaryRole: 'HRIS',
    capabilities: [
      { capabilityId: 'workforce_dashboards', proficiency: 2, source: 'profile', lastEvidenceAt: '2026-07-21' },
      { capabilityId: 'attrition_modeling', proficiency: 2, source: 'profile', lastEvidenceAt: '2026-07-21' },
      { capabilityId: 'demand_forecasting', proficiency: 2, source: 'manual' },
    ],
    capacityCeiling: 80, availability: [], priorBusinessUnits: ['Divinity School'],
  },
];

/** Dev user switcher personas — the app sits behind SSO in production. */
export const DEV_USERS = [
  { id: 'req-avery', name: 'Avery Coleman', role: 'requester' as const, businessUnit: 'Operations & Infrastructure' },
  { id: 'req-morgan', name: 'Morgan Blake', role: 'requester' as const, businessUnit: 'College of Arts & Science' },
  { id: 'ec-jordan', name: 'Jordan Hayes', role: 'practitioner' as const, businessUnit: '' },
  { id: 'comp-grace', name: 'Grace Lindqvist', role: 'practitioner' as const, businessUnit: '' },
  { id: 'rec-sam', name: 'Sam Okafor', role: 'practitioner' as const, businessUnit: '' },
  { id: 'lead-quinn', name: 'Quinn Sterling', role: 'leadership' as const, businessUnit: '' },
];

export const TODAY = '2026-08-03';
