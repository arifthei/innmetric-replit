# InnMetric guided demo

A 10 to 12 minute walkthrough for a hotel owner and a tourism department official. Everything on screen is synthetic. The demo runs from the preview with no setup: open `/innmetric-pitch/` and use the **Guided walkthrough** panel.

Every screen carries the banner "Demonstration data. Not a live service or government programme."

## Before you present

1. Open the preview at `/innmetric-pitch/`. The walkthrough opens on step 1.
2. Tick **Presenter notes** at the bottom of the walkthrough panel. On a narrow screen, press **All steps** first to reach it.
3. Press **Reset demo data** if the session has been used. A fresh session starts from the seed in well under five seconds. The earlier session stays in the audit history.

**Next** moves the screen and switches the simulated role for you. The role in use is shown under each step ("Shown as").

In the presenter notes, **Record this step's actions** is a presenter shortcut. It sends the same server actions you would click by hand, each as its own simulated role, for every step of the current story up to the one you are on. Use it when you are short of time. Clicking the buttons on the screen yourself works just as well and is the better way to show the sign-off gate.

## The 10 minute script

Times are a guide for pacing the talk.

### Part one: the hotel service (about 6 minutes)

| Step | Screen and role | What to say | What to click |
| --- | --- | --- | --- |
| 1. Intake (1 min) | Hotel service, InnMetric | "Demo Hotel A is an invented independent hotel in the GCC. It sells direct and on two OTAs. Its manager reports that the direct booking link fails for one room type, Deluxe King. Two checks returned the same error page. Standard Twin works." Point out that InnMetric works across the hotel's own systems and replaces none of them. | Nothing. |
| 2. Distribution Baseline Audit (1.5 min) | Hotel service, InnMetric | "Before comparing anything we match the room, dates, occupancy, terms, taxes, currency and promotions. OTA 2 looks AED 200 cheaper, but only because it shows the figure before taxes. Matched, there is no difference." Then: "Symptoms are what we observed. Causes are listed separately, and only where they are established with the hotel. OTA 1 is AED 50 lower on matched terms. We do not know why yet, so that finding stays open." | Scroll to Symptoms, Causes and the Findings register. |
| 3. The hotel signs off each change (1 min) | Hotel service, Hotel A representative | "You are now the hotel's approver. Three changes are proposed. Each one shows the step that undoes it. Nothing is proposed for the OTA 1 price because rates are the hotel's decision." | **Sign off CH1**, **CH2**, **CH3**. |
| 4. Approved Repair Sprint (1 min) | Hotel service, InnMetric | "InnMetric can apply only what the approver has signed. The server refuses anything else." Optional: reverse one change and show that it needs a new sign-off. | **Apply CH1**, **CH2**, **CH3**. |
| 5. Verification and handover (1 min) | Hotel service, InnMetric | "We repeat the booking checks. The Deluxe King link and the booking engine search now read Bookable. The OTA 1 difference is still there and is handed over as an open item, not hidden." | **Run repeat checks**. Switch to the Hotel A representative and press **Acknowledge handover**, or use the shortcut. |
| 6. Ongoing Distribution Control (0.5 min) | Hotel service, InnMetric | "This is the monitoring subscription. It rechecks on an agreed schedule and reports what it sees. The second recheck finds Standard Twin not bookable on OTA 2. It is raised to the hotel and nothing is changed without approval." The subscription price shows as not configured. | **Run next recheck** twice. Then **Open the proposed programme**. |

### Part two: the proposed programme (about 4 to 5 minutes)

| Step | Screen and role | What to say | What to click |
| --- | --- | --- | --- |
| 7. Proposed programme (0.5 min) | Programme overview, Tourism Department | "This part is a proposal. A tourism department would hold contributions from verified hotel savings. InnMetric would never hold the pool. Department cash starts at AED 0.00." | Nothing. |
| 8. Savings are not cash (1 min) | Hotel cases, InnMetric | "Hotel A's matched cost comparison: AED 5,000 baseline, AED 4,000 observed, AED 1,000 candidate savings. It is a candidate until InnMetric and the department each complete four attribution checks. Even then it is not cash." | Shortcut, or sign off as each role. |
| 9. Only a department receipt creates pool cash (1 min) | Department funds, Tourism Department | "The collection amount has its own joint approval. Then the department posts a receipt. Only now does cash read AED 1,000.00." | Shortcut, or **Approve AED 1,000.00** as each role and **Post simulated receipt** as the department. |
| 10. Support for Hotel B (1 min) | Programme support, Tourism Department | "Hotel B confirmed a repair need itself. The quote is AED 500. The department reserves AED 200 from the pool, which leaves AED 800 available. Hotel B pays the other AED 300 directly." | Shortcut. |
| 11. The department pays, the ledger shows it (0.5 min) | Department funds, Tourism Department | "The department records the AED 200 payment once. Pool cash is AED 800. Hotel B's AED 300 direct payment is listed outside department cash. InnMetric has no payment button." | Shortcut. |
| 12. Two separate books (0.5 min) | InnMetric services, InnMetric | "InnMetric's own fees are a separate commercial record and never pass through the pool. Prices are not configured, so they show as unset, not zero." Close on what the demo does not claim. | Nothing. |

## What the demo does not claim

- It is not a live service. No hotel system, website, PMS, channel manager, booking engine, OTA account or business listing is read or changed.
- It is not a government programme. No tourism department has adopted, endorsed or funded it. There is no official insignia.
- No real money exists or moves. Receipts, reservations and payments are simulated ledger entries.
- Savings are not cash. Only a receipt posted by the department creates pool cash.
- InnMetric does not hold the pool and does not execute programme payments.
- No customer outcome is claimed. The hotels, the approver, the observations, the room totals and the AED 1,000 savings figure are invented for the demonstration.
- A public price difference alone is not treated as proof of a fault or of lost revenue.
- No ranking, booking volume or permanent fix is promised. A passing check describes that moment only.
- InnMetric does not replace the hotel's PMS, channel manager, booking engine, OTA or RMS and does not make pricing decisions.
- AI does not approve, pay, certify savings or establish affordability. Every approval in the demo is a simulated human role.
- Service fees, subscription prices and programme rates are not configured. They are shown as unset, never as zero.
- The role switcher is a demonstration control. It is not authentication.
- There are no real uploads, crawling, credentials or guest data.

## Assumptions

Where `plan.md` does not settle a point, the most conservative option was taken.

1. **Which hotel the service story uses.** The existing Demo Hotel A, because its fixture already records the failing direct booking route. The repair record does not feed the cost comparison. The service screen states that it does not establish any savings.
2. **Who can see the hotel service record.** Only InnMetric and the Hotel A representative. The Tourism Department, other hotels and providers cannot open it, and its events are left out of their history and export.
3. **Who signs off.** Only the Hotel A representative can sign off a change or acknowledge handover. InnMetric cannot sign for the hotel. A reversed change needs a new sign-off before it can be applied again.
4. **The OTA 1 price finding.** No change is proposed while the cause is not established. It stays open through verification, handover and monitoring.
5. **Room totals in the audit.** The audit needs figures to compare, so the fixture holds synthetic stay totals, labelled as synthetic. InnMetric's own fee and subscription price stay unset.
6. **Recheck intervals.** "7 days after handover" and "14 days after handover" are illustrative demo settings. The screen says they are not a service timetable.
7. **Monitoring findings.** A recheck that finds a problem raises it to the hotel. It never applies a change.
8. **Reset.** "Reset demo data" starts a new server session from the seed fixtures. The earlier session is kept, in line with the append-only event history.
9. **Presenter shortcut.** It only sends the same allowlisted actions through the same server checks, switching the simulated role for each one. It is a presenter convenience and is not described as automation or AI.
10. **Asagi and contrast.** White or paper text on asagi `#2F8A84` is about 4.1:1 and fails WCAG AA for body text. Asagi is used for the wordmark glow, marks, borders and focus. Text and filled buttons use press `#2A6B68`. "Not bookable" is paper on kaki `#8A4B2E`.
11. **Existing fixtures.** `fixtures/programme-demo.json` and the expected and negative cases are unchanged. The hotel story lives in the new `fixtures/hotel-service.json`.
12. **Database.** No table or column was added. The hotel service record is stored in the existing session state, so `db push` reports no change for this work.

## Running the checks

```bash
pnpm run typecheck
```

```bash
pnpm --filter @workspace/api-server run test
```

```bash
DEMO_API_BASE=http://localhost:8080/api pnpm --filter @workspace/api-server run test:integration
```

```bash
pnpm --filter @workspace/innmetric-pitch run test:browser
```

The browser command runs two journeys: the existing role-view journey and the hotel story journey (`artifacts/innmetric-pitch/scripts/hotel-story-journey.mjs`). Set `DEMO_WEB_URL` and `CHROMIUM_BIN` if the preview address or the Chromium binary differ from the defaults.
