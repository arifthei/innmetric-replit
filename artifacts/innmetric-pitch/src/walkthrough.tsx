import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight, Play, RotateCcw, X } from "lucide-react";
import type { DemoAction, DemoRole } from "./lib/demo-api";

export type Page =
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

export const PROGRAMME_STEPS: Step[] = [
  {
    id: "programme-overview",
    track: "programme",
    title: "Proposed programme",
    seeing: "A proposal, not a live scheme: a tourism department would hold contributions from verified hotel savings.",
    page: "overview",
    role: "department",
    notes: [
      "This part is a proposal for discussion. No department has adopted it.",
      "The department holds and administers the pool. InnMetric never holds it and cannot pay from it.",
      "Department cash starts at AED 0.00. Nothing on this screen is a real fund.",
    ],
  },
  {
    id: "programme-savings",
    track: "programme",
    title: "Savings are not cash",
    seeing: "Hotel A's matched cost comparison: AED 5,000 baseline, AED 4,000 observed, AED 1,000 candidate savings.",
    page: "case",
    role: "innmetric",
    notes: [
      "The figure is arithmetic over two synthetic cost records for the same room nights.",
      "It stays a candidate until InnMetric and the department each sign off four attribution checks.",
      "Even when verified, savings create no cash. Department cash is still AED 0.00.",
      "Hotel B's repair need comes from guest reviews and must be confirmed by Hotel B itself.",
    ],
    play: [
      { role: "innmetric", action: "discovery.run", remaining: (s) => Math.max(0, 4 - (s.discovery?.cursor ?? 0)) },
      { role: "hotel", hotelId: "hotel-b", action: "need.confirm", remaining: once((s) => s.need?.confirmed) },
      { role: "innmetric", action: "savings.approve", payload: { checks: CHECKS }, remaining: once((s) => signed(s.savings?.approvals, "innmetric", s.savings?.version)) },
      { role: "department", action: "savings.approve", payload: { checks: CHECKS }, remaining: once((s) => signed(s.savings?.approvals, "department", s.savings?.version)) },
    ],
  },
  {
    id: "programme-receipt",
    track: "programme",
    title: "Only a department receipt creates pool cash",
    seeing: "The collection amount is approved separately, then the department posts a receipt. Only then does cash appear.",
    page: "funds",
    role: "department",
    notes: [
      "Approving savings does not approve a collection. The AED 1,000 collection has its own joint approval.",
      "Only the department can post the receipt. Try it as InnMetric and the server refuses.",
      "After posting, department cash reads AED 1,000.00 and stays attributed to Hotel A.",
    ],
    play: [
      { role: "innmetric", action: "collection.approve", remaining: once((s) => signed(s.collection?.approvals, "innmetric", s.collection?.version)) },
      { role: "department", action: "collection.approve", remaining: once((s) => s.collection?.posted || signed(s.collection?.approvals, "department", s.collection?.version)) },
      { role: "department", action: "collection.post", remaining: once((s) => s.collection?.posted) },
    ],
  },
  {
    id: "programme-support",
    track: "programme",
    title: "Support for Hotel B",
    seeing: "A quoted AED 500 repair: the department reserves AED 200 from the pool and Hotel B pays AED 300 itself.",
    page: "support",
    role: "department",
    notes: [
      "Using Hotel A's contribution for Hotel B needs explicit joint authorisation, capped at the approved amount.",
      "The reservation holds AED 200. AED 800 remains available.",
      "Hotel B's AED 300 is a direct payment to the provider. It never enters department cash.",
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
    id: "programme-ledger",
    track: "programme",
    title: "The department pays, the ledger shows it",
    seeing: "The department records the AED 200 payment once. Pool cash is AED 800. Hotel B's AED 300 sits outside it.",
    page: "funds",
    role: "department",
    notes: [
      "InnMetric has no payment button. Programme payments are executed by the department only.",
      "Posted entries are never overwritten. A correction is a linked request with no cash effect of its own.",
      "Provider delivery alone does not close the case. The outcome needs the department, Hotel B and InnMetric to confirm, and it is still open here.",
    ],
    play: [
      { role: "department", action: "support.pay", remaining: once((s) => s.support?.status === "paid") },
      { role: "hotel", hotelId: "hotel-b", action: "support.directPayment", remaining: once((s) => (s.directPayments ?? []).length > 0) },
      { role: "provider", action: "delivery.mark", remaining: once((s) => s.delivery?.status === "delivered") },
    ],
  },
  {
    id: "programme-commercial",
    track: "programme",
    title: "Two separate books",
    seeing: "InnMetric's own hotel services are a separate commercial record. Prices are not configured and show as unset.",
    page: "services",
    role: "innmetric",
    notes: [
      "Hotel fees for InnMetric services never pass through the department pool.",
      "Unset prices stay unset. Nothing is shown as zero or free.",
      "Close here: everything shown is synthetic, the programme is a proposal and the open items remain open.",
    ],
  },
];

export const STEPS: Step[] = [...PROGRAMME_STEPS];

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
          <div className="walk-role">Shown as: {ROLE_NAMES[step.role]}{step.hotelId ? `, Hotel ${step.hotelId.slice(-1).toUpperCase()}` : ""}</div>
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
