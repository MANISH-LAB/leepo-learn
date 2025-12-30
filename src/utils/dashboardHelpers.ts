import { supabase } from './supabase/client';

export interface DegreeContext {
  id: string;
  title: string;
}

export interface DashboardStats {
  user_id: string;
  degree_id: string;
  degree_title: string;
  total_accessible_subjects: number;
  active_subjects: number;
  completed_subjects: number;
  overall_completion_percentage: number;
  total_topics_count: number;
  completed_topics_count: number;
}

export interface SubjectProgress {
  user_id: string;
  subject_id: string;
  subject_title: string;
  degree_id: string;
  degree_title: string;
  total_topics: number;
  completed_topics: number;
  is_purchased: boolean;
  last_accessed: string;
}

export interface ResumePoint {
  user_id: string;
  subject_id: string;
  subject_title: string;
  chapter_id: string;
  chapter_title: string;
  topic_id: string;
  topic_title: string;
  video_timestamp: number;
  last_accessed: string;
  degree_id: string;
  degree_title: string;
}

/**
 * Fetches unique degrees that the user has access to (purchased or started)
 */
export async function fetchUserDegrees(userId: string): Promise<DegreeContext[]> {
  console.log('🔍 fetchUserDegrees called with userId:', userId);

  try {
    console.log('📡 Querying user_subject_progress view...');
    const { data, error } = await supabase
      .from('user_subject_progress')
      .select('degree_id, degree_title')
      .eq('user_id', userId);

    console.log('📡 Query completed. Error:', error, 'Data:', data);

    if (error) {
      console.error('❌ Error fetching user degrees:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No degrees found for user');
      return [];
    }

    // Get unique degrees
    const uniqueDegrees = Array.from(
      new Map(data.map(item => [item.degree_id, { id: item.degree_id, title: item.degree_title }])).values()
    );

    console.log('✅ Returning degrees:', uniqueDegrees);
    return uniqueDegrees;
  } catch (err) {
    console.error('💥 Exception in fetchUserDegrees:', err);
    return [];
  }
}

/**
 * Fetches dashboard statistics for a specific degree or all degrees
 */
export async function fetchDashboardStats(
  userId: string,
  degreeId?: string
): Promise<DashboardStats | null> {
  let query = supabase
    .from('dashboard_stats_view')
    .select('*')
    .eq('user_id', userId);

  if (degreeId && degreeId !== 'all') {
    query = query.eq('degree_id', degreeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // If multiple degrees, aggregate the stats
  if (data.length > 1) {
    const aggregated: DashboardStats = {
      user_id: userId,
      degree_id: 'all',
      degree_title: 'All Degrees',
      total_accessible_subjects: data.reduce((sum, d) => sum + (d.total_accessible_subjects || 0), 0),
      active_subjects: data.reduce((sum, d) => sum + (d.active_subjects || 0), 0),
      completed_subjects: data.reduce((sum, d) => sum + (d.completed_subjects || 0), 0),
      total_topics_count: data.reduce((sum, d) => sum + (d.total_topics_count || 0), 0),
      completed_topics_count: data.reduce((sum, d) => sum + (d.completed_topics_count || 0), 0),
      overall_completion_percentage: 0,
    };

    // Calculate overall percentage
    if (aggregated.total_topics_count > 0) {
      aggregated.overall_completion_percentage = parseFloat(
        ((aggregated.completed_topics_count / aggregated.total_topics_count) * 100).toFixed(1)
      );
    }

    return aggregated;
  }

  return data[0];
}

/**
 * Fetches all accessible subjects for the user in a specific degree
 */
export async function fetchAccessibleSubjects(
  userId: string,
  degreeId?: string
): Promise<SubjectProgress[]> {
  let query = supabase
    .from('user_subject_progress')
    .select('*')
    .eq('user_id', userId)
    .order('last_accessed', { ascending: false });

  if (degreeId && degreeId !== 'all') {
    query = query.eq('degree_id', degreeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching accessible subjects:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches the most recent learning position for resume functionality
 */
export async function fetchResumePoint(
  userId: string,
  degreeId?: string
): Promise<ResumePoint | null> {
  let query = supabase
    .from('user_resume_point')
    .select('*')
    .eq('user_id', userId)
    .order('last_accessed', { ascending: false })
    .limit(1);

  if (degreeId && degreeId !== 'all') {
    query = query.eq('degree_id', degreeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching resume point:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * Calculate progress percentage for a subject
 */
export function calculateProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((completed / total) * 100).toFixed(1));
}

/**
 * Format timestamp to readable time string
 */
export function formatLastAccessed(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Fetches the next topic to watch
 * Returns current topic if not completed, or next topic in sequence if completed
 */
export async function fetchNextTopic(userId: string): Promise<{ topicTitle: string; isCompleted: boolean } | null> {
  try {
    // Get the user's current learning position
    const { data: position, error: posError } = await supabase
      .from('user_learning_position')
      .select('node_id, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (posError || !position) {
      console.log('No learning position found');
      return null;
    }

    const currentTopicId = position.node_id;

    // Check if current topic is completed
    const { data: progress, error: progError } = await supabase
      .from('user_progress')
      .select('node_id')
      .eq('user_id', userId)
      .eq('node_id', currentTopicId)
      .maybeSingle();

    const isCurrentCompleted = !!progress;

    // Get current topic details
    const { data: currentTopic, error: topicError } = await supabase
      .from('hierarchy_nodes')
      .select('id, title, parent_id, order_index')
      .eq('id', currentTopicId)
      .single();

    if (topicError || !currentTopic) {
      console.error('Error fetching current topic:', topicError);
      return null;
    }

    // If current topic is not completed, return it
    if (!isCurrentCompleted) {
      return {
        topicTitle: currentTopic.title,
        isCompleted: false
      };
    }

    // Current topic is completed, find next topic
    const chapterId = currentTopic.parent_id;

    // Get all topics in current chapter
    const { data: chapterTopics, error: chapError } = await supabase
      .from('hierarchy_nodes')
      .select('id, title, order_index')
      .eq('parent_id', chapterId)
      .eq('type', 'TOPIC')
      .order('order_index', { ascending: true });

    if (chapError || !chapterTopics) {
      console.error('Error fetching chapter topics:', chapError);
      return null;
    }

    // Find next topic in current chapter
    const currentIndex = chapterTopics.findIndex(t => t.id === currentTopicId);
    if (currentIndex !== -1 && currentIndex < chapterTopics.length - 1) {
      return {
        topicTitle: chapterTopics[currentIndex + 1].title,
        isCompleted: true
      };
    }

    // No more topics in current chapter, find next chapter
    const { data: currentChapter, error: chError } = await supabase
      .from('hierarchy_nodes')
      .select('id, parent_id, order_index')
      .eq('id', chapterId)
      .single();

    if (chError || !currentChapter) {
      return null;
    }

    const subjectId = currentChapter.parent_id;

    // Get next chapter in subject
    const { data: nextChapters, error: nextChError } = await supabase
      .from('hierarchy_nodes')
      .select('id')
      .eq('parent_id', subjectId)
      .eq('type', 'CHAPTER')
      .gt('order_index', currentChapter.order_index)
      .order('order_index', { ascending: true })
      .limit(1);

    if (nextChError || !nextChapters || nextChapters.length === 0) {
      // No more chapters in subject
      return {
        topicTitle: 'Course completed!',
        isCompleted: true
      };
    }

    // Get first topic of next chapter
    const { data: nextTopic, error: nextTopicError } = await supabase
      .from('hierarchy_nodes')
      .select('title')
      .eq('parent_id', nextChapters[0].id)
      .eq('type', 'TOPIC')
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (nextTopicError || !nextTopic) {
      return null;
    }

    return {
      topicTitle: nextTopic.title,
      isCompleted: true
    };
  } catch (error) {
    console.error('Error in fetchNextTopic:', error);
    return null;
  }
}
