# InnMetric Programme Demo: Build and Release Status

## Release status

Implementation and local verification are complete. The prototype has **not** been published. Publishing requires a separate confirmation and post-publication verification.

## Run the demo

Install the locked workspace dependencies, and apply the demo tables to the configured **development** PostgreSQL database:

```sh
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push
```

Start the configured Replit workflows:

```sh
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/innmetric-pitch run dev
```

The browser preview uses the InnMetric Pitch Prototype workflow. The API integration test uses the API Server workflow. Do not point the integration test at production: each run creates two isolated synthetic sessions.

## Verification outcomes

- `pnpm run typecheck` — passed for libraries, artifacts, and scripts.
- `pnpm --filter @workspace/api-server run test` — passed, 21 of 21 domain tests.
- `pnpm --filter @workspace/api-server run test:integration` — passed against the development database; covered session isolation, server-side role scope, denied actions, collection and allocation approvals, concurrent payment replay, ledger balances, provider delivery, three-party outcome, and export.
- `pnpm --filter @workspace/innmetric-pitch run test:browser` — passed in Chromium; exercised discovery and Hotel A, Hotel B, Hotel C, provider, and department perspectives.
- `pnpm --filter @workspace/api-server run build` — passed.
- `PORT=4173 BASE_PATH=/innmetric-pitch/ pnpm --filter @workspace/innmetric-pitch run build` — passed.
- `pnpm run build` — not successful as a whole-workspace command: it reached the existing mockup-sandbox build, whose Vite config requires `PORT`. The two changed artifacts were built directly with their required environment.
- Development schema push — completed against the configured development database. No production schema or deployment was changed.

## Boundaries and limitations

- All hotel, review, provider, amount, approval, and payment records are synthetic. There is no crawling, vendor lookup, guest data, real upload, real money movement, wallet, or checkout.
- The role selector is a demo perspective switch, not authentication. It does not establish a real person's identity or authorization.
- Department receipt, reservation, and payment actions only change the simulated ledger. InnMetric does not administer pool cash.
- Commercial prices and rates remain **Not configured**; no zero-price or percentage operation is implemented.
- No AI makes an approval or financial decision. The demo makes no claim of proven savings, government adoption, endorsement, or legal policy.
- Exports are synthetic, session-scoped, and include the visible evidence, decisions, event history, relevant fund lineage, and open-item state.
