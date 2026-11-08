import {
  ApplyProgrammeDemoActionBody,
  ApplyProgrammeDemoActionResponse,
  ExportProgrammeDemoResponse,
  GetProgrammeDemoResponse,
} from "@workspace/api-zod";

export type DemoRole = "innmetric" | "department" | "hotel" | "provider";
export type DemoAction =
  | "role.switch"
  | "discovery.run"
  | "need.confirm"
  | "consultation.add"
  | "savings.edit"
  | "savings.approve"
  | "collection.set"
  | "collection.approve"
  | "collection.post"
  | "allocation.approve"
  | "support.approve"
  | "support.edit"
  | "support.reserve"
  | "support.pay"
  | "support.directPayment"
  | "quote.submit"
  | "delivery.mark"
  | "outcome.confirm"
  | "commercial.request"
  | "commercial.propose"
  | "commercial.invoiceDraft"
  | "ledger.correctionRequest";

export type DemoSnapshot = ReturnType<typeof GetProgrammeDemoResponse.parse>;
export type DemoExport = ReturnType<typeof ExportProgrammeDemoResponse.parse>;

const SESSION_KEY = "innmetric-programme-demo-session-v1";

export function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

async function parseResponse<T>(response: Response, schema: { parse: (data: unknown) => T }) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : `Request failed with status ${response.status}.`,
    );
  }
  return schema.parse(body);
}

export async function loadDemo(sessionId: string) {
  const response = await fetch("/api/demo", {
    headers: { "X-Demo-Session": sessionId },
  });
  return parseResponse(response, GetProgrammeDemoResponse);
}

export async function sendDemoAction(
  sessionId: string,
  action: DemoAction,
  payload: Record<string, unknown> = {},
  idempotencyKey?: string,
) {
  const body = ApplyProgrammeDemoActionBody.parse({
    action,
    payload,
    ...(idempotencyKey ? { idempotencyKey } : {}),
  });
  const response = await fetch("/api/demo/actions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Demo-Session": sessionId,
    },
    body: JSON.stringify(body),
  });
  return parseResponse(response, ApplyProgrammeDemoActionResponse);
}

export async function downloadDemoExport(sessionId: string) {
  const response = await fetch("/api/demo/export", {
    headers: { "X-Demo-Session": sessionId },
  });
  const data = await parseResponse(response, ExportProgrammeDemoResponse);
  const file = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `innmetric-synthetic-demo-${sessionId.slice(0, 8)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return data;
}
