import React from 'react';
import { CheckSquare, Calendar, User, Clock, CheckCircle2, RotateCw, Network, Tag } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

const TaskBody = ({ task, updateTask }: any) => {
  const type = task.taskType || 'Development';
  const status = task.status || 'Todo';
  const priority = task.priority || 'Medium';
  const progress = task.progress || 0;
  const isCompleted = status === 'Completed';
  
  const daysLeft = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

  return (
    <div className="space-y-3">
      {/* Type, Status & Priority */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-emerald-500 flex-1"
          value={type} onChange={(e) => updateTask({ taskType: e.target.value })}
        >
          {['Personal', 'Work', 'Study', 'Development', 'Research'].map(t => <option key={t}>{t}</option>)}
        </select>
        
        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium flex-1
            ${status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              status === 'Blocked' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              status === 'Review' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
              'bg-[#2a2b36] text-gray-300 border-[#3f3f46]'}`}
          value={status} onChange={(e) => updateTask({ status: e.target.value })}
        >
          {['Todo', 'In Progress', 'Blocked', 'Review', 'Completed'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium flex-1
            ${priority === 'Low' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
              priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
              priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'}`}
          value={priority} onChange={(e) => updateTask({ priority: e.target.value })}
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
          <option value="Critical">Critical Priority</option>
        </select>

        <div className="flex items-center bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36] flex-1">
          <User className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
          <input 
            type="text" placeholder="Assignee..." 
            className="w-full bg-transparent focus:outline-none text-gray-300 text-xs placeholder-gray-600"
            value={task.assignee || ''} onChange={(e) => updateTask({ assignee: e.target.value })} 
          />
        </div>
      </div>

      {/* Time Tracking */}
      <div className="grid grid-cols-2 gap-2">
         <div className="flex flex-col bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
            <span className="text-[10px] text-gray-500 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Estimated Time</span>
            <input 
              type="text" placeholder="e.g. 4h 30m" className="text-xs bg-transparent focus:outline-none text-gray-200"
              value={task.estimatedTime || ''} onChange={(e) => updateTask({ estimatedTime: e.target.value })} 
            />
         </div>
         <div className="flex flex-col bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
            <span className="text-[10px] text-gray-500 mb-1 flex items-center"><RotateCw className="w-3 h-3 mr-1" /> Actual Time</span>
            <input 
              type="text" placeholder="e.g. 5h 00m" className="text-xs bg-transparent focus:outline-none text-gray-200"
              value={task.actualTime || ''} onChange={(e) => updateTask({ actualTime: e.target.value })} 
            />
         </div>
      </div>

      {/* Dates, Recurring & Countdown */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400 w-full">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="w-8">Start</span>
            <input 
              type="date" className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
              value={task.startDate?.split('T')[0] || ''} onChange={(e) => updateTask({ startDate: e.target.value || null })} 
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400 w-full">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="w-8">Due</span>
            <input 
              type="date" className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
              value={task.deadline?.split('T')[0] || ''} onChange={(e) => updateTask({ deadline: e.target.value || null })} 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center text-xs text-gray-400 hover:text-gray-300 cursor-pointer">
            <input type="checkbox" className="mr-1.5 accent-emerald-500" checked={task.isRecurring || false} onChange={(e) => updateTask({ isRecurring: e.target.checked })} />
            Recurring Task
          </label>
          {daysLeft !== null && !isCompleted && (
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${daysLeft < 0 ? 'bg-red-500/20 text-red-400' : daysLeft < 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-500'}`}>
              {daysLeft < 0 ? 'Overdue' : daysLeft === 1 ? 'Due Tomorrow' : `${daysLeft} days left`}
            </div>
          )}
        </div>
      </div>

      {/* Dependencies & Tags */}
      <div className="flex gap-2">
         <div className="flex-1 flex items-center bg-[#2a2b36]/30 rounded-md px-2 py-1.5 border border-[#2a2b36]">
            <Network className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
            <input type="text" placeholder="Depends On..." className="w-full bg-transparent focus:outline-none text-gray-300 text-xs" value={task.dependsOn || ''} onChange={(e) => updateTask({ dependsOn: e.target.value })} />
         </div>
         <div className="flex-1 flex items-center bg-[#2a2b36]/30 rounded-md px-2 py-1.5 border border-[#2a2b36]">
            <Tag className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
            <input type="text" placeholder="Labels..." className="w-full bg-transparent focus:outline-none text-gray-300 text-xs" value={task.labels || ''} onChange={(e) => updateTask({ labels: e.target.value })} />
         </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <input 
            type="range" min="0" max="100" className="w-full accent-emerald-500 h-1"
            value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
          />
        </div>
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="flex items-center justify-center p-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
           <CheckCircle2 className="w-4 h-4 mr-2" />
           <span className="text-xs font-bold tracking-wide">TASK COMPLETED</span>
        </div>
      )}

      {/* Metrics Footer */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Checklist</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Notes</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Links</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Time</span> <span className="font-bold text-gray-200">{task.actualTime || '0h'}</span></div>
      </div>
    </div>
  );
};

export default createTaskNode({
  label: 'Task',
  accentColor: '#10b981',
  icon: <CheckSquare className="w-5 h-5 text-white" />,
  width: 'w-[360px]'
}, TaskBody);
