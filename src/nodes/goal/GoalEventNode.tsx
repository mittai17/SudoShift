import React from 'react';
import { CalendarDays, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { createGoalNode } from '../shared/BaseGoalNode';

const GoalEventBody = ({ task, updateTask }: any) => {
  const eventType = task.eventType || 'Meeting';
  const conflict = task.isConflicting || false;

  // Simple countdown logic
  const daysLeft = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

  return (
    <div className="space-y-3">
      {/* Type & Conflict */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-[#a855f7] flex-1"
          value={eventType}
          onChange={(e) => updateTask({ eventType: e.target.value })}
        >
          {['Exam', 'Interview', 'Meeting', 'Hackathon', 'Deadline'].map(t => <option key={t}>{t}</option>)}
        </select>
        
        {conflict && (
          <div className="flex items-center text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" /> Conflict
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
          <span className="w-8">Start</span>
          <input 
            type="datetime-local" 
            className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-[#a855f7]"
            value={task.startDate || ''}
            onChange={(e) => updateTask({ startDate: e.target.value })} 
          />
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
          <span className="w-8">End</span>
          <input 
            type="datetime-local" 
            className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-[#a855f7]"
            value={task.deadline || ''}
            onChange={(e) => updateTask({ deadline: e.target.value })} 
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {daysLeft !== null && (
            <div className={`text-[10px] font-bold px-2 py-1 rounded ${daysLeft < 0 ? 'bg-red-500/20 text-red-400' : daysLeft < 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-[#a855f7]/20 text-[#a855f7]'}`}>
              {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
            </div>
          )}
        </div>
        
        <button 
          className="p-1.5 hover:bg-[#2a2b36] rounded-md text-gray-500 hover:text-blue-400 transition-colors"
          title="Sync to Calendar"
          onClick={() => alert("Calendar sync clicked")}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default createGoalNode({
  label: 'Goal Event',
  accentColor: '#a855f7',
  icon: <CalendarDays className="w-4 h-4 text-white" />
}, GoalEventBody);
