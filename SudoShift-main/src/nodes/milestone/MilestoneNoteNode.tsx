import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Milestone Note', accentColor: '#ef4444', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Milestone context...' });
