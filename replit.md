# InnMetric Tourism Programme

Planning a synthetic hotel-discovery and service-coordination demo with department-administered support and a separate InnMetric commercial business.

## Source of truth and implementation gate

- Read root documents `00_START_HERE.md` through `06_BUILD_SPRINT.md`, all three `fixtures/` JSON files, and `docs/ssot/replit-source.md` before implementation. The latter preserves the uploaded project instructions verbatim.
- Version 3 supersedes earlier packs. Later explicit founder decisions override it only when recorded; unresolved policies must not be invented.
- Current authorization is planning only. Creating the project is not authorization to implement. Wait for explicit approval of the proposed build task.
- See `docs/WORKING_TOGETHER.md` for proposed ownership and `docs/DECISIONS.md` for unresolved decisions.
- Department alone administers programme cash. InnMetric may co-approve but never hold or execute pool payments. Commercial records remain separate.
- Savings are not cash. Preserve source and hotel attribution; require explicit cross-hotel authorization, version-bound distinct-role approvals, atomic posting and idempotency.
- Founder decision: cross-hotel allocation requires joint InnMetric/department reviewers only; Hotel A acknowledgement is not required. This overrides the original fixture's pending acknowledgement as a gate, not its attribution requirements.
- Rates and prices remain null, not zero. AI never approves, pays, certifies savings or establishes affordability.
- All demo data and operations are synthetic. No government mandate, affiliation, live discovery or real payments are established. Real uploads and real customer data are out of scope.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
