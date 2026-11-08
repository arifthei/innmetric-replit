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
