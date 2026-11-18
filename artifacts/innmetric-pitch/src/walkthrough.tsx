import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Play, RotateCcw, X } from "lucide-react";
import type { DemoAction, DemoRole } from "./lib/demo-api";

export type Page =
  | "hotel"
  | "overview"
  | "discovery"
  | "case"
  | "support"
  | "funds"
  | "services"
  | "guide";

export type Track = "hotel" | "programme";

/** One server action recorded by the presenter shortcut, as the named simulated role. */
export type PlayAction = {
  role: DemoRole;
  hotelId?: string;
  action: DemoAction;
  payload?: Record<string, unknown>;
  /** How many times the action still has to run, judged from the full InnMetric view. */
  remaining: (state: any) => number;
};

export type Step = {
  id: string;
  track: Track;
  title: string;
  seeing: string;
  page: Page;
  role: DemoRole;
  hotelId?: string;
  anchor?: string;
  notes: string[];
  play?: PlayAction[];
};

export const TRACK_LABELS: Record<Track, string> = {
  hotel: "Hotel service",
  programme: "Proposed programme",
};

export const ROLE_NAMES: Record<DemoRole, string> = {
  innmetric: "InnMetric operator",
  department: "Tourism Department",
  hotel: "Hotel representative",
  provider: "Service provider",
};

const once = (done: (state: any) => boolean) => (state: any) => (done(state) ? 0 : 1);
const signed = (list: any[] | undefined, role: string, version: number) =>
  (list ?? []).some((item) => item.role === role && item.version === version);
const CHECKS = { scope: true, timing: true, channelMix: true, costs: true };

const changeIs = (id: string, ...statuses: string[]) => (state: any) =>
  statuses.includes(state.hotelService?.changes?.[id]?.status);
const CHANGE_IDS = ["CH1", "CH2", "CH3"];

export const HOTEL_STEPS: Step[] = [
  {
    id: "hotel-intake",
    track: "hotel",
    title: "Intake",
    seeing: "Demo Hotel A reports that its direct booking link fails for one room type, Deluxe King.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-intake",
    notes: [
      "The hotel is synthetic: an independent GCC property selling direct and on two OTAs.",
      "Two checks returned the same error page. Standard Twin from the same page works.",
      "InnMetric works across the hotel's existing systems and replaces none of them. The service fee is not configured in this demo.",
    ],
  },
  {
    id: "hotel-audit",
    track: "hotel",
    title: "Distribution Baseline Audit",
    seeing: "The same room, dates, occupancy, terms, taxes and currency compared across the website, booking engine and two OTAs.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-audit",
    notes: [
      "Match first, then compare. OTA 2 looks AED 200 cheaper only because it shows the figure before taxes. Matched, there is no difference.",
      "Symptoms and causes are separate lists. Three causes are established with the hotel.",
      "OTA 1 is AED 50 lower on matched terms. The cause is not established, so the finding stays open. A price difference alone proves neither a fault nor a loss.",
    ],
  },
  {
    id: "hotel-signoff",
    track: "hotel",
    title: "The hotel signs off each change",
    seeing: "Three proposed changes wait for the named hotel approver. Each one shows its reversal step.",
    page: "hotel",
    role: "hotel",
    hotelId: "hotel-a",
    anchor: "hs-sprint",
    notes: [
      "You are now the hotel's approver, Layla Haddad (fictional). Sign off CH1, CH2 and CH3 one at a time.",
      "Nothing is proposed for the OTA 1 price finding. Rates and promotions are the hotel's decision.",
      "InnMetric has no sign-off button of its own.",
    ],
    play: CHANGE_IDS.map((changeId) => ({
      role: "hotel" as const,
      hotelId: "hotel-a",
      action: "service.approveChange" as const,
      payload: { changeId },
      remaining: once(changeIs(changeId, "approved", "applied")),
    })),
  },
  {
    id: "hotel-sprint",
    track: "hotel",
    title: "Approved Repair Sprint",
    seeing: "InnMetric applies only the signed-off changes. Any of them can be reversed with its documented step.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-sprint",
    notes: [
      "Apply is disabled until the approver has signed. The server enforces this, not only the button.",
      "Changes are simulated. No live website, channel manager or listing is touched.",
      "Optional: reverse one change to show that it then needs a new sign-off.",
    ],
    play: CHANGE_IDS.map((changeId) => ({
      role: "innmetric" as const,
      action: "service.applyChange" as const,
      payload: { changeId },
      remaining: once(changeIs(changeId, "applied")),
    })),
  },
  {
    id: "hotel-verify",
    track: "hotel",
    title: "Verification and handover",
    seeing: "Repeat booking checks after the changes, the items still open and the rechecks agreed at handover.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-verify",
    notes: [
      "Run the repeat checks. The Deluxe King link and booking engine search now read Bookable.",
      "The OTA 1 difference is still observed and stays open. Handover lists it instead of hiding it.",
      "The hotel approver acknowledges handover. Recheck intervals are illustrative, not a service timetable.",
      "Below the handover: what the hotel gets, what it controls and the two commercial options, both priced as not configured.",
    ],
    play: [
      {
        role: "innmetric",
        action: "service.verify",
        remaining: (s) => {
          const results = s.hotelService?.verificationRuns?.at(-1)?.results ?? [];
          return results.length && results.slice(0, 3).every((item: any) => item.kind === "bookable" || item.kind === "ok") ? 0 : 1;
        },
      },
      { role: "hotel", hotelId: "hotel-a", action: "service.acknowledgeHandover", remaining: once((s) => s.hotelService?.handover?.acknowledged) },
    ],
  },
  {
    id: "hotel-control",
    track: "hotel",
    title: "Ongoing Distribution Control",
    seeing: "A small monitoring view with scheduled rechecks. Not bookable is shown in kaki.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-control",
    notes: [
      "Run the two scheduled rechecks. The second finds Standard Twin not bookable on OTA 2.",
      "Monitoring reports and raises the item to the hotel. It changes nothing without approval and promises no permanent fix.",
      "The subscription price is not configured. Then follow the link at the bottom to the proposed programme.",
    ],
    play: [
      { role: "innmetric", action: "service.recheck", remaining: (s) => Math.max(0, 2 - (s.hotelService?.monitoring?.runs?.length ?? 0)) },
    ],
  },
];

const OUTCOME = { result: "completed", remainingActions: [] };
const confirmedBy = (role: string) => (s: any) => (s.outcome?.confirmations ?? []).some((item: any) => item.role === role);

export const PROGRAMME_STEPS: Step[] = [
  {
    id: "programme-overview",
    track: "programme",
    title: "Proposed programme and who is who",
    seeing: "A proposal, not a live scheme. Four role types act in it; the hotel representative can speak for three different hotels.",
    page: "overview",
    role: "department",
    notes: [
      "This part is a proposal for discussion. No department has adopted it.",
      "Role types: InnMetric operator, Tourism Department, Hotel representative, Service provider. Hotel identities: Hotel A, Hotel B, Hotel C. Each hotel sees only its own records.",
      "The department holds and administers the pool. InnMetric never holds it and cannot pay from it. Department cash starts at AED 0.00.",
    ],
  },
  {
    id: "programme-discovery",
    track: "programme",
    title: "InnMetric finds the evidence",
    seeing: "InnMetric processes the bounded candidate queue. Each result cites the synthetic records it used.",
    page: "discovery",
    role: "innmetric",
    notes: [
      "Hotel A: a candidate booking-path failure with two observations. Hotel B: a repair need suggested by reviews. Hotel C: no discovery evidence. Hotel D: unverified.",
      "A signal never creates a funding decision. There is no live crawling.",
    ],
    play: [
      { role: "innmetric", action: "discovery.run", remaining: (s) => Math.max(0, 4 - (s.discovery?.cursor ?? 0)) },
    ],
  },
  {
    id: "programme-source",
    track: "programme",
    title: "Hotel A, the source property",
    seeing: "Hotel A's representative sees only Hotel A: its cost comparison of AED 5,000 baseline and AED 4,000 observed. Hotel B's case is not visible here.",
    page: "case",
    role: "hotel",
    hotelId: "hotel-a",
    notes: [
      "Hotel A is where verified savings would come from. Any contribution stays attributed to Hotel A.",
      "Hotel A's acknowledgement is not a gate for later support to Hotel B; the joint InnMetric and department review is.",
    ],
  },
  {
    id: "programme-need",
    track: "programme",
    title: "Hotel B confirms its need",
    seeing: "Reviews suggested a carpentry repair at Hotel B. Only Hotel B's representative can confirm it.",
    page: "case",
    role: "hotel",
    hotelId: "hotel-b",
    notes: [
      "Press Confirm as Hotel B. The need changes from suggested to hotel confirmed.",
      "Reviews cannot establish affordability. Hotel B's contribution is a separate declaration.",
    ],
    play: [
      { role: "hotel", hotelId: "hotel-b", action: "need.confirm", remaining: once((s) => s.need?.confirmed) },
    ],
  },
  {
    id: "programme-savings",
    track: "programme",
    title: "Savings are not cash",
    seeing: "Hotel A's matched comparison gives AED 1,000 candidate savings. InnMetric and the department each sign off four attribution checks.",
    page: "case",
    role: "innmetric",
    notes: [
      "Tick the four checks and approve as InnMetric, then switch to the department and do the same.",
      "Verified savings still create no cash. Department cash stays AED 0.00.",
    ],
    play: [
      { role: "innmetric", action: "savings.approve", payload: { checks: CHECKS }, remaining: once((s) => signed(s.savings?.approvals, "innmetric", s.savings?.version)) },
      { role: "department", action: "savings.approve", payload: { checks: CHECKS }, remaining: once((s) => signed(s.savings?.approvals, "department", s.savings?.version)) },
    ],
  },
  {
    id: "programme-receipt",
    track: "programme",
    title: "A department receipt creates pool cash",
    seeing: "The AED 1,000 collection is approved jointly, then the department posts a receipt. Only now does pool cash read AED 1,000.00.",
    page: "funds",
    role: "department",
    notes: [
      "Approving savings does not approve a collection. The collection has its own joint approval.",
      "Only the department can post the receipt. Try it as InnMetric and the server refuses.",
      "The cash sequence at the top of the page ticks off each step. The AED 1,000 stays attributed to Hotel A.",
    ],
    play: [
      { role: "innmetric", action: "collection.approve", remaining: once((s) => signed(s.collection?.approvals, "innmetric", s.collection?.version)) },
      { role: "department", action: "collection.approve", remaining: once((s) => s.collection?.posted || signed(s.collection?.approvals, "department", s.collection?.version)) },
      { role: "department", action: "collection.post", remaining: once((s) => s.collection?.posted) },
    ],
  },
  {
    id: "programme-quote",
    track: "programme",
    title: "The provider's quote",
    seeing: "The service provider sees its assigned job: an AED 500 carpentry quote and scope. It cannot see funding amounts, other hotels or programme cash.",
    page: "support",
    role: "provider",
    notes: [
      "The provider could submit a revised quote here. Do it now or not at all: a revised quote clears every funding approval that came before it.",
      "The seeded script keeps the AED 500 quote.",
    ],
  },
  {
    id: "programme-support",
    track: "programme",
    title: "Funding for Hotel B",
    seeing: "InnMetric and the department each approve the cross-hotel allocation and the support request. The department reserves AED 200 from the pool.",
    page: "support",
    role: "department",
    notes: [
      "Using Hotel A's contribution for Hotel B needs explicit joint authorisation, capped at the approved amount.",
      "After the reservation, AED 200 is held and AED 800 remains available.",
    ],
    play: [
      { role: "innmetric", action: "allocation.approve", remaining: once((s) => signed(s.support?.allocation?.approvals, "innmetric", s.support?.allocation?.version)) },
      { role: "innmetric", action: "support.approve", remaining: once((s) => s.support?.status !== "draft" || signed(s.support?.approvals, "innmetric", s.support?.version)) },
      { role: "department", action: "allocation.approve", remaining: once((s) => signed(s.support?.allocation?.approvals, "department", s.support?.allocation?.version)) },
      { role: "department", action: "support.approve", remaining: once((s) => s.support?.status !== "draft") },
      { role: "department", action: "support.reserve", remaining: once((s) => ["reserved", "paid"].includes(s.support?.status)) },
    ],
  },
  {
    id: "programme-payments",
    track: "programme",
    title: "Payments: AED 200 from the pool, AED 300 from Hotel B",
    seeing: "The department records the AED 200 payment once. Hotel B pays its AED 300 directly. Pool cash is AED 800.",
    page: "funds",
    role: "department",
    notes: [
      "InnMetric has no payment button. Programme payments are executed by the department only.",
      "Hotel B's AED 300 goes straight to the provider and never enters department cash. Together they cover the AED 500 repair.",
      "Posted entries are never overwritten. A correction is a linked request with no cash effect of its own.",
    ],
    play: [
      { role: "department", action: "support.pay", remaining: once((s) => s.support?.status === "paid") },
      { role: "hotel", hotelId: "hotel-b", action: "support.directPayment", remaining: once((s) => (s.directPayments ?? []).length > 0) },
    ],
  },
  {
    id: "programme-delivery",
    track: "programme",
    title: "The provider records delivery",
    seeing: "The provider marks the repair delivered. Delivery is a submission: the outcome now waits for three confirmations.",
    page: "support",
    role: "provider",
    anchor: "outcome-review",
    notes: [
      "Delivery alone cannot close the case.",
      "The outcome audit below lists each event with who recorded it.",
    ],
    play: [
      { role: "provider", action: "delivery.mark", remaining: once((s) => s.delivery?.status === "delivered") },
    ],
  },
  {
    id: "programme-review",
    track: "programme",
    title: "InnMetric and the department review the outcome",
    seeing: "InnMetric and the department each confirm the delivered repair as completed. Two of three confirmations; the outcome stays open.",
    page: "support",
    role: "department",
    anchor: "outcome-review",
    notes: [
      "Each role confirms separately, for the same delivery version.",
      "Two matching confirmations are not enough. The status stays awaiting confirmations.",
    ],
    play: [
      { role: "innmetric", action: "outcome.confirm", payload: OUTCOME, remaining: once(confirmedBy("innmetric")) },
      { role: "department", action: "outcome.confirm", payload: OUTCOME, remaining: once(confirmedBy("department")) },
    ],
  },
  {
    id: "programme-closed",
    track: "programme",
    title: "Hotel B's confirmation closes the outcome",
    seeing: "Hotel B confirms the same result. On the third matching confirmation the outcome changes to verified.",
    page: "support",
    role: "hotel",
    hotelId: "hotel-b",
    anchor: "outcome-review",
    notes: [
      "Press Confirm outcome as Hotel representative. The audit shows the status change on this confirmation.",
      "Had any party chosen partial or rejected, the case would stay open with its remaining actions.",
    ],
    play: [
      { role: "hotel", hotelId: "hotel-b", action: "outcome.confirm", payload: OUTCOME, remaining: once(confirmedBy("hotel")) },
    ],
  },
  {
    id: "programme-hotel-c",
    track: "programme",
    title: "Hotel C, a separate hotel",
    seeing: "Hotel C's representative sees only Hotel C's records: its own commercial inquiry. Hotel B's case and programme cash are not visible.",
    page: "services",
    role: "hotel",
    hotelId: "hotel-c",
    notes: [
      "Same role type, different hotel identity. Open Programme support or Department funds to show the restricted views.",
      "Hotel C requests a subscription. That is a commercial conversation, not discovery evidence or a programme case.",
    ],
    play: [
      { role: "hotel", hotelId: "hotel-c", action: "commercial.request", payload: { type: "subscription" }, remaining: once((s) => (s.commercial?.proposals ?? []).some((item: any) => item.hotelId === "hotel-c" && item.status === "requested")) },
    ],
  },
  {
    id: "programme-commercial",
    track: "programme",
    title: "Two separate books",
    seeing: "InnMetric's own services are a separate commercial record. Prices are not configured and show as unset.",
    page: "services",
    role: "innmetric",
    notes: [
      "Hotel fees for InnMetric services never pass through the department pool.",
      "Unset prices stay unset. Nothing is shown as zero or free.",
      "Close here: everything shown is synthetic, the programme is a proposal and the open items remain open.",
    ],
  },
];

export const STEPS: Step[] = [...HOTEL_STEPS, ...PROGRAMME_STEPS];

export function Walkthrough({
  index,
  busy,
  notesOn,
  canPlay,
  onGo,
  onPlay,
  onNotes,
  onReset,
  onHide,
}: {
  index: number;
  busy: boolean;
  notesOn: boolean;
  canPlay: boolean;
  onGo: (index: number) => void;
  onPlay: () => void;
  onNotes: (on: boolean) => void;
  onReset: () => void;
  onHide: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  let lastTrack: Track | null = null;
  return (
    <aside className={`walk${expanded ? " expanded" : ""}`} aria-label="Guided walkthrough">
      <div className="walk-head">
        <h2>Guided walkthrough</h2>
        <div className="btn-row">
          <button className="btn small walk-compact-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />} {expanded ? "Less" : "All steps"}
          </button>
          <button className="icon-btn" onClick={onHide} aria-label="Hide walkthrough"><X size={15} /></button>
        </div>
      </div>
      <div className="walk-body">
        <section className="walk-current" aria-live="polite">
          <div className="walk-count">Step {index + 1} of {STEPS.length} · {TRACK_LABELS[step.track]}</div>
          <h3>{step.title}</h3>
          <p className="walk-seeing"><b>What you are seeing:</b> {step.seeing}</p>
          <div className="walk-role">Role type: {ROLE_NAMES[step.role]}{step.role === "hotel" ? ` · Hotel identity: Hotel ${(step.hotelId ?? "hotel-b").slice(-1).toUpperCase()}` : ""}</div>
          {notesOn && (
            <div className="walk-notes" data-testid="presenter-notes">
              <ul>{step.notes.map((note) => <li key={note}>{note}</li>)}</ul>
              {step.play && (
                <button className="btn small" style={{ marginTop: 10 }} disabled={busy || !canPlay} onClick={onPlay} title="Records each simulated role's action for the walkthrough up to this step, through the same server checks as manual clicks.">
                  <Play size={13} /> Record this step's actions
                </button>
              )}
            </div>
          )}
          <div className="walk-nav">
            <button className="btn" disabled={busy || index === 0} onClick={() => onGo(index - 1)}><ArrowLeft size={14} /> Back</button>
            <button className="btn primary" disabled={busy || last} onClick={() => onGo(index + 1)}>
              {last ? "End of walkthrough" : <>Next <ArrowRight size={14} /></>}
            </button>
          </div>
        </section>
        <ol className="walk-steps">
          {STEPS.map((item, position) => {
            const heading = item.track !== lastTrack ? TRACK_LABELS[item.track] : null;
            lastTrack = item.track;
            return (
              <li key={item.id}>
                {heading && <div className="walk-group">{heading}</div>}
                <button
                  className={`walk-step${position === index ? " active" : position < index ? " past" : ""}`}
                  aria-current={position === index ? "step" : undefined}
                  disabled={busy}
                  onClick={() => onGo(position)}
                >
                  <span className="n">{position + 1}</span><span>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="walk-tools">
        <label className="walk-toggle">
          <input type="checkbox" checked={notesOn} onChange={(event) => onNotes(event.target.checked)} /> Presenter notes
        </label>
        <button className="btn small kaki" style={{ marginLeft: "auto" }} disabled={busy} onClick={onReset}>
          <RotateCcw size={13} /> Reset demo data
        </button>
      </div>
    </aside>
  );
}
