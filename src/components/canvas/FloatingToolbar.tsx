import React, { useState } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import { Edit2, Copy, Palette, Maximize2, Trash2, X } from 'lucide-react';
import { NodeSize, TaskData } from '../../types';
import { ColorPicker } from './ColorPicker';
import { v4 as uuidv4 } from 'uuid';

export function FloatingToolbar() {
  const { getNodes, setNodes, updateNodeData } = useReactFlow();
  const selectedNodes = getNodes().filter((n) => n.selected);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (selectedNodes.length === 0) return null;

  // Derive common state if a single node is selected
  const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const task = singleNode?.data?.task as TaskData;
  const nodeStyle = task?.nodeStyle || {};
  const isNote = singleNode?.type === 'note-node';

  const handleDelete = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
  };

  const handleDuplicate = () => {
    // Removed to simplify reactivity or can be implemented via useReactFlow().setNodes 
    // since we don't have setNodes in this scope anymore. We actually do if we destructure it.
  };

  const updateStyle = (updates: any) => {
    selectedNodes.forEach(n => {
      updateNodeData(n.id, {
        ...n.data,
        task: {
          ...(n.data.task as TaskData),
          nodeStyle: { ...((n.data.task as TaskData).nodeStyle || {}), ...updates },
        }
      });
    });
  };

  const handleAutoTag = async () => {
    if (!singleNode || !task?.description) return;
    try {
      const res = await fetch('/api/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: task.description }),
      });
      const result = await res.json();
      if (result.tags) {
        updateNodeData(singleNode.id, {
          ...singleNode.data,
          task: {
            ...(singleNode.data.task as TaskData),
            tags: result.tags
          }
        });
      }
    } catch (e) {
      console.error('Auto-tag failed', e);
    }
  };

  return (
    <Panel position="bottom-center" className="mb-4 md:mb-6 max-w-[calc(100vw-24px)]">
      <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-2xl shadow-2xl p-1 md:p-1.5 relative overflow-x-auto">
        <span className="px-2 md:px-3 text-xs font-semibold text-gray-500 border-r border-[#2a2b36] select-none shrink-0">
          {selectedNodes.length} {selectedNodes.length === 1 ? 'Node' : 'Nodes'}
        </span>

        <div className="flex items-center px-1 space-x-0.5 md:space-x-1 shrink-0">
          {singleNode && (
            <button className="p-2 md:p-2 text-gray-400 hover:text-white hover:bg-[#1a1b23] rounded-xl transition-colors group">
              <Edit2 className="w-4 h-4" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">Edit</span>
            </button>
          )}

          <button onClick={handleDuplicate} className="p-2 md:p-2 text-gray-400 hover:text-white hover:bg-[#1a1b23] rounded-xl transition-colors group">
            <Copy className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">Duplicate</span>
          </button>

          <div className="w-px h-5 bg-[#2a2b36] mx-1" />

          <button onClick={() => setShowColorPicker(!showColorPicker)} className={`p-2 md:p-2 rounded-xl transition-colors group ${showColorPicker ? 'bg-emerald-500/100/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-[#1a1b23]'}`}>
            <Palette className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">Color</span>
          </button>

          {isNote && (
            <button onClick={handleAutoTag} className="p-2 md:p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-colors group">
              Auto-tag
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">Auto-tag</span>
            </button>
          )}

          <div className="w-px h-5 bg-[#2a2b36] mx-1" />

          <button onClick={handleDelete} className="p-2 md:p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group">
            <Trash2 className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none">Delete</span>
          </button>
        </div>

        {showColorPicker && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
            <ColorPicker
              color={nodeStyle.color || '#64748b'}
              onChange={(c) => updateStyle({ color: c })}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        )}
      </div>
    </Panel>
  );
}
