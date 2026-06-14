import { SiObsidian } from 'react-icons/si';
import React, { useState } from 'react';
import { File, Terminal, Search, FileText, BookMarked, Key, Database, AlertCircle, FileText, Download, Loader2 } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const ObsidianNodeBody = ({ task, updateTask }: any) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('obsidian_token') || '');
  
  const [port, set_port] = useState(() => localStorage.getItem('obsidian_port') || '');
  
  const actionType = task.actionType || 'read';
  const portTask = task.port || '';
  const path = task.path || '';
  const query = task.query || '';
  const content = task.content || '';

  const handleFetch = async () => {
    setError('');
    setResult('');
    setIsFetching(true);

    try {
      const res = await fetch('/api/integrations/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, apiKey, token: apiKey, port, path, query, content }),
      });
      const data = await res.json();

      if (!res?.ok && !data?.success && data?.error) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      updateTask({ lastResult: data });
    } catch (err: any) {
      setError(err.message || 'Failed to perform action');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Auth Input */}
      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
        <Key className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          type="password"
          placeholder="REST API Plugin Token..."
          className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem('obsidian_token', e.target.value);
          }}
        />
      </div>

      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
        <Terminal className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          type="text"
          placeholder="Port (default 27123)..."
          className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
          value={port}
          onChange={(e) => {
            set_port(e.target.value);
            localStorage.setItem('obsidian_port', e.target.value);
          }}
        />
      </div>

      {/* Action Selector */}
      <div className="flex flex-wrap gap-2 text-xs">
         <button 
            onClick={() => updateTask({ actionType: 'read' })}
            className={`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'read' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            read
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'write' })}
            className={`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'write' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            write
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'list' })}
            className={`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'list' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            list
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'search' })}
            className={`flex-1 min-w-[80px] flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'search' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            search
         </button>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <File className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="Vault path (e.g. Folder/Note.md)..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={path} onChange={(e) => updateTask({ path: e.target.value })} 
            />
         </div>
         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="Search query..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={query} onChange={(e) => updateTask({ query: e.target.value })} 
            />
         </div>
         <div className="flex items-start bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-cyan-500 transition-colors">
            <FileText className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0 mt-1" />
            <textarea 
               placeholder="Note Content..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300 min-h-[60px] resize-y"
               value={content} onChange={(e) => updateTask({ content: e.target.value })} 
            />
         </div>
         <button 
            onClick={handleFetch} disabled={isFetching}
            className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg py-2 transition-colors font-bold disabled:opacity-50 text-xs shadow-lg shadow-cyan-900/20"
            style={{ backgroundColor: '#7C3AED' }}
         >
            {isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Database className="w-4 h-4 mr-2" /> Execute {actionType}</>}
         </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          <span className="text-[10px] text-red-300">{error}</span>
        </div>
      )}

      {/* Result Area */}
      <div className="bg-[#13141c] border border-[#2a2b36] rounded-lg overflow-hidden">
        <div className="bg-[#1a1b23] text-[10px] text-gray-400 uppercase tracking-wider font-bold px-3 py-1.5 border-b border-[#2a2b36] flex items-center justify-between">
          <div className="flex items-center"><FileText className="w-3 h-3 mr-1" /> Output</div>
          {result && (
            <button
              onClick={() => {
                const blob = new Blob([result], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'ObsidianNode-result.json';
                a.click();
              }}
              className="hover:text-white" title="Export"
            >
              <Download className="w-3 h-3" />
            </button>
          )}
        </div>
        <textarea
          className="w-full text-[10px] text-gray-300 font-mono bg-transparent border-none p-3 focus:outline-none resize-none min-h-[80px] custom-scrollbar"
          placeholder={isFetching ? 'Processing...' : 'Result will appear here...'}
          value={result}
          readOnly
        />
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'ObsidianNode',
  accentColor: '#7C3AED',
  icon: <SiObsidian className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, ObsidianNodeBody);
