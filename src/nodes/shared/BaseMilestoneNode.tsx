import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId, NodeResizer } from '@xyflow/react';
import { Loader2, Plus, Clock, Edit3 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import NodeWrapper from './NodeWrapper';
import { TaskData } from '../../types';

export interface MilestoneNodeConfig {
  label: string;
  accentColor: string;
  icon: React.ReactNode;
  width?: string;
}

export function createMilestoneNode(config: MilestoneNodeConfig, BodyComponent: React.FC<{ task: TaskData, updateTask: (u: Partial<TaskData>) => void }>) {
  const MilestoneComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
    const { task } = data;
    const { setNodes, setEdges, getNode } = useReactFlow();
    const nodeId = useNodeId();
    const [isGenerating, setIsGenerating] = useState(false);

    const updateTask = (updates: Partial<TaskData>) => {
      if (!nodeId) return;
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates, lastUpdated: new Date().toISOString() } } } : n
      ));
    };

    const handleGenerateSubtasks = async () => {
      if (!task.title || isGenerating || !nodeId) return;
      setIsGenerating(true);
      try {
        const gkey = localStorage.getItem('gemini_api_key') || '';
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-gemini-key': gkey },
          body: JSON.stringify({ action: 'subtasks', text: task.title + (task.description ? ' - ' + task.description : '') }),
        });
        if (!res.ok) throw new Error('Request failed');
        const result = await res.json();
        const subtasks: string[] = result.result || [];
        
        if (subtasks.length > 0) {
          const currentNode = getNode(nodeId);
          if (currentNode) {
            const newNodes = subtasks.map((st, i) => {
              const newId = uuidv4();
              return {
                id: newId,
                type: 'milestoneEvidenceNode',
                position: { 
                  x: currentNode.position.x + 350, 
                  y: currentNode.position.y + (i * 120) - ((subtasks.length - 1) * 60)
                },
                data: {
                  task: { id: newId, title: st, description: '', matrix: 'MILESTONE_EVIDENCE', deadline: null }
                }
              };
            });
            const newEdges = newNodes.map(nn => ({
              id: `edge-${nodeId}-${nn.id}`,
              source: nodeId,
              target: nn.id,
              type: 'labeled-edge',
              data: { label: 'Depends On' }
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

    const handleQuickAdd = () => {
      const currentNode = getNode(nodeId!);
      if (!currentNode) return;
      const newId = uuidv4();
      const newNode = {
        id: newId,
        type: 'milestoneEvidenceNode',
        position: { x: currentNode.position.x + 350, y: currentNode.position.y },
        data: { task: { id: newId, title: 'New Evidence', description: '', matrix: 'MILESTONE_EVIDENCE', deadline: null } }
      };
      const newEdge = { id: `edge-${nodeId}-${newId}`, source: nodeId!, target: newId, type: 'labeled-edge', data: { label: 'Verifies' } };
      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);
    };

    const createdDate = task.createdDate || new Date().toISOString();

    return (
      <NodeWrapper data={data} selected={selected} defaultColor={config.accentColor}>
        <NodeResizer isVisible={!!task.isResizable} minWidth={250} minHeight={150} />
        <div className={`flex flex-col ${config.width || 'w-80'} rounded-2xl shadow-xl bg-[#1a1b23] border ${selected ? 'border-rose-500 shadow-rose-500/20' : 'border-[#2a2b36] hover:border-gray-600'} transition-all group overflow-hidden`} style={{ width: task.width, height: task.height }}>
          
          <Handle type="target" position={Position.Left} className="w-4 h-4 bg-[#2a2b36] border-2 border-[#1a1b23] hover:w-6 hover:h-6 hover:bg-rose-500 transition-all -ml-2 z-10 flex items-center justify-center">
             <Plus className="w-3 h-3 text-white opacity-0 hover:opacity-100" />
          </Handle>

          <div className="px-4 py-3 text-white" style={{ backgroundColor: `var(--node-color, ${config.accentColor})` }}>
            <div className="flex items-center space-x-3 justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-1.5 bg-black/20 rounded-lg backdrop-blur-sm shadow-inner">{config.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/80">{config.label}</p>
                  <input
                    className="font-bold text-base bg-transparent focus:outline-none placeholder-white/50 w-full"
                    placeholder={`${config.label} title...`}
                    value={task.title || ''}
                    onChange={(e) => updateTask({ title: e.target.value })}
                  />
                </div>
              </div>
              <button onClick={handleGenerateSubtasks} disabled={isGenerating || !task.title} className="hover:bg-white/20 px-3 py-2 rounded-xl transition-colors disabled:opacity-50 shrink-0 shadow-sm" title="Generate Subtasks">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <textarea
              className="w-full text-sm text-gray-300 bg-[#13141c] border border-[#2a2b36] rounded-xl p-3 focus:outline-none focus:border-rose-500 resize-none min-h-[80px] placeholder-gray-600 transition-colors"
              placeholder="Description..."
              value={task.description || ''}
              onChange={(e) => updateTask({ description: e.target.value })}
            />
            <BodyComponent task={task} updateTask={updateTask} />
          </div>

          <div className="px-4 py-2 bg-[#13141c] border-t border-[#2a2b36] flex items-center justify-between text-[10px] text-gray-500">
             <div className="flex items-center space-x-1">
               <Clock className="w-3 h-3" />
               <span>Created: {new Date(createdDate).toLocaleDateString()}</span>
             </div>
             {task.lastUpdated && (
               <div className="flex items-center space-x-1">
                 <Edit3 className="w-3 h-3" />
                 <span>Updated: {new Date(task.lastUpdated).toLocaleDateString()}</span>
               </div>
             )}
          </div>

          <Handle type="source" position={Position.Right} className="w-4 h-4 bg-[#2a2b36] border-2 border-[#1a1b23] hover:w-6 hover:h-6 hover:bg-rose-500 transition-all -mr-2 z-10 flex items-center justify-center">
             <button onClick={(e) => { e.stopPropagation(); handleQuickAdd(); }} className="w-full h-full flex items-center justify-center pointer-events-auto">
               <Plus className="w-3 h-3 text-white opacity-0 hover:opacity-100" />
             </button>
          </Handle>
        </div>
      </NodeWrapper>
    );
  };
  MilestoneComponent.displayName = `MilestoneNode_${config.label.replace(/\s/g, '')}`;
  return MilestoneComponent;
}
