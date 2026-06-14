import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface FormulaConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

// AI evaluation replaces local eval

export function createFormulaNode(config: FormulaConfig) {
  const FormulaComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [input, setInput] = useState(task.description || 'Budget = 5000\nSpend = 1200\nBudget - Spend');
    const [output, setOutput] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);

    React.useEffect(() => {
      if (task.description !== undefined && task.description !== input) {
        setInput(task.description);
      }
    }, [task.description]);

    const evaluate = async () => {
      if (!input.trim()) return;
      setIsEvaluating(true);
      try {
        const res = await fetch('/api/evaluate-formula', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: input })
        });
        const data = await res.json();
        setOutput(data.result || data.error);
      } catch (e: any) {
        setOutput(e.message);
      } finally {
        setIsEvaluating(false);
      }
    };

    const save = (val: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: val } } } : n
      ));
    };

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}>
        <div className="flex flex-col w-72 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-3 space-y-2 flex flex-col flex-1">
            <textarea className="w-full font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none resize-none min-h-[70px]"
              value={input} onChange={(e) => { setInput(e.target.value); save(e.target.value); }} placeholder="Var = value&#10;Var + Var" />
            <button onClick={evaluate} disabled={isEvaluating} className="w-full py-1.5 text-xs bg-indigo-500 text-white font-semibold rounded hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm">
              {isEvaluating ? 'Evaluating...' : 'Evaluate with AI'}
            </button>
            <div className="bg-indigo-50 rounded-lg p-2 font-mono text-xs text-indigo-800 whitespace-pre-wrap border border-indigo-100 min-h-[40px] flex-1 overflow-auto">
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
