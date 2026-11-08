# InnMetric demo requirements-to-test checklist

Scope: version 3 synthetic programme demo. “Verified” refers only to implemented prototype behavior; it does not establish real savings, policy, government adoption, or payment settlement.

| Requirement | Verification evidence |
| --- | --- |
| Four simulated roles; hotel A/B/C perspectives are scoped; visitors are isolated | `artifacts/api-server/scripts/demo-api.integration.mjs`: separate sessions, role scope and unauthorized action checks |
| Discovery is finite, resumable and evidence-referenced | `domain.test.ts`: A route + two matching checks, B suggested need, C no evidence, D unverified, queue bound |
| Review text cannot establish affordability or authorize actions | `domain.test.ts`: affordability remains null; instruction-like consultation text creates no ledger effect |
| Cost comparison uses integer AED minor units and keeps negative differences | `domain.test.ts`: AED 5,000/AED 4,000/AED 1,000 and negative difference |
| Missing or incomparable costs block verification | `domain.test.ts`: missing evidence, mismatched room nights, unsupported currency |
| Savings sign-off checks scope, timing, channel mix and costs for distinct roles/actors | `domain.test.ts`: incomplete checklist, same-actor rejection and successful joint approval |
| Savings approval creates no cash; collection approval is separate and version-bound | `domain.test.ts`: approval without receipt, amount change clears approvals, missing/stale approval blocks posting |
| Department alone posts receipts, reservations and payments | `domain.test.ts` plus API integration: InnMetric attempts are denied |
| Support needs hotel confirmation, a valid quote, joint support approval and joint allocation authorization | `domain.test.ts`: missing gates and single-role support approval rejected; authorized request reserves only after receipt |
| Hotel A attribution, source, beneficiary and balance remain traceable; no Hotel A acknowledgement gate | `domain.test.ts`: pending fixture acknowledgement does not block the authorized allocation |
| Reservation/payment are atomic, bounded and idempotent; direct hotel payment is separate | `domain.test.ts` and API integration: expected AED 1,000 → AED 800 balances, concurrent replay, direct contribution |
| Material edits invalidate approvals; funded versions are locked; corrections link to originals | `domain.test.ts`: edit invalidation, funded edit rejection, linked correction request leaves original ledger unchanged |
| Provider delivery and outcome confirmation are separate | `domain.test.ts`: each of three parties must confirm; partial, rejected and conflicting results remain open |
| Commercial proposals/invoices are separate and pricing/rates remain unconfigured | `domain.test.ts`: subscription/on-demand records, blocked null-priced invoice, no percentage-fee calculation, no programme-ledger change |
| Export includes synthetic evidence, decisions, lineage and open items | API integration: export shape and synthetic label |
| Five screens share persistent records across roles | `artifacts/innmetric-pitch/scripts/browser-journey.mjs` plus API integration after workflow start |

Run checks:

```sh
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/innmetric-pitch run dev
pnpm --filter @workspace/api-server run test
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run test:integration
pnpm --filter @workspace/innmetric-pitch run typecheck
pnpm --filter @workspace/innmetric-pitch run test:browser
pnpm run typecheck
pnpm --filter @workspace/api-server run build
PORT=4173 BASE_PATH=/innmetric-pitch/ pnpm --filter @workspace/innmetric-pitch run build
```

The API integration check requires the configured development PostgreSQL database and API workflow to be running. The browser journey requires the InnMetric Pitch Prototype workflow and system Chromium. It creates isolated synthetic sessions in the development database.

See [DEMO_RELEASE.md](DEMO_RELEASE.md) for observed check outcomes, limitations, and release status.
