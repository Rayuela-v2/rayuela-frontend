/**
 * Badge DAG Layout Utility
 *
 * Computes the layered (Sugiyama-style) layout for a badge dependency graph.
 * Extracted from BadgeDependencyGraph.vue for testability.
 */

const DEFAULT_NODE_RADIUS = 30;
const DEFAULT_LAYER_GAP_Y = 120;
const DEFAULT_NODE_GAP_X = 140;
const DEFAULT_PADDING = 60;

/**
 * Compute a layered DAG layout from an array of badge objects.
 *
 * @param {Array} badges - Array of badge objects with { name, previousBadges, ...rest }
 * @param {Object} [options] - Layout options
 * @param {number} [options.nodeRadius=30]
 * @param {number} [options.layerGapY=120]
 * @param {number} [options.nodeGapX=140]
 * @param {number} [options.padding=60]
 * @returns {{ nodes: Array, edges: Array, width: number, height: number }}
 */
export function computeBadgeLayout(badges, options = {}) {
  const {
    nodeRadius = DEFAULT_NODE_RADIUS,
    layerGapY = DEFAULT_LAYER_GAP_Y,
    nodeGapX = DEFAULT_NODE_GAP_X,
    padding = DEFAULT_PADDING,
  } = options;

  if (!badges || badges.length === 0) {
    return { nodes: [], edges: [], width: 0, height: 0 };
  }

  // Build name → badge lookup
  const byName = {};
  badges.forEach((b) => { byName[b.name] = b; });

  // Compute depth per badge (layer index) via recursive DFS
  const depth = {};
  const visited = new Set();

  function calcDepth(badge) {
    if (depth[badge.name] !== undefined) return depth[badge.name];
    if (visited.has(badge.name)) return 0; // cycle guard
    visited.add(badge.name);

    if (!badge.previousBadges || badge.previousBadges.length === 0) {
      depth[badge.name] = 0;
      return 0;
    }

    let maxParent = 0;
    for (const parentName of badge.previousBadges) {
      const parent = byName[parentName];
      if (parent) {
        maxParent = Math.max(maxParent, calcDepth(parent) + 1);
      }
    }
    depth[badge.name] = maxParent;
    return maxParent;
  }

  badges.forEach((b) => calcDepth(b));

  // Group badges by layer
  const layers = {};
  let maxLayer = 0;
  badges.forEach((b) => {
    const d = depth[b.name] || 0;
    if (!layers[d]) layers[d] = [];
    layers[d].push(b);
    maxLayer = Math.max(maxLayer, d);
  });

  // Position nodes
  const nodes = [];
  const posMap = {};
  let maxCols = 0;

  for (let layer = 0; layer <= maxLayer; layer++) {
    const row = layers[layer] || [];
    maxCols = Math.max(maxCols, row.length);
    row.forEach((b, col) => {
      const x = padding + col * nodeGapX + nodeGapX / 2;
      const y = padding + layer * layerGapY + nodeRadius;
      nodes.push({ ...b, x, y, layer });
      posMap[b.name] = { x, y };
    });
  }

  // Center each layer horizontally
  const totalWidth = padding * 2 + maxCols * nodeGapX;
  for (let layer = 0; layer <= maxLayer; layer++) {
    const row = layers[layer] || [];
    const rowWidth = row.length * nodeGapX;
    const offset = (totalWidth - rowWidth) / 2;
    row.forEach((b, col) => {
      const newX = offset + col * nodeGapX + nodeGapX / 2;
      const node = nodes.find((n) => n.name === b.name);
      if (node) {
        node.x = newX;
        posMap[b.name].x = newX;
      }
    });
  }

  // Build edges
  const edges = [];
  badges.forEach((b) => {
    if (b.previousBadges) {
      b.previousBadges.forEach((parentName) => {
        if (posMap[parentName] && posMap[b.name]) {
          edges.push({
            from: posMap[parentName],
            to: posMap[b.name],
            fromName: parentName,
            toName: b.name,
          });
        }
      });
    }
  });

  const width = totalWidth;
  const height = padding * 2 + (maxLayer + 1) * layerGapY;

  return { nodes, edges, width, height };
}

export { DEFAULT_NODE_RADIUS, DEFAULT_LAYER_GAP_Y, DEFAULT_NODE_GAP_X, DEFAULT_PADDING };
