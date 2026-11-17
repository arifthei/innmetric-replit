import { useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Maximize2, Minimize2 } from "lucide-react";
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

export function PartnerShell({
  partner,
  title,
  banner,
  quiet = false,
  children,
}: {
  partner: PartnerId;
  title: string;
  banner: string;
  /** Torus Legacy uses a quieter page: more whitespace, fewer panels. */
  quiet?: boolean;
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
              <Link href="/" className="nav-item" data-testid="back-to-main">
                <ArrowLeft /><span>Hotel service and programme</span>
              </Link>
              <div className="nav-group">Partner Framework</div>
              {PARTNER_ROUTES.map(({ id, path, label, icon: Icon }) => (
                <Link
                  key={id}
                  href={path}
                  className={`nav-item${id === partner ? " active" : ""}`}
                  aria-current={id === partner ? "page" : undefined}
                >
                  <Icon /><span>{label}</span>
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
            <button className="present-exit" onClick={() => setPresent(false)} data-testid="present-exit">
              <Minimize2 size={14} /> Exit Present <kbd>Esc</kbd>
            </button>
          ) : (
            <header className="topbar">
              <div className="crumb"><span>Partner Framework</span><ArrowRight size={12} /><strong>{current.label}</strong></div>
              <div className="top-status">
                <span className="pill amber">Proposal</span>
                <span className="pill neutral">Fictional data</span>
                <button className="btn" onClick={() => setPresent(true)} data-testid="present-toggle">
                  <Maximize2 size={14} /> Present
                </button>
              </div>
              <div className="mobile-actions">
                <button className="btn small" onClick={() => setPresent(true)}><Maximize2 size={14} /> Present</button>
              </div>
            </header>
          )}
          <div className={`page partner-page${quiet ? " quiet" : ""}`}>{children}</div>
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
