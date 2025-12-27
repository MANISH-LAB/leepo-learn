import * as db from './supabase/database';

// XP rewards for different actions
export const XP_REWARDS = {
  COMPLETE_TOPIC: 50,
  COMPLETE_CHAPTER: 100,
  COMPLETE_ASSESSMENT: 150,
  PERFECT_ASSESSMENT: 200, // All questions correct
  DAILY_LOGIN: 10,
  STREAK_BONUS_3_DAYS: 50,
  STREAK_BONUS_7_DAYS: 100,
  STREAK_BONUS_30_DAYS: 500,
};

/**
 * Calculate if streak should continue or reset
 */
export function calculateStreak(lastActivityDate: string | null, currentStreakDays: number): number {
  if (!lastActivityDate) {
    // First time user - start streak at 1
    return 1;
  }

  const lastDate = new Date(lastActivityDate);
  const today = new Date();

  // Reset time to start of day for comparison
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day - maintain current streak
    return currentStreakDays;
  } else if (diffDays === 1) {
    // Next day - increment streak
    return currentStreakDays + 1;
  } else {
    // Missed a day or more - reset streak
    return 1;
  }
}

/**
 * Update user's daily activity and streak
 */
export async function updateDailyActivity(userId: string): Promise<{ streak: number; xpGained: number }> {
  try {
    // Get current stats
    const stats = await db.getUserStats(userId);
    const currentStreak = stats.streak_days || 0;
    const currentXP = stats.total_xp || 0;

    // Calculate new streak
    const newStreak = calculateStreak(stats.last_activity_date || null, currentStreak);

    // Award XP for daily login (only if streak increased)
    let xpGained = 0;
    if (newStreak > currentStreak) {
      xpGained += XP_REWARDS.DAILY_LOGIN;

      // Bonus XP for streak milestones
      if (newStreak === 3) xpGained += XP_REWARDS.STREAK_BONUS_3_DAYS;
      if (newStreak === 7) xpGained += XP_REWARDS.STREAK_BONUS_7_DAYS;
      if (newStreak === 30) xpGained += XP_REWARDS.STREAK_BONUS_30_DAYS;
    }

    // Update database
    await db.updateUserStats(userId, newStreak, currentXP + xpGained);

    return { streak: newStreak, xpGained };
  } catch (error) {
    console.error('Error updating daily activity:', error);
    return { streak: 0, xpGained: 0 };
  }
}

/**
 * Award XP for completing a topic/lecture
 */
export async function awardXPForCompletion(
  userId: string,
  nodeId: string,
  nodeType: 'TOPIC' | 'CHAPTER',
  assessmentScore?: number,
  assessmentData?: {
    assessmentId: string | null;
    totalQuestions: number;
    correctAnswers: number;
  }
): Promise<number> {
  try {
    console.log('🎯 Starting XP award process for:', { userId, nodeId, nodeType });

    // Get current XP and streak
    const stats = await db.getUserStats(userId);
    const currentXP = stats.total_xp || 0;
    const currentStreak = stats.streak_days || 0;
    const maxStreak = stats.max_streak || 0;

    console.log('📊 Current stats:', { currentXP, currentStreak, maxStreak });

    // Calculate new streak based on 24hr cycle
    const newStreak = calculateStreak(stats.last_activity_date || null, currentStreak);
    const newMaxStreak = Math.max(newStreak, maxStreak);

    if (newStreak !== currentStreak) {
      console.log(`🔥 Streak updated: ${currentStreak} → ${newStreak} (max: ${newMaxStreak})`);
    }

    // Calculate XP based on type
    let xpEarned = 0;
    if (nodeType === 'TOPIC') {
      xpEarned = XP_REWARDS.COMPLETE_TOPIC;
    } else if (nodeType === 'CHAPTER') {
      xpEarned = XP_REWARDS.COMPLETE_CHAPTER;

      // Bonus for assessment score
      if (assessmentScore !== undefined) {
        if (assessmentScore === 100) {
          xpEarned += XP_REWARDS.PERFECT_ASSESSMENT;
        } else if (assessmentScore >= 80) {
          xpEarned += XP_REWARDS.COMPLETE_ASSESSMENT;
        }

        // Save assessment result to database
        if (assessmentData) {
          await db.saveAssessmentResult(
            userId,
            nodeId,
            assessmentData.assessmentId,
            assessmentScore,
            assessmentData.totalQuestions,
            assessmentData.correctAnswers
          );
        }
      }
    }

    const newTotalXP = currentXP + xpEarned;
    console.log(`💰 XP to award: ${xpEarned} (${currentXP} → ${newTotalXP})`);

    // ATOMIC UPDATE: Update both user_stats and user_progress together
    console.log('💾 ========================================');
    console.log('💾 PERFORMING ATOMIC DATABASE UPDATES');
    console.log('💾 ========================================');

    const [statsUpdateResult, progressUpdateResult] = await Promise.all([
      db.updateUserStats(userId, newStreak, newTotalXP, newMaxStreak),
      db.updateUserProgress(userId, nodeId, true)
    ]);

    console.log('📊 Update results:');
    console.log('   - Stats update result:', statsUpdateResult);
    console.log('   - Progress update result:', progressUpdateResult);

    // Verify both updates succeeded
    if (!statsUpdateResult || !progressUpdateResult) {
      console.error('❌ ========================================');
      console.error('❌ ATOMIC UPDATE FAILED');
      console.error('❌ Stats update result:', statsUpdateResult);
      console.error('❌ Progress update result:', progressUpdateResult);
      console.error('❌ ========================================');
      throw new Error('Failed to update user stats or progress');
    }

    console.log('✅ ========================================');
    console.log('✅ ATOMIC UPDATE SUCCESSFUL:');
    console.log(`   ✓ user_stats: XP ${currentXP} → ${newTotalXP}, Streak ${currentStreak} → ${newStreak}, Max Streak ${maxStreak} → ${newMaxStreak}`);
    console.log(`   ✓ user_progress: ${nodeId} marked complete`);
    console.log('✅ ========================================');

    return xpEarned;
  } catch (error) {
    console.error('❌ Error awarding XP:', error);
    console.error('❌ ATOMIC UPDATE FAILED - rolling back...');
    return 0;
  }
}

/**
 * Get current user stats (streak, max streak, and XP)
 */
export async function getCurrentUserStats(userId: string): Promise<{ streak: number; xp: number; maxStreak: number }> {
  try {
    const stats = await db.getUserStats(userId);
    return {
      streak: stats.streak_days || 0,
      xp: stats.total_xp || 0,
      maxStreak: stats.max_streak || 0,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { streak: 0, xp: 0, maxStreak: 0 };
  }
}

/**
 * Initialize user stats on first login
 */
export async function initializeUserStats(userId: string): Promise<void> {
  try {
    // Check if stats already exist
    const stats = await db.getUserStats(userId);

    // If no stats exist (streak_days is 0 and no last_activity_date), initialize
    if (stats.streak_days === 0 && !stats.last_activity_date) {
      await db.updateUserStats(userId, 1, XP_REWARDS.DAILY_LOGIN);
    }
  } catch (error) {
    console.error('Error initializing user stats:', error);
  }
}
