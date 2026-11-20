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
  createHotelServiceState,
  createInitialState,
  deriveBalances,
  DemoDomainError,
  openItems,
  type DemoAction,
  type DemoState,
} from "../demo/domain";
import { projectEvents, projectState } from "../demo/projection";
import { logger } from "../lib/logger";
import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

// Snapshots and exports belong to one visitor session. Keep them out of every shared cache, including
// the innmetric.com/collab/api proxy, and mark the session header as a cache key for good measure.
router.use("/demo", (_request, response, next) => {
  response.set("Cache-Control", "private, no-store");
  response.vary("X-Demo-Session");
  next();
});

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

async function readFixture(fileName = "programme-demo.json") {
  const fixturePaths = [
    path.resolve(process.cwd(), "fixtures", fileName),
    path.resolve(process.cwd(), "..", "..", "fixtures", fileName),
  ];
  for (const fixturePath of fixturePaths) {
    try {
      return JSON.parse(await readFile(fixturePath, "utf8")) as Record<string, any>;
    } catch {}
  }
  logger.error({ fixturePaths }, "Unable to read synthetic demo fixture");
  throw new Error("The synthetic programme fixture is unavailable.");
}

/** Sessions created before the hotel service story get its seed record on first use. */
async function withHotelService(state: DemoState): Promise<DemoState> {
  if (state.hotelService) return state;
  return {
    ...state,
    hotelService: createHotelServiceState(await readFixture("hotel-service.json")),
  };
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
    const state = createInitialState(fixture, await readFixture("hotel-service.json"));
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
  const state = projectState(await withHotelService(session.state as DemoState));
  const visibleEvents = projectEvents(state, events);
  return {
    sessionId,
    version: session.version,
    state,
    events: visibleEvents.map(eventView),
  };
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

      const state = await withHotelService(session.state as DemoState);
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
