import { avatarHue, initials } from "@/lib/text";

export function Avatar({ name, seed, size = "md" }: { name: string; seed: string; size?: "sm" | "md" }) {
  const hue = avatarHue(seed);
  const dim = size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-[#14110a] ${dim}`}
      style={{ background: `hsl(${hue} 72% 66%)` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
