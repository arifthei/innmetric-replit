import assert from "node:assert/strict";
import { runJourney } from "./cdp-harness.mjs";

const BANNER = "Demonstration data. Not a live service or government programme.";
const KAKI = "rgb(138, 75, 46)";
// 6 hotel service steps and 14 proposed programme steps.
const TOTAL_STEPS = 20;

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
    `/^STEP ${number} OF ${TOTAL_STEPS}\\b/.test((document.querySelector('.walk-count')?.innerText ?? '').toUpperCase())`;
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

  // What the hotel gets, controls and can buy: both commercial options stay unset.
  const terms = await sectionText('[data-testid="hotel-terms"]');
  for (const phrase of ["What the hotel gets", "What the hotel controls", "Commercial options", "OTA 1 price difference"]) {
    assert.ok(terms.includes(phrase), `Hotel terms should include ${phrase}`);
  }
  assert.equal(await evaluate(`(document.querySelector('[data-testid="hotel-terms"]').innerText.match(/Not configured/g) ?? []).length`), 2);

  const metrics = () => evaluate("[...document.querySelectorAll('.metric')].map((el) => el.innerText).join('|')");
  const roleIs = (role, hotel) =>
    waitFor(
      `document.querySelector('#role-picker')?.value === ${JSON.stringify(role)}` +
        (hotel ? ` && document.querySelector('[aria-label="Hotel representative perspective"]')?.value === ${JSON.stringify(hotel)}` : ""),
      `the ${role}${hotel ? ` ${hotel}` : ""} perspective`,
    );
  const record = async (count) => {
    await clickButton("Record this step's actions");
    await waitFor(has(`Recorded ${count} synthetic action${count === 1 ? "" : "s"}`), `${count} recorded action(s)`);
  };
  const outcomeIs = (status, confirmations) =>
    waitFor(
      `(document.querySelector('[data-testid="outcome-status"]')?.innerText ?? '').toLowerCase() === ${JSON.stringify(`${status} · ${confirmations} of 3 confirmations`)}`,
      `outcome ${status}, ${confirmations} of 3`,
    );

  // 7. The last hotel step links to the proposed programme. Who is who separates role types from hotels.
  await clickButton("Open the proposed programme");
  await waitFor(`${stepIs(7)} && ${exists('[data-testid="proposal-tag"]')}`, "the proposed programme overview");
  await roleIs("department");
  assert.ok((await text()).includes("AED 0.00"));
  const who = await sectionText('[data-testid="who-is-who"]');
  for (const name of ["Role types", "Hotel identities", "Service provider", "Hotel A", "Hotel B", "Hotel C"]) assert.ok(who.includes(name), `Who is who should list ${name}`);
  await bannerShown();
  await evaluate("(() => { const c = document.querySelector('.walk-toggle input'); if (!c.checked) c.click(); })()");
  await waitFor(exists('[data-testid="presenter-notes"]'), "presenter notes");

  // 8. InnMetric runs discovery.
  await next(8);
  await roleIs("innmetric");
  await record(4);
  await waitFor(has("4 / 4 processed"), "the completed discovery queue");

  // 9. Hotel A is the source property and sees only its own case.
  await next(9);
  await roleIs("hotel", "hotel-a");
  await waitFor(has("Baseline versus observed"), "Hotel A cost comparison");
  for (const amount of ["AED 5,000.00", "AED 4,000.00", "AED 1,000.00"]) assert.ok((await text()).includes(amount), `Expected ${amount}`);
  assert.ok(!(await text()).includes("Review signal, then confirmation"), "Hotel A must not see Hotel B's case");
  assert.ok((await sectionText(".walk-role")).includes("Hotel identity: Hotel A"));

  // 10. Hotel B confirms its own need.
  await next(10);
  await roleIs("hotel", "hotel-b");
  await record(1);
  await waitFor(has("Hotel confirmed"), "Hotel B's confirmed need");

  // 11. Savings are verified jointly but create no cash.
  await next(11);
  await roleIs("innmetric");
  await record(2);
  await waitFor(has("Jointly verified"), "joint savings verification");

  // 12. The department receipt creates AED 1,000 of pool cash.
  await next(12);
  await roleIs("department");
  await record(3);
  await waitFor(`${has("Only collected cash can move.")} && document.querySelectorAll('[data-testid="cash-sequence"] li[data-done="true"]').length === 4`, "the first four cash steps");
  assert.ok((await metrics()).startsWith("AED 1,000.00|AED 0.00|AED 1,000.00"), `Cash after receipt was ${await metrics()}`);

  // 13. The provider sees its quote but no funding amounts.
  await next(13);
  await roleIs("provider");
  await waitFor(`${has("provider quote AED 500.00")} && ${has("Not shared with provider")}`, "the provider's quote view");

  // 14. Joint approvals and the department reservation.
  await next(14);
  await roleIs("department");
  await record(5);
  await waitFor(has("reserved"), "the reservation");

  // 15. AED 200 from the pool and AED 300 directly from Hotel B.
  await next(15);
  await roleIs("department");
  await waitFor(has("Only collected cash can move."), "department funds");
  assert.ok((await metrics()).startsWith("AED 1,000.00|AED 200.00|AED 800.00"), `Cash, reserved and available were ${await metrics()}`);
  await record(2);
  await waitFor(`document.querySelectorAll('[data-testid="cash-sequence"] li[data-done="true"]').length === 8`, "every cash step done");
  assert.ok((await metrics()).startsWith("AED 800.00|AED 0.00|AED 800.00"), `Cash, reserved and available were ${await metrics()}`);
  const funds = await text();
  assert.ok(funds.includes("Hotel B direct payment · excluded from department pool"));
  assert.ok(funds.includes("AED 300.00"));
  assert.ok(funds.includes("InnMetric's fees are a separate commercial book"));

  // 16. Delivery is recorded; the outcome waits for three confirmations.
  await next(16);
  await roleIs("provider");
  await record(1);
  await outcomeIs("awaiting confirmations", 0);

  // 17. InnMetric and the department confirm: two of three, still open.
  await next(17);
  await roleIs("department");
  await record(2);
  await outcomeIs("awaiting confirmations", 2);

  // 18. Hotel B's matching confirmation verifies the outcome, and the audit shows the change.
  await next(18);
  await roleIs("hotel", "hotel-b");
  await record(1);
  await outcomeIs("verified", 3);
  assert.equal(await evaluate(`document.querySelectorAll('[data-audit-action="outcome.confirm"]').length`), 3);
  assert.equal(await evaluate(`document.querySelectorAll('[data-audit-action="outcome.confirm"][data-audit-status="verified"]').length`), 1);
  assert.equal(await evaluate(`document.querySelectorAll('[data-audit-action="delivery.mark"]').length`), 1);

  // 19. Hotel C has its own records and no access to Hotel B's case.
  await next(19);
  await roleIs("hotel", "hotel-c");
  await record(1);
  await waitFor(`${has("Commercial conversation")} && ${has("requested")}`, "Hotel C's own commercial request");
  await clickButton("Programme support");
  await waitFor(has("Assigned case only."), "Hotel C's restricted support view");
  await clickButton("Department funds");
  await waitFor(has("Restricted financial view."), "Hotel C's restricted funds view");

  // 20. Two separate books.
  await next(20);
  await roleIs("innmetric");
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

  console.log(`Hotel story journey passed: ${TOTAL_STEPS} steps, sign-off gate, reversal, repeat checks, monitoring, every programme perspective, three-party outcome, Hotel C scoping and reset in ${elapsed} ms.`);
});
