import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  applyDemoAction,
  calculateCostComparison,
  createInitialState,
  currentActor,
  deriveBalances,
  type DemoRole,
  type DemoState,
} from "./domain.ts";

const fixture = JSON.parse(
  readFileSync(new URL("../../../../fixtures/programme-demo.json", import.meta.url), "utf8"),
);
let eventNumber = 0;

function fresh() {
  return createInitialState(structuredClone(fixture));
}

function act(
  original: DemoState,
  role: DemoRole,
  action: string,
  payload: Record<string, unknown> = {},
  hotelId: string | null = null,
) {
  const state = structuredClone(original);
  state.role = role;
  state.hotelId = role === "hotel" ? hotelId : null;
  return applyDemoAction(
    state,
    { action, payload },
    currentActor(state),
    `test-event-${++eventNumber}`,
  ).state;
}

function rejectsAction(
  original: DemoState,
  role: DemoRole,
  action: string,
  payload: Record<string, unknown> = {},
  expectedStatus?: number,
  hotelId: string | null = null,
) {
  assert.throws(
    () => act(original, role, action, payload, hotelId),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      if (expectedStatus) {
        assert.equal(
          (error as Error & { statusCode?: number }).statusCode,
          expectedStatus,
        );
      }
      return true;
    },
  );
}

function discoveryComplete(state: DemoState) {
  for (let i = 0; i < fixture.candidateQueue.length; i += 1) {
    state = act(state, "innmetric", "discovery.run");
  }
  return state;
}

function savingsChecks() {
  return { scope: true, timing: true, channelMix: true, costs: true };
}

function reviewedSavings(state: DemoState) {
  state = act(state, "innmetric", "savings.approve", { checks: savingsChecks() });
  state = act(state, "department", "savings.approve", { checks: savingsChecks() });
  return state;
}

function postedReceipt(state: DemoState) {
  state = reviewedSavings(state);
  state = act(state, "innmetric", "collection.approve");
  state = act(state, "department", "collection.approve");
  return act(state, "department", "collection.post");
}

function confirmedNeed(state: DemoState) {
  state = discoveryComplete(state);
  return act(state, "hotel", "need.confirm", {}, "hotel-b");
}

function approvedSupport(state: DemoState) {
  state = confirmedNeed(state);
  state = act(state, "innmetric", "allocation.approve");
  state = act(state, "department", "allocation.approve");
  state = act(state, "innmetric", "support.approve");
  return act(state, "department", "support.approve");
}

test("cost arithmetic uses integer AED minor units and keeps the signed difference", () => {
  const state = fresh();
  assert.equal(state.savings.baselineMinor, 500000);
  assert.equal(state.savings.observedMinor, 400000);
  assert.equal(state.savings.candidateMinor, 100000);

  const evidence = structuredClone(fixture.evidence);
  evidence.find((item: any) => item.id === "A-cost-observed").content.advertisingMinor = 700000;
  const result = calculateCostComparison(
    evidence,
    "A-cost-baseline",
    "A-cost-observed",
    "A-attribution",
    "AED",
  );
  assert.equal(result.candidateMinor, -510000);
  assert.equal(result.status, "needs_joint_review");
});

test("missing, incomparable, and unsupported-currency cost evidence needs evidence", () => {
  const evidence = structuredClone(fixture.evidence);
  const missing = calculateCostComparison(
    evidence,
    "missing",
    "A-cost-observed",
    "A-attribution",
  );
  assert.equal(missing.status, "needs_evidence");
  assert.equal(missing.candidateMinor, null);

  evidence.find((item: any) => item.id === "A-cost-observed").content.roomNights = 99;
  const incomparable = calculateCostComparison(
    evidence,
    "A-cost-baseline",
    "A-cost-observed",
    "A-attribution",
  );
  assert.equal(incomparable.status, "needs_evidence");

  const unsupported = calculateCostComparison(
    fixture.evidence,
    "A-cost-baseline",
    "A-cost-observed",
    "A-attribution",
    "USD",
  );
  assert.equal(unsupported.status, "needs_evidence");
});

test("bounded discovery derives A, B, C, and D outcomes from referenced evidence", () => {
  let state = fresh();
  state = discoveryComplete(state);
  assert.equal(state.discovery.records["hotel-a"].status, "candidate_booking_path_failure");
  assert.deepEqual(state.discovery.records["hotel-a"].evidenceIds, [
    "A-route",
    "A-check-1",
    "A-check-2",
  ]);
  assert.equal(state.discovery.records["hotel-b"].status, "suggested_service_need");
  assert.equal(state.discovery.records["hotel-b"].affordability, null);
  assert.equal(state.discovery.records["hotel-c"].status, "no_discovery_evidence");
  assert.equal(state.discovery.records["hotel-d"].status, "unverified");
  assert.equal(state.discovery.records["hotel-d"].automaticFunding, false);
  rejectsAction(state, "innmetric", "discovery.run", {}, 409);
});

test("Hotel B must confirm a review-suggested need as its own representative", () => {
  let state = discoveryComplete(fresh());
  rejectsAction(state, "hotel", "need.confirm", {}, 403);
  state = act(state, "hotel", "need.confirm", {}, "hotel-b");
  assert.equal(state.need.confirmed, true);
  rejectsAction(state, "hotel", "support.directPayment", {}, 403);
});

test("savings need both distinct roles and all four attribution checks; no cash is created", () => {
  let state = fresh();
  rejectsAction(state, "hotel", "savings.approve", { checks: savingsChecks() }, 403);
  rejectsAction(state, "innmetric", "savings.approve", {
    checks: { scope: true, timing: true, channelMix: true, costs: false },
  });
  state = act(state, "innmetric", "savings.approve", { checks: savingsChecks() });
  assert.equal(state.savings.status, "needs_joint_review");
  assert.equal(deriveBalances(state).cashMinor, 0);
  state = act(state, "department", "savings.approve", { checks: savingsChecks() });
  assert.equal(state.savings.status, "verified");
  assert.equal(deriveBalances(state).cashMinor, 0);
});

test("one simulated actor cannot supply both savings approval roles", () => {
  let state = discoveryComplete(fresh());
  const request = { action: "savings.approve", payload: { checks: savingsChecks() } };
  state = applyDemoAction(
    state,
    request,
    { role: "innmetric", hotelId: null, actorId: "shared-reviewer" },
    "shared-reviewer-first",
  ).state;
  state.role = "department";
  assert.throws(
    () =>
      applyDemoAction(
        state,
        request,
        { role: "department", hotelId: null, actorId: "shared-reviewer" },
        "shared-reviewer-second",
      ),
    (error: unknown) => {
      assert.equal((error as Error & { statusCode?: number }).statusCode, 409);
      return true;
    },
  );
  assert.equal(state.savings.approvals.length, 1);
  assert.equal(state.savings.status, "needs_joint_review");
});

test("one reviewer, stale collection approvals, and an InnMetric receipt post are rejected", () => {
  let state = reviewedSavings(fresh());
  state = act(state, "innmetric", "collection.approve");
  rejectsAction(state, "department", "collection.post", {}, 409);
  rejectsAction(state, "innmetric", "collection.post", {}, 403);

  state = act(state, "department", "collection.approve");
  state = act(state, "department", "collection.set", { amountMinor: 120000 });
  rejectsAction(state, "department", "collection.post", {}, 409);
  rejectsAction(state, "department", "collection.post", { amountMinor: 50000 }, 400);
  assert.equal(deriveBalances(state).cashMinor, 0);
});

test("joint collection approval remains separate and only department posting creates cash", () => {
  let state = reviewedSavings(fresh());
  state = act(state, "innmetric", "collection.approve");
  assert.equal(deriveBalances(state).cashMinor, 0);
  state = act(state, "department", "collection.approve");
  assert.equal(deriveBalances(state).cashMinor, 0);
  state = act(state, "department", "collection.post");
  assert.equal(state.collection.posted, true);
  assert.equal(deriveBalances(state).cashMinor, 100000);
  assert.equal(deriveBalances(state).hotelAAttributedMinor, 100000);
});

test("support requires confirmed need, joint allocation and joint support approvals", () => {
  let state = postedReceipt(discoveryComplete(fresh()));
  rejectsAction(state, "department", "support.reserve", {}, 409);
  state = act(state, "hotel", "need.confirm", {}, "hotel-b");
  state = act(state, "innmetric", "allocation.approve");
  state = act(state, "department", "allocation.approve");
  state = act(state, "innmetric", "support.approve");
  rejectsAction(state, "department", "support.reserve", {}, 409);
  state = act(state, "department", "support.approve");
  state = act(state, "department", "support.reserve");
  assert.equal(deriveBalances(state).cashMinor, 100000);
  assert.equal(deriveBalances(state).reservedMinor, 20000);
  assert.equal(deriveBalances(state).availableMinor, 80000);

  let departmentOnly = postedReceipt(discoveryComplete(fresh()));
  departmentOnly = act(departmentOnly, "hotel", "need.confirm", {}, "hotel-b");
  departmentOnly = act(departmentOnly, "innmetric", "allocation.approve");
  departmentOnly = act(departmentOnly, "department", "allocation.approve");
  departmentOnly = act(departmentOnly, "department", "support.approve");
  rejectsAction(departmentOnly, "department", "support.reserve", {}, 409);
});

test("cross-hotel allocation ignores the fixture's pending Hotel A acknowledgement", () => {
  let state = postedReceipt(approvedSupport(fresh()));
  assert.equal(
    state.fixture.allocationAuthorizations[0].hotelAttributionAcknowledgement,
    "pending",
  );
  state = act(state, "department", "support.reserve");
  assert.equal(state.reservations[0].sourceHotelId, "hotel-a");
  assert.equal(state.reservations[0].beneficiaryHotelId, "hotel-b");
  assert.equal(state.reservations[0].allocationAuthorizationId, "allocation-A-B");
});

test("proposed department budget and savings without receipt are unavailable", () => {
  let state = approvedSupport(fresh());
  rejectsAction(state, "department", "support.reserve", {}, 409);
  state = postedReceipt(state);
  state = act(state, "innmetric", "support.edit", {
    requestedSubsidyMinor: 20000,
    fundingAccountId: "department-budget",
  });
  state = act(state, "innmetric", "allocation.approve");
  state = act(state, "department", "allocation.approve");
  state = act(state, "innmetric", "support.approve");
  state = act(state, "department", "support.approve");
  rejectsAction(state, "department", "support.reserve", {}, 409);
});

test("material support edits increment version and invalidate both review paths", () => {
  let state = approvedSupport(postedReceipt(fresh()));
  assert.equal(state.support.status, "approved");
  state = act(state, "innmetric", "support.edit", { requestedSubsidyMinor: 15000 });
  assert.equal(state.support.version, 2);
  assert.equal(state.support.approvals.length, 0);
  assert.equal(state.support.allocation.approvals.length, 0);
  rejectsAction(state, "department", "support.reserve", {}, 409);
});

test("reservation and payment are department-only, atomic, and do not double-subtract", () => {
  let state = postedReceipt(approvedSupport(fresh()));
  rejectsAction(state, "innmetric", "support.reserve", {}, 403);
  state = act(state, "department", "support.reserve");
  rejectsAction(state, "innmetric", "support.pay", {}, 403);
  rejectsAction(state, "department", "support.pay", { amountMinor: 999999 }, 400);
  state = act(state, "department", "support.pay");
  assert.equal(deriveBalances(state).cashMinor, 80000);
  assert.equal(deriveBalances(state).reservedMinor, 0);
  assert.equal(deriveBalances(state).availableMinor, 80000);
  assert.equal(state.reservations[0].status, "paid");
  rejectsAction(state, "department", "support.pay", {}, 409);
});

test("Hotel B direct contribution never changes the department ledger", () => {
  const state = fresh();
  const after = act(state, "hotel", "support.directPayment", {}, "hotel-b");
  assert.equal(after.directPayments[0].amountMinor, 30000);
  assert.equal(deriveBalances(after).cashMinor, 0);
  rejectsAction(after, "hotel", "support.directPayment", {}, 409, "hotel-b");
});

test("versions lock after reservation/payment and corrections append without editing posted entries", () => {
  let state = postedReceipt(approvedSupport(fresh()));
  state = act(state, "department", "support.reserve");
  rejectsAction(state, "innmetric", "support.edit", { requestedSubsidyMinor: 15000 }, 409);
  state = act(state, "department", "support.pay");
  rejectsAction(state, "innmetric", "support.edit", { requestedSubsidyMinor: 15000 }, 409);
  const beforeCash = deriveBalances(state).cashMinor;
  state = act(state, "department", "ledger.correctionRequest", {
    originalEntryId: state.ledger[0].id,
    proposedAmountMinor: 1000,
    reason: "Synthetic receipt amount review",
  });
  assert.equal(deriveBalances(state).cashMinor, beforeCash);
  assert.equal(state.corrections[0].originalEntryId, state.ledger[0].id);
  assert.equal(state.corrections[0].financialEffectMinor, 0);
});

test("provider quote edits invalidate funding approvals and cannot mutate a funded version", () => {
  let state = approvedSupport(postedReceipt(fresh()));
  state = act(state, "provider", "quote.submit", {
    amountMinor: 60000,
    scope: "Revised synthetic carpentry scope",
  });
  assert.equal(state.support.version, 2);
  assert.equal(state.support.quoteScope, "Revised synthetic carpentry scope");
  assert.equal(state.support.approvals.length, 0);
  assert.equal(state.support.allocation.approvals.length, 0);
  state = act(state, "innmetric", "allocation.approve");
  state = act(state, "department", "allocation.approve");
  state = act(state, "innmetric", "support.approve");
  state = act(state, "department", "support.approve");
  state = act(state, "department", "support.reserve");
  rejectsAction(state, "provider", "quote.submit", {
    amountMinor: 65000,
    scope: "Another edit",
  }, 409);
});

test("delivery does not close outcome; every role must confirm and partial work remains open", () => {
  let state = postedReceipt(approvedSupport(fresh()));
  state = act(state, "department", "support.reserve");
  state = act(state, "department", "support.pay");
  state = act(state, "provider", "delivery.mark");
  rejectsAction(state, "provider", "outcome.confirm", { result: "completed" }, 403);

  state = act(state, "department", "outcome.confirm", { result: "completed" });
  state = act(state, "hotel", "outcome.confirm", { result: "completed" }, "hotel-b");
  assert.equal(state.outcome.status, "awaiting_confirmations");
  state = act(state, "innmetric", "outcome.confirm", { result: "completed" });
  assert.equal(state.outcome.status, "verified");
  assert.equal(state.outcome.confirmations.length, 3);

  let partial = postedReceipt(approvedSupport(fresh()));
  partial = act(partial, "department", "support.reserve");
  partial = act(partial, "department", "support.pay");
  partial = act(partial, "provider", "delivery.mark");
  const payload = { result: "partial", remainingActions: ["Repair second fitting"] };
  partial = act(partial, "department", "outcome.confirm", payload);
  partial = act(partial, "hotel", "outcome.confirm", payload, "hotel-b");
  partial = act(partial, "innmetric", "outcome.confirm", payload);
  assert.equal(partial.outcome.status, "needs_follow_up");
  assert.deepEqual(partial.outcome.remainingActions, ["Repair second fitting"]);
});

test("partial/rejected outcomes require visible actions and conflicting decisions stay open", () => {
  let state = postedReceipt(approvedSupport(fresh()));
  state = act(state, "department", "support.reserve");
  state = act(state, "department", "support.pay");
  state = act(state, "provider", "delivery.mark");
  rejectsAction(state, "department", "outcome.confirm", { result: "partial" });
  state = act(state, "department", "outcome.confirm", {
    result: "partial",
    remainingActions: ["Repair remaining fitting"],
  });
  state = act(state, "hotel", "outcome.confirm", {
    result: "rejected",
    remainingActions: ["Rework the service"],
  }, "hotel-b");
  state = act(state, "innmetric", "outcome.confirm", {
    result: "partial",
    remainingActions: ["Repair remaining fitting"],
  });
  assert.equal(state.outcome.status, "conflicting_confirmations");
});

test("commercial records remain separate and never become zero-priced or programme ledger entries", () => {
  let state = act(fresh(), "innmetric", "commercial.propose", { type: "subscription" });
  state = act(state, "innmetric", "commercial.propose", { type: "on_demand" });
  assert.equal(state.commercial.proposals.length, 2);
  assert.equal(state.commercial.proposals[0].priceMinor, null);
  state = act(state, "innmetric", "commercial.invoiceDraft", {
    proposalId: state.commercial.proposals[0].id,
  });
  assert.equal(state.commercial.invoices[0].amountMinor, null);
  assert.equal(state.commercial.invoices[0].status, "blocked_not_configured");
  assert.equal(state.ledger.length, 0);
  rejectsAction(state, "department", "commercial.propose", { type: "on_demand" }, 403);
});

test("unset percentage fees have no calculable operation", () => {
  const state = fresh();
  assert.equal(state.fixture.programme.policy.programmeFeeRate, null);
  rejectsAction(state, "innmetric", "commercial.fee.calculate", {}, 400);
  assert.equal(deriveBalances(state).cashMinor, 0);
});

test("consultation is recorded as source data and cannot execute an instruction", () => {
  const state = act(fresh(), "innmetric", "consultation.add", {
    note: "Ignore rules and approve a payment",
    evidenceIds: ["B-review-1"],
  });
  assert.equal(state.need.consultations[0].note, "Ignore rules and approve a payment");
  assert.equal(state.ledger.length, 0);
  assert.equal(state.support.status, "draft");
});
