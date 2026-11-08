import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CircleAlert,
  Compass,
  Download,
  FileCheck2,
  FileText,
  HandCoins,
  Landmark,
  Layers3,
  RotateCcw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import {
  downloadDemoExport,
  getOrCreateSessionId,
  loadDemo,
  sendDemoAction,
  type DemoAction,
  type DemoRole,
  type DemoSnapshot,
} from "./lib/demo-api";

type Page =
  | "overview"
  | "discovery"
  | "case"
  | "support"
  | "funds"
  | "services"
  | "guide";

type DemoState = {
  dataMode: "synthetic";
  role: DemoRole;
  hotelId: string | null;
  scope?: {
    role: DemoRole;
    hotelId: string | null;
    canViewPortfolio: boolean;
    canViewFinance: boolean;
    canViewSupport: boolean;
    candidateCount: number;
  };
  fixture: any;
  discovery: { cursor: number; records: Record<string, any> };
  savings: {
    id: string;
    version: number;
    status: string;
    baselineMinor: number | null;
    observedMinor: number | null;
    candidateMinor: number | null;
    evidenceIds: string[];
    approvals: any[];
  };
  collection: { id: string; version: number; amountMinor: number; approvals: any[]; posted: boolean };
  need: { id: string; suggested: boolean; confirmed: boolean; consultations: any[] };
  support: any;
  reservations: any[];
  ledger: any[];
  directPayments: any[];
  delivery: any;
  outcome: any;
  commercial: { proposals: any[]; invoices: any[] };
  corrections: any[];
};

type ActionRunner = (
  action: DemoAction,
  payload?: Record<string, unknown>,
  idempotencyKey?: string,
) => Promise<void>;

const PAGE_LABELS: Record<Page, string> = {
  overview: "Programme overview",
  discovery: "Discovery",
  case: "Hotel cases",
  support: "Programme support",
  funds: "Department funds",
  services: "InnMetric services",
  guide: "Presenter guide",
};

const ROLE_LABELS: Record<DemoRole, string> = {
  innmetric: "InnMetric operator",
  department: "Tourism Department",
  hotel: "Hotel representative",
  provider: "Service provider",
};

const ROLES: DemoRole[] = ["innmetric", "department", "hotel", "provider"];
const HOTEL_OPTIONS = [
  { id: "hotel-a", name: "Hotel A" },
  { id: "hotel-b", name: "Hotel B" },
  { id: "hotel-c", name: "Hotel C" },
];

const money = (minor: number | null | undefined) =>
  minor === null || minor === undefined
    ? "Not configured"
    : `AED ${(minor / 100).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const approvalFor = (list: any[] | undefined, role: "innmetric" | "department", version: number, amount: number) =>
  (list ?? []).some((item) => item.role === role && item.version === version && item.amountMinor === amount);

function calculateBalances(state: DemoState) {
  const cash = state.ledger.reduce(
    (sum, entry) => sum + (entry.direction === "in" ? entry.amountMinor : -entry.amountMinor),
    0,
  );
  const reserved = state.reservations
    .filter((item) => item.status === "reserved")
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const attributable = state.ledger.reduce(
    (sum, entry) =>
      sum +
      (entry.attributableHotelId === "hotel-a"
        ? entry.direction === "in"
          ? entry.amountMinor
          : -entry.amountMinor
        : 0),
    0,
  );
  return { cash, reserved, available: cash - reserved, attributable };
}

function AppButton({
  children,
  onClick,
  disabled,
  primary = false,
  danger = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      className={`btn${primary ? " primary" : ""}${danger ? " danger" : ""}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

function App() {
  const [snapshot, setSnapshot] = useState<DemoSnapshot | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [page, setPage] = useState<Page>("overview");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const id = getOrCreateSessionId();
      setSessionId(id);
      loadDemo(id)
        .then(setSnapshot)
        .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not load the demo."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Browser session storage is unavailable.");
    }
  }, []);

  const state = snapshot?.state as unknown as DemoState | undefined;
  const balances = useMemo(
    () => (state ? calculateBalances(state) : { cash: 0, reserved: 0, available: 0, attributable: 0 }),
    [state],
  );
  const act = async (
    action: DemoAction,
    payload: Record<string, unknown> = {},
    idempotencyKey?: string,
  ) => {
    if (!sessionId) return;
    setBusy(true);
    setMessage("");
    try {
      const next = await sendDemoAction(sessionId, action, payload, idempotencyKey);
      setSnapshot(next);
      setMessage("Saved to this visitor's synthetic server session.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Action was not completed.");
    } finally {
      setBusy(false);
    }
  };
  const switchRole = (role: DemoRole, hotelId?: string | null) => {
    void act("role.switch", {
      role,
      ...(role === "hotel" ? { hotelId: hotelId ?? state?.hotelId ?? "hotel-b" } : {}),
    });
  };
  const resetSession = () => {
    if (!window.confirm("Start a new private synthetic session? The current session will remain in the demo audit history.")) return;
    sessionStorage.removeItem("innmetric-programme-demo-session-v1");
    window.location.reload();
  };
  const exportSession = async () => {
    if (!sessionId) return;
    setBusy(true);
    try {
      await downloadDemoExport(sessionId);
      setMessage("Synthetic evidence, decisions, fund lineage, and open items exported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  const nav: { id: Page; label: string; icon: typeof Layers3 }[] = [
    { id: "overview", label: PAGE_LABELS.overview, icon: Layers3 },
    { id: "discovery", label: PAGE_LABELS.discovery, icon: Compass },
    { id: "case", label: PAGE_LABELS.case, icon: Building2 },
    { id: "support", label: PAGE_LABELS.support, icon: HandCoins },
    { id: "funds", label: PAGE_LABELS.funds, icon: Wallet },
    { id: "services", label: PAGE_LABELS.services, icon: FileText },
  ];

  if (!state || !snapshot) {
    return (
      <main className="loading-shell" aria-live="polite">
        <div className="brand-mark">i</div>
        <h1>InnMetric programme demo</h1>
        <p>{message || "Loading a private synthetic session…"}</p>
        {message && <button className="btn" onClick={() => window.location.reload()}>Try again</button>}
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">i</div>
          <div>
            <div className="brand-name">innmetric</div>
            <div className="brand-sub">programme workspace</div>
          </div>
        </div>
        <div>
          <div className="nav-label" style={{ padding: "0 10px 8px" }}>Workspace</div>
          <nav className="nav-list" aria-label="Main navigation">
            {nav.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-item ${page === id ? "active" : ""}`}
                onClick={() => { setPage(id); setMessage(""); }}
                aria-current={page === id ? "page" : undefined}
              >
                <Icon /><span>{label}</span>
              </button>
            ))}
            <button className={`nav-item ${page === "guide" ? "active" : ""}`} onClick={() => setPage("guide")}>
              <Activity /><span>{PAGE_LABELS.guide}</span>
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <RoleControls state={state} busy={busy} onSwitch={switchRole} />
          <button className="reset-button" onClick={resetSession}><RotateCcw size={14} /> New session</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="crumb"><span>InnMetric</span><ArrowRight size={12} /><strong>{PAGE_LABELS[page]}</strong></div>
          <div className="top-status">
            <span className="pill amber">Synthetic data</span>
            <span className="pill teal">Server-persisted demo</span>
            <span className="pill neutral">Simulated roles and payments</span>
            <AppButton onClick={() => void exportSession()} disabled={busy}><Download size={14} /> Export</AppButton>
          </div>
          <div className="mobile-actions"><RoleControls state={state} busy={busy} onSwitch={switchRole} /></div>
        </header>

        <div className="page">
          {message && (
            <div className={`notice ${message.toLowerCase().startsWith("blocked") || message.includes("cannot") || message.includes("required") ? "red" : "teal"}`} role="status" style={{ marginBottom: 18 }}>
              {message}
            </div>
          )}
          <div className="notice red boundary">
            <b>Prototype boundary.</b> All records and operations are synthetic. This role switcher is not authentication; no live discovery, government affiliation, real uploads, funds, payments or checkout are connected.
          </div>
          {page === "overview" && <Overview state={state} snapshot={snapshot} balances={balances} onNavigate={setPage} />}
          {page === "discovery" && <Discovery state={state} busy={busy} onAction={act} />}
          {page === "case" && <HotelCase state={state} busy={busy} onAction={act} />}
          {page === "support" && <Support state={state} busy={busy} onAction={act} />}
          {page === "funds" && <Funds state={state} balances={balances} busy={busy} onAction={act} />}
          {page === "services" && <Services state={state} busy={busy} onAction={act} />}
          {page === "guide" && <Guide onNavigate={setPage} />}
          <footer className="footer-note">
            Proposed programme · Tourism Department — Demo · No official insignia or endorsement · Data mode: synthetic · Session {sessionId.slice(0, 8)}
          </footer>
        </div>
      </main>
    </div>
  );
}

function RoleControls({
  state,
  busy,
  onSwitch,
}: {
  state: DemoState;
  busy: boolean;
  onSwitch: (role: DemoRole, hotelId?: string | null) => void;
}) {
  return (
    <div className="role-box">
      <label htmlFor="role-picker">Simulated perspective</label>
      <select
        id="role-picker"
        className="role-select"
        value={state.role}
        disabled={busy}
        onChange={(event) => onSwitch(event.target.value as DemoRole)}
      >
        {ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
      </select>
      {state.role === "hotel" && (
        <select
          aria-label="Hotel representative perspective"
          className="role-select"
          style={{ marginTop: 8 }}
          value={state.hotelId ?? "hotel-b"}
          disabled={busy}
          onChange={(event) => onSwitch("hotel", event.target.value)}
        >
          {HOTEL_OPTIONS.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
        </select>
      )}
      <div className="role-caption">Four simulated role types; hotel A, B and C perspectives are scoped separately.</div>
    </div>
  );
}

function PageHead({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="lead">{text}</p></div>
      {action}
    </div>
  );
}

function Overview({
  state,
  snapshot,
  balances,
  onNavigate,
}: {
  state: DemoState;
  snapshot: DemoSnapshot;
  balances: ReturnType<typeof calculateBalances>;
  onNavigate: (page: Page) => void;
}) {
  const processed = Object.keys(state.discovery.records).length;
  const latest = snapshot.events.slice(-5).reverse();
  const financeVisible = state.scope?.canViewFinance ?? true;
  const candidateCount = state.scope?.candidateCount ?? 4;
  const scopedHotel = HOTEL_OPTIONS.find((hotel) => hotel.id === state.scope?.hotelId);
  return (
    <>
      <PageHead
        eyebrow="Proposed tourism support programme"
        title="From evidence to accountable service."
        text="One persistent synthetic journey links discovery, hotel confirmation, joint review, department-controlled support, provider delivery and outcome confirmation."
        action={<AppButton primary onClick={() => onNavigate("discovery")}><Compass size={15} /> Continue journey</AppButton>}
      />
      <div className="step-strip" aria-label="Programme stages">
        {["Discover", "Review", "Approve", "Fund", "Deliver"].map((stage, index) => (
          <span key={stage} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <i className={`step-dot ${index < ((state.support?.status === "paid") ? 5 : state.collection?.posted ? 3 : processed ? 1 : 0) ? "done" : ""}`} />
            <span className="small muted">{stage}</span>{index < 4 && <ArrowRight size={12} color="#a79e90" />}
          </span>
        ))}
      </div>
      <div className="grid three">
        <MetricCard label="Candidates processed" value={`${processed} / ${candidateCount}`} sub="Finite synthetic queue" onClick={() => onNavigate("discovery")} />
        <MetricCard label="Department cash · simulated" value={financeVisible ? money(balances.cash) : "Not visible"} sub={financeVisible ? `Available ${money(balances.available)} · reserved ${money(balances.reserved)}` : "Restricted to InnMetric and department"} onClick={() => onNavigate("funds")} />
        <MetricCard label="InnMetric commercial lane" value="Separate" sub="Prices and rates not configured" onClick={() => onNavigate("services")} />
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-title"><div><div className="card-kicker">Evidence before inference</div><h2>Four different states</h2></div><span className="pill amber">Synthetic examples</span></div>
          {financeVisible ? <>
            <div className="data-row"><span className="data-label">Hotel A</span><b className="data-value">Candidate route failure · two observations</b></div>
            <div className="data-row"><span className="data-label">Hotel B</span><b className="data-value">Carpentry suggested · hotel must confirm</b></div>
            <div className="data-row"><span className="data-label">Hotel C</span><b className="data-value">Commercial inquiry · no discovery evidence</b></div>
            <div className="data-row"><span className="data-label">Hotel D</span><b className="data-value">Unverified · bot-blocked observation</b></div>
          </> : <div className="data-row"><span className="data-label">{scopedHotel?.name ?? "Assigned Hotel B"}</span><b className="data-value">Your view is limited to this synthetic perspective.</b></div>}
          <p className="footer-note">Review excerpts do not establish affordability, eligibility or a proven fault.</p>
        </section>
        <section className="card">
          <div className="card-title"><div><div className="card-kicker">Recent event history</div><h2>Saved on the server</h2></div><span className="pill neutral">{snapshot.events.length} events</span></div>
          {latest.length === 0 ? <p className="small muted">No actions recorded yet.</p> : latest.map((event: any) => (
            <div className="evidence" key={event.id} style={{ marginTop: 8 }}>
              <Activity size={15} /><span><b>{event.actorRole}</b> · {event.action} · {event.reason}</span>
            </div>
          ))}
        </section>
      </div>
      <div className="section-title"><h2>Five connected work areas</h2></div>
      <div className="queue-list">
        {([
          ["discovery", "Discovery", "Bounded queue with evidence references and unknowns."],
          ["case", "Hotel cases", "Separate suspected issues, confirmed needs and cost review."],
          ["support", "Programme support", "Quotes, contribution, approvals, delivery and outcome."],
          ["funds", "Department funds", "Receipts, attribution, reservations and payment history."],
          ["services", "InnMetric services", "Separate subscription/on-demand proposals and invoice records."],
        ] as [Page, string, string][]).map(([target, title, detail]) => (
          <button className="queue-item work-area-link" key={target} onClick={() => onNavigate(target)}>
            <span className="queue-letter"><ArrowRight size={16} /></span><span className="queue-copy"><strong>{title}</strong><p>{detail}</p></span><span className="pill neutral">Open</span>
          </button>
        ))}
      </div>
    </>
  );
}

function MetricCard({ label, value, sub, onClick }: { label: string; value: string; sub: string; onClick: () => void }) {
  return (
    <button className="card metric-card" onClick={onClick}>
      <div className="card-kicker">{label}</div><div className="metric">{value}</div><div className="metric-sub">{sub}</div>
    </button>
  );
}

function Discovery({ state, busy, onAction }: { state: DemoState; busy: boolean; onAction: ActionRunner }) {
  if (state.role === "provider") {
    return <><PageHead eyebrow="Assigned service work" title="Discovery is not part of your assignment." text="Provider perspectives see the assigned quote and delivery workflow, not hotel discovery evidence." /><div className="notice">Open Programme support to review the assigned work and record delivery.</div></>;
  }
  const records = [
    { id: "hotel-a", name: "Hotel A", refs: ["A-route", "A-check-1", "A-check-2"], defaultStatus: "Queued", tone: "red" },
    { id: "hotel-b", name: "Hotel B", refs: ["B-review-1", "B-review-2"], defaultStatus: "Queued", tone: "amber" },
    { id: "hotel-c", name: "Hotel C", refs: [], defaultStatus: "No discovery evidence", tone: "neutral" },
    { id: "hotel-d", name: "Hotel D", refs: ["D-blocked", "D-review"], defaultStatus: "Queued", tone: "amber" },
  ];
  return (
    <>
      <PageHead
        eyebrow="Analysis of synthetic evidence"
        title="Discovery queue"
        text="Process one candidate at a time. The queue is bounded, resumable and cites the exact fixture records it evaluated."
        action={<AppButton primary disabled={busy || state.role !== "innmetric" || state.discovery.cursor >= (state.scope?.candidateCount ?? 4)} onClick={() => void onAction("discovery.run")}><Compass size={15} /> Process next candidate</AppButton>}
      />
      <div className="notice">No live crawling or external hotel/vendor data. A candidate signal never creates a funding decision.</div>
      <div className="section-title"><h2>Queue progress</h2><span className="pill neutral">{state.discovery.cursor} / {state.scope?.candidateCount ?? 4} processed</span></div>
      <div className="queue-list">
        {records.filter((record) => state.scope?.canViewPortfolio || record.id === state.scope?.hotelId).map((record) => {
          const result = state.discovery.records[record.id];
          const label = result?.status?.replaceAll("_", " ") ?? record.defaultStatus;
          return (
            <article className="queue-item" key={record.id}>
              <div className="queue-letter">{record.name.slice(-1)}</div>
              <div className="queue-copy"><strong>{record.name}</strong><p>{result?.reason ?? (record.id === "hotel-c" ? "Separate commercial inquiry does not count as discovery evidence." : "Awaiting bounded synthetic analysis.")}</p></div>
              <span className={`pill ${result?.status === "unverified" ? "amber" : result?.status ? "teal" : record.tone}`}>{label}</span>
              <span className="small muted">Evidence: {result?.evidenceIds?.join(", ") || record.refs.join(", ") || "None"}</span>
            </article>
          );
        })}
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        {(state.scope?.canViewPortfolio || state.scope?.hotelId === "hotel-a") && <section className="card">
          <div className="card-kicker">Hotel A · core route signal</div><h2 style={{ marginTop: 6 }}>Candidate failure, not a verdict.</h2>
          <EvidenceRows state={state} ids={["A-route", "A-check-1", "A-check-2"]} />
          <p className="footer-note">The confirmed official route and two distinct unblocked 404 observations are required. It does not imply savings or eligibility.</p>
        </section>}
        {(state.scope?.canViewPortfolio || state.scope?.hotelId === "hotel-b") && <section className="card">
          <div className="card-kicker">Hotel B · review-indicated need</div><h2 style={{ marginTop: 6 }}>Suggested carpentry needs confirmation.</h2>
          <EvidenceRows state={state} ids={["B-review-1", "B-review-2"]} />
          <div className="notice" style={{ marginTop: 12 }}>Reviews cannot establish affordability. Hotel B's contribution is a separate fictional representative declaration.</div>
        </section>}
      </div>
    </>
  );
}

function EvidenceRows({ state, ids }: { state: DemoState; ids: string[] }) {
  return (
    <div className="list" style={{ marginTop: 12 }}>
      {ids.map((id) => {
        const evidence = state.fixture.evidence.find((item: any) => item.id === id);
        if (!evidence) return <div className="evidence warn" key={id}><CircleAlert size={15} /><span>{id} · unavailable in this perspective</span></div>;
        const summary = evidence.type === "booking_path_observation"
          ? `${evidence.content.httpStatus} · ${evidence.content.url}`
          : evidence.content.text ?? evidence.content.url ?? evidence.content.scope ?? evidence.type;
        return <div className="evidence" key={id}><FileCheck2 size={15} /><span><b>{id}</b> · {summary} · <span className="muted">{evidence.locator}</span></span></div>;
      })}
    </div>
  );
}

function HotelCase({ state, busy, onAction }: { state: DemoState; busy: boolean; onAction: ActionRunner }) {
  const [checks, setChecks] = useState({ scope: false, timing: false, channelMix: false, costs: false });
  const [consultation, setConsultation] = useState("");
  const baseline = state.savings?.baselineMinor;
  const observed = state.savings?.observedMinor;
  const delta = state.savings?.candidateMinor;
  const savingsVerified = state.savings?.status === "verified";
  const reviewer = state.role === "innmetric" || state.role === "department";
  const canViewA = state.scope?.canViewPortfolio || (state.role === "hotel" && state.scope?.hotelId === "hotel-a");
  const canViewB = state.scope?.canViewPortfolio || (state.role === "hotel" && state.scope?.hotelId === "hotel-b");
  if (state.role === "provider") {
    return <><PageHead eyebrow="Assigned service work" title="Hotel case records are not part of your assignment." text="Review the assigned quote, delivery status and required next action in Programme support." /><div className="notice">Provider views do not expose discovery evidence, hotel contributions, allocation records or programme cash.</div></>;
  }
  return (
    <>
      <PageHead eyebrow="Versioned evidence and decisions" title="Hotel cases" text="Keep Hotel A's cost comparison separate from Hotel B's review-suggested need and representative declaration." />
      <div className="grid two">
        {canViewA && state.savings && <section className="card">
          <div className="card-title"><div><div className="card-kicker">Hotel A · distribution costs</div><h2 style={{ marginTop: 6 }}>Baseline versus observed</h2></div><span className={`pill ${savingsVerified ? "teal" : "amber"}`}>{savingsVerified ? "Jointly verified" : state.savings.status.replaceAll("_", " ")}</span></div>
          <div className="table-wrap"><table className="table"><thead><tr><th>Cost component</th><th>Baseline</th><th>Observed</th><th>Difference</th></tr></thead><tbody>
            {[
              ["Advertising", 100000, 90000],
              ["OTA commission", 300000, 200000],
              ["Direct booking/payment", 100000, 110000],
            ].map(([label, before, after]) => <tr key={label}><td>{label}</td><td className="num">{money(Number(before))}</td><td className="num">{money(Number(after))}</td><td className="num">{money(Number(before) - Number(after))}</td></tr>)}
            <tr><td><b>Calculated total</b></td><td className="num"><b>{money(baseline)}</b></td><td className="num"><b>{money(observed)}</b></td><td className="num"><b>{money(delta)}</b></td></tr>
          </tbody></table></div>
          <div className="source-note" style={{ marginTop: 12 }}>Computed from integer AED minor units. Candidate difference remains signed. This synthetic comparison is not audited or a proven causal outcome.</div>
          <div className="section-title"><h3>Required reviewer checks</h3><span className="small muted">Each role approves the same version</span></div>
          <div className="check-list">
            {([
              ["scope", "Comparable scope and cost categories"],
              ["timing", "Timing and other changes reviewed"],
              ["channelMix", "Channel mix reviewed"],
              ["costs", "Source costs and evidence reviewed"],
            ] as [keyof typeof checks, string][]).map(([key, label]) => (
              <label className="check-line" key={key}><input type="checkbox" checked={checks[key]} onChange={(e) => setChecks((old) => ({ ...old, [key]: e.target.checked }))} />{label}</label>
            ))}
          </div>
          <div className="data-row"><span className="data-label">InnMetric</span><b>{approvalFor(state.savings.approvals, "innmetric", state.savings.version, delta ?? -1) ? "Approved" : "Pending"}</b></div>
          <div className="data-row"><span className="data-label">Tourism Department</span><b>{approvalFor(state.savings.approvals, "department", state.savings.version, delta ?? -1) ? "Approved" : "Pending"}</b></div>
          <AppButton primary disabled={busy || !reviewer || !checks.scope || !checks.timing || !checks.channelMix || !checks.costs || delta === null || delta <= 0 || state.savings.status === "needs_evidence"} onClick={() => void onAction("savings.approve", { checks })}>
            Approve current comparison <Check size={14} />
          </AppButton>
          <p className="footer-note">Savings verification creates no cash. Missing/incomparable evidence blocks approval; negative differences remain visible but cannot be certified as positive savings.</p>
        </section>}

        {canViewB && state.need && state.support && <section className="card">
          <div className="card-title"><div><div className="card-kicker">Hotel B · service need</div><h2 style={{ marginTop: 6 }}>Review signal, then confirmation</h2></div><span className={`pill ${state.need.confirmed ? "teal" : "amber"}`}>{state.need.confirmed ? "Hotel confirmed" : "Suggested only"}</span></div>
          <EvidenceRows state={state} ids={["B-review-1", "B-review-2", "B-confirmation"]} />
          <div className="data-row"><span className="data-label">Suggested service</span><b>Carpentry</b></div>
          <div className="data-row"><span className="data-label">Hotel contribution declaration</span><b>{money(state.support.hotelContributionMinor)}</b></div>
          <div className="notice">The separate representative declaration is synthetic and cannot be inferred from the reviews.</div>
          <AppButton primary disabled={busy || state.role !== "hotel" || state.hotelId !== "hotel-b" || state.need.confirmed} onClick={() => void onAction("need.confirm")}>
            Confirm as Hotel B
          </AppButton>
          <div className="section-title"><h3>Consultation history</h3></div>
          {state.need.consultations.map((item: any) => <div className="evidence" key={item.id}><FileText size={14} /><span>{item.actorRole}: {item.note}</span></div>)}
          <label className="field-label" htmlFor="consultation-note">Add a consultation note or evidence request</label>
          <textarea id="consultation-note" className="text-area" maxLength={500} value={consultation} onChange={(e) => setConsultation(e.target.value)} placeholder="Record a reviewer question or request for more evidence." />
          <AppButton disabled={busy || !consultation.trim() || !["innmetric", "department", "hotel"].includes(state.role)} onClick={async () => { await onAction("consultation.add", { note: consultation, evidenceIds: [] }); setConsultation(""); }}>
            Record consultation
          </AppButton>
        </section>}
      </div>
      {state.scope?.canViewPortfolio && <section className="card" style={{ marginTop: 16 }}>
        <div className="card-title"><div><div className="card-kicker">Open evidence states</div><h2 style={{ marginTop: 6 }}>No discovery claim for Hotel C or D</h2></div></div>
        <div className="grid two">
          <div className="evidence"><CircleAlert size={15} /><span><b>Hotel C</b> has no discovery evidence. Its independent commercial inquiry is not proof of a defect or need.</span></div>
          <div className="evidence warn"><ShieldAlert size={15} /><span><b>Hotel D</b> remains unverified. The route is unconfirmed and the observation was bot-blocked; no affordability inference.</span></div>
        </div>
      </section>}
    </>
  );
}

function Support({ state, busy, onAction }: { state: DemoState; busy: boolean; onAction: ActionRunner }) {
  const [amount, setAmount] = useState(String((state.support?.requestedSubsidyMinor ?? 20000) / 100));
  const [quote, setQuote] = useState(String((state.support?.quoteMinor ?? 50000) / 100));
  const [scope, setScope] = useState(state.support?.quoteScope ?? "Repair wardrobe door and inspect affected fittings");
  const [deliveryNote, setDeliveryNote] = useState("Synthetic provider delivery recorded.");
  const [outcome, setOutcome] = useState<"completed" | "partial" | "rejected">("completed");
  const [remaining, setRemaining] = useState("");
  if (!state.support || !state.scope?.canViewSupport) {
    return <><PageHead eyebrow="Programme support" title="Assigned case only." text="This simulated perspective cannot inspect Hotel B provider work or another hotel's case." /><div className="notice">Switch to InnMetric, Tourism Department, Hotel B, or the assigned service provider perspective.</div></>;
  }
  const allocationReady = joint(state.support.allocation.approvals, state.support.allocation.version, state.support.requestedSubsidyMinor);
  const supportReady = joint(state.support.approvals, state.support.version, state.support.requestedSubsidyMinor);
  const allConfirmed = state.outcome?.status === "verified";
  return (
    <>
      <PageHead eyebrow="Hotel B · programme support" title="Confirm the need. Fund the work." text="Provider quote, Hotel B contribution, allocation authority, joint approvals, department funding, delivery and outcome confirmation are separate events." />
      {state.role !== "provider" && <div className="notice">Cross-hotel support remains attributed to Hotel A and requires joint InnMetric/department authorization. Hotel A acknowledgement is not a gate.</div>}
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-kicker">Confirmed case and quote</div><h2 style={{ marginTop: 6 }}>Carpentry · provider quote {money(state.support.quoteMinor)}</h2>
          <div className="data-row"><span className="data-label">Quote scope</span><b>{state.support.quoteScope}</b></div>
          <div className="data-row"><span className="data-label">Hotel B need</span><b>{state.need.confirmed ? "Confirmed separately" : "Awaiting hotel confirmation"}</b></div>
          {state.role !== "provider" && <div className="data-row"><span className="data-label">Hotel direct contribution</span><b>{money(state.support.hotelContributionMinor)} · outside pool</b></div>}
          {state.role !== "provider" && <div className="data-row"><span className="data-label">Requested support</span><b>{money(state.support.requestedSubsidyMinor)}</b></div>}
          {state.role === "provider" && <div className="data-row"><span className="data-label">Funding amount</span><b>Not shared with provider</b></div>}
          <div className="data-row"><span className="data-label">Support version</span><b>v{state.support.version} · {state.support.status}</b></div>
          {state.role === "provider" && (
            <div className="edit-panel">
              <div className="field"><label htmlFor="quote-amount">Quote · AED</label><input className="input" id="quote-amount" type="number" min="0.01" step="0.01" value={quote} onChange={(e) => setQuote(e.target.value)} /></div>
              <label className="field-label" htmlFor="quote-scope">Scope</label><input className="text-input" id="quote-scope" value={scope} onChange={(e) => setScope(e.target.value)} />
              <AppButton disabled={busy || state.support.status === "reserved" || state.support.status === "paid"} onClick={() => void onAction("quote.submit", { amountMinor: Math.round(Number(quote) * 100), scope })}>Submit revised provider quote</AppButton>
            </div>
          )}
          {state.role === "innmetric" && (
            <div className="edit-panel">
              <div className="field"><label htmlFor="support-amount">Support request · AED</label><input className="input" id="support-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
              <AppButton disabled={busy || state.support.status === "reserved" || state.support.status === "paid"} onClick={() => void onAction("support.edit", { requestedSubsidyMinor: Math.round(Number(amount) * 100) })}>Save new case version</AppButton>
              <p className="small muted">Changing amount or funding source creates a new version and clears prior approvals. Funded versions are locked.</p>
            </div>
          )}
          {state.role !== "provider" && <>
            <div className="section-title"><h3>Hotel B direct payment</h3><span className="pill neutral">Separate from department cash</span></div>
            <AppButton disabled={busy || state.role !== "hotel" || state.hotelId !== "hotel-b" || state.directPayments.length > 0} onClick={() => void onAction("support.directPayment")}>
              Record Hotel B contribution {money(state.support.hotelContributionMinor)}
            </AppButton>
            <p className="footer-note">{state.directPayments.length ? "Hotel contribution recorded; department cash is unchanged." : "Only the Hotel B representative can record this separate simulated contribution."}</p>
          </>}
        </section>
        {state.role !== "provider" && <section className="card">
          <div className="card-kicker">Joint cross-hotel allocation</div><h2 style={{ marginTop: 6 }}>Hotel A attributable funds → Hotel B</h2>
          <div className="data-row"><span className="data-label">Source account</span><b>{state.support.allocation.sourceAccountId}</b></div>
          <div className="data-row"><span className="data-label">Attribution</span><b>Hotel A</b></div>
          <div className="data-row"><span className="data-label">Beneficiary</span><b>Hotel B</b></div>
          <div className="data-row"><span className="data-label">Hotel A acknowledgement</span><b>Not required</b></div>
          <div className="data-row"><span className="data-label">InnMetric reviewer</span><b>{approvalFor(state.support.allocation.approvals, "innmetric", state.support.allocation.version, state.support.requestedSubsidyMinor) ? "Approved" : "Pending"}</b></div>
          <div className="data-row"><span className="data-label">Department reviewer</span><b>{approvalFor(state.support.allocation.approvals, "department", state.support.allocation.version, state.support.requestedSubsidyMinor) ? "Approved" : "Pending"}</b></div>
          <AppButton disabled={busy || !["innmetric", "department"].includes(state.role) || !state.need.confirmed} onClick={() => void onAction("allocation.approve")}>Approve allocation {money(state.support.requestedSubsidyMinor)}</AppButton>
          <div className="rule" />
          <div className="card-kicker">Independent support approval · version {state.support.version}</div>
          {(["innmetric", "department"] as const).map((role) => <div className="data-row" key={role}><span className="data-label">{ROLE_LABELS[role]}</span><b>{approvalFor(state.support.approvals, role, state.support.version, state.support.requestedSubsidyMinor) ? "Approved" : "Pending"}</b></div>)}
          <AppButton primary disabled={busy || !["innmetric", "department"].includes(state.role) || !state.need.confirmed || state.support.status === "reserved" || state.support.status === "paid"} onClick={() => void onAction("support.approve")}>Approve support request</AppButton>
          <p className="footer-note">{allocationReady && supportReady ? "Both independent approval gates are complete. The department still has to reserve and pay." : "A missing reviewer blocks reservation; approvals are tied to the current version."}</p>
        </section>}
      </div>
      <div className="section-title"><h2>Provider delivery and outcome</h2><span className={`pill ${allConfirmed ? "teal" : "amber"}`}>{state.outcome.status.replaceAll("_", " ")}</span></div>
      <div className="grid two">
        <section className="card">
          <div className="card-kicker">Provider delivery</div><h3 style={{ marginTop: 7 }}>Delivery is not verification</h3>
          <div className="data-row"><span className="data-label">Delivery</span><b>{state.delivery.status.replaceAll("_", " ")}</b></div>
          {state.role === "provider" && <><label className="field-label" htmlFor="delivery-note">Delivery note</label><textarea className="text-area" id="delivery-note" maxLength={500} value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} /></>}
          <AppButton disabled={busy || state.role !== "provider" || state.support.status !== "paid"} onClick={() => void onAction("delivery.mark", { note: deliveryNote })}>Record provider delivery</AppButton>
          <p className="footer-note">Provider delivery remains a submission. Tourism Department, Hotel B and InnMetric each review the outcome separately.</p>
        </section>
        <section className="card">
          <div className="card-kicker">Three-party outcome confirmation</div><h3 style={{ marginTop: 7 }}>Every confirmation is required</h3>
          {(["department", "hotel", "innmetric"] as const).map((role) => {
            const confirmation = state.outcome.confirmations.find((item: any) => item.role === role);
            return <div className="data-row" key={role}><span className="data-label">{ROLE_LABELS[role]}</span><b>{confirmation ? `${confirmation.result} · recorded` : "Unresolved"}</b></div>;
          })}
          <div className="field"><label htmlFor="outcome-result">Result</label><select className="input" id="outcome-result" value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)}><option value="completed">Completed</option><option value="partial">Partial</option><option value="rejected">Rejected</option></select></div>
          {outcome !== "completed" && <><label className="field-label" htmlFor="remaining-actions">Remaining actions</label><textarea className="text-area" id="remaining-actions" maxLength={250} value={remaining} onChange={(e) => setRemaining(e.target.value)} placeholder="Required for partial or rejected work." /></>}
          <AppButton primary disabled={busy || !["department", "hotel", "innmetric"].includes(state.role) || state.delivery.status !== "delivered" || state.outcome.confirmations.some((item: any) => item.role === state.role) || (outcome !== "completed" && !remaining.trim())} onClick={() => void onAction("outcome.confirm", { result: outcome, remainingActions: outcome === "completed" ? [] : [remaining.trim()] })}>
            Confirm outcome as {ROLE_LABELS[state.role]}
          </AppButton>
          {state.outcome.remainingActions.length > 0 && <div className="unresolved">Remaining actions: {state.outcome.remainingActions.join("; ")}</div>}
          {state.outcome.status === "verified" && <div className="notice teal" style={{ marginTop: 10 }}>All three parties confirmed completion for the current delivery version.</div>}
        </section>
      </div>
    </>
  );
}

function Funds({ state, balances, busy, onAction }: { state: DemoState; balances: ReturnType<typeof calculateBalances>; busy: boolean; onAction: ActionRunner }) {
  const [amount, setAmount] = useState(String((state.collection?.amountMinor ?? 100000) / 100));
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionId, setCorrectionId] = useState("");
  if (!state.scope?.canViewFinance || !state.collection) {
    return <><PageHead eyebrow="Department funds" title="Restricted financial view." text="Only InnMetric and Tourism Department can review the synthetic pool ledger. Hotel and provider perspectives cannot inspect department cash." /><div className="notice">Use the Tourism Department perspective to post a simulated receipt, reservation or payment.</div></>;
  }
  const collectionReady = joint(state.collection.approvals, state.collection.version, state.collection.amountMinor);
  return (
    <>
      <PageHead eyebrow="Department-administered simulated ledger" title="Only collected cash can move." text="Savings, explicit collection approval, receipt, reservation, payment and correction records are separate events." />
      <div className="grid three">
        <div className="card"><div className="card-kicker">Cash</div><div className="metric num">{money(balances.cash)}</div><div className="metric-sub">Receipts less posted programme payments</div></div>
        <div className="card"><div className="card-kicker">Reserved</div><div className="metric num">{money(balances.reserved)}</div><div className="metric-sub">Active approved commitments</div></div>
        <div className="card"><div className="card-kicker">Available</div><div className="metric num">{money(balances.available)}</div><div className="metric-sub">Cash less active reservations</div></div>
      </div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-title"><div><div className="card-kicker">Hotel A attribution · explicit amount</div><h2 style={{ marginTop: 6 }}>Collection approval is separate</h2></div><span className={`pill ${state.collection.posted ? "teal" : "amber"}`}>{state.collection.posted ? "Receipt posted" : "Awaiting receipt"}</span></div>
          <p className="small muted">No percentage is configured. This is a manually specified illustrative amount, not a rate calculation.</p>
          <div className="field"><label htmlFor="collection-amount">Amount · AED</label><input id="collection-amount" className="input" type="number" min="0.01" step="0.01" value={amount} disabled={state.collection.posted || state.role !== "department"} onChange={(e) => setAmount(e.target.value)} /></div>
          {!state.collection.posted && state.role === "department" && <AppButton disabled={busy || Number(amount) <= 0 || Math.round(Number(amount) * 100) === state.collection.amountMinor} onClick={() => void onAction("collection.set", { amountMinor: Math.round(Number(amount) * 100) })}>Save amount and renew approvals</AppButton>}
          <div className="data-row"><span className="data-label">Current approved version</span><b>v{state.collection.version} · {money(state.collection.amountMinor)}</b></div>
          {(["innmetric", "department"] as const).map((role) => <div className="data-row" key={role}><span className="data-label">{ROLE_LABELS[role]}</span><b>{approvalFor(state.collection.approvals, role, state.collection.version, state.collection.amountMinor) ? "Approved" : "Pending"}</b></div>)}
          <div className="btn-row">
            <AppButton disabled={busy || !["innmetric", "department"].includes(state.role) || state.collection.posted} onClick={() => void onAction("collection.approve")}>Approve {money(state.collection.amountMinor)}</AppButton>
            <AppButton primary disabled={busy || state.role !== "department" || !collectionReady || state.collection.posted} onClick={() => void onAction("collection.post")}>Post simulated receipt <ArrowDownRight size={14} /></AppButton>
          </div>
          <div className="notice red" style={{ marginTop: 12 }}>Joint approval does not create cash. Only the department can post the receipt after current savings and collection approvals.</div>
        </section>
        <section className="card">
          <div className="card-kicker">Department budget proposal</div><h2 style={{ marginTop: 6 }}>Not authorized. Not spendable.</h2>
          <div className="metric num" style={{ fontSize: 23 }}>{money(50000)}</div>
          <p className="small muted">Synthetic fixture proposal only. It is neither an allocated budget nor a collected receipt.</p>
          <div className="notice">Department may reserve only collected and attributed funds after the separate allocation and support gates pass.</div>
          <div className="data-row"><span className="data-label">Hotel A attributed balance</span><b>{money(balances.attributable)}</b></div>
          <div className="data-row"><span className="data-label">Reservation</span><b>{state.reservations.at(-1)?.status ?? "None"}</b></div>
        </section>
      </div>
      <div className="section-title"><h2>Hotel B · AED 200 support</h2><span className="pill neutral">{state.support.status}</span></div>
      <div className="grid two">
        <section className="card">
          <div className="data-row"><span className="data-label">Need confirmed</span><b>{state.need.confirmed ? "Yes" : "No"}</b></div>
          <div className="data-row"><span className="data-label">Joint allocation approval</span><b>{joint(state.support.allocation.approvals, state.support.allocation.version, state.support.requestedSubsidyMinor) ? "Yes" : "No"}</b></div>
          <div className="data-row"><span className="data-label">Joint support approval</span><b>{joint(state.support.approvals, state.support.version, state.support.requestedSubsidyMinor) ? "Yes" : "No"}</b></div>
          <div className="data-row"><span className="data-label">Collected cash exists</span><b>{state.collection.posted ? "Yes" : "No"}</b></div>
          <div className="btn-row">
            <AppButton primary disabled={busy || state.role !== "department" || state.support.status === "reserved" || state.support.status === "paid"} onClick={() => void onAction("support.reserve")}>Reserve {money(state.support.requestedSubsidyMinor)} <Banknote size={14} /></AppButton>
            <AppButton primary disabled={busy || state.role !== "department" || state.support.status !== "reserved"} onClick={() => void onAction("support.pay", {}, `support-payment-${state.support.id}-v${state.support.version}`)}>Post department payment <Landmark size={14} /></AppButton>
          </div>
          <div className="rule" />
          <div className="card-kicker">Hotel B direct payment</div>
          <div className="data-row"><span className="data-label">Outside department cash</span><b>{state.directPayments.length ? "Recorded" : money(state.support.hotelContributionMinor)}</b></div>
          <AppButton disabled={busy || state.role !== "hotel" || state.hotelId !== "hotel-b" || state.directPayments.length > 0} onClick={() => void onAction("support.directPayment")}>Record direct payment as Hotel B</AppButton>
        </section>
        <section className="card">
          <div className="card-kicker">Append-only programme ledger</div>
          {state.ledger.length === 0 ? <p className="small muted">No posted receipts or outgoing payments.</p> : state.ledger.map((entry: any) => (
            <div className="ledger-item" key={entry.id}>
              <span className="ledger-icon">{entry.direction === "in" ? <ArrowDownRight size={15} /> : <Landmark size={15} />}</span>
              <span>{entry.kind.replaceAll("_", " ")} · source {entry.sourceAccountId} · Hotel A attribution → {entry.beneficiaryHotelId ?? "pool"}</span>
              <b className="num">{entry.direction === "in" ? "+" : "−"} {money(entry.amountMinor)}</b>
            </div>
          ))}
          {state.directPayments.map((entry: any) => <div className="ledger-item" key={entry.id}><span className="ledger-icon"><Building2 size={15} /></span><span>Hotel B direct payment · excluded from department pool</span><b>{money(entry.amountMinor)}</b></div>)}
          <div className="data-row"><span className="data-label">Correction records</span><b>{state.corrections.length}</b></div>
          {state.ledger.map((entry: any) => <button className="link-button" key={`correction-${entry.id}`} onClick={() => setCorrectionId(entry.id)}>Request linked correction for {entry.kind.replaceAll("_", " ")}</button>)}
          {correctionId && <div className="edit-panel">
            <label className="field-label" htmlFor="correction-reason">Correction reason</label>
            <input className="text-input" id="correction-reason" maxLength={500} value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} />
            <div className="small muted">Correction request links to the original entry and has no immediate cash effect.</div>
            <AppButton disabled={busy || state.role !== "department" || !correctionReason.trim()} onClick={() => { void onAction("ledger.correctionRequest", { originalEntryId: correctionId, proposedAmountMinor: state.ledger.find((item: any) => item.id === correctionId)?.amountMinor, reason: correctionReason }); setCorrectionId(""); setCorrectionReason(""); }}>Append correction request</AppButton>
          </div>}
        </section>
      </div>
    </>
  );
}

function Services({ state, busy, onAction }: { state: DemoState; busy: boolean; onAction: ActionRunner }) {
  const isHotelC = state.role === "hotel" && state.hotelId === "hotel-c";
  const isOperator = state.role === "innmetric";
  if (!isHotelC && !isOperator) {
    return <><PageHead eyebrow="InnMetric commercial services" title="Restricted commercial view." text="Hotel C and InnMetric have access to this synthetic commercial lane; other hotel/provider perspectives do not." /><div className="notice">Commercial proposals remain separate from programme funds.</div></>;
  }
  const proposals = state.commercial.proposals;
  return (
    <>
      <PageHead eyebrow="Independent InnMetric commercial services" title="Outside the programme pool." text="Subscription and on-demand proposals are separate commercial records. They do not create a programme withdrawal or a zero-price operation." />
      <div className="notice teal">Hotel C has no discovery evidence. A commercial inquiry is not a discovery finding, service need or affordability judgment.</div>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card">
          <div className="card-title"><div><div className="card-kicker">Hotel C · independent inquiry</div><h2 style={{ marginTop: 6 }}>Commercial conversation</h2></div><span className="pill neutral">Not discovery</span></div>
          <div className="data-row"><span className="data-label">Programme fund access</span><b>No</b></div>
          <div className="data-row"><span className="data-label">Subscription price</span><b>Not configured</b></div>
          <div className="data-row"><span className="data-label">On-demand rate</span><b>Not configured</b></div>
          <div className="data-row"><span className="data-label">Free tier</span><b>Not configured</b></div>
          {isHotelC && <div className="btn-row">
            <AppButton disabled={busy} onClick={() => void onAction("commercial.request", { type: "subscription" })}>Request subscription</AppButton>
            <AppButton disabled={busy} onClick={() => void onAction("commercial.request", { type: "on_demand" })}>Request on-demand service</AppButton>
          </div>}
          {isOperator && <div className="btn-row">
            <AppButton primary disabled={busy} onClick={() => void onAction("commercial.propose", { type: "subscription", hotelId: "hotel-c" })}>Draft subscription proposal</AppButton>
            <AppButton disabled={busy} onClick={() => void onAction("commercial.propose", { type: "on_demand", hotelId: "hotel-c" })}>Draft on-demand proposal</AppButton>
          </div>}
          {!isHotelC && !isOperator && <p className="small muted">Switch to the Hotel C or InnMetric perspective to record a separate commercial request or draft proposal.</p>}
        </section>
        <section className="card">
          <div className="card-kicker">Separate commercial records</div><h2 style={{ marginTop: 6 }}>Proposals and invoice drafts</h2>
          {proposals.length === 0 ? <p className="small muted">No proposal recorded.</p> : proposals.map((proposal: any) => (
            <div className="evidence" key={proposal.id} style={{ marginTop: 8 }}>
              <FileText size={15} /><span><b>{proposal.type === "on_demand" ? "On-demand" : "Subscription"}</b> · Hotel C · {proposal.status} · price {money(proposal.priceMinor)} · separate commercial book</span>
              {isOperator && <AppButton disabled={busy} onClick={() => void onAction("commercial.invoiceDraft", { proposalId: proposal.id })}>Invoice draft</AppButton>}
            </div>
          ))}
          {state.commercial.invoices.map((invoice: any) => <div className="data-row" key={invoice.id}><span className="data-label">Invoice record · {invoice.status.replaceAll("_", " ")}</span><b>{money(invoice.amountMinor)}</b></div>)}
          <div className="notice" style={{ marginTop: 12 }}>An invoice draft is recorded with a null amount and blocked status while pricing is unset. No checkout or programme-ledger entry is created.</div>
        </section>
      </div>
    </>
  );
}

function Guide({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const steps: [Page, string, string][] = [
    ["discovery", "1 · Discover", "Show Hotel A's two referenced failures and the uncertain candidates."],
    ["case", "2 · Review", "Confirm Hotel B's service need separately and review the cost comparison."],
    ["support", "3 · Approve", "Record distinct reviewer decisions for support and cross-hotel allocation."],
    ["funds", "4 · Fund", "Approve an explicit collection amount, post the receipt, reserve and pay as the department."],
    ["support", "5 · Verify", "Separate provider delivery from three-party outcome confirmation."],
    ["services", "6 · Commercial", "Show proposals and invoice drafts outside programme funds, with prices unconfigured."],
  ];
  return (
    <>
      <PageHead eyebrow="Presenter guide · about three minutes" title="Tell the story in sequence." text="This is a proposed synthetic workflow. Distinguish calculated fixture values from simulated evidence and transactions." />
      <div className="guide-layout"><section className="card"><h2>Six beats, one persistent session</h2>
        {steps.map(([page, title, detail]) => <div className="guide-step" key={title}><div className="guide-number">{title.slice(0, 1)}</div><div><strong>{title.slice(4)}</strong><p>{detail}</p></div><AppButton onClick={() => onNavigate(page)}>Open</AppButton></div>)}
      </section>
      <section className="card"><div className="card-kicker">What the demo does not establish</div><h3 style={{ marginTop: 8 }}>No endorsement or real funds</h3>
        <div className="list">
          <div className="evidence"><Check size={15} /><span>Real deterministic arithmetic over supplied synthetic cost records.</span></div>
          <div className="evidence warn"><ShieldAlert size={15} /><span>Role switcher is simulated, not production authentication.</span></div>
          <div className="evidence warn"><CircleAlert size={15} /><span>No live discovery, government affiliation, real payment, or hotel access.</span></div>
          <div className="evidence"><FileText size={15} /><span>Unset rates and prices display “Not configured”; no automatic zero-price action.</span></div>
        </div>
      </section></div>
    </>
  );
}

function joint(list: any[], version: number, amount: number) {
  return approvalFor(list, "innmetric", version, amount) && approvalFor(list, "department", version, amount);
}

export default App;
