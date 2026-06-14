import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Calendar, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

export interface PrimaryNodeConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
  fields?: Array<{ key: string; label: string; type: 'text' | 'date' | 'select' | 'textarea'; options?: string[] }>;
}

export function createPrimaryNode(config: PrimaryNodeConfig) {
  const PrimaryComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes, setEdges, getNode } = useReactFlow();
    const nodeId = useNodeId();
    const [isGenerating, setIsGenerating] = useState(false);

    const updateTask = (updates: Partial<TaskData>) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates } } } : n
      ));
    };

    const handleGenerateSubtasks = async () => {
      if (!task.title || isGenerating || !nodeId) return;
      setIsGenerating(true);
      try {
        const gkey = localStorage.getItem('gemini_api_key') || '';
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-gemini-key': gkey
          },
          body: JSON.stringify({ action: 'subtasks', text: task.title + (task.description ? ' - ' + task.description : '') }),
        });
        const result = await res.json();
        const subtasks: string[] = result.result || [];
        
        if (subtasks.length > 0) {
          const currentNode = getNode(nodeId);
          if (currentNode) {
            const newNodes = subtasks.map((st, i) => {
              const newId = uuidv4();
              return {
                id: newId,
                type: 'taskNodeType',
                position: { 
                  x: currentNode.position.x + 350, 
                  y: currentNode.position.y + (i * 120) - ((subtasks.length - 1) * 60)
                },
                data: {
                  task: {
                    id: newId,
                    title: st,
                    description: '',
                    matrix: 'DO',
                    deadline: null
                  }
                }
              };
            });
            const newEdges = newNodes.map(nn => ({
              id: `edge-${nodeId}-${nn.id}`,
              source: nodeId,
              target: nn.id,
              type: 'smoothstep',
              style: { stroke: config.accentColor, strokeWidth: 2, strokeDasharray: '5,5' }
            }));
            
            setNodes((nds) => [...nds, ...newNodes]);
            setEdges((eds) => [...eds, ...newEdges]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsGenerating(false);
      }
    };

    const extraFields = config.fields || [];

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}>
        <div className="flex flex-col w-72 rounded-xl shadow-sm bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-gray-400 border border-gray-200 border-white -ml-2 z-10" />
          {/* Header */}
          <div className="rounded-t-xl px-4 py-3 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <div className="flex items-center space-x-2 justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-xl">{config.icon}</span>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest opacity-70">{config.label}</p>
                  <input
                    className="font-bold text-sm bg-transparent focus:outline-none placeholder-white/50 w-full"
                    placeholder={`${config.label} title...`}
                    value={task.title || ''}
                    onChange={(e) => updateTask({ title: e.target.value })}
                  />
                </div>
              </div>
              <button 
                onClick={handleGenerateSubtasks} 
                disabled={isGenerating || !task.title}
                className="hover:bg-white/20 px-3 py-2 rounded transition-colors disabled:opacity-50 shrink-0" 
                title="Generate Subtasks"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="p-3 space-y-2.5">
            <textarea
              className="w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none resize-none min-h-[60px]"
              placeholder="Description..."
              value={task.description || ''}
              onChange={(e) => updateTask({ description: e.target.value })}
            />
            <div className="flex items-center space-x-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <input type="date" className="flex-1 bg-transparent focus:outline-none text-gray-600"
                value={task.deadline?.split('T')[0] || ''}
                onChange={(e) => updateTask({ deadline: e.target.value || null })} />
            </div>
            {extraFields.map((field) => (
              <div key={field.key} className="space-y-0.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">{field.label}</label>
                {field.type === 'select' ? (
                  <select className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-700">
                    {field.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus:outline-none resize-none min-h-[40px] text-gray-700" />
                ) : (
                  <input type={field.type} className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none text-gray-700" />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar strip */}
          <div className="h-1 rounded-b-xl opacity-30" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
          <Handle type="source" position={Position.Right} className="w-4 h-4 border border-gray-200 border-white -mr-2 z-10" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }} />
        </div>
      </NodeWrapper>
    );
  };
  PrimaryComponent.displayName = `PrimaryNode_${config.label.replace(/\s/g, '')}`;
  return PrimaryComponent;
}
