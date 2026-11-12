import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Meter } from "@/components/meter";
import { Notice } from "@/components/notice";
import { formatWhen } from "@/lib/grade";
import { loadStudy } from "@/server/read";
import { readViewer } from "@/server/viewer";

export const metadata = { title: "Study" };

type Search = Promise<{ notice?: string }>;

export default function StudyPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <Study searchParams={searchParams} />
    </Suspense>
  );
}

async function Study({ searchParams }: { searchParams: Search }) {
  await connection();
  const query = await searchParams;
  const viewer = await readViewer();
  if (viewer.kind !== "person") {
    return (
      <div className="page sheet stack">
        <h1>Your desk</h1>
        <p>Sign in to see enrolled courses, scores, and certificates.</p>
        <Link className="btn btn-ink" href="/">
          Browse the catalog
        </Link>
      </div>
    );
  }
  const study = await loadStudy(viewer.id);
  const finished = study.courses.filter((course) => course.progress.complete);
  const open = study.courses.filter((course) => !course.progress.complete);

  return (
    <div className="page stack">
      <Notice code={query.notice} />
      <header className="hero">
        <p className="kicker">Study</p>
        <h1>Your desk</h1>
        <p className="deck">Courses in progress, quiz scores, and certificates for {viewer.name}.</p>
      </header>
      {study.courses.length === 0 ? (
        <div className="sheet stack">
          <p>You have not enrolled yet.</p>
          <Link className="btn btn-brass" href="/">
            Browse the catalog
          </Link>
        </div>
      ) : null}
      {open.length > 0 ? (
        <section className="stack">
          <h2>In progress</h2>
          <div className="cards">
            {open.map((course) => (
              <article key={course.slug} className="card" data-tone="ink">
                <p className="meta">
                  <span>{course.subject}</span>
                  <span>{course.level}</span>
                </p>
                <h2>{course.title}</h2>
                <Meter done={course.progress.done} total={course.progress.total} percent={course.progress.percent} />
                {course.next ? (
                  <Link className="btn btn-ink" href={`/learn/${course.slug}/${course.next.id}`}>
                    Continue: {course.next.title}
                  </Link>
                ) : (
                  <Link href={`/courses/${course.slug}`}>Open course</Link>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      {finished.length > 0 ? (
        <section className="stack">
          <h2>Finished</h2>
          <ul>
            {finished.map((course) => (
              <li key={course.slug}>
                <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                {" · "}
                <Link href={`/certificates/${course.slug}`}>Certificate</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="sheet">
        <h2>Quiz scores</h2>
        {study.attempts.length === 0 ? <p className="muted">No quizzes submitted yet.</p> : (
          <table>
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Quiz</th>
                <th scope="col">Score</th>
                <th scope="col">When</th>
              </tr>
            </thead>
            <tbody>
              {study.attempts.map((attempt) => (
                <tr key={`${attempt.slug}-${String(attempt.submittedAt)}-${attempt.score}`}>
                  <td>
                    <Link href={`/courses/${attempt.slug}`}>{attempt.courseTitle}</Link>
                  </td>
                  <td>{attempt.lessonTitle}</td>
                  <td>
                    {attempt.score} / {attempt.total} · {attempt.passed ? "Passed" : "Not yet"}
                  </td>
                  <td>{formatWhen(attempt.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
