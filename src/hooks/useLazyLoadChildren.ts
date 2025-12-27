import { useState, useCallback } from 'react';
import { Node } from '../utils/sharedData';
import * as db from '../utils/supabase/database';

// Cache to store loaded children
const childrenCache = new Map<string, Node[]>();

/**
 * Hook for lazy loading node children with caching
 * Loads children on-demand when user expands a node
 */
export function useLazyLoadChildren() {
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

  /**
   * Load children for a specific node
   * Uses cache if already loaded
   */
  const loadChildren = useCallback(async (nodeId: string): Promise<Node[]> => {
    // Check cache first
    if (childrenCache.has(nodeId)) {
      console.log(`📦 Cache HIT: Using cached children for ${nodeId}`);
      return childrenCache.get(nodeId)!;
    }

    // Not in cache - fetch from database
    console.log(`📥 Cache MISS: Fetching children for ${nodeId}`);
    setLoadingNodes(prev => new Set(prev).add(nodeId));

    try {
      const children = await db.fetchNodeChildren(nodeId);

      // Store in cache
      childrenCache.set(nodeId, children);
      console.log(`✅ Cached ${children.length} children for ${nodeId}`);

      return children;
    } catch (error) {
      console.error(`❌ Error loading children for ${nodeId}:`, error);
      return [];
    } finally {
      setLoadingNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }
  }, []);

  /**
   * Check if a node's children are currently loading
   */
  const isLoading = useCallback((nodeId: string): boolean => {
    return loadingNodes.has(nodeId);
  }, [loadingNodes]);

  /**
   * Check if a node's children are cached
   */
  const isCached = useCallback((nodeId: string): boolean => {
    return childrenCache.has(nodeId);
  }, []);

  /**
   * Clear cache for a specific node or all nodes
   */
  const clearCache = useCallback((nodeId?: string) => {
    if (nodeId) {
      childrenCache.delete(nodeId);
      console.log(`🗑️ Cleared cache for ${nodeId}`);
    } else {
      childrenCache.clear();
      console.log('🗑️ Cleared all cache');
    }
  }, []);

  return {
    loadChildren,
    isLoading,
    isCached,
    clearCache,
  };
}
