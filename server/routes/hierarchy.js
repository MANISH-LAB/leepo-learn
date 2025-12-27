import express from 'express';
import { supabaseAdmin } from '../index.js';

const router = express.Router();

// Get all hierarchy nodes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('hierarchy_nodes')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Build tree structure
    const tree = buildTree(data || []);

    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single node by ID
router.get('/:nodeId', async (req, res) => {
  try {
    const { nodeId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('hierarchy_nodes')
      .select('*')
      .eq('id', nodeId);

    if (error) throw error;

    const node = data && data.length > 0 ? data[0] : null;

    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    res.json({ success: true, data: node });
  } catch (error) {
    console.error('Get node error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Find year node by degree and year
router.get('/find/year', async (req, res) => {
  try {
    const { degree, year } = req.query;

    if (!degree || !year) {
      return res.status(400).json({ error: 'degree and year parameters are required' });
    }

    // Find degree node
    const { data: degreeNodes, error: degreeError } = await supabaseAdmin
      .from('hierarchy_nodes')
      .select('id')
      .eq('type', 'DEGREE')
      .ilike('title', `%${degree}%`);

    if (degreeError) throw degreeError;

    if (!degreeNodes || degreeNodes.length === 0) {
      return res.status(404).json({ error: 'Degree not found' });
    }

    const degreeId = degreeNodes[0].id;

    // Find year node under this degree
    const { data: yearNodes, error: yearError } = await supabaseAdmin
      .from('hierarchy_nodes')
      .select('*')
      .eq('type', 'YEAR')
      .eq('parent_id', degreeId)
      .ilike('title', `%${year}%`);

    if (yearError) throw yearError;

    if (!yearNodes || yearNodes.length === 0) {
      return res.status(404).json({ error: 'Year not found' });
    }

    res.json({ success: true, data: yearNodes[0] });
  } catch (error) {
    console.error('Find year error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to build tree
function buildTree(nodes) {
  const nodeMap = new Map();
  const rootNodes = [];

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
    const currentNode = nodeMap.get(node.id);

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

export default router;
