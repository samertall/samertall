import { NOTICES, type NoticeCode } from "@/lib/notices";

const LEVELS = ["Foundation", "Practice", "Advanced"] as const;
export type Level = (typeof LEVELS)[number];

const SUBJECT = /^[\p{L}\p{N}][\p{L}\p{N} &+'/.-]{0,39}$/u;
const ID = /^[A-Za-z0-9_:-]{1,80}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return base || "course";
}

export function isId(value: string) {
  return ID.test(value);
}

export function isSlug(value: string) {
  return value.length <= 80 && SLUG.test(value);
}

export function likePattern(raw: string) {
  const trimmed = raw.trim().slice(0, 80);
  return `%${trimmed.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

type Parsed = { ok: true; value: string } | { ok: false; code: NoticeCode };

function text(value: unknown, min: number, max: number, empty: NoticeCode, long: NoticeCode): Parsed {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw.length < min) return { ok: false, code: empty };
  if (raw.length > max) return { ok: false, code: long };
  return { ok: true, value: raw };
}

export function parseTitle(value: unknown, empty: NoticeCode = "title-required", long: NoticeCode = "title-long") {
  return text(value, 1, 100, empty, long);
}

export function parseSummary(value: unknown) {
  return text(value, 1, 240, "summary-required", "summary-long");
}

export function parseDescription(value: unknown) {
  return text(value, 1, 4000, "description-required", "description-long");
}

export function parseSubject(value: unknown): Parsed {
  const parsed = text(value, 1, 40, "subject-required", "subject-long");
  if (!parsed.ok) return parsed;
  if (!SUBJECT.test(parsed.value)) return { ok: false, code: "subject-chars" };
  return parsed;
}

export function parseLevel(value: unknown): { ok: true; value: Level } | { ok: false; code: NoticeCode } {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!LEVELS.includes(raw as Level)) return { ok: false, code: "level" };
  return { ok: true, value: raw as Level };
}

export function parseModuleTitle(value: unknown) {
  return text(value, 1, 120, "module-required", "module-long");
}

export function parseLessonTitle(value: unknown) {
  return text(value, 1, 120, "lesson-required", "lesson-long");
}

export function parseBody(value: unknown) {
  const raw = typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
  if (raw.length > 12000) return { ok: false as const, code: "body-long" as const };
  return { ok: true as const, value: raw };
}

export function parseMinutes(value: unknown) {
  const raw = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
  if (!/^\d{1,3}$/.test(raw)) return { ok: false as const, code: "minutes" as const };
  const minutes = Number(raw);
  if (minutes < 1 || minutes > 180) return { ok: false as const, code: "minutes" as const };
  return { ok: true as const, value: minutes };
}

export function parseKind(value: unknown): { ok: true; value: "reading" | "quiz" } | { ok: false; code: NoticeCode } {
  if (value === "reading" || value === "quiz") return { ok: true, value };
  return { ok: false, code: "kind" };
}

export function parseQuestion(value: unknown) {
  return text(value, 1, 400, "question-required", "question-long");
}

export function parseExplanation(value: unknown) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (raw.length > 600) return { ok: false as const, code: "explanation-long" as const };
  return { ok: true as const, value: raw };
}

export function parseChoices(labels: unknown[], correctIndex: unknown) {
  const cleaned = labels.map((label) => (typeof label === "string" ? label.trim() : ""));
  for (const label of cleaned) {
    if (label.length > 200) return { ok: false as const, code: "choice-long" as const };
  }
  const filled = cleaned.filter((label) => label.length > 0);
  if (filled.length < 2) return { ok: false as const, code: "choice-short" as const };
  const index = typeof correctIndex === "number" ? correctIndex : Number(correctIndex);
  if (!Number.isInteger(index) || index < 0 || index >= cleaned.length || cleaned[index]?.length === 0) {
    return { ok: false as const, code: "choice-correct" as const };
  }
  return {
    ok: true as const,
    value: cleaned
      .map((label, position) => ({ label, correct: position === index }))
      .filter((choice) => choice.label.length > 0),
  };
}

export function failure(code: NoticeCode, status = 400) {
  return { ok: false as const, code, error: NOTICES[code], status };
}

export function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export const LEVEL_OPTIONS = LEVELS;
