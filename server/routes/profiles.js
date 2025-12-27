import express from 'express';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

// Get profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (error) throw error;

    const profile = data && data.length > 0 ? data[0] : null;

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new profile
router.post('/', async (req, res) => {
  try {
    const { id, email, full_name, avatar_url, college, degree, current_year, passing_year, role } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id,
        email,
        full_name,
        avatar_url,
        college,
        degree,
        current_year,
        passing_year,
        role: role || 'user'
      })
      .select();

    if (error) throw error;

    // Also create user stats
    await supabaseAdmin
      .from('user_stats')
      .insert({
        user_id: id,
        streak_days: 0,
        total_xp: 0
      });

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, college, degree, current_year, passing_year } = req.body;

    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (college !== undefined) updateData.college = college;
    if (degree !== undefined) updateData.degree = degree;
    if (current_year !== undefined) updateData.current_year = current_year;
    if (passing_year !== undefined) updateData.passing_year = passing_year;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upsert profile (create or update)
router.post('/upsert', async (req, res) => {
  try {
    const { id, email, full_name, avatar_url, college, degree, current_year, passing_year, role } = req.body;

    if (!id || !email) {
      return res.status(400).json({ error: 'User ID and email are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id,
        email,
        full_name,
        avatar_url,
        college,
        degree,
        current_year,
        passing_year,
        role: role || 'user',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) throw error;

    // Ensure user stats exist
    const { error: statsError } = await supabaseAdmin
      .from('user_stats')
      .upsert({
        user_id: id,
        streak_days: 0,
        total_xp: 0
      }, {
        onConflict: 'user_id'
      });

    if (statsError) console.error('Stats upsert error:', statsError);

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Upsert profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
