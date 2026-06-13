import React from 'react';
import { Layers, Star, Clock, User, Tag, PlayCircle, BookOpen, CheckCircle2 } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const ResourceBody = ({ task, updateTask }: any) => {
  const type = task.resourceType || 'Course';
  const status = task.status || 'To Read';
  const difficulty = task.difficulty || 'Beginner';
  const platform = task.platform || 'Udemy';
  
  const rating = task.rating || 0;
  const progress = task.progress || 0;
  const tags: string[] = task.tags || [];

  return (
    <div className="space-y-3">
      {/* Type & Status */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-cyan-400 font-medium focus:outline-none focus:border-cyan-500 flex-1"
          value={type} onChange={(e) => updateTask({ resourceType: e.target.value })}
        >
          {['Book', 'Course', 'Video', 'Article', 'Documentation', 'PDF', 'Repository'].map(t => <option key={t}>{t}</option>)}
        </select>
        
        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium flex-1
            ${status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              status === 'Reading' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              status === 'Archived' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
              'bg-[#2a2b36] text-gray-300 border-[#3f3f46]'}`}
          value={status} onChange={(e) => updateTask({ status: e.target.value })}
        >
          {['To Read', 'Reading', 'Completed', 'Archived'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Difficulty & Platform */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-cyan-500 flex-1"
          value={difficulty} onChange={(e) => updateTask({ difficulty: e.target.value })}
        >
          {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-cyan-500 flex-1"
          value={platform} onChange={(e) => updateTask({ platform: e.target.value })}
        >
          {['YouTube', 'Udemy', 'Coursera', 'GitHub', 'Medium'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Author & Time */}
      <div className="grid grid-cols-2 gap-2">
         <div className="flex items-center bg-[#2a2b36]/30 rounded-md px-2 py-1.5 border border-[#2a2b36]">
            <User className="w-3.5 h-3.5 text-cyan-500 mr-1.5" />
            <input type="text" placeholder="Author/Creator..." className="w-full bg-transparent focus:outline-none text-gray-300 text-xs" value={task.author || ''} onChange={(e) => updateTask({ author: e.target.value })} />
         </div>
         <div className="flex items-center bg-[#2a2b36]/30 rounded-md px-2 py-1.5 border border-[#2a2b36]">
            <Clock className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
            <input type="text" placeholder="Est. Time..." className="w-full bg-transparent focus:outline-none text-gray-300 text-xs" value={task.estimatedTime || ''} onChange={(e) => updateTask({ estimatedTime: e.target.value })} />
         </div>
      </div>

      {/* Rating & Tags */}
      <div className="flex items-center justify-between bg-[#2a2b36]/30 rounded-md px-2 py-1.5 border border-[#2a2b36]">
         <div className="flex items-center">
            {[1, 2, 3, 4, 5].map(star => (
              <Star 
                key={star} onClick={() => updateTask({ rating: star })}
                className={`w-3.5 h-3.5 cursor-pointer transition-colors ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
              />
            ))}
         </div>
         <div className="flex items-center flex-1 ml-3">
            <Tag className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
            <input 
              type="text" placeholder="Tags (comma separated)..." 
              className="w-full bg-transparent focus:outline-none text-gray-300 text-xs" 
              value={tags.join(', ')} onChange={(e) => updateTask({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} 
            />
         </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Learning Progress</span><span>{progress}%</span>
          </div>
          <input 
            type="range" min="0" max="100" className="w-full accent-cyan-500 h-1"
            value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
          />
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded">
          <PlayCircle className="w-3.5 h-3.5 mb-1 text-red-400" />
          <span className="font-bold text-gray-200">0</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded">
          <BookOpen className="w-3.5 h-3.5 mb-1 text-blue-400" />
          <span className="font-bold text-gray-200">0</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded">
          <Layers className="w-3.5 h-3.5 mb-1 text-emerald-400" />
          <span className="font-bold text-gray-200">0</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded">
          <CheckCircle2 className="w-3.5 h-3.5 mb-1 text-purple-400" />
          <span className="font-bold text-gray-200">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'Resource',
  accentColor: '#06b6d4',
  icon: <Layers className="w-5 h-5 text-white" />,
  width: 'w-[360px]'
}, ResourceBody);
