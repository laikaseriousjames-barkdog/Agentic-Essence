"use client";

import { useState } from "react";
import Link from "next/link";

const FREE = ["Bring your own API keys (BYOK)", "Run local models on-device", "Visual multi-agent workspace", "Secure local memory", "Windows + Android apps"];
const PRO = ["Everything in Free", "On-device LoRA fine-tuning", "Unlimited agents", "Use on up to 3 devices", "Priority updates"];

export function Pricing() {
  const [tier, setTier] = useState<"free" | "pro">("pro");
  const [plan, setPlan] = useState<"monthly" | "lifetime">("monthly");

  const seg = (active: boolean) =>
    `rounded-full px-5 py-2 text-sm font-medium transition ${active ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`;

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div role="tablist" aria-label="Plan" className="mx-auto flex w-fit rounded-full border border-white/10 bg-white/5 p-1">
        <button role="tab" aria-selected={tier === "free"} onClick={() => setTier("free")} className={seg(tier === "free")}>Free</button>
        <button role="tab" aria-selected={tier === "pro"} onClick={() => setTier("pro")} className={seg(tier === "pro")}>Pro</button>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        {tier === "free" ? (
          <>
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="mt-2 text-4xl font-semibold">$0</p>
            <p className="mt-1 text-sm text-zinc-400">BYOK and local models only.</p>
            <List items={FREE} />
            <Link href="/signup" className="mt-8 block rounded-lg border border-white/15 px-4 py-3 text-center font-medium hover:bg-white/5">
              Get started free
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Pro</h3>
              <div className="flex rounded-full border border-white/10 bg-white/5 p-0.5 text-xs">
                <button onClick={() => setPlan("monthly")} className={`rounded-full px-3 py-1 ${plan === "monthly" ? "bg-violet-500 text-white" : "text-zinc-400"}`}>Monthly</button>
                <button onClick={() => setPlan("lifetime")} className={`rounded-full px-3 py-1 ${plan === "lifetime" ? "bg-violet-500 text-white" : "text-zinc-400"}`}>Lifetime</button>
              </div>
            </div>
            <p className="mt-2 text-4xl font-semibold">
              {plan === "monthly" ? "$15" : "$99"}
              <span className="ml-1 text-base font-normal text-zinc-400">{plan === "monthly" ? "/month" : " once"}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-400">{plan === "monthly" ? "Cancel any time." : "Pay once, own Pro forever."}</p>
            <List items={PRO} />
            <form action="/api/checkout" method="post">
              <input type="hidden" name="plan" value={plan} />
              <button className="mt-8 w-full rounded-lg bg-violet-500 px-4 py-3 font-medium text-white hover:bg-violet-400">
                {plan === "monthly" ? "Subscribe — $15/mo" : "Buy lifetime — $99"}
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-zinc-500">Secure checkout by Stripe. You&apos;ll create a free account first.</p>
          </>
        )}
      </div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3 text-sm text-zinc-300">
      {items.map((i) => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-0.5 text-violet-400">✓</span>
          {i}
        </li>
      ))}
    </ul>
  );
}
