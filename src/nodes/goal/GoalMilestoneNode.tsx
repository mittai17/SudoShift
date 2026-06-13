import React from 'react';
import { Flag, Calendar, Link, Paperclip, Trophy } from 'lucide-react';
import { createGoalNode } from '../shared/BaseGoalNode';

const GoalMilestoneBody = ({ task, updateTask }: any) => {
  const status = task.status || 'Pending';
  const isAchieved = status === 'Achieved';

  return (
    <div className="space-y-3">
      {/* Target Date & Status */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center space-x-1.5 text-xs text-gray-400 bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
          <Calendar className={`w-3.5 h-3.5 ${isAchieved ? 'text-emerald-400' : 'text-[#a855f7]'}`} />
          <input 
            type="date" 
            className="w-full bg-transparent focus:outline-none"
            value={task.deadline?.split('T')[0] || ''}
            onChange={(e) => updateTask({ deadline: e.target.value || null })} 
          />
        </div>

        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium
            ${isAchieved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              status === 'Pending' ? 'bg-[#2a2b36] text-gray-300 border-[#3f3f46]' : 
              'bg-red-500/10 text-red-400 border-red-500/20'}`}
          value={status}
          onChange={(e) => updateTask({ status: e.target.value })}
        >
          <option value="Pending">Pending</option>
          <option value="Achieved">Achieved</option>
          <option value="Missed">Missed</option>
        </select>
      </div>

      {/* Achievement Badge */}
      {isAchieved && (
        <div className="flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
           <Trophy className="w-5 h-5 mr-2" />
           <span className="text-sm font-bold tracking-wide">MILESTONE UNLOCKED</span>
        </div>
      )}

      {/* Counters */}
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col items-center justify-center bg-[#2a2b36]/40 p-2 rounded-lg border border-[#2a2b36]">
          <Link className="w-3.5 h-3.5 text-blue-400 mb-1" />
          <span className="text-[10px] text-gray-500 uppercase">Projects</span>
          <div className="text-gray-300 font-bold">0</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-[#2a2b36]/40 p-2 rounded-lg border border-[#2a2b36]">
          <Paperclip className="w-3.5 h-3.5 text-orange-400 mb-1" />
          <span className="text-[10px] text-gray-500 uppercase">Evidence</span>
          <div className="text-gray-300 font-bold">0</div>
        </div>
      </div>
    </div>
  );
};

export default createGoalNode({
  label: 'Goal Milestone',
  accentColor: '#a855f7',
  icon: <Flag className="w-4 h-4 text-white" />
}, GoalMilestoneBody);
