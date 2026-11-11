import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.16em] text-heat">404</p>
      <h1 className="quote mt-3 text-5xl">That line cooled off.</h1>
      <p className="mt-3 text-muted">It is not on the board anymore, or the address missed.</p>
      <Link href="/" className="btn btn-heat mt-6 w-fit">
        Back to the board
      </Link>
    </section>
  );
}
