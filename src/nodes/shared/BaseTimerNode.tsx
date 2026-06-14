import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import NodeWrapper from './NodeWrapper';

interface TimerConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

export function createTimerNode(config: TimerConfig) {
  const TimerComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const defaultMinutes = parseInt(data.task?.description || '25', 10);
    const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
    const [remaining, setRemaining] = useState(defaultMinutes * 60);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      if (running) {
        intervalRef.current = setInterval(() => {
          setRemaining((r) => {
            if (r <= 1) { clearInterval(intervalRef.current!); setRunning(false); return 0; }
            return r - 1;
          });
        }, 1000);
      }
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running]);

    const reset = () => { setRunning(false); setRemaining(totalSeconds); };
    const pct = (remaining / totalSeconds) * 100;
    const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const secs = String(remaining % 60).padStart(2, '0');

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}>
        <div className="flex flex-col w-56 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-4 flex flex-col items-center space-y-3">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
                  stroke={config.accentColor} strokeDasharray={`${pct} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800 tabular-nums">
                {mins}:{secs}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setRunning(!running)}
                className="p-2 rounded-full text-white transition-colors" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={reset} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  TimerComponent.displayName = `TimerNode_${config.label.replace(/\s/g, '')}`;
  return TimerComponent;
}
