import { randomBytes } from "node:crypto";
import { eq, like } from "drizzle-orm";
import { getDb, type AppDb } from "@/db";
import { boardMeta, pass, profile, reply, ripple, user } from "@/db/schema";
import { OPENING_BOARD, VOICES } from "@/lib/seed-data";

export function rid() {
  return randomBytes(9).toString("base64url");
}

function passMoments(now: number, minutesOld: number, spec: { hour: number; six: number; older: number }) {
  const times: Date[] = [];
  const born = now - minutesOld * 60_000;
  const add = (ageMinutes: number) => {
    const at = now - ageMinutes * 60_000;
    if (at > born + 20_000) times.push(new Date(at));
  };
  for (let i = 0; i < spec.hour; i += 1) add(2 + i * 3);
  for (let i = 0; i < spec.six; i += 1) add(75 + i * 28);
  for (let i = 0; i < spec.older; i += 1) add(420 + i * 90);
  return times;
}

async function clearOpening(db: AppDb) {
  await db.delete(user).where(like(user.id, "seed_%"));
}

const CROWD = Array.from({ length: 48 }, (_, index) => {
  const n = String(index + 1).padStart(2, "0");
  return {
    id: `seed_pass_${n}`,
    name: `Passer ${n}`,
    email: `passer.${n}@residents.ripple.invalid`,
  };
});

async function insertOpening(db: AppDb, now: number) {
  const createdAt = new Date(now);
  await db.insert(user).values([
    ...VOICES.map((voice) => ({
      id: voice.id,
      name: voice.name,
      email: `${voice.handle.replace(/\./g, "_")}@residents.ripple.invalid`,
      emailVerified: true,
      image: null,
      createdAt,
      updatedAt: createdAt,
    })),
    ...CROWD.map((person) => ({
      id: person.id,
      name: person.name,
      email: person.email,
      emailVerified: true,
      image: null,
      createdAt,
      updatedAt: createdAt,
    })),
  ]);
  await db.insert(profile).values(
    VOICES.map((voice) => ({
      userId: voice.id,
      handle: voice.handle,
      bio: voice.bio,
    })),
  );

  const voiceId = new Map(VOICES.map((voice) => [voice.handle, voice.id]));

  for (const [rippleIndex, item] of OPENING_BOARD.entries()) {
    const id = rid();
    const authorId = voiceId.get(item.handle);
    if (!authorId) throw new Error(`Missing voice ${item.handle}`);
    await db.insert(ripple).values({
      id,
      authorId,
      body: item.body,
      topic: item.topic,
      createdAt: new Date(now - item.minutesOld * 60_000),
    });

    const moments = passMoments(now, item.minutesOld, item.passes);
    if (moments.length > 0) {
      await db.insert(pass).values(
        moments.map((moment, index) => ({
          id: rid(),
          rippleId: id,
          userId: CROWD[(rippleIndex * 3 + index) % CROWD.length]!.id,
          createdAt: moment,
        })),
      );
    }

    if (item.replies.length > 0) {
      await db.insert(reply).values(
        item.replies.map((note) => ({
          id: rid(),
          rippleId: id,
          authorId: voiceId.get(note.handle) ?? authorId,
          body: note.body,
          createdAt: new Date(now - note.minutesOld * 60_000),
        })),
      );
    }
  }
}

export async function ensureSeed() {
  const db = getDb();
  const existing = await db.select({ id: ripple.id }).from(ripple).limit(1);
  if (existing.length > 0) return;

  const claimed = await db
    .insert(boardMeta)
    .values({ key: "seeded", value: new Date().toISOString() })
    .onConflictDoNothing()
    .returning();

  if (claimed.length === 0) {
    const [meta] = await db.select().from(boardMeta).where(eq(boardMeta.key, "seeded")).limit(1);
    const age = meta ? Date.now() - new Date(meta.value).getTime() : 60_000;
    if (age < 20_000) return;
    await db.delete(boardMeta).where(eq(boardMeta.key, "seeded"));
    await ensureSeed();
    return;
  }

  try {
    await insertOpening(db, Date.now());
  } catch (error) {
    await clearOpening(db);
    await db.delete(boardMeta).where(eq(boardMeta.key, "seeded"));
    throw error;
  }
}
