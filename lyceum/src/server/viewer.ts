import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { getIdentity, type IdentityRequest } from "../../cursor/identity";
import { sql } from "@/server/db";

export type Person = { kind: "person"; id: string; name: string; email: string };
export type Viewer = Person | { kind: "anonymous" } | { kind: "key" };

const GUEST = /^guest:[a-f0-9]{32}$/;

function cookieHeader(source: IdentityRequest) {
  const headers = "headers" in source && typeof source.headers === "object" && source.headers !== null ? source.headers : source;
  if (typeof headers === "object" && headers !== null && "get" in headers && typeof headers.get === "function") {
    return headers.get("cookie") ?? "";
  }
  if (typeof headers !== "object" || headers === null) return "";
  const record = headers as Record<string, string | string[] | undefined>;
  const value = record.cookie ?? record.Cookie;
  return Array.isArray(value) ? value.join("; ") : (value ?? "");
}

function guestId(source: IdentityRequest) {
  for (const part of cookieHeader(source).split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== "lyceum_learner") continue;
    const value = decodeURIComponent(rest.join("="));
    if (GUEST.test(value)) return value;
  }
  return null;
}

async function remember(id: string, name: string, email: string): Promise<Person> {
  const safeName = (name.trim() || "Learner").slice(0, 120);
  const safeEmail = email.trim().slice(0, 200);
  await sql(
    `insert into people (id, name, email) values ($1, $2, $3)
     on conflict (id) do update set name = excluded.name, email = excluded.email`,
    [id, safeName, safeEmail],
  );
  return { kind: "person", id, name: safeName, email: safeEmail };
}

async function loadViewer(source: IdentityRequest): Promise<Viewer> {
  const identity = await getIdentity(source);
  if (identity.verified && identity.kind === "person") return remember(identity.sub, identity.name, identity.email);
  if (identity.verified) return { kind: "key" };
  const guest = guestId(source);
  if (guest) return remember(guest, "Learner", "");
  return { kind: "anonymous" };
}

export const readViewer = cache(async (): Promise<Viewer> => loadViewer(await headers()));

export async function viewerFrom(source: IdentityRequest) {
  return loadViewer(source);
}
