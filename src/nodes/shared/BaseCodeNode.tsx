import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface CodeConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

export function createCodeNode(config: CodeConfig) {
  const CodeComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [lang, setLang] = useState(task.tags?.[0] || 'js');

    const save = (val: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: val } } } : n
      ));
    };

    return (
      <NodeWrapper data={data} selected={selected} resizable={true} minWidth={280} minHeight={150}>
        <div className="flex flex-col w-full h-full min-w-72 min-h-[150px] rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 shrink-0 flex items-center justify-between text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <div className="flex items-center space-x-2">
              <span className="opacity-80">{config.icon}</span>
              <h3 className="font-semibold text-sm">{config.label}</h3>
            </div>
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="text-xs bg-white/20 border border-white/30 rounded px-1 py-0.5 focus:outline-none text-white">
              {['js', 'ts', 'python', 'rust', 'go', 'sql', 'bash', 'json'].map((l) => (
                <option key={l} value={l} className="text-gray-800">{l}</option>
              ))}
            </select>
          </div>
          <div className="p-0 bg-gray-900 rounded-b-xl flex flex-col flex-1 overflow-hidden min-h-0">
            <textarea
              className="w-full h-full flex-1 bg-transparent text-green-400 font-mono text-xs p-3 focus:outline-none resize-none min-h-[100px] rounded-b-xl"
              spellCheck={false}
              placeholder={`// ${lang} code...`}
              defaultValue={task.description || ''}
              onChange={(e) => save(e.target.value)}
            />
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  CodeComponent.displayName = `CodeNode_${config.label.replace(/\s/g, '')}`;
  return CodeComponent;
}
