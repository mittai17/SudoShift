import React, { useState } from 'react';
import { Handle, Position, useReactFlow, useNodeId } from '@xyflow/react';
import { Youtube, FileText, Loader2, Sparkles } from 'lucide-react';
import NodeWrapper from '../shared/NodeWrapper';
import { TaskData } from '../../types';

export default function YoutubeTranscribeNode({ data, selected }: { data: any; selected?: boolean }) {
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();
  const task = data?.task as TaskData | undefined;
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');

  const handleTranscribe = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/youtube-transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim() })
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
    
    // For 'ask', we need a question text which we'll manage with state
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
    <NodeWrapper data={data} selected={selected}>
      <div className="flex flex-col bg-[#1e2030] rounded-xl shadow-xl border border-[#2a2d3d]" style={{ minWidth: 280, maxWidth: 350 }}>
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#06b6d4] border-2 border-[#1e2030] -ml-1.5 z-10" />
        
        <div className="bg-[#151622] px-4 py-3 flex items-center gap-3 border-b border-[#2a2d3d] rounded-t-xl">
          <div className="p-2 bg-red-500/20 text-red-400 rounded-lg shrink-0">
            <Youtube size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{task?.title || 'YouTube Transcriber'}</h3>
            <p className="text-xs text-gray-400 font-medium">Extract text from videos</p>
          </div>
        </div>

        <div className="p-4 space-y-4 nodrag cursor-default">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Video URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[#151622] text-sm text-white px-3 py-2 rounded-lg border border-[#2a2d3d] focus:outline-none focus:border-[#06b6d4] transition-colors"
            />
          </div>

          <button
            onClick={handleTranscribe}
            disabled={loading || !url.trim()}
            className="w-full py-2 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loading ? 'Transcribing...' : 'Fetch Transcript'}
          </button>
          
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="mt-4 pt-4 border-t border-[#2a2d3d]">
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transcript Preview</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleAiAction('summarize')} 
                    disabled={aiLoading || !task?.description}
                    className="text-xs flex items-center gap-1.5 text-[#06b6d4] hover:text-[#0891b2] hover:bg-[#06b6d4]/20 disabled:opacity-50 transition-all bg-[#06b6d4]/10 rounded-md px-2.5 py-1.5 font-medium"
                  >
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Summarize
                  </button>
                  <button 
                    onClick={() => handleAiAction('extract_action_items')} 
                    disabled={aiLoading || !task?.description}
                    className="text-xs flex items-center gap-1.5 text-[#06b6d4] hover:text-[#0891b2] hover:bg-[#06b6d4]/20 disabled:opacity-50 transition-all bg-[#06b6d4]/10 rounded-md px-2.5 py-1.5 font-medium"
                  >
                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Actions
                  </button>
                </div>
              </div>
              <div className="flex bg-[#151622] rounded-md border border-[#2a2d3d] focus-within:border-[#06b6d4] transition-colors p-1 gap-1">
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
                  className="text-xs shrink-0 flex items-center justify-center gap-1.5 text-white bg-[#06b6d4] hover:bg-[#0891b2] disabled:opacity-50 transition-colors rounded px-3 py-1 font-semibold shadow-sm"
                >
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : 'Ask'}
                </button>
              </div>
            </div>
            <div className="bg-[#151622] p-3 rounded-lg border border-[#2a2d3d] text-xs text-gray-400 max-h-40 overflow-y-auto w-[318px] whitespace-pre-wrap">
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

        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#06b6d4] border-2 border-[#1e2030] -mr-1.5 z-10" />
      </div>
    </NodeWrapper>
  );
}
