import { describe, expect, it } from 'vitest';
import { checkGate } from '../src/domain/checkGate';
import { createRequest } from '../src/domain/createRequest';
import { deriveRequirements } from '../src/domain/deriveRequirements';
import { deriveStatus } from '../src/domain/deriveStatus';
import { generateTasks } from '../src/domain/generateTasks';
import { assign } from '../src/domain/assign';
import { computeSla } from '../src/domain/computeSla';
import type { PodRequest, PodTask, Practitioner } from '../src/domain/types';

const TODAY = '2026-08-03';

const practitioner = (over: Partial<Practitioner>): Practitioner => ({
  id: 'p1',
  name: 'Test Person',
  primaryRole: 'Compensation',
  capabilities: [],
  capacityCeiling: 100,
  availability: [],
  priorBusinessUnits: [],
  ...over,
});

describe('intake refusal', () => {
  it('an Employee Relations request cannot create a record by any path', () => {
    const result = createRequest(
      {
        id: 'REQ-X', type: 'employee_relations', businessUnit: 'Finance', requesterId: 'u1',
        title: 'ER matter', attributes: {}, riskFlags: [], clearedGateItems: [], createdAt: TODAY,
      },
      [], [],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.gate.refused).toBe(true);
    }
  });

  it('a compensation request missing written budget confirmation cannot be submitted', () => {
    const gate = checkGate('reclassification', ['business_case', 'pd_complete', 'org_chart', 'checklist_reviewed']);
    expect(gate.ok).toBe(false);
    if (!gate.ok && !gate.refused) {
      expect(gate.missing.map((m) => m.id)).toContain('budget_written');
    }
  });
});

describe('boundary exits', () => {
  it('an FLSA-flagged task is exited to Leave Team/EOA and never holds an internal owner', () => {
    const reqs = deriveRequirements('reclassification', ['flsa']);
    const tasks = generateTasks('R1', 'reclassification', reqs, ['flsa'], 'Finance', TODAY, '2026-08-23');
    const exit = tasks.find((t) => t.state === 'exited');
    expect(exit).toBeDefined();
    expect(exit!.exitedTo).toBe('Leave Team / EOA');
    expect(exit!.ownerId).toBeNull();
  });

  it('an immigration-flagged task exits to OIS', () => {
    const reqs = deriveRequirements('backfill', ['immigration']);
    const tasks = generateTasks('R2', 'backfill', reqs, ['immigration'], 'Finance', TODAY, '2026-08-13');
    const exit = tasks.find((t) => t.state === 'exited');
    expect(exit!.exitedTo).toBe('Office of Immigration Services');
  });
});

describe('assignment', () => {
  const requirement = { capabilityId: 'comp_classification', proficiencyFloor: 3 as const };
  const task = { id: 't1', capabilityId: 'comp_classification', weight: 10 };

  it('never selects a practitioner below the proficiency floor, regardless of load', () => {
    const underqualified = practitioner({
      id: 'weak',
      capabilities: [{ capabilityId: 'comp_classification', proficiency: 2, source: 'profile' }],
    });
    const d = assign(task, requirement, [underqualified], [], 'Finance', TODAY);
    expect(d.selected).toBeNull();
    expect(d.reason).toBe('no_qualified_candidate');
  });

  it('queues the task when all qualified practitioners are at ceiling', () => {
    const busy = practitioner({
      id: 'busy',
      capabilities: [{ capabilityId: 'comp_classification', proficiency: 4, source: 'profile' }],
      capacityCeiling: 20,
    });
    const load: PodTask[] = [{
      id: 'x', requestId: 'r', capabilityId: 'comp_classification', label: 'x', ownerId: 'busy',
      dependsOn: [], weight: 18, dueDate: TODAY, state: 'in_progress',
    }];
    const d = assign(task, requirement, [busy], load, 'Finance', TODAY);
    expect(d.selected).toBeNull();
    expect(d.reason).toBe('throttled_no_capacity');
  });

  it('prefers the lowest qualified proficiency to protect the strongest practitioner', () => {
    const expert = practitioner({
      id: 'expert',
      capabilities: [{ capabilityId: 'comp_classification', proficiency: 4, source: 'profile' }],
    });
    const solid = practitioner({
      id: 'solid',
      capabilities: [{ capabilityId: 'comp_classification', proficiency: 3, source: 'profile' }],
    });
    const d = assign(task, requirement, [expert, solid], [], 'Finance', TODAY);
    expect(d.selected).toBe('solid');
  });

  it('routes around unavailability', () => {
    const away = practitioner({
      id: 'away',
      capabilities: [{ capabilityId: 'comp_classification', proficiency: 3, source: 'profile' }],
      availability: [{ start: '2026-08-01', end: '2026-08-15', reason: 'pto' }],
    });
    const here = practitioner({
      id: 'here',
      capabilities: [{ capabilityId: 'comp_classification', proficiency: 4, source: 'profile' }],
    });
    const d = assign(task, requirement, [away, here], [], 'Finance', TODAY);
    expect(d.selected).toBe('here');
  });

  it('anchored EC receives governance tasks for their unit', () => {
    const anchor = practitioner({
      id: 'anchor', primaryRole: 'EC',
      capabilities: [{ capabilityId: 'governance_advisory', proficiency: 3, source: 'profile' }],
      anchoredBusinessUnits: ['Finance'],
    });
    const other = practitioner({
      id: 'other', primaryRole: 'EC',
      capabilities: [{ capabilityId: 'governance_advisory', proficiency: 3, source: 'profile' }],
    });
    const govTask = { id: 't2', capabilityId: 'governance_advisory', weight: 5 };
    const govReq = { capabilityId: 'governance_advisory', proficiencyFloor: 3 as const };
    const d = assign(govTask, govReq, [other, anchor], [], 'Finance', TODAY);
    expect(d.selected).toBe('anchor');
    expect(d.reason).toBe('anchored');
  });

  it('logs every assignment decision with its full input set', () => {
    const p = practitioner({
      id: 'p', capabilities: [{ capabilityId: 'comp_classification', proficiency: 3, source: 'profile' }],
    });
    const d = assign(task, requirement, [p], [], 'Finance', TODAY);
    expect(d.scores).toHaveLength(1);
    expect(d.scores[0]).toMatchObject({ practitionerId: 'p', qualified: true });
    expect(d.decidedAt).toBe(TODAY);
  });
});

describe('derived status', () => {
  const baseRequest = (tasks: PodTask[]): PodRequest => ({
    id: 'R9', type: 'backfill', businessUnit: 'Finance', requesterId: 'u1', title: 't',
    attributes: {}, riskFlags: [], requiredCapabilities: [], complexityScore: 8,
    tasks, createdAt: TODAY, slaDate: '2026-08-13',
  });
  const t = (over: Partial<PodTask>): PodTask => ({
    id: 'a', requestId: 'R9', capabilityId: 'c', label: 'l', ownerId: null,
    dependsOn: [], weight: 5, dueDate: '2026-08-10', state: 'queued', ...over,
  });

  it('has no stored status field — status is computed on read', () => {
    const r = baseRequest([]);
    expect('status' in r).toBe(false);
    expect(deriveStatus(r, [], TODAY).kind).toBe('assessing');
  });

  it('an exited task blocks completion and names the destination', () => {
    const tasks = [t({ id: 'a', state: 'complete' }), t({ id: 'b', state: 'exited', exitedTo: 'OIS' })];
    const s = deriveStatus(baseRequest(tasks), tasks, TODAY);
    expect(s).toEqual({ kind: 'awaiting_external', destination: 'OIS' });
  });

  it('blocked wins over in progress', () => {
    const tasks = [t({ id: 'a', state: 'blocked', blockedReason: 'waiting on org chart' }), t({ id: 'b', state: 'in_progress', ownerId: 'p' })];
    const s = deriveStatus(baseRequest(tasks), tasks, TODAY);
    expect(s.kind).toBe('blocked');
  });

  it('all queued yields a position and projected start', () => {
    const tasks = [t({ id: 'a', state: 'queued' })];
    const s = deriveStatus(baseRequest(tasks), tasks, TODAY);
    expect(s.kind).toBe('queued');
    if (s.kind === 'queued') {
      expect(s.position).toBeGreaterThanOrEqual(1);
      expect(s.projectedStart > TODAY).toBe(true);
    }
  });
});

describe('SLA', () => {
  it('urgent retention expedites the SLA', () => {
    expect(computeSla('offer_exception', ['urgent_retention'], TODAY) < computeSla('offer_exception', [], TODAY)).toBe(true);
  });
});

describe('escalation-derived requirements', () => {
  it('a band exception pulls compensation and governance capabilities', () => {
    const reqs = deriveRequirements('backfill', ['band_exception']);
    const ids = reqs.map((r) => r.capabilityId);
    expect(ids).toContain('pay_band_validation');
    expect(ids).toContain('governance_advisory');
  });
});
