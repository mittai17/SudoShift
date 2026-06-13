import React, { useState } from 'react';
import { Table as TableIcon, Plus, Download, Upload, FileText, Search, Filter, ArrowUpDown, FunctionSquare, Calculator, Sparkles, Sigma } from 'lucide-react';
import { createNoteNode } from '../shared/BaseNoteNode';

interface Col { id: string; name: string; type: 'Text'|'Number'|'Date'|'Checkbox'; }
interface Row { id: string; cells: Record<string, any>; }

const NoteTableBody = ({ task, updateTask }: any) => {
  const defaultCols: Col[] = [
    { id: 'c1', name: 'Item', type: 'Text' },
    { id: 'c2', name: 'Cost', type: 'Number' },
    { id: 'c3', name: 'Paid', type: 'Checkbox' }
  ];
  const defaultRows: Row[] = [
    { id: 'r1', cells: { c1: 'Server Hosting', c2: 120, c3: true } },
    { id: 'r2', cells: { c1: 'Domain Name', c2: 15, c3: false } }
  ];

  const cols: Col[] = task.cols || defaultCols;
  const rows: Row[] = task.rows || defaultRows;

  const addRow = () => updateTask({ rows: [...rows, { id: Date.now().toString(), cells: {} }] });
  const addCol = () => updateTask({ cols: [...cols, { id: Date.now().toString(), name: 'New Col', type: 'Text' }] });

  return (
    <div className="space-y-3">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1">
          <button onClick={addCol} className="flex items-center bg-violet-500/10 text-violet-400 px-2 py-1 rounded hover:bg-violet-500/20 font-medium transition-colors border border-violet-500/20">
            <Plus className="w-3 h-3 mr-1" /> Col
          </button>
          <button onClick={addRow} className="flex items-center bg-violet-500/10 text-violet-400 px-2 py-1 rounded hover:bg-violet-500/20 font-medium transition-colors border border-violet-500/20">
            <Plus className="w-3 h-3 mr-1" /> Row
          </button>
          <div className="w-px h-4 bg-[#3f3f46] mx-1" />
          <button className="p-1 text-gray-400 hover:text-white rounded" title="Sort"><ArrowUpDown className="w-3.5 h-3.5" /></button>
          <button className="p-1 text-gray-400 hover:text-white rounded" title="Filter"><Filter className="w-3.5 h-3.5" /></button>
          <button className="p-1 text-gray-400 hover:text-white rounded" title="Search"><Search className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-white rounded" title="Import CSV"><Upload className="w-3.5 h-3.5" /></button>
          <button className="p-1 text-gray-400 hover:text-white rounded" title="Export CSV"><Download className="w-3.5 h-3.5" /></button>
          <button className="p-1 text-gray-400 hover:text-white rounded" title="Export PDF"><FileText className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto custom-scrollbar border border-[#2a2b36] rounded-lg bg-[#13141c]">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#1a1b23] border-b border-[#2a2b36] text-gray-400">
              <th className="p-1 border-r border-[#2a2b36] w-6 text-center text-gray-600 font-mono">#</th>
              {cols.map(c => (
                <th key={c.id} className="p-1.5 font-medium border-r border-[#2a2b36] min-w-[80px]">
                   <div className="flex items-center justify-between">
                      <span className="text-gray-300">{c.name}</span>
                      <span className="text-[8px] text-violet-500/70 uppercase">{c.type}</span>
                   </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className="border-b border-[#2a2b36]/50 hover:bg-[#1a1b23] transition-colors focus-within:bg-[#1a1b23]">
                <td className="p-1 border-r border-[#2a2b36] text-center text-gray-600 font-mono">{idx + 1}</td>
                {cols.map(c => (
                  <td key={c.id} className="p-1 border-r border-[#2a2b36]">
                    {c.type === 'Checkbox' ? (
                       <div className="flex justify-center"><input type="checkbox" className="accent-violet-500" checked={r.cells[c.id] || false} readOnly /></div>
                    ) : c.type === 'Number' ? (
                       <input type="text" className="w-full bg-transparent focus:outline-none text-blue-400 text-xs text-right font-mono" value={r.cells[c.id] || ''} readOnly />
                    ) : (
                       <input type="text" className="w-full bg-transparent focus:outline-none text-gray-300 text-xs" value={r.cells[c.id] || ''} readOnly />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* Footer Totals Row Mock */}
          <tfoot>
             <tr className="bg-[#1a1b23] border-t-2 border-[#2a2b36]">
                <td className="p-1 border-r border-[#2a2b36] text-center"><Sigma className="w-3 h-3 text-violet-400 mx-auto" /></td>
                {cols.map((c, i) => (
                   <td key={c.id} className="p-1.5 border-r border-[#2a2b36] text-right font-mono text-blue-400 font-bold">
                      {c.type === 'Number' && i === 1 ? '135' : ''}
                   </td>
                ))}
             </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-[#13141c] hover:bg-[#1a1b23] text-gray-300 border border-[#2a2b36] rounded-lg py-1.5 transition-colors">
            <FunctionSquare className="w-3 h-3 mr-1 text-violet-400" /> Formula Cells
         </button>
         <button className="flex items-center justify-center bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 rounded-lg py-1.5 transition-colors font-bold shadow-sm">
            <Sparkles className="w-3 h-3 mr-1" /> AI Analyze Table
         </button>
      </div>
    </div>
  );
};

export default createNoteNode({
  label: 'Note Table',
  accentColor: '#8b5cf6',
  icon: <TableIcon className="w-4 h-4 text-white" />,
  width: 'w-[450px]'
}, NoteTableBody);
