import { jsonBody } from "@/server/http";
import { catalogJson, loadCatalog, loadSubjects, readFilters } from "@/server/read";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = readFilters({
    q: url.searchParams.get("q") ?? "",
    subject: url.searchParams.get("subject") ?? "",
    level: url.searchParams.get("level") ?? "",
  });
  const [courses, subjects] = await Promise.all([loadCatalog(filters), loadSubjects()]);
  return jsonBody({ courses: courses.map(catalogJson), subjects });
}
