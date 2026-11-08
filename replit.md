# InnMetric Tourism Programme

Planning a synthetic hotel-discovery and service-coordination demo with department-administered support and a separate InnMetric commercial business.

## Source of truth and implementation gate

- Read root documents `00_START_HERE.md` through `06_BUILD_SPRINT.md`, all three `fixtures/` JSON files, and `docs/ssot/replit-source.md` before implementation. The latter preserves the uploaded project instructions verbatim.
- Version 3 supersedes earlier packs. Later explicit founder decisions override it only when recorded; unresolved policies must not be invented.
- Founder authorized implementation on 2026-11-08. Publication still requires separate confirmation. Record later founder/lead policy decisions in `docs/DECISIONS.md`.
- The client-only fallback was a separate prototype effort. This server-backed demo was implemented only after the founder explicitly authorized it on 2026-11-08.
- Founder-confirmed working arrangement: Agent implements and supplies evidence; software lead reviews technical decisions; founder owns product decisions and acceptance. See `docs/WORKING_TOGETHER.md` and `docs/DECISIONS.md`.
- Department alone administers programme cash. InnMetric may co-approve but never hold or execute pool payments. Commercial records remain separate.
- Savings are not cash. Preserve source and hotel attribution; require explicit cross-hotel authorization, version-bound distinct-role approvals, atomic posting and idempotency.
- Founder decision: cross-hotel allocation requires joint InnMetric/department reviewers only; Hotel A acknowledgement is not required. This overrides the original fixture's pending acknowledgement as a gate, not its attribution requirements.
- Founder decision: final service outcome requires confirmation from the Tourism Department, the beneficiary hotel and InnMetric together. Provider delivery alone cannot close a case; missing confirmation leaves it awaiting verification.
- Founder decision: the explicit collection amount requires a separate joint InnMetric/department approval step after savings review. Savings approval cannot substitute for collection approval; only a separately posted department receipt creates available cash.
- Rates and prices remain null, not zero. AI never approves, pays, certifies savings or establishes affordability.
- All demo data and operations are synthetic. No government mandate, affiliation, live discovery or real payments are established. Real uploads and real customer data are out of scope.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server using its configured workflow port
- `pnpm --filter @workspace/innmetric-pitch run dev` — run the pitch prototype using its configured workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-server run test` — run domain acceptance tests
- `pnpm --filter @workspace/api-server run test:integration` — run database-backed API acceptance tests
- `pnpm --filter @workspace/innmetric-pitch run test:browser` — run the Chromium role-view journey
- `pnpm --filter @workspace/api-server run build` — build the API
- `PORT=4173 BASE_PATH=/innmetric-pitch/ pnpm --filter @workspace/innmetric-pitch run build` — build the pitch app
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Database connection is supplied by the configured workspace environment. Do not use production for these demo tests.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: generated Zod schemas from the OpenAPI contract
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle)

## Where things live

- `artifacts/innmetric-pitch/` — five-screen synthetic demo and guided presenter journey
- `artifacts/api-server/src/demo/domain.ts` and `src/routes/programme-demo.ts` — deterministic rules and server-enforced session actions
- `lib/db/src/schema/programme-demo.ts` — PostgreSQL session/event schema; schema definitions are pushed to development with the db workspace command
- `lib/api-spec/openapi.yaml` — API contract source; run API-spec codegen after contract edits
- `fixtures/` — immutable synthetic source records and expected/negative scenarios
- `docs/REQUIREMENTS_TO_TESTS.md` — acceptance-to-test checklist

## Architecture decisions

- Visitor state is keyed by an opaque per-tab UUID and stored server-side; it is synthetic isolation, not authentication.
- Each business action is an allowlisted API command. Session mutations and append-only events commit together under a row lock.
- Simulated role type is separate from the selected hotel identity; the hotel role can view only its selected synthetic hotel perspective.
- Financial values are integer AED minor units. Posted ledger entries are never overwritten; correction requests reference originals and have no automatic cash effect.
- Four attribution checks are required for savings sign-off: scope, timing, channel mix and cost evidence.

## Product

The prototype connects synthetic discovery, hotel-case review, support approval, department-administered funds and provider outcomes over persistent visitor sessions. InnMetric's subscription/on-demand proposals and unconfigured invoice drafts remain separate from programme funds.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The role switcher is simulated and not production identity. Never describe session UUIDs or role checks as production authentication.
- Verified savings are not cash. Only an independently approved, department-posted synthetic receipt changes pool cash.
- New route or payload changes start in `lib/api-spec/openapi.yaml`; regenerate API helpers before relying on generated contracts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
