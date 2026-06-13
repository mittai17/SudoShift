import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface FormulaConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

const evalFormulas = (input: string): string => {
  const lines = input.split('\n');
  const vars: Record<string, number> = {};
  const results: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { results.push(''); continue; }
    const assign = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (assign) {
      try {
        const expr = assign[2].replace(/[A-Za-z_]\w*/g, (m) => String(vars[m] ?? m));
        // eslint-disable-next-line no-eval
        const val = eval(expr);
        vars[assign[1]] = val;
        results.push(`${assign[1]} = ${val}`);
      } catch { results.push(`${trimmed} (error)`); }
    } else {
      try {
        const expr = trimmed.replace(/[A-Za-z_]\w*/g, (m) => String(vars[m] ?? m));
        // eslint-disable-next-line no-eval
        const val = eval(expr);
        results.push(`= ${val}`);
      } catch { results.push(trimmed); }
    }
  }
  return results.join('\n');
};

export function createFormulaNode(config: FormulaConfig) {
  const FormulaComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [input, setInput] = useState(task.description || 'Budget = 5000\nSpend = 1200\nBudget - Spend');

    const save = (val: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: val } } } : n
      ));
    };

    const output = evalFormulas(input);

    return (
      <NodeWrapper data={data} selected={selected}>
        <div className="flex flex-col w-72 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3 space-y-2">
            <textarea className="w-full font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none resize-none min-h-[70px]"
              value={input} onChange={(e) => { setInput(e.target.value); save(e.target.value); }} placeholder="Var = value&#10;Var + Var" />
            <div className="bg-indigo-50 rounded-lg p-2 font-mono text-xs text-indigo-800 whitespace-pre-wrap border border-indigo-100">
              {output}
            </div>
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  FormulaComponent.displayName = `FormulaNode_${config.label.replace(/\s/g, '')}`;
  return FormulaComponent;
}
