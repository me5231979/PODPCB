import type { CapabilityRequirement, RequestTypeId } from '../config/requestTypes';

export type AvailabilityWindow = {
  start: string; // ISO date
  end: string;   // ISO date
  reason: 'pto' | 'leave' | 'vacancy';
};

export type PractitionerCapability = {
  capabilityId: string;
  proficiency: 1 | 2 | 3 | 4;
  source: 'profile' | 'assignment_history' | 'manual';
  lastEvidenceAt?: string; // ISO date
};

export type Practitioner = {
  id: string;
  name: string;
  primaryRole: 'EC' | 'Recruiter' | 'Compensation' | 'HRIS';
  capabilities: PractitionerCapability[];
  capacityCeiling: number;
  anchoredBusinessUnits?: string[];
  availability: AvailabilityWindow[];
  /** Business units this practitioner has completed work for — continuity input. */
  priorBusinessUnits: string[];
};

export type TaskState = 'queued' | 'assigned' | 'in_progress' | 'blocked' | 'complete' | 'exited';

export type PodTask = {
  id: string;
  requestId: string;
  capabilityId: string;
  label: string;
  ownerId: string | null;
  dependsOn: string[];
  weight: number;
  dueDate: string; // ISO date
  state: TaskState;
  exitedTo?: string;
  blockedReason?: string;
};

export type PodRequest = {
  id: string;
  type: RequestTypeId;
  businessUnit: string;
  requesterId: string;
  title: string;
  attributes: Record<string, unknown>;
  riskFlags: string[];
  requiredCapabilities: CapabilityRequirement[];
  complexityScore: number;
  tasks: PodTask[];
  createdAt: string; // ISO date
  slaDate: string;   // ISO date
  // No status field. Status is computed — see deriveStatus.
};

export type RequestStatus =
  | { kind: 'complete' }
  | { kind: 'awaiting_external'; destination: string }
  | { kind: 'blocked'; reason: string }
  | { kind: 'in_progress'; ownerId: string }
  | { kind: 'queued'; position: number; projectedStart: string }
  | { kind: 'assessing' };

export type AssignmentDecision = {
  taskId: string;
  selected: string | null; // practitioner id, or null when throttled to queue
  reason: 'assigned' | 'throttled_no_capacity' | 'no_qualified_candidate' | 'anchored';
  scores: { practitionerId: string; score: number; load: number; qualified: boolean }[];
  decidedAt: string;
};
