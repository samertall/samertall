import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { Avatar } from "@/components/avatar";
import { RippleList } from "@/components/board-view";
import { DatabaseMissing } from "@/components/shell";
import { readDb } from "@/db";
import { getProfile } from "@/lib/board";
import { getViewer } from "@/lib/session";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  return (
    <Suspense fallback={<div className="panel h-48 animate-pulse" />}>
      <ProfileLive params={params} />
    </Suspense>
  );
}

async function ProfileLive({ params }: { params: Promise<{ handle: string }> }) {
  await connection();
  const { handle } = await params;
  const result = await readDb(async () => {
    const viewer = await getViewer();
    const profile = await getProfile(handle.toLowerCase(), viewer?.id ?? null);
    return { viewer, profile };
  });
  if (!result.ok) return <DatabaseMissing />;
  const { viewer, profile } = result.data;
  if (!profile) notFound();
  return (
    <div className="grid gap-8">
      <header className="flex items-start gap-4">
        <Avatar name={profile.author.name} seed={profile.author.handle} />
        <div>
          <h1 className="quote text-4xl">{profile.author.name}</h1>
          <p className="text-muted">@{profile.author.handle}</p>
          {profile.author.bio ? <p className="mt-3 max-w-xl">{profile.author.bio}</p> : null}
          {viewer?.id === profile.author.id ? (
            <Link href="/me" className="mt-3 inline-block text-sm text-heat">
              Edit profile
            </Link>
          ) : null}
        </div>
      </header>
      <RippleList items={profile.ripples} empty="No lines yet." />
    </div>
  );
}
