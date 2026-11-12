import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { PrintButton } from "@/components/widgets";
import { Meter } from "@/components/meter";
import { formatWhen } from "@/lib/grade";
import { loadCourse } from "@/server/read";
import { sql } from "@/server/db";
import { readViewer } from "@/server/viewer";

type Params = Promise<{ slug: string }>;

export const metadata = { title: "Certificate" };

export default function CertificatePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <Certificate params={params} />
    </Suspense>
  );
}

async function Certificate({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const viewer = await readViewer();
  if (viewer.kind !== "person") redirect("/?notice=sign-in");
  const course = await loadCourse(slug, viewer.id);
  if (!course) notFound();
  if (!course.enrolled) redirect(`/courses/${course.slug}?notice=enroll`);
  if (!course.progress.complete) {
    const next = course.lessons.find((lesson) => !lesson.done);
    return (
      <div className="page sheet stack">
        <h1>Not yet</h1>
        <p>Finish every lesson in {course.title} to receive the certificate. Quizzes count once you pass.</p>
        <Meter done={course.progress.done} total={course.progress.total} percent={course.progress.percent} />
        {next ? (
          <Link className="btn btn-brass" href={`/learn/${course.slug}/${next.id}`}>
            Continue
          </Link>
        ) : null}
      </div>
    );
  }
  const rows = await sql<{ completed_at: string | Date | null }>(
    `select max(lp.completed_at) as completed_at
     from lesson_progress lp
     join lessons l on l.id = lp.lesson_id
     join modules m on m.id = l.module_id
     where m.course_id = $1 and lp.person_id = $2`,
    [course.id, viewer.id],
  );
  const when = formatWhen(rows[0]?.completed_at ?? new Date());

  return (
    <div className="page stack">
      <div className="noprint row">
        <Link href={`/courses/${course.slug}`}>Back to the course</Link>
        <PrintButton />
      </div>
      <article className="certificate">
        <div className="seal" aria-hidden="true">
          L
        </div>
        <p className="kicker">Lyceum</p>
        <h1>Certificate of completion</h1>
        <p>This certifies that</p>
        <p className="serif" style={{ fontSize: "2.2rem", margin: "8px 0" }}>
          {viewer.name}
        </p>
        <p>completed</p>
        <p className="serif" style={{ fontSize: "1.8rem", margin: "8px 0" }}>
          {course.title}
        </p>
        <p className="muted">
          {course.subject} · {course.level}
          {when ? ` · ${when}` : ""}
        </p>
      </article>
    </div>
  );
}
