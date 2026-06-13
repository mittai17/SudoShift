import React from 'react';
import { Table as TableIcon, Plus, Download, FileText } from 'lucide-react';
import { createEventNode } from '../shared/BaseEventNode';

interface AgendaRow { id: string; time: string; topic: string; owner: string; status: string; notes: string; }

const EventTableBody = ({ task, updateTask }: any) => {
  const rows: AgendaRow[] = task.rows || [];

  const updateRows = (newRows: AgendaRow[]) => updateTask({ rows: newRows });

  const addRow = () => updateRows([...rows, { id: Date.now().toString(), time: '', topic: '', owner: '', status: 'Pending', notes: '' }]);
  const updateRow = (id: string, updates: Partial<AgendaRow>) => updateRows(rows.map(r => r.id === id ? { ...r, ...updates } : r));
  const removeRow = (id: string) => updateRows(rows.filter(r => r.id !== id));

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between text-xs mb-2">
        <button onClick={addRow} className="flex items-center bg-amber-500/20 text-amber-500 px-2 py-1 rounded hover:bg-amber-500/30">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center text-gray-400 hover:text-white" onClick={() => alert('Export CSV')}>
            <Download className="w-3.5 h-3.5 mr-1" /> CSV
          </button>
          <button className="flex items-center text-gray-400 hover:text-white" onClick={() => alert('Export PDF')}>
            <FileText className="w-3.5 h-3.5 mr-1" /> PDF
          </button>
        </div>
      </div>

      {/* Agenda Table */}
      <div className="overflow-x-auto custom-scrollbar border border-[#2a2b36] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1a1b23] border-b border-[#2a2b36] text-gray-400">
              <th className="p-2 w-20 font-medium">Time</th>
              <th className="p-2 w-32 font-medium">Topic</th>
              <th className="p-2 w-24 font-medium">Owner</th>
              <th className="p-2 w-24 font-medium">Status</th>
              <th className="p-2 font-medium">Notes</th>
              <th className="p-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-[#2a2b36]/50 bg-[#13141c] hover:bg-[#1a1b23] transition-colors">
                <td className="p-1"><input type="time" className="w-full bg-transparent focus:outline-none text-gray-300" value={r.time} onChange={(e) => updateRow(r.id, { time: e.target.value })} /></td>
                <td className="p-1"><input type="text" placeholder="Topic..." className="w-full bg-transparent focus:outline-none text-gray-300" value={r.topic} onChange={(e) => updateRow(r.id, { topic: e.target.value })} /></td>
                <td className="p-1"><input type="text" placeholder="@owner" className="w-full bg-transparent focus:outline-none text-gray-300" value={r.owner} onChange={(e) => updateRow(r.id, { owner: e.target.value })} /></td>
                <td className="p-1">
                  <select className="w-full bg-transparent focus:outline-none text-gray-300" value={r.status} onChange={(e) => updateRow(r.id, { status: e.target.value })}>
                    <option>Pending</option><option>In Progress</option><option>Done</option>
                  </select>
                </td>
                <td className="p-1"><input type="text" placeholder="Notes..." className="w-full bg-transparent focus:outline-none text-gray-300" value={r.notes} onChange={(e) => updateRow(r.id, { notes: e.target.value })} /></td>
                <td className="p-1 text-center"><button onClick={() => removeRow(r.id)} className="text-gray-500 hover:text-red-400">&times;</button></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500 italic">No agenda items yet. Click "Add Row".</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default createEventNode({
  label: 'Event Agenda',
  accentColor: '#f59e0b',
  icon: <TableIcon className="w-4 h-4 text-white" />,
  width: 'w-[480px]'
}, EventTableBody);
