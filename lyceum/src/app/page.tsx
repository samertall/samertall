import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { CourseCard } from "@/components/course-card";
import { Notice } from "@/components/notice";
import { LEVEL_OPTIONS } from "@/lib/text";
import { loadCatalog, loadContinue, loadSubjects, readFilters } from "@/server/read";
import { readViewer } from "@/server/viewer";

export const metadata = { title: { absolute: "Lyceum" } };

type Search = Promise<{ q?: string; subject?: string; level?: string; notice?: string }>;

export default function HomePage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <Home searchParams={searchParams} />
    </Suspense>
  );
}

async function Home({ searchParams }: { searchParams: Search }) {
  await connection();
  const params = await searchParams;
  const filters = readFilters(params);
  const viewer = await readViewer();
  const personId = viewer.kind === "person" ? viewer.id : null;
  const [courses, subjects, learning] = await Promise.all([
    loadCatalog(filters),
    loadSubjects(),
    loadContinue(personId),
  ]);
  const filtering = filters.q !== "" || filters.subject !== "" || filters.level !== "";

  return (
    <div className="page">
      <Notice code={params.notice} />
      <header className="hero">
        <p className="kicker">House curriculum</p>
        <h1>Learn the work behind the work.</h1>
        <p className="deck">
          Critique, product sense, type, and interviews. Short courses you can finish, with a quiz that checks whether the idea stuck.
        </p>
      </header>
      {learning ? (
        <Link className="sheet" href={`/learn/${learning.slug}/${learning.lessonId}`} style={{ display: "block", marginBottom: 22, textDecoration: "none" }}>
          <p className="kicker">Continue</p>
          <h2>
            {learning.title}: {learning.lessonTitle}
          </h2>
          <p className="meta">{learning.percent}% complete</p>
        </Link>
      ) : null}
      <form className="filters" action="/" method="get">
        <label className="field">
          <span>Search</span>
          <input name="q" defaultValue={filters.q} placeholder="Critique, type, research" />
        </label>
        <label className="field">
          <span>Subject</span>
          <select name="subject" defaultValue={filters.subject}>
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Level</span>
          <select name="level" defaultValue={filters.level}>
            <option value="">All levels</option>
            {LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-ink" type="submit">
          Filter
        </button>
      </form>
      {filtering ? (
        <p className="meta">
          <Link href="/">Clear filters</Link>
        </p>
      ) : null}
      {courses.length === 0 ? (
        <p>No courses match that filter.</p>
      ) : (
        <div className="cards">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
