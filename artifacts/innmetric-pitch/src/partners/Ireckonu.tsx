import { useEffect, useState } from "react";
import { Check, ClipboardCheck, FileSearch, Play, ShieldCheck, Smartphone } from "lucide-react";

import { PartnerExchange, PartnerShell, PitchClose, StoryBlock, readStory, revealSoon, writeStory } from "./PartnerShell";

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
    step: "Confirm the cause without changing the live site",
    acts: "Hotel systems lead; Ireckonu helps if agreed",
    approves: "Hotel pilot lead",
  },
  {
    step: "Correct the room mapping",
    acts: "The agreed systems team makes the change. InnMetric coordinates and records it.",
    approves: "Hotel pilot lead signs off before launch",
  },
  {
    step: "Repeat the same booking check",
    acts: "InnMetric",
    approves: "Pilot owner reviews the result",
  },
  {
    step: "Share the agreed hotel report",
    acts: "Hotel provides room availability, without guest details",
    approves: "Hotel authorizes access before sharing",
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
      banner="Proposal for Ireckonu · Fictional hotel and test data"
      onRestart={() => setStory(START)}
    >
      <header className="pitch-head">
        <div className="eyebrow">Ireckonu · proposed pilot</div>
        <p className="pitch-statement">
          Your platform connects the hotel’s systems. We check what guests see when they book, help the hotel fix what fails, and test it again.
        </p>
        <p className="lead">
          Start with one hotel group that uses Ireckonu or is considering it, and one problem its guests can see.
        </p>
      </header>

      <div className="proposal-tag" data-testid="proposal-tag">
        <b>For discussion.</b> No agreement is in place. The demo uses sample hotel reports and no guest data.
      </div>

      <div className="grid three role-trio">
        <section className="card">
          <div className="card-kicker">Ireckonu</div>
          <h3 className="role-title">Connects the hotel's systems</h3>
          <p className="small muted">Brings reservations together, monitors system connections and reports where bookings come from.</p>
        </section>
        <section className="card">
          <div className="card-kicker">InnMetric</div>
          <h3 className="role-title">Tests what guests see</h3>
          <p className="small muted">Shows where the booking fails, helps get it fixed and repeats the same test.</p>
        </section>
        <section className="card">
          <div className="card-kicker">Hotel group</div>
          <h3 className="role-title">Authorizes data access and changes</h3>
          <p className="small muted">Decides what to share and approves any fix before it goes live.</p>
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

      <StoryBlock id="irk-issue" kicker={`${STAY.property} · fictional`} title="The hotel has rooms. Guests can’t find them on mobile.">
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
        <StoryBlock id="irk-evidence" kicker="Evidence · same room, dates and guests" title="The hotel report shows three rooms. The phone shows none.">
          <div className="grid two">
            <section className="card">
              <div className="card-title">
                <div><div className="card-kicker">Booking test</div><h3 className="role-title">Two mobile checks and a desktop check</h3></div>
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
                <thead><tr><th>Night</th><th>Rooms open</th><th>Restriction</th><th>Rate plan</th></tr></thead>
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
            {["Same room type", "Same dates", "Same number of guests"].map((label) => <span key={label}><Check size={14} /> {label}</span>)}
          </div>
          <div className={`card hypothesis${story.causeConfirmed ? " confirmed" : ""}`} data-testid="irk-hypothesis">
            <div className="card-title">
              <div><div className="card-kicker">Possible cause</div><h3 className="role-title">The mobile site may still use an old code for this room.</h3></div>
              <span className={`status ${story.causeConfirmed ? "ok" : "open"}`}>{story.causeConfirmed ? "Confirmed by hotel · simulated" : "Hypothesis · not confirmed"}</span>
            </div>
            <p className="small muted">
              {story.causeConfirmed
                ? "The hotel systems lead confirmed the old room code in a test environment."
                : "The hotel still needs to check the room code, rate rules and timing of updates."}
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
        <StoryBlock id="irk-fix" kicker="Proposed fix · who acts, who approves" title="Update the room code after the hotel signs off.">
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
          <StoryBlock id="irk-recheck" kicker="Repeat check · 2026-11-14 10:05 UTC · simulated" title="The mobile booking path reaches guest details.">
            <div className="card">
              {RECHECK.map(([step, result]) => (
                <div className="check-row" key={step}><span>{step}</span><span className="status bookable"><Check size={12} /> {result}</span></div>
              ))}
            </div>
            <p className="footer-note">Same room, dates, guest count and device. The test stops before payment.</p>
          </StoryBlock>

          <StoryBlock id="irk-follow" kicker="Follow-up · after the fix" title="Did more guests book? Did the cost per booking change?">
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
              <b>Commercial impact: pending.</b> Compare the hotel’s real results before and after the fix.
            </div>
          </StoryBlock>
        </>
      )}

      <PartnerExchange
        partnerName="Ireckonu"
        partnerBrings="A platform specialist and, if agreed, an approved test environment or hotel report."
        innmetricBrings="Checks on the hotel’s booking site, evidence for its team, and a repeat test after the fix."
        gains={[
          { who: "Ireckonu", text: "a practical use case for a hotel customer and a possible paid workshop or implementation." },
          { who: "InnMetric", text: "a chance to deliver a paid diagnostic and build a service we can repeat with other hotels." },
        ]}
      />

      <section className="pitch-section" aria-labelledby="pilot-title" data-testid="proposed-pilot">
        <div className="hs-kicker">One proposed pilot</div>
        <h2 id="pilot-title">One hotel group, one guest-facing issue, one pilot owner.</h2>
        <div className="card">
          <div className="data-row"><span className="data-label">Hotel group</span><b className="data-value">An existing Ireckonu customer or one evaluating Ireckonu</b></div>
          <div className="data-row"><span className="data-label">Issue</span><b className="data-value">One booking problem we can reproduce</b></div>
          <div className="data-row"><span className="data-label">Hotel lead</span><b className="data-value">One person to approve access and changes</b></div>
          <div className="data-row"><span className="data-label">Steps</span><b className="data-value">Show the problem, confirm the cause, approve the fix and retest</b></div>
          <div className="data-row"><span className="data-label">Measures</span><b className="data-value">First, does the retest pass? Then compare bookings and costs if records are available.</b></div>
        </div>
      </section>

      <PitchClose
        commercial={<>
          <p>Ireckonu bills for its platform. InnMetric quotes for the diagnostic, help with the fix and optional monitoring.</p>
          <p>We can discuss referrals or selling the services together. The hotel authorizes any data access. No hotel or guest data is sold.</p>
        </>}
        question="Can we choose one hotel group, one issue and one pilot owner, and agree the access and responsibilities for a first test?"
      />

      <footer className="footer-note partner-footer">
        The example is simulated and has no live connections. See Ireckonu's public{" "}
        <a href="https://ireckonu.com/partner-program/" target="_blank" rel="noopener noreferrer">partner programme</a> and{" "}
        <a href="https://ireckonu.com/middleware/" target="_blank" rel="noopener noreferrer">middleware</a> pages.
      </footer>
    </PartnerShell>
  );
}
