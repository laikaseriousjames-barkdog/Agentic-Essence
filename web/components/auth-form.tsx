import Link from "next/link";
import { signIn, signUp } from "@/app/auth/actions";

export function AuthForm({
  mode,
  error,
  message,
  next,
}: {
  mode: "login" | "signup";
  error?: string;
  message?: string;
  next?: string;
}) {
  const isLogin = mode === "login";
  const nextQs = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Link href="/" className="mb-8 text-sm text-zinc-400 hover:text-white">
        ← Agentic Essence
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{isLogin ? "Sign in" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {isLogin ? "Access your license key and downloads." : "Free to start. Upgrade to Pro any time."}
      </p>

      {error && <p role="alert" className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      {message && <p className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{message}</p>}

      <form action={isLogin ? signIn : signUp} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <label className="block text-sm">
          <span className="text-zinc-300">Email</span>
          <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400" />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-300">Password</span>
          <input name="password" type="password" required minLength={8} autoComplete={isLogin ? "current-password" : "new-password"} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-400" />
        </label>
        <button className="w-full rounded-lg bg-violet-500 px-4 py-2.5 font-medium text-white hover:bg-violet-400">
          {isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-400">
        {isLogin ? "No account? " : "Already have an account? "}
        <Link href={`${isLogin ? "/signup" : "/login"}${nextQs}`} className="text-violet-300 hover:underline">
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </main>
  );
}
