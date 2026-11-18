import assert from "node:assert/strict";
import { runJourney } from "./cdp-harness.mjs";

/**
 * Partner meeting journeys. DEMO_WEB_URL is the main demo address (for example http://localhost/collab/ or
 * https://<host>/innmetric-pitch/). Part one needs the programme API; part two blocks it on purpose.
 */
const base = new URL(process.env.DEMO_WEB_URL ?? "http://localhost:80/innmetric-pitch/");
if (!base.pathname.endsWith("/")) base.pathname += "/";
const url = (path) => new URL(path, base).toString();
const IRECKONU_PRESENT = url("partners/ireckonu/?present=1");
const TORUS_PRESENT = url("partners/torus-legacy/?present=1");
const IRECKONU_CLOSE = "Can we choose one hotel group, one issue and one pilot owner, and agree the access and responsibilities for a first test?";
const TORUS_CLOSE = "Is there one owner you would introduce for this review, and would Torus want to lead the handover workstream if the owner chooses it?";

await runJourney(async ({ send, evaluate }) => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // Evaluations can fail while a page is being replaced; keep polling through that.
  const waitFor = async (expression, description, attempts = 150) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        if (await evaluate(expression)) return;
      } catch {}
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${description}.`);
  };
  const go = async (target, ready, description) => {
    await send("Page.navigate", { url: target });
    await waitFor(`location.href === ${JSON.stringify(target)} && document.readyState === 'complete' && (${ready})`, description);
  };
  const click = async (selector) => {
    const clicked = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el || el.disabled) return false; el.click(); return true; })()`);
    assert.ok(clicked, `Could not click ${selector}`);
    await sleep(150);
  };
  const disabled = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)})?.disabled === true`);
  const exists = (selector) => `Boolean(document.querySelector(${JSON.stringify(selector)}))`;
  const pressEscape = async () => {
    for (const type of ["keyDown", "keyUp"]) {
      await send("Input.dispatchKeyEvent", { type, key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
    }
    await sleep(150);
  };
  /** Nothing in the page, its title or its attributes (aria-label, title, alt) may name the other partner. */
  const assertAbsent = async (name) => {
    const found = await evaluate(`(() => {
      const needle = ${JSON.stringify(name.toLowerCase())};
      const hits = [];
      if (document.title.toLowerCase().includes(needle)) hits.push('title');
      if (document.documentElement.outerHTML.toLowerCase().includes(needle)) hits.push('markup');
      const brief = document.querySelector('[data-testid="torus-brief"] textarea');
      if (brief && brief.value.toLowerCase().includes(needle)) hits.push('meeting brief');
      return hits;
    })()`);
    assert.deepEqual(found, [], `"${name}" must not appear in this meeting view (${found.join(", ")})`);
  };
  const noHorizontalScroll = () => evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1");

  // Part one: Back/Forward between the main demo and a partner page keeps the page and the simulated role.
  await waitFor(`${exists("#role-picker")} && ${exists(".crumb strong")} && !document.querySelector('#role-picker').disabled`, "the main demo");
  const unlabelled = await evaluate("[...document.querySelectorAll('.sidebar .nav-item')].filter((el) => !el.getAttribute('aria-label')).length");
  assert.equal(unlabelled, 0, "Every sidebar link needs an accessible name for the icon-only phone layout.");
  await evaluate(`(() => {
    const control = document.querySelector('#role-picker');
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(control, 'department');
    control.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  await waitFor("document.querySelector('#role-picker').value === 'department' && !document.querySelector('#role-picker').disabled", "the department perspective");
  await click('.sidebar .nav-item[aria-label="Department funds"]');
  await waitFor("document.querySelector('.crumb strong')?.innerText === 'Department funds'", "department funds");

  const mainIsUnchanged = async (round) => {
    await waitFor(`${exists("#role-picker")} && document.querySelector('.crumb strong')?.innerText === 'Department funds'`, `the main demo after Back (${round})`);
    await sleep(800); // A stray role switch would land within this window.
    assert.equal(await evaluate("document.querySelector('.crumb strong').innerText"), "Department funds", `page after Back (${round})`);
    assert.equal(await evaluate("document.querySelector('#role-picker').value"), "department", `role after Back (${round})`);
  };
  await click('[data-testid="nav-partner-ireckonu"]');
  await waitFor(exists('[data-testid="partner-ireckonu"]'), "the Ireckonu page");
  for (const round of [1, 2]) {
    await evaluate("history.back()");
    await mainIsUnchanged(round);
    await evaluate("history.forward()");
    await waitFor(exists('[data-testid="partner-ireckonu"]'), `the Ireckonu page after Forward (${round})`);
  }
  await evaluate("history.back()");
  await mainIsUnchanged(3);

  // Part two: the meeting views work with the programme API blocked.
  await send("Network.enable");
  await send("Network.setBlockedURLs", { urls: ["*/api/*"] });
  // Count any attempt to reach the programme API from the partner pages.
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: "window.__apiCalls = 0; const original = window.fetch; window.fetch = (...args) => { if (String(args[0]).includes('/api/')) window.__apiCalls += 1; return original(...args); };",
  });
  const noApiCalls = async (label) => assert.equal(await evaluate("window.__apiCalls"), 0, `${label} must not call the programme API.`);

  // Ireckonu in Present mode.
  await go(IRECKONU_PRESENT, exists('[data-testid="partner-ireckonu"]'), "the Ireckonu Present URL");
  await evaluate("sessionStorage.clear()");
  await go(IRECKONU_PRESENT, exists('[data-testid="irk-view-evidence"]'), "a clean Ireckonu story");
  assert.equal(await evaluate(exists('[data-testid="partner-sidebar"]')), false, "Present mode hides the sidebar.");
  assert.equal(await evaluate(exists(".topbar")), false, "Present mode hides the top bar.");
  assert.equal(await evaluate(exists('[data-testid="present-restart"]')), true, "Present mode offers Restart.");
  await assertAbsent("Torus");

  await click('[data-testid="irk-view-evidence"]');
  await click('[data-testid="irk-review-fix"]');
  assert.equal(await disabled('[data-testid="irk-approve"]'), true, "Approval waits for the hotel's confirmation.");
  assert.equal(await disabled('[data-testid="irk-run-recheck"]'), true, "The recheck waits for approval.");
  await click('[data-testid="irk-confirm-cause"]');
  assert.equal(await disabled('[data-testid="irk-approve"]'), false);
  assert.equal(await disabled('[data-testid="irk-run-recheck"]'), true, "The recheck still waits for approval.");
  await click('[data-testid="irk-approve"]');
  await click('[data-testid="irk-run-recheck"]');
  await waitFor("document.body.innerText.includes('The mobile booking path reaches guest details.')", "the recheck headline");
  assert.ok(await evaluate("document.body.innerText.includes('Commercial impact: pending.')"));
  assert.ok(await evaluate(`document.querySelector('[data-testid="partner-exchange"]').innerText.includes('What Ireckonu brings')`));
  assert.ok(await evaluate("document.body.innerText.includes('Authorizes data access and changes')"));
  assert.equal(await evaluate(`document.querySelector('[data-testid="pitch-ask"] h2').innerText`), `“${IRECKONU_CLOSE}”`);
  await assertAbsent("Torus");
  await noApiCalls("The Ireckonu page");

  await send("Page.reload");
  await waitFor(`document.readyState === 'complete' && ${exists("#irk-recheck")}`, "the story after a refresh");
  assert.equal(await evaluate(exists('[data-testid="partner-sidebar"]')), false, "Present mode survives a refresh.");
  await click('[data-testid="present-restart"]');
  await waitFor(`!${exists("#irk-evidence")} && document.querySelector('[data-testid="irk-view-evidence"]')?.disabled === false`, "a restarted story");
  assert.equal(await evaluate(exists('[data-testid="partner-sidebar"]')), false, "Restart keeps Present mode.");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.reload");
  await waitFor(`document.readyState === 'complete' && ${exists('[data-testid="irk-view-evidence"]')}`, "Ireckonu on a phone");
  await click('[data-testid="irk-view-evidence"]');
  await click('[data-testid="irk-review-fix"]');
  assert.ok(await noHorizontalScroll(), "Ireckonu must not scroll sideways on a phone.");
  await send("Emulation.clearDeviceMetricsOverride");

  // Torus Legacy in Present mode.
  await go(TORUS_PRESENT, exists('[data-testid="torus-briefing"]'), "the Torus Legacy Present URL");
  await assertAbsent("Ireckonu");
  assert.ok(await evaluate("document.body.innerText.toLowerCase().includes('owner briefing · fictional example')"));
  await click('[data-testid="torus-review-engagement"]');
  await waitFor(exists('[data-testid="torus-results"]'), "the engagement and results");
  const results = await evaluate(`document.querySelector('[data-testid="torus-results"]').innerText`);
  assert.ok(results.includes("Guest details reached"), "The booking result reads Guest details reached.");
  assert.ok(results.includes("5 of 5 requests reached the shift notes"), "The service check is reported separately.");
  assert.ok(await evaluate(exists('[data-testid="torus-workstream"]')), "The optional handover workstream is shown.");
  assert.equal(await evaluate(`document.querySelector('[data-testid="pitch-ask"] h2').innerText`), `“${TORUS_CLOSE}”`);

  await click('[data-testid="torus-discuss"]');
  await waitFor("document.querySelector('dialog[open]') !== null", "the meeting brief");
  const brief = await evaluate(`document.querySelector('[data-testid="torus-brief"] textarea').value`);
  for (const heading of ["Buyer", "Scope", "Delivery owner", "Observable result", "Next decision", "Optional workstreams"]) {
    assert.ok(brief.includes(`\n${heading}\n`), `The brief needs a ${heading} section.`);
  }
  await assertAbsent("Ireckonu");
  await pressEscape();
  assert.equal(await evaluate("document.querySelector('dialog[open]') === null"), true, "Escape closes the brief.");
  assert.equal(await evaluate(exists('[data-testid="partner-sidebar"]')), false, "The first Escape keeps Present mode.");
  await click('[data-testid="present-restart"]');
  await waitFor(`!${exists('[data-testid="torus-results"]')}`, "a restarted Torus story");

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Page.reload");
  await waitFor(`document.readyState === 'complete' && ${exists('[data-testid="torus-briefing"]')}`, "Torus Legacy on a phone");
  assert.ok(await noHorizontalScroll(), "Torus Legacy must not scroll sideways on a phone.");
  await send("Emulation.clearDeviceMetricsOverride");

  await noApiCalls("The Torus Legacy page");

  console.log("Partner journey passed: Back/Forward keeps page and role, both Present views with the API blocked, approval order, refresh, restart, meeting brief, phone width and no cross-partner names.");
});
