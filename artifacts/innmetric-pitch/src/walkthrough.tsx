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
    title: "A failed booking link",
    seeing: "Hotel A reports a broken Deluxe King booking link.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-intake",
    notes: [
      "Two checks return HTTP 404. Standard Twin works from the same page.",
      "InnMetric works across existing hotel systems. Fees remain to be agreed.",
    ],
  },
  {
    id: "hotel-audit",
    track: "hotel",
    title: "Check booking and distribution",
    seeing: "Compare the same room, stay, guests, terms, taxes and currency.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-audit",
    notes: [
      "OTA 2 adds AED 200 in taxes; matched totals are equal.",
      "Three causes are confirmed with the hotel. OTA 1 remains AED 50 lower for an unknown reason; that alone proves no loss.",
    ],
  },
  {
    id: "hotel-signoff",
    track: "hotel",
    title: "The hotel approves",
    seeing: "Three proposed repairs, each with a reversal step.",
    page: "hotel",
    role: "hotel",
    hotelId: "hotel-a",
    anchor: "hs-sprint",
    notes: [
      "As Hotel A, approve CH1, CH2 and CH3. InnMetric cannot approve for the hotel.",
      "No rate change is proposed for the unexplained OTA 1 gap.",
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
    title: "Fix approved issues",
    seeing: "InnMetric applies the approved repairs.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-sprint",
    notes: [
      "Apply is blocked until hotel approval.",
      "Try reversing a repair: it needs fresh approval before applying again.",
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
    title: "Recheck and hand over",
    seeing: "Repeat the checks. Hand over fixed and open items.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-verify",
    notes: [
      "The Deluxe King link opens and the room is offered. No payment or reservation is tested.",
      "OTA 1 remains AED 50 lower; keep the finding open.",
      "Hotel A acknowledges handover. Audit/repair and monitoring prices remain to be agreed.",
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
    title: "Monitor for new issues",
    seeing: "Scheduled checks catch problems after handover.",
    page: "hotel",
    role: "innmetric",
    anchor: "hs-control",
    notes: [
      "The second check finds Standard Twin unavailable on OTA 2. Raise it for hotel review.",
      "Monitoring is a separate subscription. The next phase shows the proposed tourism programme.",
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
    title: "Who does what",
    seeing: "A proposed programme linking hotels, InnMetric, the department and providers.",
    page: "overview",
    role: "department",
    notes: [
      "Each hotel sees its own records. Providers see assigned work.",
      "The department holds and pays from the pool. InnMetric reviews but never holds it. Pool cash starts at AED 0.",
    ],
  },
  {
    id: "programme-discovery",
    track: "programme",
    title: "Find the evidence",
    seeing: "Review hotel signals and their supporting records.",
    page: "discovery",
    role: "innmetric",
    notes: [
      "A: repeated booking failure. B: reviews suggest repairs. C: no evidence. D: unverified.",
      "Signals need review; they do not award funding. This queue uses fictional records.",
    ],
    play: [
      { role: "innmetric", action: "discovery.run", remaining: (s) => Math.max(0, 4 - (s.discovery?.cursor ?? 0)) },
    ],
  },
  {
    id: "programme-source",
    track: "programme",
    title: "Hotel A: savings source",
    seeing: "Hotel A sees its costs: AED 5,000 before and AED 4,000 after.",
    page: "case",
    role: "hotel",
    hotelId: "hotel-a",
    notes: [
      "Any contribution remains attributed to Hotel A.",
      "Cross-hotel support needs InnMetric and department approval; Hotel A acknowledgement is not a demo gate.",
    ],
  },
  {
    id: "programme-need",
    track: "programme",
    title: "Hotel B confirms the need",
    seeing: "Reviews suggest a carpentry repair. Hotel B confirms it.",
    page: "case",
    role: "hotel",
    hotelId: "hotel-b",
    notes: [
      "Choose Confirm as Hotel B.",
      "Reviews do not prove affordability; the hotel declares its own contribution.",
    ],
    play: [
      { role: "hotel", hotelId: "hotel-b", action: "need.confirm", remaining: once((s) => s.need?.confirmed) },
    ],
  },
  {
    id: "programme-savings",
    track: "programme",
    title: "Verify savings",
    seeing: "AED 1,000 candidate savings. Two reviewers check attribution.",
    page: "case",
    role: "innmetric",
    notes: [
      "InnMetric and the department each review scope, timing, channel mix and costs.",
      "Approval creates no cash. The pool remains AED 0.",
    ],
    play: [
      { role: "innmetric", action: "savings.approve", payload: { checks: CHECKS }, remaining: once((s) => signed(s.savings?.approvals, "innmetric", s.savings?.version)) },
      { role: "department", action: "savings.approve", payload: { checks: CHECKS }, remaining: once((s) => signed(s.savings?.approvals, "department", s.savings?.version)) },
    ],
  },
  {
    id: "programme-receipt",
    track: "programme",
    title: "Collect before spending",
    seeing: "Approve the AED 1,000 collection separately. The department then records receipt.",
    page: "funds",
    role: "department",
    notes: [
      "Both reviewers approve the collection amount; savings approval does not replace this.",
      "Only the receipt creates pool cash: AED 1,000 attributed to Hotel A.",
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
    title: "The provider quotes",
    seeing: "The provider sees its assigned AED 500 carpentry job.",
    page: "support",
    role: "provider",
    notes: [
      "Changing the quote clears earlier funding approvals. This walkthrough keeps AED 500.",
      "The provider cannot view programme balances or other hotels.",
    ],
  },
  {
    id: "programme-support",
    track: "programme",
    title: "Approve support for Hotel B",
    seeing: "Both reviewers approve support and cross-hotel use. The department reserves AED 200.",
    page: "support",
    role: "department",
    notes: [
      "Hotel A attribution stays traceable.",
      "AED 200 reserved; AED 800 available.",
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
    title: "Pay for the repair",
    seeing: "Department: AED 200. Hotel B direct: AED 300. Pool cash remaining: AED 800.",
    page: "funds",
    role: "department",
    notes: [
      "Only the department executes pool payments. Hotel B pays the provider separately.",
      "Corrections link to the original entry; a correction request moves no money.",
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
    seeing: "Repair delivered; three confirmations still needed.",
    page: "support",
    role: "provider",
    anchor: "outcome-review",
    notes: [
      "Delivery alone does not close the case. Each action stays in the audit trail.",
    ],
    play: [
      { role: "provider", action: "delivery.mark", remaining: once((s) => s.delivery?.status === "delivered") },
    ],
  },
  {
    id: "programme-review",
    track: "programme",
    title: "Two reviewers confirm",
    seeing: "InnMetric and the department confirm the repair. Hotel B still needs to confirm.",
    page: "support",
    role: "department",
    anchor: "outcome-review",
    notes: [
      "Each reviews the same delivery version. Two confirmations do not close it.",
    ],
    play: [
      { role: "innmetric", action: "outcome.confirm", payload: OUTCOME, remaining: once(confirmedBy("innmetric")) },
      { role: "department", action: "outcome.confirm", payload: OUTCOME, remaining: once(confirmedBy("department")) },
    ],
  },
  {
    id: "programme-closed",
    track: "programme",
    title: "Hotel B confirms the result",
    seeing: "The third matching confirmation verifies completion.",
    page: "support",
    role: "hotel",
    hotelId: "hotel-b",
    anchor: "outcome-review",
    notes: [
      "Confirm as Hotel B.",
      "Partial or rejected work stays open with remaining actions.",
    ],
    play: [
      { role: "hotel", hotelId: "hotel-b", action: "outcome.confirm", payload: OUTCOME, remaining: once(confirmedBy("hotel")) },
    ],
  },
  {
    id: "programme-hotel-c",
    track: "programme",
    title: "Hotel C: a separate customer",
    seeing: "Hotel C requests an InnMetric subscription outside the programme.",
    page: "services",
    role: "hotel",
    hotelId: "hotel-c",
    notes: [
      "Hotel C sees its own commercial inquiry, not Hotel B or pool cash.",
      "A commercial inquiry does not establish a fault or a funding case.",
    ],
    play: [
      { role: "hotel", hotelId: "hotel-c", action: "commercial.request", payload: { type: "subscription" }, remaining: once((s) => (s.commercial?.proposals ?? []).some((item: any) => item.hotelId === "hotel-c" && item.status === "requested")) },
    ],
  },
  {
    id: "programme-commercial",
    track: "programme",
    title: "Keep commercial fees separate",
    seeing: "InnMetric subscriptions and on-demand work have their own commercial records.",
    page: "services",
    role: "innmetric",
    notes: [
      "Hotel fees never pass through the department pool.",
      "Prices remain unset, not zero or free.",
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
                <button className="btn small" style={{ marginTop: 10 }} disabled={busy || !canPlay} onClick={onPlay} title="Runs the required demo actions through the usual approval checks.">
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
