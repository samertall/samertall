import { personOrResponse, readJson, resultResponse } from "@/server/http";
import { jsonBody } from "@/server/http";
import { loadOwnedCourses } from "@/server/read";
import { refresh } from "@/server/refresh";
import { createCourse } from "@/server/teach";
import { viewerFrom } from "@/server/viewer";

export async function GET(request: Request) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const courses = await loadOwnedCourses(person.id);
  return jsonBody({ courses });
}

export async function POST(request: Request) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const body = await readJson(request);
  if (!body.ok) return body.response;
  const result = await createCourse(person.id, {
    title: body.value.title,
    summary: body.value.summary,
    description: body.value.description,
    subject: body.value.subject,
    level: body.value.level,
  });
  if (result.ok) refresh();
  return resultResponse(result);
}
