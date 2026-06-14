import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { AlignLeft, Tag, Loader2 } from 'lucide-react';
import { NodeData, TaskData } from '../../types';
import NodeWrapper from './NodeWrapper';

export default function NoteNode({ data }: { data: NodeData }) {
  const { task } = data;
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();
  const [isTagging, setIsTagging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTask({ description: e.target.value });
  };

  const updateTask = (updates: Partial<TaskData>) => {
    if (!nodeId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates } } }
          : n
      )
    );
  };

  const handleAutoTag = async () => {
    if (!task.description || isTagging) return;
    setIsTagging(true);
    try {
      const res = await fetch("/api/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: task.description })
      });
      const result = await res.json();
      if (result.tags) {
        updateTask({ tags: result.tags });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTagging(false);
    }
  };

  return (
    <NodeWrapper>
      <div className="flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200 transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
      
      {/* N8N Style Header */}
      <div className="bg-[#ff6d5a] rounded-t-xl px-3 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <AlignLeft className="w-4 h-4 opacity-80" />
          <h3 className="font-semibold text-sm leading-tight tracking-tight shadow-sm truncate">
            Note
          </h3>
        </div>
        <button 
          onClick={handleAutoTag}
          disabled={isTagging || !task.description}
          className="text-white hover:bg-white/20 p-1 rounded transition-colors disabled:opacity-50 flex items-center"
          title="Auto-tag"
        >
          {isTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tag'}
        </button>
      </div>
      
      {/* Body containing an editable textarea */}
      <div className="p-3 bg-white flex flex-col h-full rounded-b-xl relative">
        <textarea
          className="w-full text-sm text-gray-700 bg-transparent resize-none focus:outline-none placeholder-gray-300 min-h-[80px]"
          placeholder="Type your note here..."
          defaultValue={task.description || ''}
          onChange={handleChange}
        />
        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            {task.tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                <Tag className="w-2.5 h-2.5" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#ff6d5a] border-2 border-white -mr-2 z-10" />
    </div>
  
    </NodeWrapper>
  );
}
