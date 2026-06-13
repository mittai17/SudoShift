import React from 'react';
import { CheckSquare } from 'lucide-react';
import { createChecklistNode } from '../shared/BaseChecklistNode';
export default createChecklistNode({ label: 'Task Checklist', accentColor: '#22c55e', icon: <CheckSquare className="w-4 h-4" /> });
