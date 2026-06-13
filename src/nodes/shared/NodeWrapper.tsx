import React from 'react';
import { useReactFlow, useNodeId } from '@xyflow/react';
import { X } from 'lucide-react';

export default function NodeWrapper({ children }: { children: React.ReactNode }) {
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();

  const deleteNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    }
  };

  return (
    <div className="relative group">
      {children}
      <button
        onClick={deleteNode}
        className="absolute -top-2 -right-2 bg-white text-gray-500 border border-gray-200 rounded-full p-1 shadow-sm hover:text-red-500 hover:bg-red-50 transition-all z-50 cursor-pointer opacity-0 group-hover:opacity-100"
        title="Delete node"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
