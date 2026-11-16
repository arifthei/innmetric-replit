import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";

/**
 * Minimal Chromium DevTools harness shared by the browser journeys.
 * Starts headless Chromium, opens the demo and hands page helpers to the journey.
 */
export async function runJourney(journey) {
const port = 19300 + Math.floor(Math.random() * 1000);
const profileDir = `/tmp/innmetric-demo-browser-${randomUUID()}`;
const browser = spawn(
  process.env.CHROMIUM_BIN ?? "chromium",
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--remote-allow-origins=*",
    "--window-size=1440,900",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
  ],
  { stdio: "ignore", detached: true },
);

let socket;

try {
  const devtoolsBase = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${devtoolsBase}/json/version`);
      ready = response.ok;
      if (ready) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, "Chromium DevTools did not start.");

  const targetResponse = await fetch(
    `${devtoolsBase}/json/new?${encodeURIComponent(process.env.DEMO_WEB_URL ?? "http://localhost:80/innmetric-pitch/")}`,
    { method: "PUT" },
  );
  assert.equal(targetResponse.status, 200);
  const target = await targetResponse.json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const waiting = pending.get(message.id);
    if (!waiting) return;
    pending.delete(message.id);
    if (message.error) waiting.reject(new Error(message.error.message));
    else waiting.resolve(message.result);
  });

  function send(method, params = {}) {
    const id = ++nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "Browser evaluation failed.");
    }
    return result.result.value;
  }

  async function waitFor(expression, description) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timed out waiting for ${description}.`);
  }

  async function clickButton(label) {
    const clicked = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')]
        .find((item) => item.innerText.trim().includes(${JSON.stringify(label)}));
      if (!button || button.disabled) return false;
      button.click();
      return true;
    })()`);
    assert.ok(clicked, `Could not click enabled button: ${label}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  async function selectValue(selector, value) {
    const selected = await evaluate(`(() => {
      const control = document.querySelector(${JSON.stringify(selector)});
      if (!control) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(control, ${JSON.stringify(value)});
      control.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    assert.ok(selected, `Select was not found: ${selector}`);
    await waitFor(
      `document.querySelector(${JSON.stringify(selector)})?.value === ${JSON.stringify(value)}`,
      `${selector} set to ${value}`,
    );
  }

  await send("Runtime.enable");
  await send("Page.enable");
  await journey({ send, evaluate, waitFor, clickButton, selectValue });
} finally {
  socket?.close();
  if (browser.exitCode === null) {
    const exited = new Promise((resolve) => browser.once("exit", resolve));
    try {
      process.kill(-browser.pid, "SIGTERM");
    } catch {
      browser.kill("SIGTERM");
    }
    await Promise.race([
      exited,
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
    if (browser.exitCode === null) {
      try {
        process.kill(-browser.pid, "SIGKILL");
      } catch {}
    }
  }
  await rm(profileDir, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 100,
  });
}
}
