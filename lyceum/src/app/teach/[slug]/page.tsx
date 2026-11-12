import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { Notice } from "@/components/notice";
import { StudioEditor } from "@/components/studio-editor";
import { loadCourse } from "@/server/read";
import { loadStudio } from "@/server/teach";
import { readViewer } from "@/server/viewer";

type Params = Promise<{ slug: string }>;
type Search = Promise<{ notice?: string }>;

export const metadata = { title: "Edit course" };

export default function StudioCoursePage({ params, searchParams }: { params: Params; searchParams: Search }) {
  return (
    <Suspense fallback={<div className="page skeleton block" />}>
      <StudioCourse params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function StudioCourse({ params, searchParams }: { params: Params; searchParams: Search }) {
  await connection();
  const { slug } = await params;
  const query = await searchParams;
  const viewer = await readViewer();
  if (viewer.kind !== "person") redirect("/?notice=sign-in");
  const studio = await loadStudio(slug, viewer.id);
  if (!studio) {
    const course = await loadCourse(slug, viewer.id);
    if (course?.published) redirect(`/courses/${slug}?notice=forbidden`);
    notFound();
  }
  return (
    <div className="page">
      <Notice code={query.notice} />
      <StudioEditor studio={studio} />
    </div>
  );
}
