import { ArrowRight, Check, CircleAlert, CircleDashed, RotateCcw, ShieldCheck, Undo2 } from "lucide-react";
import type { DemoAction, DemoRole } from "./lib/demo-api";

type Result = { checkId: string; kind: "bookable" | "not_bookable" | "open" | "ok"; label: string; note: string };
type Service = {
  fixture: any;
  changes: Record<string, { status: "proposed" | "approved" | "applied" | "reversed"; approvedBy: string | null }>;
  verificationRuns: { run: number; results: Result[] }[];
  handover: { acknowledged: boolean; acknowledgedBy: string | null; afterRun: number | null };
  monitoring: {
    runs: { recheckId: string; label: string; when: string; results: Result[] }[];
    raised: { id: string; recheckId: string; checkId: string; text: string; status: "open" }[];
  };
};
type Runner = (action: DemoAction, payload?: Record<string, unknown>) => Promise<void>;

const money = (minor: number | null | undefined) =>
  minor === null || minor === undefined
    ? "Not configured"
    : `AED ${(minor / 100).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CHANGE_LABEL = {
  proposed: "Awaiting hotel sign-off",
  approved: "Signed off, not yet applied",
  applied: "Applied (simulated)",
  reversed: "Reversed, needs new sign-off",
} as const;

const CAUSE_LABEL: Record<string, [string, string]> = {
  established: ["Cause established", "ok"],
  not_established: ["Cause not established", "open"],
  no_fault: ["No fault found", "neutral"],
};

function evaluate(service: Service, check: any): Result {
  const outcome = check.fixed ?? (service.changes[check.changeId]?.status === "applied" ? check.after : check.before);
  return { checkId: check.id, ...outcome };
}

/** Status chip. "Not bookable" and open items are always kaki, never the asagi family. */
function Status({ kind, children }: { kind: string; children: React.ReactNode }) {
  return <span className={`status ${kind}`} data-status={kind}>{children}</span>;
}

function findingStatus(service: Service, finding: any): [string, string] {
  if (finding.initialStatus === "closed_no_difference") return ["Closed: no difference after matching", "neutral"];
  if (finding.initialStatus === "unresolved") return ["Unresolved, stays open", "open"];
  const status = service.changes[finding.changeId]?.status ?? "proposed";
  const latest = service.verificationRuns.at(-1)?.results.find((result) => result.checkId === finding.checkId);
  if (status === "applied" && latest && (latest.kind === "bookable" || latest.kind === "ok")) return ["Verified by repeat check", "ok"];
  if (status === "applied") return ["Open: applied, repeat check pending", "open"];
  if (status === "approved") return ["Open: change signed off", "open"];
  if (status === "reversed") return ["Open: change reversed", "open"];
  return ["Open: change proposed", "open"];
}

export function HotelService({
  service,
  role,
  hotelId,
  busy,
  onAction,
  onOpenProgramme,
}: {
  service: Service | null | undefined;
  role: DemoRole;
  hotelId: string | null;
  busy: boolean;
  onAction: Runner;
  onOpenProgramme: () => void;
}) {
  if (!service) {
    return (
      <>
        <div className="page-head"><div><div className="eyebrow">InnMetric hotel service</div><h1>Restricted commercial record.</h1><p className="lead">The hotel service record belongs to Demo Hotel A and InnMetric. The Tourism Department, other hotels and providers cannot open it.</p></div></div>
        <div className="notice">Switch to the InnMetric operator or the Hotel A representative to view the service story.</div>
      </>
    );
  }
  const f = service.fixture;
  const isOperator = role === "innmetric";
  const isApprover = role === "hotel" && hotelId === f.hotel.id;
  const changes = f.changes as any[];
  const applied = changes.filter((change) => service.changes[change.id].status === "applied").length;
  const latestRun = service.verificationRuns.at(-1);
  const latestMonitor = service.monitoring.runs.at(-1);
  const nextRecheck = f.rechecks[service.monitoring.runs.length];
  const openItems: string[] = [
    ...(f.audit.findings as any[])
      .map((finding) => [finding, findingStatus(service, finding)] as const)
      .filter(([, [, tone]]) => tone === "open")
      .map(([finding, [label]]) => `${finding.id} ${finding.title}. ${label}.`),
    ...service.monitoring.raised.map((item) => item.text),
  ];
  const stages: [string, string, string][] = [
    ["hs-intake", "Intake", "Recorded"],
    ["hs-audit", "Distribution Baseline Audit", `${f.audit.findings.length} findings`],
    ["hs-sprint", "Approved Repair Sprint", `${applied} of ${changes.length} applied`],
    ["hs-verify", "Verification and handover", service.handover.acknowledged ? "Handed over" : latestRun ? `Repeat check ${latestRun.run}` : "Not started"],
    ["hs-control", "Ongoing Distribution Control", `${service.monitoring.runs.length} of ${f.rechecks.length} rechecks`],
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="eyebrow">InnMetric hotel service · founder delivered</div>
          <h1>Find it, fix it with the hotel, check it again.</h1>
          <p className="lead">{f.hotel.name}. {f.hotel.profile}</p>
        </div>
      </div>
      <nav className="stage-strip" aria-label="Service stages">
        {stages.map(([id, label, status], index) => (
          <a key={id} href={`#${id}`} className="stage" onClick={(event) => { event.preventDefault(); document.getElementById(id)?.scrollIntoView({ block: "start" }); }}>
            <span className="stage-n">{index + 1}</span>
            <span><b>{label}</b><small>{status}</small></span>
          </a>
        ))}
      </nav>

      {/* 1. Intake */}
      <section className="hs-section" id="hs-intake" aria-labelledby="hs-intake-h">
        <div className="hs-kicker">Stage 1</div>
        <h2 id="hs-intake-h">Intake</h2>
        <div className="grid two">
          <div className="card">
            <div className="card-kicker">Reported by the hotel</div>
            <blockquote className="hs-quote">"{f.intake.report}"</blockquote>
            <p className="small muted">{f.hotel.approver.name}, {f.hotel.approver.title}. {f.hotel.approver.note}.</p>
            <div className="rule" />
            <div className="card-kicker">First observations · room type {f.intake.roomType}</div>
            <div className="list" style={{ marginTop: 8 }}>
              {(f.intake.observations as any[]).map((item) => (
                <div className={`evidence${item.id === "intake-twin" ? "" : " warn"}`} key={item.id}>
                  {item.id === "intake-twin" ? <Check size={15} /> : <CircleAlert size={15} />}<span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">Systems in scope</div>
            <div className="chip-row">{(f.intake.systemsInScope as string[]).map((system) => <span className="pill neutral" key={system}>{system}</span>)}</div>
            <p className="small muted" style={{ marginTop: 10 }}>{f.intake.accessNote}</p>
            <div className="rule" />
            <div className="card-kicker">How InnMetric works</div>
            <ul className="hs-list">{(f.service.boundaries as string[]).map((line) => <li key={line}>{line}</li>)}</ul>
            <div className="data-row"><span className="data-label">Service fee</span><b className="data-value">{money(f.service.feeMinor)}</b></div>
          </div>
        </div>
      </section>

      {/* 2. Audit */}
      <section className="hs-section" id="hs-audit" aria-labelledby="hs-audit-h">
        <div className="hs-kicker">Stage 2</div>
        <h2 id="hs-audit-h">Distribution Baseline Audit</h2>
        <div className="card">
          <div className="card-kicker">Matched before comparing</div>
          <dl className="match-grid">
            {(f.audit.match as any[]).map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
          </dl>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="table hs-table">
              <thead><tr><th>Channel</th><th>Status</th><th>Figure displayed</th><th>Matched stay total</th><th>Observation</th></tr></thead>
              <tbody>
                {(f.audit.rows as any[]).map((row) => (
                  <tr key={row.channel}>
                    <td><b>{row.channel}</b></td>
                    <td><Status kind={row.bookable ? "bookable" : "not_bookable"}>{row.bookable ? "Bookable" : "Not bookable"}</Status></td>
                    <td className="num">{row.displayedMinor === null ? "None shown" : money(row.displayedMinor)}<div className="small muted">{row.displayBasis}</div></td>
                    <td className="num">{row.matchedTotalMinor === null ? "Cannot be completed" : money(row.matchedTotalMinor)}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="source-note" style={{ marginTop: 12 }}>Reference: {money(f.audit.referenceTotalMinor)}. {f.audit.referenceNote} A public price difference alone does not prove a fault or a revenue loss. Totals are synthetic.</p>
        </div>
        <div className="grid two" style={{ marginTop: 16 }}>
          <div className="card">
            <div className="card-kicker">What was observed</div><h3 style={{ marginTop: 6 }}>Symptoms</h3>
            <div className="list">
              {(f.audit.symptoms as any[]).map((symptom) => (
                <div className="hs-item" key={symptom.id}><span className="hs-id">{symptom.id}</span><span><b>{symptom.channel}.</b> {symptom.text}</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-kicker">What explains it, where known</div><h3 style={{ marginTop: 6 }}>Causes</h3>
            <div className="list">
              {(f.audit.causes as any[]).map((cause) => {
                const [label, tone] = CAUSE_LABEL[cause.status];
                return (
                  <div className="hs-item" key={cause.id}><span className="hs-id">{cause.symptomId}</span><span>
                    <Status kind={tone}>{label}</Status> {cause.text}
                    <span className="small muted" style={{ display: "block", marginTop: 2 }}>Basis: {cause.basis}</span>
                  </span></div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-kicker">Findings register</div>
          {(f.audit.findings as any[]).map((finding) => {
            const [label, tone] = findingStatus(service, finding);
            return <div className="data-row hs-finding" key={finding.id}><span><b>{finding.id}</b> {finding.title}</span><Status kind={tone}>{label}</Status></div>;
          })}
        </div>
      </section>

      {/* 3. Repair sprint */}
      <section className="hs-section" id="hs-sprint" aria-labelledby="hs-sprint-h">
        <div className="hs-kicker">Stage 3</div>
        <h2 id="hs-sprint-h">Approved Repair Sprint</h2>
        <p className="lead" style={{ marginBottom: 14 }}>Hotel approver: <b>{f.hotel.approver.name}</b>, {f.hotel.approver.title} ({f.hotel.approver.note.toLowerCase()}). Each live change needs this sign-off and can be undone with its reversal step.</p>
        <div className="list">
          {changes.map((change) => {
            const record = service.changes[change.id];
            return (
              <article className="card change-card" key={change.id} data-change={change.id} data-change-status={record.status}>
                <div className="card-title">
                  <div><div className="card-kicker">{change.id} · {change.system} · finding {change.findingId}</div><h3 style={{ marginTop: 6 }}>{change.change}</h3></div>
                  <Status kind={record.status === "applied" ? "ok" : record.status === "approved" ? "neutral" : "open"}>{CHANGE_LABEL[record.status]}</Status>
                </div>
                <div className="evidence"><Undo2 size={15} /><span><b>Reversal step:</b> {change.reversal}</span></div>
                <div className="change-foot">
                  <span className="small">
                    {record.approvedBy
                      ? <><ShieldCheck size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Signed off by {record.approvedBy}</>
                      : <span className="muted">No sign-off recorded</span>}
                  </span>
                  <span className="btn-row">
                    {isApprover && (record.status === "proposed" || record.status === "reversed") && (
                      <button className="btn primary" disabled={busy} onClick={() => void onAction("service.approveChange", { changeId: change.id })}>Sign off {change.id}</button>
                    )}
                    {isOperator && record.status !== "applied" && (
                      <button className="btn primary" disabled={busy || record.status !== "approved"} title={record.status !== "approved" ? "Needs hotel sign-off first" : undefined} onClick={() => void onAction("service.applyChange", { changeId: change.id })}>Apply {change.id}</button>
                    )}
                    {isOperator && record.status === "applied" && (
                      <button className="btn kaki" disabled={busy} onClick={() => void onAction("service.reverseChange", { changeId: change.id })}><RotateCcw size={13} /> Reverse {change.id}</button>
                    )}
                  </span>
                </div>
              </article>
            );
          })}
          {(f.noChangeProposed as any[]).map((item) => (
            <div className="notice" key={item.findingId}><b>{item.findingId}: no change proposed.</b> {item.reason}</div>
          ))}
        </div>
        {isOperator && changes.some((change) => ["proposed", "reversed"].includes(service.changes[change.id].status)) && (
          <p className="small muted" style={{ marginTop: 10 }}>InnMetric cannot sign off for the hotel. Switch to the Hotel A representative to record the approver's decision.</p>
        )}
      </section>

      {/* 4. Verification and handover */}
      <section className="hs-section" id="hs-verify" aria-labelledby="hs-verify-h">
        <div className="hs-kicker">Stage 4</div>
        <h2 id="hs-verify-h">Verification and handover</h2>
        <div className="grid two">
          <div className="card">
            <div className="card-title">
              <div><div className="card-kicker">Repeat booking checks</div><h3 style={{ marginTop: 6 }}>{latestRun ? `Repeat check ${latestRun.run}` : "Not run yet"}</h3></div>
              {isOperator && <button className="btn primary" disabled={busy} onClick={() => void onAction("service.verify")}>Run repeat checks</button>}
            </div>
            {(f.checks as any[]).filter((check) => check.verification).map((check) => {
              const result = latestRun?.results.find((item) => item.checkId === check.id);
              return (
                <div className="check-row" key={check.id}>
                  <span><b>{check.label}</b><span className="small muted" style={{ display: "block" }}>{result ? result.note : "Awaiting first repeat check."}</span></span>
                  {result ? <Status kind={result.kind}>{result.label}</Status> : <Status kind="neutral">Not checked</Status>}
                </div>
              );
            })}
            <p className="footer-note">Repeat checks are synthetic observations. A passing check describes that moment only.</p>
          </div>
          <div className="card">
            <div className="card-kicker">Open items at handover</div>
            {openItems.length === 0
              ? <p className="small muted" style={{ marginTop: 8 }}>No open items.</p>
              : <div className="list" style={{ marginTop: 8 }}>{openItems.map((item) => <div className="evidence warn" key={item}><CircleDashed size={15} /><span>{item}</span></div>)}</div>}
            <div className="rule" />
            <div className="card-kicker">Agreed rechecks</div>
            {(f.rechecks as any[]).map((recheck) => <div className="data-row" key={recheck.id}><span className="data-label">{recheck.label}</span><b className="data-value">{recheck.when}</b></div>)}
            <p className="small muted" style={{ marginTop: 8 }}>{f.recheckNote}</p>
            <div className="rule" />
            <div className="change-foot">
              <span className="small">{service.handover.acknowledged
                ? <><ShieldCheck size={13} style={{ display: "inline", verticalAlign: "-2px" }} /> Handover acknowledged by {service.handover.acknowledgedBy} after repeat check {service.handover.afterRun}</>
                : <span className="muted">Handover not yet acknowledged by the hotel</span>}</span>
              {isApprover && !service.handover.acknowledged && (
                <button className="btn primary" disabled={busy || !latestRun} onClick={() => void onAction("service.acknowledgeHandover")}>Acknowledge handover</button>
              )}
            </div>
          </div>
        </div>
        <div className="card hotel-terms" data-testid="hotel-terms">
          <div className="grid three">
            <div>
              <div className="card-kicker">What the hotel gets</div>
              <ul className="hs-list">
                <li>Matched evidence for each finding, with causes kept apart from symptoms</li>
                <li>Only the changes its approver signed off, each with a reversal step</li>
                <li>Repeat checks under the same conditions</li>
                <li>A handover listing what is fixed and what is still open</li>
              </ul>
            </div>
            <div>
              <div className="card-kicker">What the hotel controls</div>
              <ul className="hs-list">
                <li>Sign-off on every live change, and its reversal</li>
                <li>Rates, promotions and availability rules</li>
                <li>Its systems, accounts and data</li>
                <li>Whether open items such as the OTA 1 price difference are pursued</li>
              </ul>
            </div>
            <div>
              <div className="card-kicker">Commercial options</div>
              <div className="data-row"><span className="data-label">Audit and Approved Repair Sprint</span><b className="data-value">{money(f.service.feeMinor)}</b></div>
              <div className="data-row"><span className="data-label">Ongoing Distribution Control</span><b className="data-value">{money(f.service.subscriptionPriceMinor)}</b></div>
              <p className="small muted" style={{ marginTop: 8 }}>Prices are not set in this demo, and no savings or revenue effect is claimed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Ongoing Distribution Control */}
      <section className="hs-section" id="hs-control" aria-labelledby="hs-control-h">
        <div className="hs-kicker">Stage 5 · monitoring subscription</div>
        <h2 id="hs-control-h">Ongoing Distribution Control</h2>
        <div className="grid two hs-control-grid">
          <div className="card">
            <div className="card-title">
              <div><div className="card-kicker">Monitoring view</div><h3 style={{ marginTop: 6 }}>{latestMonitor ? latestMonitor.label : "Current status"}</h3></div>
              {isOperator && <button className="btn primary" disabled={busy || !service.handover.acknowledged || !nextRecheck} title={!service.handover.acknowledged ? "Starts after handover" : undefined} onClick={() => void onAction("service.recheck")}>Run next recheck</button>}
            </div>
            {(f.checks as any[]).map((check) => {
              const monitored = latestMonitor?.results.find((item) => item.checkId === check.id);
              const verified = latestRun?.results.find((item) => item.checkId === check.id);
              const result = monitored ?? evaluate(service, check);
              const source = monitored ? latestMonitor!.label : verified ? `Repeat check ${latestRun!.run}` : "Baseline audit";
              return (
                <div className="check-row" key={check.id} data-monitor={check.id}>
                  <span><b>{check.label}</b><span className="small muted" style={{ display: "block" }}>{check.channel} · last checked: {source}</span></span>
                  <Status kind={result.kind}>{result.label}</Status>
                </div>
              );
            })}
            <p className="footer-note">Monitoring reports what it observes and raises items to the hotel. It changes nothing without hotel approval and promises no ranking or permanent fix.</p>
          </div>
          <div className="card">
            <div className="card-kicker">Scheduled rechecks</div>
            {(f.rechecks as any[]).map((recheck, index) => {
              const done = index < service.monitoring.runs.length;
              return <div className="data-row" key={recheck.id}><span><b>{recheck.label}</b><span className="small muted" style={{ display: "block" }}>{recheck.when}</span></span><Status kind={done ? "ok" : "neutral"}>{done ? "Done" : index === service.monitoring.runs.length && service.handover.acknowledged ? "Next" : "Scheduled"}</Status></div>;
            })}
            {service.monitoring.raised.length > 0 && <>
              <div className="rule" /><div className="card-kicker">Raised to the hotel</div>
              <div className="list" style={{ marginTop: 8 }}>{service.monitoring.raised.map((item) => <div className="evidence warn" key={item.id}><CircleAlert size={15} /><span>{item.text}</span></div>)}</div>
            </>}
            <div className="rule" />
            <div className="data-row"><span className="data-label">Subscription price</span><b className="data-value">{money(f.service.subscriptionPriceMinor)}</b></div>
          </div>
        </div>
        <div className="card programme-link">
          <div>
            <div className="card-kicker">Proposed programme · second phase</div>
            <h3 style={{ marginTop: 6 }}>Could one hotel's verified savings help improve another?</h3>
            <p className="small" style={{ margin: 0 }}>A tourism department would hold and administer contributions from verified hotel savings. InnMetric would never hold the pool. This service record does not establish any savings.</p>
          </div>
          <button className="btn primary" onClick={onOpenProgramme}>Open the proposed programme <ArrowRight size={14} /></button>
        </div>
      </section>
    </>
  );
}
