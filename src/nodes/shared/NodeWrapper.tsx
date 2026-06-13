import React, { useState } from 'react';
import { useReactFlow, useNodeId } from '@xyflow/react';
import { X, Plus, Maximize2 } from 'lucide-react';
import { NodeStyle, NodeSize, TaskData } from '../../types';
import { ColorPicker } from '../../components/canvas/ColorPicker';
import { QuickConnectMenu } from './QuickConnectMenu';


interface NodeWrapperProps {
  children: React.ReactNode;
  defaultColor?: string;
  data?: any;
  selected?: boolean;
}

export default function NodeWrapper({ children, defaultColor = '#64748b', data, selected }: NodeWrapperProps) {
  const { setNodes, updateNodeData } = useReactFlow();
  const nodeId = useNodeId();
  
  // Try to use passed data (reactive), fallback to non-reactive empty object if not passed
  const task = data?.task as TaskData | undefined;
  const nodeStyle: NodeStyle = task?.nodeStyle || {};
  
  const currentColor = nodeStyle.color || defaultColor;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConnectMenu, setShowConnectMenu] = useState(false);

  const deleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    }
  };

  const updateStyle = (updates: Partial<NodeStyle>) => {
    if (!nodeId) return;
    updateNodeData(nodeId, {
      ...data,
      task: {
        ...(data?.task as TaskData),
        nodeStyle: { ...((data?.task as TaskData)?.nodeStyle || {}), ...updates }
      }
    });
  };

  return (
    <div 
      className={`relative group transition-all duration-300 ease-out`}
    >
      {/* ── Visual Upgrade Wrapper ── */}
      <div 
        className={`transition-all duration-300 rounded-xl ${selected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
      >
        {/* Inject colored header variables using a CSS variable to children */}
        <div style={{ '--node-color': currentColor } as React.CSSProperties}>
          {children}
        </div>
      </div>

      {/* ── Hover Actions (Top Right) ── */}
      <div className="absolute -top-3 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button
          onClick={(e) => { e.stopPropagation(); setShowColorPicker(true); }}
          className="bg-white text-gray-500 border border-gray-200 rounded-full p-1.5 shadow-sm hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer"
          title="Change Color"
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentColor }} />
        </button>

        <button
          onClick={deleteNode}
          className="bg-white text-gray-500 border border-gray-200 rounded-full p-1 shadow-sm hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          title="Delete node"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Hover Actions (Right Edge Connect) ── */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowConnectMenu(true); }}
        className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white text-gray-500 border border-gray-200 rounded-full p-1 shadow-sm hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 transition-all z-50 cursor-pointer opacity-0 group-hover:opacity-100 scale-90 hover:scale-110"
        title="Quick Connect"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* ── Popovers ── */}
      {showColorPicker && (
        <div className="absolute -top-2 right-12">
          <ColorPicker 
            color={currentColor} 
            onChange={(c) => updateStyle({ color: c })} 
            onClose={() => setShowColorPicker(false)} 
          />
        </div>
      )}

      {showConnectMenu && nodeId && (
        <QuickConnectMenu 
          sourceId={nodeId} 
          // We don't have absolute position here without getNode, but the QuickConnectMenu
          // actually handles positioning using getNodes() inside it, so we don't strictly need sourceX/Y
          sourceX={0} 
          sourceY={0} 
          onClose={() => setShowConnectMenu(false)} 
        />
      )}
    </div>
  );
}
