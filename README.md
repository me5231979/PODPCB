# POD Platform — Workforce Request System

A pod is formed per request, not assigned in advance.

A requester submits a need. The system derives the capabilities that need requires, finds who
holds them, checks capacity and availability, and assembles the working group. The requester
sees one dashboard — status, holder, due date — and never the org structure behind it.

Built for Vanderbilt People, Culture & Belonging's FY27 business-aligned workforce planning
model, wearing the Futures Learning Hub visual identity (VU black, white, and metallic gold;
Libre Caslon Display / Inter / Antonio).

## What this is

The working pilot described by build-order steps 1–6 of the spec, with in-memory storage:

- **Config layer** (`src/config`) — capability taxonomy, request types, completeness gates,
  escalation rules, complexity weighting, SLA targets. Typed data, Zod at the boundary.
- **Domain layer** (`src/domain`) — pure functions, no I/O: requirement derivation, candidate
  scoring, load computation, assignment with throttling, task generation, derived status,
  escalation routing, SLA. Fully covered by `tests/domain.test.ts`; the suite passes with the
  network disabled.
- **Requester module** — dashboard sorted by attention needed, request detail with a stage
  timeline, and a five-step guided submission flow with a hard completeness gate, plain-language
  risk questions, and a live panel that shows the working group assembling while you type.
- **Practitioner module** — queue by due date, personal capacity meter, team load.
- **Leadership module** — queue depth by capability, coverage gaps (single points of failure),
  team load, assignment decision log, and the open questions that need leadership answers.

## Design guarantees (enforced in domain code, not just UI)

- An Employee Relations request cannot create a record by any path. Intake refuses and redirects.
- A compensation request without **written** budget confirmation cannot be submitted.
- FLSA and immigration work is marked `exited` (to Leave Team/EOA and OIS respectively) — never
  shown as "in progress" while nobody inside the pod can move it.
- There is no stored status field. Status is computed on read from task state.
- Assignment never selects below the proficiency floor, prefers the lowest qualified proficiency
  (protecting the strongest practitioners), and throttles honestly to a queue with a projected
  start date when nobody has capacity.
- Every assignment decision is logged with its full input set.

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # 16 domain tests
npm run build    # type-check + production build
```

Auth is stubbed with the "Viewing as" user switcher in the header — the production app sits
behind Vanderbilt SSO and receives identity plus business unit on a request header.

## Not built here, by design

Employee Relations cases; any write path to Oracle HCM; candidate records; performance, leave,
or health data; salary figures for named individuals. Integrations (Oracle Grow nightly sync,
Oracle HCM read-only metrics, calendar availability, the Monday.com outbound mirror) are the
next build phases and are isolated behind `src/integrations` when they land — the domain layer
must never import from them.
