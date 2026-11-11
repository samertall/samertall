"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-muted hover:text-foreground"
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
        router.push("/");
      }}
    >
      Sign out
    </button>
  );
}
