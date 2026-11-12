import { jsonBody, personOrResponse } from "@/server/http";
import { loadStudy } from "@/server/read";
import { viewerFrom } from "@/server/viewer";

export async function GET(request: Request) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const study = await loadStudy(person.id);
  return jsonBody({ name: person.name, email: person.email, courses: study.courses, attempts: study.attempts });
}
