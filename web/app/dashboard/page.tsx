import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { CopyKey } from "@/components/copy-key";

export const metadata = { title: "Dashboard — Agentic Essence" };
export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // RLS limits both queries to the signed-in user's own rows.
  const [{ data: sub }, { data: key }] = await Promise.all([
    supabase.from("subscriptions").select("tier, plan, status, current_period_end").maybeSingle(),
    supabase.from("license_keys").select("license_key").eq("revoked", false).maybeSingle(),
  ]);

  const isPro = sub?.tier === "pro";
  const renews = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString("en-US", { dateStyle: "medium" }) : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">← Agentic Essence</Link>
        <form action={signOut}>
          <button className="text-sm text-zinc-400 hover:text-white">Sign out</button>
        </form>
      </header>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">{user.email}</p>

      {checkout === "success" && !isPro && (
        <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Payment received. Your Pro license is being activated. Refresh in a few seconds.
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Subscription</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${isPro ? "bg-violet-500/20 text-violet-200" : "bg-white/10 text-zinc-300"}`}>
            {isPro ? "Pro" : "Free"}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          {isPro
            ? sub?.plan === "lifetime"
              ? "Pro Lifetime. Never expires."
              : `Pro Monthly (${sub?.status})${renews ? `. Current period ends ${renews}.` : "."}`
            : "Free tier: bring your own keys and run local models."}
        </p>
        {!isPro && (
          <Link href="/#pricing" className="mt-4 inline-block rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium hover:bg-violet-400">
            Upgrade to Pro
          </Link>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-medium">License key</h2>
        {isPro && key ? (
          <>
            <p className="mb-4 mt-1 text-sm text-zinc-400">Paste this into Agentic Essence (desktop or mobile) to unlock Pro. Works on up to 3 devices.</p>
            <CopyKey value={key.license_key} />
          </>
        ) : isPro ? (
          <p className="mt-2 text-sm text-zinc-400">Your key is being generated. Refresh in a moment.</p>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">License keys are issued with a Pro plan. The Free tier needs no key.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-medium">Downloads</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/download/windows" className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10">
            <div className="font-medium">Windows</div>
            <div className="text-xs text-zinc-400">Agentic-Essence-Desktop-Setup.exe</div>
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/download/android" className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10">
            <div className="font-medium">Android</div>
            <div className="text-xs text-zinc-400">AgenticEssence-Android.apk</div>
          </a>
        </div>
      </section>
    </main>
  );
}
