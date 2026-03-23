import { describe, it, expect } from 'vitest';
import { computeBadgeLayout } from '../../utils/badgeGraphLayout';

// ─── Helper to create a minimal badge object ───

function badge(name, previousBadges = []) {
  return {
    _id: name.toLowerCase().replace(/\s/g, '-'),
    name,
    previousBadges,
    imageUrl: `https://example.com/${name}.png`,
    description: `Desc for ${name}`,
    checkinsAmount: 1,
  };
}

// ─── Tests ───

describe('computeBadgeLayout', () => {
  // --- 1. Empty / null input ---

  it('returns empty layout for null badges', () => {
    const result = computeBadgeLayout(null);
    expect(result).toEqual({ nodes: [], edges: [], width: 0, height: 0 });
  });

  it('returns empty layout for empty array', () => {
    const result = computeBadgeLayout([]);
    expect(result).toEqual({ nodes: [], edges: [], width: 0, height: 0 });
  });

  it('returns empty layout for undefined badges', () => {
    const result = computeBadgeLayout(undefined);
    expect(result).toEqual({ nodes: [], edges: [], width: 0, height: 0 });
  });

  // --- 2. Single badge with no dependencies ---

  it('places a single badge in layer 0, centered', () => {
    const result = computeBadgeLayout([badge('Explorer')]);
    
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].name).toBe('Explorer');
    expect(result.nodes[0].layer).toBe(0);
    expect(result.edges).toHaveLength(0);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  // --- 3. Two independent badges (no edges) ---

  it('places two independent badges in the same layer', () => {
    const result = computeBadgeLayout([
      badge('Alpha'),
      badge('Beta'),
    ]);

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].layer).toBe(0);
    expect(result.nodes[1].layer).toBe(0);
    expect(result.edges).toHaveLength(0);
  });

  // --- 4. Simple linear chain: A → B → C ---

  it('computes correct layers for a linear chain', () => {
    const badges = [
      badge('A'),
      badge('B', ['A']),
      badge('C', ['B']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['A'].layer).toBe(0);
    expect(nodeByName['B'].layer).toBe(1);
    expect(nodeByName['C'].layer).toBe(2);
    expect(result.edges).toHaveLength(2);
  });

  // --- 5. Deep chain: A → B → C → D ---

  it('handles a deep chain with 4 levels', () => {
    const badges = [
      badge('A'),
      badge('B', ['A']),
      badge('C', ['B']),
      badge('D', ['C']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['A'].layer).toBe(0);
    expect(nodeByName['B'].layer).toBe(1);
    expect(nodeByName['C'].layer).toBe(2);
    expect(nodeByName['D'].layer).toBe(3);
    expect(result.edges).toHaveLength(3);
  });

  // --- 6. Diamond dependency: A,B → C ---

  it('places diamond dependency correctly (C depends on both A and B)', () => {
    const badges = [
      badge('A'),
      badge('B'),
      badge('C', ['A', 'B']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['A'].layer).toBe(0);
    expect(nodeByName['B'].layer).toBe(0);
    expect(nodeByName['C'].layer).toBe(1);
    // C should have 2 incoming edges
    expect(result.edges).toHaveLength(2);
    expect(result.edges.every((e) => e.toName === 'C')).toBe(true);
  });

  // --- 7. Complex DAG: A → C, B → C, C → D ---

  it('handles a complex DAG with diamond + chain', () => {
    const badges = [
      badge('A'),
      badge('B'),
      badge('C', ['A', 'B']),
      badge('D', ['C']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['A'].layer).toBe(0);
    expect(nodeByName['B'].layer).toBe(0);
    expect(nodeByName['C'].layer).toBe(1);
    expect(nodeByName['D'].layer).toBe(2);
    expect(result.edges).toHaveLength(3);
  });

  // --- 8. Circular dependencies (cycle guard) ---

  it('handles circular dependencies without infinite loop', () => {
    const badges = [
      badge('A', ['B']),
      badge('B', ['A']),
    ];
    // Should not throw, should complete with some layout
    const result = computeBadgeLayout(badges);
    expect(result.nodes).toHaveLength(2);
    // Cycle guard should prevent infinite recursion
  });

  it('handles self-referencing badge', () => {
    const badges = [
      badge('A', ['A']),
    ];
    const result = computeBadgeLayout(badges);
    expect(result.nodes).toHaveLength(1);
    // Self-reference: cycle guard returns 0, then calcDepth computes max(0, 0+1) = 1
    expect(result.nodes[0].layer).toBe(1);
  });

  // --- 9. previousBadges referencing non-existent badge ---

  it('ignores previousBadges that reference non-existent badges', () => {
    const badges = [
      badge('A', ['NonExistent']),
    ];
    const result = computeBadgeLayout(badges);

    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].layer).toBe(0); // treated as root since parent not found
    expect(result.edges).toHaveLength(0);  // no edge since parent doesn't exist
  });

  it('partially resolves when some deps exist and others do not', () => {
    const badges = [
      badge('Root'),
      badge('Child', ['Root', 'Ghost']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['Root'].layer).toBe(0);
    expect(nodeByName['Child'].layer).toBe(1);
    // Only one edge (Root → Child), Ghost is ignored
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].fromName).toBe('Root');
    expect(result.edges[0].toName).toBe('Child');
  });

  // --- 10. Orphan badges mixed with connected badges ---

  it('places orphan badges in layer 0 alongside connected roots', () => {
    const badges = [
      badge('Root'),
      badge('Orphan'),
      badge('Child', ['Root']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['Root'].layer).toBe(0);
    expect(nodeByName['Orphan'].layer).toBe(0);
    expect(nodeByName['Child'].layer).toBe(1);
  });

  // --- 11. Badge with empty previousBadges array ---

  it('treats badge with empty previousBadges as root (layer 0)', () => {
    const result = computeBadgeLayout([badge('Lone', [])]);
    expect(result.nodes[0].layer).toBe(0);
  });

  // --- 12. Badge with undefined previousBadges ---

  it('treats badge with undefined previousBadges as root', () => {
    const b = { name: 'NoPrev', _id: 'np' };
    // previousBadges is undefined
    const result = computeBadgeLayout([b]);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].layer).toBe(0);
  });

  // --- 13. Layout dimensions ---

  it('computes correct dimensions for multiple layers', () => {
    const badges = [
      badge('A'),
      badge('B', ['A']),
    ];
    const result = computeBadgeLayout(badges);

    // Width should accommodate at least 1 column
    expect(result.width).toBeGreaterThan(0);
    // Height should accommodate 2 layers
    expect(result.height).toBeGreaterThan(result.nodes[0].y);
  });

  // --- 14. Node Y-positions increase with layer ---

  it('nodes in deeper layers have larger Y positions', () => {
    const badges = [
      badge('Top'),
      badge('Mid', ['Top']),
      badge('Bot', ['Mid']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['Top'].y).toBeLessThan(nodeByName['Mid'].y);
    expect(nodeByName['Mid'].y).toBeLessThan(nodeByName['Bot'].y);
  });

  // --- 15. Edges point from parent to child ---

  it('edges have correct from/to structure', () => {
    const badges = [
      badge('Parent'),
      badge('Child', ['Parent']),
    ];
    const result = computeBadgeLayout(badges);

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].fromName).toBe('Parent');
    expect(result.edges[0].toName).toBe('Child');
    expect(result.edges[0].from.y).toBeLessThan(result.edges[0].to.y);
  });

  // --- 16. Multiple roots feeding into one node ---

  it('handles wide fan-in (3 roots → 1 child)', () => {
    const badges = [
      badge('A'),
      badge('B'),
      badge('C'),
      badge('D', ['A', 'B', 'C']),
    ];
    const result = computeBadgeLayout(badges);

    const nodeByName = {};
    result.nodes.forEach((n) => { nodeByName[n.name] = n; });

    expect(nodeByName['A'].layer).toBe(0);
    expect(nodeByName['B'].layer).toBe(0);
    expect(nodeByName['C'].layer).toBe(0);
    expect(nodeByName['D'].layer).toBe(1);
    expect(result.edges).toHaveLength(3);
  });

  // --- 17. Node data is preserved in output ---

  it('preserves original badge properties in output nodes', () => {
    const input = {
      _id: 'test-123',
      name: 'TestBadge',
      previousBadges: [],
      imageUrl: 'https://example.com/img.png',
      description: 'A test badge',
      checkinsAmount: 5,
      active: true,
    };
    const result = computeBadgeLayout([input]);

    expect(result.nodes[0]._id).toBe('test-123');
    expect(result.nodes[0].imageUrl).toBe('https://example.com/img.png');
    expect(result.nodes[0].description).toBe('A test badge');
    expect(result.nodes[0].checkinsAmount).toBe(5);
    expect(result.nodes[0].active).toBe(true);
    // Also has layout properties
    expect(result.nodes[0]).toHaveProperty('x');
    expect(result.nodes[0]).toHaveProperty('y');
    expect(result.nodes[0]).toHaveProperty('layer');
  });

  // --- 18. Custom layout options ---

  it('respects custom layout options', () => {
    const badges = [badge('A'), badge('B', ['A'])];
    const resultDefault = computeBadgeLayout(badges);
    const resultCustom = computeBadgeLayout(badges, { nodeGapX: 200, layerGapY: 200, padding: 100 });

    // Custom spacing should result in different dimensions
    expect(resultCustom.width).toBeGreaterThan(resultDefault.width);
    expect(resultCustom.height).toBeGreaterThan(resultDefault.height);
  });

  // --- 19. Three-way circular dependency ---

  it('handles three-way circular dependency without crash', () => {
    const badges = [
      badge('A', ['C']),
      badge('B', ['A']),
      badge('C', ['B']),
    ];
    const result = computeBadgeLayout(badges);
    expect(result.nodes).toHaveLength(3);
    // Should not throw — cycle guard prevents infinite recursion
  });
});
