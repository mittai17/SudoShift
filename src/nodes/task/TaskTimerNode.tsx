import React from 'react';
import { Timer } from 'lucide-react';
import { createTimerNode } from '../shared/BaseTimerNode';
export default createTimerNode({ label: 'Task Timer', accentColor: '#22c55e', icon: <Timer className="w-4 h-4" /> });
