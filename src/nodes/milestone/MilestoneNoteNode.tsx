import React, { useState } from 'react';
import { StickyNote, Pin, Tag, Type, Link as LinkIcon } from 'lucide-react';
import { createMilestoneNode } from '../shared/BaseMilestoneNode';

const MilestoneNoteBody = ({ task, updateTask }: any) => {
  const isPinned = task.isPinned || false;
  const tags: string[] = task.tags || [];
  const linkedMilestone = task.linkedMilestone || '';
  const [tagInput, setTagInput] = useState('');
  
  // Custom text sections
  const progressNotes = task.progressNotes || '';
  const reflection = task.reflection || '';
  const lessonsLearned = task.lessonsLearned || '';
  const decisionLog = task.decisionLog || '';

  const totalWords = [task.description, progressNotes, reflection, lessonsLearned, decisionLog]
    .join(' ').trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) updateTask({ tags: [...tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (t: string) => updateTask({ tags: tags.filter(tag => tag !== t) });

  return (
    <div className="space-y-3 relative">
      <button 
        className={`absolute -top-12 right-12 p-1.5 rounded-lg transition-all ${isPinned ? 'bg-rose-500/20 text-rose-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
        onClick={() => updateTask({ isPinned: !isPinned })} title="Pin Note"
      >
        <Pin className="w-4 h-4" />
      </button>

      {/* Linked Milestone */}
      <div className="flex items-center space-x-2 text-xs bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
        <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <input 
          type="text" placeholder="Linked Milestone..." 
          className="w-full bg-transparent focus:outline-none text-gray-300"
          value={linkedMilestone} onChange={(e) => updateTask({ linkedMilestone: e.target.value })} 
        />
      </div>

      {/* Sections */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-rose-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36]">Progress Notes</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Update on progress..." value={progressNotes} onChange={(e) => updateTask({ progressNotes: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-rose-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36]">Reflection</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Thoughts and reflections..." value={reflection} onChange={(e) => updateTask({ reflection: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-rose-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36]">Lessons Learned</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="What went well? What didn't?" value={lessonsLearned} onChange={(e) => updateTask({ lessonsLearned: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-rose-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36]">Decision Log</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Key decisions made..." value={decisionLog} onChange={(e) => updateTask({ decisionLog: e.target.value })} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#2a2b36]/30 p-2 rounded-lg border border-[#2a2b36]">
        <Tag className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {tags.map(t => (
          <span key={t} className="flex items-center text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">
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
          <Type className="w-3 h-3" /><span>{totalWords} words</span>
        </div>
        <button className="flex items-center text-rose-500 hover:text-rose-400 transition-colors font-medium">
          Summarize
        </button>
      </div>
    </div>
  );
};

export default createMilestoneNode({
  label: 'Milestone Note',
  accentColor: '#f43f5e',
  icon: <StickyNote className="w-4 h-4 text-white" />,
  width: 'w-[400px]'
}, MilestoneNoteBody);
