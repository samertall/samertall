import { personOrResponse, readJson, resultResponse } from "@/server/http";
import { refresh } from "@/server/refresh";
import { runStudioOp } from "@/server/teach";
import { viewerFrom } from "@/server/viewer";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const person = personOrResponse(await viewerFrom(request));
  if (person instanceof Response) return person;
  const body = await readJson(request);
  if (!body.ok) return body.response;
  const { slug } = await context.params;
  const result = await runStudioOp(person.id, slug, body.value);
  if (result.ok) refresh();
  return resultResponse(result);
}
