import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cronAuthorized, secretsMatch } from "@/lib/admin/push/cron-auth";
import {
  decideOutboxUpdate,
  processPushOutbox,
  type PushOutboxJob,
} from "@/lib/admin/push/outbox";

const JOB: PushOutboxJob = {
  id: "job-1",
  inquiryId: "123e4567-e89b-42d3-a456-426614174000",
  attempts: 0,
  createdAt: "2026-11-18T12:00:00.000Z",
  lockedAt: "2026-11-18T12:00:05.000Z",
};

describe("décision de la file push", () => {
  const now = Date.parse("2026-11-18T12:01:00.000Z");

  it("marque l'envoi réussi sans compter une tentative de plus", () => {
    const decision = decideOutboxUpdate({
      outcome: "sent",
      attempts: 2,
      createdAtMs: Date.parse(JOB.createdAt),
      nowMs: now,
    });
    assert.equal(decision.status, "sent");
    assert.equal(decision.attempts, 2);
    assert.equal(decision.sentAt, new Date(now).toISOString());
  });

  it("reporte un échec avec un délai qui double", () => {
    const first = decideOutboxUpdate({
      outcome: "retry",
      attempts: 0,
      createdAtMs: Date.parse(JOB.createdAt),
      nowMs: now,
    });
    const second = decideOutboxUpdate({
      outcome: "retry",
      attempts: 1,
      createdAtMs: Date.parse(JOB.createdAt),
      nowMs: now,
    });
    assert.equal(first.status, "pending");
    assert.equal(first.attempts, 1);
    assert.equal(Date.parse(first.nextAttemptAt) - now, 30_000);
    assert.equal(Date.parse(second.nextAttemptAt) - now, 60_000);
  });

  it("abandonne après le nombre maximal de tentatives", () => {
    const decision = decideOutboxUpdate({
      outcome: "retry",
      attempts: 7,
      createdAtMs: Date.parse(JOB.createdAt),
      nowMs: now,
    });
    assert.equal(decision.status, "dead");
    assert.equal(decision.attempts, 8);
    assert.equal(decision.lastError, "exhausted");
  });

  it("attend la configuration sans brûler les tentatives", () => {
    const decision = decideOutboxUpdate({
      outcome: "skipped",
      attempts: 0,
      createdAtMs: Date.parse(JOB.createdAt),
      nowMs: now,
    });
    assert.equal(decision.status, "pending");
    assert.equal(decision.attempts, 0);
    assert.equal(decision.lastError, "waiting_configuration");
  });
});

describe("traitement de la file push", () => {
  it("renvoie plus tard une notification qui a échoué, une seule fois", async () => {
    const settled: string[] = [];
    const notified: string[] = [];
    const result = await processPushOutbox({
      claim: async () => [JOB, { ...JOB, id: "job-dup" }],
      notify: async (inquiry) => {
        notified.push(inquiry.id);
        return "retry";
      },
      settle: async (job, decision) => {
        settled.push(`${job.id}:${decision.status}:${decision.attempts}`);
      },
      now: () => Date.parse("2026-11-18T12:01:00.000Z"),
    });
    assert.deepEqual(notified, [JOB.inquiryId]);
    assert.deepEqual(settled, ["job-1:pending:1"]);
    assert.equal(result.retry, 1);
    assert.equal(result.unavailable, false);
  });

  it("signale que la file n'est pas encore installée", async () => {
    const result = await processPushOutbox({
      claim: async () => "unavailable",
    });
    assert.equal(result.unavailable, true);
    assert.equal(result.claimed, 0);
  });

  it("deux passages en même temps n'envoient la demande qu'une fois", async () => {
    let available: PushOutboxJob | null = JOB;
    let sends = 0;
    const claim = async () => {
      const job = available;
      available = null;
      return job ? [job] : [];
    };
    await Promise.all([
      processPushOutbox({
        claim,
        notify: async () => {
          sends += 1;
          return "sent";
        },
        settle: async () => undefined,
      }),
      processPushOutbox({
        claim,
        notify: async () => {
          sends += 1;
          return "sent";
        },
        settle: async () => undefined,
      }),
    ]);
    assert.equal(sends, 1);
  });
});

describe("autorisation du cron", () => {
  it("accepte exactement le secret", () => {
    const request = new Request("http://localhost/api/cron/push-outbox", {
      headers: { authorization: "Bearer secret-valeur" },
    });
    assert.equal(cronAuthorized(request, "secret-valeur"), true);
    assert.equal(cronAuthorized(request, "autre"), false);
    assert.equal(cronAuthorized(request, ""), false);
    assert.equal(secretsMatch("a", "a"), true);
  });
});
