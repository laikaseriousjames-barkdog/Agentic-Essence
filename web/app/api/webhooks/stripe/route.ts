import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { cryptoProvider, getStripe } from "@/lib/stripe";

type Admin = ReturnType<typeof createAdminClient>;

const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);

function periodEnd(sub: Stripe.Subscription): string | null {
  // Newer API versions moved current_period_end onto subscription items.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = sub as any;
  const ts: number | undefined = s.items?.data?.[0]?.current_period_end ?? s.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/** Creates the user's license key if they don't have an active one (idempotent; DB enforces uniqueness). */
async function ensureLicenseKey(admin: Admin, userId: string) {
  const { data: existing } = await admin
    .from("license_keys")
    .select("id")
    .eq("user_id", userId)
    .eq("revoked", false)
    .maybeSingle();
  if (existing) return;
  const { error } = await admin.from("license_keys").insert({ user_id: userId });
  if (error && error.code !== "23505") throw error; // 23505 = a concurrent delivery already created it
}

async function onCheckoutCompleted(admin: Admin, stripe: Stripe, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) {
    console.warn("checkout.session.completed without user reference", session.id);
    return;
  }
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return;

  const customerId = idOf(session.customer);

  if (session.mode === "subscription") {
    const subId = idOf(session.subscription);
    if (!subId) throw new Error(`subscription missing on session ${session.id}`);
    const sub = await stripe.subscriptions.retrieve(subId);
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        tier: PRO_STATUSES.has(sub.status) ? "pro" : "free",
        plan: "monthly",
        status: sub.status,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        current_period_end: periodEnd(sub),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;
  } else if (session.mode === "payment" && session.metadata?.plan === "lifetime") {
    // A lifetime purchase supersedes any running monthly subscription.
    const { data: prev } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle();

    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        tier: "pro",
        plan: "lifetime",
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: null,
        current_period_end: null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;

    if (prev?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(prev.stripe_subscription_id);
      } catch (e) {
        console.error("failed to cancel superseded monthly subscription", prev.stripe_subscription_id, e);
      }
    }
  } else {
    return; // not one of ours
  }

  await ensureLicenseKey(admin, userId);
}

async function onSubscriptionChanged(admin: Admin, sub: Stripe.Subscription) {
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: sub.status,
      tier: PRO_STATUSES.has(sub.status) ? "pro" : "free",
      current_period_end: periodEnd(sub),
    })
    .eq("stripe_subscription_id", sub.id)
    .eq("plan", "monthly");
  if (error) throw error;
  // If no row matches yet (event arrived before checkout.session.completed), that handler
  // retrieves the latest subscription state itself.
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const stripe = getStripe();
  const body = await request.text(); // raw body required for signature verification

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(admin, stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await onSubscriptionChanged(admin, event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
    // Handlers are idempotent; the log is for auditing/debugging only.
    await admin.from("stripe_events").upsert({ id: event.id, type: event.type }, { onConflict: "id" });
  } catch (e) {
    console.error("stripe webhook handler failed", event.id, event.type, e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 }); // Stripe will retry
  }

  return NextResponse.json({ received: true });
}
