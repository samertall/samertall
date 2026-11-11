import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { ReplyForm } from "@/components/composer";
import { RippleStage } from "@/components/board-view";
import { DatabaseMissing } from "@/components/shell";
import { Avatar } from "@/components/avatar";
import { readDb } from "@/db";
import { getRipple, getRippleCopy } from "@/lib/board";
import { agoLabel } from "@/lib/format";
import { getViewer } from "@/lib/session";
import type { Metadata } from "next";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const copy = await getRippleCopy(id).catch(() => null);
  if (!copy) return { title: "Missing line" };
  return {
    title: copy.body.slice(0, 72),
    description: copy.body,
  };
}

export default function RipplePage({ params }: Params) {
  return (
    <Suspense fallback={<div className="stage h-72 animate-pulse" />}>
      <RippleLive params={params} />
    </Suspense>
  );
}

async function RippleLive({ params }: Params) {
  await connection();
  const { id } = await params;
  const result = await readDb(async () => {
    const viewer = await getViewer();
    return getRipple(id, viewer?.id ?? null);
  });
  if (!result.ok) return <DatabaseMissing />;
  if (!result.data) notFound();
  const detail = result.data;
  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Board
      </Link>
      <RippleStage card={detail.ripple} />
      <section className="grid gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em]">Replies</h2>
        {detail.replies.length === 0 ? <p className="text-muted">No twists yet.</p> : null}
        <ol className="grid gap-3">
          {detail.replies.map((note) => (
            <li key={note.id} className="row-card">
              <div className="flex items-start gap-3">
                <Avatar name={note.author.name} seed={note.author.handle} size="sm" />
                <div>
                  <p className="text-sm">
                    <Link href={`/u/${note.author.handle}`} className="hover:text-heat">
                      {note.author.name}
                    </Link>
                    <span className="text-muted"> · {agoLabel(note.createdAt)}</span>
                  </p>
                  <p className="mt-1 text-pretty">{note.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <ReplyForm rippleId={detail.ripple.id} />
      </section>
    </div>
  );
}
