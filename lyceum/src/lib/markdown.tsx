import { Fragment } from "react";

export type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; text: string };

type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "code"; text: string };

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)/g;

export function parseInline(source: string): Inline[] {
  const parts: Inline[] = [];
  let cursor = 0;
  for (const match of source.matchAll(INLINE)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ type: "text", text: source.slice(cursor, index) });
    const token = match[0];
    if (token.startsWith("`")) parts.push({ type: "code", text: token.slice(1, -1) });
    else parts.push({ type: "strong", text: token.slice(2, -2) });
    cursor = index + token.length;
  }
  if (cursor < source.length) parts.push({ type: "text", text: source.slice(cursor) });
  return parts;
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        body.push(lines[index] ?? "");
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", text: body.join("\n") });
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      index += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      index += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote = [line.slice(2)];
      index += 1;
      while (index < lines.length && (lines[index] ?? "").startsWith("> ")) {
        quote.push((lines[index] ?? "").slice(2));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && (lines[index] ?? "").startsWith("- ")) {
        items.push((lines[index] ?? "").slice(2).trim());
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\d+\. /, "").trim());
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && (lines[index] ?? "").trim() !== "" && !isBoundary(lines[index] ?? "")) {
      paragraph.push((lines[index] ?? "").trim());
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }
  return blocks;
}

function isBoundary(line: string) {
  return (
    line.startsWith("## ") ||
    line.startsWith("### ") ||
    line.startsWith("> ") ||
    line.startsWith("- ") ||
    line.startsWith("```") ||
    /^\d+\. /.test(line)
  );
}

export function InlineText({ text }: { text: string }) {
  const parts = parseInline(text);
  return parts.map((part, index) => {
    if (part.type === "strong") return <strong key={index}>{part.text}</strong>;
    if (part.type === "code") return <code key={index}>{part.text}</code>;
    return <Fragment key={index}>{part.text}</Fragment>;
  });
}

export function LessonBody({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  if (blocks.length === 0) return <p className="muted">This lesson does not have a reading yet.</p>;
  return (
    <div className="prose">
      {blocks.map((block, index) => {
        if (block.type === "h2")
          return (
            <h2 key={index}>
              <InlineText text={block.text} />
            </h2>
          );
        if (block.type === "h3")
          return (
            <h3 key={index}>
              <InlineText text={block.text} />
            </h3>
          );
        if (block.type === "quote")
          return (
            <blockquote key={index}>
              <InlineText text={block.text} />
            </blockquote>
          );
        if (block.type === "ul")
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          );
        if (block.type === "ol")
          return (
            <ol key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineText text={item} />
                </li>
              ))}
            </ol>
          );
        if (block.type === "code") return <pre key={index}><code>{block.text}</code></pre>;
        return (
          <p key={index}>
            <InlineText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
