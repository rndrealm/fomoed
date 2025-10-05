import Stripe from "stripe";

let stripe: Stripe | null = null;

export default function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.PRIVATE_STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Missing Stripe secret key in environment");
    }

    stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });
  }
  return stripe;
}
