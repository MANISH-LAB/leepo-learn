import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Create a new subscription after payment
 * POST /api/subscriptions/create
 */
router.post('/create', async (req, res) => {
  try {
    console.log('📝 Creating subscription:', req.body);

    const {
      user_id,
      purchase_type,
      degree_id,
      degree_title,
      year_ids,
      subject_ids,
      total_price,
      payment_status,
      payment_id,
      order_id,
      payment_method
    } = req.body;

    // Validate required fields
    if (!user_id || !purchase_type || !total_price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, purchase_type, total_price'
      });
    }

    // Insert subscription into database
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id,
        purchase_type,
        degree_id: degree_id || null,
        degree_title: degree_title || null,
        year_ids: year_ids || [],
        subject_ids: subject_ids || [],
        total_price,
        currency: 'USD',
        payment_status: payment_status || 'completed',
        payment_id: payment_id || null,
        order_id: order_id || null,
        payment_method: payment_method || 'razorpay',
        is_lifetime: true,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating subscription:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log('✅ Subscription created:', data);

    res.json({
      success: true,
      subscription: data
    });
  } catch (error) {
    console.error('❌ Error in /create:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
