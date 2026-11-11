"use client";

import { useState } from "react";

export function CopyLink({ url, text }: { url: string; text: string }) {
  const [label, setLabel] = useState("Copy link");

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={async () => {
        const share = { title: "Ripple", text, url };
        try {
          if (navigator.share) {
            await navigator.share(share);
            setLabel("Shared");
          } else {
            await navigator.clipboard.writeText(url);
            setLabel("Copied");
          }
        } catch {
          try {
            await navigator.clipboard.writeText(url);
            setLabel("Copied");
          } catch {
            setLabel("Copy failed");
          }
        }
        window.setTimeout(() => setLabel("Copy link"), 1800);
      }}
    >
      {label}
    </button>
  );
}
