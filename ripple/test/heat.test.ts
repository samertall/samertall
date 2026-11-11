import assert from "node:assert/strict";
import test from "node:test";
import { heatScore, stageFor, tallyPasses } from "../src/lib/heat";
import { safeNext, validateHandle, validateRipple } from "../src/lib/text";

test("recent passes outweigh old ones", () => {
  const hot = heatScore({ passesLastHour: 1, passesLastSixHours: 1, passTotal: 1, replies: 0 });
  const cold = heatScore({ passesLastHour: 0, passesLastSixHours: 0, passTotal: 1, replies: 0 });
  assert.equal(hot, 14);
  assert.equal(cold, 1);
});

test("stages follow the heat thresholds", () => {
  assert.equal(stageFor(14), "ember");
  assert.equal(stageFor(15), "kindling");
  assert.equal(stageFor(40), "wave");
  assert.equal(stageFor(90), "storm");
});

test("tally splits passes by age", () => {
  const now = Date.parse("2026-11-11T12:00:00Z");
  const tally = tallyPasses(
    [new Date(now - 5 * 60 * 1000), new Date(now - 2 * 60 * 60 * 1000), new Date(now - 10 * 60 * 60 * 1000)],
    now,
  );
  assert.equal(tally.passesLastHour, 1);
  assert.equal(tally.passesLastSixHours, 2);
  assert.equal(tally.passTotal, 3);
  assert.equal(tally.passingNow, 1);
});

test("handles and lines have a clear shape", () => {
  assert.equal(validateHandle("ab"), "Use 3–20 letters, numbers, dots, or underscores.");
  assert.equal(validateHandle("nora.vale"), null);
  assert.equal(validateHandle("nora_vale"), null);
  assert.equal(validateHandle("admin"), "That handle is reserved.");
  assert.equal(validateRipple("too short"), "Give it at least 12 characters.");
  assert.equal(validateRipple("A line with enough length."), null);
});

test("next paths stay on this site", () => {
  assert.equal(safeNext("/drop"), "/drop");
  assert.equal(safeNext("https://evil.example"), "/");
  assert.equal(safeNext("//evil.example"), "/");
});
