import React from 'react';
import { GitGraph } from 'lucide-react';
import { createMermaidNode } from '../shared/BaseMermaidNode';
export default createMermaidNode({ label: 'Note Mermaid', accentColor: '#8b5cf6', icon: <GitGraph className="w-4 h-4" /> });
