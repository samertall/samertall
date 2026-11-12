import "server-only";

import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { cache } from "react";
import pg from "pg";
import { headers } from "next/headers";
import { getIdentity } from "../../cursor/identity";
import { insertCurriculum } from "@/server/seed";

export type Query = <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;

type StoreKind = "pg" | "local" | "preview";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;

type Shared = {
  local?: Promise<PGlite>;
  preview?: Promise<PGlite>;
  ready?: Map<StoreKind, Promise<void>>;
};

const shared: Shared = ((globalThis as typeof globalThis & { __lyceum?: Shared }).__lyceum ??= {});

export function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function flag(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

const requestStore = cache(async (): Promise<StoreKind> => {
  if (databaseUrl === "") return "local";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  try {
    const identity = await getIdentity(await headers());
    if (identity.verified && identity.stage === "preview") return "preview";
  } catch {
    return "pg";
  }
  return "pg";
});

async function openPglite(kind: "local" | "preview") {
  if (kind === "preview") {
    const db = new PGlite();
    await db.waitReady;
    await applyMigrations(db);
    return db;
  }
  const dir = path.join(process.cwd(), ".data", "pglite");
  await mkdir(dir, { recursive: true });
  const db = new PGlite(dir);
  await db.waitReady;
  await applyMigrations(db);
  return db;
}

async function applyMigrations(db: PGlite) {
  const directory = path.join(process.cwd(), "migrations");
  const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(path.join(directory, file), "utf8"));
  }
}

function pglite(kind: "local" | "preview") {
  const key = kind === "preview" ? "preview" : "local";
  shared[key] ??= openPglite(kind).catch((error: unknown) => {
    shared[key] = undefined;
    throw error;
  });
  return shared[key];
}

async function raw(kind: StoreKind, text: string, params: unknown[] = []) {
  if (kind === "pg") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows;
  }
  const db = await pglite(kind);
  return (await db.query(text, params)).rows;
}

function ensure(kind: StoreKind) {
  shared.ready ??= new Map();
  let pending = shared.ready.get(kind);
  if (!pending) {
    pending = seedStore(kind).catch((error: unknown) => {
      shared.ready?.delete(kind);
      throw error;
    });
    shared.ready.set(kind, pending);
  }
  return pending;
}

async function seedStore(kind: StoreKind) {
  if (kind === "pg") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    const client = await pool.connect();
    try {
      await client.query("begin");
      try {
        await client.query("select pg_advisory_xact_lock(7272741)");
        const count = await client.query("select count(*)::int as n from courses");
        if (num(count.rows[0]?.n) === 0) {
          await insertCurriculum(async <T,>(text: string, params: unknown[] = []) => (await client.query(text, params)).rows as T[]);
        }
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    } finally {
      client.release();
    }
    return;
  }
  const db = await pglite(kind);
  await db.transaction(async (tx) => {
    const count = await tx.query<{ n: number }>("select count(*)::int as n from courses");
    if (num(count.rows[0]?.n) > 0) return;
    await insertCurriculum(async <T,>(text: string, params: unknown[] = []) => (await tx.query(text, params)).rows as T[]);
  });
}

export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  const kind = await requestStore();
  await ensure(kind);
  return raw(kind, text, params) as Promise<T[]>;
}

export async function transaction<T>(fn: (query: Query) => Promise<T>) {
  const kind = await requestStore();
  await ensure(kind);
  if (kind === "pg") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    const client = await pool.connect();
    const query: Query = async (text, params = []) => (await client.query(text, params)).rows as never;
    try {
      await client.query("begin");
      try {
        const result = await fn(query);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    } finally {
      client.release();
    }
  }
  const db = await pglite(kind);
  return db.transaction(async (tx) => {
    const query: Query = async (text, params = []) => (await tx.query(text, params)).rows as never;
    return fn(query);
  });
}
