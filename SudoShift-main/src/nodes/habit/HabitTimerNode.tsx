import React from 'react';
import { Timer } from 'lucide-react';
import { createTimerNode } from '../shared/BaseTimerNode';
export default createTimerNode({ label: 'Habit Timer', accentColor: '#f97316', icon: <Timer className="w-4 h-4" /> });
