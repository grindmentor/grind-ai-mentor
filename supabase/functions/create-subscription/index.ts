
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { tier, billing } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    // Stripe product IDs for the Premium plan
    const priceIds = {
      premium: {
        monthly: 'prod_SbMYMe5X5uV2FT', // Monthly Premium
        annual: 'prod_SbMZ8cG7FKq3C6'   // Annual Premium
      }
    };

    // Price mapping for monthly and annual billing
    const prices = {
      premium: {
        monthly: 999, // $9.99
        annual: 9999  // $99.99
      }
    };

    // Only allow premium tier now
    if (tier !== 'premium') {
      throw new Error("Only Premium subscriptions are available");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Myotopia Premium",
              description: `${billing === 'annual' ? 'Annual' : 'Monthly'} Premium subscription`
            },
            unit_amount: prices.premium[billing],
            recurring: { 
              interval: billing === 'annual' ? 'year' : 'month',
              interval_count: 1
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/app?payment=success&pwa=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?payment=cancelled&pwa=true`,
      metadata: {
        user_id: user.id,
        tier: tier,
        billing: billing
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
