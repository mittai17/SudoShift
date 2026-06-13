import React from 'react';
import { Table as TableIcon, Plus, Download, FileText, Check, X, RefreshCw } from 'lucide-react';
import { createHabitNode } from '../shared/BaseHabitNode';

interface HabitRow { id: string; name: string; history: ('completed'|'missed'|'pending')[]; streak: number; rate: number; }

const HabitTableBody = ({ task, updateTask }: any) => {
  // Generate last 7 days
  const today = new Date();
  const dates = Array.from({length: 7}).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  });

  const rows: HabitRow[] = task.rows || [
    { id: '1', name: 'Morning Workout', history: ['completed', 'completed', 'missed', 'completed', 'completed', 'pending', 'pending'], streak: 2, rate: 80 }
  ];

  const updateRows = (newRows: HabitRow[]) => updateTask({ rows: newRows });

  const addRow = () => updateRows([...rows, { id: Date.now().toString(), name: 'New Habit', history: Array(7).fill('pending'), streak: 0, rate: 0 }]);
  const updateRowName = (id: string, name: string) => updateRows(rows.map(r => r.id === id ? { ...r, name } : r));
  const removeRow = (id: string) => updateRows(rows.filter(r => r.id !== id));
  
  const toggleHistory = (rowId: string, dayIndex: number) => {
    updateRows(rows.map(r => {
      if (r.id !== rowId) return r;
      const newHistory = [...r.history];
      const current = newHistory[dayIndex];
      newHistory[dayIndex] = current === 'pending' ? 'completed' : current === 'completed' ? 'missed' : 'pending';
      return { ...r, history: newHistory };
    }));
  };

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="flex items-center bg-orange-500/20 text-orange-500 px-2 py-1 rounded hover:bg-orange-500/30 font-medium transition-colors">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Habit
          </button>
          <button className="flex items-center text-gray-400 hover:text-white transition-colors" title="Sync with Habit Nodes">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Sync
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </button>
          <button className="flex items-center text-gray-400 hover:text-white transition-colors">
            <FileText className="w-3.5 h-3.5 mr-1" /> PDF
          </button>
        </div>
      </div>

      {/* Habits Table */}
      <div className="overflow-x-auto custom-scrollbar border border-[#2a2b36] rounded-lg bg-[#13141c]">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#1a1b23] border-b border-[#2a2b36] text-gray-400">
              <th className="p-2 font-medium min-w-[120px] border-r border-[#2a2b36]">Habit</th>
              {dates.map((d, i) => (
                <th key={i} className="p-2 font-medium text-center border-r border-[#2a2b36]">{d}</th>
              ))}
              <th className="p-2 font-medium text-center border-r border-[#2a2b36] w-12" title="Current Streak">🔥</th>
              <th className="p-2 font-medium text-center border-r border-[#2a2b36] w-12" title="Success Rate">%</th>
              <th className="p-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-[#2a2b36]/50 hover:bg-[#1a1b23] transition-colors">
                <td className="p-1.5 border-r border-[#2a2b36]">
                  <input type="text" className="w-full bg-transparent focus:outline-none text-gray-200 text-xs" value={r.name} onChange={(e) => updateRowName(r.id, e.target.value)} />
                </td>
                {r.history.map((status, i) => (
                  <td key={i} className="p-1 border-r border-[#2a2b36] text-center" onClick={() => toggleHistory(r.id, i)}>
                    <div className={`w-5 h-5 mx-auto rounded flex items-center justify-center cursor-pointer transition-colors
                      ${status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        status === 'missed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                        'bg-[#2a2b36] text-gray-600 border border-[#3f3f46]'}`}
                    >
                      {status === 'completed' && <Check className="w-3 h-3" />}
                      {status === 'missed' && <X className="w-3 h-3" />}
                    </div>
                  </td>
                ))}
                <td className="p-2 border-r border-[#2a2b36] text-center font-bold text-orange-400">{r.streak}</td>
                <td className="p-2 border-r border-[#2a2b36] text-center font-bold text-blue-400">{r.rate}%</td>
                <td className="p-1 text-center">
                  <button onClick={() => removeRow(r.id)} className="text-gray-500 hover:text-red-400">&times;</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={11} className="p-4 text-center text-gray-500 italic">No habits tracking yet. Add one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500 px-1">
        <span>Click cells to toggle: Pending → Completed → Missed</span>
        <span>Showing Last 7 Days</span>
      </div>
    </div>
  );
};

export default createHabitNode({
  label: 'Habit Tracker',
  accentColor: '#f97316',
  icon: <TableIcon className="w-4 h-4 text-white" />,
  width: 'w-[640px]' // Needs to be wider for the table
}, HabitTableBody);
