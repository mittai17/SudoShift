import React from 'react';
import { Package, Calendar, CheckSquare } from 'lucide-react';
import { createGoalNode } from '../shared/BaseGoalNode';

const GoalProjectBody = ({ task, updateTask }: any) => {
  const progress = task.progress || 0;
  const status = task.status || 'Active';
  const priority = task.priority || 'Medium';

  return (
    <div className="space-y-3">
      {/* Progress & Status */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1 text-gray-300 focus:outline-none focus:border-[#a855f7] flex-1"
          value={status}
          onChange={(e) => updateTask({ status: e.target.value })}
        >
          {['Not Started', 'Active', 'Completed', 'Blocked'].map(s => <option key={s}>{s}</option>)}
        </select>

        <select 
          className={`text-xs border rounded-md px-2 py-1 focus:outline-none font-medium
            ${priority === 'Low' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              'bg-red-500/10 text-red-400 border-red-500/20'}`}
          value={priority}
          onChange={(e) => updateTask({ priority: e.target.value })}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>Progress</span>
          <span className="text-[#a855f7]">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#13141c] rounded-full overflow-hidden border border-[#2a2b36]">
          <div className="h-full bg-[#a855f7] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <input 
          type="range" min="0" max="100" 
          className="w-full accent-[#a855f7] h-1"
          value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
        />
      </div>

      {/* Date & Counters */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center space-x-1.5 text-xs text-gray-400 bg-[#2a2b36]/50 rounded-md px-2 py-1 border border-[#2a2b36]">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-[#a855f7]" />
          <input 
            type="date" 
            className="w-full bg-transparent focus:outline-none"
            value={task.deadline?.split('T')[0] || ''}
            onChange={(e) => updateTask({ deadline: e.target.value || null })} 
          />
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]" title="Tasks">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono">0/0</span>
        </div>
      </div>
    </div>
  );
};

export default createGoalNode({
  label: 'Goal Project',
  accentColor: '#a855f7',
  icon: <Package className="w-4 h-4 text-white" />
}, GoalProjectBody);
