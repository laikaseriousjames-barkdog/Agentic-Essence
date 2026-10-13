import Link from "next/link";
import { Pricing } from "@/components/pricing";

const FEATURES = [
  {
    title: "Offline-first by design",
    body: "Agents and models run on your device. No account, network, or cloud round-trip is required to do your work.",
  },
  {
    title: "Visual multi-agent workspace",
    body: "Compose, wire up, and watch agents collaborate on a canvas instead of juggling terminals and config files.",
  },
  {
    title: "Secure local memory",
    body: "Conversations and context stay in on-device storage that you control. Nothing is uploaded unless you choose to.",
  },
  {
    title: "On-device LoRA tuning",
    body: "Fine-tune adapters on your own data without it ever leaving your hardware. Included in Pro.",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold tracking-tight">Agentic Essence</Link>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <Link href="/dashboard" className="rounded-lg border border-white/10 px-3 py-1.5 text-white hover:bg-white/5">Dashboard</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(139,92,246,0.25),transparent)]" />
          <div className="mx-auto max-w-3xl px-6 pb-24 pt-24 text-center">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              On-Device Multi-Agent Platform &amp; LoRA Tuning Workspace.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
              Build, run, and fine-tune AI agents entirely on your own hardware. Private by default, fast, and offline-first.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="rounded-lg bg-violet-500 px-6 py-3 font-medium text-white hover:bg-violet-400">Download free</Link>
              <a href="#pricing" className="rounded-lg border border-white/15 px-6 py-3 font-medium hover:bg-white/5">See Pro</a>
            </div>
            <p className="mt-4 text-xs text-zinc-500">Windows and Android. Free account required to download.</p>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Your agents. Your device. Your data.</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Simple pricing</h2>
          <p className="mt-3 text-center text-zinc-400">Start free. Upgrade when you want LoRA tuning and unlimited agents.</p>
          <Pricing />
        </section>
      </main>

      <footer className="border-t border-white/5 py-10 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} Agentic Essence
      </footer>
    </>
  );
}
