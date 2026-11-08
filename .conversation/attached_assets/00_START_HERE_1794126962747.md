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
