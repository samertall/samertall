import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { HandleForm } from "@/components/composer";
import { RippleList } from "@/components/board-view";
import { getProfile, loadBoard } from "@/lib/board";
import { getViewer } from "@/lib/session";
import { safeNext } from "@/lib/text";

export const metadata = { title: "Your account" };

export default function MePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense fallback={<div className="panel h-48 animate-pulse" />}>
      <MeLive searchParams={searchParams} />
    </Suspense>
  );
}

async function MeLive({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await connection();
  const viewer = await getViewer();
  const params = await searchParams;
  const next = safeNext(params.next ?? "/me");
  if (!viewer) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  const profile = viewer.handle ? await getProfile(viewer.handle, viewer.id) : null;
  const lines = profile?.ripples ?? (await loadBoard(viewer.id)).ranked.filter((item) => item.author.id === viewer.id);

  return (
    <div className="mx-auto grid max-w-2xl gap-10">
      <div>
        <h1 className="quote text-5xl">{viewer.handle ? `@${viewer.handle}` : "Claim a handle"}</h1>
        <p className="mt-3 text-muted">Your name on the board is {viewer.name}.</p>
      </div>
      <HandleForm handle={viewer.handle} bio={viewer.bio} next={next} />
      <section className="grid gap-4">
        <h2 className="text-sm uppercase tracking-[0.16em]">Your lines</h2>
        <RippleList items={lines} empty="You have not dropped a line yet." />
      </section>
    </div>
  );
}
