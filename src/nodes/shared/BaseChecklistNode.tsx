import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

interface ChecklistConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
}

interface ChecklistItem { id: string; text: string; checked: boolean; }

export function createChecklistNode(config: ChecklistConfig) {
  const ChecklistComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes } = useReactFlow();
    const nodeId = useNodeId();

    const items: ChecklistItem[] = (() => {
      try { return JSON.parse(task.description || '[]'); }
      catch { return []; }
    })();

    const saveItems = useCallback((next: ChecklistItem[]) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), description: JSON.stringify(next) } } }
          : n
      ));
    }, [nodeId, setNodes]);

    const toggle = (id: string) => saveItems(items.map((it) => it.id === id ? { ...it, checked: !it.checked } : it));
    const updateText = (id: string, text: string) => saveItems(items.map((it) => it.id === id ? { ...it, text } : it));
    const addItem = () => saveItems([...items, { id: uuidv4(), text: '', checked: false }]);
    const removeItem = (id: string) => saveItems(items.filter((it) => it.id !== id));

    const done = items.filter((i) => i.checked).length;

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor} resizable={true} minWidth={280} minHeight={150}>
        <div className="flex flex-col w-full h-full min-w-72 min-h-[150px] rounded-2xl shadow-xl bg-[#1a1b23] border border-[#2a2b36] hover:border-gray-600 transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-[#2a2b36] border-2 border-[#1a1b23] -ml-2 z-10" />
          <div className="rounded-t-xl px-3 py-2 shrink-0 flex items-center justify-between text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <div className="flex items-center space-x-2">
              <span className="opacity-80">{config.icon}</span>
              <h3 className="font-semibold text-sm tracking-tight">{config.label}</h3>
            </div>
            <span className="text-xs opacity-80">{done}/{items.length}</span>
          </div>
          <div className="p-3 space-y-2 flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-2 group shrink-0">
                  <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
                    className="w-4 h-4 mt-0.5 rounded cursor-pointer shrink-0" style={{ accentColor: `var(--node-color, ${config.accentColor})` }} />
                  <textarea value={item.text} onChange={(e) => updateText(item.id, e.target.value)}
                    className={`flex-1 text-sm bg-transparent focus:outline-none resize-none pt-0 pb-0 ${item.checked ? 'line-through text-gray-400' : 'text-gray-300'}`}
                    placeholder="List item..." rows={1} 
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0 mt-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="flex items-center space-x-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1 shrink-0">
                <Plus className="w-3.5 h-3.5" /><span>Add item</span>
              </button>
            </div>
          </div>
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  ChecklistComponent.displayName = `ChecklistNode_${config.label.replace(/\s/g, '')}`;
  return ChecklistComponent;
}
