import { noticeText } from "@/lib/notices";

export function Notice({ code }: { code?: string }) {
  const text = noticeText(code);
  if (!text) return null;
  return (
    <p className="alert" role="status">
      {text}
    </p>
  );
}
