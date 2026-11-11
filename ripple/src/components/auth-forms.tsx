"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      method="post"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        const result = await authClient.signIn.email({
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        });
        setPending(false);
        if (result.error) {
          setError(result.error.message ?? "Those details did not match an account.");
          return;
        }
        router.push(next);
        router.refresh();
      }}
    >
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="current-password" />
      {error ? (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      ) : null}
      <button className="btn btn-heat w-full" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      method="post"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = String(data.get("password") ?? "");
        if (password.length < 8) {
          setError("Use at least 8 characters.");
          return;
        }
        setPending(true);
        setError(null);
        const result = await authClient.signUp.email({
          name: String(data.get("name") ?? "").trim(),
          email: String(data.get("email") ?? ""),
          password,
        });
        setPending(false);
        if (result.error) {
          setError(result.error.message ?? "Could not create that account.");
          return;
        }
        router.push(next);
        router.refresh();
      }}
    >
      <Field label="Name" name="name" type="text" autoComplete="name" />
      <Field label="Email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters." />
      {error ? (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      ) : null}
      <button className="btn btn-heat w-full" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  hint?: string;
}) {
  const id = `auth-${name}`;
  return (
    <label className="grid gap-1.5 text-sm" htmlFor={id}>
      <span>{label}</span>
      <input id={id} name={name} type={type} autoComplete={autoComplete} required className="field" />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
