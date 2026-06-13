import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Youtube, FileText, Loader2, Sparkles, Key } from 'lucide-react';
import NodeWrapper from '../shared/NodeWrapper';
import { TaskData } from '../../types';

export default function YoutubeApiNode({ data, selected }: { data: any; selected?: boolean }) {
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();
  const task = data?.task as TaskData | undefined;
  
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('sk_1vUggXEvQJLuwALILNnedwVSW-6qsrIvYNcy3uqwyoE');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');

  const handleTranscribe = async () => {
    if (!url.trim() || !apiKey.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/transcriptapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim(), apiKey: apiKey.trim() })
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to fetch transcript');
      }
      
      if (!nodeId) return;
      
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                task: {
                  ...(n.data.task as TaskData),
                  description: responseData.transcript
                }
              }
            }
          : n
      ));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to transcribe');
    } finally {
      setLoading(false);
    }
  };

  const handleAiAction = async (actionType: 'summarize' | 'extract_action_items' | 'ask') => {
    if (!task?.description) return;
    const questionText = actionType === 'ask' ? aiQuestion : '';
    if (actionType === 'ask' && !questionText.trim()) {
      setError('Please enter a question.');
      return;
    }
    
    setAiLoading(true);
    setError('');
    
    try {
      const gkey = localStorage.getItem('gemini_api_key') || '';
      const body = actionType === 'ask' 
        ? { action: 'ask', text: questionText, context: task.description }
        : { action: actionType, text: task.description };
        
      const res = await fetch('/api/ai-action', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': gkey 
        },
        body: JSON.stringify(body)
      });
      
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Failed to process AI action');
      
      if (!nodeId) return;
      
      const prefix = actionType === 'ask' ? `Q: ${questionText}\n\nA: ` : '';
      const newText = actionType === 'ask' 
        ? prefix + responseData.result + '\n\n---\n\n' + task.description
        : responseData.result;
        
      setNodes((nds) => nds.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                task: {
                  ...(n.data.task as TaskData),
                  description: newText
                }
              }
            }
          : n
      ));
      if (actionType === 'ask') setAiQuestion('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed processing AI request');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <NodeWrapper data={data} selected={selected} resizable={true} minWidth={280} minHeight={400}>
      <div className="flex flex-col bg-[#1e2030] rounded-xl shadow-xl w-full h-full min-w-[280px] min-h-[400px] border border-[#2a2d3d]">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#f43f5e] border-2 border-[#1e2030] -ml-1.5 z-10" />
        
        <div className="bg-[#151622] px-4 py-3 flex items-center gap-3 border-b border-[#2a2d3d] rounded-t-xl shrink-0">
          <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
            <Youtube size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{task?.title || 'TranscriptAPI.com'}</h3>
            <p className="text-xs text-gray-400 font-medium">Extract using Custom API Key</p>
          </div>
        </div>

        <div className="p-4 space-y-3 nodrag flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="space-y-1 shrink-0">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Video URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[#151622] text-sm text-white px-3 py-2 rounded-lg border border-[#2a2d3d] focus:outline-none focus:border-[#f43f5e] transition-colors"
            />
          </div>
          
          <div className="space-y-1 shrink-0">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">API Key (TranscriptAPI)</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                <Key size={14} />
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_..."
                className="w-full bg-[#151622] text-sm text-white pl-8 pr-3 py-2 rounded-lg border border-[#2a2d3d] focus:outline-none focus:border-[#f43f5e] transition-colors"
              />
            </div>
          </div>

          <button
            onClick={handleTranscribe}
            disabled={loading || !url.trim() || !apiKey.trim()}
            className="w-full shrink-0 py-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loading ? 'Transcribing...' : 'Fetch via API'}
          </button>
          
          {error && (
            <p className="text-xs text-red-400 shrink-0">{error}</p>
          )}

          <div className="mt-4 pt-4 border-t border-[#2a2d3d] flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex flex-col gap-2 mb-2 shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transcript Preview</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleAiAction('summarize')} 
                    disabled={aiLoading || !task?.description}
                    className="text-xs flex items-center gap-1.5 text-[#f43f5e] hover:text-[#e11d48] hover:bg-[#f43f5e]/20 disabled:opacity-50 transition-all bg-[#f43f5e]/10 rounded-md px-2.5 py-1.5 font-medium"
                  >
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Summarize
                  </button>
                  <button 
                    onClick={() => handleAiAction('extract_action_items')} 
                    disabled={aiLoading || !task?.description}
                    className="text-xs flex items-center gap-1.5 text-[#f43f5e] hover:text-[#e11d48] hover:bg-[#f43f5e]/20 disabled:opacity-50 transition-all bg-[#f43f5e]/10 rounded-md px-2.5 py-1.5 font-medium"
                  >
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Actions
                  </button>
                </div>
              </div>
              <div className="flex bg-[#151622] rounded-md border border-[#2a2d3d] focus-within:border-[#f43f5e] transition-colors p-1 gap-1">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ask AI about transcript..."
                  className="flex-1 bg-transparent text-xs text-white px-2 py-1 outline-none min-w-[100px]"
                />
                <button 
                  onClick={() => handleAiAction('ask')} 
                  disabled={aiLoading || !aiQuestion.trim() || !task?.description}
                  className="text-xs shrink-0 flex items-center justify-center gap-1.5 text-white bg-[#f43f5e] hover:bg-[#e11d48] disabled:opacity-50 transition-colors rounded px-3 py-1 font-semibold shadow-sm"
                >
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : 'Ask'}
                </button>
              </div>
            </div>
            <div className="bg-[#151622] p-3 rounded-lg border border-[#2a2d3d] text-xs text-gray-400 overflow-y-auto w-full flex-1 min-h-0 whitespace-pre-wrap">
              {task?.description ? (
                <>
                  <span className="text-gray-300">{task.description.slice(0, 500)}</span>
                  {task.description.length > 500 ? '...' : ''}
                </>
              ) : (
                'No transcript available. Fetch a transcript to use AI features.'
              )}
            </div>
          </div>
        </div>

        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#f43f5e] border-2 border-[#1e2030] -mr-1.5 z-10" />
      </div>
    </NodeWrapper>
  );
}
