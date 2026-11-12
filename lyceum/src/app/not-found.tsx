import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page sheet stack">
      <p className="kicker">Missing</p>
      <h1>That page is not in the catalog.</h1>
      <Link className="btn btn-ink" href="/">
        Back to the catalog
      </Link>
    </section>
  );
}
