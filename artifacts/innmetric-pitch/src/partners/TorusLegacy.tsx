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
      { text: "On a phone, a two-night stay for two adults could not be completed on the hotel's own website. The same dates were open in the availability export.", tag: "Booking issue · observed twice" },
      { text: "Two of five pre-arrival requests never reached the front desk's shift notes.", tag: "Service handover gap · verified" },
    ],
  },
  {
    heading: "What we recommend",
    items: [
      { text: "Correct the booking path, then repeat the same check." },
      { text: "Agree one handover routine for pre-arrival requests, then repeat the same five requests." },
      { text: "If the owner commissions it: a handover workshop and playbook led by Torus Legacy, so the routine holds as shifts and staff change.", tag: "Optional workstream" },
    ],
  },
  {
    heading: "Who owns it",
    items: [
      { text: "One accountable lead: the InnMetric engagement lead, your single point of contact." },
      { text: "Torus Legacy: the introduction and, if the owner commissions it, the handover workstream." },
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
  ["Buyer", "The owner or the owner's representative commissions the review."],
  ["Scope", "One property. A booking and distribution review plus a check of how guest requests are handed over. Fixed fee, agreed in the meeting."],
  ["Delivery owner", "One InnMetric engagement lead, from the first call to the decision memo."],
  ["Observable result", "A repeat booking check on the same path and a repeat of the same five pre-arrival requests, reported separately in a concise decision memo."],
  ["Next decision", "Proceed with implementation at this property, review another property or stop at the memo."],
  ["Optional workstreams", "Implementation, quoted separately after the memo. A handover workshop and playbook, led and quoted by Torus Legacy, if the owner commissions it."],
  ["Sharing", "The memo goes to the owner. The owner decides who else sees it."],
] as const;

export const MEETING_BRIEF = `Meeting brief: Private Hospitality Portfolio Review (proposal)

Purpose
Agree whether to review one property and on what terms.

Buyer
The owner or the owner's representative commissions the review.

Scope
One property: a booking and distribution review and a check of how guest requests are handed over. Fixed fee, agreed in the meeting.

Delivery owner
One InnMetric engagement lead, from the first call to the decision memo.

Observable result
A repeat booking check on the same path and a repeat of the same five pre-arrival requests, reported separately in the decision memo.

Next decision
Proceed with implementation, review another property or stop at the memo.

Optional workstreams
- Implementation, quoted separately after the memo.
- Handover workshop and playbook, led and quoted by Torus Legacy if the owner commissions it.

To agree in the meeting
1. Which owner could be introduced and what they want checked.
2. What the owner is willing to share and with whom.
3. Fees, contracting and any commercial split between InnMetric and Torus Legacy.

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
      banner="Proposal for discussion with Torus Legacy. Fictional property and seeded results. No agreement or endorsement is implied."
      onRestart={() => { dialog.current?.close(); setStory({ engagement: false }); }}
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
          <div className="hs-kicker">Owner briefing · fictional example</div>
          <h2 id="torus-briefing-title">Property A, a 64-room hotel.</h2>
          <p className="small muted">What we found, what we recommend, who owns it and how we measure it.</p>
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
              <div className="result-label">Optional workstream · handover workshop and playbook</div>
              <p className="workstream-status"><CircleDashed size={15} aria-hidden="true" /> Not commissioned in this example</p>
              <p className="small muted">The first follow-up passing shows the routine works today. A short workshop and a written playbook keep it working as shifts and staff change. The owner decides whether to commission it; Torus Legacy would lead and quote it.</p>
            </div>
            <p className="footer-note">A working booking path says nothing about guest service. The reverse holds too. Commercial effects need the owner's actual records.</p>
          </section>
        </>
      )}

      <PartnerExchange
        partnerName="Torus Legacy"
        partnerBrings="A potential introduction to an owner or owner's representative. The ability to scope a specific guest-service deliverable, such as the handover workshop and playbook."
        innmetricBrings="The property diagnostic, booking evidence and retest, one accountable engagement lead and an owner decision memo. It turns a broad introduction into a scoped opportunity with an owner decision and a follow-up measure."
        gains={[
          { who: "Torus Legacy", text: "a service opportunity it can own and price if the owner approves." },
          { who: "InnMetric", text: "an introduction that can become a commissioned, fixed-scope review." },
        ]}
      />

      <PitchClose
        commercial={<>
          <p>The owner commissions the fixed-scope review. Implementation and any Torus Legacy workstream are quoted separately.</p>
          <p>The briefing names the buyer, scope, delivery owner, observable result and next decision. Fees, contracting and any commercial split are for the meeting.</p>
        </>}
        question="Is there one owner you would introduce for this review, and would Torus want to lead the handover workstream if the owner chooses it?"
      />

      <footer className="footer-note partner-footer">
        Proposal for discussion. Torus Legacy has not agreed to or endorsed it. No investment mandate, fund or third-party software dependency.
        This page is public: an unlisted link, Present mode or a noindex tag does not make it private, so real client material does not belong here.
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
