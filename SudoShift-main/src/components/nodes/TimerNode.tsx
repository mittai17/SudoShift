import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Timer, Play, Pause, RefreshCw } from 'lucide-react';
import { NodeData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function TimerNode({ data }: { data: NodeData }) {
  const { task } = data;
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'short_break' | 'long_break'>('work');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const getInitialTime = (m: string) => {
    if (m === 'work') return 25 * 60;
    if (m === 'short_break') return 5 * 60;
    return 15 * 60;
  }

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getInitialTime(mode));
  };

  const switchMode = (newMode: 'work' | 'short_break' | 'long_break') => {
      setMode(newMode);
      setIsRunning(false);
      setTimeLeft(getInitialTime(newMode));
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 100 - (timeLeft / getInitialTime(mode)) * 100;

  return (
    <NodeWrapper>
      <div className="flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200  transition-shadow hover:shadow-lg nodrag">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#f43f5e] rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white justify-between">
        <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing w-full">
            <Timer className="w-4 h-4 opacity-80 pointer-events-none" />
            <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm w-full truncate select-none pointer-events-none">
            Pomodoro Timer
            </h3>
        </div>
      </div>
      
      <div className="p-4 bg-white flex flex-col items-center space-y-4 cursor-default">
         <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full justify-center">
             <button onClick={() => switchMode('work')} className={`flex-1 py-1 text-[10px] sm:text-xs rounded shadow-sm transition-colors ${mode === 'work' ? 'bg-white font-semibold text-rose-500' : 'text-gray-500 hover:text-gray-700'}`}>Work</button>
             <button onClick={() => switchMode('short_break')} className={`flex-1 py-1 text-[10px] sm:text-xs rounded shadow-sm transition-colors ${mode === 'short_break' ? 'bg-white font-semibold text-rose-500' : 'text-gray-500 hover:text-gray-700'}`}>Short</button>
             <button onClick={() => switchMode('long_break')} className={`flex-1 py-1 text-[10px] sm:text-xs rounded shadow-sm transition-colors ${mode === 'long_break' ? 'bg-white font-semibold text-rose-500' : 'text-gray-500 hover:text-gray-700'}`}>Long</button>
         </div>
         
         <div className="relative flex items-center justify-center w-32 h-32">
             <svg className="w-full h-full -rotate-90">
                 <circle cx="64" cy="64" r="60" className="stroke-rose-100" strokeWidth="6" fill="transparent" />
                 <circle cx="64" cy="64" r="60" className="stroke-rose-500 transition-all duration-1000 ease-linear" strokeWidth="6" fill="transparent" strokeDasharray="377" strokeDashoffset={377 - (377 * progress) / 100} strokeLinecap="round" />
             </svg>
             <div className="absolute text-3xl font-mono text-gray-800 font-bold tracking-tighter">
                 {formatTime(timeLeft)}
             </div>
         </div>

         <div className="flex items-center space-x-4">
             <button onClick={toggleTimer} className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 rounded-full transition-colors">
                 {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
             </button>
             <button onClick={resetTimer} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                 <RefreshCw className="w-5 h-5" />
             </button>
         </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#f43f5e] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
