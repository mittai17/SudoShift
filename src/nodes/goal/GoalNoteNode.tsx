import React, { useState } from 'react';
import { BookOpen, Pin, Tag, Type } from 'lucide-react';
import { createGoalNode } from '../shared/BaseGoalNode';

const GoalNoteBody = ({ task, updateTask }: any) => {
  const isPinned = task.isPinned || false;
  const tags: string[] = task.tags || [];
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

  const removeTag = (tagToRemove: string) => {
    updateTask({ tags: tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="space-y-3 relative">
      {/* Pin Button */}
      <button 
        className={`absolute -top-12 right-12 p-1.5 rounded-lg transition-all ${isPinned ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
        onClick={() => updateTask({ isPinned: !isPinned })}
        title={isPinned ? "Unpin Note" : "Pin Note"}
      >
        <Pin className="w-4 h-4" />
      </button>

      {/* Tags Input */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#2a2b36]/30 p-2 rounded-lg border border-[#2a2b36]">
        <Tag className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {tags.map(t => (
          <span key={t} className="flex items-center text-[10px] bg-[#a855f7]/20 text-[#a855f7] px-1.5 py-0.5 rounded">
            {t}
            <button onClick={() => removeTag(t)} className="ml-1 hover:text-white">&times;</button>
          </span>
        ))}
        <input 
          type="text" 
          placeholder="Add tag..." 
          className="text-xs bg-transparent focus:outline-none text-gray-300 w-20 flex-1 min-w-[60px]"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-[#2a2b36]">
        <div className="flex items-center space-x-1">
          <Type className="w-3 h-3" />
          <span>{wordCount} words</span>
        </div>
      </div>
    </div>
  );
};

export default createGoalNode({
  label: 'Goal Journal', // Renamed as requested
  accentColor: '#a855f7',
  icon: <BookOpen className="w-4 h-4 text-white" />
}, GoalNoteBody);
