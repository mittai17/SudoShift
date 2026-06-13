import React from 'react';
import { CheckSquare } from 'lucide-react';
import { createChecklistNode } from '../shared/BaseChecklistNode';
export default createChecklistNode({ label: 'Project Checklist', accentColor: '#6366f1', icon: <CheckSquare className="w-4 h-4" /> });
