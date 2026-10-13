import { headers } from "next/headers";

export const BRAND = "Agentic Essence";

export const PRO_FEATURES = ["lora_tuning", "unlimited_agents"] as const;

/** Binaries served (auth-gated) from the R2 bucket. */
export const DOWNLOADS = {
  android: { key: "downloads/AgenticEssence-Android.apk", filename: "AgenticEssence-Android.apk", type: "application/vnd.android.package-archive" },
  windows: { key: "downloads/Agentic-Essence-Desktop-Setup.exe", filename: "Agentic-Essence-Desktop-Setup.exe", type: "application/vnd.microsoft.portable-executable" },
} as const;

/** Origin of the current request (used for Stripe return URLs and auth redirects). */
export async function getOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
}

/** Only allow same-site relative redirects (prevents open redirects via ?next=). */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
