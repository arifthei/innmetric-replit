import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CircleDashed, Copy, MessageSquareText, X } from "lucide-react";

import { PartnerExchange, PartnerShell, PitchClose, readStory, revealSoon, writeStory } from "./PartnerShell";

const STORY_KEY = "innmetric-partner-torus-legacy-v1";

/*
 * Presentation choices follow published guidance on selling to high-net-worth clients: discreet presentation,
 * recommendations tailored to one property, one trusted point of contact, a clear scope and client-controlled
 * sharing. No wealth scoring, luxury imagery or scarcity cues. Everything shown is fictional.
 * Meeting rule: this page never names any other prospective partner.
 */

const BRIEFING = [
  {
    heading: "What we found",
    items: [
      { text: "A room was available for two nights, but guests couldn’t book it on their phones.", tag: "Booking test · failed twice" },
      { text: "The front desk missed two of five requests made before arrival.", tag: "Shift handover · two requests missing" },
    ],
  },
  {
    heading: "What we recommend",
    items: [
      { text: "Fix the mobile booking problem and test the same stay again." },
      { text: "Give the front desk one place to log requests and check that the next shift sees them." },
      { text: "Torus Legacy could train shift leads and leave them a written checklist.", tag: "Optional paid service" },
    ],
  },
  {
    heading: "Who does the work",
    items: [
      { text: "InnMetric leads the review and is the owner’s point of contact." },
      { text: "Torus Legacy can make the introduction and quote for training." },
      { text: "The owner decides who sees the findings." },
    ],
  },
  {
    heading: "How we measure it",
    items: [
      { text: "Booking: can guests reach the details page for the same stay?" },
      { text: "Service: do all five requests reach the next shift?" },
    ],
  },
] as const;

const ENGAGEMENT = [
  ["Buyer", "The property owner or their representative."],
  ["Scope", "One property, one fixed fee. Check the direct booking site and how the front desk passes on guest requests."],
  ["Delivery owner", "One InnMetric lead, from the first call to the written findings."],
  ["Observable result", "A short report with evidence, proposed fixes and how to check them if the owner proceeds."],
  ["Next decision", "Approve a fix, review another property or stop after the report."],
  ["Optional workstreams", "InnMetric can quote for the booking fix and retest. Torus Legacy can quote for a shift handover workshop and checklist."],
  ["Sharing", "Only the owner decides who receives the report."],
] as const;

export const MEETING_BRIEF = `Meeting brief: Private Hospitality Portfolio Review (proposal)

Purpose
Choose one property to review.

Buyer
The property owner or their representative.

Scope
One fixed-fee review: the direct booking site and the front desk’s process for passing on guest requests.

Delivery owner
One InnMetric lead, from the first call to the written findings.

Observable result
A short report with evidence, proposed fixes and how to check them if the owner proceeds.

Next decision
Approve a fix, review another property or stop after the report.

Optional workstreams
- InnMetric can quote for the booking fix and retest.
- Torus Legacy can quote for a shift handover workshop and checklist.

To agree in the meeting
1. Who Torus Legacy could introduce and what that owner wants checked.
2. What the owner will share and who may see the findings.
3. Who does each job and what each job costs.

The example on the demo page (Property A) is fictional. Nothing is sent from the demo.`;

export function TorusLegacyPitch() {
  const [story, setStory] = useState(() => readStory(STORY_KEY, { engagement: false }));
  useEffect(() => writeStory(STORY_KEY, story), [story]);
  const [copied, setCopied] = useState<"" | "copied" | "select">("");
  const dialog = useRef<HTMLDialogElement>(null);
  const briefText = useRef<HTMLTextAreaElement>(null);

  const openBrief = () => {
    setCopied("");
    dialog.current?.showModal();
  };
  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(MEETING_BRIEF);
      setCopied("copied");
    } catch {
      // Clipboard access can be blocked; leave the text selected so it can be copied by hand.
      briefText.current?.select();
      setCopied("select");
    }
  };

  return (
    <PartnerShell
      partner="torus-legacy"
      quiet
      title="Torus Legacy review proposal · InnMetric demo"
      banner="Proposal for Torus Legacy · Fictional property and test results"
      onRestart={() => { dialog.current?.close(); setStory({ engagement: false }); }}
    >
      <header className="pitch-head">
        <div className="eyebrow">Torus Legacy · Private Hospitality Portfolio Review</div>
        <p className="pitch-statement">
          Start with one hotel. Show the owner where guests get stuck, what to fix first and who will do the work.
        </p>
        <p className="lead">
          The owner pays a fixed fee for the review and works with one InnMetric lead. Torus Legacy could introduce the owner and deliver any staff training the owner chooses.
        </p>
      </header>

      <section className="briefing" aria-labelledby="torus-briefing-title" data-testid="torus-briefing">
        <div className="briefing-meta">
          <div className="hs-kicker">Owner briefing · fictional example</div>
          <h2 id="torus-briefing-title">Property A, a 64-room hotel.</h2>
          <p className="small muted">An example of what the owner receives.</p>
        </div>
        <ol className="briefing-flow">
          {BRIEFING.map((column, index) => (
            <li key={column.heading}>
              <div className="briefing-step">
                <span>{column.heading}</span>
                {index < BRIEFING.length - 1 && <ArrowRight size={14} aria-hidden="true" />}
              </div>
              {column.items.map((item) => (
                <p key={item.text}>
                  {item.text}
                  {"tag" in item && <span className="briefing-tag">{item.tag}</span>}
                </p>
              ))}
            </li>
          ))}
        </ol>
        <div className="btn-row story-actions">
          <button className="btn primary" disabled={story.engagement} onClick={() => { setStory({ engagement: true }); revealSoon("torus-engagement"); }} data-testid="torus-review-engagement">
            Review engagement
          </button>
          <button className="btn" onClick={openBrief} data-testid="torus-discuss">
            <MessageSquareText size={15} aria-hidden="true" /> Discuss one property
          </button>
        </div>
      </section>

      {story.engagement && (
        <>
          <section className="quiet-section" id="torus-engagement" aria-labelledby="torus-engagement-title">
            <div className="hs-kicker">The engagement</div>
            <h2 id="torus-engagement-title">What the owner buys</h2>
            <dl className="engagement-list">
              {ENGAGEMENT.map(([term, detail]) => (
                <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
              ))}
            </dl>
          </section>

          <section className="quiet-section" aria-labelledby="torus-results-title" data-testid="torus-results">
            <div className="hs-kicker">After an approved fix · simulated results</div>
            <h2 id="torus-results-title">How we would check the fixes</h2>
            <div className="result-pair">
              <div>
                <div className="result-label">Repeat booking check</div>
                <p className="result-value"><Check size={16} aria-hidden="true" /> Guest details reached</p>
                <p className="small muted">Phone, two adults, the same dates. Stopped before payment; no booking created.</p>
              </div>
              <div>
                <div className="result-label">Follow-up service check</div>
                <p className="result-value"><Check size={16} aria-hidden="true" /> 5 of 5 requests reached the shift notes</p>
                <p className="small muted">The same five pre-arrival requests, repeated after the handover routine was agreed.</p>
              </div>
            </div>
            <div className="workstream" data-testid="torus-workstream">
              <div className="result-label">Optional paid service · shift handover workshop</div>
              <p className="workstream-status"><CircleDashed size={15} aria-hidden="true" /> Owner approval needed</p>
              <p className="small muted">Torus Legacy could train shift leads, leave a checklist and agree a follow-up check with the owner. The owner decides whether to buy it.</p>
            </div>
            <p className="footer-note">These checks don’t show a change in revenue. That needs the hotel’s actual booking records.</p>
          </section>
        </>
      )}

      <PartnerExchange
        partnerName="Torus Legacy"
        partnerBrings="An introduction to a property owner and, if requested, a quote for staff training."
        innmetricBrings="The hotel review, evidence from the booking site, one point of contact and a short report the owner can act on."
        gains={[
          { who: "Torus Legacy", text: "a useful offer for an owner in its network and a paid training opportunity if needed." },
          { who: "InnMetric", text: "a paid first review and a chance to work with the owner’s other properties." },
        ]}
      />

      <PitchClose
        commercial={<>
          <p>The owner pays InnMetric for the review. Fixes and any Torus Legacy training are quoted separately, for the owner to approve.</p>
          <p>Agree who contracts for each job before offering it to an owner.</p>
        </>}
        question="Is there one owner you would introduce for this review, and would Torus want to lead the handover workstream if the owner chooses it?"
      />

      <footer className="footer-note partner-footer">
        Proposal only. No agreement is in place. This public demo uses a fictional property; don’t add real client material here.
      </footer>

      <dialog ref={dialog} className="brief-dialog" aria-labelledby="brief-title" data-testid="torus-brief">
        <div className="brief-head">
          <h2 id="brief-title">Meeting brief</h2>
          <button className="icon-btn" onClick={() => dialog.current?.close()} aria-label="Close meeting brief"><X size={15} aria-hidden="true" /></button>
        </div>
        <p className="small muted">Nothing is sent from here. Copy the brief into your own note or invitation.</p>
        <textarea ref={briefText} className="text-area brief-text" readOnly value={MEETING_BRIEF} rows={18} aria-label="Meeting brief text" />
        <div className="btn-row">
          <button className="btn primary" onClick={() => void copyBrief()} data-testid="torus-copy-brief"><Copy size={14} aria-hidden="true" /> Copy brief</button>
          <button className="btn" onClick={() => dialog.current?.close()}>Close</button>
          <span className="small muted" role="status">
            {copied === "copied" ? "Copied to the clipboard." : copied === "select" ? "Clipboard blocked. The text is selected; copy it by hand." : ""}
          </span>
        </div>
      </dialog>
    </PartnerShell>
  );
}
