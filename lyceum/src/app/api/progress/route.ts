import { personOrResponse, readJson } from "@/server/http";
import { completeReading } from "@/server/learn";
import { refresh } from "@/server/refresh";
import { resultResponse } from "@/server/http";
import { viewerFrom } from "@/server/viewer";

export async function POST(request: Request) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const body = await readJson(request);
  if (!body.ok) return body.response;
  const lessonId = typeof body.value.lessonId === "string" ? body.value.lessonId : "";
  const result = await completeReading(person.id, lessonId);
  if (result.ok) refresh();
  return resultResponse(result);
}
