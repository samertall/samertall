import { Suspense } from "react";
import { connection } from "next/server";
import { BoardFallback, DatabaseMissing } from "@/components/shell";
import { BoardView } from "@/components/board-view";
import { readDb } from "@/db";
import { loadBoard } from "@/lib/board";
import { getViewer } from "@/lib/session";

export default function HomePage() {
  return (
    <Suspense fallback={<BoardFallback />}>
      <HomeLive />
    </Suspense>
  );
}

async function HomeLive() {
  await connection();
  const result = await readDb(async () => {
    const viewer = await getViewer();
    return loadBoard(viewer?.id ?? null);
  });
  if (!result.ok) return <DatabaseMissing />;
  return (
    <div className="grid gap-8">
      <BoardView board={result.data} />
      <p className="max-w-2xl text-sm text-muted">
        Heat climbs when a line is passed in the last hour, then cools as attention moves on. Reply if you can add a
        turn, not an echo.
      </p>
    </div>
  );
}
