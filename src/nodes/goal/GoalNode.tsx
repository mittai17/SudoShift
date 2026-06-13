import React from 'react';
import { Target, Activity } from 'lucide-react';
import { createGoalNode } from '../shared/BaseGoalNode';

const GoalBody = ({ task, updateTask }: any) => {
  const progress = task.progress || 0;
  const health = task.health || 'On Track';
  const category = task.category || 'Career';

  return (
    <div className="space-y-3">
      {/* Category & Health */}
      <div className="flex items-center justify-between gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1 text-gray-300 focus:outline-none focus:border-[#a855f7]"
          value={category}
          onChange={(e) => updateTask({ category: e.target.value })}
        >
          {['Career', 'Academics', 'Health', 'Finance', 'Personal', 'Startup'].map(c => <option key={c}>{c}</option>)}
        </select>
        
        <select 
          className={`text-xs border rounded-md px-2 py-1 focus:outline-none font-medium
            ${health === 'On Track' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              health === 'At Risk' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'}`}
          value={health}
          onChange={(e) => updateTask({ health: e.target.value })}
        >
          <option value="On Track">🟢 On Track</option>
          <option value="At Risk">🟡 At Risk</option>
          <option value="Blocked">🔴 Blocked</option>
        </select>
      </div>

      {/* Progress Ring & Stats */}
      <div className="flex items-center space-x-4 bg-[#2a2b36]/30 p-3 rounded-xl border border-[#2a2b36]">
        <div className="relative w-12 h-12 flex shrink-0 items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-gray-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-[#a855f7] transition-all duration-500" strokeDasharray={`${progress}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <span className="absolute text-xs font-bold text-white">{progress}%</span>
        </div>
        <div className="flex-1">
          <input 
            type="range" min="0" max="100" 
            className="w-full accent-[#a855f7]"
            value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
          />
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex justify-between items-center bg-[#1a1b23] px-2 py-1 rounded"><span>Projects</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between items-center bg-[#1a1b23] px-2 py-1 rounded"><span>Habits</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between items-center bg-[#1a1b23] px-2 py-1 rounded"><span>Milestones</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between items-center bg-[#1a1b23] px-2 py-1 rounded"><span>Events</span> <span className="font-bold text-gray-200">0</span></div>
      </div>
    </div>
  );
};

export default createGoalNode({
  label: 'Goal',
  accentColor: '#a855f7',
  icon: <Target className="w-5 h-5 text-white" />,
  width: 'w-[340px]' // 20-25% larger than default 280px
}, GoalBody);
