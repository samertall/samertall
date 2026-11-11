import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleHttp, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzleNode, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export class DatabaseUnavailable extends Error {
  constructor() {
    super("DATABASE_URL is not set");
    this.name = "DatabaseUnavailable";
  }
}

export function isDatabaseUnavailable(error: unknown) {
  return (
    error instanceof DatabaseUnavailable ||
    (error instanceof Error && error.message.includes("DATABASE_URL"))
  );
}

export async function readDb<T>(work: () => Promise<T>) {
  try {
    return { ok: true as const, data: await work() };
  } catch (error) {
    if (isDatabaseUnavailable(error)) return { ok: false as const };
    throw error;
  }
}

export type AppDb = NeonHttpDatabase<typeof schema> | NodePgDatabase<typeof schema>;

let db: AppDb | null = null;
let pool: Pool | null = null;

function usesNeonHttp(url: string) {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseUnavailable();
  if (db) return db;

  if (usesNeonHttp(url)) {
    db = drizzleHttp(neon(url), { schema });
    return db;
  }

  pool = new Pool({ connectionString: url, max: 5 });
  db = drizzleNode(pool, { schema });
  return db;
}
