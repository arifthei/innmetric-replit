import type { DemoState } from "./domain";

export function projectState(source: DemoState): DemoState {
  const state = structuredClone(source);
  if (state.support && typeof state.support.quoteScope !== "string") {
    const quote = state.fixture.quotes.find(
      (item: Record<string, any>) => item.id === state.support.quoteId,
    );
    state.support.quoteScope = String(
      state.fixture.evidence.find(
        (item: Record<string, any>) => item.id === quote?.evidenceId,
      )?.content?.scope ?? "",
    );
  }
  const role = state.role;
  // The hotel service record is commercial. Only InnMetric and the served hotel can see it.
  const servedHotelId = state.hotelService?.fixture.hotel.id;
  if (!(role === "innmetric" || (role === "hotel" && state.hotelId === servedHotelId))) {
    state.hotelService = null;
  }
  const hotelId = role === "hotel" ? state.hotelId : role === "provider" ? "hotel-b" : null;
  const portfolio = role === "innmetric" || role === "department";
  const finance = portfolio;
  const supportAccess =
    portfolio || role === "provider" || (role === "hotel" && hotelId === "hotel-b");
  state.scope = {
    role,
    hotelId,
    canViewPortfolio: portfolio,
    canViewFinance: finance,
    canViewSupport: supportAccess,
    candidateCount: portfolio ? 4 : role === "provider" ? 0 : 1,
  };

  if (portfolio) return state;

  const fixture = state.fixture;
  fixture.hotels = fixture.hotels.filter((item: Record<string, any>) => item.id === hotelId);
  fixture.evidence = role === "provider"
    ? []
    : fixture.evidence.filter((item: Record<string, any>) => item.hotelId === hotelId);
  fixture.candidateQueue = fixture.candidateQueue.filter(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  fixture.costComparisons = fixture.costComparisons.filter(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  fixture.needs = fixture.needs.filter(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  fixture.quotes = fixture.quotes.filter(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  fixture.supportRequests = fixture.supportRequests.filter(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  fixture.commercialEngagements = fixture.commercialEngagements.filter(
    (item: Record<string, any>) => item.hotelId === hotelId,
  );
  fixture.allocationAuthorizations = fixture.allocationAuthorizations.filter(
    (item: Record<string, any>) => item.beneficiaryHotelId === hotelId,
  );
  fixture.fundingAccounts = [];
  fixture.receiptDrafts = [];
  fixture.providers = role === "provider" ? fixture.providers : [];
  state.discovery.records = role === "provider"
    ? {}
    : Object.fromEntries(Object.entries(state.discovery.records).filter(([id]) => id === hotelId));
  state.discovery.cursor = Object.keys(state.discovery.records).length;
  if (hotelId !== "hotel-a") {
    (state as any).savings = null;
    (state as any).collection = null;
  } else {
    (state as any).collection = null;
  }
  state.ledger = [];
  state.reservations = [];
  if (hotelId !== "hotel-b") {
    state.directPayments = [];
    (state as any).need = null;
    (state as any).support = null;
    (state as any).delivery = null;
    (state as any).outcome = null;
  } else {
    (state as any).collection = null;
    state.directPayments =
      role === "hotel"
        ? state.directPayments.filter((item) => item.hotelId === hotelId)
        : [];
  }
  if (role === "provider" && state.support) {
    state.support = {
      ...state.support,
      hotelContributionMinor: null,
      requestedSubsidyMinor: null,
      fundingAccountId: "restricted",
      approvals: [],
      allocation: {
        id: "restricted",
        version: 0,
        sourceAccountId: "restricted",
        sourceHotelId: "restricted",
        beneficiaryHotelId: "hotel-b",
        maximumMinor: 0,
        approvals: [],
      },
    } as unknown as DemoState["support"];
    state.outcome = {
      ...state.outcome,
      confirmations: [],
      result: null,
      remainingActions: [],
    };
    state.directPayments = [];
    fixture.allocationAuthorizations = [];
    fixture.supportRequests = fixture.supportRequests.map((item: Record<string, any>) => ({
      id: item.id,
      hotelId: item.hotelId,
      quoteId: item.quoteId,
      version: item.version,
      status: item.status,
    }));
  }
  if (hotelId !== "hotel-c") {
    state.commercial = { proposals: [], invoices: [] };
  }
  state.corrections = [];
  return state;
}

export function projectEvents<T extends { action: string; actorRole: string; entityId: string }>(state: DemoState, events: T[]) {
  const isService = (event: T) => event.action.startsWith("service.");
  if (state.role === "innmetric") return events;
  if (state.role === "department") return events.filter((event) => !isService(event));
  const hotelId = state.role === "provider" ? "hotel-b" : state.hotelId;
  const allowed = hotelId === "hotel-a"
    ? new Set(["hotel-a", "saving-A"])
    : hotelId === "hotel-b"
      ? new Set(["hotel-b", "need-B", "support-B", "quote-B", "allocation-A-B"])
      : new Set(
          state.commercial.proposals.map((proposal) => proposal.id),
        );
  return events.filter((event) => {
    if (event.action === "role.switch") return false;
    if (state.role === "provider" && event.actorRole !== "provider" && event.action !== "delivery.mark") {
      return false;
    }
    if (isService(event)) return state.role === "hotel" && hotelId === "hotel-a";
    return allowed.has(event.entityId);
  });
}
