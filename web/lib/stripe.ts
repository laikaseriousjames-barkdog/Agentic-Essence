import Stripe from "stripe";

/** Stripe client for Workers: fetch-based HTTP + WebCrypto (no Node http/crypto). */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();

export type Plan = "monthly" | "lifetime";

export function priceIdFor(plan: Plan): string {
  const id =
    plan === "monthly" ? process.env.STRIPE_PRICE_PRO_MONTHLY : process.env.STRIPE_PRICE_PRO_LIFETIME;
  if (!id) throw new Error(`Stripe price for plan "${plan}" is not configured`);
  return id;
}
