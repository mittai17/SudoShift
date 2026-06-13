import type React from 'react';
import { NODE_REGISTRY } from './registry';

/**
 * Auto-built React Flow nodeTypes map from the central registry.
 * Import this single export in Editor.tsx instead of individual node imports.
 */
export const nodeTypes: Record<string, React.ComponentType<any>> = Object.fromEntries(
  NODE_REGISTRY.map((n) => [n.id, n.component])
);

/**
 * Colour lookup for MiniMap — O(1) by node type id.
 */
export const nodeColorMap: Record<string, string> = Object.fromEntries(
  NODE_REGISTRY.map((n) => [n.id, n.color])
);

export { NODE_REGISTRY };
