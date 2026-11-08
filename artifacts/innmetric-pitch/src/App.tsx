import { useEffect, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, Banknote, BookOpen, BriefcaseBusiness,
  Building2, Check, CheckCheck, CircleAlert, CircleHelp, Clock3, Compass,
  FileCheck2, FileText, HandCoins, Landmark, Layers3, RotateCcw, ShieldAlert,
  Sparkles, Wallet, Waypoints,
} from 'lucide-react';

type Role = 'InnMetric' | 'Tourism Department' | 'Hotel B' | 'Provider';
type View = 'overview' | 'discovery' | 'case' | 'support' | 'funds' | 'services' | 'guide';
type Approval = { role: 'InnMetric' | 'Tourism Department'; amount: number; version: number }[];
type DemoState = {
  role: Role; view: View; journey: boolean; journeyStep: number;
  savingsApprovals: Approval; collectionAmountMinor: number; collectionVersion: number; collectionApprovals: Approval; receiptPosted: boolean;
  bSuggestionConfirmed: boolean; bAffordability: boolean; bDirectPaid: boolean;
  allocationApprovals: Approval; supportApprovals: Approval; reserved: boolean; paymentPosted: boolean;
  providerDelivered: boolean; confirmations: Role[]; proposal: 'subscription' | 'on-demand' | '';
};

const STORAGE_KEY = 'innmetric-pitch-demo-v2';
const INITIAL: DemoState = {
  role: 'InnMetric', view: 'overview', journey: false, journeyStep: 0,
  savingsApprovals: [], collectionAmountMinor: 100000, collectionVersion: 1, collectionApprovals: [], receiptPosted: false,
  bSuggestionConfirmed: false, bAffordability: true, bDirectPaid: false,
  allocationApprovals: [], supportApprovals: [], reserved: false, paymentPosted: false,
  providerDelivered: false, confirmations: [], proposal: '',
};
const roles: Role[] = ['InnMetric', 'Tourism Department', 'Hotel B', 'Provider'];
const routeNames: Record<View, string> = {
  overview: 'Programme overview', discovery: 'Discovery queue', case: 'Hotel case',
  support: 'Programme support', funds: 'Department funds', services: 'InnMetric services', guide: 'Presenter guide',
};
const guideSteps: { title: string; view: View; role: Role; detail: string }[] = [
  { title: 'A · Discovery evidence', view: 'discovery', role: 'InnMetric', detail: 'Trace A-route and the two matching synthetic 404 checks. This is a candidate failure—not a funding decision.' },
  { title: 'B · Need, then confirmation', view: 'discovery', role: 'InnMetric', detail: 'Review B’s referenced evidence suggesting carpentry, then switch to Hotel B to confirm it separately.' },
  { title: 'A · Savings calculation', view: 'case', role: 'InnMetric', detail: 'Review the calculated cost comparison and approve it separately as InnMetric and the department. This creates no cash.' },
  { title: 'A · Separate collection receipt', view: 'funds', role: 'Tourism Department', detail: 'Jointly approve the explicit AED 1,000 collection amount, then post the simulated receipt as the department.' },
  { title: 'B · Cross-hotel allocation', view: 'support', role: 'InnMetric', detail: 'Jointly approve allocation from A-attributable funds to B. Hotel A acknowledgement is not required.' },
  { title: 'B · Reserve and pay', view: 'funds', role: 'Tourism Department', detail: 'Jointly approve support. Department reserves AED 200, then posts one idempotent payment.' },
  { title: 'Delivery · Three confirmations', view: 'support', role: 'Provider', detail: 'Provider marks delivered. Department, Hotel B and InnMetric each confirm outcomes.' },
  { title: 'C · Separate commercial proposal', view: 'services', role: 'InnMetric', detail: 'Create a draft proposal outside discovery and outside programme cash.' },
  { title: 'D · Leave uncertain', view: 'discovery', role: 'InnMetric', detail: 'D stays unverified: route unconfirmed and observation bot-blocked. No inference of need or affordability.' },
];

function loadState(): DemoState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...INITIAL, ...JSON.parse(stored) } as DemoState;
  } catch { /* use clean fixture if local storage is unavailable */ }
  return { ...INITIAL };
}
const moneyMinor = (value: number) => `AED ${(value / 100).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const approved = (list: Approval, role: Role, amount: number, version = 1) =>
  list.some((item) => item.role === role && item.amount === amount && item.version === version);
const SUPPORT_MINOR = 20000;

function App() {
  const [state, setState] = useState<DemoState>(loadState);
  const [message, setMessage] = useState('');
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { setMessage('Local storage is unavailable; this session may not survive refresh.'); }
  }, [state]);
  const update = (patch: Partial<DemoState>) => setState((old) => ({ ...old, ...patch }));
  const notify = (text: string) => setMessage(text);
  const reset = () => {
    if (window.confirm('Reset the presentation to its initial synthetic fixture? This clears locally saved demo progress.')) {
      setState({ ...INITIAL });
      try {
        localStorage.removeItem(STORAGE_KEY);
        setMessage('Demo reset to the initial fixture.');
      } catch {
        setMessage('Demo reset in this session, but browser storage could not be cleared.');
      }
    }
  };
  const go = (view: View) => { update({ view }); setMessage(''); };
  const switchRole = (role: Role) => { update({ role }); setMessage(`Role switched to ${role}. This is a simulation, not authorization.`); };
  const addApproval = (key: 'savingsApprovals' | 'collectionApprovals' | 'allocationApprovals' | 'supportApprovals', amount: number) => {
    if (state.role !== 'InnMetric' && state.role !== 'Tourism Department') {
      notify('Blocked: this simulated approval is available only to InnMetric or Tourism Department. Client checks are not server-enforced authorization.'); return;
    }
    const version = key === 'collectionApprovals' ? state.collectionVersion : 1;
    const current = state[key].filter((approval) => approval.version === version && approval.amount === amount);
    if (approved(current, state.role, amount, version)) { notify(`${state.role} has already approved this version.`); return; }
    update({ [key]: [...current, { role: state.role, amount, version }] });
    notify(`${state.role} approval recorded for the current ${moneyMinor(amount)} version.`);
  };
  const postReceipt = () => {
    if (state.role !== 'Tourism Department') { notify('Blocked: only the Tourism Department role can post the simulated receipt.'); return; }
    if (!approved(state.savingsApprovals, 'InnMetric', 100000) || !approved(state.savingsApprovals, 'Tourism Department', 100000)) {
      notify('Blocked: Hotel A savings must first be verified by distinct InnMetric and department reviewers. Savings approval is not cash.'); return;
    }
    if (state.collectionAmountMinor <= 0) { notify('Blocked: collection amount must be greater than zero.'); return; }
    if (!approved(state.collectionApprovals, 'InnMetric', state.collectionAmountMinor, state.collectionVersion) || !approved(state.collectionApprovals, 'Tourism Department', state.collectionAmountMinor, state.collectionVersion)) {
      notify('Blocked: the current collection amount needs distinct InnMetric and Tourism Department approvals.'); return;
    }
    if (state.receiptPosted) { notify('Receipt already posted. Replay blocked; programme cash is unchanged.'); return; }
    update({ receiptPosted: true }); notify(`${moneyMinor(state.collectionAmountMinor)} simulated receipt posted once.`);
  };
  const reserve = () => {
    if (state.role !== 'Tourism Department') { notify('Blocked: only the department can reserve programme funds.'); return; }
    if (!state.receiptPosted) { notify('Blocked: no collected programme cash. The proposed budget is not spendable.'); return; }
    if (!state.bSuggestionConfirmed) { notify('Blocked: Hotel B representative must separately confirm the suggested carpentry need.'); return; }
    if (state.allocationApprovals.length < 2 || !approved(state.allocationApprovals, 'InnMetric', SUPPORT_MINOR) || !approved(state.allocationApprovals, 'Tourism Department', SUPPORT_MINOR)) { notify('Blocked: the AED 200 cross-hotel allocation needs separate InnMetric and department approvals.'); return; }
    if (state.supportApprovals.length < 2 || !approved(state.supportApprovals, 'InnMetric', SUPPORT_MINOR) || !approved(state.supportApprovals, 'Tourism Department', SUPPORT_MINOR)) { notify('Blocked: support needs its own distinct InnMetric and department approvals.'); return; }
    if (state.reserved || state.paymentPosted) { notify('Reservation already exists or has been settled. No additional reservation was created.'); return; }
    if (available < SUPPORT_MINOR) { notify(`Blocked: only ${moneyMinor(available)} is available; the AED 200 request cannot be reserved.`); return; }
    update({ reserved: true }); notify('AED 200 reserved. Cash remains AED 1,000; reserved AED 200; available AED 800.');
  };
  const pay = () => {
    if (state.role !== 'Tourism Department') { notify('Blocked: only the department may post a simulated programme payment. InnMetric cannot pay from the pool.'); return; }
    if (state.paymentPosted) { notify('Payment already posted. Replay blocked; balances are unchanged.'); return; }
    if (!state.reserved) { notify('Blocked: reserve approved programme cash before payment.'); return; }
    update({ paymentPosted: true, reserved: false }); notify('One department payment posted. Reservation released atomically; cash AED 800, reserved AED 0, available AED 800.');
  };
  const confirmOutcome = () => {
    if (!state.providerDelivered) { notify('Blocked: provider delivery must be marked separately before outcome confirmation.'); return; }
    if (!['Tourism Department', 'Hotel B', 'InnMetric'].includes(state.role)) { notify('Blocked: outcome confirmation is for department, Hotel B, and InnMetric.'); return; }
    if (state.confirmations.includes(state.role)) { notify(`${state.role} has already confirmed this outcome.`); return; }
    update({ confirmations: [...state.confirmations, state.role] }); notify(`${state.role} outcome confirmation recorded.`);
  };
  const journeyStart = () => update({ journey: true, journeyStep: 0, view: 'discovery' });
  const journeyMove = (delta: number) => {
    if (delta > 0 && state.journeyStep === guideSteps.length - 1) { update({ journey: false }); return; }
    const next = Math.max(0, Math.min(guideSteps.length - 1, state.journeyStep + delta));
    update({ journeyStep: next, view: guideSteps[next].view });
  };

  const nav = [
    { id: 'overview' as View, label: 'Programme overview', icon: Layers3 },
    { id: 'discovery' as View, label: 'Discovery queue', icon: Compass },
    { id: 'case' as View, label: 'Hotel case', icon: Building2 },
    { id: 'support' as View, label: 'Programme support', icon: HandCoins },
    { id: 'funds' as View, label: 'Department funds', icon: Wallet },
    { id: 'services' as View, label: 'InnMetric services', icon: BriefcaseBusiness },
    { id: 'guide' as View, label: 'Presenter guide', icon: BookOpen },
  ];
  const cash = state.receiptPosted ? state.collectionAmountMinor - (state.paymentPosted ? SUPPORT_MINOR : 0) : 0;
  const reservedAmount = state.reserved ? SUPPORT_MINOR : 0;
  const available = cash - reservedAmount;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">i</div><div><div className="brand-name">innmetric</div><div className="brand-sub">programme workspace</div></div></div>
      <div><div className="nav-label" style={{ padding: '0 10px 8px' }}>Workspace</div><nav className="nav-list" aria-label="Main navigation">
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${state.view === id ? 'active' : ''}`} onClick={() => go(id)} data-testid={`nav-${id}`} aria-current={state.view === id ? 'page' : undefined}><Icon /><span>{label}</span></button>)}
      </nav></div>
      <div className="sidebar-bottom">
        <div className="role-box"><label htmlFor="role-picker">Simulated role</label><select id="role-picker" className="role-select" value={state.role} onChange={(event) => switchRole(event.target.value as Role)} data-testid="select-role">{roles.map((role) => <option key={role}>{role}</option>)}</select><div className="role-caption">Role changes are deliberate. Client checks are not server authorization.</div></div>
        <button className="reset-button" onClick={reset} data-testid="button-reset-demo"><RotateCcw size={14} /> Reset demo</button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="crumb"><span>InnMetric</span><ArrowRight size={12} /><strong style={{ color: '#36332e' }}>{routeNames[state.view]}</strong></div>
        <div className="top-status"><span className="pill amber">Synthetic data</span><span className="pill teal">Interactive prototype</span><span className="pill neutral">Simulated roles &amp; payments</span></div>
        <div className="mobile-actions">
          <label htmlFor="mobile-role-picker">Simulated role</label>
          <select id="mobile-role-picker" className="role-select" value={state.role} onChange={(event) => switchRole(event.target.value as Role)} data-testid="select-role-mobile">{roles.map((role) => <option key={role}>{role}</option>)}</select>
          <button className="reset-button mobile-reset" onClick={reset} data-testid="button-reset-demo-mobile"><RotateCcw size={13} /> Reset</button>
        </div>
      </header>
      <div className="page">
        {message && <div className={`notice ${message.startsWith('Blocked') ? 'red' : 'teal'}`} role="status" data-testid="status-feedback" style={{ marginBottom: 18 }}>{message}</div>}
        {state.journey && state.view !== 'guide' && <div className="journey-panel">
          <div><div className="eyebrow">Guided three-minute journey · {state.journeyStep + 1} of {guideSteps.length}</div><strong>{guideSteps[state.journeyStep].title}</strong><p>{guideSteps[state.journeyStep].detail} Suggested role: <b>{guideSteps[state.journeyStep].role}</b>. Switch roles explicitly in the navigation or mobile top bar.</p></div>
          <div className="btn-row"><button className="btn" onClick={() => journeyMove(-1)} disabled={state.journeyStep === 0} data-testid="button-journey-previous">Previous</button><button className="btn primary" onClick={() => journeyMove(1)} data-testid="button-journey-next">{state.journeyStep === guideSteps.length - 1 ? 'Finish' : 'Next step'} <ArrowRight size={14} /></button></div>
        </div>}
        {state.view === 'overview' && <Overview state={state} cash={cash} reserved={reservedAmount} available={available} onStart={journeyStart} onNavigate={go} />}
        {state.view === 'discovery' && <Discovery state={state} onNavigate={go} />}
        {state.view === 'case' && <HotelCase state={state} onApprove={addApproval} onNotify={notify} onUpdate={update} />}
        {state.view === 'support' && <Support state={state} onApprove={addApproval} onNotify={notify} onUpdate={update} onOutcome={confirmOutcome} />}
        {state.view === 'funds' && <Funds state={state} cash={cash} reserved={reservedAmount} available={available} onApprove={addApproval} onReceipt={postReceipt} onReserve={reserve} onPay={pay} onNotify={notify} onUpdate={update} />}
        {state.view === 'services' && <Services state={state} onUpdate={update} onNotify={notify} />}
        {state.view === 'guide' && <Guide state={state} onStart={journeyStart} onGo={go} onRole={switchRole} />}
        <footer className="footer-note">Client-only presentation simulation. No real funds, affiliation, discovery, AI, or payments. No government seal or official endorsement. Role guards are illustrative client checks only.</footer>
      </div>
    </main>
  </div>;
}

function Overview({ state, cash, reserved, available, onStart, onNavigate }: { state: DemoState; cash: number; reserved: number; available: number; onStart: () => void; onNavigate: (view: View) => void }) {
  return <>
    <div className="page-head"><div><div className="eyebrow">Tourism support programme · proposed model</div><h1>From observed need<br />to accountable work.</h1><p className="lead">A traceable path from discovery to provider delivery—while InnMetric's commercial services remain separate.</p></div><button className="btn primary" onClick={onStart} data-testid="button-start-journey"><Sparkles size={15} /> Start 3-minute journey</button></div>
    <div className="notice red" data-testid="status-simulation-boundary"><b>Prototype boundary.</b> Synthetic data · interactive prototype · simulated roles and payments. Client-only; role checks are not server authorization. No real funds, affiliation, discovery, AI, or payments.</div>
    <div className="step-strip" aria-label="Programme stages">{['Discover', 'Review', 'Approve', 'Fund', 'Deliver'].map((stage, index) => <span key={stage} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i className={`step-dot ${index < (state.paymentPosted ? 5 : state.receiptPosted ? 3 : 1) ? 'done' : ''}`} /><span className="small muted">{stage}</span>{index < 4 && <ArrowRight size={12} color="#a79e90" />}</span>)}</div>
    <div className="grid three">
      <div className="card"><div className="card-kicker">Discovery queue</div><div className="metric">4<span style={{ fontSize: 15, color: '#888174' }}> records</span></div><div className="metric-sub">A failed · B evidence referenced · C separate inquiry · D unverified</div><div className="rule" /><button className="btn" onClick={() => onNavigate('discovery')} data-testid="button-open-discovery">Review evidence <ArrowRight size={13} /></button></div>
      <div className="card"><div className="card-kicker">Programme cash · simulated</div><div className="metric num">{moneyMinor(cash)}</div><div className="metric-sub">Available {moneyMinor(available)} · reserved {moneyMinor(reserved)}</div><div className="rule" /><button className="btn" onClick={() => onNavigate('funds')} data-testid="button-open-funds">Open ledger <ArrowRight size={13} /></button></div>
      <div className="card"><div className="card-kicker">Separate InnMetric services</div><div className="metric" style={{ fontSize: 22 }}>Independent</div><div className="metric-sub">No programme-pool effect · pricing not configured</div><div className="rule" /><button className="btn" onClick={() => onNavigate('services')} data-testid="button-open-services">View service proposals <ArrowRight size={13} /></button></div>
    </div>
    <div className="section-title"><h2>One shared demo state</h2><span className="pill neutral">Saved on this device</span></div>
    <div className="grid two">
      <div className="card tight"><h3>Follow the evidence, not the assumption</h3><div className="list"><div className="evidence"><FileCheck2 /><span>A candidate needs official route + two matching synthetic 404 checks. Failure is not a funding trigger.</span></div><div className="evidence"><Waypoints /><span>B's suggested carpentry is not the same record as Hotel B confirmation or affordability.</span></div><div className="evidence warn"><CircleHelp /><span>C inquiry is commercial, not discovery. D stays uncertain.</span></div></div></div>
      <div className="card tight"><h3>Keep decisions and money distinct</h3><div className="data-row"><span className="data-label">A savings approval</span><b className="data-value">Verification only · no cash</b></div><div className="data-row"><span className="data-label">A collection</span><b className="data-value">{state.receiptPosted ? 'Posted once' : 'Awaiting joint approval'}</b></div><div className="data-row"><span className="data-label">B support request</span><b className="data-value">AED 200 · separate approval path</b></div></div>
    </div>
  </>;
}

function Discovery({ state, onNavigate }: { state: DemoState; onNavigate: (view: View) => void }) {
  const records = [
    { id: 'A', title: 'Hotel A · booking-path failure candidate', status: 'Candidate failure', tone: 'red', detail: 'Confirmed official route; two matching synthetic 404 responses. Candidate failure, never automatic funding.', action: 'Open Hotel A case', target: 'case' as View },
    { id: 'B', title: 'Hotel B · suggested carpentry', status: state.bSuggestionConfirmed ? 'Need separately confirmed' : 'Evidence suggests need', tone: 'amber', detail: 'B-review-1 and B-review-2 suggest carpentry. Separate from representative confirmation and fictional contribution declaration.', action: 'Open Hotel B case', target: 'case' as View },
    { id: 'C', title: 'Hotel C · commercial inquiry', status: 'Not discovery evidence', tone: 'neutral', detail: 'A separate commercial inquiry is not a discovery record. InnMetric services remain commercially independent.', action: 'View services', target: 'services' as View },
    { id: 'D', title: 'Hotel D · observation attempt', status: 'Unverified', tone: 'amber', detail: 'D-blocked and D-review: route is unconfirmed and observation was bot-blocked. Do not infer need or affordability.', action: 'Review presenter guide', target: 'guide' as View },
  ];
  return <>
    <div className="page-head"><div><div className="eyebrow">Evidence register · synthetic records</div><h1>Discovery queue</h1><p className="lead">Candidate signals are only a starting point. Evidence type, confidence and next decision remain explicit.</p></div><span className="pill amber">4 isolated records</span></div>
    <div className="notice">Discovery is simulated. No external site was queried. A candidate failure never advances automatically to funding.</div>
    <div className="section-title"><h2>Candidate records</h2><span className="small muted">Each record has a distinct evidence boundary</span></div>
    <div className="queue-list">{records.map((record) => <div className="queue-item" key={record.id} data-testid={`card-discovery-${record.id}`}>
      <div className="queue-letter">{record.id}</div><div className="queue-copy"><strong>{record.title}</strong><p>{record.detail}</p></div><span className={`pill ${record.tone}`}>{record.status}</span><button className="btn" onClick={() => onNavigate(record.target)} data-testid={`button-discovery-${record.id}`}>{record.action} <ArrowRight size={13} /></button>
    </div>)}</div>
    <div className="grid two" style={{ marginTop: 18 }}>
      <div className="card"><div className="card-title"><div><div className="card-kicker">A · Observed route evidence</div><h3 style={{ marginTop: 6 }}>Three linked references</h3></div><span className="pill red">Candidate failure</span></div><div className="list"><div className="evidence"><FileText /><span><b>A-route</b> · https://hotel-a.example/booking · confirmed synthetic official route</span></div><div className="evidence warn"><CircleAlert /><span><b>A-check-1</b> · matching synthetic 404</span></div><div className="evidence warn"><CircleAlert /><span><b>A-check-2</b> · matching synthetic 404</span></div></div><p className="footer-note">These references fail candidate validation. They do not create need, eligibility, approval or funds.</p></div>
      <div className="card"><div className="card-title"><div><div className="card-kicker">B · Suggested need vs declaration</div><h3 style={{ marginTop: 6 }}>Keep evidence sources separate</h3></div><span className={`pill ${state.bSuggestionConfirmed ? 'teal' : 'amber'}`}>{state.bSuggestionConfirmed ? 'Representative confirmed' : 'Awaiting representative'}</span></div><div className="evidence"><FileCheck2 /><span><b>B-review-1</b> and <b>B-review-2</b> · fictional review excerpts suggest carpentry; not confirmation.</span></div><div className="evidence" style={{ marginTop: 8 }}><Building2 /><span><b>B-confirmation</b> · separate Hotel B representative record: {state.bSuggestionConfirmed ? 'recorded' : 'awaiting Hotel B'}.</span></div><div className="evidence" style={{ marginTop: 8 }}><HandCoins /><span>Fictional affordability declaration is separate: AED 300 direct contribution.</span></div><button className="btn" style={{ marginTop: 14 }} onClick={() => onNavigate('case')} data-testid="button-open-b-confirmation">Open Hotel B case <ArrowRight size={13} /></button></div>
    </div>
  </>;
}

function HotelCase({ state, onApprove, onNotify, onUpdate }: { state: DemoState; onApprove: (key: 'savingsApprovals' | 'collectionApprovals' | 'allocationApprovals' | 'supportApprovals', amount: number) => void; onNotify: (text: string) => void; onUpdate: (patch: Partial<DemoState>) => void }) {
  const baselineMinor = [100000, 300000, 100000].reduce((sum, componentMinor) => sum + componentMinor, 0);
  const observedMinor = [90000, 200000, 110000].reduce((sum, componentMinor) => sum + componentMinor, 0);
  const differenceMinor = baselineMinor - observedMinor;
  const savingsReady = approved(state.savingsApprovals, 'InnMetric', differenceMinor) && approved(state.savingsApprovals, 'Tourism Department', differenceMinor);
  return <>
    <div className="page-head"><div><div className="eyebrow">Hotel case · versioned decisions</div><h1>Evidence to support</h1><p className="lead">Keep Hotel A's cost comparison and Hotel B's proposed carpentry support separate, visible and version-bound.</p></div><span className="pill neutral">Shared state · {state.role}</span></div>
    <div className="grid two">
      <div className="card"><div className="card-title"><div><div className="card-kicker">Hotel A · advertising costs</div><h2 style={{ marginTop: 6 }}>AED 1,000 difference</h2></div><span className={`pill ${savingsReady ? 'teal' : 'amber'}`}>{savingsReady ? 'Verified by two reviewers' : 'Awaiting two reviewers'}</span></div>
        <div className="table-wrap"><table className="table"><thead><tr><th>Component</th><th>Baseline</th><th>Observed</th><th>Difference</th></tr></thead><tbody>{[['Advertising',100000,90000],['OTA',300000,200000],['Direct booking / payment',100000,110000]].map(([name, baseMinor, seenMinor]) => <tr key={name}><td>{name}</td><td className="num">{moneyMinor(Number(baseMinor))}</td><td className="num">{moneyMinor(Number(seenMinor))}</td><td className="num">{moneyMinor(Number(baseMinor)-Number(seenMinor))}</td></tr>)}<tr><td><b>Total · calculated</b></td><td className="num"><b>{moneyMinor(baselineMinor)}</b></td><td className="num"><b>{moneyMinor(observedMinor)}</b></td><td className="num"><b>{moneyMinor(differenceMinor)}</b></td></tr></tbody></table></div>
        <div className="source-note" style={{ marginTop: 15 }}>Calculation source: isolated synthetic fixture components, summed as integer AED fils: 500,000 fils baseline − 400,000 fils observed = 100,000 fils difference. Comparison limitations: illustrative records only; not independently audited or normalized for timing, attribution, taxes, scope or actual booking volume. No rate or percentage is configured.</div>
        <div className="rule" /><div className="small muted">Current reviewer approvals: InnMetric <b>{approved(state.savingsApprovals, 'InnMetric', differenceMinor) ? 'approved' : 'pending'}</b> · Department <b>{approved(state.savingsApprovals, 'Tourism Department', differenceMinor) ? 'approved' : 'pending'}</b></div>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={() => onApprove('savingsApprovals', differenceMinor)} data-testid="button-approve-savings">Approve current comparison <Check size={14} /></button><p className="footer-note">Savings verification creates no cash. Each role must approve the same current comparison version.</p>
      </div>
      <div className="card"><div className="card-title"><div><div className="card-kicker">Hotel B · suggested carpentry</div><h2 style={{ marginTop: 6 }}>Keep the records separate</h2></div><span className="pill amber">Separate case</span></div>
        <div className="data-row"><span className="data-label">Review signals</span><b className="data-value">B-review-1 · B-review-2</b></div><div className="data-row"><span className="data-label">Need suggested</span><b className="data-value">Carpentry</b></div><div className="data-row"><span className="data-label">B-confirmation</span><b className="data-value">{state.bSuggestionConfirmed ? 'Recorded separately' : 'Awaiting Hotel B'}</b></div><div className="data-row"><span className="data-label">Fictional contribution declaration</span><b className="data-value">AED 300 · separate record</b></div><div className="data-row"><span className="data-label">Requested programme support</span><b className="data-value">{moneyMinor(SUPPORT_MINOR)}</b></div>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => state.role === 'Hotel B' ? (onUpdate({ bSuggestionConfirmed: true }), onNotify('Hotel B representative confirmation recorded separately from review evidence.')) : onNotify('Blocked: switch role to Hotel B to record the representative confirmation.')} data-testid="button-confirm-b-need" disabled={state.bSuggestionConfirmed}>{state.bSuggestionConfirmed ? 'Hotel B confirmation recorded' : 'Confirm suggested need as Hotel B'} <Check size={14} /></button>
      </div>
    </div>
  </>;
}

function Support({ state, onApprove, onNotify, onUpdate, onOutcome }: { state: DemoState; onApprove: (key: 'savingsApprovals' | 'collectionApprovals' | 'allocationApprovals' | 'supportApprovals', amount: number) => void; onNotify: (text: string) => void; onUpdate: (patch: Partial<DemoState>) => void; onOutcome: () => void }) {
  const allocationReady = approved(state.allocationApprovals, 'InnMetric', SUPPORT_MINOR) && approved(state.allocationApprovals, 'Tourism Department', SUPPORT_MINOR);
  const supportReady = approved(state.supportApprovals, 'InnMetric', SUPPORT_MINOR) && approved(state.supportApprovals, 'Tourism Department', SUPPORT_MINOR);
  const allConfirmations = ['Tourism Department', 'Hotel B', 'InnMetric'].every((role) => state.confirmations.includes(role as Role));
  return <>
    <div className="page-head"><div><div className="eyebrow">Programme support · Hotel B · simulated</div><h1>Confirm the need. Then fund the work.</h1><p className="lead">A separate support decision connects Hotel B's confirmed need, provider quote, explicit allocation, department reservation, payment and outcome.</p></div><span className={`pill ${state.paymentPosted ? 'teal' : state.reserved ? 'amber' : 'neutral'}`} data-testid="status-support-payment">{state.paymentPosted ? 'Paid once' : state.reserved ? 'Reserved' : 'Not reserved'}</span></div>
    <div className="notice">Hotel B support is separate from Hotel A's savings review. InnMetric may co-approve but cannot reserve or execute pool payments.</div>
    <div className="grid two" style={{ marginTop: 16 }}>
      <div className="card"><div className="card-kicker">Confirmed case and quote</div><h2 style={{ marginTop: 6 }}>Carpentry · AED 500 quote</h2><div className="data-row"><span className="data-label">Need signal</span><b className="data-value">Referenced reviews suggest carpentry</b></div><div className="data-row"><span className="data-label">Hotel B confirmation</span><b className="data-value">{state.bSuggestionConfirmed ? 'Confirmed separately' : 'Awaiting Hotel B'}</b></div><div className="data-row"><span className="data-label">Provider quote</span><b className="data-value">AED 500</b></div><div className="data-row"><span className="data-label">Hotel B direct contribution</span><b className="data-value">AED 300 · separate payment</b></div><div className="data-row"><span className="data-label">Programme support request</span><b className="data-value">{moneyMinor(SUPPORT_MINOR)}</b></div><div className="source-note" style={{ marginTop: 14 }}>The representative confirmation and affordability declaration are fictional and separate from review evidence. They do not imply a real subsidy eligibility rule.</div></div>
      <div className="card"><div className="card-kicker">Cross-hotel allocation</div><h2 style={{ marginTop: 6 }}>A-attributed pool → Hotel B</h2><p className="small muted">This explicit illustrative allocation requires InnMetric and department approval. Hotel A acknowledgement is not a gate. Approval does not move money.</p><div className="data-row"><span className="data-label">InnMetric reviewer</span><b className="data-value">{approved(state.allocationApprovals, 'InnMetric', SUPPORT_MINOR) ? 'Approved' : 'Pending'}</b></div><div className="data-row"><span className="data-label">Department reviewer</span><b className="data-value">{approved(state.allocationApprovals, 'Tourism Department', SUPPORT_MINOR) ? 'Approved' : 'Pending'}</b></div><button className="btn" style={{ marginTop: 12 }} onClick={() => onApprove('allocationApprovals', SUPPORT_MINOR)} data-testid="button-approve-allocation">Approve AED 200 allocation <CheckCheck size={14} /></button><div className="rule" /><div className="card-kicker">Independent support approval</div><div className="data-row"><span className="data-label">InnMetric</span><b className="data-value">{approved(state.supportApprovals, 'InnMetric', SUPPORT_MINOR) ? 'Approved' : 'Pending'}</b></div><div className="data-row"><span className="data-label">Department</span><b className="data-value">{approved(state.supportApprovals, 'Tourism Department', SUPPORT_MINOR) ? 'Approved' : 'Pending'}</b></div><button className="btn primary" style={{ marginTop: 12 }} onClick={() => onApprove('supportApprovals', SUPPORT_MINOR)} data-testid="button-approve-support">Approve support request <Check size={14} /></button><p className="footer-note">{allocationReady && supportReady ? 'Both allocation and support have separate joint approvals. The department still must reserve and pay.' : 'A missing reviewer blocks the relevant action. These are client-side presentation checks only.'}</p></div>
    </div>
    <div className="section-title"><h2>Provider delivery and outcome</h2><span className={`pill ${allConfirmations ? 'teal' : 'amber'}`} data-testid="status-outcome-closure">{allConfirmations ? 'Outcome confirmed by all parties' : state.providerDelivered ? 'Closure blocked · confirmations missing' : 'Delivery not yet marked'}</span></div>
    <div className="grid two">
      <div className="card"><div className="card-kicker">Provider stage</div><h3 style={{ marginTop: 6 }}>Delivery is not an outcome</h3><p className="small muted">Provider delivery and beneficiary/result confirmation are separate events.</p><div className="data-row"><span className="data-label">Delivery status</span><b className="data-value">{state.providerDelivered ? 'Marked delivered' : 'Not delivered'}</b></div><button className="btn" style={{ marginTop: 12 }} onClick={() => state.role !== 'Provider' ? onNotify('Blocked: switch role to Provider to mark work delivered.') : !state.paymentPosted ? onNotify('Blocked: department payment must be recorded before delivery in this demo sequence.') : (onUpdate({ providerDelivered: true }), onNotify('Provider marked delivery. Outcome confirmation remains separate.'))} data-testid="button-mark-delivered" disabled={state.providerDelivered}>Mark provider work delivered <Check size={14} /></button></div>
      <div className="card"><div className="card-kicker">Required independent confirmations</div><div className="list" style={{ marginTop: 10 }}>{(['Tourism Department', 'Hotel B', 'InnMetric'] as Role[]).map((role) => <div key={role} className="data-row"><span className="data-label">{role}</span><b className="data-value">{state.confirmations.includes(role) ? 'Confirmed' : 'Unresolved'}</b></div>)}</div>{!allConfirmations && <div className="unresolved" data-testid="status-unresolved-work">Unresolved work: {(['Tourism Department', 'Hotel B', 'InnMetric'] as Role[]).filter((role) => !state.confirmations.includes(role)).join(', ')} confirmation{state.confirmations.length === 2 ? '' : 's'} needed.</div>}<button className="btn primary" style={{ marginTop: 12 }} onClick={onOutcome} data-testid="button-confirm-outcome" disabled={!state.providerDelivered || !['Tourism Department', 'Hotel B', 'InnMetric'].includes(state.role) || state.confirmations.includes(state.role)}>{state.confirmations.includes(state.role) ? `${state.role} confirmed` : `Confirm outcome as ${state.role}`} <Check size={14} /></button></div>
    </div>
  </>;
}

function Funds({ state, cash, reserved, available, onApprove, onReceipt, onReserve, onPay, onNotify, onUpdate }: { state: DemoState; cash: number; reserved: number; available: number; onApprove: (key: 'savingsApprovals'|'collectionApprovals'|'allocationApprovals'|'supportApprovals', amount: number) => void; onReceipt: () => void; onReserve: () => void; onPay: () => void; onNotify: (text: string) => void; onUpdate: (patch: Partial<DemoState>) => void }) {
  const amount = state.collectionAmountMinor;
  const amountChanged = (value: number) => {
    if (state.receiptPosted) { onNotify('Collection amount is locked after receipt posting.'); return; }
    if (!Number.isFinite(value)) return;
    const amountMinor = Math.max(0, Math.round(value * 100));
    if (amountMinor !== state.collectionAmountMinor) {
      onUpdate({ collectionAmountMinor: amountMinor, collectionVersion: state.collectionVersion + 1, collectionApprovals: [] });
    }
  };
  const allocationReady = approved(state.allocationApprovals, 'InnMetric', SUPPORT_MINOR) && approved(state.allocationApprovals, 'Tourism Department', SUPPORT_MINOR);
  const supportReady = approved(state.supportApprovals, 'InnMetric', SUPPORT_MINOR) && approved(state.supportApprovals, 'Tourism Department', SUPPORT_MINOR);
  return <>
    <div className="page-head"><div><div className="eyebrow">Department funds · simulated ledger</div><h1>Only collected cash can move.</h1><p className="lead">Proposed budget is not spendable. Receipt, reservation and payment are separate versioned events with distinct permissions.</p></div><span className="pill neutral">Role: {state.role}</span></div>
    <div className="grid three">
      <div className="card"><div className="card-kicker">Cash balance</div><div className="metric num" data-testid="status-cash-balance">{moneyMinor(cash)}</div><div className="metric-sub">Simulated receipts less posted payments</div></div>
      <div className="card"><div className="card-kicker">Reserved</div><div className="metric num" data-testid="status-reserved-balance">{moneyMinor(reserved)}</div><div className="metric-sub">Committed to approved Hotel B support</div></div>
      <div className="card"><div className="card-kicker">Available</div><div className="metric num" data-testid="status-available-balance">{moneyMinor(available)}</div><div className="metric-sub">Cash less current reservations</div></div>
    </div>
    <div className="grid two" style={{ marginTop: 16 }}>
      <div className="card"><div className="card-title"><div><div className="card-kicker">Collection · Hotel A attributed</div><h2 style={{ marginTop: 6 }}>Explicit receipt amount</h2></div><span className={`pill ${state.receiptPosted?'teal':'amber'}`}>{state.receiptPosted?'Posted once':'Not posted'}</span></div>
        <div className="field"><label htmlFor="collection-amount">Amount · AED</label><input id="collection-amount" type="number" min="0" step="0.01" className="input" value={(amount / 100).toFixed(2)} disabled={state.receiptPosted} onChange={(event) => amountChanged(Number(event.target.value))} data-testid="input-collection-amount" /></div>
        <p className="small muted" style={{ marginTop: 10 }}>Starts at AED 1,000. Changing an unposted amount clears both approvals; approval is bound to the current amount.</p><div className="rule" />
        <div className="data-row"><span className="data-label">InnMetric approval</span><b className="data-value">{approved(state.collectionApprovals, 'InnMetric', amount, state.collectionVersion) ? 'Approved' : 'Pending'}</b></div><div className="data-row"><span className="data-label">Department approval</span><b className="data-value">{approved(state.collectionApprovals, 'Tourism Department', amount, state.collectionVersion) ? 'Approved' : 'Pending'}</b></div>
        <div className="btn-row" style={{ marginTop: 13 }}><button className="btn" onClick={() => onApprove('collectionApprovals', amount)} disabled={state.receiptPosted || amount <= 0} data-testid="button-approve-collection">Approve {moneyMinor(amount)}</button><button className="btn primary" onClick={onReceipt} disabled={state.receiptPosted} data-testid="button-post-receipt">Post simulated receipt <ArrowDownRight size={14}/></button></div>
      </div>
      <div className="card"><div className="card-title"><div><div className="card-kicker">Proposed department budget</div><h2 style={{ marginTop: 6 }}>Not cash. Not spendable.</h2></div><span className="pill red">No budget authorization</span></div><div className="metric num" style={{ fontSize: 23 }}>{moneyMinor(50000)}</div><p className="small muted">Synthetic fixture proposal only. It is not a receipt, programme balance, or authorization to reserve or spend.</p><div className="notice red">No rate or percentage is configured. The demo must never spend from this proposed amount.</div></div>
    </div>
    <div className="section-title"><h2>Hotel B · AED 200 support path</h2><span className={`pill ${state.paymentPosted?'teal':state.reserved?'amber':'neutral'}`} data-testid="status-support-payment">{state.paymentPosted?'Paid once':state.reserved?'Reserved':'Not reserved'}</span></div>
    <div className="grid two">
      <div className="card"><div className="card-kicker">Preconditions · distinct approvals</div><div className="data-row"><span className="data-label">Hotel B quote</span><b className="data-value">AED 500</b></div><div className="data-row"><span className="data-label">Hotel B direct contribution</span><b className="data-value">AED 300 · separate from programme cash</b></div><div className="data-row"><span className="data-label">Cross-hotel allocation approved</span><b className="data-value">{allocationReady?'Yes':'No'}</b></div><div className="data-row"><span className="data-label">Support decision independently approved</span><b className="data-value">{supportReady?'Yes':'No'}</b></div><div className="data-row"><span className="data-label">Collected cash exists</span><b className="data-value">{state.receiptPosted?'Yes':'No'}</b></div>
        <div className="btn-row" style={{ marginTop: 13 }}><button className="btn primary" onClick={onReserve} disabled={state.reserved || state.paymentPosted} data-testid="button-reserve-support"><Banknote size={14}/> Reserve AED 200</button><button className="btn primary" onClick={onPay} disabled={!state.reserved || state.paymentPosted} data-testid="button-post-payment"><Landmark size={14}/> Post department payment</button></div>
        {state.paymentPosted && <button className="btn danger" style={{ marginTop: 10 }} onClick={onPay} data-testid="button-replay-payment">Attempt duplicate payment</button>}
        <p className="footer-note">{!state.receiptPosted?'Blocked: no collected cash.':!allocationReady?'Blocked: cross-hotel allocation needs two distinct approvals.':!supportReady?'Blocked: support itself needs two distinct approvals.':available < SUPPORT_MINOR && !state.paymentPosted?'Blocked: collected available cash is below the AED 200 request.':!state.reserved && !state.paymentPosted?'Ready to reserve.':state.paymentPosted?'Settled once; replay is idempotently blocked.':'Reservation is held; department may post one payment.'}</p>
      </div>
      <div className="card"><div className="card-kicker">Simulated ledger entries</div><div className="ledger" data-testid="status-ledger">
        <div className="ledger-item"><span className="ledger-icon"><ArrowDownRight size={15}/></span><span>Hotel A receipt</span><b className="num">{state.receiptPosted?`+ ${moneyMinor(amount)}`:'Not posted'}</b></div>
        <div className="ledger-item"><span className="ledger-icon"><Clock3 size={15}/></span><span>Hotel B reservation</span><b className="num">{state.reserved?`− ${moneyMinor(SUPPORT_MINOR)}`:state.paymentPosted?'Released on payment':'None'}</b></div>
        <div className="ledger-item"><span className="ledger-icon"><Landmark size={15}/></span><span>Department payment</span><b className="num">{state.paymentPosted?`− ${moneyMinor(SUPPORT_MINOR)}`:'Not posted'}</b></div>
        <div className="ledger-item"><span className="ledger-icon"><Building2 size={15}/></span><span>Hotel B direct contribution</span><b className="num">{state.bDirectPaid?'Paid AED 300 · outside pool':'AED 300 · not posted'}</b></div>
      </div><div className="btn-row" style={{ marginTop: 14 }}><button className="btn" onClick={()=>state.role === 'Hotel B' ? (onUpdate({ bDirectPaid: true }), onNotify('Hotel B direct contribution of AED 300 recorded separately; programme cash is unchanged.')) : onNotify('Blocked: switch role to Hotel B to record the separate direct contribution.')} disabled={state.bDirectPaid} data-testid="button-pay-hotel-contribution">{state.bDirectPaid?'Hotel B contribution recorded':'Record AED 300 as Hotel B'}</button><button className="btn danger" onClick={() => state.role === 'InnMetric' ? onNotify('Blocked: InnMetric attempted a pool payment. Only the department may execute after reservation; no balance changed.') : onNotify('Switch the simulated role to InnMetric before attempting the pool payment.')} data-testid="button-attempt-innmetric-payment">Attempt pool payment as InnMetric</button></div><p className="footer-note">Hotel B's direct contribution is a separate simulated payment and does not change programme cash. Switch to InnMetric to demonstrate the visibly blocked pool payment. Payment replay cannot double-count.</p></div>
    </div>
  </>;
}

function Services({ state, onUpdate, onNotify }: { state: DemoState; onUpdate: (patch: Partial<DemoState>)=>void; onNotify: (text:string)=>void }) {
  const createProposal = (type: 'subscription'|'on-demand') => {
    if (state.role !== 'InnMetric') { onNotify('Blocked: only the simulated InnMetric role can draft its independent commercial proposal.'); return; }
    onUpdate({ proposal: type }); onNotify(`${type === 'subscription' ? 'Draft subscription' : 'On-demand'} proposal saved in the local demo. No checkout or pool effect.`);
  };
  return <>
    <div className="page-head"><div><div className="eyebrow">Commercially independent · Hotel C</div><h1>Outside the programme pool.</h1><p className="lead">Hotel C's commercial inquiry is not discovery evidence. InnMetric services stay separate from department support decisions and programme cash.</p></div><span className="pill teal">Separate service lane</span></div>
    <div className="notice teal">Synthetic inquiry only. No external service, checkout, payment processing or programme-fund effect exists in this prototype.</div>
    <div className="grid two" style={{ marginTop: 18 }}>
      <div className="card"><div className="card-title"><div><div className="card-kicker">Hotel C · separate inquiry</div><h2 style={{ marginTop: 6 }}>Commercial conversation</h2></div><span className="pill neutral">Not discovery</span></div><p className="lead" style={{ fontSize: 12 }}>A distinct fictional inquiry about InnMetric services. It does not establish a tourism-support need, eligibility, affordability or programme funding.</p><div className="rule"/><div className="data-row"><span className="data-label">Inquiry type</span><b className="data-value">Independent service interest</b></div><div className="data-row"><span className="data-label">Programme cash effect</span><b className="data-value">AED 0</b></div><div className="data-row"><span className="data-label">Checkout</span><b className="data-value">Not available</b></div></div>
      <div className="card"><div className="card-kicker">Proposal options</div><h2 style={{ marginTop: 6 }}>Price not configured.</h2><p className="small muted">Price and free tier are deliberately shown as not configured. Proposal actions create local presentation records only.</p><div className="notice" style={{ margin: '14px 0' }}>No rate, price or percentage is configured. No checkout will be initiated.</div><div className="btn-row"><button className="btn primary" onClick={()=>createProposal('subscription')} data-testid="button-draft-subscription">Draft subscription proposal <FileText size={14}/></button><button className="btn" onClick={()=>createProposal('on-demand')} data-testid="button-draft-on-demand">Draft on-demand proposal <ArrowRight size={14}/></button></div><div className="rule"/><div className="data-row"><span className="data-label">Subscription price</span><b className="data-value">Not configured</b></div><div className="data-row"><span className="data-label">Free tier</span><b className="data-value">Not configured</b></div><div className="data-row"><span className="data-label">Current local proposal</span><b className="data-value" data-testid="status-service-proposal">{state.proposal || 'None'}</b></div><div className="data-row"><span className="data-label">Programme-pool effect</span><b className="data-value">AED 0</b></div></div>
    </div>
  </>;
}

function Guide({ state, onStart, onGo, onRole }: { state: DemoState; onStart:()=>void; onGo:(view:View)=>void; onRole:(role:Role)=>void }) {
  return <>
    <div className="page-head"><div><div className="eyebrow">For the presenter · about three minutes</div><h1>Tell the story in sequence.</h1><p className="lead">A concise path through evidence, separate decisions, simulated cash movement and what remains deliberately unbuilt.</p></div><button className="btn primary" onClick={onStart} data-testid="button-guide-start">Start guided journey <ArrowRight size={14}/></button></div>
    <div className="guide-layout">
      <div className="card"><h2>Nine beats, one connected record</h2>{guideSteps.map((step,index)=><div className={`guide-step ${state.journey && state.journeyStep===index?'active':''}`} key={step.title}><div className="guide-number">{String(index+1).padStart(2,'0')}</div><div><strong>{step.title}</strong><p>{step.detail}</p></div><button className="btn" onClick={()=>onGo(step.view)} data-testid={`button-guide-view-${index}`}>Open</button></div>)}</div>
      <div className="card"><div className="card-kicker">Presenter notes</div><h3 style={{ marginTop: 7 }}>What this prototype proves</h3><div className="list"><div className="evidence"><CheckCheck/><span><b>Sequence.</b> Evidence → review → separate approvals → collection → allocation → delivery → confirmations.</span></div><div className="evidence"><Activity/><span><b>Real calculations.</b> Only fixture component arithmetic is real: AED 5,000 baseline − AED 4,000 observed = AED 1,000 difference. Transactions are simulated.</span></div><div className="evidence warn"><ShieldAlert/><span><b>Simulation.</b> Records, roles, approvals, receipts and payments live only in browser state / localStorage.</span></div><div className="evidence warn"><CircleAlert/><span><b>Limitations.</b> No server, authorization, discovery, AI, actual funds, service affiliation or checkout.</span></div><div className="evidence"><Clock3/><span><b>Deferred.</b> Production identity and access, audited evidence ingestion, legal/programme policy, payment rails, provider onboarding, secure persistence and operational controls.</span></div></div>
        <div className="rule"/><h3>State behavior</h3><p className="small muted">The demo stores its single shared presentation state in this browser's localStorage and restores it on refresh. Reset demo confirms before clearing local progress and returns all views to the initial fixture. No network request is made.</p><div className="rule"/><h3>Role sequence</h3><div className="small muted">Switch roles deliberately using the left rail. Each action's simulation guard is client-side only and is not server-enforced authorization.</div><div className="btn-row" style={{ marginTop: 10 }}>{roles.map((role)=><button className={`btn ${state.role===role?'primary':''}`} key={role} onClick={()=>onRole(role)} data-testid={`button-guide-role-${role.toLowerCase().replaceAll(' ','-')}`}>{role}</button>)}</div>
      </div>
    </div>
  </>;
}

export default App;
