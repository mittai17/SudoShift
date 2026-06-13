import React from 'react';
import { Calendar, AlertCircle, Users, User, Clock } from 'lucide-react';
import { createEventNode } from '../shared/BaseEventNode';

const EventBody = ({ task, updateTask }: any) => {
  const status = task.status || 'Upcoming';
  const priority = task.priority || 'Medium';
  const category = task.category || 'Meeting';
  const conflict = task.isConflicting || false;
  const progress = task.progress || 0;
  
  const daysLeft = task.startDate ? Math.ceil((new Date(task.startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

  return (
    <div className="space-y-3">
      {/* Category, Status & Priority */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-amber-500 flex-1"
          value={category}
          onChange={(e) => updateTask({ category: e.target.value })}
        >
          {['Meeting', 'Exam', 'Interview', 'Hackathon', 'Workshop', 'Deadline'].map(c => <option key={c}>{c}</option>)}
        </select>
        
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-amber-500 flex-1"
          value={status}
          onChange={(e) => updateTask({ status: e.target.value })}
        >
          {['Upcoming', 'Active', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium flex-1
            ${priority === 'Low' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'}`}
          value={priority}
          onChange={(e) => updateTask({ priority: e.target.value })}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
          <option value="Critical">Critical Priority</option>
        </select>

        {conflict && (
          <div className="flex items-center text-[10px] text-red-400 bg-red-500/10 px-2 py-1.5 rounded border border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1 shrink-0" /> Conflict
          </div>
        )}
      </div>

      {/* Owner & Participants */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex-1 flex items-center bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
          <User className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0" />
          <input 
            type="text" placeholder="Owner..." 
            className="w-full bg-transparent focus:outline-none text-gray-300 placeholder-gray-600"
            value={task.owner || ''} onChange={(e) => updateTask({ owner: e.target.value })} 
          />
        </div>
        <div className="flex items-center bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
          <Users className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
          <input 
            type="number" className="w-8 bg-transparent focus:outline-none text-gray-300"
            value={task.participantsCount || 0} onChange={(e) => updateTask({ participantsCount: parseInt(e.target.value) || 0 })} 
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="w-8">Start</span>
          <input 
            type="datetime-local" 
            className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-amber-500"
            value={task.startDate || ''} onChange={(e) => updateTask({ startDate: e.target.value })} 
          />
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="w-8">End</span>
          <input 
            type="datetime-local" 
            className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-amber-500"
            value={task.deadline || ''} onChange={(e) => updateTask({ deadline: e.target.value })} 
          />
        </div>
      </div>

      {/* Progress & Countdown */}
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <input 
            type="range" min="0" max="100" 
            className="w-full accent-amber-500 h-1"
            value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
          />
        </div>
        {daysLeft !== null && (
          <div className={`text-[10px] font-bold px-2 py-1 rounded ${daysLeft < 0 ? 'bg-red-500/20 text-red-400' : daysLeft < 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-500'}`}>
            {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
          </div>
        )}
      </div>

      {/* Metrics Footer */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Notes</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Links</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Tasks</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>People</span> <span className="font-bold text-gray-200">{task.participantsCount || 0}</span></div>
      </div>
    </div>
  );
};

export default createEventNode({
  label: 'Event',
  accentColor: '#f59e0b',
  icon: <Calendar className="w-5 h-5 text-white" />,
  width: 'w-[340px]'
}, EventBody);
