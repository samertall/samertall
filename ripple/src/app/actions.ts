"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { pass, profile, reply, ripple } from "@/db/schema";
import { getViewer } from "@/lib/session";
import { rid } from "@/lib/seed";
import { topicBySlug } from "@/lib/topics";
import {
  cleanLine,
  safeNext,
  validateBio,
  validateHandle,
  validateReply,
  validateRipple,
} from "@/lib/text";

export type FormState = { error: string } | null;

export type PassResult =
  | { ok: true; passed: boolean; count: number }
  | { ok: false; reason: "auth" | "missing" | "self" };

function refresh(rippleId?: string, topic?: string, handle?: string | null) {
  revalidatePath("/");
  revalidatePath("/rising");
  if (rippleId) revalidatePath(`/r/${rippleId}`);
  if (topic) revalidatePath(`/t/${topic}`);
  if (handle) revalidatePath(`/u/${handle}`);
}

export async function togglePass(rippleId: string): Promise<PassResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, reason: "auth" };
  const db = getDb();
  const [line] = await db.select().from(ripple).where(eq(ripple.id, rippleId)).limit(1);
  if (!line) return { ok: false, reason: "missing" };
  if (line.authorId === viewer.id) return { ok: false, reason: "self" };

  const [existing] = await db
    .select()
    .from(pass)
    .where(and(eq(pass.rippleId, rippleId), eq(pass.userId, viewer.id)))
    .limit(1);

  if (existing) {
    await db.delete(pass).where(eq(pass.id, existing.id));
  } else {
    await db.insert(pass).values({
      id: rid(),
      rippleId,
      userId: viewer.id,
      createdAt: new Date(),
    });
  }

  const rows = await db.select({ id: pass.id }).from(pass).where(eq(pass.rippleId, rippleId));
  refresh(rippleId, line.topic, viewer.handle);
  return { ok: true, passed: !existing, count: rows.length };
}

export async function createRipple(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const next = safeNext(String(formData.get("next") ?? "/drop"));
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!viewer.handle) redirect("/me?next=/drop");

  const topic = String(formData.get("topic") ?? "");
  const body = cleanLine(String(formData.get("body") ?? ""));
  if (!topicBySlug(topic)) return { error: "Pick a topic." };
  const problem = validateRipple(body);
  if (problem) return { error: problem };

  const db = getDb();
  const [latest] = await db
    .select({ createdAt: ripple.createdAt })
    .from(ripple)
    .where(eq(ripple.authorId, viewer.id))
    .orderBy(desc(ripple.createdAt))
    .limit(1);
  if (latest && Date.now() - latest.createdAt.getTime() < 20_000) {
    return { error: "Give the last line a moment before you drop another." };
  }

  const id = rid();
  await db.insert(ripple).values({
    id,
    authorId: viewer.id,
    body,
    topic,
    createdAt: new Date(),
  });
  refresh(id, topic, viewer.handle);
  redirect(`/r/${id}`);
}

export async function createReply(_prev: FormState, formData: FormData): Promise<FormState> {
  const rippleId = String(formData.get("rippleId") ?? "");
  const viewer = await getViewer();
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(`/r/${rippleId}`)}`);
  if (!viewer.handle) redirect(`/me?next=${encodeURIComponent(`/r/${rippleId}`)}`);

  const body = cleanLine(String(formData.get("body") ?? ""));
  const problem = validateReply(body);
  if (problem) return { error: problem };

  const db = getDb();
  const [line] = await db.select().from(ripple).where(eq(ripple.id, rippleId)).limit(1);
  if (!line) return { error: "That line is no longer on the board." };

  await db.insert(reply).values({
    id: rid(),
    rippleId,
    authorId: viewer.id,
    body,
    createdAt: new Date(),
  });
  refresh(rippleId, line.topic, viewer.handle);
  redirect(`/r/${rippleId}`);
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await getViewer();
  const next = safeNext(String(formData.get("next") ?? "/me"));
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);

  const bio = cleanLine(String(formData.get("bio") ?? ""));
  const bioProblem = validateBio(bio);
  if (bioProblem) return { error: bioProblem };

  const db = getDb();
  if (viewer.handle) {
    await db.update(profile).set({ bio }).where(eq(profile.userId, viewer.id));
    refresh(undefined, undefined, viewer.handle);
    redirect(next === "/me" ? `/u/${viewer.handle}` : next);
  }

  const handle = String(formData.get("handle") ?? "").trim().toLowerCase();
  const handleProblem = validateHandle(handle);
  if (handleProblem) return { error: handleProblem };

  try {
    await db.insert(profile).values({ userId: viewer.id, handle, bio });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { error: "That handle is already taken." };
    }
    throw error;
  }

  refresh(undefined, undefined, handle);
  redirect(next === "/me" ? `/u/${handle}` : next);
}
