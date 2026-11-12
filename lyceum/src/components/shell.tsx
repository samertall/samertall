import Link from "next/link";
import { connection } from "next/server";
import { Nav } from "@/components/widgets";
import { readViewer } from "@/server/viewer";

export function HeaderFallback() {
  return (
    <header className="topbar">
      <Link href="/" className="wordmark">
        Lyceum
      </Link>
      <nav aria-label="Primary">
        <Link href="/">Catalog</Link>
        <Link href="/study">Study</Link>
        <Link href="/teach">Studio</Link>
      </nav>
      <p className="who"> </p>
    </header>
  );
}

export async function Header() {
  await connection();
  const viewer = await readViewer();
  const name = viewer.kind === "person" ? viewer.name : "Guest";
  return (
    <header className="topbar">
      <Link href="/" className="wordmark">
        Lyceum
      </Link>
      <Nav />
      <p className="who">{name}</p>
    </header>
  );
}
