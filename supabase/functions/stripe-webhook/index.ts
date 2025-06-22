
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "payment") {
          // One-time payment completed
          await supabase
            .from("payments")
            .update({
              status: "completed",
              stripe_customer_id: session.customer as string,
            })
            .eq("user_id", session.metadata?.user_id);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription creation/update
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (customer && !customer.deleted) {
          await supabase
            .from("payments")
            .insert({
              user_id: customer.metadata?.user_id,
              stripe_customer_id: customer.id,
              payment_method: "stripe_subscription",
              amount: subscription.items.data[0]?.price.unit_amount || 0,
              subscription_tier: subscription.items.data[0]?.price.unit_amount === 1000 ? "basic" : "premium",
              status: "completed",
            });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Handle subscription cancellation
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (customer && !customer.deleted) {
          // Mark subscription as cancelled - user falls back to free tier
          console.log(`Subscription cancelled for customer: ${customer.id}`);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});
