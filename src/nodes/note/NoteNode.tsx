import React, { useState } from 'react';
import { StickyNote, Pin, Tag, Type, Star, Clock, History, Paperclip, Share2, FileOutput, ListTodo, GraduationCap, Network, Link2 } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

const NoteBody = ({ task, updateTask }: any) => {
  const isPinned = task.isPinned || false;
  const isFavorite = task.isFavorite || false;
  const tags: string[] = task.tags || [];
  const [tagInput, setTagInput] = useState('');
  
  const content = task.content || '';
  
  const totalWords = content.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(totalWords / 200));

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) updateTask({ tags: [...tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (t: string) => updateTask({ tags: tags.filter(tag => tag !== t) });

  return (
    <div className="space-y-3 relative">
      <div className="absolute -top-12 right-12 flex gap-1">
         <button 
            className={`p-1.5 rounded-lg transition-all ${isFavorite ? 'bg-yellow-500/20 text-yellow-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
            onClick={() => updateTask({ isFavorite: !isFavorite })} title="Favorite"
         >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
         </button>
         <button 
            className={`p-1.5 rounded-lg transition-all ${isPinned ? 'bg-violet-500/20 text-violet-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
            onClick={() => updateTask({ isPinned: !isPinned })} title="Pin Note"
         >
            <Pin className="w-4 h-4" />
         </button>
      </div>

      {/* Formatting Toolbar Mock */}
      <div className="flex items-center gap-1 bg-[#2a2b36]/50 p-1.5 rounded-lg border border-[#2a2b36]">
         <select className="bg-transparent text-gray-300 text-[10px] focus:outline-none px-1 border-r border-[#3f3f46]">
            <option>Heading 1</option><option>Heading 2</option><option>Normal Text</option>
         </select>
         <button className="p-1 text-gray-400 hover:bg-[#3f3f46] hover:text-white rounded text-[10px] font-bold">B</button>
         <button className="p-1 text-gray-400 hover:bg-[#3f3f46] hover:text-white rounded text-[10px] italic">I</button>
         <button className="p-1 text-gray-400 hover:bg-[#3f3f46] hover:text-white rounded text-[10px] underline">U</button>
         <div className="w-px h-3 bg-[#3f3f46] mx-1" />
         <button className="p-1 text-gray-400 hover:bg-[#3f3f46] hover:text-white rounded" title="Add Link"><Link2 className="w-3 h-3" /></button>
         <button className="p-1 text-gray-400 hover:bg-[#3f3f46] hover:text-white rounded" title="Attach File"><Paperclip className="w-3 h-3" /></button>
         <div className="flex-1" />
         <button className="p-1 text-gray-400 hover:bg-[#3f3f46] hover:text-white rounded" title="Version History"><History className="w-3 h-3" /></button>
      </div>

      {/* Editor */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-violet-500 transition-colors">
        <textarea 
         className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[150px] custom-scrollbar" 
         placeholder="Start typing your note (Markdown supported)..." 
         value={content} onChange={(e) => updateTask({ content: e.target.value })} 
        />
      </div>

      {/* Note Tools */}
      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-2 space-y-2">
         <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1 flex items-center">Knowledge Assistant</div>
         <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1 transition-colors">
               <FileOutput className="w-3 h-3 mr-1" /> Summarize
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1 transition-colors">
               <Type className="w-3 h-3 mr-1" /> Expand
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1 transition-colors">
               Rewrite
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1 transition-colors">
               <ListTodo className="w-3 h-3 mr-1" /> Gen Tasks
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1 transition-colors">
               <GraduationCap className="w-3 h-3 mr-1" /> Gen Cards
            </button>
            <button className="flex items-center justify-center bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded py-1 transition-colors">
               <Network className="w-3 h-3 mr-1" /> Graph Links
            </button>
         </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#2a2b36]/30 p-2 rounded-lg border border-[#2a2b36]">
        <Tag className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {tags.map(t => (
          <span key={t} className="flex items-center text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded border border-violet-500/10">
            {t} <button onClick={() => removeTag(t)} className="ml-1 hover:text-white">&times;</button>
          </span>
        ))}
        <input 
          type="text" placeholder="Add tag or @mention..." 
          className="text-xs bg-transparent focus:outline-none text-gray-300 w-28 flex-1 min-w-[60px]"
          value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
        />
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-[#2a2b36]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center"><Type className="w-3 h-3 mr-1" />{totalWords} words</span>
          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{readTime} min read</span>
        </div>
        <button className="flex items-center hover:text-white transition-colors" title="Share Note">
          <Share2 className="w-3 h-3 mr-1" /> Share
        </button>
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note',
  accentColor: '#8b5cf6',
  icon: <StickyNote className="w-4 h-4 text-white" />,
  width: 'w-[420px]'
}, NoteBody);
