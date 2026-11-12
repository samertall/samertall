import assert from "node:assert/strict";
import test from "node:test";
import { formatMinutes, passed, progressOf, scoreAttempt } from "../src/lib/grade";
import { parseMarkdown } from "../src/lib/markdown";
import { noticeText } from "../src/lib/notices";
import { isId, likePattern, parseChoices, slugify } from "../src/lib/text";

test("a quiz passes at 70 percent and not below", () => {
  const questions = [
    { id: "q1", correctChoiceId: "q1:0" },
    { id: "q2", correctChoiceId: "q2:1" },
    { id: "q3", correctChoiceId: "q3:2" },
    { id: "q4", correctChoiceId: "q4:0" },
  ];
  const three = scoreAttempt(questions, [
    { questionId: "q1", choiceId: "q1:0" },
    { questionId: "q2", choiceId: "q2:1" },
    { questionId: "q3", choiceId: "q3:2" },
    { questionId: "q4", choiceId: "q4:3" },
  ]);
  assert.equal(three.score, 3);
  assert.equal(three.passed, true);
  assert.equal(passed(2, 4), false);
  assert.equal(passed(0, 0), false);
});

test("a wrong or missing choice does not score", () => {
  const result = scoreAttempt([{ id: "q1", correctChoiceId: "q1:0" }], []);
  assert.equal(result.detail[0]?.correct, false);
  assert.equal(result.detail[0]?.choiceId, null);
});

test("progress completes only when every lesson is done", () => {
  assert.deepEqual(progressOf(2, 4), { done: 2, total: 4, percent: 50, complete: false });
  assert.equal(progressOf(4, 4).complete, true);
  assert.equal(progressOf(0, 0).complete, false);
});

test("minutes format stays compact", () => {
  assert.equal(formatMinutes(45), "45 min");
  assert.equal(formatMinutes(60), "1 hr");
  assert.equal(formatMinutes(80), "1 hr 20 min");
});

test("slugs and search patterns stay safe", () => {
  assert.equal(slugify("Giving a Critique"), "giving-a-critique");
  assert.equal(slugify("  "), "course");
  assert.equal(likePattern("100%_done"), "%100\\%\\_done%");
  assert.equal(isId("q_critique_1:0"), true);
  assert.equal(isId("bad id"), false);
});

test("choices need two answers and one correct", () => {
  const parsed = parseChoices(["A", "B", "", ""], 1);
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.deepEqual(parsed.value.map((choice) => choice.correct), [false, true]);
  assert.equal(parseChoices(["Only one", "", "", ""], 0).ok, false);
});

test("unknown notices are not echoed", () => {
  assert.equal(noticeText("sign-in"), "Sign in to continue.");
  assert.equal(noticeText("<script>"), null);
  assert.equal(noticeText(undefined), null);
});

test("lesson markdown keeps html as text", () => {
  const blocks = parseMarkdown("Hello <script>alert(1)</script>\n\n- One\n- Two\n\n> A line\n\n**Bold** and `code`");
  assert.equal(blocks[0]?.type, "p");
  if (blocks[0]?.type === "p") assert.match(blocks[0].text, /<script>/);
  assert.equal(blocks.some((block) => block.type === "ul"), true);
  assert.equal(blocks.some((block) => block.type === "quote"), true);
});
