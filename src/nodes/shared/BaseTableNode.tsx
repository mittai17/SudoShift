import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Plus, Trash2 } from 'lucide-react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface TableConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

interface TableState { headers: string[]; rows: string[][]; }

const parseTable = (desc: string): TableState => {
  try { return JSON.parse(desc); }
  catch { return { headers: ['Column 1', 'Column 2'], rows: [['', '']] }; }
};

export function createTableNode(config: TableConfig) {
  const TableComponent = ({ data }: { data: any }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [table, setTable] = useState<TableState>(() => parseTable(task.description || ''));

    const save = (next: TableState) => {
      setTable(next);
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: JSON.stringify(next) } } }
          : n
      ));
    };

    const updateCell = (r: number, c: number, val: string) => {
      const rows = table.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? val : cell) : row);
      save({ ...table, rows });
    };
    const updateHeader = (c: number, val: string) => {
      save({ ...table, headers: table.headers.map((h, i) => i === c ? val : h) });
    };
    const addRow = () => save({ ...table, rows: [...table.rows, table.headers.map(() => '')] });
    const addCol = () => save({ headers: [...table.headers, `Col ${table.headers.length + 1}`], rows: table.rows.map((r) => [...r, '']) });
    const delRow = (r: number) => save({ ...table, rows: table.rows.filter((_, i) => i !== r) });

    return (
      <NodeWrapper>
        <div className="flex flex-col rounded-xl shadow-md bg-white border border-gray-200 hover:shadow-lg transition-shadow" style={{ minWidth: 280 }}>
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center justify-between text-white" style={{ backgroundColor: config.accentColor }}>
            <div className="flex items-center space-x-2">
              <span className="opacity-80">{config.icon}</span>
              <h3 className="font-semibold text-sm">{config.label}</h3>
            </div>
            <div className="flex space-x-1">
              <button onClick={addCol} className="text-xs hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">+Col</button>
              <button onClick={addRow} className="text-xs hover:bg-white/20 px-1.5 py-0.5 rounded transition-colors">+Row</button>
            </div>
          </div>
          <div className="p-2 overflow-auto max-h-64">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr>
                  {table.headers.map((h, c) => (
                    <th key={c} className="border border-gray-200 p-0">
                      <input value={h} onChange={(e) => updateHeader(c, e.target.value)}
                        className="w-full px-2 py-1 font-semibold text-gray-700 bg-gray-50 focus:outline-none" />
                    </th>
                  ))}
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, r) => (
                  <tr key={r} className="group">
                    {row.map((cell, c) => (
                      <td key={c} className="border border-gray-200 p-0">
                        <input value={cell} onChange={(e) => updateCell(r, c, e.target.value)}
                          className="w-full px-2 py-1 text-gray-600 bg-transparent focus:outline-none focus:bg-gray-50" />
                      </td>
                    ))}
                    <td className="w-6 text-center">
                      <button onClick={() => delRow(r)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border-2 border-white -mr-2 z-10" style={{ backgroundColor: config.accentColor }} />
        </div>
      </NodeWrapper>
    );
  };
  TableComponent.displayName = `TableNode_${config.label.replace(/\s/g, '')}`;
  return TableComponent;
}
