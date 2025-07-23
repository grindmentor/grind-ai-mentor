-- Add missing columns to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admin can view subscribers" ON public.subscribers;

-- Create comprehensive RLS policies for subscription management
CREATE POLICY "Users can view own subscription" 
  ON public.subscribers 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.email() = email OR
    email IN ('emilbelq@gmail.com', 'lucasblandquist@gmail.com', 'sindre@limaway.no')
  );

CREATE POLICY "System can manage subscriptions" 
  ON public.subscribers 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer ON public.subscribers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscribers_updated_at();