import React from 'react';
import { CheckSquare } from 'lucide-react';
import { createChecklistNode } from '../shared/BaseChecklistNode';
export default createChecklistNode({ label: 'Event Checklist', accentColor: '#0ea5e9', icon: <CheckSquare className="w-4 h-4" /> });
