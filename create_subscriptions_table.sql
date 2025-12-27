-- Create subscriptions table for tracking user purchases
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Purchase details
  purchase_type VARCHAR(20) NOT NULL CHECK (purchase_type IN ('subject', 'year', 'years')),
  degree_id UUID REFERENCES public.nodes(id),
  degree_title TEXT,

  -- What was purchased
  year_ids UUID[] DEFAULT ARRAY[]::UUID[],
  subject_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- Pricing information
  total_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment information (for future payment gateway integration)
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT, -- Payment gateway transaction ID
  payment_method VARCHAR(50), -- e.g., 'razorpay', 'stripe', 'paypal'

  -- Subscription period
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL for lifetime access
  is_lifetime BOOLEAN DEFAULT true,

  -- Status
  is_active BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_status ON public.subscriptions(payment_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON public.subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions (for purchase flow)
CREATE POLICY "Users can create own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions (for cancellation, etc.)
CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin policy (replace with your admin email)
CREATE POLICY "Admins have full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.email = 'manishkalyan141@gmail.com'
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO service_role;

-- Create a view for easy access checking
CREATE OR REPLACE VIEW public.user_active_subscriptions AS
SELECT
  s.*,
  p.email,
  p.full_name
FROM public.subscriptions s
JOIN public.profiles p ON s.user_id = p.id
WHERE s.is_active = true
  AND s.payment_status = 'completed'
  AND (s.expires_at IS NULL OR s.expires_at > NOW());

-- Grant access to the view
GRANT SELECT ON public.user_active_subscriptions TO authenticated;

COMMENT ON TABLE public.subscriptions IS 'Stores user subscription and purchase records';
COMMENT ON COLUMN public.subscriptions.purchase_type IS 'Type of purchase: subject (single subject), year (all subjects in a year), years (multiple years)';
COMMENT ON COLUMN public.subscriptions.payment_status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN public.subscriptions.is_lifetime IS 'Whether this is a lifetime access subscription';
