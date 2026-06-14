import React, { useEffect } from 'react';
import { Flag, Calendar, Target, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import { createMilestoneNode } from '../shared/BaseMilestoneNode';

const MilestoneBody = ({ task, updateTask }: any) => {
  const type = task.milestoneType || 'Achievement';
  const status = task.status || 'Upcoming';
  const priority = task.priority || 'Medium';
  const progress = task.progress || 0;
  const isCompleted = status === 'Completed';
  
  const daysLeft = task.deadline ? Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;

  useEffect(() => {
    if (progress === 100 && status !== 'Completed') {
      updateTask({ status: 'Completed', completionDate: new Date().toISOString() });
    }
  }, [progress, status]);

  return (
    <div className="space-y-3">
      {/* Type, Status & Priority */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-rose-500 flex-1"
          value={type} onChange={(e) => updateTask({ milestoneType: e.target.value })}
        >
          {['Achievement', 'Deadline', 'Launch', 'Certification', 'Goal Completion', 'Release'].map(t => <option key={t}>{t}</option>)}
        </select>
        
        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium flex-1
            ${status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              status === 'Missed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-[#2a2b36] text-gray-300 border-[#3f3f46]'}`}
          value={status} onChange={(e) => updateTask({ status: e.target.value })}
        >
          {['Upcoming', 'In Progress', 'Completed', 'Missed'].map(s => <option key={s}>{s}</option>)}
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
      </div>

      {/* Success Criteria */}
      <div className="bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
        <div className="flex items-center text-[10px] text-gray-500 mb-1 font-bold tracking-wider uppercase"><Target className="w-3 h-3 mr-1" /> Success Criteria</div>
        <textarea
          className="w-full text-xs text-gray-300 bg-transparent border-none p-0 focus:outline-none resize-none h-10"
          placeholder="What defines success for this milestone?"
          value={task.successCriteria || ''} onChange={(e) => updateTask({ successCriteria: e.target.value })}
        />
      </div>

      {/* Dates & Countdown */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span className="w-8">Target</span>
            <input 
              type="date" className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-rose-500"
              value={task.deadline?.split('T')[0] || ''} onChange={(e) => updateTask({ deadline: e.target.value || null })} 
            />
          </div>
          {daysLeft !== null && !isCompleted && (
            <div className={`text-[10px] font-bold px-2 py-1 rounded ml-2 shrink-0 ${daysLeft < 0 ? 'bg-red-500/20 text-red-400' : daysLeft < 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-rose-500/20 text-rose-500'}`}>
              {daysLeft < 0 ? 'Overdue' : daysLeft === 1 ? 'Due Tomorrow' : `${daysLeft} days left`}
            </div>
          )}
        </div>
        {isCompleted && task.completionDate && (
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 rounded px-2 py-1 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed on: {new Date(task.completionDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Progress</span><span>{progress}%</span>
          </div>
          <input 
            type="range" min="0" max="100" className="w-full accent-rose-500 h-1"
            value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
          />
        </div>
      </div>

      {/* Achievement Badge */}
      {isCompleted && (
        <div className="flex items-center justify-center p-2 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-lg text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
           <Trophy className="w-4 h-4 mr-2" />
           <span className="text-xs font-bold tracking-wide">ACHIEVEMENT UNLOCKED</span>
        </div>
      )}

      {/* Metrics Footer */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Linked Goals</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Linked Projects</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Evidence</span> <span className="font-bold text-gray-200">0</span></div>
        <div className="flex justify-between bg-[#1a1b23] px-2 py-1 rounded"><span>Notes</span> <span className="font-bold text-gray-200">0</span></div>
      </div>
    </div>
  );
};

export default createMilestoneNode({
  label: 'Milestone',
  accentColor: '#f43f5e',
  icon: <Flag className="w-5 h-5 text-white" />,
  width: 'w-[360px]'
}, MilestoneBody);
