import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { waitAndScrollToHash } from "@/lib/scroll-to-section";

describe("anchor navigation after closing a scroll-locked menu", () => {
  let frames: FrameRequestCallback[];
  let locked: boolean;
  let present: boolean;
  let calls: number;
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  beforeEach(() => {
    frames = []; locked = true; present = true; calls = 0;
    Object.defineProperty(globalThis, "window", { configurable: true, value: {
      matchMedia: () => ({ matches: false }), requestAnimationFrame: (callback: FrameRequestCallback) => { frames.push(callback); return frames.length; },
    } });
    Object.defineProperty(globalThis, "document", { configurable: true, value: {
      body: { style: { get position() { return locked ? "fixed" : ""; } } },
      documentElement: { dataset: {} },
      getElementById: () => present ? { scrollIntoView: () => { calls += 1; } } : null,
    } });
  });
  afterEach(() => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
    Object.defineProperty(globalThis, "document", { configurable: true, value: previousDocument });
    mock.restoreAll();
  });
  function frame() { const current = frames.splice(0); for (const callback of current) callback(0); }
  it("waits for unlock and scroll-restoration frames before moving to the section", () => {
    waitAndScrollToHash("#faq");
    frame(); frame(); assert.equal(calls, 0);
    locked = false;
    frame(); frame(); assert.equal(calls, 0);
    frame(); assert.equal(calls, 1);
    frame(); assert.equal(calls, 1);
  });
  it("waits for a lazily rendered destination", () => {
    locked = false; present = false;
    waitAndScrollToHash("#faq"); frame(); assert.equal(calls, 0);
    present = true; frame(); frame(); frame(); assert.equal(calls, 1);
  });
  it("cancels an outdated destination", () => {
    const cancel = waitAndScrollToHash("#faq"); cancel(); locked = false;
    frame(); frame(); frame(); assert.equal(calls, 0);
  });
});
