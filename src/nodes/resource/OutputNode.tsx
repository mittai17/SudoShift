import React, { useState, useEffect } from 'react';
import { Handle, Position, useNodes, useEdges, useReactFlow } from '@xyflow/react';
import { MonitorPlay, Settings2 } from 'lucide-react';
import NodeWrapper from '../shared/NodeWrapper';
import { TaskData } from '../../types';

export default function OutputNode({ data, selected, id }: { data: any; selected?: boolean; id: string }) {
  const edges = useEdges();
  const nodes = useNodes();
  const { setNodes } = useReactFlow();
  const task = data?.task as TaskData | undefined;

  const [inputData, setInputData] = useState<string>('');
  const [viewMode, setViewMode] = useState<'raw' | 'json' | 'markdown'>('raw');

  useEffect(() => {
    // Find all incoming edges to this node
    const incomingEdges = edges.filter(e => e.target === id);
    
    // Get data from source nodes
    const sourceData = incomingEdges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode?.data?.task) {
        const sourceTask = sourceNode.data.task as TaskData;
        return `[From: ${sourceTask.title}]\n${sourceTask.description || ''}`;
      }
      return '';
    }).join('\n\n---\n\n');

    setInputData(sourceData || 'Connect a node to view its output');
  }, [edges, nodes, id]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'raw' ? 'json' : prev === 'json' ? 'markdown' : 'raw');
  };

  return (
    <NodeWrapper data={data} selected={selected}>
      <div className="flex flex-col bg-[#1e2030] rounded-xl shadow-xl border border-[#2a2d3d]" style={{ minWidth: 320, maxWidth: 500 }}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-fuchsia-500 border-2 border-[#1e2030] -ml-1.5 z-10" />
        
        <div className="bg-[#151622] px-4 py-3 flex items-center justify-between border-b border-[#2a2d3d] rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg shrink-0">
              <MonitorPlay size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{task?.title || 'Data Output Viewer'}</h3>
              <p className="text-xs text-gray-400 font-medium">Read connected node data</p>
            </div>
          </div>
          <button onClick={toggleViewMode} className="text-gray-400 hover:text-white transition-colors p-1" title="Toggle view mode">
             <Settings2 size={16} />
          </button>
        </div>

        <div className="p-0 nodrag cursor-default bg-[#151622] min-h-[100px] max-h-[400px] overflow-auto rounded-b-xl">
          {viewMode === 'raw' && (
             <pre className="text-xs text-gray-300 p-4 font-mono select-text whitespace-pre-wrap">
               {inputData}
             </pre>
          )}
          {viewMode === 'json' && (
             <pre className="text-xs text-emerald-400 p-4 font-mono select-text whitespace-pre-wrap bg-[#0f1016]">
               {JSON.stringify({ output: inputData }, null, 2)}
             </pre>
          )}
          {viewMode === 'markdown' && (
             <div className="text-sm text-gray-300 p-4 prose prose-invert prose-sm max-w-none select-text">
               {inputData}
             </div>
          )}
        </div>

        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-fuchsia-500 border-2 border-[#1e2030] -mr-1.5 z-10" />
      </div>
    </NodeWrapper>
  );
}
