import assert from "node:assert/strict";
import { runJourney } from "./cdp-harness.mjs";

const BANNER = "Demonstration data. Not a live service or government programme.";
const KAKI = "rgb(138, 75, 46)";

await runJourney(async ({ evaluate, waitFor, clickButton, selectValue }) => {
  // Text checks ignore case because headings and labels are upper-cased in CSS.
  const lower = (value) => String(value).toLowerCase();
  const text = async () => {
    const value = lower(await evaluate("document.body.innerText"));
    return { includes: (needle) => value.includes(lower(needle)) };
  };
  const sectionText = async (selector) => {
    const value = lower(await evaluate(`document.querySelector(${JSON.stringify(selector)}).innerText`));
    return { includes: (needle) => value.includes(lower(needle)) };
  };
  const has = (value) => `document.body.innerText.toLowerCase().includes(${JSON.stringify(lower(value))})`;
  const stepIs = (number) =>
    `(document.querySelector('.walk-count')?.innerText ?? '').toUpperCase().startsWith('STEP ${number} OF 12')`;
  const role = () => evaluate("document.querySelector('#role-picker').value");
  const exists = (selector) => `Boolean(document.querySelector(${JSON.stringify(selector)}))`;
  const next = async (number) => {
    // Next is disabled while a role switch is still being saved.
    await waitFor("document.querySelector('.walk-nav .btn.primary')?.disabled === false", "the walkthrough Next button");
    await evaluate("document.querySelector('.walk-nav .btn.primary').click()");
    await waitFor(stepIs(number), `walkthrough step ${number}`);
  };
  const bannerShown = async () =>
    assert.equal(await evaluate("document.querySelector('.demo-banner')?.innerText"), BANNER);

  await waitFor(`${stepIs(1)} && ${has("Reported by the hotel")}`, "the walkthrough on its first step");
  await evaluate("window.confirm = () => true");
  await bannerShown();

  // 1. Intake: the direct booking link fails for one room type. InnMetric cannot apply unsigned changes.
  assert.equal(await role(), "innmetric");
  assert.ok((await text()).includes("Deluxe King"));
  assert.ok((await text()).includes("HTTP 404"));
  assert.equal(await evaluate("[...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Apply CH1')?.disabled"), true);
  assert.equal(await evaluate("[...document.querySelectorAll('button')].some((b) => b.innerText.includes('Sign off'))"), false);

  // 2. Audit: matched comparison, symptoms apart from causes, unresolved finding stays open.
  await next(2);
  const audit = await text();
  for (const expected of ["Matched before comparing", "Occupancy", "Taxes", "Currency", "Symptoms", "Causes", "Cause not established", "Unresolved, stays open", "does not prove a fault"]) {
    assert.ok(audit.includes(expected), `Audit should show: ${expected}`);
  }
  assert.equal(
    await evaluate("[...document.querySelectorAll('#hs-audit [data-status=\"not_bookable\"]')].every((el) => getComputedStyle(el).backgroundColor === 'rgb(138, 75, 46)')"),
    true,
    "Not bookable must use kaki.",
  );
  assert.equal(await evaluate("document.querySelectorAll('#hs-audit [data-status=\"not_bookable\"]').length"), 2);

  // 3. The named hotel approver signs off each change.
  await next(3);
  await waitFor("document.querySelector('#role-picker').value === 'hotel'", "the hotel approver perspective");
  assert.equal(await evaluate("document.querySelector('[aria-label=\"Hotel representative perspective\"]').value"), "hotel-a");
  for (const id of ["CH1", "CH2", "CH3"]) {
    assert.ok((await sectionText(`[data-change="${id}"]`)).includes("Reversal step:"));
    await clickButton(`Sign off ${id}`);
    await waitFor(exists(`[data-change="${id}"][data-change-status="approved"]`), `${id} signed off`);
  }
  assert.ok((await text()).includes("Signed off by Layla Haddad"));

  // 4. InnMetric applies only signed-off changes. A reversal needs a new sign-off.
  await next(4);
  await waitFor("document.querySelector('#role-picker').value === 'innmetric'", "the InnMetric perspective");
  for (const id of ["CH1", "CH2", "CH3"]) {
    await clickButton(`Apply ${id}`);
    await waitFor(exists(`[data-change="${id}"][data-change-status="applied"]`), `${id} applied`);
  }
  await clickButton("Reverse CH3");
  await waitFor(exists('[data-change="CH3"][data-change-status="reversed"]'), "CH3 reversed");
  assert.equal(await evaluate("[...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Apply CH3')?.disabled"), true);
  await selectValue("#role-picker", "hotel");
  await waitFor(exists('[aria-label="Hotel representative perspective"]'), "hotel selector");
  await selectValue('[aria-label="Hotel representative perspective"]', "hotel-a");
  await clickButton("Sign off CH3");
  await waitFor(exists('[data-change="CH3"][data-change-status="approved"]'), "CH3 signed off again");
  await selectValue("#role-picker", "innmetric");
  await clickButton("Apply CH3");
  await waitFor(exists('[data-change="CH3"][data-change-status="applied"]'), "CH3 applied again");

  // 5. Verification and handover: repeat checks, open items, agreed rechecks.
  await next(5);
  await clickButton("Run repeat checks");
  await waitFor(has("Repeat check 1"), "the first repeat check");
  const verify = await sectionText("#hs-verify");
  assert.ok(verify.includes("Difference observed"));
  assert.ok(verify.includes("F4 OTA 1 total is lower on matched terms"));
  assert.ok(verify.includes("7 days after handover"));
  assert.equal(await evaluate("document.querySelectorAll('#hs-verify [data-status=\"bookable\"]').length"), 2);
  await selectValue("#role-picker", "hotel");
  await waitFor(exists('[aria-label="Hotel representative perspective"]'), "hotel selector");
  await selectValue('[aria-label="Hotel representative perspective"]', "hotel-a");
  await clickButton("Acknowledge handover");
  await waitFor(has("Handover acknowledged by Layla Haddad"), "handover acknowledgement");

  // 6. Ongoing Distribution Control: scheduled rechecks, kaki for not bookable, price unset.
  await next(6);
  await waitFor("document.querySelector('#role-picker').value === 'innmetric'", "the InnMetric perspective");
  await clickButton("Run next recheck");
  await waitFor(has("First scheduled recheck") + " && document.querySelectorAll('#hs-control [data-status=\"ok\"]').length >= 2", "first recheck");
  assert.equal(await evaluate("document.querySelectorAll('#hs-control [data-status=\"not_bookable\"]').length"), 0);
  await clickButton("Run next recheck");
  await waitFor(exists('[data-monitor="mon-twin-ota2"] [data-status="not_bookable"]'), "the second recheck raising a not bookable item");
  assert.equal(
    await evaluate("getComputedStyle(document.querySelector('[data-monitor=\"mon-twin-ota2\"] [data-status=\"not_bookable\"]')).backgroundColor"),
    KAKI,
  );
  const control = await sectionText("#hs-control");
  assert.ok(control.includes("Raised to the hotel"));
  assert.ok(control.includes("Not configured"), "Subscription price must stay unset.");
  assert.ok(!control.includes("AED 0.00"));
  await bannerShown();

  // The department cannot open the hotel's commercial service record.
  await selectValue("#role-picker", "department");
  await waitFor(has("Restricted commercial record."), "the department restriction");
  await selectValue("#role-picker", "innmetric");
  await waitFor(has("Open the proposed programme"), "the programme link");

  // 7. The last hotel step links to the proposed programme. Fixture numbers are unchanged.
  await clickButton("Open the proposed programme");
  await waitFor(`${stepIs(7)} && ${exists('[data-testid="proposal-tag"]')}`, "the proposed programme overview");
  await waitFor("document.querySelector('#role-picker').value === 'department'", "the department perspective");
  assert.ok((await text()).includes("AED 0.00"));
  await bannerShown();
  await evaluate("(() => { const c = document.querySelector('.walk-toggle input'); if (!c.checked) c.click(); })()");
  await waitFor(exists('[data-testid="presenter-notes"]'), "presenter notes");

  await next(8);
  await waitFor(has("Baseline versus observed"), "Hotel A cost comparison");
  for (const amount of ["AED 5,000.00", "AED 4,000.00", "AED 1,000.00"]) assert.ok((await text()).includes(amount), `Expected ${amount}`);
  await next(9);
  await next(10);
  await clickButton("Record this step's actions");
  await waitFor(has("Recorded 15 synthetic actions"), "the presenter shortcut up to the reservation");
  await next(11);
  await waitFor(has("Only collected cash can move."), "department funds");
  const reserved = await evaluate("[...document.querySelectorAll('.metric')].map((el) => el.innerText).join('|')");
  assert.ok(reserved.startsWith("AED 1,000.00|AED 200.00|AED 800.00"), `Cash, reserved and available were ${reserved}`);
  await clickButton("Record this step's actions");
  await waitFor(has("Recorded 3 synthetic actions"), "payment, direct payment and delivery");
  const paid = await evaluate("[...document.querySelectorAll('.metric')].map((el) => el.innerText).join('|')");
  assert.ok(paid.startsWith("AED 800.00|AED 0.00|AED 800.00"), `Cash, reserved and available were ${paid}`);
  const funds = await text();
  assert.ok(funds.includes("Hotel B direct payment · excluded from department pool"));
  assert.ok(funds.includes("AED 300.00"));
  await next(12);
  await waitFor(has("Outside the programme pool."), "the separate commercial book");
  assert.ok((await text()).includes("Not configured"));
  assert.equal(await evaluate(exists('[data-testid="proposal-tag"]')), false);

  // Reset restores the seed in under five seconds.
  const started = Date.now();
  await evaluate("[...document.querySelectorAll('button')].find((b) => b.innerText.includes('Reset demo data')).click()");
  await waitFor(`${has("Demo data reset to the seed.")} && ${stepIs(1)} && ${exists('[data-change="CH1"][data-change-status="proposed"]')}`, "the seed after reset");
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 5000, `Reset took ${elapsed} ms.`);
  await bannerShown();

  console.log(`Hotel story journey passed: 12 steps, sign-off gate, reversal, repeat checks, monitoring, programme numbers and reset in ${elapsed} ms.`);
});
