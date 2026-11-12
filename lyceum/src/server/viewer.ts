import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { getIdentity, type IdentityRequest } from "../../cursor/identity";
import { sql } from "@/server/db";

export type Person = { kind: "person"; id: string; name: string; email: string };
export type Viewer = Person | { kind: "anonymous" } | { kind: "key" };

async function loadViewer(source: IdentityRequest): Promise<Viewer> {
  const identity = await getIdentity(source);
  if (!identity.verified) return { kind: "anonymous" };
  if (identity.kind !== "person") return { kind: "key" };
  const name = (identity.name.trim() || "Learner").slice(0, 120);
  const email = identity.email.trim().slice(0, 200);
  await sql(
    `insert into people (id, name, email) values ($1, $2, $3)
     on conflict (id) do update set name = excluded.name, email = excluded.email`,
    [identity.sub, name, email],
  );
  return { kind: "person", id: identity.sub, name, email };
}

export const readViewer = cache(async (): Promise<Viewer> => loadViewer(await headers()));

export async function viewerFrom(source: IdentityRequest) {
  return loadViewer(source);
}
