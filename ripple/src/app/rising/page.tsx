import { Suspense } from "react";
import { connection } from "next/server";
import { RippleList } from "@/components/board-view";
import { BoardFallback, DatabaseMissing } from "@/components/shell";
import { readDb } from "@/db";
import { loadBoard } from "@/lib/board";
import { getViewer } from "@/lib/session";

export const metadata = { title: "Rising" };

export default function RisingPage() {
  return (
    <Suspense fallback={<BoardFallback />}>
      <RisingLive />
    </Suspense>
  );
}

async function RisingLive() {
  await connection();
  const result = await readDb(async () => {
    const viewer = await getViewer();
    return loadBoard(viewer?.id ?? null);
  });
  if (!result.ok) return <DatabaseMissing />;
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-heat">Leaderboard</p>
        <h1 className="quote mt-2 text-5xl">What is catching.</h1>
        <p className="mt-3 max-w-xl text-muted">
          A pass in the last hour is worth more than a pass from this morning. Storms do not stay storms.
        </p>
      </div>
      <RippleList items={result.data.ranked} empty="The board is empty." />
    </div>
  );
}
