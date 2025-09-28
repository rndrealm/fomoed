import Stripe from "stripe";

const stripe = new Stripe(process.env.PRIVATE_STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export default stripe;
