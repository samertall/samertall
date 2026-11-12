import "server-only";

import { scoreAttempt } from "@/lib/grade";
import { failure } from "@/lib/text";
import { isId, isSlug } from "@/lib/text";
import { flag, num, transaction, type Query } from "@/server/db";

type Answer = { questionId: string; choiceId: string };

async function lessonContext(query: Query, lessonId: string, personId: string) {
  const rows = await query<{
    id: string;
    kind: string;
    slug: string;
    course_id: string;
    published: unknown;
    author_id: string;
    enrolled: string | null;
  }>(
    `select l.id, l.kind, c.slug, c.id as course_id, c.published, c.author_id, e.person_id as enrolled
     from lessons l
     join modules m on m.id = l.module_id
     join courses c on c.id = m.course_id
     left join enrollments e on e.course_id = c.id and e.person_id = $2
     where l.id = $1`,
    [lessonId, personId],
  );
  return rows[0] ?? null;
}

function visible(row: { published: unknown; author_id: string; enrolled: string | null }, personId: string) {
  return flag(row.published) || row.author_id === personId || Boolean(row.enrolled);
}

export async function setEnrollment(personId: string, slug: string, intent: "enroll" | "leave") {
  if (!isSlug(slug)) return failure("missing", 404);
  return transaction(async (query) => {
    const courses = await query<{ id: string; published: unknown; author_id: string }>(
      "select id, published, author_id from courses where slug = $1",
      [slug],
    );
    const course = courses[0];
    if (!course) return failure("missing", 404);
    if (intent === "leave") {
      await query("delete from enrollments where person_id = $1 and course_id = $2", [personId, course.id]);
      return { ok: true as const, slug, nextLessonId: null as string | null };
    }
    if (!flag(course.published) && course.author_id !== personId) return failure("missing", 404);
    await query(
      "insert into enrollments (person_id, course_id) values ($1, $2) on conflict do nothing",
      [personId, course.id],
    );
    const next = await query<{ id: string }>(
      `select l.id
       from modules m
       join lessons l on l.module_id = m.id
       left join lesson_progress lp on lp.lesson_id = l.id and lp.person_id = $2
       where m.course_id = $1 and lp.lesson_id is null
       order by m.position, l.position
       limit 1`,
      [course.id, personId],
    );
    let nextLessonId = next[0]?.id ?? null;
    if (!nextLessonId) {
      const first = await query<{ id: string }>(
        `select l.id from modules m join lessons l on l.module_id = m.id
         where m.course_id = $1 order by m.position, l.position limit 1`,
        [course.id],
      );
      nextLessonId = first[0]?.id ?? null;
    }
    return { ok: true as const, slug, nextLessonId };
  });
}

export async function completeReading(personId: string, lessonId: string) {
  if (!isId(lessonId)) return failure("missing", 404);
  return transaction(async (query) => {
    const lesson = await lessonContext(query, lessonId, personId);
    if (!lesson || !visible(lesson, personId)) return failure("missing", 404);
    if (lesson.kind !== "reading") return failure("invalid");
    if (!lesson.enrolled) return failure("enroll", 403);
    await query(
      "insert into lesson_progress (person_id, lesson_id) values ($1, $2) on conflict do nothing",
      [personId, lessonId],
    );
    const next = await query<{ id: string }>(
      `select l2.id
       from lessons l
       join modules m on m.id = l.module_id
       join modules m2 on m2.course_id = m.course_id
       join lessons l2 on l2.module_id = m2.id
       left join lesson_progress lp on lp.lesson_id = l2.id and lp.person_id = $2
       where l.id = $1 and lp.lesson_id is null
       order by m2.position, l2.position
       limit 1`,
      [lessonId, personId],
    );
    return { ok: true as const, slug: lesson.slug, nextLessonId: next[0]?.id ?? null };
  });
}

export async function submitQuiz(personId: string, lessonId: string, answers: Answer[]) {
  if (!isId(lessonId)) return failure("missing", 404);
  if (answers.length > 40) return failure("invalid");
  for (const answer of answers) {
    if (!isId(answer.questionId) || !isId(answer.choiceId)) return failure("invalid");
  }
  return transaction(async (query) => {
    const lesson = await lessonContext(query, lessonId, personId);
    if (!lesson || !visible(lesson, personId)) return failure("missing", 404);
    if (lesson.kind !== "quiz") return failure("invalid");
    if (!lesson.enrolled) return failure("enroll", 403);
    const questions = await query<{ id: string; explanation: string; correct_id: string | null }>(
      `select q.id, q.explanation,
         (select ch.id from choices ch where ch.question_id = q.id and ch.correct = true order by ch.position limit 1) as correct_id
       from questions q
       where q.lesson_id = $1
       order by q.position`,
      [lessonId],
    );
    if (questions.length === 0 || questions.some((question) => !question.correct_id)) return failure("quiz-empty");
    const provided = new Map<string, string>();
    for (const answer of answers) provided.set(answer.questionId, answer.choiceId);
    if (questions.some((question) => !provided.has(question.id))) return failure("answers");

    const choices = await query<{ id: string; question_id: string }>(
      `select ch.id, ch.question_id
       from choices ch
       join questions q on q.id = ch.question_id
       where q.lesson_id = $1`,
      [lessonId],
    );
    const allowed = new Set(choices.map((choice) => `${choice.question_id}:${choice.id}`));
    const clean = questions.map((question) => {
      const choiceId = provided.get(question.id) ?? "";
      return {
        questionId: question.id,
        choiceId: allowed.has(`${question.id}:${choiceId}`) ? choiceId : "",
      };
    });
    const graded = scoreAttempt(
      questions.map((question) => ({ id: question.id, correctChoiceId: question.correct_id ?? "" })),
      clean,
    );
    const attemptId = `attempt_${crypto.randomUUID()}`;
    await query(
      "insert into quiz_attempts (id, person_id, lesson_id, score, total) values ($1, $2, $3, $4, $5)",
      [attemptId, personId, lessonId, graded.score, graded.total],
    );
    for (const item of clean) {
      if (!item.choiceId) continue;
      await query(
        "insert into attempt_answers (attempt_id, question_id, choice_id) values ($1, $2, $3)",
        [attemptId, item.questionId, item.choiceId],
      );
    }
    if (graded.passed) {
      await query(
        "insert into lesson_progress (person_id, lesson_id) values ($1, $2) on conflict do nothing",
        [personId, lessonId],
      );
    }
    const explanations = new Map(questions.map((question) => [question.id, question.explanation]));
    return {
      ok: true as const,
      slug: lesson.slug,
      lessonId,
      score: graded.score,
      total: graded.total,
      passed: graded.passed,
      detail: graded.detail.map((item) => ({
        ...item,
        explanation: explanations.get(item.questionId) ?? "",
        correctChoiceId: questions.find((question) => question.id === item.questionId)?.correct_id ?? "",
      })),
    };
  });
}

export function answersFromForm(formData: FormData) {
  const answers: Answer[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q_") || typeof value !== "string") continue;
    answers.push({ questionId: key.slice(2), choiceId: value });
  }
  return answers;
}

export function answersFromJson(value: unknown) {
  if (!Array.isArray(value) || value.length > 40) return null;
  const answers: Answer[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const record = item as Record<string, unknown>;
    if (typeof record.questionId !== "string" || typeof record.choiceId !== "string") return null;
    answers.push({ questionId: record.questionId, choiceId: record.choiceId });
  }
  return answers;
}

export function scoreLabel(score: number, total: number) {
  return `${num(score)} / ${num(total)}`;
}
