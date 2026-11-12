import { NOTICES } from "@/lib/notices";
import { jsonBody, personOrResponse, readJson, resultResponse } from "@/server/http";
import { answersFromJson, submitQuiz } from "@/server/learn";
import { refresh } from "@/server/refresh";
import { viewerFrom } from "@/server/viewer";

export async function POST(request: Request) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const body = await readJson(request);
  if (!body.ok) return body.response;
  const lessonId = typeof body.value.lessonId === "string" ? body.value.lessonId : "";
  const answers = answersFromJson(body.value.answers);
  if (!answers) return jsonBody({ error: NOTICES.invalid }, 400);
  const result = await submitQuiz(person.id, lessonId, answers);
  if (result.ok) refresh();
  return resultResponse(result);
}
