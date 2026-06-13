import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Habit Note', accentColor: '#f97316', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Habit reflection...' });
