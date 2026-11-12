import { jsonBody } from "@/server/http";
import { courseJson, loadCourse } from "@/server/read";
import { viewerFrom } from "@/server/viewer";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const viewer = await viewerFrom(request);
  const personId = viewer.kind === "person" ? viewer.id : null;
  const course = await loadCourse(slug, personId);
  if (!course) return jsonBody({ error: "That course is not available." }, 404);
  return jsonBody(courseJson(course, course.isAuthor));
}
