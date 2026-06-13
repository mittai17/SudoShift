import React from 'react';
import { Calendar } from 'lucide-react';
import { createCalendarNode } from '../shared/BaseCalendarNode';
export default createCalendarNode({ label: 'Habit Schedule Calendar', accentColor: '#f97316', icon: <Calendar className="w-4 h-4" /> });
