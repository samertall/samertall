import "server-only";

import { passed, progressOf, shuffleBy, type GradeDetail } from "@/lib/grade";
import { isId, isSlug, likePattern } from "@/lib/text";
import { flag, num, sql } from "@/server/db";

export type CatalogFilters = { q: string; subject: string; level: string };

export type CatalogCourse = {
  slug: string;
  title: string;
  summary: string;
  subject: string;
  level: string;
  house: boolean;
  minutes: number;
  lessonCount: number;
  exampleCount: number;
  realCount: number;
  authorName: string;
};

export type LessonRef = {
  id: string;
  title: string;
  kind: "reading" | "quiz";
  minutes: number;
  done: boolean;
};

export type ModuleOutline = { id: string; title: string; lessons: LessonRef[] };

export type CourseView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  subject: string;
  level: string;
  house: boolean;
  published: boolean;
  authorName: string;
  minutes: number;
  enrolled: boolean;
  isAuthor: boolean;
  modules: ModuleOutline[];
  lessons: LessonRef[];
  exampleCohort: { name: string; percent: number }[];
  realLearners: number;
  progress: ReturnType<typeof progressOf>;
};

export type PublicChoice = { id: string; label: string };
export type PublicQuestion = { id: string; prompt: string; choices: PublicChoice[] };
export type ReviewChoice = PublicChoice & { correct: boolean; selected: boolean };
export type ReviewQuestion = { id: string; prompt: string; explanation: string; choices: ReviewChoice[] };

export type LessonView = {
  course: CourseView;
  lesson: LessonRef;
  body: string;
  index: number;
  previous: LessonRef | null;
  next: LessonRef | null;
  questions: PublicQuestion[];
  review: ReviewQuestion[] | null;
  latest: { score: number; total: number; passed: boolean } | null;
  best: { score: number; total: number; passed: boolean } | null;
  everPassed: boolean;
};

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  subject: string;
  level: string;
  house: boolean | string | number;
  published: boolean | string | number;
  author_id: string;
  author_name: string;
};

export function readFilters(input: { q?: string; subject?: string; level?: string }): CatalogFilters {
  return {
    q: (input.q ?? "").trim().slice(0, 80),
    subject: (input.subject ?? "").trim().slice(0, 40),
    level: (input.level ?? "").trim().slice(0, 20),
  };
}

const courseSelect = `
  select c.id, c.slug, c.title, c.summary, c.description, c.subject, c.level, c.house, c.published, c.author_id,
    p.name as author_name,
    (select coalesce(sum(l.minutes), 0)::int from lessons l join modules m on m.id = l.module_id where m.course_id = c.id) as minutes,
    (select count(*)::int from lessons l join modules m on m.id = l.module_id where m.course_id = c.id) as lesson_count,
    (select count(*)::int from enrollments e join people sp on sp.id = e.person_id where e.course_id = c.id and sp.sample = true) as example_count,
    (select count(*)::int from enrollments e join people sp on sp.id = e.person_id where e.course_id = c.id and sp.sample = false) as real_count
  from courses c
  join people p on p.id = c.author_id
`;

function toCatalog(row: CourseRow & { minutes: unknown; lesson_count: unknown; example_count: unknown; real_count: unknown }): CatalogCourse {
  return {
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    subject: row.subject,
    level: row.level,
    house: flag(row.house),
    minutes: num(row.minutes),
    lessonCount: num(row.lesson_count),
    exampleCount: num(row.example_count),
    realCount: num(row.real_count),
    authorName: row.author_name,
  };
}

export function catalogJson(course: CatalogCourse) {
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    subject: course.subject,
    level: course.level,
    house: course.house,
    minutes: course.minutes,
    lessons: course.lessonCount,
    author: course.authorName,
    exampleClass: course.exampleCount,
    enrolled: course.realCount,
  };
}

export async function loadCatalog(filters: CatalogFilters) {
  const searching = filters.q.length > 0;
  const rows = await sql<CourseRow & { minutes: unknown; lesson_count: unknown; example_count: unknown; real_count: unknown }>(
    `${courseSelect}
     where c.published = true
       and ($1 = '' or c.subject = $1)
       and ($2 = '' or c.level = $2)
       and ($3 = false or c.title ilike $4 escape '\\' or c.summary ilike $4 escape '\\' or c.subject ilike $4 escape '\\')
     order by c.house desc, c.title asc`,
    [filters.subject, filters.level, searching, searching ? likePattern(filters.q) : "%"],
  );
  return rows.map(toCatalog);
}

export async function loadSubjects() {
  const rows = await sql<{ subject: string }>(
    "select distinct subject from courses where published = true order by subject",
  );
  return rows.map((row) => row.subject);
}

export async function loadContinue(personId: string | null) {
  if (!personId) return null;
  const rows = await sql<{ id: string; slug: string; title: string; total: unknown; done: unknown; enrolled_at: string | Date }>(
    `select c.id, c.slug, c.title,
       (select count(*)::int from lessons l join modules m on m.id = l.module_id where m.course_id = c.id) as total,
       (select count(*)::int from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where m.course_id = c.id and lp.person_id = e.person_id) as done,
       e.enrolled_at
     from enrollments e
     join courses c on c.id = e.course_id
     where e.person_id = $1`,
    [personId],
  );
  const open = rows
    .map((row) => ({ ...row, total: num(row.total), done: num(row.done) }))
    .filter((row) => row.total > 0 && row.done < row.total)
    .sort((a, b) => b.done / b.total - a.done / a.total || String(b.enrolled_at).localeCompare(String(a.enrolled_at)));
  const current = open[0];
  if (!current) return null;
  const next = await sql<{ id: string; title: string }>(
    `select l.id, l.title
     from lessons l
     join modules m on m.id = l.module_id
     left join lesson_progress lp on lp.lesson_id = l.id and lp.person_id = $2
     where m.course_id = $1 and lp.lesson_id is null
     order by m.position, l.position
     limit 1`,
    [current.id, personId],
  );
  const lesson = next[0];
  if (!lesson) return null;
  const progress = progressOf(current.done, current.total);
  return { slug: current.slug, title: current.title, lessonId: lesson.id, lessonTitle: lesson.title, percent: progress.percent };
}

export async function loadCourse(slug: string, personId: string | null): Promise<CourseView | null> {
  if (!isSlug(slug)) return null;
  const rows = await sql<CourseRow>(
    `select c.*, p.name as author_name from courses c join people p on p.id = c.author_id where c.slug = $1`,
    [slug],
  );
  const course = rows[0];
  if (!course) return null;
  const enrolled = personId
    ? (await sql("select 1 as ok from enrollments where person_id = $1 and course_id = $2", [personId, course.id])).length > 0
    : false;
  const isAuthor = personId === course.author_id;
  if (!flag(course.published) && !isAuthor && !enrolled) return null;

  const outline = await sql<{
    module_id: string;
    module_title: string;
    lesson_id: string | null;
    lesson_title: string | null;
    kind: "reading" | "quiz" | null;
    minutes: unknown;
    done: unknown;
  }>(
    `select m.id as module_id, m.title as module_title, l.id as lesson_id, l.title as lesson_title, l.kind, l.minutes,
       (lp.person_id is not null) as done
     from modules m
     left join lessons l on l.module_id = m.id
     left join lesson_progress lp on lp.lesson_id = l.id and lp.person_id = $2
     where m.course_id = $1
     order by m.position, l.position`,
    [course.id, personId ?? ""],
  );

  const modules: ModuleOutline[] = [];
  for (const row of outline) {
    let section = modules.find((item) => item.id === row.module_id);
    if (!section) {
      section = { id: row.module_id, title: row.module_title, lessons: [] };
      modules.push(section);
    }
    if (row.lesson_id && row.lesson_title && row.kind) {
      section.lessons.push({
        id: row.lesson_id,
        title: row.lesson_title,
        kind: row.kind,
        minutes: num(row.minutes),
        done: flag(row.done),
      });
    }
  }
  const lessons = modules.flatMap((module) => module.lessons);
  const cohort = await sql<{ name: string; done: unknown; total: unknown }>(
    `select p.name,
       (select count(*)::int from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where lp.person_id = p.id and m.course_id = e.course_id) as done,
       (select count(*)::int from lessons l join modules m on m.id = l.module_id where m.course_id = e.course_id) as total
     from enrollments e
     join people p on p.id = e.person_id
     where e.course_id = $1 and p.sample = true
     order by p.name`,
    [course.id],
  );
  const counts = await sql<{ minutes: unknown; real_count: unknown }>(
    `select
       (select coalesce(sum(l.minutes), 0)::int from lessons l join modules m on m.id = l.module_id where m.course_id = $1) as minutes,
       (select count(*)::int from enrollments e join people p on p.id = e.person_id where e.course_id = $1 and p.sample = false) as real_count`,
    [course.id],
  );

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    subject: course.subject,
    level: course.level,
    house: flag(course.house),
    published: flag(course.published),
    authorName: course.author_name,
    minutes: num(counts[0]?.minutes),
    enrolled,
    isAuthor,
    modules,
    lessons,
    exampleCohort: cohort.map((row) => ({ name: row.name, percent: progressOf(num(row.done), num(row.total)).percent })),
    realLearners: num(counts[0]?.real_count),
    progress: progressOf(lessons.filter((lesson) => lesson.done).length, lessons.length),
  };
}

export function courseJson(course: CourseView, includeAuthoring: boolean) {
  return {
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    description: course.description,
    subject: course.subject,
    level: course.level,
    house: course.house,
    published: includeAuthoring ? course.published : undefined,
    author: course.authorName,
    minutes: course.minutes,
    enrolled: course.enrolled,
    progress: course.progress,
    learners: course.realLearners,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        kind: lesson.kind,
        minutes: lesson.minutes,
        done: course.enrolled || course.isAuthor ? lesson.done : undefined,
      })),
    })),
  };
}

async function questionRows(lessonId: string) {
  return sql<{
    id: string;
    prompt: string;
    explanation: string;
    position: unknown;
    choice_id: string;
    label: string;
    correct: unknown;
    choice_position: unknown;
  }>(
    `select q.id, q.prompt, q.explanation, q.position, ch.id as choice_id, ch.label, ch.correct, ch.position as choice_position
     from questions q
     join choices ch on ch.question_id = q.id
     where q.lesson_id = $1
     order by q.position, ch.position`,
    [lessonId],
  );
}

function groupQuestions(rows: Awaited<ReturnType<typeof questionRows>>) {
  const questions: {
    id: string;
    prompt: string;
    explanation: string;
    choices: { id: string; label: string; correct: boolean }[];
  }[] = [];
  for (const row of rows) {
    let question = questions.find((item) => item.id === row.id);
    if (!question) {
      question = { id: row.id, prompt: row.prompt, explanation: row.explanation, choices: [] };
      questions.push(question);
    }
    question.choices.push({ id: row.choice_id, label: row.label, correct: flag(row.correct) });
  }
  return questions;
}

export async function loadLesson(slug: string, lessonId: string, personId: string | null, retake: boolean): Promise<
  | { ok: true; lesson: LessonView }
  | { ok: false; code: "missing" | "enroll" }
> {
  if (!isId(lessonId)) return { ok: false, code: "missing" };
  const course = await loadCourse(slug, personId);
  if (!course) return { ok: false, code: "missing" };
  const index = course.lessons.findIndex((lesson) => lesson.id === lessonId);
  const lesson = course.lessons[index];
  if (!lesson || index < 0) return { ok: false, code: "missing" };
  if (!course.enrolled && !course.isAuthor) return { ok: false, code: "enroll" };

  const bodyRows = await sql<{ body: string }>("select body from lessons where id = $1", [lessonId]);
  const grouped = groupQuestions(await questionRows(lessonId));
  const attempts = personId
    ? await sql<{ id: string; score: unknown; total: unknown }>(
        "select id, score, total from quiz_attempts where person_id = $1 and lesson_id = $2 order by submitted_at desc",
        [personId, lessonId],
      )
    : [];
  const scored = attempts.map((row) => ({ id: row.id, score: num(row.score), total: num(row.total), passed: passed(num(row.score), num(row.total)) }));
  const latest = scored[0] ?? null;
  const best = scored.reduce<(typeof scored)[number] | null>((top, row) => {
    if (!top) return row;
    return row.score / Math.max(row.total, 1) > top.score / Math.max(top.total, 1) ? row : top;
  }, null);

  let review: ReviewQuestion[] | null = null;
  if (lesson.kind === "quiz" && latest && !retake && personId) {
    const selected = await sql<{ question_id: string; choice_id: string }>(
      "select question_id, choice_id from attempt_answers where attempt_id = $1",
      [latest.id],
    );
    const picked = new Map(selected.map((row) => [row.question_id, row.choice_id]));
    review = grouped.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      explanation: question.explanation,
      choices: question.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
        correct: choice.correct,
        selected: picked.get(question.id) === choice.id,
      })),
    }));
  }

  const seed = `${lessonId}:${attempts.length}`;
  const questions: PublicQuestion[] = grouped.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    choices: shuffleBy(
      question.choices.map((choice) => ({ id: choice.id, label: choice.label })),
      `${seed}:${question.id}`,
    ),
  }));

  return {
    ok: true,
    lesson: {
      course,
      lesson,
      body: bodyRows[0]?.body ?? "",
      index,
      previous: course.lessons[index - 1] ?? null,
      next: course.lessons[index + 1] ?? null,
      questions,
      review,
      latest: latest ? { score: latest.score, total: latest.total, passed: latest.passed } : null,
      best: best ? { score: best.score, total: best.total, passed: best.passed } : null,
      everPassed: scored.some((row) => row.passed),
    },
  };
}

export function lessonJson(view: LessonView, revealAnswers: boolean) {
  return {
    id: view.lesson.id,
    slug: view.course.slug,
    title: view.lesson.title,
    kind: view.lesson.kind,
    minutes: view.lesson.minutes,
    body: view.body,
    done: view.lesson.done,
    previousId: view.previous?.id ?? null,
    nextId: view.next?.id ?? null,
    questions: revealAnswers
      ? view.review
      : view.questions,
    latest: view.latest,
    best: view.best,
  };
}

export async function loadStudy(personId: string) {
  const courses = await sql<{ slug: string; title: string; subject: string; level: string; total: unknown; done: unknown }>(
    `select c.slug, c.title, c.subject, c.level,
       (select count(*)::int from lessons l join modules m on m.id = l.module_id where m.course_id = c.id) as total,
       (select count(*)::int from lesson_progress lp join lessons l on l.id = lp.lesson_id join modules m on m.id = l.module_id where m.course_id = c.id and lp.person_id = e.person_id) as done
     from enrollments e
     join courses c on c.id = e.course_id
     where e.person_id = $1
     order by e.enrolled_at desc`,
    [personId],
  );
  const nextRows = await sql<{ slug: string; id: string; title: string }>(
    `select c.slug, l.id, l.title
     from enrollments e
     join courses c on c.id = e.course_id
     join modules m on m.course_id = c.id
     join lessons l on l.module_id = m.id
     left join lesson_progress lp on lp.lesson_id = l.id and lp.person_id = e.person_id
     where e.person_id = $1 and lp.lesson_id is null
     order by c.slug, m.position, l.position`,
    [personId],
  );
  const nextBySlug = new Map<string, { id: string; title: string }>();
  for (const row of nextRows) {
    if (!nextBySlug.has(row.slug)) nextBySlug.set(row.slug, { id: row.id, title: row.title });
  }
  const attempts = await sql<{ score: unknown; total: unknown; submitted_at: string | Date; lesson_title: string; course_title: string; slug: string }>(
    `select a.score, a.total, a.submitted_at, l.title as lesson_title, c.title as course_title, c.slug
     from quiz_attempts a
     join lessons l on l.id = a.lesson_id
     join modules m on m.id = l.module_id
     join courses c on c.id = m.course_id
     where a.person_id = $1
     order by a.submitted_at desc
     limit 12`,
    [personId],
  );
  const desk = courses.map((row) => {
    const progress = progressOf(num(row.done), num(row.total));
    const next = nextBySlug.get(row.slug) ?? null;
    return {
      slug: row.slug,
      title: row.title,
      subject: row.subject,
      level: row.level,
      progress,
      next,
    };
  });
  return {
    courses: desk,
    attempts: attempts.map((row) => ({
      score: num(row.score),
      total: num(row.total),
      passed: passed(num(row.score), num(row.total)),
      submittedAt: row.submitted_at,
      lessonTitle: row.lesson_title,
      courseTitle: row.course_title,
      slug: row.slug,
    })),
  };
}

export async function loadOwnedCourses(authorId: string) {
  const rows = await sql<CourseRow & { minutes: unknown; lesson_count: unknown; example_count: unknown; real_count: unknown }>(
    `${courseSelect} where c.author_id = $1 order by c.created_at desc`,
    [authorId],
  );
  return rows.map((row) => ({ ...toCatalog(row), published: flag(row.published) }));
}

export async function loadHouseCourses() {
  const rows = await sql<CourseRow & { minutes: unknown; lesson_count: unknown; example_count: unknown; real_count: unknown }>(
    `${courseSelect} where c.house = true and c.published = true order by c.title asc`,
  );
  return rows.map(toCatalog);
}

export type GradePayload = GradeDetail & { explanation: string; correctChoiceId: string };
