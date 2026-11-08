import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const programmeDemoSessions = pgTable(
  "programme_demo_sessions",
  {
    id: uuid("id").primaryKey(),
    role: text("role").notNull(),
    hotelId: text("hotel_id"),
    version: integer("version").notNull().default(1),
    state: jsonb("state").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("programme_demo_sessions_updated_idx").on(table.updatedAt)],
);

export const programmeDemoEvents = pgTable(
  "programme_demo_events",
  {
    id: uuid("id").primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => programmeDemoSessions.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    actorId: text("actor_id").notNull(),
    actorRole: text("actor_role").notNull(),
    action: text("action").notNull(),
    entityId: text("entity_id").notNull(),
    previousStatus: text("previous_status"),
    newStatus: text("new_status"),
    reason: text("reason").notNull(),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    idempotencyKey: text("idempotency_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("programme_demo_events_sequence_unique").on(
      table.sessionId,
      table.sequence,
    ),
    uniqueIndex("programme_demo_events_idempotency_unique").on(
      table.sessionId,
      table.idempotencyKey,
    ),
    index("programme_demo_events_session_created_idx").on(
      table.sessionId,
      table.createdAt,
    ),
  ],
);

export type ProgrammeDemoSession = typeof programmeDemoSessions.$inferSelect;
export type ProgrammeDemoEvent = typeof programmeDemoEvents.$inferSelect;
