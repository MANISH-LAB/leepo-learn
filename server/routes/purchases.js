import express from 'express';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

// Get user purchases
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('course_purchases')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'success');

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has purchased a year
router.get('/:userId/check/:yearNodeId', async (req, res) => {
  try {
    const { userId, yearNodeId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('course_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('year_node_id', yearNodeId)
      .eq('status', 'success');

    if (error) throw error;

    res.json({ success: true, hasPurchased: data && data.length > 0 });
  } catch (error) {
    console.error('Check purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create purchase
router.post('/', async (req, res) => {
  try {
    const { user_id, year_node_id, amount, currency, payment_provider, transaction_id } = req.body;

    if (!user_id || !year_node_id || !amount) {
      return res.status(400).json({ error: 'user_id, year_node_id, and amount are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('course_purchases')
      .insert({
        user_id,
        year_node_id,
        amount,
        currency: currency || 'INR',
        status: 'success',
        payment_provider: payment_provider || 'demo',
        transaction_id: transaction_id || `txn_${Date.now()}`,
        purchased_at: new Date().toISOString()
      })
      .select();

    if (error) {
      // Check if it's a duplicate purchase
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Course already purchased' });
      }
      throw error;
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
