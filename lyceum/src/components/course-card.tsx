import Link from "next/link";
import { formatMinutes } from "@/lib/grade";
import { subjectTone } from "@/lib/tone";
import type { CatalogCourse } from "@/server/read";

export function CourseCard({ course, published }: { course: CatalogCourse; published?: boolean }) {
  return (
    <Link href={published === false ? `/teach/${course.slug}` : `/courses/${course.slug}`} className="card" data-tone={subjectTone(course.subject)}>
      <p className="meta">
        <span>{course.subject}</span>
        <span>{course.level}</span>
        {course.house ? <span>House</span> : null}
        {published === false ? <span>Draft</span> : null}
      </p>
      <h2>{course.title}</h2>
      <p className="muted">{course.summary}</p>
      <p className="meta">
        <span>{course.lessonCount} lessons</span>
        <span>{formatMinutes(course.minutes)}</span>
        <span>{course.authorName}</span>
        {course.exampleCount > 0 ? <span>Example class of {course.exampleCount}</span> : null}
        {course.realCount > 0 ? <span>{course.realCount} enrolled</span> : null}
      </p>
    </Link>
  );
}
