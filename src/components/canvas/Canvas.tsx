import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Panel,
  SelectionMode,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  useReactFlow,
  getNodesBounds,
  getViewportForBounds
} from '@xyflow/react';
import { MousePointer2, Move, ZoomIn, ZoomOut, Expand, Trash2, Download } from 'lucide-react';
import { TaskData } from '../../types';
import { nodeColorMap } from '../../nodes/registry/nodeTypes';
import { toPng } from 'html-to-image';

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  nodeTypes: any;
  defaultEdgeOptions: any;
  panMode: boolean;
  setPanMode: (mode: boolean) => void;
  hasSelectedElements: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleFitView: () => void;
  handleDeleteSelected: () => void;
}

export function Canvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes,
  defaultEdgeOptions,
  panMode,
  setPanMode,
  hasSelectedElements,
  handleZoomIn,
  handleZoomOut,
  handleFitView,
  handleDeleteSelected
}: CanvasProps) {
  const { getNodes } = useReactFlow();
  
  const handleDownload = useCallback(() => {
    const nodesBounds = getNodesBounds(getNodes());
    const viewport = getViewportForBounds(nodesBounds, 2500, 2500, 0.5, 2, 0.2); // width, height, minZoom, maxZoom, padding

    const reactFlowElement = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!reactFlowElement) return;

    toPng(reactFlowElement, {
        backgroundColor: '#f8fafc',
        width: 2500,
        height: 2500,
        style: {
          width: '2500px',
          height: '2500px',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`
        }
    }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'workspace.png';
        link.href = dataUrl;
        link.click();
    });
  }, [getNodes]);

  return (
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
      panOnDrag={panMode ? true : [1, 2]} // drag middle click or pan mode enabled
      selectionOnDrag={!panMode}
      selectionMode={SelectionMode.Partial}
      fitView
      minZoom={0.1}
      maxZoom={2}
    >
      <Background color="#64748b" variant={BackgroundVariant.Dots} gap={24} size={3} />

      <Panel position="top-right" className="bg-white shadow-md rounded-lg p-1 md:p-1.5 border border-gray-200 flex items-center space-x-0.5 md:space-x-1 z-10 m-2 md:m-4 max-w-[calc(100vw-32px)] flex-wrap">
        <button
          onClick={() => setPanMode(false)}
          className={`p-2 md:p-2 rounded transition-colors ${!panMode ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Select Tool (Marquee)"
        >
          <MousePointer2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPanMode(true)}
          className={`p-2 md:p-2 rounded transition-colors ${panMode ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Hand Tool (Pan)"
        >
          <Move className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onClick={handleZoomIn} className="p-2 md:p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 md:p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleFitView} className="p-2 md:p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Fit View">
          <Expand className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button onClick={handleDownload} className="p-2 md:p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors" title="Export as PNG">
          <Download className="w-4 h-4" />
        </button>
        {hasSelectedElements && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button onClick={handleDeleteSelected} className="p-2 md:p-2 rounded text-red-500 hover:bg-red-50 transition-colors" title="Delete Selected">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </Panel>

      <MiniMap
        nodeColor={(node) => {
          const task = node.data.task as TaskData;
          if (task?.isConflicting) return '#ef4444';
          // New registry nodes
          if (node.type && nodeColorMap[node.type]) return nodeColorMap[node.type];
          // Legacy node types
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
          switch (task?.matrix) {
            case 'DO': return '#12b886';
            case 'DECIDE': return '#228be6';
            case 'DELEGATE': return '#fab005';
            case 'DELETE': return '#fa5252';
            default: return '#868e96';
          }
        }}
        maskColor="rgba(248, 250, 252, 0.6)"
        className="hidden md:block rounded-lg shadow-md border border-gray-200"
      />
    </ReactFlow>
  );
}
