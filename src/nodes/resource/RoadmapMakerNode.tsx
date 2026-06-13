import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Route, Map, Loader2, Sparkles, CheckSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import NodeWrapper from '../shared/NodeWrapper';
import { TaskData } from '../../types';

export default function RoadmapMakerNode({ data, selected }: { data: any; selected?: boolean }) {
  const { setNodes, setEdges, getNode, getEdges } = useReactFlow();
  const nodeId = useNodeId();
  const task = data?.task as TaskData | undefined;
  
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateTask = (updates: Partial<TaskData>) => {
    if (!nodeId) return;
    setNodes((nds) => nds.map((n) =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, task: { ...(n.data.task as TaskData), ...updates } } }
        : n
    ));
  };

  const handleFetchFromInput = () => {
    if (!nodeId) return;
    const incomingEdges = getEdges().filter(e => e.target === nodeId);
    if (incomingEdges.length === 0) {
      setError('No input node connected.');
      return;
    }
    const sourceNode = getNode(incomingEdges[0].source);
    if (!sourceNode) return;
    
    const sourceTask = sourceNode.data?.task as TaskData | undefined;
    if (sourceTask) {
      const text = `${sourceTask.title || ''}\n${sourceTask.description || ''}`.trim();
      if (text) {
        setPrompt(text);
        setError('');
      } else {
        setError('Input node has no content.');
      }
    } else {
      setError('Could not extract text from input node.');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !nodeId) return;
    
    setLoading(true);
    setError('');
    
    try {
      const gkey = localStorage.getItem('gemini_api_key') || '';
      const res = await fetch('/api/ai-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': gkey
        },
        body: JSON.stringify({ action: 'subtasks', text: `Create a step-by-step roadmap for: ${prompt.trim()}` })
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to generate roadmap');
      }

      const steps: string[] = responseData.result || [];
      if (steps.length === 0) throw new Error('No steps generated');

      updateTask({ title: prompt, description: steps.join('\n') });

      const currentNode = getNode(nodeId);
      if (currentNode) {
        let prevId = nodeId;
        const newNodes = steps.map((step, i) => {
          const newId = uuidv4();
          const n = {
            id: newId,
            type: 'taskNodeType',
            position: { 
              x: currentNode.position.x + 350 + (i * 200), // lay them out horizontally
              y: currentNode.position.y
            },
            data: {
              task: {
                id: newId,
                title: step,
                description: '',
                matrix: 'DO',
                deadline: null
              }
            }
          };
          const e = {
            id: `edge-${prevId}-${newId}`,
            source: prevId,
            target: newId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 2 }
          };
          prevId = newId;
          return { node: n, edge: e };
        });
        
        setNodes(nds => [...nds, ...newNodes.map(x => x.node)]);
        setEdges(eds => [...eds, ...newNodes.map(x => x.edge)]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NodeWrapper data={data} selected={selected}>
      <div className="flex flex-col bg-[#1e2030] rounded-xl shadow-xl border border-[#2a2d3d]" style={{ minWidth: 280, maxWidth: 350 }}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#8b5cf6] border-2 border-[#1e2030] -ml-1.5 z-10" />
        
        <div className="bg-[#151622] px-4 py-3 flex items-center gap-3 border-b border-[#2a2d3d] rounded-t-xl">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg shrink-0">
            <Route size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{task?.title || 'AI Roadmap Maker'}</h3>
            <p className="text-xs text-gray-400 font-medium">Generate steps & connect nodes</p>
          </div>
        </div>

        <div className="p-4 space-y-4 nodrag cursor-default">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Goal / Topic</label>
              <button 
                onClick={handleFetchFromInput}
                className="text-[10px] text-[#8b5cf6] hover:text-[#7c3aed] transition-colors bg-[#8b5cf6]/10 px-2 py-1 rounded"
              >
                Fetch from Input
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Learn React Native (or fetch from input)"
              rows={3}
              className="w-full bg-[#151622] text-sm text-white px-3 py-2 rounded-lg border border-[#2a2d3d] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:animate-pulse" />}
            {loading ? 'Building Roadmap...' : 'Generate Roadmap'}
          </button>
          
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {task?.description && (
            <div className="mt-4 pt-4 border-t border-[#2a2d3d]">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Roadmap Steps</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {task.description.split('\n').filter(Boolean).map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-[#151622] p-2 rounded border border-[#2a2d3d]">
                    <CheckSquare size={14} className="mt-0.5 text-purple-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#8b5cf6] border-2 border-[#1e2030] -mr-1.5 z-10" />
      </div>
    </NodeWrapper>
  );
}
