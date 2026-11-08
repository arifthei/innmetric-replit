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
