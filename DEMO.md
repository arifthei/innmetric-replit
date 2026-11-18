# InnMetric guided demo

Four meeting journeys in one app: the hotel service (B2B), the proposed tourism programme (B2G) and two partner discussions, with Ireckonu and with Torus Legacy. The hotel and programme walkthrough takes about 15 minutes; each partner discussion about 10. Everything on screen is synthetic. The demo runs from the preview with no setup: open `/innmetric-pitch/` and use the **Guided walkthrough** panel.

Every screen carries the banner "Demonstration data. Not a live service or government programme."

## Before you present

1. Open the preview at `/innmetric-pitch/`. The walkthrough opens on step 1.
2. Tick **Presenter notes** at the bottom of the walkthrough panel. On a narrow screen, press **All steps** first to reach it.
3. Press **Reset demo data** if the session has been used. A fresh session starts from the seed in well under five seconds. The earlier session stays in the audit history.

**Next** moves the screen and switches the simulated role for you. Each step names its **role type** (InnMetric operator, Tourism Department, Hotel representative or Service provider) and, for a hotel representative, its **hotel identity** (Hotel A, B or C).

In the presenter notes, **Record this step's actions** is a presenter shortcut. It sends the same server actions you would click by hand, each as its own simulated role, for every step of the current story up to the one you are on. Use it when you are short of time. Clicking the buttons on the screen yourself works just as well and is the better way to show the sign-off gate.

## Copy-ready links

On the Replit publication (`https://inn-metric-programme-planning.replit.app`), and the same paths under `https://innmetric.com/collab/` once that is live:

- Main demo: `/innmetric-pitch/`
- Ireckonu meeting: `/innmetric-pitch/partners/ireckonu/?present=1`
- Torus Legacy meeting: `/innmetric-pitch/partners/torus-legacy/?present=1`

The partner links open straight into Present mode and work without the programme API. Back and Forward between the main demo and a partner page keep the main demo's page and simulated role.

## Journey 1 and 2: the walkthrough script

Times are a guide for pacing the talk.

### Part one: the hotel service (about 6 minutes)

| Step | Screen and role | What to say | What to click |
| --- | --- | --- | --- |
| 1. Intake (1 min) | Hotel service, InnMetric | "Demo Hotel A is an invented independent hotel in the GCC. It sells direct and on two OTAs. Its manager reports that the direct booking link fails for one room type, Deluxe King. Two checks returned the same error page. Standard Twin works." Point out that InnMetric works across the hotel's own systems and replaces none of them. | Nothing. |
| 2. Distribution Baseline Audit (1.5 min) | Hotel service, InnMetric | "Before comparing anything we match the room, dates, occupancy, terms, taxes, currency and promotions. OTA 2 looks AED 200 cheaper, but only because it shows the figure before taxes. Matched, there is no difference." Then: "Symptoms are what we observed. Causes are listed separately, and only where they are established with the hotel. OTA 1 is AED 50 lower on matched terms. We do not know why yet, so that finding stays open." | Scroll to Symptoms, Causes and the Findings register. |
| 3. The hotel signs off each change (1 min) | Hotel service, Hotel A representative | "You are now the hotel's approver. Three changes are proposed. Each one shows the step that undoes it. Nothing is proposed for the OTA 1 price because rates are the hotel's decision." | **Sign off CH1**, **CH2**, **CH3**. |
| 4. Approved Repair Sprint (1 min) | Hotel service, InnMetric | "InnMetric can apply only what the approver has signed. The server refuses anything else." Optional: reverse one change and show that it needs a new sign-off. | **Apply CH1**, **CH2**, **CH3**. |
| 5. Verification and handover (1 min) | Hotel service, InnMetric | "We repeat the booking checks. The Deluxe King link and the booking engine search now read Bookable. The OTA 1 difference is still there and is handed over as an open item, not hidden." Then the card below: what the hotel gets, what it controls, and the audit, repair and monitoring offers, with prices not configured. | **Run repeat checks**. Switch to the Hotel A representative and press **Acknowledge handover**, or use the shortcut. |
| 6. Ongoing Distribution Control (0.5 min) | Hotel service, InnMetric | "This is the monitoring subscription. It rechecks on an agreed schedule and reports what it sees. The second recheck finds Standard Twin not bookable on OTA 2. It is raised to the hotel and nothing is changed without approval." The subscription price shows as not configured. | **Run next recheck** twice. Then **Open the proposed programme**. |

### Part two: the proposed programme (about 8 minutes)

Every action below is a real server action by the named simulated person. The presenter shortcut records them in the same order.

| Step | Screen and role | What to say | What to click |
| --- | --- | --- | --- |
| 7. Proposed programme and who is who (0.5 min) | Programme overview, Tourism Department | "This part is a proposal. A department would hold contributions from verified hotel savings; InnMetric never holds the pool. Four role types act in it, and the hotel representative can speak for three different hotels." Point to **Who is who**. Cash is AED 0.00. | Nothing. |
| 8. InnMetric finds the evidence (0.5 min) | Discovery, InnMetric | "InnMetric works through a bounded queue. Each result cites its records. A signal never creates a funding decision." | **Process next candidate** four times. |
| 9. Hotel A, the source property (0.5 min) | Hotel cases, Hotel representative · Hotel A | "Hotel A sees only its own case: AED 5,000 baseline, AED 4,000 observed, AED 1,000 candidate savings. It cannot see Hotel B." | Nothing. |
| 10. Hotel B confirms its need (0.5 min) | Hotel cases, Hotel representative · Hotel B | "Reviews suggested a carpentry repair. Only Hotel B can confirm it." | **Confirm as Hotel B**. |
| 11. Savings are not cash (0.5 min) | Hotel cases, InnMetric | "InnMetric and the department each sign off four attribution checks. Verified savings still create no cash." | Tick the four checks, **Approve current comparison**; repeat as the department. |
| 12. A department receipt creates pool cash (0.5 min) | Department funds, Tourism Department | "The AED 1,000 collection has its own joint approval. Only the department posts the receipt. Now pool cash is AED 1,000, attributed to Hotel A." Point to the cash sequence. | **Approve AED 1,000.00** as InnMetric and as the department, then **Post simulated receipt**. |
| 13. The provider's quote (0.5 min) | Programme support, Service provider | "The provider sees its job: an AED 500 carpentry quote. No funding amounts, no other hotels." A revised quote, if used, must come now: it clears every funding approval. | Nothing. |
| 14. Funding for Hotel B (0.5 min) | Programme support, Tourism Department | "InnMetric and the department each approve the cross-hotel allocation and the support. The department reserves AED 200. AED 800 stays available." | Approve allocation and support as each role; **Reserve AED 200.00** as the department. |
| 15. Payments (0.5 min) | Department funds, Tourism Department | "The department pays AED 200 once. Hotel B pays its AED 300 directly. Together they cover the AED 500 repair; pool cash is AED 800." | **Post department payment**; as Hotel B, **Record direct payment as Hotel B**. |
| 16. The provider records delivery (0.5 min) | Programme support, Service provider | "Delivery is a submission. The outcome waits for three confirmations." | **Record provider delivery**. |
| 17. InnMetric and the department review (0.5 min) | Programme support, Tourism Department | "Each confirms the same delivery as completed. Two of three: still open." | **Confirm outcome** as InnMetric and as the department. |
| 18. Hotel B closes the outcome (0.5 min) | Programme support, Hotel representative · Hotel B | "Hotel B's matching confirmation is the third. The audit shows the status change to verified." | **Confirm outcome as Hotel representative**. |
| 19. Hotel C, a separate hotel (0.5 min) | InnMetric services, Hotel representative · Hotel C | "Same role type, different hotel. Hotel C sees its own commercial inquiry and nothing of Hotel B's case or the pool." | **Request subscription**; open **Programme support** and **Department funds** to show the restricted views. |
| 20. Two separate books (0.5 min) | InnMetric services, InnMetric | "InnMetric's own fees are a separate commercial record and never pass through the pool. Prices are not configured." Close on what the demo does not claim. | Nothing. |

## Journey 3: Ireckonu

Open `partners/ireckonu/?present=1`. **Restart** in the corner returns the story to its start at any time; **Exit Present** or **Esc** shows the app again.

1. Read the opening line. Point to the three roles: Ireckonu connects the systems, InnMetric does the managed work, the hotel group authorizes data access and changes.
2. **View evidence**: the timestamped phone observations beside the simulated export for the same room, dates and occupancy. The mapping cause is a hypothesis.
3. **Review proposed fix**: who acts and who approves. **Record confirmation** (the hotel confirms the cause), then **Record approval** (the pilot owner). The recheck stays locked until both are recorded.
4. **Run repeat check**: "The mobile booking path reaches guest details." Booking completion and commercial impact stay pending.
5. The exchange: what Ireckonu brings, what InnMetric brings, what each could gain. Then the proposed pilot and the commercial starting point.
6. Close with the question on screen.

## Journey 4: Torus Legacy

Open `partners/torus-legacy/?present=1`.

1. Read the opening line. The owner briefing for fictional Property A: what we found, what we recommend, who owns it, how we measure it.
2. **Review engagement**: buyer, scope, delivery owner, observable result, next decision and the optional workstreams. Booking and service results are separate: "Guest details reached" and "5 of 5 requests reached the shift notes".
3. The optional handover workshop and playbook: the owner can commission it even though the first follow-up passed, to keep the routine working as staff change. Torus Legacy would lead and price it.
4. The exchange, then the commercial starting point.
5. **Discuss one property** opens a meeting brief to copy. Nothing is sent.
6. Close with the question on screen.

Each partner view names only its own partner, in what is visible, in accessibility text and in the copyable brief. Both use fictional properties. A public link stays public: an unlisted address, Present mode or `noindex` does not protect real client material.

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
