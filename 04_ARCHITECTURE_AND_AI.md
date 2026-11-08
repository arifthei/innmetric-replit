# Architecture and bounded agent workflow

## One application

Use a supported TypeScript/React full-stack scaffold, one server and PostgreSQL. Store immutable evidence/snapshots as versioned JSON where useful and relational IDs for approvals, funding and service records. No microservices during the sprint.

```text
Candidate queue -> evidence adapter -> bounded AI/rule triage
                                           |
                                  reviewer + hotel confirmation
                                           |
                              engagement and measured outcomes
                                           |
                             joint programme case approvals
                                           |
                         department funding and provider service

Separate branch: InnMetric commercial subscriptions/on-demand work
```

## Agent tasks

The first agent processes the finite synthetic candidate queue, validates evidence references, identifies known signals and proposes a category, uncertainty and next investigation. It persists progress per hotel and can resume without duplicating findings. Show which records were evaluated and which could not be evaluated.

Use deterministic code for cost arithmetic, workflow, permissions and ledger balances. An optional text model explains findings and classifies the supplied review excerpts into suggested service categories. Require structured output with valid evidence IDs. The model receives no funds, approval authority or payment tools.

Cap run size, time and model calls; a suggested demo limit is four hotels and one explanation call per hotel, with no automatic retry. Cache by evidence hash and model/prompt version. A template fallback must be labelled; never call it a live AI result. Imported text cannot override the agent's scope.

## Discovery sources

Core: the bundled synthetic evidence adapter. It exercises real queueing, classification, evidence references and review behavior without claiming internet discovery occurred. Later adapters may use authorized hotel exports, permitted review sources and public booking-path observations. Preserve source time, access outcome and the exact route used.

Live discovery is a stretch task only with confirmed source access and a strict scope. Do not infer platform/API access from a paid Replit account. Do not bypass access controls, solve bot barriers automatically or use unbounded crawling. Server-side URL access would need explicit public-host checks, redirect controls and request limits before release.

## Permissions

| Action | InnMetric | Department | Hotel | Provider |
| --- | --- | --- | --- | --- |
| Review findings and propose services | Yes | Yes | Own case feedback | Assigned work only |
| Confirm need/own contribution | Assist | Review | Own hotel | No |
| Co-approve savings/support | Yes | Yes | No | No |
| Post programme receipt/reservation/payment | No | Yes, after required gates | No | No |
| Manage InnMetric commercial proposal | Yes | No by default | Own proposal | No |
| Submit quote/delivery | Review | Review | Confirm outcome | Assigned case |

Server enforcement is mandatory. A disabled button is not authorization. Demo roles are simulated within isolated visitor sessions; production requires real identity, permissions and access isolation before real records enter the app.

## No live financial execution

The prototype records simulated receipts and disbursements. It has no bank, wallet or payment integration. Distinguish recorded from settled transactions. Do not introduce an InnMetric wallet for the pool. Joint approval and department execution are separate permissions.

Use transactions for reservation/payment updates and immutable event entries. Build the ledger as a traceable demo of the proposed workflow, not a certified financial system. Production accounting, policy and jurisdictional requirements are separate work after the operating model is agreed.

## Publishing

Public event mode contains fictional data only and isolates sessions. Disable real uploads. Use server secrets for optional AI credentials and a full-stack publishing mode. Verify the published app, database persistence and permissions rather than only the preview.

Checkpoint and export source before leaving. Preserve start/build commands, environment-variable names without values, actual test results, limitations and the next task. Do not modify innmetric.com or imply an official government deployment.
