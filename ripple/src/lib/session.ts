import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profile } from "@/db/schema";
import { getAuth } from "@/lib/auth";

export type Viewer = {
  id: string;
  name: string;
  email: string;
  handle: string | null;
  bio: string;
};

export async function getViewer(): Promise<Viewer | null> {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });
  if (!session) return null;

  const [row] = await getDb()
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id))
    .limit(1);

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    handle: row?.handle ?? null,
    bio: row?.bio ?? "",
  };
}
