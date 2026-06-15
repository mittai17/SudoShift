import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { NodeData } from '../../types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import NodeWrapper from './NodeWrapper';

export default function CalendarNode({ data }: { data: NodeData }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });
  
  // Pad beginning of month
  const startDay = start.getDay();
  const paddingDays = Array(startDay).fill(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <NodeWrapper>
      <div className="flex flex-col w-[17rem] rounded-xl shadow-md bg-[#13141c] border border-[#2a2b36]  transition-shadow hover:shadow-lg nodrag">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      <div className="bg-[#0ea5e9] rounded-t-xl px-3 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing w-full font-semibold text-sm">
            <CalendarIcon className="w-4 h-4 opacity-80 pointer-events-none" />
            <span className="pointer-events-none select-none">{format(currentDate, 'MMM yyyy')}</span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button onClick={prevMonth} className="p-1 hover:bg-sky-500 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={today} className="text-[10px] uppercase font-bold tracking-wider hover:bg-sky-500 px-1.5 py-1 rounded transition-colors">Today</button>
          <button onClick={nextMonth} className="p-1 hover:bg-sky-500 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="p-3 bg-[#13141c] cursor-default">
         <div className="grid grid-cols-7 gap-1 text-center mb-2">
             {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                 <div key={day} className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">{day}</div>
             ))}
         </div>
         <div className="grid grid-cols-7 gap-1 text-center">
             {paddingDays.map((_, i) => <div key={`pad-${i}`} className="aspect-square" />)}
             {days.map((day, i) => (
                 <div key={i} className="aspect-square flex items-center justify-center">
                     <button className={`w-full h-full flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                         isToday(day) ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-200 ring-offset-1 ring-offset-white' : 
                         'text-gray-300 hover:bg-sky-50 hover:text-sky-600'
                     }`}>
                         {format(day, 'd')}
                     </button>
                 </div>
             ))}
         </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#0ea5e9] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
