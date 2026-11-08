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
