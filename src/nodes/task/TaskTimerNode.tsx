import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, Coffee, Target, TrendingUp, Link2 } from 'lucide-react';
import { createTaskNode } from '../shared/BaseTaskNode';

const TaskTimerBody = ({ task, updateTask }: any) => {
  const mode = task.mode || 'Pomodoro'; // Pomodoro, Stopwatch, Countdown
  const preset = task.preset || 25;
  const sessions = task.sessions || 0;
  const totalFocus = task.totalFocus || 0; // in minutes
  const linkedTask = task.linkedTask || '';

  const [timeLeft, setTimeLeft] = useState(preset * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Simple timer logic
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Mock completion
      updateTask({ sessions: sessions + 1, totalFocus: totalFocus + preset });
      alert('Session Complete!');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning) setTimeLeft(preset * 60);
  }, [preset, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(preset * 60); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = preset > 0 ? ((preset * 60 - timeLeft) / (preset * 60)) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Linked Task & Mode */}
      <div className="flex gap-2 text-xs">
        <select 
          className="bg-[#2a2b36] border border-[#3f3f46] rounded-md px-2 py-1.5 text-gray-300 focus:outline-none focus:border-emerald-500 font-medium"
          value={mode} onChange={(e) => updateTask({ mode: e.target.value })}
        >
          <option>Pomodoro</option><option>Stopwatch</option><option>Countdown</option>
        </select>
        <div className="flex-1 flex items-center bg-[#2a2b36]/50 rounded-md px-2 py-1.5 border border-[#2a2b36]">
          <Link2 className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
          <input 
            type="text" placeholder="Linked Task..." className="w-full bg-transparent focus:outline-none text-gray-300"
            value={linkedTask} onChange={(e) => updateTask({ linkedTask: e.target.value })} 
          />
        </div>
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center justify-center p-4">
         <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background ring */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2b36" strokeWidth="6" />
               <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} className="transition-all duration-1000" />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold font-mono tracking-wider text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mt-1">Focus Time</span>
            </div>
         </div>

         {/* Controls */}
         <div className="flex items-center space-x-4 mt-6">
            <button onClick={toggleTimer} className={`p-4 rounded-full flex items-center justify-center transition-all shadow-lg ${isRunning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'}`}>
               {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>
            <button onClick={resetTimer} className="p-3 bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded-full transition-colors">
               <RotateCcw className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Presets */}
      <div className="flex justify-center gap-2">
         {[15, 25, 45, 60].map(p => (
           <button 
             key={p} onClick={() => { updateTask({ preset: p }); resetTimer(); }}
             className={`text-[10px] px-3 py-1 rounded-full border transition-colors font-medium ${preset === p ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-[#13141c] text-gray-500 border-[#2a2b36] hover:border-gray-500'}`}
           >
             {p}m
           </button>
         ))}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 bg-[#13141c] p-2 rounded-lg border border-[#2a2b36]">
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1.5 rounded">
          <Target className="w-3.5 h-3.5 mb-1 text-blue-400" />
          <span className="font-bold text-gray-200">{sessions} Sessions</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1.5 rounded">
          <TrendingUp className="w-3.5 h-3.5 mb-1 text-emerald-400" />
          <span className="font-bold text-gray-200">{totalFocus}m Total</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#1a1b23] py-1.5 rounded cursor-pointer hover:bg-[#2a2b36] transition-colors">
          <Volume2 className="w-3.5 h-3.5 mb-1 text-purple-400" />
          <span className="text-gray-400">Alarm On</span>
        </div>
      </div>
    </div>
  );
};

export default createTaskNode({
  label: 'Task Timer',
  accentColor: '#10b981',
  icon: <Timer className="w-4 h-4 text-white" />,
  width: 'w-[320px]'
}, TaskTimerBody);
