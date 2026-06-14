import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface MermaidConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

export function createMermaidNode(config: MermaidConfig) {
  const MermaidComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [code, setCode] = useState(task.description || 'graph TD\n  A-->B;');
    const [svg, setSvg] = useState('');
    const [error, setError] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (task.description !== undefined && task.description !== code) {
        setCode(task.description);
      }
    }, [task.description]);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const mermaid = (await import('mermaid')).default;
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
          const id = `mermaid-${Math.random().toString(36).slice(2)}`;
          const { svg: result } = await mermaid.render(id, code);
          if (!cancelled) { setSvg(result); setError(''); }
        } catch (e: any) {
          if (!cancelled) setError(e.message || 'Parse error');
        }
      })();
      return () => { cancelled = true; };
    }, [code]);

    const save = (val: string) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: val } } } : n
      ));
    };

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor} resizable={true} minWidth={320} minHeight={250}>
        <div className="flex flex-col w-full h-full min-w-80 min-h-[250px] rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 shrink-0 flex items-center space-x-2 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <span className="opacity-80">{config.icon}</span>
            <h3 className="font-semibold text-sm">{config.label}</h3>
          </div>
          <div className="p-2 space-y-2 flex flex-col flex-1 overflow-hidden min-h-0">
            <textarea className="w-full shrink-0 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none resize-none min-h-[70px]"
              value={code} onChange={(e) => { setCode(e.target.value); save(e.target.value); }} />
            <div ref={containerRef} className="p-2 bg-gray-50 rounded-lg overflow-auto flex-1 min-h-0">
              {error ? <p className="text-red-500 text-xs">{error}</p>
                : svg ? <div dangerouslySetInnerHTML={{ __html: svg }} className="flex justify-center" />
                  : <div className="h-16 flex items-center justify-center text-xs text-gray-400">Rendering...</div>}
            </div>
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  MermaidComponent.displayName = `MermaidNode_${config.label.replace(/\s/g, '')}`;
  return MermaidComponent;
}
