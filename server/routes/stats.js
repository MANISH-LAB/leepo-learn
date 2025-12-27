import express from 'express';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

// Get user stats
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = data && data.length > 0 ? data[0] : { streak_days: 0, total_xp: 0 };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user stats
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { streak_days, total_xp } = req.body;

    const updateData = {};
    if (streak_days !== undefined) updateData.streak_days = streak_days;
    if (total_xp !== undefined) updateData.total_xp = total_xp;
    updateData.last_activity_date = new Date().toISOString().split('T')[0];
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('user_stats')
      .upsert({
        user_id: userId,
        ...updateData
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (error) throw error;

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
