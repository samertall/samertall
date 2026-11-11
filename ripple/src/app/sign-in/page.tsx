import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SignInForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/text";

export const metadata = { title: "Sign in" };

export default function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense fallback={<div className="panel mx-auto h-64 max-w-md" />}>
      <SignInLive searchParams={searchParams} />
    </Suspense>
  );
}

async function SignInLive({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await connection();
  const params = await searchParams;
  const next = safeNext(params.next);
  return (
    <section className="panel mx-auto grid w-full max-w-md gap-6">
      <div>
        <h1 className="quote text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Pass lines, reply, and drop your own.</p>
      </div>
      <SignInForm next={next} />
      <p className="text-sm text-muted">
        New here?{" "}
        <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="text-heat">
          Create an account
        </Link>
      </p>
    </section>
  );
}
