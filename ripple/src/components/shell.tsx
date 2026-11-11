import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Mark } from "@/components/mark";
import { SignOutButton } from "@/components/sign-out";
import { isDatabaseUnavailable } from "@/db";
import { getViewer } from "@/lib/session";
import { TOPICS } from "@/lib/topics";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Ripple home">
            <Mark />
            <span className="text-sm font-semibold tracking-[0.22em]">RIPPLE</span>
          </Link>
          <Link href="/rising" className="text-sm text-muted hover:text-foreground">
            Rising
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/drop" className="btn btn-heat h-9 px-3 text-sm">
              Drop
            </Link>
            <Suspense fallback={<span className="text-sm text-muted">Account</span>}>
              <AccountSlot />
            </Suspense>
          </div>
        </div>
        <nav aria-label="Topics" className="scroller mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          {TOPICS.map((topic) => (
            <Link key={topic.slug} href={`/t/${topic.slug}`} className="chip">
              {topic.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Pass it before it cools.</p>
          <p>Opening voices start the board. Accounts, drops, and passes you make are stored.</p>
        </div>
      </footer>
    </>
  );
}

async function AccountSlot() {
  await connection();
  let viewer: Awaited<ReturnType<typeof getViewer>> = null;
  try {
    viewer = await getViewer();
  } catch (error) {
    if (!isDatabaseUnavailable(error)) throw error;
  }
  if (!viewer) {
    return (
      <Link href="/sign-in" className="text-sm text-muted hover:text-foreground">
        Sign in
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link href={viewer.handle ? `/u/${viewer.handle}` : "/me"} className="text-sm hover:text-heat">
        {viewer.handle ? `@${viewer.handle}` : viewer.name}
      </Link>
      <SignOutButton />
    </div>
  );
}

export function BoardFallback() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="stage h-72 animate-pulse bg-surface" />
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-40 rounded-3xl bg-surface" />
        <div className="h-40 rounded-3xl bg-surface" />
      </div>
    </div>
  );
}

export function DatabaseMissing() {
  return (
    <section className="panel max-w-xl">
      <h1 className="quote text-4xl">The board needs its database.</h1>
      <p className="mt-3 text-muted">
        Ripple stores lines, passes, and accounts in Postgres. Set <code>DATABASE_URL</code>, push the schema, and
        reload.
      </p>
    </section>
  );
}
