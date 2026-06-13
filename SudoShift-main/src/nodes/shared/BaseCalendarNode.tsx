import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import NodeWrapper from './NodeWrapper';

interface CalendarConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function createCalendarNode(config: CalendarConfig) {
  const CalendarComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    return (
      <NodeWrapper data={data} selected={selected}>
        <div className="flex flex-col w-64 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={prev} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft className="w-3.5 h-3.5 text-gray-600" /></button>
              <span className="text-xs font-semibold text-gray-700">{MONTHS[month]} {year}</span>
              <button onClick={next} className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight className="w-3.5 h-3.5 text-gray-600" /></button>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {DAYS.map((d) => <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>)}
              {cells.map((day, i) => (
                <button key={i} onClick={() => day && setSelectedDay(day)}
                  disabled={!day}
                  className={`text-center text-xs py-1 rounded transition-colors ${!day ? '' : day === selectedDay && month === today.getMonth() && year === today.getFullYear() ? 'text-white font-bold' : day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'font-bold text-gray-800 bg-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={day === selectedDay ? { backgroundColor: `var(--node-color, ${config.accentColor})` } : {}}>
                  {day || ''}
                </button>
              ))}
            </div>
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  CalendarComponent.displayName = `CalendarNode_${config.label.replace(/\s/g, '')}`;
  return CalendarComponent;
}
