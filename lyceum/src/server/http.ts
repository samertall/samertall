import "server-only";

import { NOTICES } from "@/lib/notices";
import type { Viewer } from "@/server/viewer";

export const noStore = { "cache-control": "private, no-store" };

export function jsonBody(body: unknown, status = 200) {
  return Response.json(body, { status, headers: noStore });
}

export async function readJson(request: Request) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json")) {
    return { ok: false as const, response: jsonBody({ error: "Use application/json." }, 415) };
  }
  const raw = await request.text();
  if (raw.length > 100_000) return { ok: false as const, response: jsonBody({ error: "Request is too large." }, 413) };
  try {
    const value = raw.trim() === "" ? {} : (JSON.parse(raw) as unknown);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return { ok: false as const, response: jsonBody({ error: NOTICES.invalid }, 400) };
    }
    return { ok: true as const, value: value as Record<string, unknown> };
  } catch {
    return { ok: false as const, response: jsonBody({ error: "Invalid JSON." }, 400) };
  }
}

export function personOrResponse(viewer: Viewer) {
  if (viewer.kind === "person") return viewer;
  if (viewer.kind === "key") return jsonBody({ error: "A person must call this." }, 403);
  return jsonBody({ error: NOTICES["sign-in"] }, 401);
}

export function resultResponse(result: { ok: true } | { ok: false; error: string; status: number }) {
  if (!result.ok) return jsonBody({ error: result.error }, result.status);
  return jsonBody(result);
}
