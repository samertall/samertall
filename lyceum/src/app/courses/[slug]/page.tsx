import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { enrollAction } from "@/app/actions";
import { Meter } from "@/components/meter";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/widgets";
import { formatMinutes } from "@/lib/grade";
import { subjectTone } from "@/lib/tone";
import { loadCourse } from "@/server/read";
import { readViewer } from "@/server/viewer";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ notice?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const course = await loadCourse(slug, null);
  if (!course) return { title: "Course" };
  return { title: course.title, description: course.summary };
}

export default function CoursePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <Course params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Course({ params, searchParams }: { params: Params; searchParams: Search }) {
  await connection();
  const { slug } = await params;
  const query = await searchParams;
  const viewer = await readViewer();
  const personId = viewer.kind === "person" ? viewer.id : null;
  const course = await loadCourse(slug, personId);
  if (!course) notFound();
  const next = course.lessons.find((lesson) => !lesson.done) ?? course.lessons[0] ?? null;
  const paragraphs = course.description.split(/\n\n+/).filter((paragraph) => paragraph.trim() !== "");

  return (
    <div className="page">
      <Notice code={query.notice} />
      <div className="split">
        <article className="stack">
          <p className="kicker">
            {course.subject} · {course.level}
            {course.house ? " · House" : ""}
            {course.published ? "" : " · Draft"}
          </p>
          <h1 className="serif" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", margin: 0, lineHeight: 0.95 }} data-tone={subjectTone(course.subject)}>
            {course.title}
          </h1>
          <p className="deck">{course.summary}</p>
          <p className="meta">
            <span>{course.authorName}</span>
            <span>{course.lessons.length} lessons</span>
            <span>{formatMinutes(course.minutes)}</span>
            {course.realLearners > 0 ? <span>{course.realLearners} enrolled</span> : null}
          </p>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="deck">
              {paragraph}
            </p>
          ))}
          <section className="stack">
            <h2>Syllabus</h2>
            {course.modules.map((module) => (
              <section key={module.id}>
                <h3>{module.title}</h3>
                <ol>
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      {course.enrolled || course.isAuthor ? (
                        <Link href={`/learn/${course.slug}/${lesson.id}`}>{lesson.title}</Link>
                      ) : (
                        lesson.title
                      )}
                      <span className="muted">
                        {" "}
                        · {lesson.kind === "quiz" ? "Quiz" : "Reading"} · {lesson.minutes} min
                        {lesson.done ? " · Done" : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </section>
          {course.exampleCohort.length > 0 ? (
            <section className="sheet">
              <h2>Example cohort</h2>
              <p className="muted">Sample learners shipped with the house course, so you can see what progress looks like.</p>
              <ul>
                {course.exampleCohort.map((learner) => (
                  <li key={learner.name}>
                    {learner.name} · {learner.percent}%
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
        <aside className="panel">
          {course.enrolled ? <Meter done={course.progress.done} total={course.progress.total} percent={course.progress.percent} /> : <p>Enroll to track lessons and sit the quiz.</p>}
          {viewer.kind !== "person" ? <p>Sign in to enroll and keep your place.</p> : null}
          {viewer.kind === "person" && !course.enrolled ? (
            <form action={enrollAction}>
              <input type="hidden" name="slug" value={course.slug} />
              <input type="hidden" name="intent" value="enroll" />
              <SubmitButton variant="brass" pending="Enrolling…">Enroll</SubmitButton>
            </form>
          ) : null}
          {course.enrolled && next ? (
            <Link className="btn btn-brass" href={`/learn/${course.slug}/${next.id}`}>
              {course.progress.done > 0 ? "Continue" : "Start"}
            </Link>
          ) : null}
          {course.progress.complete ? (
            <Link className="btn btn-ink" href={`/certificates/${course.slug}`}>
              View certificate
            </Link>
          ) : null}
          {course.enrolled ? (
            <form action={enrollAction}>
              <input type="hidden" name="slug" value={course.slug} />
              <input type="hidden" name="intent" value="leave" />
              <SubmitButton variant="ghost">Leave course</SubmitButton>
            </form>
          ) : null}
          {course.isAuthor ? <Link href={`/teach/${course.slug}`}>Edit in the studio</Link> : null}
        </aside>
      </div>
    </div>
  );
}
