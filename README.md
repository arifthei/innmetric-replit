# InnMetric Programme Demo

A synthetic hotel-discovery and service-coordination demo for a proposed Tourism Department programme, with a separate InnMetric commercial-services workflow.

**This is demonstration software, not a live government programme or financial service.** Evidence, role identities, receipts and payments are simulated. No government affiliation, verified real-world savings or live financial integration is established.

## Start here

- [Consolidated plan and business rules](plan.md)
- [Download the PowerPoint presentation](InnMetric-Programme-Pitch.pptx)
- [Project development guidance](replit.md)

`plan.md` preserves the original requirements, approved decisions, collaboration guidance and recorded release/test notes. Historical plans and test results are not a claim that every planned feature is complete. Original standalone planning documents are retained locally but excluded from the repository.

## What the demo covers

- Evidence-led hotel discovery and hotel confirmation of service needs.
- Joint InnMetric/department review of savings, collections and support.
- Department-administered receipts, allocations, reservations and payments.
- Provider quotes and delivery records, followed by outcome confirmation.
- Separate commercial subscription and on-demand proposals.
- Persistent synthetic visitor sessions and traceable event records.

### Important business rules

- **Savings are not cash.** Savings verification and collection-amount approval are separate joint reviews. Only a department-posted receipt creates pool cash.
- InnMetric cannot execute programme-pool payments.
- Cross-hotel support requires joint InnMetric/department authorization; Hotel A acknowledgement is not a gate.
- Final service outcomes require confirmation from the department, beneficiary hotel and InnMetric.
- Hotel direct payments and commercial services remain outside department cash.
- Unconfigured rates and prices remain unset, not zero. AI has no approval or payment authority.

## Technology

React, TypeScript, Vite and Tailwind CSS on the frontend; Express on the backend; PostgreSQL with Drizzle ORM for persistence. The pnpm workspace includes an OpenAPI specification, generated API clients and Zod validation.

## Repository layout

| Path | Purpose |
| --- | --- |
| `artifacts/innmetric-pitch/` | Interactive programme demo |
| `artifacts/api-server/` | API, business rules and acceptance tests |
| `artifacts/innmetric-presentation/` | Editable presentation source and screenshots |
| `artifacts/mockup-sandbox/` | Component/design preview workspace |
| `lib/db/` | Database connection and schema |
| `lib/api-spec/` | OpenAPI contract and code generation |
| `lib/api-client-react/`, `lib/api-zod/` | Generated clients and validation |
| `fixtures/` | Synthetic records and expected/negative scenarios |
| `scripts/` | Workspace utilities and post-merge setup |
| `plan.md` | Shared product and implementation reference |
| `InnMetric-Programme-Pitch.pptx` | Six-slide presentation export |

## Development setup

### Requirements

- Node.js 24 and pnpm.
- A development PostgreSQL database, with `DATABASE_URL` supplied securely to the process environment.
- Chromium for the browser journey test.

Do not commit database credentials or use production data for the demo. Dependencies must be installed with pnpm, not npm or Yarn.

```bash
git clone https://github.com/arifthei/innmetric-replit.git
cd innmetric-replit
pnpm install --frozen-lockfile
```

With `DATABASE_URL` already configured, apply the schema to the **development database only**:

```bash
pnpm --filter @workspace/db run push
```

This command changes the database schema. Review its prompts before proceeding.

### Run the application

The workspace defines separate API and frontend services. Their configured routes are `/api` and `/innmetric-pitch/`.

For manually started development processes, use separate terminals:

```bash
# Terminal 1: API
PORT=8080 pnpm --filter @workspace/api-server run dev
```

```bash
# Terminal 2: frontend
PORT=23425 BASE_PATH=/innmetric-pitch/ pnpm --filter @workspace/innmetric-pitch run dev
```

**Routing requirement:** the frontend calls `/api` on its own origin. The configured workspace preview routes both services together. Outside that environment, configure a reverse proxy that routes `/api` to port `8080` and `/innmetric-pitch/` to port `23425` (including Vite WebSocket traffic). Opening the Vite port directly without API routing is not a complete local setup.

The role selector and per-tab session identifier are demonstration controls, **not production authentication**.

## Checks and builds

Run commands from the repository root:

```bash
# Workspace type checks
pnpm run typecheck

# Business-rule tests
pnpm --filter @workspace/api-server run test

# Database-backed API tests; requires a running API and development DB
DEMO_API_BASE=http://localhost:8080/api \
  pnpm --filter @workspace/api-server run test:integration

# Browser journey; requires both services behind the shared-origin proxy
# Set DEMO_WEB_URL if your proxy does not listen at localhost:80.
pnpm --filter @workspace/innmetric-pitch run test:browser

# Build the API and demo frontend
pnpm --filter @workspace/api-server run build
PORT=23425 BASE_PATH=/innmetric-pitch/ \
  pnpm --filter @workspace/innmetric-pitch run build
```

The browser script uses `chromium` by default; set `CHROMIUM_BIN` for a different executable location. These commands describe available checks, not a guarantee that all checks currently pass.

After modifying the OpenAPI contract, regenerate the shared API code:

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Working together

- **Founder:** owns product policy, scope and acceptance.
- **Agent:** implements changes and supplies verification evidence.
- **Software lead:** reviews technical decisions, code and test results.

Use separate branches for parallel changes and review pull requests before merging into `main`. Keep policy changes in `plan.md`, avoid concurrent edits to the same files, and never invent missing financial or programme rules. See the collaboration section in the consolidated plan for additional context.

## Demonstration limits

Live crawling, production authentication, real uploads, real payments and commercial checkout are outside this demo's scope. Review signals alone do not establish affordability. Publication and a real-world pilot require separate authorization and validation.
