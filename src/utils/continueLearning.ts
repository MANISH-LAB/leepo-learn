import * as db from './supabase/database';
import { supabase } from './supabase/client';

export interface ContinueLearningData {
  subjectId: string;
  subjectTitle: string;
  chapterId: string;
  chapterTitle: string;
  topicId: string;
  topicTitle: string;
  videoTimestamp: number; // seconds
  completedTopicsInChapter: number;
  totalTopicsInChapter: number;
  lastAccessed: string; // ISO date string
}

/**
 * Save user's current learning position
 */
export async function saveLearningPosition(
  userId: string,
  data: ContinueLearningData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_learning_position')
      .upsert({
        user_id: userId,
        subject_id: data.subjectId,
        subject_title: data.subjectTitle,
        chapter_id: data.chapterId,
        chapter_title: data.chapterTitle,
        topic_id: data.topicId,
        topic_title: data.topicTitle,
        video_timestamp: data.videoTimestamp,
        completed_topics: data.completedTopicsInChapter,
        total_topics: data.totalTopicsInChapter,
        last_accessed: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving learning position:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveLearningPosition:', error);
    return false;
  }
}

/**
 * Get user's continue learning data
 */
export async function getContinueLearningData(
  userId: string
): Promise<ContinueLearningData | null> {
  try {
    const { data, error } = await supabase
      .from('user_learning_position')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found - user hasn't started learning yet
        return null;
      }
      console.error('Error fetching learning position:', error);
      return null;
    }

    if (!data) return null;

    return {
      subjectId: data.subject_id,
      subjectTitle: data.subject_title,
      chapterId: data.chapter_id,
      chapterTitle: data.chapter_title,
      topicId: data.topic_id,
      topicTitle: data.topic_title,
      videoTimestamp: data.video_timestamp || 0,
      completedTopicsInChapter: data.completed_topics || 0,
      totalTopicsInChapter: data.total_topics || 0,
      lastAccessed: data.last_accessed,
    };
  } catch (error) {
    console.error('Error in getContinueLearningData:', error);
    return null;
  }
}

/**
 * Update video timestamp (called periodically while watching)
 */
export async function updateVideoTimestamp(
  userId: string,
  topicId: string,
  timestamp: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_learning_position')
      .update({
        video_timestamp: timestamp,
        last_accessed: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('topic_id', topicId);

    if (error) {
      console.error('Error updating video timestamp:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateVideoTimestamp:', error);
    return false;
  }
}

/**
 * Clear continue learning data (when user completes all content)
 */
export async function clearLearningPosition(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_learning_position')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error clearing learning position:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in clearLearningPosition:', error);
    return false;
  }
}
