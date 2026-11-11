import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { BoardView } from "@/components/board-view";
import { BoardFallback, DatabaseMissing } from "@/components/shell";
import { readDb } from "@/db";
import { focusBoard, loadBoard } from "@/lib/board";
import { getViewer } from "@/lib/session";
import { topicBySlug } from "@/lib/topics";

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const match = topicBySlug(topic);
  return { title: match ? match.label : "Topic" };
}

export function generateStaticParams() {
  return ["design", "product", "culture", "tech", "cities", "film"].map((topic) => ({ topic }));
}

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  return (
    <Suspense fallback={<BoardFallback />}>
      <TopicLive params={params} />
    </Suspense>
  );
}

async function TopicLive({ params }: { params: Promise<{ topic: string }> }) {
  await connection();
  const { topic: slug } = await params;
  const topic = topicBySlug(slug);
  if (!topic) notFound();
  const result = await readDb(async () => {
    const viewer = await getViewer();
    const all = await loadBoard(viewer?.id ?? null);
    return focusBoard(
      all,
      all.ranked.filter((item) => item.topic === topic.slug),
    );
  });
  if (!result.ok) return <DatabaseMissing />;
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-heat">Topic</p>
        <h1 className="quote mt-2 text-5xl">{topic.label}</h1>
      </div>
      <BoardView
        board={result.data}
        emptyTitle={`No ${topic.label.toLowerCase()} lines yet.`}
        emptyBody="Be the first passable sentence in this topic."
      />
    </div>
  );
}
