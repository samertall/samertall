import "server-only";

import { failure, isId, isSlug, parseBody, parseChoices, parseDescription, parseExplanation, parseKind, parseLessonTitle, parseLevel, parseMinutes, parseModuleTitle, parseQuestion, parseSubject, parseSummary, parseTitle, slugify } from "@/lib/text";
import { flag, num, sql, transaction, type Query } from "@/server/db";

const QUIZ_INTRO = "Pass with 70% or better. You can retake the quiz.";

function nid(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function ownCourse(query: Query, authorId: string, slug: string) {
  if (!isSlug(slug)) return failure("missing", 404);
  const rows = await query<{ id: string; slug: string; author_id: string; published: unknown }>(
    "select id, slug, author_id, published from courses where slug = $1",
    [slug],
  );
  const course = rows[0];
  if (!course) return failure("missing", 404);
  if (course.author_id !== authorId) return failure("forbidden", 403);
  return { ok: true as const, course };
}

async function moveWithin(query: Query, table: "modules" | "lessons", scopeId: string, id: string, direction: "up" | "down") {
  const rows = await query<{ id: string; position: number }>(
    table === "modules"
      ? "select id, position from modules where course_id = $1 order by position, id"
      : "select id, position from lessons where module_id = $1 order by position, id",
    [scopeId],
  );
  const index = rows.findIndex((row) => row.id === id);
  const neighbor = direction === "up" ? index - 1 : index + 1;
  const current = rows[index];
  const other = rows[neighbor];
  if (!current || !other) return;
  const update = table === "modules"
    ? "update modules set position = $1 where id = $2"
    : "update lessons set position = $1 where id = $2";
  await query(update, [-1 - num(current.position), current.id]);
  await query(update, [num(current.position), other.id]);
  await query(update, [num(other.position), current.id]);
}

export async function createCourse(authorId: string, input: { title: unknown; summary: unknown; description: unknown; subject: unknown; level: unknown }) {
  const title = parseTitle(input.title);
  if (!title.ok) return failure(title.code);
  const summary = parseSummary(input.summary);
  if (!summary.ok) return failure(summary.code);
  const description = parseDescription(input.description);
  if (!description.ok) return failure(description.code);
  const subject = parseSubject(input.subject);
  if (!subject.ok) return failure(subject.code);
  const level = parseLevel(input.level);
  if (!level.ok) return failure(level.code);

  return transaction(async (query) => {
    const base = slugify(title.value);
    let slug = base;
    let free = false;
    for (let attempt = 1; attempt < 40; attempt += 1) {
      const candidate = attempt === 1 ? base : `${base}-${attempt}`;
      const existing = await query("select 1 from courses where slug = $1", [candidate]);
      if (existing.length === 0) {
        slug = candidate;
        free = true;
        break;
      }
    }
    if (!free) slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
    const id = nid("course");
    await query(
      `insert into courses (id, slug, title, summary, description, subject, level, published, house, author_id)
       values ($1, $2, $3, $4, $5, $6, $7, false, false, $8)`,
      [id, slug, title.value, summary.value, description.value, subject.value, level.value, authorId],
    );
    return { ok: true as const, slug };
  });
}

export async function updateCourse(authorId: string, slug: string, input: { title: unknown; summary: unknown; description: unknown; subject: unknown; level: unknown }) {
  const title = parseTitle(input.title);
  if (!title.ok) return failure(title.code);
  const summary = parseSummary(input.summary);
  if (!summary.ok) return failure(summary.code);
  const description = parseDescription(input.description);
  if (!description.ok) return failure(description.code);
  const subject = parseSubject(input.subject);
  if (!subject.ok) return failure(subject.code);
  const level = parseLevel(input.level);
  if (!level.ok) return failure(level.code);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    await query(
      "update courses set title = $1, summary = $2, description = $3, subject = $4, level = $5 where id = $6",
      [title.value, summary.value, description.value, subject.value, level.value, owned.course.id],
    );
    return { ok: true as const, slug };
  });
}

export async function setPublished(authorId: string, slug: string, published: boolean) {
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    if (published) {
      const lessons = await query<{ kind: string; questions: unknown }>(
        `select l.kind, (select count(*)::int from questions q where q.lesson_id = l.id) as questions
         from lessons l join modules m on m.id = l.module_id where m.course_id = $1`,
        [owned.course.id],
      );
      if (lessons.length === 0) return failure("need-lesson");
      if (lessons.some((lesson) => lesson.kind === "quiz" && num(lesson.questions) === 0)) return failure("need-question");
    }
    await query("update courses set published = $1 where id = $2", [published, owned.course.id]);
    return { ok: true as const, slug };
  });
}

export async function deleteCourse(authorId: string, slug: string) {
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    await query("delete from courses where id = $1", [owned.course.id]);
    return { ok: true as const, slug };
  });
}

export async function addModule(authorId: string, slug: string, titleInput: unknown) {
  const title = parseModuleTitle(titleInput);
  if (!title.ok) return failure(title.code);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    const count = await query<{ n: unknown }>("select count(*)::int as n from modules where course_id = $1", [owned.course.id]);
    if (num(count[0]?.n) >= 40) return failure("too-many-modules");
    const position = await query<{ n: unknown }>("select coalesce(max(position), -1)::int as n from modules where course_id = $1", [owned.course.id]);
    await query("insert into modules (id, course_id, title, position) values ($1, $2, $3, $4)", [
      nid("mod"),
      owned.course.id,
      title.value,
      num(position[0]?.n) + 1,
    ]);
    return { ok: true as const, slug };
  });
}

export async function renameModule(authorId: string, slug: string, moduleId: string, titleInput: unknown) {
  if (!isId(moduleId)) return failure("missing", 404);
  const title = parseModuleTitle(titleInput);
  if (!title.ok) return failure(title.code);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    const updated = await query("update modules set title = $1 where id = $2 and course_id = $3 returning id", [title.value, moduleId, owned.course.id]);
    if (updated.length === 0) return failure("missing", 404);
    return { ok: true as const, slug };
  });
}

export async function deleteModule(authorId: string, slug: string, moduleId: string) {
  if (!isId(moduleId)) return failure("missing", 404);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    const removed = await query("delete from modules where id = $1 and course_id = $2 returning id", [moduleId, owned.course.id]);
    if (removed.length === 0) return failure("missing", 404);
    return { ok: true as const, slug };
  });
}

export async function moveModule(authorId: string, slug: string, moduleId: string, direction: "up" | "down") {
  if (!isId(moduleId)) return failure("missing", 404);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    await moveWithin(query, "modules", owned.course.id, moduleId, direction);
    return { ok: true as const, slug };
  });
}

export async function addLesson(authorId: string, slug: string, moduleId: string, input: { title: unknown; kind: unknown; minutes: unknown }) {
  if (!isId(moduleId)) return failure("missing", 404);
  const title = parseLessonTitle(input.title);
  if (!title.ok) return failure(title.code);
  const kind = parseKind(input.kind);
  if (!kind.ok) return failure(kind.code);
  const minutes = parseMinutes(input.minutes);
  if (!minutes.ok) return failure(minutes.code);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    const modules = await query("select id from modules where id = $1 and course_id = $2", [moduleId, owned.course.id]);
    if (modules.length === 0) return failure("missing", 404);
    const count = await query<{ n: unknown }>("select count(*)::int as n from lessons where module_id = $1", [moduleId]);
    if (num(count[0]?.n) >= 30) return failure("too-many-lessons");
    const position = await query<{ n: unknown }>("select coalesce(max(position), -1)::int as n from lessons where module_id = $1", [moduleId]);
    const body = kind.value === "quiz" ? QUIZ_INTRO : "Start the reading here.\n\n## A heading\n\nWrite in short paragraphs. Use `-` for a list.";
    await query(
      "insert into lessons (id, module_id, title, kind, body, minutes, position) values ($1, $2, $3, $4, $5, $6, $7)",
      [nid("les"), moduleId, title.value, kind.value, body, minutes.value, num(position[0]?.n) + 1],
    );
    return { ok: true as const, slug };
  });
}

async function ownLesson(query: Query, authorId: string, slug: string, lessonId: string) {
  const owned = await ownCourse(query, authorId, slug);
  if (!owned.ok) return owned;
  const rows = await query<{ id: string; module_id: string; kind: string }>(
    `select l.id, l.module_id, l.kind
     from lessons l join modules m on m.id = l.module_id
     where l.id = $1 and m.course_id = $2`,
    [lessonId, owned.course.id],
  );
  const lesson = rows[0];
  if (!lesson) return failure("missing", 404);
  return { ok: true as const, course: owned.course, lesson };
}

export async function updateLesson(authorId: string, slug: string, lessonId: string, input: { title: unknown; minutes: unknown; body: unknown }) {
  if (!isId(lessonId)) return failure("missing", 404);
  const title = parseLessonTitle(input.title);
  if (!title.ok) return failure(title.code);
  const minutes = parseMinutes(input.minutes);
  if (!minutes.ok) return failure(minutes.code);
  const body = parseBody(input.body);
  if (!body.ok) return failure(body.code);
  return transaction(async (query) => {
    const owned = await ownLesson(query, authorId, slug, lessonId);
    if (!owned.ok) return owned;
    await query("update lessons set title = $1, minutes = $2, body = $3 where id = $4", [title.value, minutes.value, body.value, lessonId]);
    return { ok: true as const, slug };
  });
}

export async function deleteLesson(authorId: string, slug: string, lessonId: string) {
  if (!isId(lessonId)) return failure("missing", 404);
  return transaction(async (query) => {
    const owned = await ownLesson(query, authorId, slug, lessonId);
    if (!owned.ok) return owned;
    await query("delete from lessons where id = $1", [lessonId]);
    return { ok: true as const, slug };
  });
}

export async function moveLesson(authorId: string, slug: string, lessonId: string, direction: "up" | "down") {
  if (!isId(lessonId)) return failure("missing", 404);
  return transaction(async (query) => {
    const owned = await ownLesson(query, authorId, slug, lessonId);
    if (!owned.ok) return owned;
    await moveWithin(query, "lessons", owned.lesson.module_id, lessonId, direction);
    return { ok: true as const, slug };
  });
}

export async function addQuestion(authorId: string, slug: string, lessonId: string, input: { prompt: unknown; explanation: unknown; labels: unknown[]; correctIndex: unknown }) {
  if (!isId(lessonId)) return failure("missing", 404);
  const prompt = parseQuestion(input.prompt);
  if (!prompt.ok) return failure(prompt.code);
  const explanation = parseExplanation(input.explanation);
  if (!explanation.ok) return failure(explanation.code);
  const choices = parseChoices(input.labels, input.correctIndex);
  if (!choices.ok) return failure(choices.code);
  return transaction(async (query) => {
    const owned = await ownLesson(query, authorId, slug, lessonId);
    if (!owned.ok) return owned;
    if (owned.lesson.kind !== "quiz") return failure("invalid");
    const count = await query<{ n: unknown }>("select count(*)::int as n from questions where lesson_id = $1", [lessonId]);
    if (num(count[0]?.n) >= 20) return failure("too-many-questions");
    const position = await query<{ n: unknown }>("select coalesce(max(position), -1)::int as n from questions where lesson_id = $1", [lessonId]);
    const questionId = nid("q");
    await query(
      "insert into questions (id, lesson_id, prompt, explanation, position) values ($1, $2, $3, $4, $5)",
      [questionId, lessonId, prompt.value, explanation.value, num(position[0]?.n) + 1],
    );
    for (const [index, choice] of choices.value.entries()) {
      await query(
        "insert into choices (id, question_id, label, correct, position) values ($1, $2, $3, $4, $5)",
        [`${questionId}:${index}`, questionId, choice.label, choice.correct, index],
      );
    }
    return { ok: true as const, slug };
  });
}

export async function deleteQuestion(authorId: string, slug: string, questionId: string) {
  if (!isId(questionId)) return failure("missing", 404);
  return transaction(async (query) => {
    const owned = await ownCourse(query, authorId, slug);
    if (!owned.ok) return owned;
    const removed = await query(
      `delete from questions
       where id = $1 and lesson_id in (
         select l.id from lessons l join modules m on m.id = l.module_id where m.course_id = $2
       )
       returning id`,
      [questionId, owned.course.id],
    );
    if (removed.length === 0) return failure("missing", 404);
    return { ok: true as const, slug };
  });
}

export type StudioQuestion = { id: string; prompt: string; explanation: string; choices: { id: string; label: string; correct: boolean }[] };
export type StudioLesson = {
  id: string;
  title: string;
  kind: "reading" | "quiz";
  minutes: number;
  body: string;
  questions: StudioQuestion[];
};
export type StudioModule = { id: string; title: string; lessons: StudioLesson[] };

export async function loadStudio(slug: string, authorId: string) {
  if (!isSlug(slug)) return null;
  const courses = await sql<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    description: string;
    subject: string;
    level: string;
    published: unknown;
    author_id: string;
  }>("select id, slug, title, summary, description, subject, level, published, author_id from courses where slug = $1", [slug]);
  const course = courses[0];
  if (!course || course.author_id !== authorId) return null;
  const moduleRows = await sql<{ id: string; title: string }>(
    "select id, title from modules where course_id = $1 order by position, id",
    [course.id],
  );
  const lessonRows = await sql<{ id: string; module_id: string; title: string; kind: "reading" | "quiz"; minutes: unknown; body: string }>(
    `select l.id, l.module_id, l.title, l.kind, l.minutes, l.body
     from lessons l join modules m on m.id = l.module_id
     where m.course_id = $1 order by m.position, l.position, l.id`,
    [course.id],
  );
  const choiceRows = await sql<{ question_id: string; lesson_id: string; prompt: string; explanation: string; choice_id: string; label: string; correct: unknown }>(
    `select q.id as question_id, q.lesson_id, q.prompt, q.explanation, ch.id as choice_id, ch.label, ch.correct
     from questions q
     join lessons l on l.id = q.lesson_id
     join modules m on m.id = l.module_id
     left join choices ch on ch.question_id = q.id
     where m.course_id = $1
     order by q.position, ch.position`,
    [course.id],
  );
  const questionsByLesson = new Map<string, StudioQuestion[]>();
  for (const row of choiceRows) {
    const list = questionsByLesson.get(row.lesson_id) ?? [];
    let question = list.find((item) => item.id === row.question_id);
    if (!question) {
      question = { id: row.question_id, prompt: row.prompt, explanation: row.explanation, choices: [] };
      list.push(question);
      questionsByLesson.set(row.lesson_id, list);
    }
    if (row.choice_id) question.choices.push({ id: row.choice_id, label: row.label, correct: flag(row.correct) });
  }
  const lessonsByModule = new Map<string, StudioLesson[]>();
  for (const row of lessonRows) {
    const list = lessonsByModule.get(row.module_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      kind: row.kind,
      minutes: num(row.minutes),
      body: row.body,
      questions: questionsByLesson.get(row.id) ?? [],
    });
    lessonsByModule.set(row.module_id, list);
  }
  const roster = await sql<{ name: string; email: string; enrolled_at: string | Date; done: unknown; total: unknown }>(
    `select p.name, p.email, e.enrolled_at,
       (select count(*)::int from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where lp.person_id = p.id and m.course_id = e.course_id) as done,
       (select count(*)::int from lessons l join modules m on m.id = l.module_id where m.course_id = e.course_id) as total
     from enrollments e
     join people p on p.id = e.person_id
     where e.course_id = $1 and p.sample = false
     order by e.enrolled_at`,
    [course.id],
  );
  const modules: StudioModule[] = moduleRows.map((module) => ({
    id: module.id,
    title: module.title,
    lessons: lessonsByModule.get(module.id) ?? [],
  }));
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    subject: course.subject,
    level: course.level,
    published: flag(course.published),
    modules,
    roster: roster.map((row) => ({
      name: row.name,
      email: row.email,
      enrolledAt: row.enrolled_at,
      done: num(row.done),
      total: num(row.total),
    })),
  };
}

function asDirection(value: unknown) {
  return value === "up" || value === "down" ? value : null;
}

export async function runStudioOp(authorId: string, slug: string, body: Record<string, unknown>) {
  switch (body.op) {
    case "update":
      return updateCourse(authorId, slug, {
        title: body.title,
        summary: body.summary,
        description: body.description,
        subject: body.subject,
        level: body.level,
      });
    case "publish":
      return setPublished(authorId, slug, body.published === true);
    case "add-module":
      return addModule(authorId, slug, body.title);
    case "rename-module":
      return renameModule(authorId, slug, String(body.moduleId ?? ""), body.title);
    case "delete-module":
      return deleteModule(authorId, slug, String(body.moduleId ?? ""));
    case "move-module": {
      const direction = asDirection(body.direction);
      if (!direction) return failure("invalid");
      return moveModule(authorId, slug, String(body.moduleId ?? ""), direction);
    }
    case "add-lesson":
      return addLesson(authorId, slug, String(body.moduleId ?? ""), {
        title: body.title,
        kind: body.kind,
        minutes: body.minutes,
      });
    case "update-lesson":
      return updateLesson(authorId, slug, String(body.lessonId ?? ""), {
        title: body.title,
        minutes: body.minutes,
        body: body.body,
      });
    case "delete-lesson":
      return deleteLesson(authorId, slug, String(body.lessonId ?? ""));
    case "move-lesson": {
      const direction = asDirection(body.direction);
      if (!direction) return failure("invalid");
      return moveLesson(authorId, slug, String(body.lessonId ?? ""), direction);
    }
    case "add-question":
      return addQuestion(authorId, slug, String(body.lessonId ?? ""), {
        prompt: body.prompt,
        explanation: body.explanation,
        labels: Array.isArray(body.choices) ? body.choices : [],
        correctIndex: body.correctIndex,
      });
    case "delete-question":
      return deleteQuestion(authorId, slug, String(body.questionId ?? ""));
    case "delete":
      return deleteCourse(authorId, slug);
    default:
      return failure("invalid");
  }
}
