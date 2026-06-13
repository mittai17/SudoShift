import React, { useState, useCallback, useRef } from 'react';
import { Handle, Position, ReactFlowProvider, ReactFlow, Background, Controls, addEdge, useNodesState, useEdgesState, useReactFlow, MiniMap } from '@xyflow/react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import NodeWrapper from '../shared/NodeWrapper';
import { TaskData } from '../../types';
import { nodeTypes as defaultNodeTypes, nodeColorMap, NODE_REGISTRY } from '../registry/nodeTypes';

// Legacy node types mapping
import TaskNodeLegacy from '../../components/nodes/TaskNode';
import NoteNodeLegacy from '../../components/nodes/NoteNode';
import MermaidNodeLegacy from '../../components/nodes/MermaidNode';
import TableNodeLegacy from '../../components/nodes/TableNode';
import ImageNodeLegacy from '../../components/nodes/ImageNode';
import LinkNodeLegacy from '../../components/nodes/LinkNode';
import ChecklistNodeLegacy from '../../components/nodes/ChecklistNode';
import CodeNodeLegacy from '../../components/nodes/CodeNode';
import VideoNodeLegacy from '../../components/nodes/VideoNode';
import WhiteboardNodeLegacy from '../../components/nodes/WhiteboardNode';
import TimerNodeLegacy from '../../components/nodes/TimerNode';
import CalculatorNodeLegacy from '../../components/nodes/CalculatorNode';
import CalendarNodeLegacy from '../../components/nodes/CalendarNode';
import FormulaNodeLegacy from '../../components/nodes/FormulaNode';

function InnerCanvas({ expanded, nodes, setNodes, edges, onNodesChange, onEdgesChange, onConnect }: any) {
  const { screenToFlowPosition, zoomIn, zoomOut, fitView, deleteElements } = useReactFlow();
  const [panMode, setPanMode] = useState(false);

  const nodeTypes = React.useMemo(() => ({
    ...defaultNodeTypes,
    taskNodeType: TaskNodeLegacy,
    noteNodeType: NoteNodeLegacy,
    mermaidNodeType: MermaidNodeLegacy,
    tableNodeType: TableNodeLegacy,
    imageNodeType: ImageNodeLegacy,
    linkNodeType: LinkNodeLegacy,
    checklistNodeType: ChecklistNodeLegacy,
    codeNodeType: CodeNodeLegacy,
    videoNodeType: VideoNodeLegacy,
    whiteboardNodeType: WhiteboardNodeLegacy,
    timerNodeType: TimerNodeLegacy,
    calculatorNodeType: CalculatorNodeLegacy,
    calendarNodeType: CalendarNodeLegacy,
    formulaNodeType: FormulaNodeLegacy,
  }), []);
  
  const handleNoteChange = useCallback((id: string, text: string) => {
    setNodes((nds: any) =>
      nds.map((n: any) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: text } } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const registryEntry = NODE_REGISTRY.find((n) => n.id === type);

      const taskData = registryEntry
        ? { id: uuidv4(), ...registryEntry.defaultData }
        : {
          id: uuidv4(),
          title: type === 'mermaidNodeType' ? 'Mermaid Diagram' : type === 'tableNodeType' ? 'Table' : type === 'imageNodeType' ? 'Image' : type === 'linkNodeType' ? 'Link' : type === 'checklistNodeType' ? 'Checklist' : type === 'codeNodeType' ? 'Code' : type === 'videoNodeType' ? 'Video' : type === 'whiteboardNodeType' ? 'Whiteboard' : type === 'timerNodeType' ? 'Timer' : type === 'calculatorNodeType' ? 'Calculator' : type === 'calendarNodeType' ? 'Calendar' : type === 'formulaNodeType' ? 'Formulas' : 'Note',
          description: type === 'mermaidNodeType' ? 'graph TD\n  A-->B;' : type === 'checklistNodeType' ? '[{"id":"1","text":"First item","checked":false}]' : type === 'formulaNodeType' ? 'Budget = 5000\nSpend = 1200\nBudget - Spend' : '',
          matrix: type === 'mermaidNodeType' ? 'MERMAID' : type === 'tableNodeType' ? 'TABLE' : type === 'imageNodeType' ? 'IMAGE' : type === 'linkNodeType' ? 'LINK' : type === 'checklistNodeType' ? 'CHECKLIST' : type === 'codeNodeType' ? 'CODE' : type === 'videoNodeType' ? 'VIDEO' : type === 'whiteboardNodeType' ? 'WHITEBOARD' : type === 'timerNodeType' ? 'TIMER' : type === 'calculatorNodeType' ? 'CALCULATOR' : type === 'calendarNodeType' ? 'CALENDAR' : type === 'formulaNodeType' ? 'FORMULA' : 'NOTE',
          deadline: null,
        };

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { onChange: handleNoteChange, task: taskData },
      };

      setNodes((nds: any) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, handleNoteChange]
  );
  
  const hasSelectedElements = nodes.some((n: any) => n.selected) || edges.some((e: any) => e.selected);

  const handleDeleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((n: any) => n.selected);
    const selectedEdges = edges.filter((e: any) => e.selected);
    deleteElements({ nodes: selectedNodes, edges: selectedEdges });
  }, [nodes, edges, deleteElements]);

  return (
    <div className="w-full h-full" onDragOver={expanded ? onDragOver : undefined} onDrop={expanded ? onDrop : undefined}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        zoomOnScroll={expanded}
        panOnScroll={expanded ? true : false}
        panOnDrag={expanded ? (panMode ? true : [1, 2]) : false}
        selectionOnDrag={expanded ? !panMode : false}
        nodesConnectable={expanded}
        elementsSelectable={expanded}
      >
        <Background gap={12} size={1} color="#ffffff20" />
        {expanded && (
          <div className="absolute top-2 right-2 bg-[#1e2030] shadow-md rounded-lg p-1.5 border border-[#2a2d3d] flex items-center space-x-1 z-10">
            <button
              onClick={() => setPanMode(false)}
              className={`p-1.5 rounded transition-colors ${!panMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-[#2a2d3d]'}`}
              title="Select Tool"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/></svg>
            </button>
            <button
              onClick={() => setPanMode(true)}
              className={`p-1.5 rounded transition-colors ${panMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-[#2a2d3d]'}`}
              title="Hand Tool"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="19 9 22 12 19 15"/><polyline points="9 19 12 22 15 19"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
            </button>
            <div className="w-px h-4 bg-[#2a2d3d] mx-1"></div>
            <button onClick={() => zoomIn()} className="p-1.5 rounded text-gray-400 hover:bg-[#2a2d3d] transition-colors" title="Zoom In">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            </button>
            <button onClick={() => zoomOut()} className="p-1.5 rounded text-gray-400 hover:bg-[#2a2d3d] transition-colors" title="Zoom Out">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            </button>
            <button onClick={() => fitView({ duration: 500 })} className="p-1.5 rounded text-gray-400 hover:bg-[#2a2d3d] transition-colors" title="Fit View">
              <Maximize2 size={16} />
            </button>
            {hasSelectedElements && (
              <>
                <div className="w-px h-4 bg-[#2a2d3d] mx-1"></div>
                <button onClick={handleDeleteSelected} className="p-1.5 rounded text-red-400 hover:bg-red-500/20 transition-colors" title="Delete Selected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </>
            )}
          </div>
        )}
        {expanded && (
          <MiniMap
            nodeColor={(node) => {
              const task = node.data.task as TaskData;
              if (task?.isConflicting) return '#ef4444';
              if (node.type && nodeColorMap[node.type]) return nodeColorMap[node.type];
              if (node.type === 'noteNodeType') return '#ff6d5a';
              if (node.type === 'mermaidNodeType') return '#8b5cf6';
              if (node.type === 'tableNodeType') return '#10b981';
              if (node.type === 'imageNodeType') return '#f59e0b';
              if (node.type === 'linkNodeType') return '#3b82f6';
              if (node.type === 'checklistNodeType') return '#ec4899';
              if (node.type === 'codeNodeType') return '#6b7280';
              if (node.type === 'videoNodeType') return '#ef4444';
              if (node.type === 'whiteboardNodeType') return '#a855f7';
              if (node.type === 'timerNodeType') return '#f43f5e';
              if (node.type === 'calculatorNodeType') return '#18181b';
              if (node.type === 'calendarNodeType') return '#0ea5e9';
              if (node.type === 'formulaNodeType') return '#6366f1';
              return '#868e96';
            }}
            maskColor="rgba(15, 16, 22, 0.6)"
            className="rounded-lg shadow-md border border-[#2a2d3d] !bg-[#151622]"
          />
        )}
      </ReactFlow>
    </div>
  );
}

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
    <NodeWrapper data={data} selected={selected} resizable={true} minWidth={350} minHeight={250}>
      <div 
        className={`flex flex-col bg-[#1e2030] rounded-xl shadow-xl transition-all duration-300 border border-[#2a2d3d] w-full h-full ${expanded ? 'w-[800px] h-[600px] fixed z-50 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2' : 'min-w-[350px] min-h-[250px]'}`}
      >
        {!expanded && <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#f59e0b] border-2 border-[#1e2030] -ml-1.5 z-10" />}
        
        <div className="bg-[#151622] px-4 py-3 flex items-center justify-between border-b border-[#2a2d3d] rounded-t-xl group shrink-0">
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
            className="text-gray-400 hover:text-white transition-colors p-1 shrink-0"
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div 
          className="flex-1 w-full relative bg-[#0f1016] rounded-b-xl overflow-hidden nodrag min-h-0"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
        >
          <ReactFlowProvider>
            <InnerCanvas 
              expanded={expanded} 
              nodes={nodes} 
              setNodes={setNodes}
              edges={edges} 
              onNodesChange={onNodesChange} 
              onEdgesChange={onEdgesChange} 
              onConnect={onConnect} 
            />
          </ReactFlowProvider>
        </div>

        {!expanded && <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#f59e0b] border-2 border-[#1e2030] -mr-1.5 z-10" />}
      </div>
    </NodeWrapper>
  );
}

