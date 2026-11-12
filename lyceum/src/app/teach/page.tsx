import { Suspense } from "react";
import { connection } from "next/server";
import { createCourseAction } from "@/app/actions";
import { CourseCard } from "@/components/course-card";
import { AreaField, LevelField, SubjectField, TextField } from "@/components/fields";
import { Notice } from "@/components/notice";
import { ActionForm, SubmitButton } from "@/components/widgets";
import { loadHouseCourses, loadOwnedCourses } from "@/server/read";
import { readViewer } from "@/server/viewer";

export const metadata = { title: "Studio" };

type Search = Promise<{ notice?: string }>;

export default function TeachPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <Teach searchParams={searchParams} />
    </Suspense>
  );
}

async function Teach({ searchParams }: { searchParams: Search }) {
  await connection();
  const query = await searchParams;
  const viewer = await readViewer();
  const house = await loadHouseCourses();
  const owned = viewer.kind === "person" ? await loadOwnedCourses(viewer.id) : [];

  return (
    <div className="page stack">
      <Notice code={query.notice} />
      <header className="hero">
        <p className="kicker">Studio</p>
        <h1>Open a course.</h1>
        <p className="deck">Write the lessons, add a quiz, and publish into the same catalog as the house curriculum.</p>
      </header>
      {viewer.kind !== "person" ? (
        <p className="sheet">Sign in to create a course.</p>
      ) : (
        <ActionForm action={createCourseAction} className="sheet stack">
          <h2>New course</h2>
          <TextField label="Title" name="title" required maxLength={100} placeholder="Giving a critique" />
          <TextField label="Summary" name="summary" required maxLength={240} placeholder="One sentence a learner can repeat." />
          <SubjectField />
          <LevelField />
          <AreaField label="Description" name="description" required maxLength={4000} rows={5} />
          <SubmitButton variant="brass" pending="Creating…">Create course</SubmitButton>
        </ActionForm>
      )}
      <section className="stack">
        <h2>Your courses</h2>
        {owned.length === 0 ? <p className="muted">Drafts and published courses you author will show up here.</p> : (
          <div className="cards">
            {owned.map((course) => (
              <CourseCard key={course.slug} course={course} published={course.published} />
            ))}
          </div>
        )}
      </section>
      <section className="stack">
        <h2>House curriculum</h2>
        <p className="muted">These courses are maintained with Lyceum. Open one to read it. Your own courses are the ones you can edit.</p>
        <div className="cards">
          {house.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>
      <section className="sheet stack">
        <h2>HTTP API</h2>
        <p className="muted">The same rules as the studio and the player. Send JSON, and call as the signed-in person.</p>
        <pre className="api">{`GET  /api/catalog
GET  /api/courses/:slug
GET  /api/courses/:slug/lessons/:lessonId
GET  /api/me
POST /api/enroll            { "slug", "intent": "enroll" | "leave" }
POST /api/progress          { "lessonId" }
POST /api/quizzes           { "lessonId", "answers": [{ "questionId", "choiceId" }] }
GET  /api/teach/courses
POST /api/teach/courses     { "title", "summary", "description", "subject", "level" }
POST /api/teach/courses/:slug
  { "op": "update" | "publish" | "add-module" | "add-lesson" | "add-question" | "delete" | ... }`}</pre>
      </section>
    </div>
  );
}
