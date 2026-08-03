import { z } from 'zod';

export const CapabilityDomain = z.enum([
  'workforce_planning',
  'org_design',
  'talent_acquisition',
  'compensation',
  'hris_data',
  'succession',
  'governance',
]);
export type CapabilityDomain = z.infer<typeof CapabilityDomain>;

export const CapabilitySchema = z.object({
  id: z.string(),
  label: z.string(),
  domain: CapabilityDomain,
  proficiencyScale: z.literal(4).default(4),
  requiresCertification: z.boolean().optional(),
});
export type Capability = z.infer<typeof CapabilitySchema>;

/** Capability taxonomy — seeded from the Project Polaris skills language. */
export const CAPABILITIES: Capability[] = [
  { id: 'comp_classification', label: 'Compensation classification', domain: 'compensation', proficiencyScale: 4 },
  { id: 'pay_band_validation', label: 'Pay band validation', domain: 'compensation', proficiencyScale: 4 },
  { id: 'flsa_analysis', label: 'FLSA analysis', domain: 'compensation', proficiencyScale: 4, requiresCertification: true },
  { id: 'budget_impact', label: 'Budget impact modeling', domain: 'compensation', proficiencyScale: 4 },
  { id: 'org_structure_design', label: 'Org structure design', domain: 'org_design', proficiencyScale: 4 },
  { id: 'spans_layers', label: 'Spans of control analysis', domain: 'org_design', proficiencyScale: 4 },
  { id: 'general_recruiting', label: 'General staff recruiting', domain: 'talent_acquisition', proficiencyScale: 4 },
  { id: 'clinical_hiring', label: 'Clinical hiring', domain: 'talent_acquisition', proficiencyScale: 4 },
  { id: 'faculty_search', label: 'Faculty search', domain: 'talent_acquisition', proficiencyScale: 4 },
  { id: 'executive_search', label: 'Executive search', domain: 'talent_acquisition', proficiencyScale: 4 },
  { id: 'offer_construction', label: 'Offer construction', domain: 'talent_acquisition', proficiencyScale: 4 },
  { id: 'succession_risk', label: 'Succession risk assessment', domain: 'succession', proficiencyScale: 4 },
  { id: 'workforce_dashboards', label: 'Workforce dashboard construction', domain: 'hris_data', proficiencyScale: 4 },
  { id: 'attrition_modeling', label: 'Attrition modeling', domain: 'hris_data', proficiencyScale: 4 },
  { id: 'position_data', label: 'Position data management', domain: 'hris_data', proficiencyScale: 4 },
  { id: 'workforce_plan_build', label: 'Workforce plan construction', domain: 'workforce_planning', proficiencyScale: 4 },
  { id: 'demand_forecasting', label: 'Headcount demand forecasting', domain: 'workforce_planning', proficiencyScale: 4 },
  { id: 'governance_advisory', label: 'Governance and advisory partnership', domain: 'governance', proficiencyScale: 4 },
  { id: 'policy_interpretation', label: 'Policy interpretation', domain: 'governance', proficiencyScale: 4 },
];

export const capabilityById = (id: string): Capability | undefined =>
  CAPABILITIES.find((c) => c.id === id);
