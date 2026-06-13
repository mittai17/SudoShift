import React, { useState, useCallback } from 'react';
import { Handle, Position, ReactFlowProvider, ReactFlow, Background, Controls, addEdge, useNodesState, useEdgesState, BackgroundVariant, useReactFlow } from '@xyflow/react';
import { Maximize2, Minimize2 } from 'lucide-react';
import NodeWrapper from '../shared/NodeWrapper';
import { TaskData } from '../../types';

export default function CanvasNode({ data, selected }: { data: any; selected?: boolean }) {
  const task = data?.task as TaskData | undefined;
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [expanded, setExpanded] = useState(false);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <NodeWrapper data={data} selected={selected}>
      <div 
        className={`flex flex-col bg-[#1e2030] rounded-xl shadow-xl transition-all duration-300 border border-[#2a2d3d] ${expanded ? 'w-[800px] h-[600px] absolute z-50 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2' : 'w-[350px] h-[250px]'}`}
      >
        {!expanded && <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#f59e0b] border-2 border-[#1e2030] -ml-1.5 z-10" />}
        
        <div className="bg-[#151622] px-4 py-3 flex items-center justify-between border-b border-[#2a2d3d] rounded-t-xl group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{task?.title || 'Nested Canvas'}</h3>
              <p className="text-[10px] text-gray-400 font-medium">Double click to expand</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div 
          className="flex-1 w-full relative bg-[#0f1016] rounded-b-xl overflow-hidden nodrag"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              zoomOnScroll={false}
              panOnScroll={expanded}
              panOnDrag={expanded}
              nodesConnectable={expanded}
              elementsSelectable={expanded}
            >
              <Background gap={12} size={1} color="#ffffff10" />
              {expanded && <Controls showInteractive={false} />}
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {!expanded && <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#f59e0b] border-2 border-[#1e2030] -mr-1.5 z-10" />}
      </div>
    </NodeWrapper>
  );
}
