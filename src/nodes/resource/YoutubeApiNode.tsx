import React, { useState } from 'react';
import { Youtube, Search, Download, ListVideo, BarChart3, TrendingUp, BookOpen, Database, PlaySquare, AlertCircle, Loader2, FileText, Key } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const YoutubeApiBody = ({ task, updateTask }: any) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const actionType = task.actionType || 'Playlist Import';
  const query = task.query || '';
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('transcriptapi_key') || '');

  const handleFetch = async () => {
    if (!query) return;
    setError('');
    setResult('');
    setIsFetching(true);

    try {
      const res = await fetch('/api/transcriptapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: query, apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'API request failed');
      }

      setResult(data.transcript || JSON.stringify(data));
      updateTask({ transcript: data.transcript || '' });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch YouTube data');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* API Key Input */}
      <div className="flex items-center gap-2 bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-red-500 transition-colors">
        <Key className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <input
          type="password"
          placeholder="TranscriptAPI Key..."
          className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            localStorage.setItem('transcriptapi_key', e.target.value);
          }}
        />
      </div>

      {/* Action Selector */}
      <div className="grid grid-cols-2 gap-2 text-xs">
         <button 
            onClick={() => updateTask({ actionType: 'Playlist Import' })}
            className={`flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'Playlist Import' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            <ListVideo className="w-3.5 h-3.5 mr-1.5" /> Playlist
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'Channel Analysis' })}
            className={`flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'Channel Analysis' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Channel
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'Trending/Search' })}
            className={`flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'Trending/Search' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Trending
         </button>
         <button 
            onClick={() => updateTask({ actionType: 'Learning Builder' })}
            className={`flex items-center justify-center py-1.5 rounded-lg border transition-colors ${actionType === 'Learning Builder' ? 'bg-[#2a2b36] text-white border-[#3f3f46]' : 'bg-[#13141c] text-gray-400 border-transparent hover:bg-[#1a1b23]'}`}
         >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Builder
         </button>
      </div>

      {/* Input & Execute */}
      <div className="flex flex-col gap-2">
         <div className="flex items-center bg-[#13141c] border border-[#2a2b36] rounded-lg p-2 focus-within:border-red-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
            <input 
               type="text" placeholder="YouTube video URL..."
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={query} onChange={(e) => updateTask({ query: e.target.value })} 
            />
         </div>
         <button 
            onClick={handleFetch} disabled={isFetching || !query}
            className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-colors font-bold disabled:opacity-50 text-xs shadow-lg shadow-red-500/20"
         >
            {isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching API Data...</> : <><Database className="w-4 h-4 mr-2" /> Fetch {actionType}</>}
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
                a.download = 'youtube-data.txt';
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
          placeholder={isFetching ? 'Fetching data...' : 'Extracted data will appear here...'}
          value={result}
          readOnly
        />
      </div>

      {/* Output Configuration */}
      <div className="bg-[#2a2b36]/20 border border-[#2a2b36] rounded-xl p-2.5">
         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-2">
            <Download className="w-3 h-3 mr-1" /> Data Extraction
         </div>
         <div className="grid grid-cols-2 gap-y-2 text-[10px] text-gray-300">
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-red-500" defaultChecked /> Metadata
            </label>
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-red-500" defaultChecked /> Transcripts
            </label>
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-red-500" /> Channel Stats
            </label>
            <label className="flex items-center hover:text-white cursor-pointer">
               <input type="checkbox" className="mr-1.5 accent-red-500" /> Bulk Import Nodes
            </label>
         </div>
      </div>
    </div>
  );
};

export default createResourceNode({
  label: 'YouTube API (Pro)',
  accentColor: '#ef4444', // Kept red to distinguish it as YouTube specific
  icon: <PlaySquare className="w-4 h-4 text-white" />,
  width: 'w-[360px]'
}, YoutubeApiBody);
