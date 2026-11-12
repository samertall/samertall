import { NOTICES } from "@/lib/notices";
import { jsonBody } from "@/server/http";
import { lessonJson, loadLesson } from "@/server/read";
import { viewerFrom } from "@/server/viewer";

export async function GET(request: Request, context: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await context.params;
  const viewer = await viewerFrom(request);
  const personId = viewer.kind === "person" ? viewer.id : null;
  const url = new URL(request.url);
  const loaded = await loadLesson(slug, lessonId, personId, url.searchParams.get("retake") === "1");
  if (!loaded.ok) {
    const status = loaded.code === "enroll" ? 403 : 404;
    return jsonBody({ error: NOTICES[loaded.code] }, status);
  }
  return jsonBody(lessonJson(loaded.lesson, loaded.lesson.review !== null));
}
