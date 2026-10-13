import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, priceIdFor, type Plan } from "@/lib/stripe";

/** Starts a Stripe Checkout session for the signed-in user. Body: form field `plan` = monthly | lifetime. */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const form = await request.formData().catch(() => null);
  const plan = form?.get("plan");
  if (plan !== "monthly" && plan !== "lifetime") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/signup?next=${encodeURIComponent("/#pricing")}`, 303);
  }

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("tier, plan, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Already Pro for life, or already on this plan: nothing to buy.
  if (sub?.tier === "pro" && (sub.plan === "lifetime" || sub.plan === plan)) {
    return NextResponse.redirect(`${origin}/dashboard`, 303);
  }

  const stripe = getStripe();
  const p = plan as Plan;
  const session = await stripe.checkout.sessions.create({
    mode: p === "monthly" ? "subscription" : "payment",
    line_items: [{ price: priceIdFor(p), quantity: 1 }],
    client_reference_id: user.id,
    metadata: { user_id: user.id, plan: p },
    ...(p === "monthly" ? { subscription_data: { metadata: { user_id: user.id, plan: p } } } : {}),
    ...(sub?.stripe_customer_id ? { customer: sub.stripe_customer_id } : { customer_email: user.email ?? undefined }),
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/#pricing`,
  });

  if (!session.url) return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  return NextResponse.redirect(session.url, 303);
}
