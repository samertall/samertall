"use client";

import { useActionState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/form-state";

const links = [
  { href: "/", label: "Catalog" },
  { href: "/study", label: "Study" },
  { href: "/teach", label: "Studio" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {state?.error ? (
        <p className="alert" role="alert">
          {state.error}
        </p>
      ) : null}
      {children}
    </form>
  );
}

export function SubmitButton({
  children,
  pending,
  variant = "ink",
}: {
  children: string;
  pending?: string;
  variant?: "ink" | "brass" | "ghost" | "danger";
}) {
  const status = useFormStatus();
  return (
    <button className={`btn btn-${variant}`} type="submit" disabled={status.pending}>
      {status.pending ? (pending ?? "Saving…") : children}
    </button>
  );
}

export function PrintButton() {
  return (
    <button className="btn btn-ink noprint" type="button" onClick={() => window.print()}>
      Print certificate
    </button>
  );
}
