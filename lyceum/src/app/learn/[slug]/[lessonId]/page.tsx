import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { completeReadingAction } from "@/app/actions";
import { LessonBody } from "@/lib/markdown";
import { QuizForm, QuizReview } from "@/components/quiz";
import { SubmitButton } from "@/components/widgets";
import { isId, isSlug } from "@/lib/text";
import { sql } from "@/server/db";
import { loadLesson } from "@/server/read";
import { readViewer } from "@/server/viewer";

type Params = Promise<{ slug: string; lessonId: string }>;
type Search = Promise<{ retake?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();
  const { slug, lessonId } = await params;
  if (!isSlug(slug) || !isId(lessonId)) return { title: "Lesson" };
  const rows = await sql<{ title: string; summary: string }>(
    `select l.title, c.summary
     from lessons l
     join modules m on m.id = l.module_id
     join courses c on c.id = m.course_id
     where c.slug = $1 and l.id = $2 and c.published = true`,
    [slug, lessonId],
  );
  const row = rows[0];
  if (!row) return { title: "Lesson" };
  return { title: row.title, description: row.summary };
}

export default function LearnPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <Learn params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Learn({ params, searchParams }: { params: Params; searchParams: Search }) {
  await connection();
  const { slug, lessonId } = await params;
  const query = await searchParams;
  const viewer = await readViewer();
  const personId = viewer.kind === "person" ? viewer.id : null;
  const loaded = await loadLesson(slug, lessonId, personId, query.retake === "1");
  if (!loaded.ok) {
    if (loaded.code === "enroll") redirect(`/courses/${slug}?notice=enroll`);
    notFound();
  }
  const { course, lesson, body, questions, review, latest, best, previous, next } = loaded.lesson;

  return (
    <div className="page lesson-grid">
      <aside className="rail">
        <div>
          <h2>Course</h2>
          <Link href={`/courses/${course.slug}`}>{course.title}</Link>
        </div>
        {course.modules.map((module) => (
          <div key={module.id}>
            <h2>{module.title}</h2>
            <ol>
              {module.lessons.map((item) => (
                <li key={item.id}>
                  <Link href={`/learn/${course.slug}/${item.id}`} aria-current={item.id === lesson.id ? "page" : undefined}>
                    {item.title}
                  </Link>
                  <span className="muted"> {item.done ? "· Done" : item.kind === "quiz" ? "· Quiz" : ""}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </aside>
      <article className="stack">
        <p className="kicker">
          {lesson.kind === "quiz" ? "Quiz" : "Reading"} · {lesson.minutes} min
          {course.isAuthor && !course.enrolled ? " · Preview" : ""}
        </p>
        <h1 className="serif" style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", margin: 0, lineHeight: 1 }}>
          {lesson.title}
        </h1>
        {course.isAuthor && !course.enrolled ? <p className="muted">You are previewing. Enroll to keep progress and submit the quiz.</p> : null}
        {lesson.kind === "reading" ? <LessonBody source={body} /> : <p className="deck">{body}</p>}
        {lesson.kind === "quiz" && latest ? (
          <p className={latest.passed ? "meta" : "alert"} role="status">
            Latest score {latest.score} / {latest.total}
            {latest.passed ? " · Passed" : " · Not yet"}
            {best && (best.score !== latest.score || best.total !== latest.total) ? ` · Best ${best.score} / ${best.total}` : ""}
          </p>
        ) : null}
        {lesson.kind === "quiz" && questions.length === 0 ? <p>This quiz does not have questions yet.</p> : null}
        {lesson.kind === "quiz" && review ? <QuizReview questions={review} /> : null}
        {lesson.kind === "quiz" && !review && questions.length > 0 && course.enrolled ? <QuizForm lessonId={lesson.id} questions={questions} /> : null}
        {lesson.kind === "quiz" && review ? (
          <Link className="btn btn-ghost" href={`/learn/${course.slug}/${lesson.id}?retake=1`}>
            Retake quiz
          </Link>
        ) : null}
        <div className="row">
          {previous ? <Link href={`/learn/${course.slug}/${previous.id}`}>Previous</Link> : null}
          {course.enrolled && lesson.kind === "reading" && !lesson.done ? (
            <form action={completeReadingAction}>
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="slug" value={course.slug} />
              <SubmitButton variant="brass" pending="Saving…">Mark as read</SubmitButton>
            </form>
          ) : null}
          {next ? (
            <Link className="btn btn-ink" href={`/learn/${course.slug}/${next.id}`}>
              Next lesson
            </Link>
          ) : null}
          {course.progress.complete ? (
            <Link className="btn btn-brass" href={`/certificates/${course.slug}`}>
              Certificate
            </Link>
          ) : null}
        </div>
      </article>
    </div>
  );
}
