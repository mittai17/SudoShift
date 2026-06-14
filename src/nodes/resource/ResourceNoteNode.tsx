import React, { useState } from 'react';
import { StickyNote, Pin, Tag, Type, BookOpen, Highlighter, ListChecks, FileOutput, GraduationCap, CheckCircle2 } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const ResourceNoteBody = ({ task, updateTask }: any) => {
  const isPinned = task.isPinned || false;
  const tags: string[] = task.tags || [];
  const [tagInput, setTagInput] = useState('');
  
  // Custom text sections
  const summary = task.summary || '';
  const highlights = task.highlights || '';
  const takeaways = task.takeaways || '';

  const totalWords = [task.description, summary, highlights, takeaways]
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
        className={`absolute -top-12 right-12 p-1.5 rounded-lg transition-all ${isPinned ? 'bg-cyan-500/20 text-cyan-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
        onClick={() => updateTask({ isPinned: !isPinned })} title="Pin Note"
      >
        <Pin className="w-4 h-4" />
      </button>

      {/* Sections */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><BookOpen className="w-3 h-3 mr-1" /> Summary</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Brief summary of the resource..." value={summary} onChange={(e) => updateTask({ summary: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><Highlighter className="w-3 h-3 mr-1" /> Highlights & Quotes</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Paste interesting quotes here..." value={highlights} onChange={(e) => updateTask({ highlights: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><ListChecks className="w-3 h-3 mr-1" /> Key Takeaways</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="What did you learn?" value={takeaways} onChange={(e) => updateTask({ takeaways: e.target.value })} />
        </div>
      </div>

      {/* Note Tools */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <FileOutput className="w-3 h-3 mr-1" /> Summary
         </button>
         <button className="flex items-center justify-center bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg py-1.5 transition-colors font-medium">
            Flashcards
         </button>
         <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <GraduationCap className="w-3 h-3 mr-1" /> Quiz Me
         </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#2a2b36]/30 p-2 rounded-lg border border-[#2a2b36]">
        <Tag className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {tags.map(t => (
          <span key={t} className="flex items-center text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/10">
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
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'Resource Note',
  accentColor: '#06b6d4',
  icon: <StickyNote className="w-4 h-4 text-white" />,
  width: 'w-[400px]'
}, ResourceNoteBody);
