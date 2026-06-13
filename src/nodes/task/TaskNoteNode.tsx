import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Task Note', accentColor: '#22c55e', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Task context and notes...' });
