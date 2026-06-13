import React, { useState } from 'react';
import { StickyNote, Pin, Tag, Type, Link as LinkIcon, Sparkles, CheckSquare, Paperclip } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

const TaskNoteBody = ({ task, updateTask }: any) => {
  const isPinned = task.isPinned || false;
  const tags: string[] = task.tags || [];
  const linkedTask = task.linkedTask || '';
  const [tagInput, setTagInput] = useState('');

  const wordCount = (task.description || '').trim().split(/\s+/).filter((w: string) => w.length > 0).length;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        updateTask({ tags: [...tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => updateTask({ tags: tags.filter(t => t !== tagToRemove) });

  return (
    <div className="space-y-3 relative">
      <button 
        className={`absolute -top-12 right-12 p-1.5 rounded-lg transition-all ${isPinned ? 'bg-emerald-500/20 text-emerald-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
        onClick={() => updateTask({ isPinned: !isPinned })} title="Pin Note"
      >
        <Pin className="w-4 h-4" />
      </button>

      {/* Linked Task */}
      <div className="flex items-center space-x-2 text-xs bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
        <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <input 
          type="text" placeholder="Linked Task..." 
          className="w-full bg-transparent focus:outline-none text-gray-300"
          value={linkedTask} onChange={(e) => updateTask({ linkedTask: e.target.value })} 
        />
      </div>

      {/* Toolbars / Embeds */}
      <div className="flex items-center gap-2">
         <button className="flex-1 flex items-center justify-center bg-[#2a2b36]/50 hover:bg-[#2a2b36] text-emerald-500 text-[10px] py-1.5 rounded border border-[#2a2b36] transition-colors font-medium">
            <CheckSquare className="w-3 h-3 mr-1" /> Embed Checklist
         </button>
         <button className="flex-1 flex items-center justify-center bg-[#2a2b36]/50 hover:bg-[#2a2b36] text-blue-400 text-[10px] py-1.5 rounded border border-[#2a2b36] transition-colors font-medium">
            <Paperclip className="w-3 h-3 mr-1" /> Attach File
         </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#2a2b36]/30 p-2 rounded-lg border border-[#2a2b36]">
        <Tag className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {tags.map(t => (
          <span key={t} className="flex items-center text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/10">
            {t} <button onClick={() => removeTag(t)} className="ml-1 hover:text-white">&times;</button>
          </span>
        ))}
        <input 
          type="text" placeholder="Add tag or @mention..." 
          className="text-xs bg-transparent focus:outline-none text-gray-300 w-28 flex-1 min-w-[60px]"
          value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-[#2a2b36]">
        <div className="flex items-center space-x-1">
          <Type className="w-3 h-3" /><span>{wordCount} words</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
            <Sparkles className="w-3 h-3 mr-1" /> Tasks
          </button>
          <button className="flex items-center text-blue-500 hover:text-blue-400 transition-colors font-medium">
            <Sparkles className="w-3 h-3 mr-1" /> Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default createTaskNode({
  label: 'Task Note',
  accentColor: '#10b981',
  icon: <StickyNote className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, TaskNoteBody);
