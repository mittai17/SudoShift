import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings2, Bell, RefreshCw, Plus } from 'lucide-react';
import { createHabitNode } from '../shared/BaseHabitNode';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const HabitCalendarBody = ({ task, updateTask }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const rule = task.recurringRule || 'Daily';
  
  // Mock habit data mapping day of month -> status
  // 0: pending/none, 1: completed, -1: missed
  const habitData = task.habitData || {
    "5": 1, "6": 1, "7": 1, "8": -1, "9": 1, "10": 1, "11": 1, "12": 1, "13": 0
  };

  const updateHabitData = (day: number) => {
    const current = habitData[day.toString()] || 0;
    const nextStatus = current === 0 ? 1 : current === 1 ? -1 : 0;
    updateTask({ habitData: { ...habitData, [day.toString()]: nextStatus } });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Create calendar grid
  const grid = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let i = 1; i <= daysInMonth; i++) grid.push(i);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between text-xs mb-2">
        <select 
          className="bg-[#2a2b36]/50 border border-[#2a2b36] rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-orange-500"
          value={rule} onChange={(e) => updateTask({ recurringRule: e.target.value })}
        >
          {['Daily', 'Weekdays', 'Weekends', 'Weekly', 'Monthly'].map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="flex gap-1.5">
          <button className="p-1 bg-[#2a2b36] hover:bg-[#3f3f46] text-gray-300 rounded transition-colors" title="Schedule Settings"><Settings2 className="w-3.5 h-3.5" /></button>
          <button className="p-1 bg-[#2a2b36] hover:bg-[#3f3f46] text-blue-400 rounded transition-colors" title="Reminders"><Bell className="w-3.5 h-3.5" /></button>
          <button className="p-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 rounded transition-colors" title="Sync Calendar"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between bg-[#1a1b23] border border-[#2a2b36] rounded-t-xl p-2">
        <button onClick={prevMonth} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-bold text-gray-200">{monthName}</span>
        <button onClick={nextMonth} className="p-1 hover:bg-[#2a2b36] rounded text-gray-400"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#13141c] border-x border-b border-[#2a2b36] rounded-b-xl p-3 -mt-3">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
            const status = habitData[day.toString()] || 0;
            return (
              <div 
                key={day} 
                onClick={() => updateHabitData(day)}
                className={`aspect-square flex items-center justify-center text-xs rounded-lg cursor-pointer transition-colors border
                  ${status === 1 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold' : 
                    status === -1 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                    day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 font-bold ring-1 ring-blue-500' :
                    'bg-[#2a2b36]/30 text-gray-400 border-transparent hover:border-[#3f3f46]'}`}
                title={status === 1 ? 'Completed' : status === -1 ? 'Missed' : 'Pending'}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center justify-between text-[10px] bg-[#1a1b23] border border-[#2a2b36] rounded-lg p-2">
            <div className="flex gap-3">
               <span className="flex items-center"><div className="w-2 h-2 rounded bg-emerald-500 mr-1" /> Done</span>
               <span className="flex items-center"><div className="w-2 h-2 rounded bg-red-500 mr-1" /> Missed</span>
               <span className="flex items-center"><div className="w-2 h-2 rounded bg-[#2a2b36] mr-1" /> Pending</span>
            </div>
         </div>
         <button className="w-full flex items-center justify-center bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 rounded-lg p-1.5 transition-colors text-xs font-medium">
            <Plus className="w-3.5 h-3.5 mr-1" /> Auto-Schedule Future Sessions
         </button>
      </div>
    </div>
  );
};

export default createHabitNode({
  label: 'Habit Schedule Calendar',
  accentColor: '#f97316',
  icon: <CalendarIcon className="w-4 h-4 text-white" />,
  width: 'w-[320px]'
}, HabitCalendarBody);
