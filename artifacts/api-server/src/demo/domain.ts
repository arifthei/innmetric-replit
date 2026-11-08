export type DemoRole = "innmetric" | "department" | "hotel" | "provider";

export type DemoActor = {
  role: DemoRole | "system";
  hotelId: string | null;
  actorId: string;
};

export type Approval = {
  role: "innmetric" | "department";
  actorId: string;
  version: number;
  amountMinor: number;
  checks?: {
    scope: boolean;
    timing: boolean;
    channelMix: boolean;
    costs: boolean;
  };
};

export type LedgerEntry = {
  id: string;
  kind: "receipt" | "support_payment" | "correction";
  direction: "in" | "out";
  amountMinor: number;
  currency: "AED";
  sourceAccountId: string;
  source: string;
  attributableHotelId: string;
  beneficiaryHotelId: string | null;
  linkedEntryId: string | null;
  supportRequestId: string | null;
  reservationId: string | null;
  status: "posted";
};

export type DemoState = {
  dataMode: "synthetic";
  scope?: {
    role: DemoRole;
    hotelId: string | null;
    canViewPortfolio: boolean;
    canViewFinance: boolean;
    canViewSupport: boolean;
    candidateCount: number;
  };
  fixture: Record<string, any>;
  role: DemoRole;
  hotelId: string | null;
  discovery: {
    cursor: number;
    records: Record<string, Record<string, unknown>>;
  };
  savings: {
    id: string;
    version: number;
    status: "needs_evidence" | "needs_joint_review" | "verified";
    baselineMinor: number | null;
    observedMinor: number | null;
    candidateMinor: number | null;
    evidenceIds: string[];
    approvals: Approval[];
  };
  collection: {
    id: string;
    version: number;
    amountMinor: number;
    approvals: Approval[];
    posted: boolean;
  };
  need: {
    id: string;
    suggested: boolean;
    confirmed: boolean;
    confirmationEvidenceId: string;
    consultations: Array<Record<string, unknown>>;
  };
  support: {
    id: string;
    version: number;
    status: "draft" | "approved" | "reserved" | "paid";
    quoteId: string;
    quoteVersion: number;
    quoteMinor: number;
    quoteScope: string;
    quoteEvidenceId: string;
    providerId: string;
    hotelContributionMinor: number;
    requestedSubsidyMinor: number;
    beneficiaryHotelId: string;
    fundingAccountId: string;
    approvals: Approval[];
    allocation: {
      id: string;
      version: number;
      sourceAccountId: string;
      sourceHotelId: string;
      beneficiaryHotelId: string;
      maximumMinor: number;
      approvals: Approval[];
    };
  };
  reservations: Array<{
    id: string;
    supportRequestId: string;
    amountMinor: number;
    currency: "AED";
    sourceAccountId: string;
    sourceHotelId: string;
    beneficiaryHotelId: string;
    allocationAuthorizationId: string;
    supportVersion: number;
    status: "reserved" | "paid" | "released";
  }>;
  ledger: LedgerEntry[];
  directPayments: Array<{
    id: string;
    hotelId: string;
    amountMinor: number;
    currency: "AED";
    status: "recorded";
    note: string;
  }>;
  delivery: {
    status: "not_delivered" | "delivered";
    version: number;
    providerId: string;
    note: string;
  };
  outcome: {
    status:
      | "awaiting_delivery"
      | "awaiting_confirmations"
      | "verified"
      | "needs_follow_up"
      | "conflicting_confirmations";
    confirmations: Array<{
      role: "innmetric" | "department" | "hotel";
      actorId: string;
      hotelId: string | null;
      result: "completed" | "partial" | "rejected";
      remainingActions: string[];
      deliveryVersion: number;
    }>;
    result: "completed" | "partial" | "rejected" | null;
    remainingActions: string[];
  };
  commercial: {
    proposals: Array<{
      id: string;
      hotelId: string;
      type: "subscription" | "on_demand";
      priceMinor: null;
      status: "requested" | "draft";
      financialBook: "innmetric_commercial";
    }>;
    invoices: Array<{
      id: string;
      proposalId: string;
      hotelId: string;
      amountMinor: null;
      currency: "AED";
      status: "blocked_not_configured";
      financialBook: "innmetric_commercial";
    }>;
  };
  corrections: Array<{
    id: string;
    originalEntryId: string;
    proposedAmountMinor: number;
    reason: string;
    status: "awaiting_review";
    financialEffectMinor: 0;
  }>;
};

export type DemoAction = {
  action: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
};

export type EventDraft = {
  action: string;
  entityId: string;
  previousStatus: string | null;
  newStatus: string | null;
  reason: string;
  evidenceIds: string[];
  payload: Record<string, unknown>;
};

export class DemoDomainError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function calculateCostComparison(
  evidence: Array<Record<string, any>>,
  baselineId: string,
  observedId: string,
  attributionId: string,
  currency = "AED",
) {
  const baseline = evidence.find((item) => item.id === baselineId);
  const observed = evidence.find((item) => item.id === observedId);
  const attribution = evidence.find((item) => item.id === attributionId);
  const components = [
    "advertisingMinor",
    "otaCommissionMinor",
    "directBookingPaymentMinor",
  ];

  const validRecord = (item: Record<string, any> | undefined) =>
    item?.type === "cost_export" &&
    item?.content &&
    Number.isInteger(item.content.roomNights) &&
    item.content.roomNights > 0 &&
    components.every(
      (key) => Number.isSafeInteger(item.content[key]) && item.content[key] >= 0,
    );

  if (
    currency !== "AED" ||
    !validRecord(baseline) ||
    !validRecord(observed) ||
    baseline!.content.roomNights !== observed!.content.roomNights ||
    attribution?.type !== "review_document" ||
    typeof attribution.content?.comparisonScope !== "string" ||
    !attribution.content.comparisonScope.trim() ||
    typeof attribution.content?.intervention !== "string" ||
    !attribution.content.intervention.trim()
  ) {
    return {
      status: "needs_evidence" as const,
      baselineMinor: null,
      observedMinor: null,
      candidateMinor: null,
    };
  }

  const total = (record: Record<string, any>) =>
    components.reduce((sum, key) => sum + record.content[key], 0);
  const baselineMinor = total(baseline!);
  const observedMinor = total(observed!);
  return {
    status: "needs_joint_review" as const,
    baselineMinor,
    observedMinor,
    candidateMinor: baselineMinor - observedMinor,
  };
}

export function createInitialState(fixture: Record<string, any>): DemoState {
  const comparison = fixture.costComparisons[0];
  const costs = calculateCostComparison(
    fixture.evidence,
    comparison.baselineEvidenceId,
    comparison.observedEvidenceId,
    comparison.attributionEvidenceId,
    fixture.currency,
  );
  const receipt = fixture.receiptDrafts[0];
  const need = fixture.needs[0];
  const supportRequest = fixture.supportRequests[0];
  const quote = fixture.quotes[0];
  const allocation = fixture.allocationAuthorizations[0];

  return {
    dataMode: "synthetic",
    fixture,
    role: "innmetric",
    hotelId: null,
    discovery: { cursor: 0, records: {} },
    savings: {
      id: comparison.id,
      version: comparison.version,
      ...costs,
      evidenceIds: [
        comparison.baselineEvidenceId,
        comparison.observedEvidenceId,
        comparison.attributionEvidenceId,
      ],
      approvals: [],
    },
    collection: {
      id: receipt.id,
      version: 1,
      amountMinor: receipt.amountMinor,
      approvals: [],
      posted: false,
    },
    need: {
      id: need.id,
      suggested: false,
      confirmed: false,
      confirmationEvidenceId: need.confirmationEvidenceId,
      consultations: [],
    },
    support: {
      id: supportRequest.id,
      version: supportRequest.version,
      status: "draft",
      quoteId: quote.id,
      quoteVersion: quote.version,
      quoteMinor: quote.amountMinor,
      quoteScope: String(
        fixture.evidence.find((item: Record<string, any>) => item.id === quote.evidenceId)
          ?.content?.scope ?? "",
      ),
      quoteEvidenceId: quote.evidenceId,
      providerId: quote.providerId,
      hotelContributionMinor: supportRequest.hotelDirectContributionMinor,
      requestedSubsidyMinor: supportRequest.requestedSubsidyMinor,
      beneficiaryHotelId: supportRequest.hotelId,
      fundingAccountId: supportRequest.fundingAccountId,
      approvals: [],
      allocation: {
        id: allocation.id,
        version: allocation.version,
        sourceAccountId: allocation.sourceAccountId,
        sourceHotelId: "hotel-a",
        beneficiaryHotelId: allocation.beneficiaryHotelId,
        maximumMinor: allocation.maximumMinor,
        approvals: [],
      },
    },
    reservations: [],
    ledger: [],
    directPayments: [],
    delivery: {
      status: "not_delivered",
      version: 1,
      providerId: quote.providerId,
      note: "",
    },
    outcome: {
      status: "awaiting_delivery",
      confirmations: [],
      result: null,
      remainingActions: [],
    },
    commercial: { proposals: [], invoices: [] },
    corrections: [],
  };
}

export function currentActor(state: DemoState): DemoActor {
  if (state.role === "hotel") {
    return {
      role: "hotel",
      hotelId: state.hotelId,
      actorId: `hotel-representative:${state.hotelId ?? "unselected"}`,
    };
  }
  return {
    role: state.role,
    hotelId: null,
    actorId:
      state.role === "innmetric"
        ? "operator-demo"
        : state.role === "department"
          ? "department-demo"
          : "provider-demo",
  };
}

export function deriveBalances(state: DemoState) {
  const cashMinor = state.ledger.reduce(
    (total, entry) => total + (entry.direction === "in" ? entry.amountMinor : -entry.amountMinor),
    0,
  );
  const reservedMinor = state.reservations
    .filter((reservation) => reservation.status === "reserved")
    .reduce((total, reservation) => total + reservation.amountMinor, 0);
  const attributableMinor = (hotelId: string) =>
    state.ledger.reduce(
      (total, entry) =>
        total +
        (entry.attributableHotelId === hotelId
          ? entry.direction === "in"
            ? entry.amountMinor
            : -entry.amountMinor
          : 0),
      0,
    );
  return {
    cashMinor,
    reservedMinor,
    availableMinor: cashMinor - reservedMinor,
    hotelAAttributedMinor: attributableMinor("hotel-a"),
  };
}

export function openItems(state: DemoState): string[] {
  const items: string[] = [];
  if (state.discovery.cursor < state.fixture.candidateQueue.length) {
    items.push("Synthetic discovery queue has unprocessed candidates.");
  }
  if (state.savings.status !== "verified") {
    items.push("Hotel A savings comparison is not jointly verified.");
  }
  if (!state.collection.posted) {
    items.push("Hotel A's explicit collection amount has not been posted as a receipt.");
  }
  if (!state.need.confirmed) {
    items.push("Hotel B's suggested carpentry need awaits its representative.");
  }
  if (state.support.status !== "paid") {
    items.push("Hotel B support is not fully paid by the department.");
  }
  if (state.delivery.status !== "delivered") {
    items.push("Provider delivery has not been recorded.");
  } else if (state.outcome.status !== "verified") {
    items.push("Outcome needs three-party confirmation or follow-up.");
  }
  if (state.commercial.invoices.some((invoice) => invoice.status === "blocked_not_configured")) {
    items.push("Commercial invoice draft is blocked until pricing is configured.");
  }
  if (state.corrections.some((correction) => correction.status === "awaiting_review")) {
    items.push("A linked ledger correction request is awaiting review.");
  }
  return items;
}

function fail(message: string, statusCode = 400): never {
  throw new DemoDomainError(message, statusCode);
}

function asPositiveMinor(value: unknown, label: string, allowZero = false): number {
  if (
    !Number.isSafeInteger(value) ||
    (allowZero ? Number(value) < 0 : Number(value) <= 0)
  ) {
    fail(`${label} must be an integer AED minor-unit amount.`);
  }
  return Number(value);
}

function requireRole(state: DemoState, ...roles: DemoRole[]) {
  if (!roles.includes(state.role)) {
    fail(`Role ${state.role} cannot perform this action.`, 403);
  }
}

function evidenceById(state: DemoState, id: string) {
  return state.fixture.evidence.find((item: Record<string, any>) => item.id === id);
}

function hasApproval(
  approvals: Approval[],
  role: "innmetric" | "department",
  version: number,
  amountMinor: number,
) {
  return approvals.some(
    (approval) =>
      approval.role === role &&
      approval.version === version &&
      approval.amountMinor === amountMinor,
  );
}

function jointApprovals(
  approvals: Approval[],
  version: number,
  amountMinor: number,
) {
  const innmetric = approvals.find(
    (approval) =>
      approval.role === "innmetric" &&
      approval.version === version &&
      approval.amountMinor === amountMinor,
  );
  const department = approvals.find(
    (approval) =>
      approval.role === "department" &&
      approval.version === version &&
      approval.amountMinor === amountMinor,
  );
  return Boolean(innmetric && department && innmetric.actorId !== department.actorId);
}

function addApproval(
  approvals: Approval[],
  state: DemoState,
  actor: DemoActor,
  version: number,
  amountMinor: number,
  checks?: Approval["checks"],
) {
  if (actor.role !== "innmetric" && actor.role !== "department") {
    fail("Only InnMetric or Tourism Department can approve.", 403);
  }
  if (
    approvals.some(
      (approval) =>
        approval.role === actor.role &&
        approval.version === version &&
        approval.amountMinor === amountMinor,
    )
  ) {
    fail("This role has already approved the current version.", 409);
  }
  if (
    approvals.some(
      (approval) =>
        approval.actorId === actor.actorId &&
        approval.version === version &&
        approval.amountMinor === amountMinor,
    )
  ) {
    fail("The same simulated actor cannot supply both approval roles.", 409);
  }
  approvals.push({
    role: actor.role,
    actorId: actor.actorId,
    version,
    amountMinor,
    ...(checks ? { checks } : {}),
  });
}

function recomputeSavings(state: DemoState) {
  const comparison = state.fixture.costComparisons[0];
  const costs = calculateCostComparison(
    state.fixture.evidence,
    comparison.baselineEvidenceId,
    comparison.observedEvidenceId,
    comparison.attributionEvidenceId,
    state.fixture.currency,
  );
  state.savings.baselineMinor = costs.baselineMinor;
  state.savings.observedMinor = costs.observedMinor;
  state.savings.candidateMinor = costs.candidateMinor;
  state.savings.status =
    costs.status === "needs_evidence"
      ? "needs_evidence"
      : jointApprovals(
            state.savings.approvals,
            state.savings.version,
            costs.candidateMinor ?? Number.NaN,
          ) && (costs.candidateMinor ?? 0) > 0
        ? "verified"
        : "needs_joint_review";
}

function processCandidate(state: DemoState, hotelId: string) {
  const queueItem = state.fixture.candidateQueue.find(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  const evidenceIds: string[] = queueItem?.evidenceIds ?? [];
  const source = evidenceIds.map((id) => evidenceById(state, id)).filter(Boolean);
  if (source.length !== evidenceIds.length) {
    return { status: "unverified", evidenceIds, reason: "A referenced evidence record is missing." };
  }

  const route = source.find((item: Record<string, any>) => item.type === "route_confirmation");
  const observations = source.filter(
    (item: Record<string, any>) => item.type === "booking_path_observation",
  );
  if (route || observations.length) {
    const confirmedRoute =
      route?.content?.propertyConfirmed === true &&
      route?.content?.officialRouteConfirmed === true;
    const matchingFailures = observations.filter(
      (observation: Record<string, any>) =>
        observation.content?.routeEvidenceId === route?.id &&
        observation.content?.url === route?.content?.url &&
        observation.content?.httpStatus === 404 &&
        observation.content?.botBlocked === false,
    );
    return confirmedRoute && matchingFailures.length >= 2
      ? {
          status: "candidate_booking_path_failure",
          evidenceIds: [...new Set([route.id, ...matchingFailures.map((item: any) => item.id)])],
          reason: "Confirmed official route has two distinct matching synthetic 404 observations.",
          affordability: null,
          automaticFunding: false,
        }
      : {
          status: "unverified",
          evidenceIds,
          reason: "A confirmed official route and two distinct, unblocked matching failures are required.",
          affordability: null,
          automaticFunding: false,
        };
  }

  const reviews = source.filter(
    (item: Record<string, any>) => item.type === "fictional_review",
  );
  const carpentryReviews = reviews.filter((item: Record<string, any>) =>
    /\b(wardrobe|furniture|fittings|carpentry|woodwork)\b/i.test(
      String(item.content?.text ?? ""),
    ),
  );
  if (carpentryReviews.length >= 2) {
    return {
      status: "suggested_service_need",
      category: "carpentry",
      evidenceIds: carpentryReviews.map((item: any) => item.id),
      reason: "Multiple synthetic review excerpts suggest a possible carpentry need.",
      affordability: null,
      requiresHotelConfirmation: true,
    };
  }
  if (evidenceIds.length === 0) {
    return {
      status: "no_discovery_evidence",
      evidenceIds: [],
      reason: "No discovery evidence is available for this candidate.",
      affordability: null,
    };
  }
  return {
    status: "unverified",
    evidenceIds,
    reason: "Available evidence does not meet a supported discovery signal.",
    affordability: null,
    automaticFunding: false,
  };
}

export function applyDemoAction(
  original: DemoState,
  request: DemoAction,
  actor: DemoActor,
  eventId: string,
): { state: DemoState; event: EventDraft } {
  const state = structuredClone(original);
  const payload = request.payload ?? {};
  let entityId = "programme-demo";
  let previousStatus: string | null = null;
  let newStatus: string | null = null;
  let reason = "";
  let evidenceIds: string[] = [];

  switch (request.action) {
    case "role.switch": {
      const role = payload.role;
      if (!["innmetric", "department", "hotel", "provider"].includes(String(role))) {
        fail("Choose one of the four simulated role perspectives.");
      }
      const hotelId = role === "hotel" ? String(payload.hotelId ?? "") : null;
      if (
        role === "hotel" &&
        !state.fixture.hotels.some((hotel: Record<string, any>) => hotel.id === hotelId)
      ) {
        fail("Select a hotel represented in the synthetic fixture.");
      }
      previousStatus = state.role;
      state.role = role as DemoRole;
      state.hotelId = hotelId;
      newStatus = state.role;
      reason = "Simulated visitor switched role perspective; this is not authentication.";
      break;
    }
    case "discovery.run": {
      requireRole(state, "innmetric");
      const queue = state.fixture.candidateQueue;
      if (state.discovery.cursor >= queue.length) {
        fail("The bounded synthetic discovery queue is already complete.", 409);
      }
      const item = queue[state.discovery.cursor];
      const result = processCandidate(state, item.hotelId);
      state.discovery.records[item.hotelId] = result;
      state.discovery.cursor += 1;
      entityId = item.hotelId;
      newStatus = String(result.status);
      evidenceIds = result.evidenceIds;
      reason = String(result.reason);
      break;
    }
    case "need.confirm": {
      requireRole(state, "hotel");
      if (state.hotelId !== state.support.beneficiaryHotelId) {
        fail("Only the beneficiary hotel's representative can confirm this need.", 403);
      }
      if (!state.discovery.records[state.support.beneficiaryHotelId]) {
        fail("Run synthetic discovery before confirming a suggested need.", 409);
      }
      if (
        state.discovery.records[state.support.beneficiaryHotelId]?.status !==
        "suggested_service_need"
      ) {
        fail("The available discovery evidence does not suggest a confirmable service need.", 409);
      }
      previousStatus = state.need.confirmed ? "confirmed" : "suggested";
      state.need.confirmed = true;
      state.need.suggested = true;
      newStatus = "hotel_confirmed";
      evidenceIds = [state.need.confirmationEvidenceId];
      reason = "Beneficiary hotel representative separately confirmed the suggested service need.";
      entityId = state.need.id;
      break;
    }
    case "consultation.add": {
      requireRole(state, "innmetric", "department", "hotel");
      const note = String(payload.note ?? "").trim();
      if (!note || note.length > 500) fail("Consultation note must be 1–500 characters.");
      const referenced = Array.isArray(payload.evidenceIds)
        ? payload.evidenceIds.map(String)
        : [];
      if (referenced.some((id) => !evidenceById(state, id))) {
        fail("Consultation references must match synthetic evidence IDs.");
      }
      state.need.consultations.push({
        id: eventId,
        actorId: actor.actorId,
        actorRole: actor.role,
        note,
        evidenceIds: referenced,
        createdAt: new Date().toISOString(),
      });
      evidenceIds = referenced;
      entityId = state.need.id;
      newStatus = "consultation_recorded";
      reason = "Consultation note recorded against the synthetic case.";
      break;
    }
    case "savings.edit": {
      requireRole(state, "innmetric");
      const keys = ["baselineEvidenceId", "observedEvidenceId", "attributionEvidenceId"];
      const nextIds = keys.map((key) =>
        String(payload[key] ?? state.fixture.costComparisons[0][key]),
      );
      if (nextIds.some((id) => !evidenceById(state, id))) {
        fail("Cost comparison evidence IDs must exist in this session.");
      }
      previousStatus = state.savings.status;
      const comparison = state.fixture.costComparisons[0];
      [comparison.baselineEvidenceId, comparison.observedEvidenceId, comparison.attributionEvidenceId] = nextIds;
      state.savings.version += 1;
      state.savings.approvals = [];
      state.savings.evidenceIds = nextIds;
      recomputeSavings(state);
      newStatus = state.savings.status;
      evidenceIds = nextIds;
      entityId = state.savings.id;
      reason = "Material evidence references changed; prior approvals were invalidated.";
      break;
    }
    case "savings.approve": {
      requireRole(state, "innmetric", "department");
      recomputeSavings(state);
      if (state.savings.status === "needs_evidence") {
        fail("Missing or incomparable cost evidence blocks savings verification.", 409);
      }
      if ((state.savings.candidateMinor ?? 0) <= 0) {
        fail("A zero or negative difference cannot be verified as positive savings.", 409);
      }
      const raw = payload.checks as Record<string, unknown> | undefined;
      const checks = {
        scope: raw?.scope === true,
        timing: raw?.timing === true,
        channelMix: raw?.channelMix === true,
        costs: raw?.costs === true,
      };
      if (Object.values(checks).some((value) => !value)) {
        fail("Sign-off must review scope, timing, channel mix, and cost evidence.");
      }
      previousStatus = state.savings.status;
      addApproval(
        state.savings.approvals,
        state,
        actor,
        state.savings.version,
        state.savings.candidateMinor!,
        checks,
      );
      recomputeSavings(state);
      newStatus = state.savings.status;
      evidenceIds = state.savings.evidenceIds;
      entityId = state.savings.id;
      reason = "Reviewer signed off the current comparison after all required attribution checks.";
      break;
    }
    case "collection.set": {
      requireRole(state, "department");
      if (state.collection.posted) {
        fail("A posted receipt is immutable; request a linked correction instead.", 409);
      }
      const amount = asPositiveMinor(payload.amountMinor, "Collection amount");
      previousStatus = `version_${state.collection.version}`;
      state.collection.amountMinor = amount;
      state.collection.version += 1;
      state.collection.approvals = [];
      newStatus = `version_${state.collection.version}`;
      entityId = state.collection.id;
      reason = "Explicit collection amount changed; its prior approvals were invalidated.";
      evidenceIds = [state.fixture.receiptDrafts[0].receiptEvidenceId];
      break;
    }
    case "collection.approve": {
      requireRole(state, "innmetric", "department");
      recomputeSavings(state);
      if (state.savings.status !== "verified") {
        fail("Verify the savings comparison before the separate collection approval.", 409);
      }
      previousStatus = jointApprovals(
        state.collection.approvals,
        state.collection.version,
        state.collection.amountMinor,
      )
        ? "jointly_approved"
        : "awaiting_joint_approval";
      addApproval(
        state.collection.approvals,
        state,
        actor,
        state.collection.version,
        state.collection.amountMinor,
      );
      newStatus = jointApprovals(
        state.collection.approvals,
        state.collection.version,
        state.collection.amountMinor,
      )
        ? "jointly_approved"
        : "awaiting_joint_approval";
      entityId = state.collection.id;
      reason = "Separate explicit collection amount approval; approval alone creates no cash.";
      evidenceIds = [state.fixture.receiptDrafts[0].receiptEvidenceId];
      break;
    }
    case "collection.post": {
      requireRole(state, "department");
      if (Object.keys(payload).length > 0) {
        fail("Receipt posting uses only the separately approved collection amount.", 400);
      }
      recomputeSavings(state);
      if (state.savings.status !== "verified") {
        fail("Unverified savings cannot support a receipt.", 409);
      }
      if (
        !jointApprovals(
          state.collection.approvals,
          state.collection.version,
          state.collection.amountMinor,
        )
      ) {
        fail("The current collection amount needs distinct InnMetric and department approvals.", 409);
      }
      if (state.collection.posted) fail("Receipt already posted; replay is blocked.", 409);
      const proof = evidenceById(
        state,
        state.fixture.receiptDrafts[0].receiptEvidenceId,
      );
      if (
        proof?.content?.currency !== "AED" ||
        proof?.content?.recipient !== state.fixture.programme.fundAdministrator ||
        proof?.content?.amountMinor !== state.collection.amountMinor
      ) {
        fail("Receipt evidence does not match the approved amount, currency, or recipient.", 409);
      }
      state.ledger.push({
        id: eventId,
        kind: "receipt",
        direction: "in",
        amountMinor: state.collection.amountMinor,
        currency: "AED",
        sourceAccountId: "pool-A",
        source: "collected_hotel_savings",
        attributableHotelId: "hotel-a",
        beneficiaryHotelId: null,
        linkedEntryId: null,
        supportRequestId: null,
        reservationId: null,
        status: "posted",
      });
      previousStatus = "not_posted";
      state.collection.posted = true;
      newStatus = "posted_once";
      entityId = state.collection.id;
      evidenceIds = [state.fixture.receiptDrafts[0].receiptEvidenceId];
      reason = "Tourism Department recorded a simulated receipt after both approval gates.";
      break;
    }
    case "allocation.approve": {
      requireRole(state, "innmetric", "department");
      if (!state.need.confirmed) fail("The beneficiary hotel must confirm the need first.", 409);
      previousStatus = jointApprovals(
        state.support.allocation.approvals,
        state.support.allocation.version,
        state.support.allocation.maximumMinor,
      )
        ? "jointly_approved"
        : "awaiting_joint_approval";
      addApproval(
        state.support.allocation.approvals,
        state,
        actor,
        state.support.allocation.version,
        state.support.allocation.maximumMinor,
      );
      newStatus = jointApprovals(
        state.support.allocation.approvals,
        state.support.allocation.version,
        state.support.allocation.maximumMinor,
      )
        ? "jointly_approved"
        : "awaiting_joint_approval";
      entityId = state.support.allocation.id;
      reason = "Cross-hotel allocation authorization approved by distinct InnMetric and department reviewers.";
      break;
    }
    case "support.approve": {
      requireRole(state, "innmetric", "department");
      if (!state.need.confirmed) fail("The beneficiary hotel must confirm the need first.", 409);
      if (!evidenceById(state, state.support.quoteEvidenceId)) {
        fail("A valid provider quote is required.", 409);
      }
      if (
        state.support.requestedSubsidyMinor + state.support.hotelContributionMinor >
        state.support.quoteMinor
      ) {
        fail("The support request exceeds the provider quote.", 409);
      }
      previousStatus = jointApprovals(
        state.support.approvals,
        state.support.version,
        state.support.requestedSubsidyMinor,
      )
        ? "jointly_approved"
        : "awaiting_joint_approval";
      addApproval(
        state.support.approvals,
        state,
        actor,
        state.support.version,
        state.support.requestedSubsidyMinor,
      );
      const ready = jointApprovals(
        state.support.approvals,
        state.support.version,
        state.support.requestedSubsidyMinor,
      );
      state.support.status = ready ? "approved" : "draft";
      newStatus = ready ? "jointly_approved" : "awaiting_joint_approval";
      entityId = state.support.id;
      evidenceIds = [state.need.confirmationEvidenceId, state.support.quoteEvidenceId];
      reason = "Support request version approved by distinct InnMetric and department reviewers.";
      break;
    }
    case "support.edit": {
      requireRole(state, "innmetric");
      if (state.support.status === "reserved" || state.support.status === "paid") {
        fail("Funding version is locked after reservation or payment; create a linked correction request.", 409);
      }
      const amount = asPositiveMinor(payload.requestedSubsidyMinor, "Requested subsidy");
      if (amount + state.support.hotelContributionMinor > state.support.quoteMinor) {
        fail("Requested support plus the hotel's direct contribution exceeds the quote.", 409);
      }
      const accountId = String(payload.fundingAccountId ?? state.support.fundingAccountId);
      if (!state.fixture.fundingAccounts.some((account: Record<string, any>) => account.id === accountId)) {
        fail("Funding source must exist in the synthetic fixture.");
      }
      previousStatus = `version_${state.support.version}`;
      const amountChanged = amount !== state.support.requestedSubsidyMinor;
      const sourceChanged = accountId !== state.support.fundingAccountId;
      if (amountChanged || sourceChanged) {
        state.support.version += 1;
        state.support.approvals = [];
        state.support.allocation.version += 1;
        state.support.allocation.approvals = [];
        state.support.requestedSubsidyMinor = amount;
        state.support.fundingAccountId = accountId;
        state.support.allocation.maximumMinor = amount;
        state.support.allocation.sourceAccountId = accountId;
        const source = state.fixture.fundingAccounts.find(
          (account: Record<string, any>) => account.id === accountId,
        );
        state.support.allocation.sourceHotelId = source?.attributableHotelId ?? "department";
      }
      state.support.status = "draft";
      newStatus = `version_${state.support.version}`;
      entityId = state.support.id;
      reason = "Material amount/source edit created a new version and invalidated prior approvals.";
      break;
    }
    case "support.reserve": {
      requireRole(state, "department");
      if (!state.collection.posted) fail("No collected department cash is available.", 409);
      if (!state.need.confirmed) fail("Hotel B must confirm the suggested need.", 409);
      const allocationApproved = jointApprovals(
        state.support.allocation.approvals,
        state.support.allocation.version,
        state.support.requestedSubsidyMinor,
      );
      if (!allocationApproved) fail("Joint allocation authorization is required.", 409);
      if (
        !jointApprovals(
          state.support.approvals,
          state.support.version,
          state.support.requestedSubsidyMinor,
        )
      ) {
        fail("Current support version needs distinct InnMetric and department approvals.", 409);
      }
      if (
        state.reservations.some((reservation) => reservation.status === "reserved") ||
        state.support.status === "reserved" ||
        state.support.status === "paid"
      ) {
        fail("This support request already has a reservation or payment.", 409);
      }
      if (state.support.requestedSubsidyMinor > state.support.allocation.maximumMinor) {
        fail("Subsidy exceeds its approved cross-hotel allocation.", 409);
      }
      if (state.support.fundingAccountId !== state.support.allocation.sourceAccountId) {
        fail("Funding source differs from the approved allocation.", 409);
      }
      const sourceAccount = state.fixture.fundingAccounts.find(
        (account: Record<string, any>) => account.id === state.support.fundingAccountId,
      );
      if (!sourceAccount || sourceAccount.authorizationStatus === "not_authorized") {
        fail("The proposed department budget is not an authorized funding source.", 409);
      }
      const balances = deriveBalances(state);
      const sourceCash = state.ledger.reduce(
        (sum, entry) =>
          sum +
          (entry.sourceAccountId === state.support.fundingAccountId
            ? entry.direction === "in"
              ? entry.amountMinor
              : -entry.amountMinor
            : 0),
        0,
      );
      const sourceReserved = state.reservations
        .filter(
          (reservation) =>
            reservation.status === "reserved" &&
            reservation.sourceAccountId === state.support.fundingAccountId,
        )
        .reduce((sum, reservation) => sum + reservation.amountMinor, 0);
      if (
        balances.availableMinor < state.support.requestedSubsidyMinor ||
        sourceCash - sourceReserved < state.support.requestedSubsidyMinor
      ) {
        fail("Insufficient collected and attributable available funds.", 409);
      }
      const reservationId = eventId;
      state.reservations.push({
        id: reservationId,
        supportRequestId: state.support.id,
        amountMinor: state.support.requestedSubsidyMinor,
        currency: "AED",
        sourceAccountId: state.support.fundingAccountId,
        sourceHotelId: state.support.allocation.sourceHotelId,
        beneficiaryHotelId: state.support.beneficiaryHotelId,
        allocationAuthorizationId: state.support.allocation.id,
        supportVersion: state.support.version,
        status: "reserved",
      });
      previousStatus = state.support.status;
      state.support.status = "reserved";
      newStatus = "reserved";
      entityId = state.support.id;
      reason = "Department reserved collected, attributed funds under the jointly approved allocation.";
      break;
    }
    case "support.pay": {
      requireRole(state, "department");
      if (Object.keys(payload).length > 0) {
        fail("Payment amount and source are fixed by the approved reservation.", 400);
      }
      const reservation = state.reservations.find(
        (item) =>
          item.supportRequestId === state.support.id && item.status === "reserved",
      );
      if (!reservation) fail("An active department reservation is required.", 409);
      if (reservation.supportVersion !== state.support.version) {
        fail("Reservation version is stale; payment is blocked.", 409);
      }
      const balances = deriveBalances(state);
      if (reservation.amountMinor > balances.cashMinor) {
        fail("Payment exceeds collected cash.", 409);
      }
      previousStatus = "reserved";
      reservation.status = "paid";
      state.support.status = "paid";
      state.ledger.push({
        id: eventId,
        kind: "support_payment",
        direction: "out",
        amountMinor: reservation.amountMinor,
        currency: "AED",
        sourceAccountId: reservation.sourceAccountId,
        source: "collected_hotel_savings",
        attributableHotelId: reservation.sourceHotelId,
        beneficiaryHotelId: reservation.beneficiaryHotelId,
        linkedEntryId: null,
        supportRequestId: state.support.id,
        reservationId: reservation.id,
        status: "posted",
      });
      newStatus = "paid_once";
      entityId = state.support.id;
      reason = "Department posted the idempotent payment and released its reservation atomically.";
      break;
    }
    case "support.directPayment": {
      requireRole(state, "hotel");
      if (state.hotelId !== state.support.beneficiaryHotelId) {
        fail("Only the beneficiary hotel can record its separate direct contribution.", 403);
      }
      if (state.directPayments.some((payment) => payment.hotelId === state.hotelId)) {
        fail("Hotel direct payment is already recorded.", 409);
      }
      const amount = state.support.hotelContributionMinor;
      state.directPayments.push({
        id: eventId,
        hotelId: state.hotelId,
        amountMinor: amount,
        currency: "AED",
        status: "recorded",
        note: "Separate hotel payment; never part of department programme cash.",
      });
      entityId = state.support.id;
      newStatus = "hotel_direct_payment_recorded";
      reason = "Beneficiary hotel's direct contribution recorded separately from programme cash.";
      break;
    }
    case "quote.submit": {
      requireRole(state, "provider");
      if (state.support.status === "reserved" || state.support.status === "paid") {
        fail("Funding version is locked after reservation or payment; use a linked correction request.", 409);
      }
      const amount = asPositiveMinor(payload.amountMinor, "Provider quote");
      const scope = String(payload.scope ?? "").trim();
      if (!scope || scope.length > 500) fail("Quote scope must be 1–500 characters.");
      previousStatus = `quote_version_${state.support.quoteVersion}`;
      state.support.quoteVersion += 1;
      state.support.quoteMinor = amount;
      state.support.quoteScope = scope;
      state.support.approvals = [];
      state.support.allocation.approvals = [];
      state.support.version += 1;
      state.support.status = "draft";
      newStatus = `quote_version_${state.support.quoteVersion}`;
      entityId = state.support.quoteId;
      evidenceIds = [state.support.quoteEvidenceId];
      reason = "Provider submitted a revised synthetic quote; funding approvals were invalidated.";
      break;
    }
    case "delivery.mark": {
      requireRole(state, "provider");
      if (state.support.status !== "paid") {
        fail("Provider delivery is separate and follows department payment.", 409);
      }
      if (state.delivery.status === "delivered" && state.outcome.status === "verified") {
        fail("Verified delivery is already closed.", 409);
      }
      const note = String(payload.note ?? "Synthetic provider delivery recorded.").trim();
      if (!note || note.length > 500) fail("Delivery note must be 1–500 characters.");
      previousStatus = state.delivery.status;
      state.delivery.status = "delivered";
      state.delivery.version += 1;
      state.delivery.providerId = actor.actorId;
      state.delivery.note = note;
      state.outcome.confirmations = [];
      state.outcome.result = null;
      state.outcome.remainingActions = [];
      state.outcome.status = "awaiting_confirmations";
      newStatus = state.delivery.status;
      entityId = state.support.id;
      reason = "Provider delivery submission recorded; it does not verify the outcome.";
      break;
    }
    case "outcome.confirm": {
      requireRole(state, "innmetric", "department", "hotel");
      if (state.delivery.status !== "delivered") {
        fail("Provider delivery must be recorded before outcome review.", 409);
      }
      if (state.role === "hotel" && state.hotelId !== state.support.beneficiaryHotelId) {
        fail("Only the beneficiary hotel can confirm this outcome.", 403);
      }
      const result = payload.result;
      if (!["completed", "partial", "rejected"].includes(String(result))) {
        fail("Select completed, partial, or rejected as the outcome.");
      }
      const remainingActions = Array.isArray(payload.remainingActions)
        ? payload.remainingActions.map((item) => String(item).trim()).filter(Boolean)
        : [];
      if (remainingActions.some((item) => item.length > 250)) {
        fail("Each remaining action must be 250 characters or fewer.");
      }
      if (result === "completed" && remainingActions.length) {
        fail("A completed outcome cannot list unresolved actions.");
      }
      if (result !== "completed" && remainingActions.length === 0) {
        fail("Partial or rejected outcomes must retain at least one remaining action.");
      }
      if (state.outcome.confirmations.some((item) => item.role === state.role)) {
        fail("This role has already confirmed the current delivery version.", 409);
      }
      state.outcome.confirmations.push({
        role: state.role as "innmetric" | "department" | "hotel",
        actorId: actor.actorId,
        hotelId: actor.hotelId,
        result: result as "completed" | "partial" | "rejected",
        remainingActions,
        deliveryVersion: state.delivery.version,
      });
      previousStatus = state.outcome.status;
      if (state.outcome.confirmations.length < 3) {
        state.outcome.status = "awaiting_confirmations";
      } else {
        const results = new Set(state.outcome.confirmations.map((item) => item.result));
        if (results.size > 1) {
          state.outcome.status = "conflicting_confirmations";
          state.outcome.result = null;
          state.outcome.remainingActions = ["Resolve conflicting reviewer outcome decisions."];
        } else {
          state.outcome.result = result as "completed" | "partial" | "rejected";
          state.outcome.remainingActions = [
            ...new Set(state.outcome.confirmations.flatMap((item) => item.remainingActions)),
          ];
          state.outcome.status =
            result === "completed" ? "verified" : "needs_follow_up";
        }
      }
      newStatus = state.outcome.status;
      entityId = state.support.id;
      reason = "Independent role outcome confirmation recorded for the current delivery version.";
      break;
    }
    case "commercial.propose": {
      requireRole(state, "innmetric");
      const type = payload.type;
      if (type !== "subscription" && type !== "on_demand") {
        fail("Choose subscription or on-demand.");
      }
      const hotelId = String(payload.hotelId ?? "hotel-c");
      if (!state.fixture.hotels.some((hotel: Record<string, any>) => hotel.id === hotelId)) {
        fail("Commercial proposal must reference a synthetic hotel.");
      }
      const id = String(payload.id ?? eventId);
      state.commercial.proposals.push({
        id,
        hotelId,
        type,
        priceMinor: null,
        status: "draft",
        financialBook: "innmetric_commercial",
      });
      entityId = id;
      newStatus = "draft";
      reason = "Separate InnMetric commercial proposal created with pricing not configured.";
      break;
    }
    case "commercial.request": {
      requireRole(state, "hotel");
      if (state.hotelId !== "hotel-c") {
        fail("Only Hotel C can request the separate commercial service in this fixture.", 403);
      }
      const type = payload.type;
      if (type !== "subscription" && type !== "on_demand") {
        fail("Choose subscription or on-demand.");
      }
      const id = String(payload.id ?? eventId);
      state.commercial.proposals.push({
        id,
        hotelId: "hotel-c",
        type,
        priceMinor: null,
        status: "requested",
        financialBook: "innmetric_commercial",
      });
      entityId = id;
      newStatus = "requested";
      reason = "Hotel C requested a separate commercial service; price remains unconfigured.";
      break;
    }
    case "commercial.invoiceDraft": {
      requireRole(state, "innmetric");
      const proposalId = String(payload.proposalId ?? "");
      const proposal = state.commercial.proposals.find((item) => item.id === proposalId);
      if (!proposal) fail("A separate commercial proposal is required.", 404);
      if (proposal.priceMinor !== null) {
        fail("This demo has no configured commercial prices.", 409);
      }
      const id = eventId;
      state.commercial.invoices.push({
        id,
        proposalId,
        hotelId: proposal.hotelId,
        amountMinor: null,
        currency: "AED",
        status: "blocked_not_configured",
        financialBook: "innmetric_commercial",
      });
      entityId = id;
      newStatus = "blocked_not_configured";
      reason = "Invoice record is separate from programme funds and blocked because pricing is unset.";
      break;
    }
    case "ledger.correctionRequest": {
      requireRole(state, "department");
      const originalEntryId = String(payload.originalEntryId ?? "");
      const original = state.ledger.find((entry) => entry.id === originalEntryId);
      if (!original) fail("Correction must reference a posted ledger entry.", 404);
      const amount = asPositiveMinor(payload.proposedAmountMinor, "Correction amount");
      if (amount > original.amountMinor) {
        fail("Correction request cannot exceed the linked original entry.", 409);
      }
      const reasonText = String(payload.reason ?? "").trim();
      if (!reasonText || reasonText.length > 500) {
        fail("Correction reason must be 1–500 characters.");
      }
      state.corrections.push({
        id: eventId,
        originalEntryId,
        proposedAmountMinor: amount,
        reason: reasonText,
        status: "awaiting_review",
        financialEffectMinor: 0,
      });
      entityId = originalEntryId;
      newStatus = "correction_requested";
      reason = "Linked correction request appended; the posted transaction and balance are unchanged.";
      break;
    }
    default:
      fail(`Unsupported demo action: ${request.action}.`);
  }

  return {
    state,
    event: {
      action: request.action,
      entityId,
      previousStatus,
      newStatus,
      reason,
      evidenceIds,
      payload: request.payload,
    },
  };
}
