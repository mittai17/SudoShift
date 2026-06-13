import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Loader2, Sparkles, Tag, Wand2 } from 'lucide-react';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface NoteConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
  placeholder?: string;
}

export function createNoteNode(config: NoteConfig) {
  const NoteComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();
    const [isTagging, setIsTagging] = useState(false);
    const [isImproving, setIsImproving] = useState(false);

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
        const gkey = localStorage.getItem('gemini_api_key') || '';
        const res = await fetch('/api/auto-tag', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-gemini-key': gkey
          },
          body: JSON.stringify({ text: task.description }),
        });
        const result = await res.json();
        if (result.tags) updateTask({ tags: result.tags });
      } catch (e) {
        console.error(e);
      } finally {
        setIsTagging(false);
      }
    };

    const handleImprove = async () => {
      if (!task.description || isImproving) return;
      setIsImproving(true);
      try {
        const gkey = localStorage.getItem('gemini_api_key') || '';
        const res = await fetch('/api/ai-action', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-gemini-key': gkey
          },
          body: JSON.stringify({ action: 'improve', text: task.description }),
        });
        const result = await res.json();
        if (result.result) updateTask({ description: result.result });
      } catch (e) {
        console.error(e);
      } finally {
        setIsImproving(false);
      }
    };

    return (
      <NodeWrapper data={data} selected={selected}>
        <div className="flex flex-col w-64 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 flex items-center justify-between text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <div className="flex items-center space-x-2">
              <span className="opacity-80">{config.icon}</span>
              <h3 className="font-semibold text-sm tracking-tight truncate">{config.label}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={handleImprove} disabled={isImproving || !task.description}
                className="hover:bg-white/20 p-1 rounded transition-colors disabled:opacity-50" title="AI Rewrite & Polish">
                {isImproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              </button>
              <button onClick={handleAutoTag} disabled={isTagging || !task.description}
                className="hover:bg-white/20 p-1 rounded transition-colors disabled:opacity-50" title="Auto-tag">
                {isTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="p-3 flex flex-col rounded-b-xl">
            <textarea
              className="w-full text-sm text-gray-700 bg-transparent resize-none focus:outline-none placeholder-gray-300 min-h-[80px]"
              placeholder={config.placeholder || 'Type your note...'}
              value={task.description || ''}
              onChange={(e) => updateTask({ description: e.target.value })}
            />
            {task.tags && task.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                {task.tags.map((tag: string, i: number) => (
                  <span key={i} className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                    <Tag className="w-2.5 h-2.5" /><span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  NoteComponent.displayName = `NoteNode_${config.label.replace(/\s/g, '')}`;
  return NoteComponent;
}
