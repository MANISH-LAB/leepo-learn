import { supabase } from './client';
import { Node, NodeType } from '../sharedData';
import { slugify } from '../slugify';

// ========================================
// AUTH ERROR HANDLER
// ========================================

/**
 * Handles authentication errors (401/JWT expired) by triggering automatic logout
 */
export function handle401Error(error: any) {
  const isAuthError =
    error?.status === 401 ||
    error?.code === 'PGRST301' ||
    error?.code === 'PGRST302' ||
    error?.code === 'PGRST303' || // JWT expired
    (typeof error === 'object' && error?.message && error.message.includes('JWT'));

  if (isAuthError) {
    console.warn('🔐 Authentication error detected - triggering logout');
    // Dispatch custom event that App.tsx will listen to
    window.dispatchEvent(new CustomEvent('auth-error', { detail: error }));
  }
}

// ========================================
// HIERARCHY NODES - CRUD OPERATIONS
// ========================================

/**
 * Fetch entire course hierarchy tree from database
 */
export async function fetchCourseHierarchy(): Promise<Node[]> {
  try {
    const url = `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?select=*&order=order_index.asc`;

    const response = await fetch(url, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Build tree structure from flat list
    const tree = buildTree(data || []);
    return tree;
  } catch (error) {
    console.error('❌ Error fetching course hierarchy:', error);
    return [];
  }
}

/**
 * Build hierarchical tree from flat node list
 */
function buildTree(nodes: any[]): Node[] {
  const nodeMap = new Map<string, Node>();
  const rootNodes: Node[] = [];

  // First pass: create all nodes
  nodes.forEach(node => {
    nodeMap.set(node.id, {
      id: node.id,
      title: node.title,
      type: node.type,
      iconUrl: node.icon_url,
      children: [],
    });
  });

  // Second pass: build parent-child relationships
  nodes.forEach(node => {
    const currentNode = nodeMap.get(node.id)!;

    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(currentNode);
      }
    } else {
      rootNodes.push(currentNode);
    }
  });

  return rootNodes;
}

/**
 * Fetch content assets for a specific topic node
 */
export async function fetchContentAssets(nodeId: string) {
  try {
    const { data, error } = await supabase
      .from('content_assets')
      .select('*')
      .eq('node_id', nodeId);

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching content assets:', error);
    return null;
  }
}

/**
 * Fetch assessment for a specific chapter node
 */
export async function fetchAssessment(chapterId: string) {
  try {
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessments')
      .select('id')
      .eq('chapter_id', chapterId);

    if (assessmentError && assessmentError.code !== 'PGRST116') throw assessmentError;
    const assessment = assessments && assessments.length > 0 ? assessments[0] : null;
    if (!assessment) return null;

    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('assessment_id', assessment.id)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    return {
      questions: questions?.map(q => ({
        id: q.id,
        text: q.question_text,
        options: q.options,
        correctAnswer: q.correct_answer,
      })) || []
    };
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return null;
  }
}

/**
 * Fetch complete course hierarchy with content and assessments
 */
export async function fetchCompleteHierarchy(): Promise<Node[]> {
  try {
    console.log('📡 Fetching hierarchy from database...');
    const startTime = Date.now();

    // Fetch all data in parallel - SELECT only needed columns for faster transfer
    const [nodesResult, assetsResult, assessmentsResult] = await Promise.all([
      supabase
        .from('hierarchy_nodes')
        .select('id, parent_id, type, title, icon_url, is_active, order_index')
        .order('order_index', { ascending: true }),

      supabase
        .from('content_assets')
        .select('node_id, video_url, video_url_hindi, audio_url, audio_url_hindi, pdf_url, report_pdf_url, duration, is_premium, interactive_content'),

      supabase
        .from('chapter_assessments')
        .select('chapter_node_id, questions')
        .then(result => result)
        .catch(() => ({ data: [], error: null })) // Gracefully handle missing table
    ]);

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Database queries completed in ${fetchTime}ms`);

    // Handle errors
    if (nodesResult.error) {
      console.error('❌ Error fetching hierarchy nodes:', nodesResult.error);
      throw nodesResult.error;
    }

    if (assetsResult.error && assetsResult.error.code !== '42P01') {
      console.error('❌ Error fetching content assets:', assetsResult.error);
      throw assetsResult.error;
    }

    const nodes = nodesResult.data || [];
    const assets = assetsResult.data || [];
    const assessments = assessmentsResult.data || [];

    const dataSize = JSON.stringify({ nodes, assets, assessments }).length;
    console.log(`📊 Data loaded: ${nodes.length} nodes, ${assets.length} assets, ${assessments.length} assessments (${(dataSize / 1024).toFixed(2)} KB)`);

    if (nodes.length === 0) {
      console.warn('⚠️ No hierarchy nodes found in database');
      return [];
    }

    // Build enriched tree
    const buildStartTime = Date.now();
    const tree = buildEnrichedTree(nodes, assets, assessments);
    const buildTime = Date.now() - buildStartTime;
    const totalTime = Date.now() - startTime;

    console.log(`🏗️ Tree building took ${buildTime}ms`);
    console.log(`✅ TOTAL load time: ${totalTime}ms (Query: ${fetchTime}ms, Build: ${buildTime}ms) - ${tree.length} root nodes`);

    return tree;
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR fetching hierarchy:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    });
    return [];
  }
}

// ========================================
// ON-DEMAND LAZY LOADING - Ultra Fast APIs
// ========================================

/**
 * LEVEL 1: Fetch only DEGREE nodes (ultra fast initial load)
 */
export async function fetchDegrees(): Promise<Node[]> {
  try {
    console.log('📚 Fetching degrees with direct fetch...');
    const startTime = Date.now();

    // Try direct fetch instead of Supabase client
    const url = `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?type=eq.DEGREE&select=id,title,type,icon_url,is_active,order_index&order=order_index.asc`;
    const headers = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    console.log('🔗 Fetching from:', url);

    const response = await fetch(url, { headers });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const degrees = await response.json();

    const fetchTime = Date.now() - startTime;
    console.log(`⏱️ Direct fetch completed in ${fetchTime}ms`);
    console.log(`📦 Received data:`, degrees);
    console.log(`⚡ Loaded ${degrees?.length || 0} degrees in ${fetchTime}ms`);

    const mapped = (degrees || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      slug: slugify(d.title), // Generate URL-friendly slug
      type: d.type as NodeType,
      iconUrl: d.icon_url,
      isActive: d.is_active,
      children: [], // Will be loaded on click
    }));

    console.log(`✅ Returning ${mapped.length} degrees:`, mapped);
    return mapped;
  } catch (error: any) {
    console.error('❌ Error fetching degrees:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return [];
  }
}

/**
 * LEVEL 2: Fetch YEAR nodes for a specific degree
 */
export async function fetchYearsForDegree(degreeId: string): Promise<Node[]> {
  try {
    console.log(`📅 Fetching years for degree: ${degreeId}`);
    const startTime = Date.now();

    const url = `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?parent_id=eq.${degreeId}&type=eq.YEAR&select=id,title,type,icon_url,is_active,order_index&order=order_index.asc`;
    const response = await fetch(url, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const years = await response.json();
    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Loaded ${years?.length || 0} years in ${fetchTime}ms`);

    return (years || []).map((y: any) => ({
      id: y.id,
      title: y.title,
      slug: slugify(y.title), // Generate URL-friendly slug
      type: y.type as NodeType,
      iconUrl: y.icon_url,
      isActive: y.is_active,
      children: [],
    }));
  } catch (error) {
    console.error('❌ Error fetching years:', error);
    return [];
  }
}

/**
 * LEVEL 3: Fetch SUBJECT nodes for a specific year with progress from cache
 */
export async function fetchSubjectsForYear(yearId: string, userId?: string): Promise<Node[]> {
  try {
    console.log(`📖 Fetching subjects for year: ${yearId}`, userId ? `(with progress from cache)` : '');
    const startTime = Date.now();

    const accessToken = userId ? getAccessTokenFromStorage() : null;
    const headers = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    // Fetch subjects
    const subjectsResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?parent_id=eq.${yearId}&type=eq.SUBJECT&select=id,title,type,icon_url,is_active,order_index&order=order_index.asc`,
      { headers }
    );

    if (!subjectsResponse.ok) {
      // Handle auth errors
      if (subjectsResponse.status === 401) {
        handle401Error({ status: subjectsResponse.status });
      }
      throw new Error(`HTTP error! status: ${subjectsResponse.status}`);
    }

    const subjects = await subjectsResponse.json();

    if (!subjects || subjects.length === 0) {
      console.log('⚠️ No subjects found');
      return [];
    }

    // Get all subject IDs
    const subjectIds = subjects.map((s: any) => s.id);

    // Fetch chapters to count them
    const chaptersResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?parent_id=in.(${subjectIds.join(',')})&type=eq.CHAPTER&select=id,parent_id`,
      { headers }
    );

    const chapters = chaptersResponse.ok ? await chaptersResponse.json() : [];

    // Count chapters per subject
    const chapterCountMap = new Map<string, number>();
    chapters.forEach((chapter: any) => {
      const count = chapterCountMap.get(chapter.parent_id) || 0;
      chapterCountMap.set(chapter.parent_id, count + 1);
    });

    // Fetch progress from cache (fast!)
    let progressMap = new Map<string, number>();
    if (userId) {
      progressMap = await getSubjectProgress(userId, subjectIds);
    }

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Loaded ${subjects.length} subjects with cached progress in ${fetchTime}ms`);

    return subjects.map((s: any) => ({
      id: s.id,
      title: s.title,
      slug: slugify(s.title), // Generate URL-friendly slug
      type: s.type as NodeType,
      iconUrl: s.icon_url,
      isActive: s.is_active,
      progress: progressMap.get(s.id) || 0, // From cache!
      children: [], // Will be loaded on click
      metadata: {
        chapterCount: chapterCountMap.get(s.id) || 0,
      },
    }));
  } catch (error) {
    console.error('❌ Error fetching subjects:', error);
    handle401Error(error);
    return [];
  }
}

/**
 * LEVEL 4: Fetch CHAPTER nodes for a specific subject
 */
export async function fetchChaptersForSubject(subjectId: string): Promise<Node[]> {
  try {
    console.log(`📑 Fetching chapters for subject: ${subjectId}`);
    const startTime = Date.now();

    const headers = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    // First, fetch chapters
    const chaptersResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?parent_id=eq.${subjectId}&type=eq.CHAPTER&select=id,title,type,icon_url,is_active,order_index&order=order_index.asc`,
      { headers }
    );

    if (!chaptersResponse.ok) throw new Error(`HTTP error! status: ${chaptersResponse.status}`);

    const chapters = await chaptersResponse.json();

    // Extract chapter IDs for fetching topics
    const chapterIds = chapters.map((c: any) => c.id);

    // Fetch topics and assessments in parallel (only if we have chapters)
    const [topicsResponse, assessmentsResponse] = await Promise.all([
      chapterIds.length > 0
        ? fetch(
            `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?type=eq.TOPIC&parent_id=in.(${chapterIds.join(',')})&select=id,parent_id`,
            { headers }
          )
        : Promise.resolve(null),
      fetch(
        `${supabase.supabaseUrl}/rest/v1/chapter_assessments?select=chapter_node_id,questions`,
        { headers }
      ).catch(() => null)
    ]);

    // Process topics to count by chapter
    const topics = topicsResponse && topicsResponse.ok
      ? await topicsResponse.json()
      : [];

    // Count topics per chapter
    const topicCountMap = new Map<string, number>();
    topics.forEach((topic: any) => {
      const count = topicCountMap.get(topic.parent_id) || 0;
      topicCountMap.set(topic.parent_id, count + 1);
    });

    // Process assessments
    const assessments = assessmentsResponse && assessmentsResponse.ok
      ? await assessmentsResponse.json()
      : [];
    const assessmentMap = new Map(assessments.map((a: any) => [a.chapter_node_id, a]));

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Loaded ${chapters.length} chapters with topic counts in ${fetchTime}ms`);

    return chapters.map((c: any) => {
      const assessment = assessmentMap.get(c.id);
      const topicCount = topicCountMap.get(c.id) || 0;

      const node: Node = {
        id: c.id,
        title: c.title,
        slug: slugify(c.title), // Generate URL-friendly slug
        type: c.type as NodeType,
        iconUrl: c.icon_url,
        isActive: c.is_active,
        children: [], // Empty - topics loaded on-demand when chapter is clicked
        metadata: { topicCount }, // Store count for display
      };

      // Add assessment if available
      if (assessment) {
        node.assessment = {
          questions: assessment.questions || []
        };
      }

      return node;
    });
  } catch (error) {
    console.error('❌ Error fetching chapters:', error);
    return [];
  }
}

/**
 * LEVEL 5: Fetch TOPIC nodes with full content for a specific chapter
 */
export async function fetchTopicsForChapter(chapterId: string): Promise<Node[]> {
  try {
    console.log(`📝 Fetching topics for chapter: ${chapterId}`);
    const startTime = Date.now();

    const headers = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    };

    // Fetch topics and their content assets in parallel
    const [topicsResponse, assetsResponse] = await Promise.all([
      fetch(
        `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?parent_id=eq.${chapterId}&type=eq.TOPIC&select=id,title,type,icon_url,is_active,order_index&order=order_index.asc`,
        { headers }
      ),
      fetch(
        `${supabase.supabaseUrl}/rest/v1/content_assets?select=node_id,video_url,video_url_hindi,audio_url,audio_url_hindi,pdf_url,report_pdf_url,duration,is_premium,interactive_content`,
        { headers }
      ).catch(() => null)
    ]);

    if (!topicsResponse.ok) throw new Error(`HTTP error! status: ${topicsResponse.status}`);

    const topics = await topicsResponse.json();
    const assets = assetsResponse && assetsResponse.ok
      ? await assetsResponse.json()
      : [];
    const assetMap = new Map(assets.map((a: any) => [a.node_id, a]));

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Loaded ${topics.length} topics with content in ${fetchTime}ms`);

    return topics.map((t: any) => {
      const asset = assetMap.get(t.id);
      const node: Node = {
        id: t.id,
        title: t.title,
        slug: slugify(t.title), // Generate URL-friendly slug
        type: t.type as NodeType,
        iconUrl: t.icon_url,
        isActive: t.is_active,
        children: [], // Topics don't have children
      };

      // Add content assets if available
      if (asset) {
        node.videoUrl = asset.video_url;
        node.videoUrlHindi = asset.video_url_hindi;
        node.audioUrl = asset.audio_url;
        node.audioUrlHindi = asset.audio_url_hindi;
        node.pdfUrl = asset.pdf_url;
        node.duration = asset.duration;
        node.isPremium = asset.is_premium;
        node.interactiveContent = asset.interactive_content;

        // Debug: Log Hindi content availability
        if (asset.video_url_hindi || asset.audio_url_hindi) {
          console.log(`🌐 Hindi content found for "${t.title}":`, {
            videoHindi: !!asset.video_url_hindi,
            audioHindi: !!asset.audio_url_hindi
          });
        }
      }

      return node;
    });
  } catch (error) {
    console.error('❌ Error fetching topics:', error);
    return [];
  }
}

/**
 * PROGRESSIVE LOADING: Fetch only top-level hierarchy (Degree + Years)
 * This is much faster for initial page load
 */
export async function fetchTopLevelHierarchy(): Promise<Node[]> {
  try {
    console.log('⚡ Fast loading: Fetching top-level hierarchy only...');
    const startTime = Date.now();

    // Fetch only DEGREE and YEAR nodes
    const { data: nodes, error } = await supabase
      .from('hierarchy_nodes')
      .select('*')
      .in('type', ['DEGREE', 'YEAR'])
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error fetching top-level nodes:', error);
      throw error;
    }

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Loaded ${nodes?.length || 0} top-level nodes in ${fetchTime}ms`);

    if (!nodes || nodes.length === 0) {
      console.warn('⚠️ No top-level nodes found');
      return [];
    }

    // Build tree structure (Degree → Years)
    const tree = buildEnrichedTree(nodes, [], []);
    console.log(`✅ Built top-level tree: ${tree.length} degrees`);

    return tree;
  } catch (error: any) {
    console.error('❌ Error in fetchTopLevelHierarchy:', error);
    return [];
  }
}

/**
 * LAZY LOADING: Fetch children of a specific node on-demand
 * Called when user expands a node
 */
export async function fetchNodeChildren(parentId: string): Promise<Node[]> {
  try {
    console.log(`📂 Lazy loading children of: ${parentId}`);
    const startTime = Date.now();

    // Fetch child nodes
    const { data: nodes, error: nodesError } = await supabase
      .from('hierarchy_nodes')
      .select('*')
      .eq('parent_id', parentId)
      .order('order_index', { ascending: true });

    if (nodesError) {
      console.error('❌ Error fetching children:', nodesError);
      throw nodesError;
    }

    if (!nodes || nodes.length === 0) {
      console.log(`ℹ️ No children found for ${parentId}`);
      return [];
    }

    // Get all node IDs to fetch their assets
    const nodeIds = nodes.map(n => n.id);

    // Fetch assets and assessments for these nodes in parallel
    const [assetsResult, assessmentsResult] = await Promise.all([
      supabase
        .from('content_assets')
        .select('*')
        .in('node_id', nodeIds),

      supabase
        .from('chapter_assessments')
        .select('*')
        .in('chapter_node_id', nodeIds)
        .then(result => result)
        .catch(() => ({ data: [], error: null }))
    ]);

    const assets = assetsResult.data || [];
    const assessments = assessmentsResult.data || [];

    const fetchTime = Date.now() - startTime;
    console.log(`⚡ Loaded ${nodes.length} children in ${fetchTime}ms`);

    // Build tree for these children
    const children = buildEnrichedTree(nodes, assets, assessments);

    return children;
  } catch (error: any) {
    console.error('❌ Error in fetchNodeChildren:', error);
    return [];
  }
}

/**
 * Build tree with content assets and assessments
 * Optimized for performance with O(n) complexity
 */
function buildEnrichedTree(nodes: any[], assets: any[], assessments: any[]): Node[] {
  // Pre-allocate Maps with expected sizes for better performance
  const nodeMap = new Map<string, Node>(nodes.length);
  const rootNodes: Node[] = [];

  // Create optimized lookup maps - direct mapping without intermediate arrays
  const assetMap = new Map<string, any>();
  for (let i = 0; i < assets.length; i++) {
    assetMap.set(assets[i].node_id, assets[i]);
  }

  const assessmentMap = new Map<string, any>();
  for (let i = 0; i < assessments.length; i++) {
    const key = assessments[i].chapter_node_id || assessments[i].chapter_id;
    if (key) assessmentMap.set(key, assessments[i]);
  }

  // First pass: create all nodes with minimal object spread
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const asset = assetMap.get(node.id);
    const assessment = assessmentMap.get(node.id);

    const newNode: Node = {
      id: node.id,
      title: node.title,
      type: node.type,
      iconUrl: node.icon_url,
      isActive: node.is_active,
      children: [],
    };

    // Add content assets if available (faster than spread operator)
    if (asset) {
      newNode.videoUrl = asset.video_url;
      newNode.videoUrlHindi = asset.video_url_hindi;
      newNode.audioUrl = asset.audio_url;
      newNode.audioUrlHindi = asset.audio_url_hindi;
      newNode.pdfUrl = asset.pdf_url;
      newNode.duration = asset.duration;
      newNode.isPremium = asset.is_premium;
      newNode.interactiveContent = asset.interactive_content;

      // Debug log for video URLs
      if (asset.video_url) {
        console.log(`📹 Loaded video URL for topic "${node.title}":`, asset.video_url);
      }
    }

    // Add assessment if available
    if (assessment) {
      newNode.assessment = {
        questions: assessment.questions || assessment.assessment_questions?.map((q: any) => ({
          id: q.id,
          text: q.question_text || q.text,
          options: q.options,
          correctAnswer: q.correct_answer || q.correctAnswer,
        })) || []
      };
    }

    nodeMap.set(node.id, newNode);
  }

  // Second pass: build parent-child relationships
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const currentNode = nodeMap.get(node.id)!;

    if (node.parent_id) {
      const parent = nodeMap.get(node.parent_id);
      if (parent) {
        parent.children!.push(currentNode);
      }
    } else {
      rootNodes.push(currentNode);
    }
  }

  return rootNodes;
}

/**
 * Get access token from localStorage (bypassing hanging Supabase client)
 */
function getAccessTokenFromStorage(): string | null {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const projectRef = supabaseUrl?.split('//')[1]?.split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;

    const sessionDataStr = localStorage.getItem(storageKey);
    if (!sessionDataStr) return null;

    const sessionData = JSON.parse(sessionDataStr);
    return sessionData?.access_token || null;
  } catch (error) {
    console.error('Error getting access token from storage:', error);
    return null;
  }
}

/**
 * Create a new hierarchy node
 */
export async function createNode(node: {
  parentId?: string;
  type: NodeType;
  title: string;
  iconUrl?: string;
  orderIndex?: number;
}): Promise<string | null> {
  try {
    console.log('✨ Database createNode called with:', node);

    // Get access token from localStorage (bypassing hanging Supabase client)
    const accessToken = getAccessTokenFromStorage();

    if (!accessToken) {
      console.error('❌ No access token found - user not authenticated');
      return null;
    }

    const payload = {
      parent_id: node.parentId || null,
      type: node.type,
      title: node.title,
      icon_url: node.iconUrl || null,
      order_index: node.orderIndex || 0,
      is_active: true,
    };

    console.log('📤 Inserting node with payload:', payload);

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?select=id`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(payload),
      }
    );

    console.log('📡 Create response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Create failed:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Database insert successful, returned data:', data);
    return data && data.length > 0 ? data[0].id : null;
  } catch (error) {
    console.error('❌ Error creating node:', error);
    return null;
  }
}

/**
 * Update a hierarchy node
 */
export async function updateNode(nodeId: string, updates: {
  title?: string;
  type?: NodeType;
  iconUrl?: string;
  orderIndex?: number;
  isActive?: boolean;
}): Promise<boolean> {
  try {
    console.log('🔄 Database updateNode called with:', { nodeId, updates });

    // Get access token from localStorage (bypassing hanging Supabase client)
    const accessToken = getAccessTokenFromStorage();

    if (!accessToken) {
      console.error('❌ No access token found - user not authenticated');
      return false;
    }

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.type) updateData.type = updates.type;
    if (updates.iconUrl !== undefined) updateData.icon_url = updates.iconUrl;
    if (updates.orderIndex !== undefined) updateData.order_index = updates.orderIndex;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    console.log('📤 Update payload:', updateData);

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?id=eq.${nodeId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    console.log('📡 Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update failed:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Database update successful for node:', nodeId);
    return true;
  } catch (error) {
    console.error('❌ Error updating node:', error);
    return false;
  }
}

/**
 * Delete a hierarchy node (cascades to children)
 */
export async function deleteNode(nodeId: string): Promise<boolean> {
  try {
    console.log('🗑️ Database deleteNode called for:', nodeId);

    // Get access token from localStorage (bypassing hanging Supabase client)
    console.log('🔐 Getting access token from localStorage...');
    const accessToken = getAccessTokenFromStorage();
    console.log('🎫 Access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NONE');

    if (!accessToken) {
      console.error('❌ No access token found - user not authenticated');
      return false;
    }

    console.log('🚀 Making DELETE request...');
    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?id=eq.${nodeId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete failed:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Node deleted successfully from database:', nodeId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting node:', error);
    return false;
  }
}

// ========================================
// CONTENT ASSETS - CRUD OPERATIONS
// ========================================

/**
 * Upsert content assets for a topic
 */
export async function upsertContentAssets(nodeId: string, content: {
  videoUrl?: string;
  videoUrlHindi?: string;
  audioUrl?: string;
  audioUrlHindi?: string;
  pdfUrl?: string;
  reportPdfUrl?: string;
  duration?: string;
  isPremium?: boolean;
  interactiveContent?: string;
}): Promise<boolean> {
  try {
    console.log('🔄 Upserting content assets for node:', nodeId, content);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token found - user not authenticated');
      return false;
    }

    const payload = {
      node_id: nodeId,
      video_url: content.videoUrl || null,
      video_url_hindi: content.videoUrlHindi || null,
      audio_url: content.audioUrl || null,
      audio_url_hindi: content.audioUrlHindi || null,
      pdf_url: content.pdfUrl || null,
      report_pdf_url: content.reportPdfUrl || null,
      duration: content.duration || null,
      is_premium: content.isPremium ?? false,
      interactive_content: content.interactiveContent || null,
    };

    console.log('📦 Payload to upsert:', payload);

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/content_assets?on_conflict=node_id`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('✅ Content assets upserted successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error upserting content assets:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    });
    throw error; // Re-throw to show user the actual error
  }
}

// ========================================
// ASSESSMENTS - CRUD OPERATIONS
// ========================================

/**
 * Upsert assessment for a chapter
 */
export async function upsertAssessment(chapterId: string, questions: {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: number;
}[]): Promise<boolean> {
  try {
    console.log('📝 Upserting assessment for chapter:', chapterId);
    console.log('📝 Questions to save:', questions);

    if (!questions || questions.length === 0) {
      console.log('⚠️ No questions provided, skipping assessment save');
      return true;
    }

    // First, get or create assessment
    let assessmentId: string;

    const { data: existingAssessments, error: fetchError } = await supabase
      .from('assessments')
      .select('id')
      .eq('chapter_id', chapterId);

    if (fetchError) {
      console.error('❌ Error fetching existing assessment:', fetchError);
      throw fetchError;
    }

    const existingAssessment = existingAssessments && existingAssessments.length > 0 ? existingAssessments[0] : null;

    if (existingAssessment) {
      assessmentId = existingAssessment.id;
      console.log('✅ Found existing assessment:', assessmentId);

      // Delete existing questions
      console.log('🗑️ Deleting existing questions...');
      const { error: deleteError } = await supabase
        .from('assessment_questions')
        .delete()
        .eq('assessment_id', assessmentId);

      if (deleteError) {
        console.error('❌ Error deleting questions:', deleteError);
        throw deleteError;
      }
      console.log('✅ Deleted existing questions');
    } else {
      // Create new assessment
      console.log('➕ Creating new assessment...');
      const { data: newAssessments, error: createError } = await supabase
        .from('assessments')
        .insert({ chapter_id: chapterId })
        .select('id');

      if (createError) {
        console.error('❌ Error creating assessment:', createError);
        throw createError;
      }
      const newAssessment = newAssessments && newAssessments.length > 0 ? newAssessments[0] : null;
      if (!newAssessment) throw new Error('Failed to create assessment');
      assessmentId = newAssessment.id;
      console.log('✅ Created new assessment:', assessmentId);
    }

    // Insert all questions
    console.log(`➕ Inserting ${questions.length} questions...`);
    const questionsToInsert = questions.map((q, index) => ({
      assessment_id: assessmentId,
      question_text: q.text,
      options: q.options,
      correct_answer: q.correctAnswer,
      order_index: index,
    }));

    console.log('📦 Questions payload:', questionsToInsert);

    const { error: insertError } = await supabase
      .from('assessment_questions')
      .insert(questionsToInsert);

    if (insertError) {
      console.error('❌ Error inserting questions:', insertError);
      throw insertError;
    }

    console.log('✅ Assessment saved successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ Error upserting assessment:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    });
    return false;
  }
}

// ========================================
// PRICING - CRUD OPERATIONS
// ========================================

/**
 * Get global pricing configuration
 */
export async function getPricingConfig() {
  try {
    console.log('📊 Fetching pricing config...');

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/pricing_config?is_active=eq.true&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Pricing config loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching pricing config:', error);
    return [];
  }
}

/**
 * Get pricing for a year node
 */
export async function getPricing(yearNodeId: string) {
  try {
    const { data, error } = await supabase
      .from('pricing')
      .select('*')
      .eq('year_node_id', yearNodeId);

    if (error && error.code !== 'PGRST116') throw error;
    const pricing = data && data.length > 0 ? data[0] : null;
    return pricing || { price: 99.00, currency: 'USD' };
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return { price: 99.00, currency: 'USD' };
  }
}

/**
 * Update global pricing configuration
 */
export async function updatePricingConfig(configKey: string, value: number): Promise<boolean> {
  try {
    console.log('🔄 Updating pricing config:', configKey, value);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token found - user not authenticated');
      return false;
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/pricing_config?config_key=eq.${configKey}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ config_value: value }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('✅ Pricing config updated successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error updating pricing config:', {
      message: error?.message,
      details: error?.details,
    });
    return false;
  }
}

/**
 * Update pricing for a year node
 */
export async function updatePricing(yearNodeId: string, price: number, currency: string = 'USD'): Promise<boolean> {
  try {
    console.log('🔄 Updating pricing for year:', yearNodeId, { price, currency });

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token found - user not authenticated');
      return false;
    }

    const payload = {
      year_node_id: yearNodeId,
      price,
      currency,
    };

    console.log('📦 Pricing payload:', payload);

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/pricing?on_conflict=year_node_id`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log('✅ Pricing updated successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error updating pricing:', {
      message: error?.message,
      details: error?.details,
    });
    return false;
  }
}

// ========================================
// COURSE PURCHASES
// ========================================

/**
 * Check if user has purchased a year
 */
export async function hasPurchased(userId: string, yearNodeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('course_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('year_node_id', yearNodeId)
      .eq('status', 'success');

    if (error && error.code !== 'PGRST116') throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking purchase:', error);
    return false;
  }
}

/**
 * Create a purchase record
 */
export async function createPurchase(
  userId: string,
  yearNodeId: string,
  amount: number,
  currency: string = 'USD',
  transactionId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('course_purchases')
      .insert({
        user_id: userId,
        year_node_id: yearNodeId,
        amount,
        currency,
        status: 'success',
        transaction_id: transactionId,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating purchase:', error);
    return false;
  }
}

// ========================================
// USER PROGRESS
// ========================================

/**
 * Get user progress for all nodes
 */
export async function getUserProgress(userId: string) {
  try {
    console.log('📊 Fetching user progress for user:', userId);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot fetch user progress');
      return [];
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_progress?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data?.length || 0} progress records`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching user progress:', error);
    return [];
  }
}

/**
 * Update user progress for a node
 */
export async function updateUserProgress(
  userId: string,
  nodeId: string,
  isCompleted: boolean,
  notes?: string
): Promise<boolean> {
  try {
    console.log('💾 ========================================');
    console.log('💾 UPDATING USER PROGRESS');
    console.log('💾 User ID:', userId);
    console.log('💾 Node ID:', nodeId);
    console.log('💾 Is Completed:', isCompleted);
    console.log('💾 Notes:', notes || 'none');

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot update user progress');
      return false;
    }
    console.log('✅ Access token found');

    const payload = {
      user_id: userId,
      node_id: nodeId,
      is_completed: isCompleted,
      private_notes: notes || null,
      last_accessed: new Date().toISOString(),
    };
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const url = `${supabase.supabaseUrl}/rest/v1/user_progress`;
    console.log('🌐 URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ========================================');
      console.error('❌ UPDATE PROGRESS FAILED');
      console.error('❌ Status:', response.status);
      console.error('❌ Error text:', errorText);
      console.error('❌ ========================================');
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.text();
    console.log('✅ Response data:', responseData);
    console.log('✅ ========================================');
    console.log('✅ USER PROGRESS UPDATED SUCCESSFULLY');
    console.log('✅ ========================================');
    return true;
  } catch (error) {
    console.error('❌ ========================================');
    console.error('❌ EXCEPTION IN updateUserProgress');
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error instanceof Error ? error.stack : 'no stack');
    console.error('❌ ========================================');
    return false;
  }
}

// ========================================
// ANALYTICS (For Admin Dashboard)
// ========================================

/**
 * Get total user count
 */
export async function getTotalUsers(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching total users:', error);
    return 0;
  }
}

/**
 * Get total revenue
 */
export async function getTotalRevenue(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('course_purchases')
      .select('amount')
      .eq('status', 'success');

    if (error) throw error;
    return data?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
  } catch (error) {
    console.error('Error fetching total revenue:', error);
    return 0;
  }
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

// ========================================
// USER STATS
// ========================================

/**
 * Get user stats (streak, XP)
 */
export async function getUserStats(userId: string) {
  try {
    console.log('📊 Fetching user stats for:', userId);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot fetch user stats');
      return { streak_days: 0, total_xp: 0, max_streak: 0, last_activity_date: null };
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_stats?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Failed to fetch user stats:', response.status);
      return { streak_days: 0, total_xp: 0, max_streak: 0, last_activity_date: null };
    }

    const data = await response.json();
    const stats = data && data.length > 0 ? data[0] : null;

    console.log('✅ User stats fetched:', stats);
    return stats || { streak_days: 0, total_xp: 0, max_streak: 0, last_activity_date: null };
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return { streak_days: 0, total_xp: 0, max_streak: 0, last_activity_date: null };
  }
}

/**
 * Update user stats
 */
export async function updateUserStats(
  userId: string,
  streakDays: number,
  totalXP: number,
  maxStreak?: number
): Promise<boolean> {
  try {
    console.log('💾 Updating user stats:', { userId, streakDays, totalXP, maxStreak });

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot update user stats');
      return false;
    }

    const payload: any = {
      user_id: userId,
      streak_days: streakDays,
      total_xp: totalXP,
      last_activity_date: new Date().toISOString().split('T')[0],
    };

    // Add max_streak only if provided
    if (maxStreak !== undefined) {
      payload.max_streak = maxStreak;
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_stats`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update user stats failed:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ User stats updated successfully:', { totalXP, streakDays, maxStreak });
    return true;
  } catch (error) {
    console.error('❌ Error updating user stats:', error);
    return false;
  }
}

/**
 * Sync XP for already completed topics (one-time migration)
 * This awards XP for topics that were marked complete before XP system was implemented
 */
export async function syncXPForCompletedTopics(userId: string): Promise<number> {
  try {
    console.log('🔄 Syncing XP for completed topics for user:', userId);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token found');
      return 0;
    }

    // Get all completed topics for user using direct fetch
    const progressResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_progress?user_id=eq.${userId}&is_completed=eq.true&select=*`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!progressResponse.ok) {
      console.error('❌ Failed to fetch user progress:', progressResponse.status);
      return 0;
    }

    const completedTopics = await progressResponse.json();
    const completedCount = completedTopics?.length || 0;

    console.log(`📊 Found ${completedCount} completed topics`);

    if (completedCount === 0) {
      console.log('✅ No completed topics to sync');
      return 0;
    }

    // Calculate total XP (50 XP per topic)
    const totalXP = completedCount * 50;

    // Get current stats using direct fetch
    const statsResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_stats?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const statsData = await statsResponse.json();
    const currentStats = statsData && statsData.length > 0 ? statsData[0] : { total_xp: 0, streak_days: 0 };
    const currentXP = currentStats.total_xp || 0;

    console.log(`💰 Current XP: ${currentXP}, Should be: ${totalXP}`);

    // Only update if current XP is less than what it should be
    if (currentXP < totalXP) {
      console.log(`💎 Updating XP from ${currentXP} to ${totalXP}`);

      // Update using direct fetch with upsert
      const updateResponse = await fetch(
        `${supabase.supabaseUrl}/rest/v1/user_stats`,
        {
          method: 'POST',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            user_id: userId,
            total_xp: totalXP,
            streak_days: currentStats.streak_days || 0,
            last_activity_date: new Date().toISOString().split('T')[0],
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error('❌ Failed to update user stats:', updateResponse.status);
        return 0;
      }

      console.log(`✅ XP synced successfully! Awarded ${totalXP - currentXP} XP`);
      return totalXP - currentXP;
    } else {
      console.log(`✅ XP already correct (${currentXP} XP)`);
      return 0;
    }
  } catch (error) {
    console.error('❌ Error syncing XP:', error);
    return 0;
  }
}

/**
 * Save assessment result and return the score
 */
export async function saveAssessmentResult(
  userId: string,
  chapterId: string,
  assessmentId: string | null,
  score: number,
  totalQuestions: number,
  correctAnswers: number
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('assessment_results')
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        assessment_id: assessmentId,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving assessment result:', error);
    return false;
  }
}

/**
 * Get average score for a user across all assessments
 * Uses direct fetch API for better RLS compatibility with timeout
 */
export async function getAverageScore(userId: string): Promise<number> {
  try {
    console.log('📊 Fetching average score for:', userId);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.warn('⚠️ No access token - returning 0 for average score');
      return 0;
    }

    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        console.warn('⏱️ getAverageScore timeout - returning default value 0');
        resolve(0);
      }, 5000); // 5 second timeout
    });

    // Create the fetch promise
    const fetchPromise = (async () => {
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/assessment_results?select=score&user_id=eq.${userId}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.warn('⚠️ Failed to fetch assessment results:', response.status);
        return 0;
      }

      const data = await response.json();
      console.log('✅ Assessment results fetched:', data?.length || 0, 'results');

      if (!data || data.length === 0) {
        console.log('📊 No assessments taken yet - returning 0');
        return 0;
      }

      // Calculate average
      const total = data.reduce((sum: number, result: any) => sum + Number(result.score), 0);
      const average = Math.round(total / data.length);
      console.log('✅ Average score calculated:', average);

      return average;
    })();

    // Race between fetch and timeout
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.error('❌ Error fetching average score:', error);
    return 0;
  }
}

/**
 * Get all assessment results for a user
 */
export async function getUserAssessmentResults(userId: string) {
  try {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error && error.code !== 'PGRST116') throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return [];
  }
}

// ========================================
// NODE REORDERING
// ========================================

/**
 * Update the order_index for multiple nodes (for drag-and-drop reordering)
 */
export async function updateNodeOrder(updates: { id: string; orderIndex: number }[]): Promise<boolean> {
  try {
    console.log('Updating node order:', updates);

    // Update each node's order_index
    for (const update of updates) {
      const { error } = await supabase
        .from('hierarchy_nodes')
        .update({ order_index: update.orderIndex })
        .eq('id', update.id);

      if (error) {
        console.error('Error updating order for node:', update.id, error);
        throw error;
      }
    }

    console.log('✅ Successfully updated node order');
    return true;
  } catch (error) {
    console.error('Error updating node order:', error);
    return false;
  }
}

// ========================================
// USER NOTIFICATIONS - CRUD OPERATIONS
// ========================================

/**
 * Notification interface
 */
export interface UserNotification {
  id: string;
  user_id: string;
  type: 'welcome' | 'topic_completed' | 'assessment_completed' | 'achievement' | 'streak';
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

/**
 * Get user notifications (max 5, most recent first)
 */
export async function getUserNotifications(userId: string): Promise<UserNotification[]> {
  try {
    console.log('🔔 Fetching notifications for user:', userId);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot fetch notifications');
      return [];
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_notifications?user_id=eq.${userId}&select=*&order=created_at.desc&limit=5`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data?.length || 0} notifications`);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot mark notification as read');
      return false;
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_notifications?id=eq.${notificationId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Notification marked as read');
    return true;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot mark notifications as read');
      return false;
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_notifications?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ All notifications marked as read');
    return true;
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Get count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) return 0;

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_notifications?user_id=eq.${userId}&is_read=eq.false&select=id`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact',
        },
      }
    );

    if (!response.ok) return 0;

    const countHeader = response.headers.get('Content-Range');
    if (countHeader) {
      const count = parseInt(countHeader.split('/')[1], 10);
      return count || 0;
    }

    const data = await response.json();
    return data?.length || 0;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}

// ========================================
// USER NOTES - CRUD OPERATIONS
// ========================================

/**
 * User Note interface
 */
export interface UserNote {
  id: string;
  user_id: string;
  topic_id: string;
  content: string;
  media_timestamp: number;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all notes for a specific topic for the logged-in user
 */
export async function getUserNotesForTopic(userId: string, topicId: string): Promise<UserNote[]> {
  try {
    console.log('📖 Fetching user notes via direct API...');

    // Get auth token from localStorage
    const supabaseAuthKey = `sb-${supabase.supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;
    const storedSession = localStorage.getItem(supabaseAuthKey);
    let accessToken: string | undefined;

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        accessToken = sessionData?.access_token;
      } catch (e) {
        console.warn('⚠️ Failed to parse session');
      }
    }

    const url = `${supabase.supabaseUrl}/rest/v1/user_notes?user_id=eq.${userId}&topic_id=eq.${topicId}&order=created_at.desc`;
    const headers: Record<string, string> = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, { headers });
    console.log('📡 Notes fetch response status:', response.status);

    if (!response.ok) {
      console.error('❌ HTTP error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('✅ Fetched notes:', data?.length || 0, 'notes');

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('💥 Error fetching user notes:', error);
    return [];
  }
}

/**
 * Create a new note
 */
export async function createUserNote(
  userId: string,
  topicId: string,
  content: string,
  mediaTimestamp: number = 0,
  screenshotUrl?: string
): Promise<UserNote | null> {
  try {
    console.log('💾 Creating user note via direct API...');

    // Get auth token from localStorage
    const supabaseAuthKey = `sb-${supabase.supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;
    const storedSession = localStorage.getItem(supabaseAuthKey);
    let accessToken: string | undefined;

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        accessToken = sessionData?.access_token;
      } catch (e) {
        console.warn('⚠️ Failed to parse session');
      }
    }

    const url = `${supabase.supabaseUrl}/rest/v1/user_notes`;
    const headers: Record<string, string> = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const body = JSON.stringify({
      user_id: userId,
      topic_id: topicId,
      content,
      media_timestamp: mediaTimestamp,
      screenshot_url: screenshotUrl,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    console.log('📡 Note creation response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('✅ Note created:', data);

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('💥 Error creating user note:', error);
    return null;
  }
}

/**
 * Update an existing note
 */
export async function updateUserNote(
  noteId: string,
  content: string,
  mediaTimestamp?: number
): Promise<boolean> {
  try {
    console.log('✏️ Updating user note via direct API...');

    // Get auth token from localStorage
    const supabaseAuthKey = `sb-${supabase.supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;
    const storedSession = localStorage.getItem(supabaseAuthKey);
    let accessToken: string | undefined;

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        accessToken = sessionData?.access_token;
      } catch (e) {
        console.warn('⚠️ Failed to parse session');
      }
    }

    const updateData: any = { content };
    if (mediaTimestamp !== undefined) {
      updateData.media_timestamp = mediaTimestamp;
    }

    const url = `${supabase.supabaseUrl}/rest/v1/user_notes?id=eq.${noteId}`;
    const headers: Record<string, string> = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData),
    });

    console.log('📡 Note update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      return false;
    }

    console.log('✅ Note updated successfully');
    return true;
  } catch (error) {
    console.error('💥 Error updating user note:', error);
    return false;
  }
}

/**
 * Delete a note
 */
export async function deleteUserNote(noteId: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting user note via direct API...');

    // Get auth token from localStorage
    const supabaseAuthKey = `sb-${supabase.supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;
    const storedSession = localStorage.getItem(supabaseAuthKey);
    let accessToken: string | undefined;

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        accessToken = sessionData?.access_token;
      } catch (e) {
        console.warn('⚠️ Failed to parse session');
      }
    }

    const url = `${supabase.supabaseUrl}/rest/v1/user_notes?id=eq.${noteId}`;
    const headers: Record<string, string> = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    console.log('📡 Note delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP error:', response.status, errorText);
      return false;
    }

    console.log('✅ Note deleted successfully');
    return true;
  } catch (error) {
    console.error('💥 Error deleting user note:', error);
    return false;
  }
}

/**
 * Get all notes for a user (across all topics)
 */
export async function getAllUserNotes(userId: string): Promise<UserNote[]> {
  try {
    console.log('📚 Fetching all user notes via direct API...');

    // Get auth token from localStorage
    const supabaseAuthKey = `sb-${supabase.supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;
    const storedSession = localStorage.getItem(supabaseAuthKey);
    let accessToken: string | undefined;

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        accessToken = sessionData?.access_token;
      } catch (e) {
        console.warn('⚠️ Failed to parse session');
      }
    }

    const url = `${supabase.supabaseUrl}/rest/v1/user_notes?user_id=eq.${userId}&order=created_at.desc`;
    const headers: Record<string, string> = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, { headers });
    console.log('📡 All notes fetch response status:', response.status);

    if (!response.ok) {
      console.error('❌ HTTP error:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('✅ Fetched all notes:', data?.length || 0, 'notes');

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('💥 Error fetching all user notes:', error);
    return [];
  }
}

// ========================================
// ADMIN FUNCTIONS
// ========================================

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  college: string | null;
  degree: string | null;
  current_year: string | null;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  purchased_at: string;
  user_name?: string;
  user_email?: string;
  purchase_type?: string;
  degree_title?: string;
  payment_method?: string;
  payment_id?: string;
  order_id?: string;
}

/**
 * Fetch all users with pagination
 */
export async function fetchAllUsers(page: number = 1, limit: number = 50): Promise<{ users: AdminUser[], total: number }> {
  try {
    const offset = (page - 1) * limit;
    const accessToken = getAccessTokenFromStorage();

    // Fetch users
    const usersResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/profiles?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!usersResponse.ok) {
      throw new Error(`HTTP error! status: ${usersResponse.status}`);
    }

    // Get total count from response headers
    const contentRange = usersResponse.headers.get('content-range');
    const total = contentRange ? parseInt(contentRange.split('/')[1]) : 0;

    const users = await usersResponse.json();
    return { users: users || [], total };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { users: [], total: 0 };
  }
}

/**
 * Fetch analytics stats
 */
export async function fetchAdminStats(): Promise<{
  totalRevenue: number;
  totalUsers: number;
  totalPurchases: number;
  activeNow: number;
}> {
  try {
    const accessToken = getAccessTokenFromStorage();
    const headers = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      'Content-Type': 'application/json',
      'Prefer': 'count=exact',
    };

    // Fetch user count
    const usersResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/profiles?select=id&limit=1`,
      { headers }
    );
    const userCount = usersResponse.headers.get('content-range')?.split('/')[1] || '0';

    // Fetch subscriptions (purchases) from new subscriptions table
    const purchasesResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/subscriptions?select=total_price,payment_status&payment_status=eq.completed`,
      { headers: { ...headers, 'Prefer': 'count=exact' } }
    );

    const purchases = await purchasesResponse.json();
    const purchaseCount = purchasesResponse.headers.get('content-range')?.split('/')[1] || '0';

    // Calculate total revenue from completed subscriptions
    const totalRevenue = purchases?.reduce((sum: number, p: any) =>
      p.payment_status === 'completed' ? sum + (p.total_price || 0) : sum, 0) || 0;

    return {
      totalRevenue,
      totalUsers: parseInt(userCount),
      totalPurchases: parseInt(purchaseCount),
      activeNow: 0, // TODO: Calculate from recent activity
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalRevenue: 0,
      totalUsers: 0,
      totalPurchases: 0,
      activeNow: 0,
    };
  }
}

/**
 * Fetch recent purchases
 */
export async function fetchRecentPurchases(limit: number = 10): Promise<Purchase[]> {
  try {
    const accessToken = getAccessTokenFromStorage();

    // Fetch from subscriptions table first
    const subsResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/subscriptions?select=id,user_id,total_price,currency,payment_status,created_at,payment_method,order_id,payment_id,purchase_type,degree_title,year_ids,subject_ids&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!subsResponse.ok) {
      throw new Error(`HTTP error! status: ${subsResponse.status}`);
    }

    const subscriptions = await subsResponse.json();

    // Get unique user IDs
    const userIds = [...new Set(subscriptions.map((s: any) => s.user_id))];

    // Fetch profiles for these users
    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
      try {
        const profilesResponse = await fetch(
          `${supabase.supabaseUrl}/rest/v1/profiles?select=id,full_name,email&id=in.(${userIds.join(',')})`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': accessToken ? `Bearer ${accessToken}` : '',
              'Content-Type': 'application/json',
            },
          }
        );

        if (profilesResponse.ok) {
          const profiles = await profilesResponse.json();
          profiles.forEach((profile: any) => {
            profilesMap[profile.id] = profile;
          });
        }
      } catch (profileError) {
        console.warn('Could not fetch profiles, using user_id instead:', profileError);
      }
    }

    // Map subscriptions data to Purchase interface format
    return (subscriptions || []).map((subscription: any) => {
      const profile = profilesMap[subscription.user_id];
      return {
        id: subscription.id,
        user_id: subscription.user_id,
        amount: subscription.total_price,
        currency: subscription.currency || 'USD',
        status: subscription.payment_status === 'completed' ? 'success' : subscription.payment_status,
        purchased_at: subscription.created_at,
        user_name: profile?.full_name || 'Unknown User',
        user_email: profile?.email || subscription.user_id.substring(0, 8) + '...',
        purchase_type: subscription.purchase_type,
        degree_title: subscription.degree_title,
        payment_method: subscription.payment_method || 'razorpay',
        payment_id: subscription.payment_id,
        order_id: subscription.order_id,
      };
    });
  } catch (error) {
    console.error('Error fetching recent purchases:', error);
    return [];
  }
}

/**
 * Fetch user's XP history with pagination
 */
export interface XPHistoryItem {
  id: string;
  video_title: string;
  chapter_title: string;
  subject_title: string;
  xp_earned: number;
  completed_at: string;
  node_id: string;
}

export async function fetchUserXPHistory(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ items: XPHistoryItem[]; total: number }> {
  try {
    const accessToken = getAccessTokenFromStorage();
    const offset = (page - 1) * limit;

    // Fetch completed videos from user_progress with hierarchy info
    // We need to get the node details and traverse up to get chapter/subject
    const progressResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_progress?user_id=eq.${userId}&is_completed=eq.true&select=id,node_id,created_at&order=created_at.desc&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          'Content-Type': 'application/json',
          'Prefer': 'count=exact',
        },
      }
    );

    if (!progressResponse.ok) {
      throw new Error(`HTTP error! status: ${progressResponse.status}`);
    }

    const progressData = await progressResponse.json();
    const totalCount = progressResponse.headers.get('content-range')?.split('/')[1] || '0';

    // Get all unique node IDs
    const nodeIds = progressData.map((p: any) => p.node_id);

    if (nodeIds.length === 0) {
      return { items: [], total: 0 };
    }

    // Fetch all hierarchy nodes in one query
    const nodesResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?select=id,title,parent_id,type&id=in.(${nodeIds.join(',')})`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!nodesResponse.ok) {
      throw new Error(`HTTP error! status: ${nodesResponse.status}`);
    }

    const nodesData = await nodesResponse.json();
    const nodesMap: Record<string, any> = {};
    nodesData.forEach((node: any) => {
      nodesMap[node.id] = node;
    });

    // Get all parent IDs to fetch chapters and subjects
    const parentIds = [...new Set(nodesData.map((n: any) => n.parent_id).filter(Boolean))];

    let parentsMap: Record<string, any> = {};
    if (parentIds.length > 0) {
      const parentsResponse = await fetch(
        `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?select=id,title,parent_id,type&id=in.(${parentIds.join(',')})`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': accessToken ? `Bearer ${accessToken}` : '',
            'Content-Type': 'application/json',
          },
        }
      );

      if (parentsResponse.ok) {
        const parentsData = await parentsResponse.json();
        parentsData.forEach((node: any) => {
          parentsMap[node.id] = node;
        });

        // Get grandparents (subjects) if needed
        const grandparentIds = [...new Set(parentsData.map((n: any) => n.parent_id).filter(Boolean))];
        if (grandparentIds.length > 0) {
          const grandparentsResponse = await fetch(
            `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?select=id,title,type&id=in.(${grandparentIds.join(',')})`,
            {
              headers: {
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                'Content-Type': 'application/json',
              },
            }
          );

          if (grandparentsResponse.ok) {
            const grandparentsData = await grandparentsResponse.json();
            grandparentsData.forEach((node: any) => {
              parentsMap[node.id] = node;
            });
          }
        }
      }
    }

    // Build XP history items
    const items: XPHistoryItem[] = progressData.map((progress: any) => {
      const videoNode = nodesMap[progress.node_id];
      const chapterNode = videoNode?.parent_id ? parentsMap[videoNode.parent_id] : null;
      const subjectNode = chapterNode?.parent_id ? parentsMap[chapterNode.parent_id] : null;

      return {
        id: progress.id,
        video_title: videoNode?.title || 'Unknown Video',
        chapter_title: chapterNode?.title || 'Unknown Chapter',
        subject_title: subjectNode?.title || 'Unknown Subject',
        xp_earned: 50, // 50 XP per video completion
        completed_at: progress.created_at,
        node_id: progress.node_id,
      };
    });

    return {
      items,
      total: parseInt(totalCount),
    };
  } catch (error) {
    console.error('Error fetching XP history:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('No access token found');
      return false;
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ role: newRole }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`✅ User role updated successfully: ${userId} -> ${newRole}`);
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

/**
 * Create a test notification manually (for testing purposes)
 */
export async function createTestNotification(userId: string): Promise<boolean> {
  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('No access token found');
      return false;
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/user_notifications`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          type: 'welcome',
          title: 'Welcome to Leepo Learn!',
          message: 'Thanks for joining! Start your learning journey today.',
          metadata: { test: true },
          is_read: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating notification:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`✅ Test notification created successfully for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error creating test notification:', error);
    return false;
  }
}

/**
 * ============================================================================
 * PROGRESS CACHE - Fast progress lookup for chapters and subjects
 * ============================================================================
 */

/**
 * Get progress for multiple chapters from cache
 */
export async function getChapterProgress(userId: string, chapterIds: string[]): Promise<Map<string, number>> {
  if (!userId || chapterIds.length === 0) {
    return new Map();
  }

  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.warn('⚠️ No access token - cannot fetch chapter progress');
      return new Map();
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/progress_cache?user_id=eq.${userId}&node_type=eq.CHAPTER&node_id=in.(${chapterIds.join(',')})&select=node_id,progress_percentage`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('⚠️ Failed to fetch chapter progress');
      return new Map();
    }

    const data = await response.json();
    const progressMap = new Map<string, number>();

    data.forEach((item: any) => {
      progressMap.set(item.node_id, item.progress_percentage || 0);
    });

    console.log(`✅ Fetched progress for ${progressMap.size} chapters from cache`);
    return progressMap;
  } catch (error) {
    console.error('❌ Error fetching chapter progress:', error);
    return new Map();
  }
}

/**
 * Get progress for multiple subjects from cache
 */
export async function getSubjectProgress(userId: string, subjectIds: string[]): Promise<Map<string, number>> {
  if (!userId || subjectIds.length === 0) {
    return new Map();
  }

  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.warn('⚠️ No access token - cannot fetch subject progress');
      return new Map();
    }

    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/progress_cache?user_id=eq.${userId}&node_type=eq.SUBJECT&node_id=in.(${subjectIds.join(',')})&select=node_id,progress_percentage`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.warn('⚠️ Failed to fetch subject progress');
      return new Map();
    }

    const data = await response.json();
    const progressMap = new Map<string, number>();

    data.forEach((item: any) => {
      progressMap.set(item.node_id, item.progress_percentage || 0);
    });

    console.log(`✅ Fetched progress for ${progressMap.size} subjects from cache`);
    return progressMap;
  } catch (error) {
    console.error('❌ Error fetching subject progress:', error);
    return new Map();
  }
}

/**
 * Initialize progress cache for a chapter (when user first accesses it)
 */
export async function initializeChapterProgress(userId: string, chapterId: string): Promise<void> {
  if (!userId || !chapterId) return;

  try {
    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) return;

    // Count total topics in chapter
    const topicsResponse = await fetch(
      `${supabase.supabaseUrl}/rest/v1/hierarchy_nodes?parent_id=eq.${chapterId}&type=eq.TOPIC&select=id`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!topicsResponse.ok) return;

    const topics = await topicsResponse.json();
    const totalTopics = topics.length;

    // Initialize cache entry with 0 completed
    await fetch(
      `${supabase.supabaseUrl}/rest/v1/progress_cache`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          node_id: chapterId,
          node_type: 'CHAPTER',
          total_topics: totalTopics,
          completed_topics: 0,
          progress_percentage: 0,
        }),
      }
    );

    console.log(`✅ Initialized progress cache for chapter: ${chapterId}`);
  } catch (error) {
    console.error('❌ Error initializing chapter progress:', error);
  }
}

// ========================================
// CONTINUE LEARNING - USER LEARNING POSITION
// ========================================

/**
 * Continue Learning interface
 */
export interface ContinueLearningData {
  subject_id: string;
  subject_title: string;
  chapter_id: string;
  chapter_title: string;
  topic_id: string;
  topic_title: string;
  video_timestamp: number;
  completed_topics: number;
  total_topics: number;
  progress_percentage: number;
  last_accessed: string;
}

/**
 * Update user's current learning position when they access a topic
 * This tracks where the user left off so they can resume later
 */
export async function updateUserLearningPosition(
  userId: string,
  topicId: string
): Promise<boolean> {
  try {
    console.log('📍 Updating learning position:', { userId, topicId });

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot update learning position');
      return false;
    }

    // Call database function
    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/rpc/update_user_learning_position`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_topic_id: topicId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to update learning position:', errorText);
      return false;
    }

    console.log('✅ Learning position updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating learning position:', error);
    return false;
  }
}

/**
 * Get user's current learning position for "Continue Learning" dashboard block
 * Returns the last topic they were working on with progress and hierarchy
 */
export async function getContinueLearning(
  userId: string
): Promise<ContinueLearningData | null> {
  try {
    console.log('📖 Fetching continue learning data for user:', userId);

    const accessToken = getAccessTokenFromStorage();
    if (!accessToken) {
      console.error('❌ No access token - cannot fetch continue learning');
      return null;
    }

    // Call database function
    const response = await fetch(
      `${supabase.supabaseUrl}/rest/v1/rpc/get_continue_learning`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_user_id: userId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch continue learning:', errorText);

      // Handle auth errors
      if (response.status === 401) {
        try {
          const errorObj = JSON.parse(errorText);
          handle401Error({ status: response.status, ...errorObj });
        } catch {
          handle401Error({ status: response.status, message: errorText });
        }
      }

      return null;
    }

    const data = await response.json();
    console.log('✅ Continue learning data:', data);

    // Return first result (there should only be one per user)
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('❌ Error fetching continue learning:', error);
    handle401Error(error);
    return null;
  }
}

// ========================================
// SUBSCRIPTIONS - PURCHASE TRACKING
// ========================================

export interface Subscription {
  id: string;
  user_id: string;
  purchase_type: 'subject' | 'year' | 'years';
  degree_id: string | null;
  degree_title: string | null;
  year_ids: string[];
  subject_ids: string[];
  total_price: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id: string | null;
  payment_method: string | null;
  starts_at: string;
  expires_at: string | null;
  is_lifetime: boolean;
  is_active: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new subscription record
 */
export async function createSubscription(subscription: {
  user_id: string;
  purchase_type: 'subject' | 'year' | 'years';
  degree_id?: string;
  degree_title?: string;
  year_ids?: string[];
  subject_ids?: string[];
  total_price: number;
  payment_status?: 'pending' | 'completed';
  payment_id?: string;
  order_id?: string;
  payment_method?: string;
}): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: subscription.user_id,
        purchase_type: subscription.purchase_type,
        degree_id: subscription.degree_id || null,
        degree_title: subscription.degree_title || null,
        year_ids: subscription.year_ids || [],
        subject_ids: subscription.subject_ids || [],
        total_price: subscription.total_price,
        currency: 'USD',
        payment_status: subscription.payment_status || 'completed',
        payment_id: subscription.payment_id || null,
        order_id: subscription.order_id || null,
        payment_method: subscription.payment_method || 'razorpay',
        is_lifetime: true,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating subscription:', error);
      return null;
    }

    console.log('✅ Subscription created:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in createSubscription:', error);
    return null;
  }
}

/**
 * Get all active subscriptions for a user
 */
export async function getUserActiveSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    console.log('📋 Fetching active subscriptions for user:', userId);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return [];
    }

    console.log('✅ Active subscriptions:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error in getUserActiveSubscriptions:', error);
    return [];
  }
}

/**
 * Check if user has access to a specific subject
 */
export async function userHasAccessToSubject(userId: string, subjectId: string): Promise<boolean> {
  try {
    const subscriptions = await getUserActiveSubscriptions(userId);

    // Check if any subscription includes this subject
    return subscriptions.some(sub =>
      sub.subject_ids.includes(subjectId)
    );
  } catch (error) {
    console.error('❌ Error checking subject access:', error);
    return false;
  }
}

/**
 * Check if user has access to all subjects in a year
 */
export async function userHasAccessToYear(userId: string, yearId: string): Promise<boolean> {
  try {
    const subscriptions = await getUserActiveSubscriptions(userId);

    // Check if any subscription includes this year
    return subscriptions.some(sub =>
      sub.year_ids.includes(yearId)
    );
  } catch (error) {
    console.error('❌ Error checking year access:', error);
    return false;
  }
}

/**
 * Get all subjects/years a user has access to
 */
export async function getUserAccessibleContent(userId: string): Promise<{
  subjects: string[];
  years: string[];
}> {
  try {
    const subscriptions = await getUserActiveSubscriptions(userId);

    const subjects = new Set<string>();
    const years = new Set<string>();

    subscriptions.forEach(sub => {
      sub.subject_ids.forEach(id => subjects.add(id));
      sub.year_ids.forEach(id => years.add(id));
    });

    return {
      subjects: Array.from(subjects),
      years: Array.from(years),
    };
  } catch (error) {
    console.error('❌ Error getting accessible content:', error);
    return { subjects: [], years: [] };
  }
}

/**
 * Get all purchased subject nodes for a user (for display in Accessible Subjects section)
 */
export async function getUserPurchasedSubjects(userId: string): Promise<Node[]> {
  try {
    console.log('📚 Fetching purchased subjects for user:', userId);

    // Get accessible content IDs
    const { subjects: subjectIds, years: yearIds } = await getUserAccessibleContent(userId);

    // Collect all subject IDs (from direct purchases and year purchases)
    const allSubjectIds = new Set<string>(subjectIds);

    // For each purchased year, fetch all subjects under that year
    if (yearIds.length > 0) {
      const { data: yearSubjects, error } = await supabase
        .from('hierarchy_nodes')
        .select('id')
        .eq('type', 'SUBJECT')
        .in('parent_id', yearIds);

      if (!error && yearSubjects) {
        yearSubjects.forEach(subject => allSubjectIds.add(subject.id));
      }
    }

    // If no subjects found, return empty array
    if (allSubjectIds.size === 0) {
      console.log('📚 No purchased subjects found');
      return [];
    }

    // Fetch the actual subject nodes with their details
    const { data: subjects, error } = await supabase
      .from('hierarchy_nodes')
      .select('*')
      .eq('type', 'SUBJECT')
      .in('id', Array.from(allSubjectIds))
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error fetching subject nodes:', error);
      return [];
    }

    // Convert to Node format
    const subjectNodes: Node[] = (subjects || []).map(node => ({
      id: node.id,
      title: node.title,
      type: node.type as NodeType,
      iconUrl: node.icon_url,
      children: [],
    }));

    console.log('✅ Purchased subjects fetched:', subjectNodes.length);
    return subjectNodes;
  } catch (error) {
    console.error('❌ Error in getUserPurchasedSubjects:', error);
    return [];
  }
}
