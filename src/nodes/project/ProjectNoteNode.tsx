import React from 'react';
import { StickyNote } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

const ProjectNoteBody = ({ task, updateTask }: any) => (
  <textarea
    className="w-full text-xs text-gray-300 bg-[#13141c] border border-[#2a2b36] rounded-lg p-3 focus:outline-none focus:border-indigo-500 resize-none min-h-[150px]"
    placeholder="Project notes..."
    value={task.content || ''}
    onChange={(e) => updateTask({ content: e.target.value })}
  />
);

export default createNoteNode({
  label: 'Project Note',
  accentColor: '#6366f1',
  icon: <StickyNote className="w-4 h-4" />,
}, ProjectNoteBody);
