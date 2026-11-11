"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07090c", color: "#f4f6f8", fontFamily: "Georgia, serif" }}>
        <main style={{ maxWidth: 560, padding: "4rem 1.5rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 460, letterSpacing: "-0.04em" }}>Ripple hit a snag.</h1>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              background: "#f7c948",
              color: "#16130a",
              border: 0,
              borderRadius: 999,
              padding: "0.8rem 1.2rem",
              fontWeight: 700,
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
