import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Note', accentColor: '#ff6d5a', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Type your note here...' });
