
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno";

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

    console.log(`[WEBHOOK] Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === "subscription") {
          console.log("Subscription checkout completed:", {
            sessionId: session.id,
            customerId: session.customer,
            subscriptionId: session.subscription
          });
          
          // Update database with subscription info
          await updateSubscriptionStatus(session.customer as string, true, 'premium');
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Subscription ${event.type}:`, {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end
        });

        // Update subscription status based on Stripe status
        const isActive = subscription.status === 'active';
        await updateSubscriptionStatus(subscription.customer as string, isActive, 'premium');
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Subscription cancelled:`, {
          subscriptionId: subscription.id,
          customerId: subscription.customer
        });

        // Mark subscription as cancelled
        await updateSubscriptionStatus(subscription.customer as string, false, 'free');
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log("Invoice payment succeeded:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription
        });

        // Ensure subscription is active on successful payment
        if (invoice.subscription) {
          await updateSubscriptionStatus(invoice.customer as string, true, 'premium');
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        console.log("Invoice payment failed:", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          subscriptionId: invoice.subscription
        });

        // Optionally handle failed payments (grace period, notifications, etc.)
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

// Helper function to update subscription status in database
async function updateSubscriptionStatus(customerId: string, subscribed: boolean, tier: string) {
  try {
    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.error("Customer not found or deleted:", customerId);
      return;
    }

    const email = (customer as Stripe.Customer).email;
    if (!email) {
      console.error("Customer email not found:", customerId);
      return;
    }

    console.log(`Updating subscription for ${email}: subscribed=${subscribed}, tier=${tier}`);

    // Update subscribers table
    const { error } = await supabase
      .from('subscribers')
      .upsert({
        email: email,
        subscribed: subscribed,
        subscription_tier: tier,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error("Database update error:", error);
    } else {
      console.log("Successfully updated subscription status in database");
    }
  } catch (error) {
    console.error("Error updating subscription status:", error);
  }
}
