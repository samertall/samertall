"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { togglePass } from "@/app/actions";

export function PassButton({
  rippleId,
  passed,
  count,
  own,
  size = "compact",
}: {
  rippleId: string;
  passed: boolean;
  count: number;
  own: boolean;
  size?: "stage" | "compact";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState({ passed, count });
  const [note, setNote] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (own) {
    return (
      <p className={size === "stage" ? "text-sm text-muted" : "text-xs text-muted"}>
        {count} {count === 1 ? "pass" : "passes"} · your line
      </p>
    );
  }

  return (
    <div className={size === "stage" ? "flex flex-col items-start gap-2" : "flex flex-col items-end gap-1"}>
      <button
        type="button"
        aria-pressed={state.passed}
        disabled={pending}
        onClick={() => {
          setNote(null);
          const previous = state;
          const nextPassed = !state.passed;
          setState({ passed: nextPassed, count: Math.max(0, state.count + (nextPassed ? 1 : -1)) });
          start(async () => {
            const result = await togglePass(rippleId);
            if (!result.ok) {
              setState(previous);
              if (result.reason === "auth") {
                router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
                return;
              }
              setNote(result.reason === "self" ? "You can't pass your own line." : "That line is gone.");
              return;
            }
            setState({ passed: result.passed, count: result.count });
            router.refresh();
          });
        }}
        className={size === "stage" ? "btn btn-heat px-5 text-base" : "btn btn-heat h-9 px-3 text-sm"}
      >
        {state.passed ? "Passed" : "Pass"}
        <span className="tabular-nums">· {state.count}</span>
      </button>
      {note ? (
        <p role="alert" className="text-xs text-ember">
          {note}
        </p>
      ) : null}
    </div>
  );
}
