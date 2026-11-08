import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  ApplyProgrammeDemoActionBody,
  GetProgrammeDemoHeader,
} from "@workspace/api-zod";
import {
  programmeDemoEvents,
  programmeDemoSessions,
} from "@workspace/db/schema";
import {
  applyDemoAction,
  currentActor,
  createInitialState,
  deriveBalances,
  DemoDomainError,
  openItems,
  type DemoAction,
  type DemoState,
} from "../demo/domain";
import { logger } from "../lib/logger";
import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();
const sessionHeader = GetProgrammeDemoHeader.shape["X-Demo-Session"].unwrap();
const actionSchema = ApplyProgrammeDemoActionBody.strict();

type StoredEvent = typeof programmeDemoEvents.$inferSelect;

function parseSessionHeader(request: Request, required: boolean) {
  const raw = request.header("x-demo-session");
  if (!raw && !required) return randomUUID();
  const result = sessionHeader.safeParse(raw);
  if (!result.success) {
    throw new DemoDomainError(
      "A valid X-Demo-Session UUID is required for this request.",
      400,
    );
  }
  return result.data;
}

async function readFixture() {
  const fixturePaths = [
    path.resolve(process.cwd(), "fixtures", "programme-demo.json"),
    path.resolve(process.cwd(), "..", "..", "fixtures", "programme-demo.json"),
  ];
  for (const fixturePath of fixturePaths) {
    try {
      return JSON.parse(await readFile(fixturePath, "utf8")) as Record<string, any>;
    } catch {}
  }
  logger.error({ fixturePaths }, "Unable to read synthetic demo fixture");
  throw new Error("The synthetic programme fixture is unavailable.");
}

function eventView(event: StoredEvent) {
  return {
    id: event.id,
    sequence: event.sequence,
    actorId: event.actorId,
    actorRole: event.actorRole,
    action: event.action,
    entityId: event.entityId,
    previousStatus: event.previousStatus,
    newStatus: event.newStatus,
    reason: event.reason,
    evidenceIds: event.evidenceIds,
    payload: event.payload,
    createdAt: event.createdAt.toISOString(),
  };
}

async function ensureSession(sessionId: string) {
  const [current] = await db
    .select({ id: programmeDemoSessions.id })
    .from(programmeDemoSessions)
    .where(eq(programmeDemoSessions.id, sessionId))
    .limit(1);

  if (!current) {
    const fixture = await readFixture();
    const state = createInitialState(fixture);
    await db
      .insert(programmeDemoSessions)
      .values({
        id: sessionId,
        role: state.role,
        hotelId: state.hotelId,
        version: 1,
        state: state as unknown as Record<string, unknown>,
      })
      .onConflictDoNothing();

    const [created] = await db
      .select({ id: programmeDemoSessions.id })
      .from(programmeDemoSessions)
      .where(eq(programmeDemoSessions.id, sessionId))
      .limit(1);
    if (created) {
      await db.insert(programmeDemoEvents).values({
        id: randomUUID(),
        sessionId,
        sequence: 1,
        actorId: "synthetic-fixture",
        actorRole: "system",
        action: "session.created",
        entityId: "programme-demo",
        previousStatus: null,
        newStatus: "synthetic_session_ready",
        reason: "Created isolated visitor state from the bundled synthetic fixture.",
        evidenceIds: [],
        payload: { dataMode: "synthetic" },
      }).onConflictDoNothing();
    }
  }
}

async function getSnapshot(sessionId: string) {
  await ensureSession(sessionId);
  const [session] = await db
    .select()
    .from(programmeDemoSessions)
    .where(eq(programmeDemoSessions.id, sessionId))
    .limit(1);
  if (!session) throw new DemoDomainError("Demo session was not found.", 404);
  const events = await db
    .select()
    .from(programmeDemoEvents)
    .where(eq(programmeDemoEvents.sessionId, sessionId))
    .orderBy(asc(programmeDemoEvents.sequence))
    .limit(1000);
  const state = projectState(session.state as DemoState);
  const visibleEvents = projectEvents(state, events);
  return {
    sessionId,
    version: session.version,
    state,
    events: visibleEvents.map(eventView),
  };
}

function projectState(source: DemoState): DemoState {
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
  if (hotelId !== "hotel-b") {
    (state as any).need = null;
    (state as any).support = null;
    (state as any).delivery = null;
    (state as any).outcome = null;
  } else {
    (state as any).collection = null;
    state.ledger = [];
    state.reservations = [];
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

function projectEvents(state: DemoState, events: StoredEvent[]) {
  if (state.role === "innmetric" || state.role === "department") return events;
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
    return allowed.has(event.entityId);
  });
}

function sendError(response: Response, error: unknown) {
  if (error instanceof DemoDomainError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }
  logger.error({ error }, "Programme demo request failed");
  response.status(500).json({ error: "The synthetic demo request could not be completed." });
}

router.get("/demo", async (request, response) => {
  try {
    const sessionId = parseSessionHeader(request, false);
    response.json(await getSnapshot(sessionId));
  } catch (error) {
    sendError(response, error);
  }
});

router.post("/demo/actions", async (request, response) => {
  try {
    const sessionId = parseSessionHeader(request, true);
    const parsed = actionSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Invalid action request.", issues: parsed.error.issues });
      return;
    }
    const action = parsed.data as DemoAction;
    const result = await db.transaction(async (transaction) => {
      const [session] = await transaction
        .select()
        .from(programmeDemoSessions)
        .where(eq(programmeDemoSessions.id, sessionId))
        .for("update")
        .limit(1);
      if (!session) throw new DemoDomainError("Load the demo session before sending actions.", 404);
      if (session.version >= 1000) {
        throw new DemoDomainError("This synthetic session reached its 1,000-event limit.", 409);
      }

      if (action.idempotencyKey) {
        const [prior] = await transaction
          .select()
          .from(programmeDemoEvents)
          .where(
            and(
              eq(programmeDemoEvents.sessionId, sessionId),
              eq(programmeDemoEvents.idempotencyKey, action.idempotencyKey),
            ),
          )
          .limit(1);
        if (prior) {
          if (prior.action !== action.action) {
            throw new DemoDomainError(
              "This idempotency key was already used for another action.",
              409,
            );
          }
          return;
        }
      }

      const state = session.state as DemoState;
      const actor = currentActor(state);
      const eventId = randomUUID();
      const applied = applyDemoAction(state, action, actor, eventId);
      const nextVersion = session.version + 1;

      await transaction
        .update(programmeDemoSessions)
        .set({
          role: applied.state.role,
          hotelId: applied.state.hotelId,
          version: nextVersion,
          state: applied.state as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(programmeDemoSessions.id, sessionId));
      await transaction.insert(programmeDemoEvents).values({
        id: eventId,
        sessionId,
        sequence: nextVersion,
        actorId: actor.actorId,
        actorRole: actor.role,
        action: applied.event.action,
        entityId: applied.event.entityId,
        previousStatus: applied.event.previousStatus,
        newStatus: applied.event.newStatus,
        reason: applied.event.reason,
        evidenceIds: applied.event.evidenceIds,
        payload: applied.event.payload,
        idempotencyKey: action.idempotencyKey ?? null,
      });
    });
    void result;
    response.json(await getSnapshot(sessionId));
  } catch (error) {
    sendError(response, error);
  }
});

router.get("/demo/export", async (request, response) => {
  try {
    const sessionId = parseSessionHeader(request, true);
    const snapshot = await getSnapshot(sessionId);
    const visibleState = snapshot.state as DemoState & {
      scope?: { canViewPortfolio?: boolean; canViewFinance?: boolean };
    };
    const financeVisible = visibleState.scope?.canViewFinance === true;
    response.json({
      dataMode: "synthetic",
      notice: "All records are fictional. This export does not represent a government programme or real hotel records.",
      exportedAt: new Date().toISOString(),
      sessionId,
      version: snapshot.version,
      fixture: snapshot.state.fixture,
      state: snapshot.state,
      events: snapshot.events,
      balances: financeVisible ? deriveBalances(snapshot.state) : null,
      openItems: visibleState.scope?.canViewPortfolio
        ? openItems(snapshot.state)
        : ["Export is limited to the selected synthetic hotel/provider perspective."],
    });
  } catch (error) {
    sendError(response, error);
  }
});

export default router;
