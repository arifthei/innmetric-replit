import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";

import { PARTNER_ROUTES, type PartnerId } from "./routes";

/** Present mode lives in the URL (?present=1) so a refresh keeps it and the link can be opened directly. */
export function usePresentMode() {
  const search = useSearch();
  const [location, navigate] = useLocation();
  const present = new URLSearchParams(search).get("present") === "1";
  const setPresent = (on: boolean) => {
    const params = new URLSearchParams(search);
    if (on) params.set("present", "1");
    else params.delete("present");
    const query = params.toString();
    navigate(`${location}${query ? `?${query}` : ""}`, { replace: true });
  };
  return [present, setPresent] as const;
}

/** Story progress survives a refresh within the tab, like the main demo's walkthrough. */
export function readStory<T extends object>(key: string, fallback: T): T {
  try {
    const stored = JSON.parse(sessionStorage.getItem(key) ?? "null");
    return stored && typeof stored === "object" ? { ...fallback, ...stored } : fallback;
  } catch {
    return fallback;
  }
}

export function writeStory(key: string, value: object) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

/**
 * One partner meeting. In Present mode only this partner's story is rendered: no sidebar, no top bar and no
 * other partner's name anywhere in the page, its title or its accessibility text.
 */
export function PartnerShell({
  partner,
  title,
  banner,
  quiet = false,
  onRestart,
  children,
}: {
  partner: PartnerId;
  title: string;
  banner: string;
  /** Torus Legacy uses a quieter page: more whitespace, fewer panels. */
  quiet?: boolean;
  /** Resets this page's story to its first step. */
  onRestart: () => void;
  children: ReactNode;
}) {
  const [present, setPresent] = usePresentMode();
  const current = PARTNER_ROUTES.find((route) => route.id === partner)!;

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => { document.title = previous; };
  }, [title]);

  useEffect(() => {
    if (!present) return;
    const onKey = (event: KeyboardEvent) => {
      // Escape closes an open meeting brief first; only a second Escape leaves Present mode.
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) setPresent(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    document.querySelector(".main-area")?.scrollTo({ top: 0 });
  }, [partner]);

  const restart = () => {
    onRestart();
    document.querySelector(".main-area")?.scrollTo({ top: 0 });
  };

  return (
    <div className={`demo-root partner-root${present ? " presenting" : ""}${quiet ? " quiet" : ""}`} data-testid={`partner-${partner}`}>
      <div className="demo-banner" role="note">{banner}</div>
      <div className={`app-shell walk-hidden partner-shell${present ? " presenting" : ""}`}>
        {!present && (
          <aside className="sidebar" data-testid="partner-sidebar">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true" />
              <div>
                <div className="brand-name">innmetric</div>
                <div className="brand-sub">guided demo</div>
              </div>
            </div>
            <nav className="nav-list" aria-label="Main navigation">
              <div className="nav-group">Main demo</div>
              <Link href="/" className="nav-item" data-testid="back-to-main" aria-label="Back to the main demo">
                <ArrowLeft aria-hidden="true" /><span>Hotel service and programme</span>
              </Link>
              <div className="nav-group">Partner Framework</div>
              {PARTNER_ROUTES.map(({ id, path, label, icon: Icon }) => (
                <Link
                  key={id}
                  href={path}
                  className={`nav-item${id === partner ? " active" : ""}`}
                  aria-current={id === partner ? "page" : undefined}
                  aria-label={label}
                >
                  <Icon aria-hidden="true" /><span>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <p className="partner-side-note">Partner pitches are proposals. They use fictional data and run without the programme API.</p>
            </div>
          </aside>
        )}

        <main className="main-area">
          {present ? (
            <div className="present-controls" role="group" aria-label="Present mode controls">
              <button onClick={restart} data-testid="present-restart">
                <RotateCcw size={14} aria-hidden="true" /> Restart
              </button>
              <button onClick={() => setPresent(false)} data-testid="present-exit">
                <Minimize2 size={14} aria-hidden="true" /> Exit Present <kbd>Esc</kbd>
              </button>
            </div>
          ) : (
            <header className="topbar">
              <div className="crumb"><span>Partner Framework</span><ArrowRight size={12} aria-hidden="true" /><strong>{current.label}</strong></div>
              <div className="top-status">
                <span className="pill amber">Proposal</span>
                <span className="pill neutral">Fictional data</span>
                <button className="btn" onClick={() => setPresent(true)} data-testid="present-toggle">
                  <Maximize2 size={14} aria-hidden="true" /> Present
                </button>
              </div>
              <div className="mobile-actions">
                <button className="btn small" onClick={() => setPresent(true)}><Maximize2 size={14} aria-hidden="true" /> Present</button>
              </div>
            </header>
          )}
          <div className={`page partner-page${quiet ? " quiet" : ""}`}>
            {children}
            <button className="link-button story-reset" onClick={restart} data-testid="story-reset">
              <RotateCcw size={12} aria-hidden="true" /> Restart the story
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/** One revealed step of a partner story, with a stable anchor for scrolling. */
export function StoryBlock({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="story-block" id={id} aria-labelledby={`${id}-title`}>
      <div className="hs-kicker">{kicker}</div>
      <h2 id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

export function revealSoon(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "smooth" }));
}

/** What the partner brings, what InnMetric brings and what each side could gain. */
export function PartnerExchange({
  partnerName,
  partnerBrings,
  innmetricBrings,
  gains,
}: {
  partnerName: string;
  partnerBrings: ReactNode;
  innmetricBrings: ReactNode;
  gains: { who: string; text: ReactNode }[];
}) {
  return (
    <section className="pitch-section exchange" aria-labelledby="exchange-title" data-testid="partner-exchange">
      <div className="hs-kicker">The exchange</div>
      <h2 id="exchange-title">What each side brings, and what each could gain.</h2>
      <div className="exchange-grid">
        <div><h3>What {partnerName} brings</h3><p>{partnerBrings}</p></div>
        <div><h3>What InnMetric brings</h3><p>{innmetricBrings}</p></div>
        <div>
          <h3>What each side could gain</h3>
          {gains.map((gain) => <p key={gain.who}><b>{gain.who}:</b> {gain.text}</p>)}
        </div>
      </div>
    </section>
  );
}

/** The commercial starting point and the meeting's closing question. */
export function PitchClose({ commercial, question }: { commercial: ReactNode; question: string }) {
  return (
    <>
      <section className="pitch-section" aria-labelledby="commercial-title">
        <div className="hs-kicker">Commercial starting point · proposal</div>
        <h2 id="commercial-title">Each side is paid for its own work.</h2>
        <div className="commercial-text">{commercial}</div>
      </section>
      <section className="pitch-section ask" aria-labelledby="ask-title" data-testid="pitch-ask">
        <div className="hs-kicker">The ask</div>
        <h2 id="ask-title" className="ask-quote">“{question}”</h2>
      </section>
    </>
  );
}
