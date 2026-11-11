import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { pass, profile, reply, ripple, user } from "@/db/schema";
import { heatScore, stageFor, tallyPasses, type Stage } from "@/lib/heat";
import { ensureSeed } from "@/lib/seed";

export type Author = {
  id: string;
  name: string;
  handle: string;
  bio: string;
};

export type RippleCard = {
  id: string;
  body: string;
  topic: string;
  createdAt: Date;
  author: Author;
  passes: number;
  replies: number;
  heat: number;
  stage: Stage;
  passed: boolean;
  own: boolean;
};

export type ReplyCard = {
  id: string;
  body: string;
  createdAt: Date;
  author: Author;
};

export type Board = {
  lead: RippleCard | null;
  rising: RippleCard[];
  fresh: RippleCard[];
  ranked: RippleCard[];
  passesThisHour: number;
  voices: number;
};

type PassRow = { rippleId: string; userId: string; createdAt: Date };
type ReplyRow = { id: string; rippleId: string; body: string; createdAt: Date; authorId: string };

function authorFrom(
  id: string,
  people: Map<string, { name: string; handle: string; bio: string }>,
): Author {
  const person = people.get(id);
  return {
    id,
    name: person?.name ?? "Member",
    handle: person?.handle ?? "member",
    bio: person?.bio ?? "",
  };
}

export function focusBoard(board: Board, items: RippleCard[]): Board {
  const ranked = [...items].sort(
    (a, b) => b.heat - a.heat || b.createdAt.getTime() - a.createdAt.getTime(),
  );
  const lead = ranked[0] ?? null;
  const rising = ranked.slice(1, 7);
  const used = new Set([lead?.id, ...rising.map((item) => item.id)].filter(Boolean));
  const fresh = [...items]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .filter((item) => !used.has(item.id))
    .slice(0, 6);
  return {
    ...board,
    lead,
    rising,
    fresh,
    ranked,
    voices: new Set(items.map((item) => item.author.handle)).size,
  };
}

export async function loadBoard(viewerId: string | null, now = Date.now()): Promise<Board> {
  await ensureSeed();
  const db = getDb();
  const [rippleRows, passRows, replyRows, profileRows, userRows] = await Promise.all([
    db.select().from(ripple).orderBy(desc(ripple.createdAt)),
    db.select({ rippleId: pass.rippleId, userId: pass.userId, createdAt: pass.createdAt }).from(pass),
    db
      .select({
        id: reply.id,
        rippleId: reply.rippleId,
        body: reply.body,
        createdAt: reply.createdAt,
        authorId: reply.authorId,
      })
      .from(reply),
    db.select().from(profile),
    db.select({ id: user.id, name: user.name }).from(user),
  ]);

  const names = new Map(userRows.map((row) => [row.id, row.name]));
  const people = new Map(
    profileRows.map((row) => [
      row.userId,
      { name: names.get(row.userId) ?? row.handle, handle: row.handle, bio: row.bio },
    ]),
  );

  const passesByRipple = new Map<string, PassRow[]>();
  for (const row of passRows) {
    const list = passesByRipple.get(row.rippleId) ?? [];
    list.push(row);
    passesByRipple.set(row.rippleId, list);
  }

  const repliesByRipple = new Map<string, ReplyRow[]>();
  for (const row of replyRows) {
    const list = repliesByRipple.get(row.rippleId) ?? [];
    list.push(row);
    repliesByRipple.set(row.rippleId, list);
  }

  const cards: RippleCard[] = rippleRows.map((row) => {
    const times = (passesByRipple.get(row.id) ?? []).map((item) => item.createdAt);
    const tally = tallyPasses(times, now);
    const replyCount = repliesByRipple.get(row.id)?.length ?? 0;
    const heat = heatScore({ ...tally, replies: replyCount });
    const mine = (passesByRipple.get(row.id) ?? []).some((item) => item.userId === viewerId);
    return {
      id: row.id,
      body: row.body,
      topic: row.topic,
      createdAt: row.createdAt,
      author: authorFrom(row.authorId, people),
      passes: tally.passTotal,
      replies: replyCount,
      heat,
      stage: stageFor(heat),
      passed: Boolean(viewerId) && mine,
      own: viewerId === row.authorId,
    };
  });

  const ranked = [...cards].sort((a, b) => b.heat - a.heat || b.createdAt.getTime() - a.createdAt.getTime());
  const lead = ranked[0] ?? null;
  const rising = ranked.slice(1, 7);
  const used = new Set([lead?.id, ...rising.map((item) => item.id)].filter(Boolean));
  const fresh = [...cards]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .filter((item) => !used.has(item.id))
    .slice(0, 6);

  const passesThisHour = passRows.filter((row) => now - row.createdAt.getTime() <= 60 * 60 * 1000).length;
  const voices = new Set(cards.map((item) => item.author.handle)).size;

  return { lead, rising, fresh, ranked, passesThisHour, voices };
}

export async function getRippleCopy(id: string) {
  const db = getDb();
  const [row] = await db
    .select({ body: ripple.body, authorId: ripple.authorId })
    .from(ripple)
    .where(eq(ripple.id, id))
    .limit(1);
  if (!row) return null;
  const [person] = await db.select({ name: user.name }).from(user).where(eq(user.id, row.authorId)).limit(1);
  return { body: row.body, name: person?.name ?? "Ripple" };
}

export async function getRipple(id: string, viewerId: string | null) {
  const board = await loadBoard(viewerId);
  const card = board.ranked.find((item) => item.id === id);
  if (!card) return null;

  const db = getDb();
  const replyRows = await db
    .select({
      id: reply.id,
      body: reply.body,
      createdAt: reply.createdAt,
      authorId: reply.authorId,
    })
    .from(reply)
    .where(eq(reply.rippleId, id))
    .orderBy(desc(reply.createdAt));

  const profileRows = await db.select().from(profile);
  const userRows = await db.select({ id: user.id, name: user.name }).from(user);
  const names = new Map(userRows.map((row) => [row.id, row.name]));
  const people = new Map(
    profileRows.map((row) => [
      row.userId,
      { name: names.get(row.userId) ?? row.handle, handle: row.handle, bio: row.bio },
    ]),
  );

  const replies: ReplyCard[] = replyRows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    author: authorFrom(row.authorId, people),
  }));

  return { ripple: card, replies };
}

export async function getProfile(handle: string, viewerId: string | null) {
  await ensureSeed();
  const db = getDb();
  const [row] = await db.select().from(profile).where(eq(profile.handle, handle)).limit(1);
  if (!row) return null;
  const [account] = await db.select({ name: user.name }).from(user).where(eq(user.id, row.userId)).limit(1);
  const board = await loadBoard(viewerId);
  return {
    author: {
      id: row.userId,
      name: account?.name ?? row.handle,
      handle: row.handle,
      bio: row.bio,
    } satisfies Author,
    ripples: board.ranked.filter((item) => item.author.handle === handle),
  };
}

export async function passesFor(rippleId: string, userId: string) {
  const [row] = await getDb()
    .select({ id: pass.id })
    .from(pass)
    .where(and(eq(pass.rippleId, rippleId), eq(pass.userId, userId)))
    .limit(1);
  return row ?? null;
}
