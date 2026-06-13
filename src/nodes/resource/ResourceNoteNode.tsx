import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Resource Note', accentColor: '#8b5cf6', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Key takeaways...' });
