"use client";

import { useState } from "react";

export function CopyKey({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 select-all rounded-lg border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm tracking-wider text-violet-200">
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
