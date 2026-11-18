import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deliverWithRetry, pushFailureKind } from "@/lib/admin/push/deliver";

function statusError(statusCode: number): Error {
  const error = new Error(`push ${statusCode}`) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

describe("nouvel essai push", () => {
  it("classe les erreurs temporaires et les abonnements morts", () => {
    assert.equal(pushFailureKind(410), "gone");
    assert.equal(pushFailureKind(404), "gone");
    assert.equal(pushFailureKind(503), "retry");
    assert.equal(pushFailureKind(429), "retry");
    assert.equal(pushFailureKind(0), "retry");
    assert.equal(pushFailureKind(401), "drop");
  });

  it("réussit au deuxième essai sans attendre", async () => {
    let calls = 0;
    const result = await deliverWithRetry(
      async () => {
        calls += 1;
        if (calls === 1) throw statusError(503);
      },
      { delays: [0, 0], sleep: async () => undefined }
    );
    assert.equal(result, "sent");
    assert.equal(calls, 2);
  });

  it("n'insiste pas sur un abonnement expiré", async () => {
    let calls = 0;
    const result = await deliverWithRetry(
      async () => {
        calls += 1;
        throw statusError(410);
      },
      { delays: [0, 0, 0], sleep: async () => undefined }
    );
    assert.equal(result, "gone");
    assert.equal(calls, 1);
  });

  it("s'arrête après les essais temporaires", async () => {
    let calls = 0;
    const result = await deliverWithRetry(
      async () => {
        calls += 1;
        throw statusError(502);
      },
      { delays: [0, 0, 0], sleep: async () => undefined }
    );
    assert.equal(result, "failed");
    assert.equal(calls, 3);
  });
});
