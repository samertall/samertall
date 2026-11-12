"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="page sheet stack">
      <p className="kicker">Something failed</p>
      <h1>The page could not be loaded.</h1>
      <p className="muted">Try again. If it keeps failing, the course data did not come back.</p>
      <button className="btn btn-ink" type="button" onClick={() => reset()}>
        Try again
      </button>
    </section>
  );
}
