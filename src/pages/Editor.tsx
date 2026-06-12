import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  ConnectionLineType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { differenceInHours, parseISO, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import TaskNode from '../components/TaskNode';
import NoteNode from '../components/NoteNode';
import MermaidNode from '../components/MermaidNode';
import { TaskData } from '../types';

// Detect conflicts: deadlines within 24 hours of each other
const detectConflicts = (nodes: Node[]): { conflictingNodeIds: Set<string>, conflictEdges: Edge[] } => {
  const tasksWithDates = nodes
    .filter(n => n.type === 'taskNodeType')
    .map(n => n.data.task as TaskData)
    .filter(t => t.deadline);

  const conflictingNodeIds = new Set<string>();
  const conflictEdges: Edge[] = [];

  for (let i = 0; i < tasksWithDates.length; i++) {
    for (let j = i + 1; j < tasksWithDates.length; j++) {
      const t1 = tasksWithDates[i];
      const t2 = tasksWithDates[j];
      
      const d1 = parseISO(t1.deadline!);
      const d2 = parseISO(t2.deadline!);
      
      if (!isValid(d1) || !isValid(d2)) continue;
      
      const hoursDiff = Math.abs(differenceInHours(d1, d2));
      
      // If tasks are due within 24 hours of each other, mark them as conflicting
      if (hoursDiff <= 24) {
        conflictingNodeIds.add(t1.id);
        conflictingNodeIds.add(t2.id);
        
        conflictEdges.push({
          id: `conflict-${t1.id}-${t2.id}`,
          source: t1.id,
          target: t2.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'rgb(239 68 68)', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(239 68 68)' },
        });
      }
    }
  }
  
  return { conflictingNodeIds, conflictEdges };
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 2, stroke: '#b1b1b7', strokeDasharray: '5,5' },
};

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  const handleNoteChange = useCallback((id: string, text: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
           return { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: text } } };
        }
        return n;
      })
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    taskNodeType: TaskNode,
    noteNodeType: NoteNode,
    mermaidNodeType: MermaidNode,
  }), []);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' }
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { 
          onChange: handleNoteChange,
          task: { 
            id: uuidv4(),
            title: type === 'mermaidNodeType' ? 'Mermaid Diagram' : 'Note',
            description: type === 'mermaidNodeType' ? 'graph TD\n  A-->B;' : '',
            matrix: type === 'mermaidNodeType' ? 'MERMAID' : 'NOTE',
            deadline: null,
          } 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes, handleNoteChange]
  );

  const handleAddTasks = (newTasks: TaskData[]) => {
    setNodes((nds) => {
      const startX = nds.length > 0 ? 250 : 50;
      const startY = nds.length * 50 + 100;

      const newFlowNodes: Node[] = newTasks.map((t, idx) => ({
        id: t.id,
        type: 'taskNodeType',
        position: { x: startX + idx * 300, y: startY + (idx % 2 === 0 ? 0 : 50) },
        data: { task: t }
      }));

      return [...nds, ...newFlowNodes];
    });
  };

  const handleAddEdges = (newEdges: any[]) => {
    setEdges((eds) => [...eds, ...newEdges.map(e => ({
      ...e,
      type: 'smoothstep',
      style: { stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' }
    }))]);
  };

  useEffect(() => {
    if (nodes.length === 0) return;
    
    const { conflictingNodeIds, conflictEdges } = detectConflicts(nodes);
    
    setNodes((nds) => {
      let changed = false;
      const updatedNds = nds.map((n) => {
        if (n.type !== 'taskNodeType') return n;
        
        const t = n.data.task as TaskData;
        const isConflicting = conflictingNodeIds.has(n.id);
        if (t.isConflicting !== isConflicting) {
          changed = true;
          return { ...n, data: { ...n.data, task: { ...t, isConflicting } } };
        }
        return n;
      });
      return changed ? updatedNds : nds;
    });

    setEdges((eds) => {
      const nonConflictEdges = eds.filter(e => !e.id.startsWith('conflict-'));
      return [...nonConflictEdges, ...conflictEdges];
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      {/* Editor Header Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 z-10 shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="font-semibold text-sm">Workspace</h2>
        </div>
        <div className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-50 border border-gray-100 rounded">
          All changes saved locally
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden bg-[#f8fafc] font-sans text-gray-900">
        <Sidebar onAddNodes={handleAddTasks} onAddEdges={handleAddEdges} />
        
        <div className="flex-1 h-full relative p-2 md:p-4 pb-0">
          <div className="w-full h-full bg-white rounded-t-xl rounded-tr-none md:rounded-xl shadow-inner border border-gray-200 overflow-hidden" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              connectionLineType={ConnectionLineType.SmoothStep}
              panOnScroll={true}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
            >
              <Background color="#64748b" variant={BackgroundVariant.Dots} gap={24} size={3} />
              <Controls className="bg-white shadow-md border-gray-200 rounded-md" />
              <MiniMap 
                nodeColor={(node) => {
                  const task = node.data.task as TaskData;
                  if (task.isConflicting) return '#ef4444';
                  if (node.type === 'noteNodeType') return '#ff6d5a';
                  if (node.type === 'mermaidNodeType') return '#8b5cf6';
                  switch (task?.matrix) {
                    case 'DO': return '#12b886';
                    case 'DECIDE': return '#228be6';
                    case 'DELEGATE': return '#fab005';
                    case 'DELETE': return '#fa5252';
                    default: return '#868e96';
                  }
                }}
                maskColor="rgba(248, 250, 252, 0.6)"
                className="rounded-lg shadow-md border border-gray-200"
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Editor() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
