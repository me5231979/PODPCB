import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEV_USERS, PRACTITIONERS, TODAY } from '../data/seed';
import { createRequest, type CreateRequestInput, type CreateRequestResult } from '../domain/createRequest';
import type { AssignmentDecision, PodRequest, PodTask, TaskState } from '../domain/types';

export type DevUser = (typeof DEV_USERS)[number];

type Store = {
  requests: PodRequest[];
  allTasks: PodTask[];
  decisions: AssignmentDecision[];
  currentUser: DevUser;
  setCurrentUser: (u: DevUser) => void;
  submitRequest: (input: Omit<CreateRequestInput, 'id' | 'createdAt'>) => CreateRequestResult;
  updateTaskState: (taskId: string, state: TaskState, blockedReason?: string) => void;
};

const AppStoreContext = createContext<Store | null>(null);

function seedRequests(): { requests: PodRequest[]; decisions: AssignmentDecision[] } {
  const requests: PodRequest[] = [];
  const decisions: AssignmentDecision[] = [];
  const inputs: Array<Omit<CreateRequestInput, 'id'> & { id: string }> = [
    {
      id: 'REQ-1041', type: 'backfill', businessUnit: 'Operations & Infrastructure', requesterId: 'req-avery',
      title: 'Backfill — Senior Facilities Coordinator', attributes: { positionTitle: 'Senior Facilities Coordinator' },
      riskFlags: [], clearedGateItems: ['pd_current', 'budget_written'], createdAt: '2026-07-21',
    },
    {
      id: 'REQ-1044', type: 'reclassification', businessUnit: 'Operations & Infrastructure', requesterId: 'req-avery',
      title: 'Reclassify — Plant Operations Supervisor', attributes: { positionTitle: 'Plant Operations Supervisor' },
      riskFlags: ['band_exception', 'flsa'],
      clearedGateItems: ['business_case', 'pd_complete', 'org_chart', 'budget_written', 'checklist_reviewed'],
      createdAt: '2026-07-14',
    },
    {
      id: 'REQ-1052', type: 'data_request', businessUnit: 'Operations & Infrastructure', requesterId: 'req-avery',
      title: 'Attrition dashboard for skilled trades', attributes: { dataNeed: 'Quarterly attrition by trade' },
      riskFlags: [], clearedGateItems: [], createdAt: '2026-07-30',
    },
    {
      id: 'REQ-1038', type: 'org_redesign', businessUnit: 'College of Arts & Science', requesterId: 'req-morgan',
      title: 'A&S divisional operations redesign', attributes: { unitScope: 'Divisional operations staff' },
      riskFlags: ['executive_scope'], clearedGateItems: ['sponsor_named', 'current_state'], createdAt: '2026-07-06',
    },
  ];

  const tasksSoFar: PodTask[] = [];
  for (const input of inputs) {
    const result = createRequest(input, PRACTITIONERS, tasksSoFar);
    if (result.ok) {
      requests.push(result.request);
      decisions.push(...result.decisions);
      tasksSoFar.push(...result.request.tasks);
    }
  }

  // Advance a few seeded tasks so the dashboard shows real variety.
  const advance = (reqId: string, index: number, state: TaskState) => {
    const req = requests.find((r) => r.id === reqId);
    const workable = req?.tasks.filter((t) => t.state !== 'exited') ?? [];
    if (workable[index]) workable[index].state = state;
  };
  advance('REQ-1041', 0, 'in_progress');
  advance('REQ-1044', 0, 'complete');
  advance('REQ-1044', 1, 'in_progress');
  advance('REQ-1038', 0, 'in_progress');

  return { requests, decisions };
}

let requestCounter = 1060;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const seeded = useMemo(seedRequests, []);
  const [requests, setRequests] = useState<PodRequest[]>(seeded.requests);
  const [decisions, setDecisions] = useState<AssignmentDecision[]>(seeded.decisions);
  const [currentUser, setCurrentUser] = useState<DevUser>(DEV_USERS[0]);

  const allTasks = useMemo(() => requests.flatMap((r) => r.tasks), [requests]);

  const submitRequest: Store['submitRequest'] = (input) => {
    requestCounter += 1;
    const result = createRequest(
      { ...input, id: `REQ-${requestCounter}`, createdAt: TODAY },
      PRACTITIONERS,
      allTasks,
    );
    if (result.ok) {
      setRequests((prev) => [...prev, result.request]);
      setDecisions((prev) => [...prev, ...result.decisions]);
    }
    return result;
  };

  const updateTaskState: Store['updateTaskState'] = (taskId, state, blockedReason) => {
    setRequests((prev) =>
      prev.map((r) => ({
        ...r,
        tasks: r.tasks.map((t) =>
          t.id === taskId ? { ...t, state, blockedReason: state === 'blocked' ? blockedReason : undefined } : t,
        ),
      })),
    );
  };

  const value: Store = { requests, allTasks, decisions, currentUser, setCurrentUser, submitRequest, updateTaskState };
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): Store {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
