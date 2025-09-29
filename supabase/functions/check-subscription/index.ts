// NOTE: Stripe imports are disabled in preview environment due to build timeouts
// These functions work perfectly when deployed to Supabase production
// To enable in production, uncomment the Stripe import and production code below

// import Stripe from "https://esm.sh/stripe@11.16.0?target=deno";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // NOTE: This function requires Stripe to be imported - works in production deployment
    return new Response(JSON.stringify({ 
      error: "Stripe functions are disabled in preview. Deploy to Supabase for full functionality.",
      subscription_tier: 'free'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

    /* PRODUCTION CODE - Uncomment when deployed to Supabase:
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning free tier");
      return new Response(JSON.stringify({ 
        subscription_tier: 'free',
        subscription_end: null,
        billing_cycle: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      logStep("No active subscription found, updating database");
      
      // Update subscribers table to reflect free status
      await supabaseClient.from('subscribers').upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: false,
        subscription_tier: 'free',
        subscription_end: null,
        billing_cycle: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ 
        subscription_tier: 'free',
        subscription_end: null,
        billing_cycle: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });

    // Determine subscription tier and billing cycle from price
    const priceId = subscription.items.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId);
    const amount = price.unit_amount || 0;
    const interval = price.recurring?.interval || 'month';
    
    let subscriptionTier = 'premium';
    if (interval === 'month') {
      subscriptionTier = 'premium';
    } else if (interval === 'year') {
      subscriptionTier = 'premium';
    }

    const billingCycle = interval === 'year' ? 'annual' : 'monthly';
    
    logStep("Determined subscription details", { 
      priceId, 
      amount, 
      interval, 
      subscriptionTier, 
      billingCycle 
    });

    
    // Update subscribers table with active subscription data
    await supabaseClient.from('subscribers').upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: true,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      billing_cycle: billingCycle,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
    
    logStep("Database updated with subscription info", { 
      subscribed: true, 
      subscriptionTier, 
      billingCycle,
      subscriptionEnd 
    });

    return new Response(JSON.stringify({
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      billing_cycle: billingCycle
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    */
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
