import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, MessageSquareText, X } from "lucide-react";

import { PartnerShell, readStory, revealSoon, writeStory } from "./PartnerShell";

const STORY_KEY = "innmetric-partner-torus-legacy-v1";

/*
 * Presentation choices follow published guidance on selling to high-net-worth clients: discreet presentation,
 * recommendations tailored to one property, one trusted point of contact, a clear scope and client-controlled
 * sharing. No wealth scoring, luxury imagery or scarcity cues. Everything shown is fictional.
 */

const BRIEFING = [
  {
    heading: "What we found",
    items: [
      { text: "On a phone, a two-night stay for two adults could not be completed on the hotel's own website. The same dates were open in the availability export.", tag: "Booking issue · observed twice" },
      { text: "Two of five pre-arrival requests never reached the front desk's shift notes.", tag: "Service handover gap · verified" },
    ],
  },
  {
    heading: "What we recommend",
    items: [
      { text: "Correct the booking path, then repeat the same check." },
      { text: "Agree one handover routine for pre-arrival requests. If the follow-up check still shows gaps, Torus Legacy scopes a short guest-service training module." },
    ],
  },
  {
    heading: "Who owns it",
    items: [
      { text: "One accountable lead: the InnMetric engagement lead, your single point of contact." },
      { text: "Torus Legacy: introductions and any service module the evidence supports." },
      { text: "You decide what is shared and with whom." },
    ],
  },
  {
    heading: "How we measure it",
    items: [
      { text: "Booking: repeat the same path, dates and occupancy." },
      { text: "Service: repeat the same five pre-arrival requests." },
      { text: "Reported separately. One does not stand in for the other." },
    ],
  },
] as const;

const ENGAGEMENT = [
  ["Diagnostic scope", "One property. A booking and distribution review, plus a check of how guest requests are handed over. Fixed fee, agreed in the meeting."],
  ["Deliverable", "A concise decision memo for the owner."],
  ["Accountable lead", "One InnMetric engagement lead, from the first call to the memo."],
  ["Implementation", "Optional. Quoted separately after the memo."],
  ["Owner's next decision", "Proceed with implementation at this property, review another property or stop at the memo."],
  ["Sharing", "The memo goes to the owner. The owner decides who else sees it."],
] as const;

const MEETING_BRIEF = `Meeting brief: Private Hospitality Portfolio Review (proposal)

Purpose
Agree whether to review one property and on what terms.

Proposed attendees
- The owner or the owner's representative
- InnMetric engagement lead
- Torus Legacy, as proposed introductions and delivery partner

Agenda
1. Choose one property and what the owner wants checked.
2. What the owner is willing to share and with whom.
3. Scope of the fixed-fee review and the decision memo.
4. Fees, contracting and any commercial split between InnMetric and Torus Legacy.
5. The owner's next decision and its timing.

Out of scope
No investment mandate, fund or third-party software dependency.

The example shown in the demo (Property A) is fictional.`;

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
      banner="Proposal for discussion with Torus Legacy. Fictional property and seeded results. No agreement or endorsement is implied."
    >
      <header className="pitch-head">
        <div className="eyebrow">Partner Framework · Torus Legacy · Private Hospitality Portfolio Review</div>
        <p className="pitch-statement">
          Start with one property. Find what is costing the owner bookings or letting guests down. Give the owner one person to call and a clear plan to fix it.
        </p>
        <p className="lead">
          A fixed-fee review of one property for an asset owner, family office or owner's representative. InnMetric leads the booking and distribution work. Torus Legacy is the proposed introductions and delivery partner.
        </p>
      </header>

      <section className="briefing" aria-labelledby="torus-briefing-title" data-testid="torus-briefing">
        <div className="briefing-meta">
          <div className="hs-kicker">Private briefing · Property A</div>
          <h2 id="torus-briefing-title">A 64-room hotel, prepared for the owner only.</h2>
          <p className="small muted">Fictional property and data.</p>
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
            <MessageSquareText size={15} /> Discuss one property
          </button>
        </div>
      </section>

      {story.engagement && (
        <>
          <section className="quiet-section" id="torus-engagement" aria-labelledby="torus-engagement-title">
            <div className="hs-kicker">The engagement</div>
            <h2 id="torus-engagement-title">One property, one lead, one decision at a time.</h2>
            <dl className="engagement-list">
              {ENGAGEMENT.map(([term, detail]) => (
                <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
              ))}
            </dl>
          </section>

          <section className="quiet-section" aria-labelledby="torus-results-title" data-testid="torus-results">
            <div className="hs-kicker">After implementation · seeded results</div>
            <h2 id="torus-results-title">Two checks, reported separately.</h2>
            <div className="result-pair">
              <div>
                <div className="result-label">Repeat booking check</div>
                <p className="result-value"><Check size={16} aria-hidden="true" /> Completed</p>
                <p className="small muted">Phone, two adults, the same dates: the guest details page was reached. Stopped before payment; no booking created.</p>
              </div>
              <div>
                <div className="result-label">Follow-up service check</div>
                <p className="result-value"><Check size={16} aria-hidden="true" /> 5 of 5 requests reached the shift notes</p>
                <p className="small muted">The same five pre-arrival requests, repeated after the handover routine was agreed.</p>
              </div>
            </div>
            <p className="footer-note">A working booking path says nothing about guest service. The reverse holds too. Commercial effects need the owner's actual records.</p>
          </section>
        </>
      )}

      <footer className="footer-note partner-footer">
        Proposal for discussion. Torus Legacy has not agreed to or endorsed it. No investment mandate, fund or Ireckonu dependency. Fees, contracting and any commercial split are for the meeting.
        This page is public: an unlisted link, Present mode or a noindex tag does not make it private, so real client material does not belong here.
        <button className="link-button story-reset" onClick={() => { setStory({ engagement: false }); revealSoon("torus-briefing-title"); }} data-testid="story-reset">
          Restart
        </button>
      </footer>

      <dialog ref={dialog} className="brief-dialog" aria-labelledby="brief-title" data-testid="torus-brief">
        <div className="brief-head">
          <h2 id="brief-title">Meeting brief</h2>
          <button className="icon-btn" onClick={() => dialog.current?.close()} aria-label="Close meeting brief"><X size={15} /></button>
        </div>
        <p className="small muted">Nothing is sent from here. Copy the brief into your own note or invitation.</p>
        <textarea ref={briefText} className="text-area brief-text" readOnly value={MEETING_BRIEF} rows={16} aria-label="Meeting brief text" />
        <div className="btn-row">
          <button className="btn primary" onClick={() => void copyBrief()} data-testid="torus-copy-brief"><Copy size={14} /> Copy brief</button>
          <button className="btn" onClick={() => dialog.current?.close()}>Close</button>
          <span className="small muted" role="status">
            {copied === "copied" ? "Copied to the clipboard." : copied === "select" ? "Clipboard blocked. The text is selected; copy it by hand." : ""}
          </span>
        </div>
      </dialog>
    </PartnerShell>
  );
}
