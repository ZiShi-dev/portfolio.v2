import { cronAuthorized } from "@/lib/admin/push/cron-auth";
import { processPushOutbox } from "@/lib/admin/push/outbox";
import { jsonResponse } from "@/lib/api/json-response";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function drain(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  if (!cronAuthorized(request, secret)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const result = await processPushOutbox();
  return jsonResponse({ ok: true, ...result }, 200);
}

/** Appel externe (cron-job.org) : GET + Authorization: Bearer CRON_SECRET. */
export function GET(request: Request) {
  return drain(request);
}

export function POST(request: Request) {
  return drain(request);
}
