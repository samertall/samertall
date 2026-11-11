import { Suspense } from "react";
import { connection } from "next/server";
import { DropForm } from "@/components/composer";
import { getViewer } from "@/lib/session";
import Link from "next/link";

export const metadata = { title: "Drop" };

export default function DropPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  return (
    <Suspense fallback={<div className="panel h-64 animate-pulse" />}>
      <DropLive searchParams={searchParams} />
    </Suspense>
  );
}

async function DropLive({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  await connection();
  const params = await searchParams;
  const viewer = await getViewer().catch(() => null);
  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-heat">New line</p>
        <h1 className="quote mt-3 text-5xl">Drop something worth passing.</h1>
        <p className="mt-3 max-w-xl text-muted">
          One sentence. A topic. If it catches, the heat will show it before the board moves on.
        </p>
      </div>
      {viewer && !viewer.handle ? (
        <p className="panel text-sm">
          Claim a handle before you drop. <Link href="/me?next=/drop" className="text-heat">Set it on your account.</Link>
        </p>
      ) : null}
      <DropForm defaultTopic={params.topic} />
    </div>
  );
}
