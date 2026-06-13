import React from 'react';
import { Flame, Target, Calendar, Clock, Trophy, TrendingUp, CheckCircle2 } from 'lucide-react';
import { createHabitNode } from '../shared/BaseHabitNode';

const HabitBody = ({ task, updateTask }: any) => {
  const type = task.habitType || 'Health';
  const target = task.goalTarget || '30 Days';
  const frequency = task.frequency || 'Daily';
  const status = task.status || 'Active';
  const difficulty = task.difficulty || 'Medium';

  const currentStreak = task.currentStreak || 0;
  const bestStreak = task.bestStreak || 0;
  const successRate = task.successRate || 0;
  const progress = task.progress || 0;
  const totalCompletions = task.totalCompletions || 0;
  const score = task.score || 0;

  return (
    <div className="space-y-3">
      {/* Settings Row 1 */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-orange-500 flex-1"
          value={type} onChange={(e) => updateTask({ habitType: e.target.value })}
        >
          {['Health', 'Learning', 'Productivity', 'Finance', 'Personal'].map(t => <option key={t}>{t}</option>)}
        </select>
        
        <select 
          className={`text-xs border rounded-md px-2 py-1.5 focus:outline-none font-medium flex-1
            ${status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              status === 'Broken' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              status === 'Paused' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
              'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}
          value={status} onChange={(e) => updateTask({ status: e.target.value })}
        >
          {['Active', 'Paused', 'Completed', 'Broken'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Settings Row 2 */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-orange-500 flex-1"
          value={difficulty} onChange={(e) => updateTask({ difficulty: e.target.value })}
        >
          {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-orange-500 flex-1"
          value={frequency} onChange={(e) => updateTask({ frequency: e.target.value })}
        >
          {['Daily', 'Weekly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {/* Target & Reminder */}
      <div className="space-y-2 bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400 w-full">
            <Target className="w-3.5 h-3.5 text-orange-500" />
            <span className="w-12">Target</span>
            <select 
               className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-orange-500 text-gray-300"
               value={target} onChange={(e) => updateTask({ goalTarget: e.target.value })}
            >
               <option>30 Days</option><option>100 Days</option><option>Custom</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-400 w-full">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="w-12">Reminder</span>
            <input 
              type="time" className="flex-1 bg-[#13141c] border border-[#2a2b36] rounded px-2 py-1 focus:outline-none focus:border-orange-500 text-gray-300"
              value={task.reminderTime || ''} onChange={(e) => updateTask({ reminderTime: e.target.value })} 
            />
          </div>
        </div>
      </div>

      {/* Metrics Row 1: Streaks */}
      <div className="flex gap-2">
         <div className="flex-1 flex flex-col bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36] items-center justify-center">
            <span className="text-[10px] text-gray-500 mb-1 flex items-center"><Flame className="w-3 h-3 mr-1 text-orange-500" /> Current Streak</span>
            <input 
              type="number" className="text-xl font-bold font-mono text-center bg-transparent focus:outline-none text-orange-400 w-full"
              value={currentStreak} onChange={(e) => updateTask({ currentStreak: parseInt(e.target.value) || 0 })} 
            />
         </div>
         <div className="flex-1 flex flex-col bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36] items-center justify-center">
            <span className="text-[10px] text-gray-500 mb-1 flex items-center"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Best Streak</span>
            <input 
              type="number" className="text-xl font-bold font-mono text-center bg-transparent focus:outline-none text-yellow-400 w-full"
              value={bestStreak} onChange={(e) => updateTask({ bestStreak: parseInt(e.target.value) || 0 })} 
            />
         </div>
      </div>

      {/* Metrics Row 2: Success Rate & Score */}
      <div className="flex gap-2">
         <div className="flex-1 flex flex-col bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36] items-center justify-center">
            <span className="text-[10px] text-gray-500 mb-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1 text-emerald-500" /> Success Rate</span>
            <div className="flex items-end">
               <input 
                 type="number" max="100" min="0" className="text-xl font-bold font-mono text-center bg-transparent focus:outline-none text-emerald-400 w-12"
                 value={successRate} onChange={(e) => updateTask({ successRate: parseInt(e.target.value) || 0 })} 
               /><span className="text-emerald-400 text-sm font-bold pb-0.5">%</span>
            </div>
         </div>
         <div className="flex-1 flex flex-col bg-[#2a2b36]/30 p-2 rounded-xl border border-[#2a2b36] items-center justify-center">
            <span className="text-[10px] text-gray-500 mb-1 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-blue-500" /> Total Done</span>
            <input 
              type="number" className="text-xl font-bold font-mono text-center bg-transparent focus:outline-none text-blue-400 w-full"
              value={totalCompletions} onChange={(e) => updateTask({ totalCompletions: parseInt(e.target.value) || 0 })} 
            />
         </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Overall Progress</span><span>{progress}%</span>
          </div>
          <input 
            type="range" min="0" max="100" className="w-full accent-orange-500 h-1"
            value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
          />
        </div>
        <div className="flex flex-col items-center">
           <span className="text-[10px] text-gray-500 font-bold uppercase">Score</span>
           <span className="text-sm font-bold text-orange-500">{score}</span>
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="grid grid-cols-4 gap-1 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Streak</span> <span className="font-bold text-gray-200">{currentStreak}</span></div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Rate</span> <span className="font-bold text-gray-200">{successRate}%</span></div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Total</span> <span className="font-bold text-gray-200">{totalCompletions}</span></div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1 rounded"><span>Done</span> <span className="font-bold text-gray-200">{progress}%</span></div>
      </div>
    </div>
  );
};

export default createHabitNode({
  label: 'Habit',
  accentColor: '#f97316',
  icon: <Flame className="w-5 h-5 text-white" />,
  width: 'w-[360px]'
}, HabitBody);
