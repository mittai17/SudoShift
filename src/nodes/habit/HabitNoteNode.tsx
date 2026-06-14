import React, { useState } from 'react';
import { StickyNote, Pin, Tag, Type, Smile, Meh, Frown, BookOpen, Calendar, History, TrendingUp } from 'lucide-react';
import { createHabitNode } from '../shared/BaseHabitNode';

const HabitNoteBody = ({ task, updateTask }: any) => {
  const isPinned = task.isPinned || false;
  const tags: string[] = task.tags || [];
  const mood = task.mood || 'Meh'; // Smile, Meh, Frown
  const [tagInput, setTagInput] = useState('');
  
  // Custom text sections
  const dailyLog = task.dailyLog || '';
  const reflection = task.reflection || '';
  const weeklyReview = task.weeklyReview || '';
  const monthlyReview = task.monthlyReview || '';

  const totalWords = [task.description, dailyLog, reflection, weeklyReview, monthlyReview]
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
        className={`absolute -top-12 right-12 p-1.5 rounded-lg transition-all ${isPinned ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
        onClick={() => updateTask({ isPinned: !isPinned })} title="Pin Note"
      >
        <Pin className="w-4 h-4" />
      </button>

      {/* Habit Insights Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-lg p-2.5">
         <div className="flex items-center text-[10px] text-orange-400 font-bold mb-1.5 uppercase tracking-wider">Habit Insights</div>
         <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-300">
            <span className="flex items-center"><TrendingUp className="w-3 h-3 mr-1 text-emerald-500" /> Best day: Tuesday</span>
            <span className="flex items-center"><History className="w-3 h-3 mr-1 text-blue-500" /> Current streak: 21 days</span>
         </div>
      </div>

      {/* Mood Tracker */}
      <div className="flex items-center gap-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
         <span className="text-xs text-gray-400 mr-2 font-medium">Daily Mood:</span>
         <button onClick={() => updateTask({ mood: 'Smile' })} className={`p-1.5 rounded-full transition-colors ${mood === 'Smile' ? 'bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500' : 'text-gray-500 hover:bg-[#2a2b36]'}`}><Smile className="w-4 h-4" /></button>
         <button onClick={() => updateTask({ mood: 'Meh' })} className={`p-1.5 rounded-full transition-colors ${mood === 'Meh' ? 'bg-yellow-500/20 text-yellow-500 ring-1 ring-yellow-500' : 'text-gray-500 hover:bg-[#2a2b36]'}`}><Meh className="w-4 h-4" /></button>
         <button onClick={() => updateTask({ mood: 'Frown' })} className={`p-1.5 rounded-full transition-colors ${mood === 'Frown' ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500' : 'text-gray-500 hover:bg-[#2a2b36]'}`}><Frown className="w-4 h-4" /></button>
      </div>

      {/* Sections */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-orange-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><BookOpen className="w-3 h-3 mr-1" /> Daily Log Entry</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="How did the habit go today?" value={dailyLog} onChange={(e) => updateTask({ dailyLog: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-orange-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><BookOpen className="w-3 h-3 mr-1" /> Reflection Journal</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Deep thoughts on progress..." value={reflection} onChange={(e) => updateTask({ reflection: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-orange-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><Calendar className="w-3 h-3 mr-1" /> Weekly Review</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Summary of the week..." value={weeklyReview} onChange={(e) => updateTask({ weeklyReview: e.target.value })} />
        </div>
        <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden focus-within:border-orange-500 transition-colors">
          <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center"><Calendar className="w-3 h-3 mr-1" /> Monthly Review</div>
          <textarea className="w-full text-xs text-gray-300 bg-transparent border-none p-3 focus:outline-none resize-none min-h-[60px]" placeholder="Summary of the month..." value={monthlyReview} onChange={(e) => updateTask({ monthlyReview: e.target.value })} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#2a2b36]/30 p-2 rounded-lg border border-[#2a2b36]">
        <Tag className="w-3.5 h-3.5 text-gray-500 mr-1 shrink-0" />
        {tags.map(t => (
          <span key={t} className="flex items-center text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">
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
        <button className="flex items-center text-orange-500 hover:text-orange-400 transition-colors font-medium">
          Reflect
        </button>
      </div>
    </div>
  );
};

export default createHabitNode({
  label: 'Habit Note',
  accentColor: '#f97316',
  icon: <StickyNote className="w-4 h-4 text-white" />,
  width: 'w-[400px]'
}, HabitNoteBody);
