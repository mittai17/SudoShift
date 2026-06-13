import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Goal Note', accentColor: '#f59e0b', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Notes about this goal...' });
