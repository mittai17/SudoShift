import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { format, isPast, parseISO, isValid } from 'date-fns';
import { Briefcase, AlertCircle, Play, Mail, Trash2, Loader2, Tag } from 'lucide-react';
import { NodeData, TaskData } from '../../types';

const getMatrixStyles = (matrix: string) => {
  switch (matrix) {
    case 'DO':
      return { main: 'bg-[#12b886]', icon: <Play className="w-4 h-4" /> };
    case 'DECIDE':
      return { main: 'bg-[#228be6]', icon: <AlertCircle className="w-4 h-4" /> };
    case 'DELEGATE':
      return { main: 'bg-[#fab005]', icon: <Mail className="w-4 h-4" /> };
    case 'DELETE':
      return { main: 'bg-[#fa5252]', icon: <Trash2 className="w-4 h-4" /> };
    default:
      return { main: 'bg-[#868e96]', icon: <Briefcase className="w-4 h-4" /> };
  }
};

import NodeWrapper from './NodeWrapper';

export default function TaskNode({ data }: { data: NodeData }) {
  const { task } = data;
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();
  const [isTagging, setIsTagging] = useState(false);
  
  // Safe date parsing to prevent app crash if generated dates are invalid
  const parsedDate = task.deadline ? parseISO(task.deadline) : null;
  const hasValidDate = parsedDate && isValid(parsedDate);
  const isOverdue = hasValidDate && isPast(parsedDate);

  const style = getMatrixStyles(task.matrix);

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

  const handleAutoTag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const content = `${task.title} ${task.description || ''}`.trim();
    if (!content || isTagging) return;
    setIsTagging(true);
    try {
      const res = await fetch("/api/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content })
      });
      const result = await res.json();
      if (result.tags) {
        updateTask({ tags: result.tags });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTagging(false);
    }
  };

  return (
    <NodeWrapper>
      <div className="relative">
        <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border-2 border-white -ml-2 z-10" />
        <div
          className={`flex flex-col w-64 rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg ${task.isConflicting ? 'ring-4 ring-red-500 ring-opacity-40 animate-pulse' : ''}`}
        >
        {/* N8N Style Header */}
        <div className={`${style.main} px-3 py-2 flex items-center justify-between text-white`}>
          <div className="flex items-center space-x-2 min-w-0">
            <div className="opacity-90">{style.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight tracking-tight truncate">
                {task.title}
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 leading-none mt-0.5">
                {task.matrix}
              </p>
            </div>
          </div>
          <button 
            onClick={handleAutoTag}
            disabled={isTagging || (!task.title && !task.description)}
            className="text-white hover:bg-white/20 p-1.5 rounded transition-colors disabled:opacity-50 flex items-center shrink-0 ml-2"
            title="Auto-tag"
          >
            {isTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tag'}
          </button>
        </div>
      
      <div className="p-3 bg-white">
        {task.description && (
          <p className="text-xs text-gray-700 mb-3 line-clamp-3 leading-relaxed">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100 pt-2 mt-auto">
          {hasValidDate ? (
            <span className={`${isOverdue ? 'text-red-500 font-bold' : ''}`}>
              {format(parsedDate, 'MMM d, yy')}
            </span>
          ) : task.deadline ? (
            <span>{task.deadline}</span>
          ) : (
            <span className="opacity-50">No deadline</span>
          )}
          
          {task.estimatedMinutes && (
            <span className="bg-gray-100 px-1.5 py-0.5 rounded-md">{task.estimatedMinutes}m</span>
          )}
        </div>
        
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
      </div>

      <Handle type="source" position={Position.Right} className={`w-4 h-4 ${style.main} border-2 border-white -mr-2 z-10`} />
      </div>
    </NodeWrapper>
  );
}
