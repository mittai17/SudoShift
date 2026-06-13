import React from 'react';
import { NodeCategory } from '../../types';

export type { NodeCategory };

export interface NodeDefinition {
  /** Unique React Flow node type string e.g. "goal-note-node" */
  id: string;
  /** Human-readable label shown in sidebar */
  label: string;
  /** Category this node belongs to */
  category: NodeCategory;
  /** Lucide icon element */
  icon: React.ReactNode;
  /** The React component rendered on canvas */
  component: React.ComponentType<any>;
  /** Default data object when node is first dropped */
  defaultData: {
    title: string;
    description: string;
    matrix: string;
    deadline: null;
    [key: string]: unknown;
  };
  /** Accent color for minimap and sidebar badge */
  color: string;
}
