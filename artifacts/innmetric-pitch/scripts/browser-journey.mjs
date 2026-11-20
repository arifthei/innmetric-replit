import assert from "node:assert/strict";
import { runJourney } from "./cdp-harness.mjs";

await runJourney(async ({ evaluate, waitFor, clickButton, selectValue }) => {
  await waitFor(
    "document.body.innerText.includes('Demonstration data. Not a live service or government programme.') && Boolean(document.querySelector('#role-picker'))",
    "the demo shell with its persistent banner",
  );
  // The guided walkthrough opens on its first step. The role-view journey below starts from the overview as InnMetric.
  await clickButton("Programme overview");
  await selectValue("#role-picker", "innmetric");
  await waitFor(
    "document.querySelector('main h1')?.innerText === 'How one hotel’s savings can help another.'",
    "the InnMetric demo overview",
  );

  await clickButton("Discovery");
  for (let candidate = 0; candidate < 4; candidate += 1) {
    await clickButton("Process next candidate");
    await waitFor(
      `document.body.innerText.includes(${JSON.stringify(`${candidate + 1} / 4 processed`)})`,
      `discovery candidate ${candidate + 1}`,
    );
  }
  await waitFor(
    "document.body.innerText.includes('suggested service need') && document.body.innerText.includes('unverified')",
    "all four bounded discovery outcomes",
  );

  await selectValue("#role-picker", "hotel");
  await waitFor("Boolean(document.querySelector('[aria-label=\"Hotel representative perspective\"]'))", "hotel selector");
  await selectValue('[aria-label=\"Hotel representative perspective\"]', "hotel-a");
  await clickButton("Hotel cases");
  await waitFor("document.body.innerText.includes('Baseline versus observed')", "Hotel A case details");
  const hotelAText = await evaluate("document.body.innerText");
  assert.ok(!hotelAText.includes("Hotel B · service need"));

  await selectValue('[aria-label=\"Hotel representative perspective\"]', "hotel-b");
  await clickButton("Hotel cases");
  await waitFor("document.body.innerText.includes('Review signal, then confirmation')", "Hotel B case details");
  await clickButton("Confirm as Hotel B");
  await waitFor("document.body.innerText.includes('Hotel confirmed')", "Hotel B confirmation");

  await selectValue('[aria-label=\"Hotel representative perspective\"]', "hotel-a");
  await clickButton("Department funds");
  await waitFor("document.body.innerText.includes('Restricted financial view.')", "hotel financial restriction");

  await selectValue('[aria-label=\"Hotel representative perspective\"]', "hotel-c");
  await clickButton("InnMetric services");
  await waitFor("document.body.innerText.includes('Commercial conversation')", "Hotel C commercial view");
  assert.ok((await evaluate("document.body.innerText")).includes("Not discovery"));

  await selectValue("#role-picker", "provider");
  await clickButton("Discovery");
  await waitFor("document.body.innerText.includes('Discovery is not part of your assignment.')", "provider discovery restriction");
  await clickButton("Programme support");
  await waitFor("document.body.innerText.includes('Not shared with provider')", "provider assigned work");
  const providerText = await evaluate("document.body.innerText");
  assert.ok(!providerText.includes("Hotel A attributable funds"));
  assert.ok(!providerText.includes("Hotel direct contribution"));

  await selectValue("#role-picker", "department");
  await clickButton("Department funds");
  await waitFor("document.body.innerText.includes('Collection approval is separate')", "department fund controls");
  assert.ok((await evaluate("document.body.innerText")).includes("AED"));

  console.log("Browser journey passed: discovery plus Hotel A/B/C, provider and department perspectives.");
});
