-- Add order_id column to subscriptions table for Razorpay integration
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Add index for order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON public.subscriptions(order_id);

-- Add comments
COMMENT ON COLUMN public.subscriptions.order_id IS 'Razorpay order ID (e.g., order_xxxxx)';
COMMENT ON COLUMN public.subscriptions.payment_id IS 'Razorpay payment ID (e.g., pay_xxxxx)';
