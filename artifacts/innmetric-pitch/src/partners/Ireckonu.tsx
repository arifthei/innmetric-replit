import { useEffect, useState } from "react";
import { Check, CircleDashed, ClipboardCheck, FileSearch, Play, RotateCcw, ShieldCheck, Smartphone } from "lucide-react";

import { PartnerShell, StoryBlock, readStory, revealSoon, writeStory } from "./PartnerShell";

const STORY_KEY = "innmetric-partner-ireckonu-v1";

type Story = {
  evidence: boolean;
  fix: boolean;
  causeConfirmed: boolean;
  approved: boolean;
  rechecked: boolean;
};

const START: Story = { evidence: false, fix: false, causeConfirmed: false, approved: false, rechecked: false };

/** Every value below is fictional seed data for a fictional property. No guest data, credentials or live integration. */
const STAY = {
  property: "Demo Harbour Hotel",
  group: "Demo Hotel Group",
  room: "Deluxe King, sea view",
  roomCode: "DKSV",
  dates: "Fri 12 to Sun 14 March 2027 · 2 nights",
  guests: "2 adults",
};

const OBSERVATIONS = [
  { id: "OBS-M-01", at: "2026-11-12 09:42:17 UTC", device: "Phone · 390 px viewport", result: "Not available for these dates", kind: "not_bookable" },
  { id: "OBS-D-01", at: "2026-11-12 09:44:51 UTC", device: "Desktop · 1440 px viewport", result: "Available · rate shown", kind: "bookable" },
  { id: "OBS-M-02", at: "2026-11-12 09:47:03 UTC", device: "Phone · 390 px viewport", result: "Not available for these dates", kind: "not_bookable" },
] as const;

const EXPORT_ROWS = [
  { night: "Fri 12 Mar 2027", sellable: 3, restriction: "None", ratePlan: "BAR-FLEX open" },
  { night: "Sat 13 Mar 2027", sellable: 3, restriction: "None", ratePlan: "BAR-FLEX open" },
];

const RESPONSIBILITIES = [
  {
    step: "Confirm the cause in a sandbox or read-only view",
    acts: "Hotel systems lead, with Ireckonu support where the hotel's contract covers it",
    approves: "Pilot owner at the hotel group",
  },
  {
    step: "Correct the room mapping",
    acts: "Hotel systems team or Ireckonu, as the hotel's contract assigns. InnMetric coordinates and records the change",
    approves: "Pilot owner signs off before the change goes live",
  },
  {
    step: "Repeat the same booking check",
    acts: "InnMetric",
    approves: "Pilot owner reviews the result",
  },
  {
    step: "Any data exchange",
    acts: "Only the property-level exports the hotel releases",
    approves: "Hotel group, before anything is shared",
  },
];

const RECHECK = [
  ["Search: same dates, 2 adults, phone", "Results returned"],
  ["Room list", "Deluxe King, sea view shown as available"],
  ["Rate", "BAR-FLEX shown, matching the export"],
  ["Guest details page", "Reached. Stopped before payment; no reservation created"],
] as const;

export function IreckonuPitch() {
  const [story, setStory] = useState<Story>(() => readStory(STORY_KEY, START));
  useEffect(() => writeStory(STORY_KEY, story), [story]);
  const update = (patch: Partial<Story>, anchor?: string) => {
    setStory((current) => ({ ...current, ...patch }));
    if (anchor) revealSoon(anchor);
  };

  return (
    <PartnerShell
      partner="ireckonu"
      title="Ireckonu pilot proposal · InnMetric demo"
      banner="Proposal for discussion with Ireckonu. Fictional hotel and simulated exports. No agreement or endorsement is implied."
    >
      <header className="pitch-head">
        <div className="eyebrow">Partner Framework · Ireckonu · joint pilot proposal</div>
        <p className="pitch-statement">
          Your platform connects the hotel's systems. InnMetric takes a guest-visible booking problem from evidence to an approved fix, then shows whether it worked.
        </p>
        <p className="lead">
          A joint diagnostic and implementation pilot for one hotel group that already uses or is evaluating Ireckonu.
        </p>
      </header>

      <div className="proposal-tag" data-testid="proposal-tag">
        <b>Proposal, not a partnership.</b> Nothing here is agreed with or endorsed by Ireckonu. The demo uses simulated property-level exports: no guest data, credentials or live integrations.
      </div>

      <div className="grid three role-trio">
        <section className="card">
          <div className="card-kicker">Ireckonu · already in place</div>
          <h3 className="role-title">Connects the hotel's systems</h3>
          <p className="small muted">Its middleware monitors integrations in real time, consolidates reservations and reports on channel mix.</p>
        </section>
        <section className="card">
          <div className="card-kicker">InnMetric · the managed work around it</div>
          <h3 className="role-title">From a guest-facing symptom to a checked fix</h3>
          <p className="small muted">Verify the booking problem, coordinate a hotel-approved correction, then repeat the same check.</p>
        </section>
        <section className="card">
          <div className="card-kicker">Hotel group · decides</div>
          <h3 className="role-title">Owns the systems and the data</h3>
          <p className="small muted">Approves any data exchange and signs off every change before it goes live.</p>
        </section>
      </div>

      <ol className="story-strip" aria-label="Pilot story">
        {([
          ["Issue", true],
          ["Evidence", story.evidence],
          ["Proposed fix", story.fix],
          ["Repeat check", story.rechecked],
          ["Follow-up", story.rechecked],
        ] as const).map(([label, done], index) => (
          <li key={label} className={done ? "done" : undefined}><span className="stage-n">{index + 1}</span>{label}</li>
        ))}
      </ol>

      <StoryBlock id="irk-issue" kicker={`${STAY.property} · fictional`} title="A sellable room shows as unavailable on mobile.">
        <div className="card issue-card">
          <div className="data-row"><span className="data-label">Room</span><b className="data-value">{STAY.room}</b></div>
          <div className="data-row"><span className="data-label">Stay</span><b className="data-value">{STAY.dates}</b></div>
          <div className="data-row"><span className="data-label">Guests</span><b className="data-value">{STAY.guests}</b></div>
          <div className="data-row"><span className="data-label">Where</span><b className="data-value">Hotel website booking engine, on a phone</b></div>
          <div className="data-row"><span className="data-label">Guest sees</span><span className="status not_bookable">Not bookable on mobile</span></div>
          <div className="btn-row story-actions">
            <button className="btn primary" disabled={story.evidence} onClick={() => update({ evidence: true }, "irk-evidence")} data-testid="irk-view-evidence">
              <FileSearch size={15} /> View evidence
            </button>
          </div>
        </div>
      </StoryBlock>

      {story.evidence && (
        <StoryBlock id="irk-evidence" kicker="Evidence · same room, dates and occupancy" title="The export says sellable. The phone says no.">
          <div className="grid two">
            <section className="card">
              <div className="card-title">
                <div><div className="card-kicker">Booking observation</div><h3 className="role-title">Timestamped, repeated</h3></div>
                <Smartphone size={18} className="card-icon" aria-hidden="true" />
              </div>
              {OBSERVATIONS.map((item) => (
                <div className="check-row" key={item.id}>
                  <span><b>{item.id}</b> · {item.device}<br /><span className="small muted">{item.at}</span></span>
                  <span className={`status ${item.kind}`}>{item.result}</span>
                </div>
              ))}
            </section>
            <section className="card">
              <div className="card-title">
                <div><div className="card-kicker">Availability export · simulated</div><h3 className="role-title">AVX-1112 · generated 2026-11-12 09:30 UTC</h3></div>
                <ClipboardCheck size={18} className="card-icon" aria-hidden="true" />
              </div>
              <div className="table-wrap"><table className="table compact-table">
                <thead><tr><th>Night</th><th>Sellable</th><th>Restriction</th><th>Rate plan</th></tr></thead>
                <tbody>
                  {EXPORT_ROWS.map((row) => (
                    <tr key={row.night}><td>{row.night}</td><td className="num">{row.sellable}</td><td>{row.restriction}</td><td>{row.ratePlan}</td></tr>
                  ))}
                </tbody>
              </table></div>
              <p className="small muted export-note">Room type {STAY.roomCode} · max occupancy 2 adults · property-level, no guest records.</p>
            </section>
          </div>
          <div className="match-line" aria-label="Comparison">
            {["Same room type", "Same dates", "Same occupancy"].map((label) => <span key={label}><Check size={14} /> {label}</span>)}
          </div>
          <div className={`card hypothesis${story.causeConfirmed ? " confirmed" : ""}`} data-testid="irk-hypothesis">
            <div className="card-title">
              <div><div className="card-kicker">Likely cause</div><h3 className="role-title">The mobile booking path may point this room type to a retired room code.</h3></div>
              <span className={`status ${story.causeConfirmed ? "ok" : "open"}`}>{story.causeConfirmed ? "Confirmed by hotel · simulated" : "Hypothesis · not confirmed"}</span>
            </div>
            <p className="small muted">
              {story.causeConfirmed
                ? "The hotel systems lead checked the mapping in a sandbox view and confirmed it. The fix can now be approved."
                : "Not ruled out yet: a rate plan hidden from the mobile channel, a different occupancy rule on mobile or a delay in updates. It stays a hypothesis until the hotel confirms it."}
            </p>
          </div>
          <div className="btn-row story-actions">
            <button className="btn primary" disabled={story.fix} onClick={() => update({ fix: true }, "irk-fix")} data-testid="irk-review-fix">
              <ShieldCheck size={15} /> Review proposed fix
            </button>
          </div>
        </StoryBlock>
      )}

      {story.fix && (
        <StoryBlock id="irk-fix" kicker="Proposed fix · who acts, who approves" title="Correct the mapping, with the hotel's sign-off.">
          <div className="table-wrap"><table className="table hs-table raci-table">
            <thead><tr><th>Step</th><th>Who acts</th><th>Who approves</th></tr></thead>
            <tbody>
              {RESPONSIBILITIES.map((row) => (
                <tr key={row.step}><td><b>{row.step}</b></td><td>{row.acts}</td><td>{row.approves}</td></tr>
              ))}
            </tbody>
          </table></div>
          <div className="gate-list">
            <div className="check-row">
              <span><b>1. Cause confirmed</b><br /><span className="small muted">Hotel systems lead, in a sandbox or read-only view</span></span>
              {story.causeConfirmed
                ? <span className="status ok">Recorded · simulated</span>
                : <button className="btn small" onClick={() => update({ causeConfirmed: true })} data-testid="irk-confirm-cause">Record confirmation</button>}
            </div>
            <div className="check-row">
              <span><b>2. Change approved</b><br /><span className="small muted">Pilot owner at the hotel group</span></span>
              {story.approved
                ? <span className="status ok">Approved · simulated</span>
                : <button className="btn small" disabled={!story.causeConfirmed} onClick={() => update({ approved: true })} data-testid="irk-approve">Record approval</button>}
            </div>
          </div>
          <div className="btn-row story-actions">
            <button className="btn primary" disabled={!story.approved || story.rechecked} onClick={() => update({ rechecked: true }, "irk-recheck")} data-testid="irk-run-recheck">
              <Play size={15} /> Run repeat check
            </button>
            {!story.approved && <span className="small muted">Needs the hotel's confirmation and approval first.</span>}
          </div>
        </StoryBlock>
      )}

      {story.rechecked && (
        <>
          <StoryBlock id="irk-recheck" kicker="Repeat check · 2026-11-14 10:05 UTC · seeded data" title="The same booking path now completes.">
            <div className="card">
              {RECHECK.map(([step, result]) => (
                <div className="check-row" key={step}><span>{step}</span><span className="status bookable"><Check size={12} /> {result}</span></div>
              ))}
            </div>
            <p className="footer-note">Same room, dates, occupancy and device as the first observation. A passing check shows the path works; it does not measure demand.</p>
          </StoryBlock>

          <StoryBlock id="irk-follow" kicker="Follow-up · after the fix" title="Then measure what the hotel cares about.">
            <div className="grid two">
              <section className="card">
                <div className="card-title"><div><div className="card-kicker">Direct booking completion</div><h3 className="role-title">Share of mobile booking sessions that reach confirmation</h3></div><span className="status open">Pending</span></div>
                <p className="small muted">Needs the hotel's own analytics baseline from before the fix.</p>
              </section>
              <section className="card">
                <div className="card-title"><div><div className="card-kicker">Net distribution cost</div><h3 className="role-title">Commission, fees and payment costs per booking, by channel</h3></div><span className="status open">Pending</span></div>
                <p className="small muted">Needs actual cost records from the hotel.</p>
              </section>
            </div>
            <div className="notice" data-testid="irk-impact-pending">
              <b>Commercial impact: pending.</b> No estimate is shown until actual baseline and cost records exist.
            </div>
          </StoryBlock>
        </>
      )}

      <div className="pitch-section">
        <div className="hs-kicker">Commercial model · proposal</div>
        <h2>Each party bills for its own work.</h2>
        <div className="card">
          <div className="data-row"><span className="data-label">Platform</span><b className="data-value">Ireckonu licenses the platform to the hotel group</b></div>
          <div className="data-row"><span className="data-label">Services</span><b className="data-value">InnMetric bills the hotel for diagnosis, implementation and optional monitoring</b></div>
          <div className="data-row"><span className="data-label">Data</span><b className="data-value">The hotel approves any data exchange. No hotel or guest data is sold</b></div>
          <div className="data-row"><span className="data-label">Starting point</span><b className="data-value">Consulting, referral or co-selling</b></div>
          <div className="data-row"><span className="data-label">Software resale</span><b className="data-value">Only with Ireckonu's written authorization</b></div>
        </div>
        <p className="footer-note">Ireckonu's partner programme lists joint client engagements, paid workshops, training and demo environments. The pilot would use those routes.</p>
      </div>

      <div className="pitch-section ask" data-testid="irk-ask">
        <div className="hs-kicker">The ask</div>
        <h2>Choose one hotel group, one booking issue and one pilot owner.</h2>
        <p className="lead">Then confirm four things together:</p>
        <ul className="ask-list">
          {[
            ["Customer fit", "A group that already uses or is evaluating Ireckonu, with a booking issue guests can see."],
            ["Access", "Which property-level data or sandbox access the hotel permits."],
            ["Delivery", "Who acts and who approves at each step."],
            ["Success measures", "Repeat check, direct booking completion and net distribution cost."],
          ].map(([label, text]) => <li key={label}><CircleDashed size={15} aria-hidden="true" /><span><b>{label}.</b> {text}</span></li>)}
        </ul>
      </div>

      <footer className="footer-note partner-footer">
        Fictional property, simulated exports and seeded results. Not connected to Ireckonu or any hotel system. Based on Ireckonu's public{" "}
        <a href="https://ireckonu.com/partner-program/" target="_blank" rel="noopener noreferrer">partner programme</a> and{" "}
        <a href="https://ireckonu.com/middleware/" target="_blank" rel="noopener noreferrer">middleware</a> pages.
        <button className="link-button story-reset" onClick={() => { setStory(START); revealSoon("irk-issue"); }} data-testid="story-reset">
          <RotateCcw size={12} /> Restart story
        </button>
      </footer>
    </PartnerShell>
  );
}
