"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="panel mx-auto max-w-xl">
      <h1 className="quote text-4xl">The board stumbled.</h1>
      <p className="mt-3 text-muted">The last request did not finish. Try it again.</p>
      <button type="button" className="btn btn-heat mt-6" onClick={() => reset()}>
        Try again
      </button>
    </section>
  );
}
