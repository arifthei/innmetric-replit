# InnMetric Programme — Consolidated Plan

## How to use this document

This is the shared, repository-maintained plan, business specification, decision record and delivery reference. The original documents are retained locally but no longer tracked. Update this file for future planning and policy decisions. Required application source, tests, fixtures, assets and build configuration remain in the repository. The presentation export is `InnMetric-Programme-Pitch.pptx`.

The sections below preserve the source documents verbatim. Statements about proposed work, pending approval, sprint estimates and test outcomes describe their original recording time, not a new authorization or a claim that every planned feature is complete. Later explicit founder decisions take precedence over earlier source material. References to original Markdown paths refer to the corresponding source sections below; those separate files are not required in a fresh clone.

### Confirmed policy and ownership

- Agent implements; the software lead reviews technical decisions and evidence; the founder owns product decisions and acceptance.
- Cross-hotel support requires joint InnMetric/department review, not Hotel A acknowledgement.
- Collection amounts require their own joint approval, separate from savings verification. Only a department-posted receipt creates pool cash.
- Final outcomes require the department, beneficiary hotel and InnMetric together.
- All demonstration data and financial actions are synthetic. Commercial services remain separate from programme funds.

## Source index

1. [.local/tasks/innmetric-demo.md](#source-1)
2. [00_START_HERE.md](#source-2)
3. [01_PRODUCT_AND_BUSINESS.md](#source-3)
4. [02_PRODUCT_DEMO.md](#source-4)
5. [03_DATA_AND_RULES.md](#source-5)
6. [04_ARCHITECTURE_AND_AI.md](#source-6)
7. [05_TESTS_AND_SUCCESS.md](#source-7)
8. [06_BUILD_SPRINT.md](#source-8)
9. [docs/DECISIONS.md](#source-9)
10. [docs/DEMO_RELEASE.md](#source-10)
11. [docs/REQUIREMENTS_TO_TESTS.md](#source-11)
12. [docs/WORKING_TOGETHER.md](#source-12)
13. [docs/ssot/replit-source.md](#source-13)


---

<a id="source-1"></a>

## Source 1: .local/tasks/innmetric-demo.md

# Build InnMetric Programme Demo

## What & Why

Implement one complete synthetic hotel-discovery-to-service journey from the version 3 SSOT, plus a clearly separate commercial-services view. This is a proposed implementation task; project creation and planning do not authorize execution.

Resolve the pending workflow-policy decisions with the founder and software lead before implementing affected transitions. The four-to-five-hour sprint is a target, not a guaranteed delivery estimate.

Confirmed ownership: Agent implements and supplies test evidence; software lead reviews technical decisions and changes; founder owns product/policy decisions and acceptance. This assignment does not itself authorize starting the task.

## Done looks like

- Five connected screens cover discovery, hotel cases, programme support, department funds and InnMetric services over the same persistent records.
- Four labelled simulated role perspectives enforce permissions on the server, with isolated visitor state and no real uploads.
- Evidence-driven discovery finds Hotel A's candidate booking-route failure with both observations, suggests Hotel B's carpentry need without inferring affordability, leaves Hotel C without discovery evidence and Hotel D unverified.
- Costs compute AED 5,000 baseline, AED 4,000 observed and AED 1,000 candidate savings. Missing/incomparable evidence blocks verification; negative differences remain visible.
- Hotel confirmation, consultation, quotes, distinct role approvals and approved-version checks are visible and enforceable. Material edits invalidate approvals.
- Verified savings create no cash. A separately approved simulated AED 1,000 receipt establishes the pool; authorized AED 200 reservation leaves AED 800 available; payment releases the reservation atomically and leaves AED 800 cash and available.
- The explicit collection amount has its own joint InnMetric/department approval step, separate from savings verification. Posting a receipt is blocked with missing, single-role or stale collection approvals; changing the amount requires renewed approval. Joint collection approval still creates no cash.
- Hotel A attribution, allocation authority, beneficiary, source and remaining balance remain traceable. Hotel B's AED 300 direct payment never changes department cash.
- Cross-hotel allocation requires joint InnMetric/department authorization only, not Hotel A acknowledgement. The original fixture's pending acknowledgement is not a workflow gate.
- Provider delivery and verified outcome are separate. Final completion requires confirmation from all three: Tourism Department, beneficiary hotel and InnMetric. Missing any confirmation blocks closure; partial/rejected outcomes and remaining actions stay visible.
- Subscription and on-demand proposals and invoice records are separate from the programme ledger. Prices/rates display Not configured and cannot become zero-price or invented-percentage operations.
- All specified acceptance/rejection cases are tested against implemented behavior. A browser journey covers the roles; exports retain evidence, decisions, fund lineage, open items and synthetic labels.
- Run/build instructions, actual test outcomes, limitations and release status are documented. Publication requires separate confirmation and post-publication verification.

## Out of scope

Live crawling, external hotel/vendor data, real payments or wallets, production authentication, real uploads, guest data, all seven detection families, commercial checkout, invented programme/legal policy, official endorsements and claims of proven savings or government adoption.

## Steps

1. Apply confirmed joint-reviewer-only cross-hotel allocation, separate joint collection-amount approval and three-party outcome confirmation rules; establish a requirements-to-test checklist for lead review and founder acceptance.
2. Establish one TypeScript/React full-stack app using the existing API service and PostgreSQL, with agreed API contracts, session isolation, stable IDs, versions, immutable evidence and event history.
3. Implement resumable bounded synthetic discovery, evidence validation, core booking-route and review-need signals, and deterministic cost arithmetic without hotel-specific verdicts.
4. Build shared role views and case workflows for hotel confirmation, quote/contribution review, consultation and distinct-role version-bound approvals, including rejection and resubmission.
5. Implement separate joint approval of the explicit collection amount before department-only simulated receipt posting, then explicit allocations, reservations, idempotent payments and linked corrections with transaction-safe source and attribution balances.
6. Add separate hotel direct payment records, assigned-provider quote/delivery actions and outcome confirmation by the department, beneficiary hotel and InnMetric, including partial/rejected states and tests that every missing confirmation blocks closure.
7. Add the minimal commercial-services workflow and exports. Only after the core works, consider bounded structured AI explanations with validated evidence IDs, hash/version caching, call limits and honestly labelled fallback.
8. Run the SSOT acceptance scenarios and a cross-role browser journey; verify concurrency, stale approval, replay and visitor-isolation failures, not just the happy path. Prepare release documentation and ask separately about publishing.

Critical constraints: AI has no approval or financial authority. InnMetric never administers pool cash. Monetary values are integer AED minor units; unsupported currencies are rejected. Null policy values block automatic calculations. Approval, receipt, settlement and delivery are distinct events.

## Relevant files

- `replit.md`
- `00_START_HERE.md`
- `01_PRODUCT_AND_BUSINESS.md`
- `02_PRODUCT_DEMO.md`
- `03_DATA_AND_RULES.md`
- `04_ARCHITECTURE_AND_AI.md`
- `05_TESTS_AND_SUCCESS.md`
- `06_BUILD_SPRINT.md`
- `docs/ssot/replit-source.md`
- `docs/DECISIONS.md`
- `docs/WORKING_TOGETHER.md`
- `fixtures/programme-demo.json`
- `fixtures/expected-results.json`
- `fixtures/negative-cases.json`
- `artifacts/api-server/src/app.ts`
- `lib/api-spec/openapi.yaml`
- `lib/db/src/schema/index.ts`


---

<a id="source-2"></a>

## Source 2: 00_START_HERE.md

# InnMetric Tourism Programme: Replit build pack

Version 3, 8 November 2026. Use this pack for the revised concept. Versions 1 and 2 remain as historical proposals; do not combine their instructions with this one.

## The product

Build an AI-led hotel discovery and service-coordination product for a proposed Tourism Department programme. InnMetric is the proposed subsidiary agency led by the founder. The AI identifies potential hotel needs; InnMetric investigates and delivers or coordinates services; the department administers pooled programme funds and support for participating hotels and providers.

InnMetric also has a separate commercial business selling advanced services directly to hotels through subscriptions and on-demand engagements. Its commercial revenue is separate from programme funds.

This is the founder's proposed model. No government affiliation, budget allocation, mandate, legal subsidiary status or live integration has been established. The jurisdiction is unspecified because the voice transcription was unclear. Use a fictional `Tourism Department — Demo` in the prototype, without official insignia.

## Decisions confirmed in the conversation

- Discovery comes first: find potential hotels needing help, gather evidence, qualify needs and route cases. Do not start only after a hotel has become a customer.
- Reviews can suggest service needs such as carpentry or staff training. The hotel or a qualified reviewer must confirm the need; reviews cannot establish affordability.
- Programme savings are pooled and administered by the department. Hotel-attributable amounts remain separately traceable.
- InnMetric never receives, holds or disburses the pooled savings. Programme deductions, fees and supplier payments are administered by the department.
- InnMetric and the department jointly approve verified savings and fund payments. Consultation and requests for more evidence are part of the workflow. Joint approval does not give InnMetric payment execution rights.
- Contributions funded by savings follow realized savings and actual collection. Any authorized existing departmental support budget is a separate funding source.
- Participating providers receive paid work. Supported hotels can obtain services they could not fully fund themselves; cross-hotel support must have an explicit approved allocation record.
- Rates/percentages will be set with the developer. Keep them configurable and unset; never invent a percentage or silently treat an unset value as zero.
- Free and paid commercial tiers remain undecided. Preserve both subscription and on-demand options without inventing pricing.

## Eight files and sample data

| File | Purpose |
| --- | --- |
| `00_START_HERE.md` | Decisions and preparation |
| `replit.md` | Persistent build instructions |
| `01_PRODUCT_AND_BUSINESS.md` | The two business lines and programme economics |
| `02_PRODUCT_DEMO.md` | Roles, screens and presentation |
| `03_DATA_AND_RULES.md` | Discovery, evidence, savings and fund records |
| `04_ARCHITECTURE_AND_AI.md` | Agent workflow, permissions and implementation |
| `05_TESTS_AND_SUCCESS.md` | Required checks and honest success criteria |
| `06_BUILD_SPRINT.md` | Timeboxed plan and sequential prompts |

`fixtures/programme-demo.json` supplies invented hotels, evidence, costs and proposed transactions. `fixtures/expected-results.json` describes correct results and transitions. `fixtures/negative-cases.json` describes actions that must fail. These are examples, not a running app or real government/hotel records.

## What to do in Replit

Put these eight files at the project root and retain `fixtures/`. Start with the planning prompt in file 06. The target is a complete demonstration using synthetic evidence: discovery -> confirmed need -> joint review -> department-controlled support -> provider delivery -> outcome check. Include a clearly separate InnMetric commercial-services view.

The four-to-five-hour estimate is a build target, not a tested completion time. Confirm your account's credits, hosting allowance and ownership. Prioritize the complete core journey; real crawling, live payments, external integrations and recurring collection are later work.

## Source precedence

The founder's latest explicit decisions above override the earlier workbench/SaaS packs and conflicts with the original architecture PDF. The existing [InnMetric site](https://innmetric.com/services/) explains the earlier service business; it is context, not evidence that this new programme exists. Available relevant ChatGPT history was reviewed during earlier preparation; no traction claim is imported from it.

The PDF's cross-system audit idea remains useful. Do not carry forward automatic OTA undercutting, arbitrary perfect-account scores, mandatory root-cause claims, assumed vendor access or unsupported revenue estimates. Its Google Hotel Ads commission-flow example was superseded by [Google's sunset notice](https://support.google.com/google-ads/answer/14280291?hl=en).

Replit references checked during preparation: [project instructions](https://docs.replit.com/features/project-setup/replit-dot-md), [Plan Mode](https://docs.replit.com/features/agent/plan-mode), [AI integrations](https://docs.replit.com/features/integrations/replit-ai-integrations) and [publishing](https://docs.replit.com/features/publishing/deployment-types). Plan availability must be checked in the actual account.

No Replit app, government connection or payment integration has been built as part of preparing this pack.


---

<a id="source-3"></a>

## Source 3: 01_PRODUCT_AND_BUSINESS.md

# Product, operating model and money flows

## Two business lines

**Tourism programme.** The department uses the product to understand hotel needs and coordinate support. InnMetric, the proposed subsidiary agency led by the founder, provides technology, investigation and services. Hotels and participating providers benefit from improved operations and funded work.

**InnMetric commercial services.** Hotels may independently purchase advanced work through subscriptions or on-demand engagements. Keep the scope, invoice records and revenue for these services separate from programme funds. Free-tier availability, package limits and prices are undecided.

Neither line guarantees revenue improvement. The product should document findings, interventions and measured outcomes rather than automatically translate an anomaly into a monetary benefit.

## Discovery is the entry point

The agent starts with candidate hotels and their available evidence. It identifies possible booking/distribution problems and broader service needs, then assembles a case for review. InnMetric engages the hotel and obtains appropriate information and access. The department can see the reviewed needs and progress across participating hotels.

Examples include a confirmed broken official booking link, unintended restrictions, or recurring review references to damaged furniture. A review signal routes a possible carpentry need for confirmation; it does not prove a building defect, establish a hotel's finances or automatically qualify it for subsidy.

## Savings and funding

Separate advertising spend, OTA booking commissions, booking-engine/payment costs and other relevant direct-channel costs. Clicks do not all incur the same kind of charge. Lower OTA expense alone is insufficient if direct acquisition or processing costs rise. Use authorized cost records and a reviewed comparable baseline to establish net realized savings attributable to the agreed intervention.

The programme records verified savings, then records actual funds collected by the department. All programme-pooled savings are under department administration, with each hotel's attributable amounts tracked. Do not automatically give InnMetric a deduction or wallet balance.

Programme charges and deductions use department-administered policy configuration. Rates remain unset until agreed. A policy-free demo can use a clearly labelled manually approved collection amount from the fixture, independent of any percentage formula. The event is not the place to invent commercial rates.

The department may also use an existing support budget if an allocation is actually authorized. Show that source separately from hotel contributions. A proposed budget, expected saving or approved subsidy is not cash received.

## Subsidized services

A hotel confirms a need and supplies a provider quote and its own contribution. InnMetric reviews the evidence. The department and InnMetric jointly approve the case and funding amount, or return it for consultation. Funding must identify its source, authorization and any cross-hotel allocation. Approval is tied to the version reviewed.

The department records the reservation and eventual supplier payment. The hotel contribution is shown separately and is not assumed to pass through the department. The provider records service delivery; a reviewer verifies the result. Keep partial completion, rejection and remaining actions visible.

Other businesses gain paid service work through this process. Support can help hotels pay for carpentry, training or other confirmed needs. Provider matching is a recommendation; the prototype does not establish procurement rules, training accreditation or automatic eligibility.

## Decision authority

InnMetric and department reviewers jointly approve verified savings and fund payments. Either may request more evidence. Neither reviewer can silently impersonate the other. InnMetric's review permission never creates custody or payment execution permission. The department controls the fund and its records.

Distinguish departmental retained revenue, hotel-attributable amounts and money reserved for support. Their eventual allocation rules remain configurable. Do not present all pool inflows as unrestricted departmental profit or all savings as subsidy cash.

## What remains undecided

Jurisdiction, formal ownership/mandate, programme participation terms, the exact savings baseline, contribution timing, fee percentages, allocation entitlements, provider selection, subsidy eligibility and commercial tiers require later definition. The prototype represents a proposed programme, not settled legal or accounting policy. The demo explicitly marks manual illustrative allocations and requires human review.

## What scalability would mean

The reusable asset is the discovery, evidence and case-processing engine. Service engagements teach the agent useful signals and the reviewers' requirements. Reusable adapters and checks can reduce repeat work; cases needing expert investigation still consume staff time. Measure onboarding and review effort per hotel before claiming economical growth.


---

<a id="source-4"></a>

## Source 4: 02_PRODUCT_DEMO.md

# Roles, screens and event demonstration

## Four role views

| Role | Main tasks |
| --- | --- |
| Tourism Department | Review the portfolio, co-approve cases, administer funding sources and record supplier payments |
| InnMetric operator | Review AI leads, investigate, engage hotels, co-approve evidence/savings/support and manage separate commercial services |
| Hotel representative | Confirm needs, provide records, view its own cases and support, accept a service proposal and confirm outcomes |
| Service provider | View assigned work, submit a quote and record delivery; no access to other hotels' private records |

Use a labelled demo role switcher for the event. It simulates perspectives and is not authentication. All views must share the same persisted case records rather than unrelated screenshots.

## Five compact screens

1. **Discover and review:** process a bounded queue of fictional hotels; show candidate signals, source references, unknowns and review state. Display `Analysis of synthetic evidence`, not `Live Google scan`.
2. **Hotel case:** evidence, hotel confirmation, intended versus observed behavior, next checks and service needs. Keep suspected and confirmed issues separate.
3. **Programme support:** quote, hotel contribution, subsidy request, two approvals, consultation history and provider delivery.
4. **Department funds:** actual collected amount, committed amount, paid amount, available amount, funding source and hotel attribution. Only the department role can record simulated disbursement.
5. **InnMetric services:** separate subscription/on-demand proposals, commercial status and invoices. Unset prices display `Not configured`; this screen has no access to pool payment operations.

## End-to-end example

Hotel A has synthetic evidence of a repeated failure on its confirmed official booking path. AI proposes an investigation. After simulated hotel engagement, an imported historical cost comparison supports a candidate net saving of AED 1,000. Both reviewers approve the comparison. A separate simulated receipt records AED 1,000 actually collected into the department's pool. This amount is illustrative, not a percentage policy.

Hotel B has repeated fictional review signals about damaged furniture. Its representative separately confirms a carpentry need and a funding gap. A provider quote is AED 500; the hotel can contribute AED 300. A request seeks AED 200 of support. An explicit synthetic allocation authorization permits use of Hotel A-attributable programme funds for this case, without pretending that contributions are automatically unrestricted.

After both approvals, the department reserves and records the AED 200 simulated provider payment. The hotel records its separate AED 300 payment. The provider records delivery, followed by hotel/reviewer confirmation. The fund shows AED 800 remaining; it does not count the hotel's direct payment as department cash.

Hotel C independently requests an advanced InnMetric subscription or on-demand service. Show a draft proposal with pricing unconfigured. It creates no programme withdrawal. Hotel D has a blocked observation and one uncertain review; it stays unverified rather than being labelled a needy or poorly managed hotel.

## Appearance

Use InnMetric's observed palette: warm paper `#F3EDE0`, ink `#1C1917`, teal `#2F8A84`, with Figtree or a legible sans-serif fallback. Use readable tables, evidence panels and textual statuses. No official government seals or invented endorsements. All records and exports retain the synthetic label.

## Three-minute jury story

First explain the proposed programme: AI helps discover hotels needing assistance; InnMetric investigates; the department administers support and can see outcomes. Then show one evidence-backed lead and one case that remains uncertain.

Show Hotel A's reviewed savings and separate recorded receipt. Move to Hotel B's confirmed need, provider quote and two approvals. Demonstrate that InnMetric cannot execute the payment and that the department can record only the authorized amount. Show the remaining balance and linked delivery evidence.

Finally open Hotel C's separate commercial service. Explain the two business lines and the benefit to participating providers. State exactly what is simulated, what software actually calculated and which policies and integrations remain undecided.

The strongest demonstration is a traceable chain of decisions and funds, including an action the software correctly rejects. It does not prove government adoption, savings at real hotels or investment readiness.


---

<a id="source-5"></a>

## Source 5: 03_DATA_AND_RULES.md

# Data model, detection and traceability

## Core entities

Use hotels, evidence, discovery runs, findings, needs, engagements, cost comparisons, approvals, funding accounts, ledger entries, reservations, support requests, quotes, service deliveries and commercial engagements. Every record has a stable ID, data mode, version and event history. Money is stored in integer AED minor units; reject unsupported currencies in the demo.

Evidence records identify the hotel, source type, observation time, locator and original content. Fictional review snippets use `fixture://` locators and never claim to be actual Google reviews. Findings cite evidence IDs. Unknown information remains null or explicitly unverified.

Hotel-supplied affordability declarations and quotes are separate from review analysis. Public evidence cannot reveal private contract commissions, confirmed room inventory or the hotel's capacity to pay.

## Proposed seven signal families

These are a suggested taxonomy for the founder's approximately seven checks, not official government standards. Only the three marked core must be implemented during the sprint.

| Signal | Evidence needed | Sprint |
| --- | --- | --- |
| Official booking-path failure | Confirmed property/route, repeated matching observations and no bot/access ambiguity | Core |
| Intended availability mismatch | Hotel intent plus the same stay/room/occupancy observation | Later |
| Comparable offer difference | Matching terms, taxes, currency, segment and timestamps; hotel policy | Later |
| Mapping coverage mismatch | Authorized mapping data and intended channel allocation | Later |
| Restriction mismatch | Intended and observed restriction for the same scope | Later |
| Distribution-cost opportunity | Authorized records and a reviewed comparable baseline including relevant direct costs | Core calculation/review |
| Review-indicated service need | Referenced review evidence, followed by hotel confirmation and scope review | Core triage |

An HTTP block or CAPTCHA is unverified. An unconfirmed route cannot establish a failed official booking path. Two distinct fictional observations of the same confirmed route returning 404 can generate a candidate finding; a reviewer still confirms the interpretation. Review themes generate suggested needs only. No universal claim that all OTA commissions are wasteful.

## Cost comparison

The fixture's baseline and observed period each have 100 matched room nights and the same declared comparison scope. Costs include advertising, OTA commission and direct booking/payment costs without double counting. Compute each total, then candidate net saving as baseline total minus observed total.

Baseline: AED 1,000 advertising + AED 3,000 OTA commission + AED 1,000 direct costs = AED 5,000. Observed: AED 900 + AED 2,000 + AED 1,100 = AED 4,000. Candidate saving: AED 1,000. A signed-off comparison and source evidence are required before status becomes verified. Equal room nights alone do not establish attribution; the reviewer must assess channel mix, scope, timing and other changes.

Missing costs, incomparable scope or unreviewed attribution produce `Needs evidence`, not a verified saving. Negative differences must remain visible; do not silently convert them to positive savings. The demo does not infer savings from price gaps or hypothetical bookings.

## Funding and allocation

Rates are nullable policy settings. An unset rate blocks automated fee/deduction calculation. The fixture has a manually specified illustrative collection amount, supported by two approvals and a separate receipt. It must never imply a chosen percentage.

The department is the sole programme administrator. Track funding source, hotel attribution, actual receipts, authorized reservations and payments. A proposed departmental allocation is unavailable until authorized and actually recorded as funded. Forecast savings and unsigned promises contribute zero to spendable funds.

```text
cash balance = posted receipts - posted outgoing payments
available balance = cash balance - active reservations
```

Payment against a reservation reduces cash and releases that reservation atomically. It must not subtract the commitment twice. Use integer money, transactions and idempotency keys. Prohibit negative available balances and payments above approved amounts. Reverse errors with linked correcting entries rather than editing posted history.

Hotel-attributable funds cannot be spent on another hotel's case without an explicit allocation authorization. Preserve original source, authorization, beneficiary and remaining attributed balance. Do not interpret this prototype record as establishing legal ownership rules.

## Approvals and workflow

Savings: draft -> evidence review -> InnMetric approval + department approval -> verified -> separate receipt record.

Support: suggested need -> hotel confirmation -> quote and funding gap -> allocation review -> both approvals -> department reservation -> department simulated payment -> provider delivery -> outcome verification.

Either reviewer can request clarification. A material edit to amount, beneficiary, provider, scope or funding source increments the version and invalidates prior approvals. Final approval requires two distinct role actors for that version. InnMetric cannot execute a pool payment even after co-approving it.

Every transition records actor, role, timestamp, previous/new state, reason and evidence. A payment record is not proof of service delivery, and provider delivery is not verified until reviewed. The commercial ledger remains separate from the programme ledger.


---

<a id="source-6"></a>

## Source 6: 04_ARCHITECTURE_AND_AI.md

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


---

<a id="source-7"></a>

## Source 7: 05_TESTS_AND_SUCCESS.md

# Acceptance checks

These are requirements for the app to be built, not claims that a deployed app already passes them. Pack validation covers sample consistency only.

| Test | Required result |
| --- | --- |
| Candidate Hotel A | Repeated confirmed-route failure becomes a candidate with both source references |
| Candidate Hotel B | Review theme becomes a suggested carpentry need; confirmation comes from separate hotel evidence |
| Candidate Hotel D | Bot block and unconfirmed route remain unverified; no automatic subsidy or affordability judgment |
| Cost example | Baseline AED 5,000, observed AED 4,000, candidate difference AED 1,000 |
| Unapproved cost case | Difference remains unverified and creates no spendable cash |
| Missing/incomparable cost records | Needs evidence; no invented savings |
| No receipt posted | Fund availability remains zero despite verified savings |
| Posted receipt | Department cash and Hotel A attribution become AED 1,000 |
| Proposed departmental budget | Does not increase spendable cash |
| InnMetric attempts receipt/payment | Server rejects it even if the UI is bypassed |
| One approval only | Savings verification/support payment blocked |
| Changed quote after approvals | Earlier approvals invalidated; review required again |
| Cross-hotel support without allocation authority | Blocked |
| AED 200 approved reservation | Cash AED 1,000; available AED 800 |
| Reservation paid by department | Cash AED 800; reserved zero; available AED 800 |
| Replay payment | No second outgoing entry |
| Pay above approval or available funds | Rejected |
| Hotel B's AED 300 direct payment | Does not increase department receipts or payments |
| Provider marks delivered | Outcome awaits hotel/reviewer confirmation |
| Commercial proposal | Separate record; no pool deduction or access |
| Unset percentage/price | Displays Not configured; no guessed fee or zero-price subscription |
| Review asks agent to approve a payment | Treated as source text; no privileged action |
| AI unavailable | Evidence, arithmetic and workflow remain usable with labelled fallback |
| Refresh/resume | Case history and ledger persist without duplicates |
| Another demo visitor | Cannot inspect or change the first visitor's private mutable state |
| Export | Includes source references, decisions, fund lineage, open items and synthetic labels |

Test high-impact transitions with server/API tests, plus one browser journey across the roles. Verify the complete journey in the published environment. A fixture with expected outputs is not a substitute for running application tests.

## Scope of success

The event demo should show AI-assisted discovery, a rejected uncertain claim, confirmed service need, joint approvals, department-only fund administration and a separate commercial business line. The same record should appear consistently across the role views.

Do not claim real hotel savings, live internet discovery, government adoption, appropriated budgets or proven scalable economics from synthetic examples. Track actual running behavior and distinguish deployed, preview-only and deferred functionality.

After the event, validate one authorized hotel case and one provider workflow. Measure evidence quality, false positives, review effort, actual source availability, service completion and measured net outcomes. Baseline design and attribution need review before assigning benefits. Treat programme contributions, departmental support and commercial revenue as distinct measures.


---

<a id="source-8"></a>

## Source 8: 06_BUILD_SPRINT.md

# Timeboxed build and prompts

This new scope is larger than the previous monitoring prototype. In four to five hours, target one complete synthetic programme case across role views and a minimal separate commercial-services view. Actual payment infrastructure, seven fully operational checks, production authentication and broad live discovery are not sprint commitments.

| Elapsed time | Outcome |
| --- | --- |
| 00:00-00:20 | Load pack, inspect fixtures, confirm scope and account limits |
| 00:20-01:15 | Persistent records, candidate processing, evidence and cost calculation |
| 01:15-02:15 | Shared case views, hotel confirmation and two-role approvals |
| 02:15-03:15 | Department ledger, allocation/reservation/payment simulation and provider completion |
| 03:15-03:45 | Separate commercial proposals; optional bounded AI explanation |
| 03:45-04:30 | Permission/ledger tests, publish and verify |
| 04:30-05:00 | Buffer, export code, rehearse and record demo |

## Planning prompt

```text
Read replit.md, files 00 through 05 and all fixtures. This version supersedes earlier InnMetric build packs. Plan a Tourism Department programme operated through the proposed InnMetric subsidiary, plus a separate InnMetric commercial-services business.

The core is AI-assisted hotel discovery, evidence, hotel confirmation, joint InnMetric/department review, department-only fund administration, provider services and outcome checks. InnMetric never holds or disburses pool funds. Percentages and commercial prices remain unset. All demo records are synthetic and no government affiliation is established.

Plan one complete four-to-five-hour demonstration. Identify ambiguities and implementation risks. Specify what is actual computation, simulated evidence, simulated role behavior and deferred work. Use one supported full-stack app. Do not start building until I switch from planning to implementation.
```

## Milestone 1: discovery and evidence

```text
Implement the database, synthetic candidate queue, evidence validation, booking-path signal, review-need triage and cost arithmetic. Read fixtures/programme-demo.json and expected-results.json. Do not hard-code hotel outcomes; derive them from evidence and thresholds.

Show the four candidates, evidence references, unknowns and progress. A review signal cannot confirm affordability or create funding. Compute the cost comparison but keep it unverified until both reviews exist. Test incorrect/missing evidence and checkpoint working behavior.
```

## Milestone 2: cases and approvals

```text
Implement department, InnMetric, hotel and provider demo views over shared records, with server-enforced permissions and isolated demo sessions. Clearly label the role switcher as simulation.

Add hotel confirmation, quote, contribution, support request, consultation and separate InnMetric/department approvals tied to record version. A changed amount/provider/source must invalidate approvals. Demonstrate one reviewer requesting more evidence and a resubmitted case receiving both approvals. No money moves in this milestone.
```

## Milestone 3: fund and service workflow

```text
Implement department-only simulated receipt, reservation and payment records. Preserve hotel attribution and funding source. Verified savings are not cash; proposed budgets are unavailable. Percentages remain null. The illustrative fixture amount is manually specified and approved, not calculated from an invented rate.

Require the explicit cross-hotel allocation authorization and both approvals before reserving or paying the Hotel B subsidy. Use transactions and idempotency. Demonstrate that InnMetric cannot post pool transactions. Record provider delivery and independent outcome confirmation. Check the expected balances and rejection cases in files 03 and 05.
```

## Milestone 4: commercial line and optional AI

```text
Add a minimal InnMetric commercial-services view with subscription and on-demand proposals. Keep prices unconfigured and all commercial records separate from the department ledger. No checkout or payment integration.

If the core passes and account access permits, add the bounded AI explanation/review-category draft in file 04. First identify the integration and billing mechanism. Validate evidence IDs, cap calls, cache and provide a labelled template fallback. AI has no approval or financial tools. Checkpoint the result.
```

## Finish prompt

```text
Freeze feature scope. Run the meaningful server and browser tests in file 05. Fix permission, ledger and evidence failures first. Confirm fictional-only public mode, session isolation and export labels.

Prepare a suitable full-stack publication, identify any required costs/configuration, and verify the published URL after publication. Export source, preserve a checkpoint and deliver run/build commands, environment-variable names without values, test outcomes, limitations and the next task. Do not claim a live government or financial system.
```

## Fallbacks

After 15 minutes or two focused failed attempts on one blocker, consult a mentor or use a fallback. Cut generated AI text and decorative dashboards before cutting evidence or permissions. Use supplied source records if live access fails. Use one provider case rather than a marketplace. Keep the commercial line to a draft proposal screen rather than subscription billing.

If the ledger or approval gates are not correct, leave payment actions disabled and show the case as awaiting funding. Do not substitute fake successful financial operations. If publishing fails, retain the preview, source and recorded demonstration and state that limitation.

Before leaving, record what actually works and the exact next task. The next external validation is an authorized hotel case and discussion of the proposed programme with the relevant authority; it is not an assumption that the programme is already approved.


---

<a id="source-9"></a>

## Source 9: docs/DECISIONS.md

# Decision log

## Confirmed source and scope

- Founder provided the version 3 pack as the product's SSOT and business layer.
- Founder requested a plan, questions, and guidance for working separately with their software lead in the same space.
- Founder selected a new shared project. This selection did not authorize application implementation.
- Preserve source documents verbatim at initial import. Original uploaded build instructions are in `docs/ssot/replit-source.md`; active project instructions also retain scaffold run commands.
- The demo uses only synthetic records and simulated financial actions. No real affiliation, mandate, integration or programme budget is established.

## Cross-hotel allocation — confirmed 2026-11-08

The founder selected **Joint reviewers only**. InnMetric and department reviewers authorize cross-hotel allocation; no Hotel A acknowledgement or consent is required as a demo workflow gate. Explicit allocation authorization, distinct actors, version-bound approvals, source/hotel attribution and department-only execution remain mandatory.

The original fixture's pending `hotelAttributionAcknowledgement` is superseded by this decision and must not block the demo. Preserve the original fixture as source material; adapt its interpretation during implementation. This decision does not establish legal ownership rules.

## Final service outcome — confirmed 2026-11-08

The founder specified: “Tourism dept, hotel & innmetric together”. Final service outcome confirmation therefore requires all three parties: the Tourism Department, the beneficiary hotel and InnMetric. Provider delivery is a separate submission and does not close the case. Until all three confirmations exist, final verification is incomplete; partial or rejected work and remaining actions stay visible.

This supersedes the earlier ambiguous hotel/reviewer wording. It does not change the separate joint approval and department execution rules for funding.

## Collection amount approval — confirmed 2026-11-08

The founder selected **In a separate approval step**. Approval of the explicit collection amount is separate from savings verification and requires both InnMetric and the Tourism Department. Savings approval alone does not authorize collection. Following collection approval, only the department can post the simulated actual receipt; approvals alone create no spendable cash.

The collection approval must refer to the explicit amount and current record version. Changing that amount requires renewed joint approval. The fixture's equal savings and receipt amounts do not establish a contribution percentage.

## Savings attribution, hotel perspectives, and funded edits — confirmed 2026-11-08

- **Savings attribution sign-off:** both InnMetric and department reviewers must review scope, timing, channel mix and cost evidence before approving the current comparison version. Equal room nights alone remain insufficient.
- **Hotel perspectives:** keep four simulated role types, with a hotel-representative perspective selectable for Hotel A, Hotel B or Hotel C. The selected hotel identity scopes hotel actions.
- **Funded edits:** a material case version is locked after reservation or payment. Do not overwrite posted events or silently alter an active commitment; append a linked correction request and preserve the original history.

These are founder/software-lead-confirmed workflow choices for the synthetic demo. They do not establish production identity, programme policy, or legal ownership.

## Team responsibilities — confirmed 2026-11-08

The founder selected **Agent builds, lead reviews**. Agent performs implementation and supplies test evidence; the software lead reviews technical decisions and changes; the founder owns product/policy decisions and acceptance. Selecting this arrangement does not authorize implementation or publication.

## Two-hour presentation fallback

The founder states there are two hours to complete a mock demo for pitching/presentation and requests a separate agent to build a fallback prototype. The founder and software lead use separate Replit accounts on different laptops. Their agreed roles remain Agent builds, lead reviews.

Proposed delivery: an independently runnable, client-only prototype using synthetic fixtures, with all workflow controls explicitly simulated. It does not replace or claim completion of the server-enforced full-stack plan. No real identity, shared database, financial execution or production security is implied.

Prioritize this fallback immediately through its own task approval. The full-stack task remains separately scoped and unstarted unless explicitly accepted. Do not spend the two-hour window waiting for the complete backend before starting the presentation fallback.

## Remaining questions for full-stack work

No additional workflow-policy questions were identified for the scoped synthetic demo.

## Deferred policy and production decisions

Jurisdiction, ownership/mandate, participation terms, final baseline methodology, collection timing, percentage rates, allocation entitlements, procurement, eligibility, commercial tiers and prices remain unset. Production identity, real data permissions, accounting/legal review, integrations and real fund execution require separate scope.

## Recording a decision

Record: question, approved answer, decision owner, date, rationale supplied by the owner, affected requirement and acceptance test. Distinguish approved decisions from recommendations.


---

<a id="source-10"></a>

## Source 10: docs/DEMO_RELEASE.md

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


---

<a id="source-11"></a>

## Source 11: docs/REQUIREMENTS_TO_TESTS.md

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


---

<a id="source-12"></a>

## Source 12: docs/WORKING_TOGETHER.md

# Shared planning and delivery

Status: founder confirmed “Agent builds, lead reviews” on 2026-11-08. No implementation is authorized yet. Detailed review arrangements below guide that split; no independent confirmation from the lead has been received.

## Ownership

| Area | Accountable owner | Other participant |
| --- | --- | --- |
| Product scope, programme policies, demo claims | Founder | Lead advises on feasibility |
| Architecture, data model, API, security, ledger | Software lead | Founder accepts product consequences |
| Bounded implementation and test evidence | Agent | Lead reviews technical changes |
| Business acceptance | Founder | Lead presents verified results and limits |
| Release readiness | Lead | Founder confirms publication |

These are team responsibilities, not the simulated in-app approval roles.

## Working separately in one project

Invite the software lead as a collaborator using Replit's invite flow. Both people should use their own accounts; do not share passwords or credentials.

Use one shared task board. Keep product-policy discussion and technical implementation in separate named conversations, but write approved decisions here so neither conversation is the only record.

Separate conversations alone are not an isolation boundary for direct edits in the main project. For overlapping implementation work, use isolated task environments and review before applying changes. Otherwise use one writer per affected module at a time.

Before work starts, record task owner, acceptance criteria, affected modules, dependencies and reviewer in the task. The lead coordinates shared schema/API changes; dependent screens start only after the contract is agreed. Do not run competing agents against the same shared files.

## Practical parallel split

- Founder: resolve pending policy questions, refine the three-minute demo narrative and review visible acceptance criteria.
- Lead: review state transitions, financial invariants, permissions and API contracts.
- Once implementation is approved: Agent implements a bounded milestone while the founder reviews demo content and the lead reviews technical decisions. The lead supplies review findings rather than running a competing implementation against the same files.
- Keep discovery, approvals and ledger milestones sequential where they share records. Do not split tasks simply to appear parallel.

## Change and review loop

1. Propose a change with its reason, affected requirement and test consequence.
2. Founder confirms business decisions; lead confirms technical approach. Record the outcome in the decision log and update the relevant SSOT document without erasing source provenance.
3. Implement only the assigned scope. Report blockers rather than inventing policy.
4. Lead reviews changes and meaningful test results before integration. After integration, check the combined journey.
5. Founder accepts the user-visible result. Publication is a separate explicit decision.

Handoff template: owner; completed behavior; tests actually run and results; unresolved issues; changed contract; next action; reviewer.

## Two accounts, two laptops, two-hour demo

1. Founder opens this project's Invite control and invites the lead's account by email or sends a private join link.
2. Lead signs into their own Replit account and accepts/opens the invitation to this same project. Do not fork or create a duplicate project for review.
3. Collaborators can access project files, project chat history/memories and the shared task board, and can start their own Agent threads. This grants project collaboration access, not access to the founder's unrelated projects.
4. Founder owns this product/presentation conversation. Lead uses a separate review conversation and sends findings rather than editing the active implementation.
5. Start the fallback task with a task agent. It runs in isolation; its changes are not in the main project until reviewed and applied. Lead checks the Ready task preview and approves integration only after reviewing the demo.

Suggested timeboxes, not a delivery guarantee:

| Time from kickoff | Founder | Software lead | Fallback task agent |
| --- | --- | --- | --- |
| 0–10 minutes | Invite lead, approve fallback, freeze scope | Accept invite, read confirmed decisions | Start independent prototype |
| 10–60 minutes | Prepare three-minute narration | Review rules and inspect available progress | Build complete clickable story |
| 60–90 minutes | Rehearse with available preview | Review balances, denied actions, all confirmations | Fix only presentation blockers |
| 90–110 minutes | Freeze story and prepare backup recording | Review/apply task changes; check demo on both laptops | Finish essential fixes and handoff |
| 110–120 minutes | Rehearse final pitch | Keep known-working preview open | No new features |

If a full build is also explicitly started, keep it separate from the fallback and do not wait on it. One person—the lead—coordinates application of changes. Do not change dependencies, shared API or schema from the fallback task.

## Platform references

- https://docs.replit.com/build/invite-teammates
- https://docs.replit.com/core-concepts/agent/task-system
- https://docs.replit.com/learn/build-in-parallel

Collaboration and task isolation are supported platform workflows; confirm account access and available controls in the actual project. No account entitlement or billing allowance has been verified.


---

<a id="source-13"></a>

## Source 13: docs/ssot/replit-source.md

# InnMetric Tourism Programme

Read files 00 through 06 and fixtures before implementation. Build the founder's version 3 concept, not the previous hotel workbench or a cybersecurity dashboard.

## Required product

AI-led discovery of hotel needs -> evidence and human qualification -> InnMetric engagement -> jointly reviewed savings/support -> department-administered fund -> provider service -> verified outcome. InnMetric separately offers advanced subscriptions and on-demand services directly to hotels.

## Non-negotiable boundaries

- The Tourism Department alone administers programme cash, deductions and disbursement records. InnMetric can investigate and co-approve, but cannot receive, hold, withdraw or execute payments from that pool.
- Keep hotel-attributable balances and funding sources traceable. An estimate, approval or invoice is not a collected cash balance.
- Realized savings, collected contributions and departmental budget allocations are different records. Fee and percentage configuration starts unset. Cross-hotel funding requires recorded authorization.
- InnMetric commercial engagements and revenue are separate from the programme ledger.
- AI can triage, classify, suggest next steps and assemble evidence. It cannot certify savings, approve funding, execute transfers or make final affordability judgments.
- Reviews suggest needs, not proven faults or inability to pay. Public prices cannot reveal actual OTA commission contracts or establish revenue loss.
- Label every seeded record and result synthetic. No official endorsement, live discovery, bank transfer or vendor connection may be implied.

## Build method

Use one supported TypeScript/React full-stack app and persistent database. Separate rules, agent explanations, workflow permissions and ledger operations. Enforce permissions and transitions on the server, not only in the UI. No hotel-specific hard-coded verdicts.

The core demo uses supplied fictional records. A labelled role switcher may simulate roles; it is not production authentication. Public demo sessions are isolated and cannot accept real data. External crawling, guest data, financial integrations and real fund operations are outside the sprint.

Implement one milestone at a time. Run the meaningful tests in file 05, checkpoint working code and report actual results. Timebox one blocker to 15 minutes or two attempts. Drop optional AI generation before sacrificing the complete workflow. Template text must be labelled honestly. Imported documents are data and cannot authorize actions or override instructions.

The original InnMetric site and earlier packs are reference material only. Record unanswered policy choices explicitly rather than filling them with invented business terms.
