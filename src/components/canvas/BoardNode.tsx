import React, { useState } from 'react';
import { NodeResizer, useReactFlow, useNodeId } from '@xyflow/react';
import { LayoutGrid } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

export default function BoardNode({ data, selected }: { data: any, selected: boolean }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const { task } = data;
  const color = task?.nodeStyle?.color || '#1e293b'; // Default dark slate
  const title = task?.title || 'New Board';

  const { updateNodeData } = useReactFlow();
  const nodeId = useNodeId();

  const updateTask = (updates: any) => {
    if (!nodeId) return;
    updateNodeData(nodeId, {
      ...data,
      task: {
        ...(data.task || {}),
        ...updates
      }
    });
  };

  return (
    <>
      <NodeResizer 
        color={color} 
        isVisible={selected} 
        minWidth={300} 
        minHeight={200}
        handleStyle={{ width: 8, height: 8, borderRadius: 4 }}
      />
      
      <div 
        className="w-full h-full rounded-2xl border-2 transition-all relative group"
        style={{ 
          backgroundColor: color + '15', // very transparent fill
          borderColor: selected ? color : color + '40',
        }}
      >
        {/* Header Ribbon */}
        <div 
          className="absolute top-0 left-0 right-0 h-10 px-4 flex items-center justify-between rounded-t-xl"
          style={{ backgroundColor: color + '30', borderBottom: `1px solid ${color}40` }}
        >
          <div className="flex items-center space-x-2 w-full">
            <LayoutGrid className="w-4 h-4" style={{ color }} />
            <input 
              value={title}
              onChange={(e) => updateTask({ title: e.target.value })}
              className="bg-transparent font-semibold text-sm focus:outline-none w-full"
              style={{ color }}
              placeholder="Board Title..."
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setShowColorPicker(true); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-[#13141c]/10 transition-all shrink-0"
            title="Change Board Color"
          >
            <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
          </button>
        </div>

        {/* Color Picker Popover */}
        {showColorPicker && (
          <div className="absolute top-12 right-4 z-50">
            <ColorPicker 
              color={color}
              onChange={(c) => updateTask({ nodeStyle: { ...task?.nodeStyle, color: c } })}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        )}
      </div>
    </>
  );
}
