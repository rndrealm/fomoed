import Stripe from "stripe";

const stripe = new Stripe(process.env.PRIVATE_STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

export default stripe;
