import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { SignUpForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/text";

export const metadata = { title: "Create account" };

export default function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <Suspense fallback={<div className="panel mx-auto h-72 max-w-md" />}>
      <SignUpLive searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUpLive({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await connection();
  const params = await searchParams;
  const next = params.next ? safeNext(params.next) : "/me";
  return (
    <section className="panel mx-auto grid w-full max-w-md gap-6">
      <div>
        <h1 className="quote text-4xl">Create an account</h1>
        <p className="mt-2 text-sm text-muted">Then claim a handle and drop a line.</p>
      </div>
      <SignUpForm next={next} />
      <p className="text-sm text-muted">
        Already have one?{" "}
        <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="text-heat">
          Sign in
        </Link>
      </p>
    </section>
  );
}
