import React, { useState } from 'react';
import { Youtube, Search, Download, ListVideo, BarChart3, TrendingUp, BookOpen, Sparkles, Database, PlaySquare } from 'lucide-react';
import { createResourceNode } from '../shared/BaseResourceNode';

const YoutubeApiBody = ({ task, updateTask }: any) => {
  const [isFetching, setIsFetching] = useState(false);
  const actionType = task.actionType || 'Playlist Import';
  const query = task.query || '';
  
  const handleFetch = () => {
    if (!query) return;
    setIsFetching(true);
    setTimeout(() => setIsFetching(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* API Badge */}
      <div className="flex justify-between items-center bg-[#1a1b23] border border-[#2a2b36] rounded-lg p-2 text-[10px] font-bold uppercase tracking-wider text-red-500">
         <span className="flex items-center"><Youtube className="w-3.5 h-3.5 mr-1" /> YouTube Data API v3</span>
         <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">PRO</span>
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
               type="text" placeholder={actionType === 'Channel Analysis' ? "Channel ID or URL..." : actionType === 'Playlist Import' ? "Playlist URL..." : "Search query..."}
               className="w-full text-xs bg-transparent focus:outline-none text-gray-300"
               value={query} onChange={(e) => updateTask({ query: e.target.value })} 
            />
         </div>
         <button 
            onClick={handleFetch} disabled={isFetching || !query}
            className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 transition-colors font-bold disabled:opacity-50 text-xs shadow-lg shadow-red-500/20"
         >
            {isFetching ? <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Fetching API Data...</> : <><Database className="w-4 h-4 mr-2" /> Fetch {actionType}</>}
         </button>
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

      {/* AI Tools */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
         <button className="flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <ListVideo className="w-3 h-3 mr-1" /> AI Playlist Summary
         </button>
         <button className="flex items-center justify-center bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg py-1.5 transition-colors font-medium">
            <Sparkles className="w-3 h-3 mr-1" /> Learning Recommendations
         </button>
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
