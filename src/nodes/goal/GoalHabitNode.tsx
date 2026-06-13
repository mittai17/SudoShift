import React from 'react';
import { Flame, Activity, Check } from 'lucide-react';
import { createGoalNode } from '../shared/BaseGoalNode';

const GoalHabitBody = ({ task, updateTask }: any) => {
  const frequency = task.frequency || 'Daily';
  const todayStatus = task.todayStatus || 'Pending';
  const streak = task.streak || 0;
  const bestStreak = task.bestStreak || 0;
  const progress = task.progress || 0;
  
  // Dummy heatmap array
  const heatmap = task.heatmap || Array(14).fill(0).map(() => Math.random() > 0.5);

  const toggleToday = () => {
    const newStatus = todayStatus === 'Done' ? 'Pending' : 'Done';
    const newStreak = newStatus === 'Done' ? streak + 1 : Math.max(0, streak - 1);
    updateTask({ 
      todayStatus: newStatus, 
      streak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak)
    });
  };

  return (
    <div className="space-y-3">
      {/* Frequency & Today's Status */}
      <div className="flex items-center gap-2">
        <select 
          className="text-xs bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-[#a855f7] flex-1"
          value={frequency}
          onChange={(e) => updateTask({ frequency: e.target.value })}
        >
          {['Daily', 'Weekly', 'Monthly'].map(f => <option key={f}>{f}</option>)}
        </select>
        
        <button 
          onClick={toggleToday}
          className={`flex items-center text-xs px-3 py-1.5 rounded-md border font-medium transition-colors
            ${todayStatus === 'Done' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#2a2b36] text-gray-400 border-[#3f3f46] hover:bg-[#3f3f46]'}`}
        >
          {todayStatus === 'Done' ? <Check className="w-3.5 h-3.5 mr-1" /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-500 mr-1" />}
          {todayStatus === 'Done' ? "Done Today" : "Pending"}
        </button>
      </div>

      {/* Streaks & Progress */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center bg-[#2a2b36]/40 p-2 rounded-lg border border-[#2a2b36]">
          <span className="text-[10px] text-gray-500 uppercase">Streak</span>
          <div className="flex items-center text-[#a855f7] font-bold text-lg"><Flame className="w-4 h-4 mr-0.5" />{streak}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#2a2b36]/40 p-2 rounded-lg border border-[#2a2b36]">
          <span className="text-[10px] text-gray-500 uppercase">Best</span>
          <div className="text-gray-300 font-bold text-lg">{bestStreak}</div>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#2a2b36]/40 p-2 rounded-lg border border-[#2a2b36]">
          <span className="text-[10px] text-gray-500 uppercase">Comp.</span>
          <div className="text-emerald-400 font-bold text-lg">{progress}%</div>
        </div>
      </div>
      
      <input 
          type="range" min="0" max="100" 
          className="w-full accent-[#a855f7] h-1"
          value={progress} onChange={(e) => updateTask({ progress: parseInt(e.target.value) })} 
      />

      {/* Heatmap Preview */}
      <div className="bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="text-[10px] text-gray-500 mb-1.5 uppercase font-medium tracking-wider">Last 14 Days</div>
        <div className="flex items-center justify-between gap-1">
          {heatmap.map((done: boolean, i: number) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-sm ${done ? 'bg-[#a855f7]' : 'bg-[#2a2b36]'} shadow-sm`} 
              title={done ? "Completed" : "Missed"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default createGoalNode({
  label: 'Goal Habit',
  accentColor: '#a855f7',
  icon: <Activity className="w-4 h-4 text-white" />
}, GoalHabitBody);
