import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.DEMO_API_BASE ?? "http://localhost:80/api";
const sessionId = randomUUID();
const otherSessionId = randomUUID();

async function request(path, id, action, payload = {}, idempotencyKey) {
  const response = await fetch(`${base}${path}`, {
    method: action ? "POST" : "GET",
    headers: {
      "X-Demo-Session": id,
      ...(action ? { "Content-Type": "application/json" } : {}),
    },
    ...(action
      ? {
          body: JSON.stringify({
            action,
            payload,
            ...(idempotencyKey ? { idempotencyKey } : {}),
          }),
        }
      : {}),
  });
  const body = await response.json();
  return { response, body };
}

async function act(action, payload = {}, idempotencyKey) {
  const result = await request("/demo/actions", sessionId, action, payload, idempotencyKey);
  assert.equal(result.response.status, 200, `${action}: ${result.body.error ?? result.response.status}`);
  return result.body;
}

async function rejected(action, payload, status) {
  const result = await request("/demo/actions", sessionId, action, payload);
  assert.equal(result.response.status, status, `${action} should be rejected: ${result.body.error}`);
  return result.body;
}

const first = await request("/demo", sessionId);
assert.equal(first.response.status, 200);
assert.equal(first.body.state.dataMode, "synthetic");
assert.equal(first.body.state.savings.baselineMinor, 500000);
assert.equal(first.body.state.savings.observedMinor, 400000);

const second = await request("/demo", otherSessionId);
assert.equal(second.response.status, 200);
assert.equal(second.body.state.discovery.cursor, 0);
assert.equal(second.body.state.ledger.length, 0);

await rejected("collection.post", {}, 403);
await rejected("support.pay", {}, 403);

let state;
for (let index = 0; index < 4; index += 1) {
  state = await act("discovery.run");
}
assert.equal(state.state.discovery.records["hotel-a"].status, "candidate_booking_path_failure");
assert.deepEqual(state.state.discovery.records["hotel-a"].evidenceIds, ["A-route", "A-check-1", "A-check-2"]);
assert.equal(state.state.discovery.records["hotel-b"].status, "suggested_service_need");
assert.equal(state.state.discovery.records["hotel-b"].affordability, null);
assert.equal(state.state.discovery.records["hotel-c"].status, "no_discovery_evidence");
assert.equal(state.state.discovery.records["hotel-d"].status, "unverified");

state = await act("role.switch", { role: "hotel", hotelId: "hotel-a" });
assert.deepEqual(state.state.fixture.hotels.map((hotel) => hotel.id), ["hotel-a"]);
assert.equal(state.state.scope.canViewFinance, false);
assert.equal(state.state.support, null);
assert.equal(state.state.collection, null);
await rejected("need.confirm", {}, 403);
state = await act("role.switch", { role: "hotel", hotelId: "hotel-b" });
assert.deepEqual(state.state.fixture.hotels.map((hotel) => hotel.id), ["hotel-b"]);
assert.equal(state.state.savings, null);
assert.equal(state.state.need.confirmed, false);
state = await act("need.confirm");
assert.equal(state.state.need.confirmed, true);

state = await act("role.switch", { role: "innmetric" });
const checks = { scope: true, timing: true, channelMix: true, costs: true };
state = await act("savings.approve", { checks });
assert.equal(state.state.savings.status, "needs_joint_review");
assert.equal(state.state.ledger.length, 0);
state = await act("role.switch", { role: "department" });
state = await act("savings.approve", { checks });
assert.equal(state.state.savings.status, "verified");
assert.equal(state.state.ledger.length, 0);

state = await act("role.switch", { role: "innmetric" });
state = await act("collection.approve");
await rejected("collection.post", {}, 403);
state = await act("role.switch", { role: "department" });
await rejected("collection.post", {}, 409);
await rejected("collection.post", { amountMinor: 1 }, 400);
state = await act("collection.approve");
state = await act("collection.post");
assert.equal(state.state.ledger.length, 1);
assert.equal(state.state.ledger[0].amountMinor, 100000);

state = await act("role.switch", { role: "innmetric" });
state = await act("allocation.approve");
state = await act("support.approve");
state = await act("role.switch", { role: "department" });
state = await act("allocation.approve");
state = await act("support.approve");
state = await act("support.reserve");
assert.equal(state.state.ledger.length, 1);
assert.equal(state.state.reservations[0].amountMinor, 20000);
await rejected("support.pay", { amountMinor: 999999 }, 400);
state = await act("support.pay", {}, `integration-payment-${sessionId}`);
const postedSequence = state.version;
const replayResults = await Promise.all(
  Array.from({ length: 2 }, () =>
    request(
      "/demo/actions",
      sessionId,
      "support.pay",
      {},
      `integration-payment-${sessionId}`,
    ),
  ),
);
for (const replay of replayResults) {
  assert.equal(replay.response.status, 200);
  assert.equal(replay.body.version, postedSequence);
  assert.equal(replay.body.state.ledger.length, 2);
  assert.equal(replay.body.state.reservations[0].status, "paid");
}
assert.equal(
  replayResults[0].body.state.ledger.reduce(
    (sum, item) => sum + (item.direction === "in" ? item.amountMinor : -item.amountMinor),
    0,
  ),
  80000,
);

state = await act("role.switch", { role: "hotel", hotelId: "hotel-b" });
const beforeDirectPayment = state.state.ledger.length;
state = await act("support.directPayment");
assert.equal(state.state.ledger.length, beforeDirectPayment);
assert.equal(state.state.directPayments[0].amountMinor, 30000);

state = await act("role.switch", { role: "provider" });
assert.equal(state.state.scope.canViewPortfolio, false);
assert.equal(state.state.fixture.evidence.length, 0);
assert.equal(state.state.support.requestedSubsidyMinor, null);
assert.equal(state.state.support.hotelContributionMinor, null);
assert.deepEqual(state.state.fixture.allocationAuthorizations, []);
state = await act("delivery.mark");
assert.equal(state.state.delivery.status, "delivered");
assert.equal(state.state.outcome.confirmations.length, 0);
state = await act("role.switch", { role: "department" });
state = await act("outcome.confirm", { result: "completed" });
assert.equal(state.state.outcome.status, "awaiting_confirmations");
state = await act("role.switch", { role: "hotel", hotelId: "hotel-b" });
state = await act("outcome.confirm", { result: "completed" });
assert.equal(state.state.outcome.status, "awaiting_confirmations");
state = await act("role.switch", { role: "innmetric" });
state = await act("outcome.confirm", { result: "completed" });
assert.equal(state.state.outcome.status, "verified");
assert.equal(state.state.outcome.confirmations.length, 3);

const isolatedAfter = await request("/demo", otherSessionId);
assert.equal(isolatedAfter.body.state.discovery.cursor, 0);
assert.equal(isolatedAfter.body.state.ledger.length, 0);

const exported = await request("/demo/export", sessionId);
assert.equal(exported.response.status, 200);
assert.equal(exported.body.dataMode, "synthetic");
assert.ok(exported.body.events.length >= 20);
assert.ok(Array.isArray(exported.body.openItems));
assert.equal(exported.body.balances.cashMinor, 80000);
assert.equal(exported.body.balances.reservedMinor, 0);
assert.equal(exported.body.balances.availableMinor, 80000);
assert.equal(exported.body.state.reservations[0].sourceHotelId, "hotel-a");
assert.equal(exported.body.state.reservations[0].beneficiaryHotelId, "hotel-b");
assert.ok(exported.body.fixture.evidence.some((item) => item.id === "A-route"));

console.log("API integration passed: isolated sessions, scoped roles, approval gates, ledger, replay, delivery, outcome and export.");
