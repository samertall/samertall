const RESERVED = new Set([
  "admin",
  "api",
  "drop",
  "me",
  "ripple",
  "rising",
  "signin",
  "signup",
  "support",
]);

export function cleanLine(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

export function validateRipple(body: string) {
  const line = cleanLine(body);
  if (line.length < 12) return "Give it at least 12 characters.";
  if (line.length > 220) return "Keep it under 220 characters.";
  return null;
}

export function validateReply(body: string) {
  const line = cleanLine(body);
  if (line.length < 2) return "Write a reply before you send it.";
  if (line.length > 240) return "Replies stay under 240 characters.";
  return null;
}

export function validateHandle(handle: string) {
  const value = handle.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_.]{1,18}[a-z0-9]$/.test(value)) {
    return "Use 3–20 letters, numbers, dots, or underscores.";
  }
  if (RESERVED.has(value)) return "That handle is reserved.";
  return null;
}

export function validateBio(bio: string) {
  const line = cleanLine(bio);
  if (line.length > 140) return "Keep the bio under 140 characters.";
  return null;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function avatarHue(seed: string) {
  const hues = [28, 42, 162, 198, 262, 332];
  let n = 0;
  for (const char of seed) n = (n + char.charCodeAt(0)) % hues.length;
  return hues[n] ?? 42;
}

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (/[\u0000-\u001F\u007F\\]/.test(value)) return "/";
  return value;
}
