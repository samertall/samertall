import { jsonBody, personOrResponse, readJson, resultResponse } from "@/server/http";
import { NOTICES } from "@/lib/notices";
import { setEnrollment } from "@/server/learn";
import { refresh } from "@/server/refresh";
import { viewerFrom } from "@/server/viewer";

export async function POST(request: Request) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const body = await readJson(request);
  if (!body.ok) return body.response;
  const slug = typeof body.value.slug === "string" ? body.value.slug : "";
  if (body.value.intent !== undefined && body.value.intent !== "enroll" && body.value.intent !== "leave") {
    return jsonBody({ error: NOTICES.invalid }, 400);
  }
  const intent = body.value.intent === "leave" ? "leave" : "enroll";
  const result = await setEnrollment(person.id, slug, intent);
  if (result.ok) refresh();
  return resultResponse(result);
}
