import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';
export default createNoteNode({ label: 'Event Note', accentColor: '#0ea5e9', icon: <StickyNote className="w-4 h-4" />, placeholder: 'Event notes...' });
