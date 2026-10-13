import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRO_FEATURES } from "@/lib/site";

const KEY_RE = /^AE-[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){3}$/;
const MAX_DEVICES = 3;
const MONTHLY_GRACE_MS = 3 * 24 * 3600 * 1000; // tolerate delayed renewal webhooks

const headers = { "Cache-Control": "no-store" };
const invalid = (status = 200, reason?: string) =>
  NextResponse.json({ valid: false, tier: "free", ...(reason ? { reason } : {}) }, { status, headers });

/**
 * License validation for desktop/mobile clients.
 * POST { license_key, hardware_id } -> { valid, tier, features? }
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalid(400);
  }
  const { license_key, hardware_id } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof license_key !== "string" ||
    typeof hardware_id !== "string" ||
    !KEY_RE.test(license_key.trim().toUpperCase()) ||
    hardware_id.length < 8 ||
    hardware_id.length > 256
  ) {
    return invalid(400);
  }

  const admin = createAdminClient();
  const { data: key } = await admin
    .from("license_keys")
    .select("id, user_id, revoked")
    .eq("license_key", license_key.trim().toUpperCase())
    .maybeSingle();
  if (!key || key.revoked) return invalid();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("tier, plan, status, current_period_end")
    .eq("user_id", key.user_id)
    .maybeSingle();

  const periodOk =
    sub?.plan === "lifetime" ||
    (sub?.current_period_end != null && new Date(sub.current_period_end).getTime() + MONTHLY_GRACE_MS > Date.now());
  if (!sub || sub.tier !== "pro" || !periodOk) return invalid();

  const { data: allowed, error } = await admin.rpc("activate_license_device", {
    p_license_key_id: key.id,
    p_hardware_id: hardware_id,
    p_max_devices: MAX_DEVICES,
  });
  if (error) {
    console.error("activate_license_device failed", error);
    return NextResponse.json({ error: "Verification unavailable" }, { status: 503, headers });
  }
  if (!allowed) return invalid(200, "device_limit");

  await admin.from("license_keys").update({ last_verified_at: new Date().toISOString() }).eq("id", key.id);

  return NextResponse.json({ valid: true, tier: "pro", features: [...PRO_FEATURES] }, { headers });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { ...headers, Allow: "POST" } });
}
